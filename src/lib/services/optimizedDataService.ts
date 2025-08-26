/**
 * SERVIÇO OTIMIZADO PARA CARREGAMENTO DE DADOS DE DIAGNÓSTICO
 * 
 * Estratégia de performance:
 * 1. Carregamento mínimo inicial (só dados essenciais)
 * 2. Cache inteligente com invalidação seletiva
 * 3. Lazy loading para elementos não críticos
 * 4. Batch loading para múltiplas requisições
 */

import { supabaseBrowserClient } from '../../utils/supabase/client';

// Cache global para dados de diagnóstico
const CACHE = {
  diagnosticos: null as any[] | null,
  controles: new Map<number, any[]>(), // diagnosticoId -> controles[]
  essentialData: new Map<number, any>(), // programaId -> dados essenciais
  medidas: new Map<number, any[]>(), // controleId -> medidas[]
  programaMedidas: new Map<string, any>(), // key -> programaMedida
  maturityCache: new Map<string, any>(), // chave -> resultado maturidade
  timestamps: new Map<string, number>(), // chave -> timestamp
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Verificar se cache está válido
const isCacheValid = (key: string): boolean => {
  const timestamp = CACHE.timestamps.get(key);
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
};

// Invalidar cache específico
export const invalidateCache = (type: string, id?: number) => {
  switch (type) {
    case 'all':
      CACHE.controles.clear();
      CACHE.essentialData.clear();
      CACHE.medidas.clear();
      CACHE.programaMedidas.clear();
      CACHE.maturityCache.clear();
      CACHE.timestamps.clear();
      break;
    case 'programa':
      if (id) {
        CACHE.essentialData.delete(id);
        CACHE.maturityCache.clear(); // Maturidade depende dos dados do programa
        CACHE.timestamps.delete(`essential-${id}`);
      }
      break;
    case 'controle':
      if (id) {
        CACHE.medidas.delete(id);
        // Invalidar programaMedidas relacionadas
        Array.from(CACHE.programaMedidas.keys())
          .filter(key => key.includes(`-${id}-`))
          .forEach(key => CACHE.programaMedidas.delete(key));
        CACHE.maturityCache.clear();
        CACHE.timestamps.delete(`medidas-${id}`);
      }
      break;
  }
};

/**
 * CARREGAMENTO ESSENCIAL - Apenas dados mínimos para dashboard e navegação
 * Carrega: diagnósticos, controles com INCC, respostas das medidas
 */
export const loadEssentialData = async (programaId: number) => {

  const cacheKey = `essential-${programaId}`;
  
  // Verificar cache
  if (isCacheValid(cacheKey) && CACHE.essentialData.has(programaId)) {
    console.log(`⚡ Cache hit: Essential data for programa ${programaId}`);
    return CACHE.essentialData.get(programaId);
  }

  console.log(`🔄 Loading essential data for programa ${programaId}`);
  
  try {
    // 1. Carregar diagnósticos (se não em cache)
    if (!CACHE.diagnosticos) {
      const { data: diagnosticos } = await supabaseBrowserClient
        .from('diagnostico')
        .select('*')
        .order('id');
      CACHE.diagnosticos = diagnosticos || [];
    }

    // 2. Carregar todos os controles com INCC em uma query
    const { data: controlesData } = await supabaseBrowserClient
      .from('programa_controle')
      .select(`
        id,
        programa,
        controle,
        nivel,
        controle_data:controle(
          id,
          numero,
          nome,
          texto,
          diagnostico
        )
      `)
      .eq('programa', programaId);

    // 3. Organizar controles por diagnóstico
    const controlesPorDiagnostico: { [key: number]: any[] } = {};
    controlesData?.forEach(pc => {
      // controle_data pode ser um array ou objeto, vamos garantir que pegamos o primeiro se for array
      const controleData = Array.isArray(pc.controle_data) ? pc.controle_data[0] : pc.controle_data;
      
      if (controleData) {
        const diagnosticoId = controleData.diagnostico;
        if (!controlesPorDiagnostico[diagnosticoId]) {
          controlesPorDiagnostico[diagnosticoId] = [];
        }
        controlesPorDiagnostico[diagnosticoId].push({
          ...controleData,
          nivel: pc.nivel,
          programa_controle_id: pc.id
        });
      }
    });

    // 4. Carregar TODAS as respostas do programa de uma vez
    const { data: allProgramaMedidas } = await supabaseBrowserClient
      .from('programa_medida')
      .select(`
        id,
        programa,
        medida,
        resposta,
        medida_data:medida(
          id,
          id_controle,
          id_medida,
          texto
        )
      `)
      .eq('programa', programaId);

    // 5. Organizar respostas por chave
    const respostasPorChave: { [key: string]: any } = {};
    const medidasPorControle: { [key: number]: any[] } = {};
    
    allProgramaMedidas?.forEach(pm => {
      // medida_data pode ser um array ou objeto, vamos garantir que pegamos o primeiro se for array
      const medidaData = Array.isArray(pm.medida_data) ? pm.medida_data[0] : pm.medida_data;
      
      if (medidaData) {
        const controleId = medidaData.id_controle;
        const key = `${pm.medida}-${controleId}-${programaId}`;
        
        respostasPorChave[key] = pm;
        
        // Organizar medidas por controle para navegação
        if (!medidasPorControle[controleId]) {
          medidasPorControle[controleId] = [];
        }
        medidasPorControle[controleId].push({
          id: medidaData.id,
          id_medida: medidaData.id_medida,
          texto: medidaData.texto,
          resposta: pm.resposta
        });
      }
    });

    const essentialData = {
      diagnosticos: CACHE.diagnosticos,
      controlesPorDiagnostico,
      respostasPorChave,
      medidasPorControle,
      loadedAt: Date.now()
    };

    // Salvar no cache
    CACHE.essentialData.set(programaId, essentialData);
    CACHE.timestamps.set(cacheKey, Date.now());
    
    console.log(`✅ Essential data loaded for programa ${programaId}:`, {
      diagnosticos: CACHE.diagnosticos?.length,
      controles: Object.keys(controlesPorDiagnostico).length,
      respostas: Object.keys(respostasPorChave).length
    });

    return essentialData;
    
  } catch (error) {
    console.error('❌ Error loading essential data:', error);
    throw error;
  }
};

/**
 * CARREGAMENTO LAZY DE MEDIDAS DETALHADAS
 * Só carrega quando o usuário navega para um controle específico
 */
export const loadMedidasDetalhadas = async (controleId: number, programaId: number) => {

  const cacheKey = `medidas-${controleId}`;
  
  // Verificar cache
  if (isCacheValid(cacheKey) && CACHE.medidas.has(controleId)) {
    console.log(`⚡ Cache hit: Detailed medidas for controle ${controleId}`);
    return CACHE.medidas.get(controleId);
  }

  console.log(`🔄 Loading detailed medidas for controle ${controleId}`);

  try {
    const { data: medidas } = await supabaseBrowserClient
      .from('medida')
      .select(`
        id,
        id_medida,
        texto,
        id_controle,
        programa_medida:programa_medida!medida(
          id,
          programa,
          resposta,
          justificativa,
          observacao_orgao,
          responsavel,
          previsao_inicio,
          previsao_fim,
          nova_resposta,
          encaminhamento_interno,
          status_medida,
          status_plano_acao
        )
      `)
      .eq('id_controle', controleId)
      .eq('programa_medida.programa', programaId)
      .order('id_medida');

    // Salvar no cache
    CACHE.medidas.set(controleId, medidas || []);
    CACHE.timestamps.set(cacheKey, Date.now());

    console.log(`✅ Detailed medidas loaded for controle ${controleId}: ${medidas?.length} items`);
    return medidas || [];
    
  } catch (error) {
    console.error(`❌ Error loading detailed medidas for controle ${controleId}:`, error);
    throw error;
  }
};

/**
 * CÁLCULO DE MATURIDADE COM CACHE
 */
export const calculateMaturityCached = (
  type: 'controle' | 'diagnostico',
  id: number,
  programaId: number,
  data?: any
) => {
  const cacheKey = `maturity-${type}-${id}-${programaId}`;
  
  // Verificar cache
  if (isCacheValid(cacheKey) && CACHE.maturityCache.has(cacheKey)) {
    return CACHE.maturityCache.get(cacheKey);
  }

  // Calcular maturidade (implementar lógica específica)
  let result;
  if (type === 'controle') {
    result = calculateControleMaturidade(id, programaId, data);
  } else {
    result = calculateDiagnosticoMaturidade(id, programaId, data);
  }

  // Salvar no cache
  CACHE.maturityCache.set(cacheKey, result);
  CACHE.timestamps.set(cacheKey, Date.now());

  return result;
};

// Funções auxiliares para cálculo de maturidade
const calculateControleMaturidade = (controleId: number, programaId: number, data?: any) => {
  // Implementar cálculo usando dados essenciais
  return { score: 0, label: 'Inicial', color: '#FF5252' };
};

const calculateDiagnosticoMaturidade = (diagnosticoId: number, programaId: number, data?: any) => {
  // Implementar cálculo usando dados essenciais
  return { score: 0, label: 'Inicial', color: '#FF5252' };
};



/**
 * LIMPEZA PERIÓDICA DO CACHE
 */
export const cleanupCache = () => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  CACHE.timestamps.forEach((timestamp, key) => {
    if (now - timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    CACHE.timestamps.delete(key);
    
    if (key.startsWith('essential-')) {
      const programaId = parseInt(key.replace('essential-', ''));
      CACHE.essentialData.delete(programaId);
    } else if (key.startsWith('medidas-')) {
      const controleId = parseInt(key.replace('medidas-', ''));
      CACHE.medidas.delete(controleId);
    } else if (key.startsWith('maturity-')) {
      CACHE.maturityCache.delete(key);
    }
  });
  
  if (keysToDelete.length > 0) {
    console.log(`🧹 Cleaned ${keysToDelete.length} expired cache entries`);
  }
};

// Configurar limpeza automática do cache
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 2 * 60 * 1000); // A cada 2 minutos
}
