import { useState, useCallback, useRef, useMemo } from 'react';
import { Controle, Diagnostico, ProgramaMedida } from '../types';
import { calculateMaturityIndexForControle } from '../utils/calculations';
import { calculateDiagnosticoMaturity } from '../utils/maturity';

// Interfaces para cache de maturidade
interface MaturityCacheEntry {
  score: number;
  label: string;
  timestamp: number;
  version: number; // Para invalidação quando dados mudam
}

interface ControleMaturityData {
  score: number;
  label: string;
  color: string;
  level: 'inicial' | 'basico' | 'intermediario' | 'aprimoramento' | 'aprimorado';
}

interface DiagnosticoMaturityData {
  score: number;
  label: string;
}

// Cache duration em milissegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

// Cores para os níveis de maturidade
const MATURITY_COLORS = {
  inicial: '#FF5252',      // Vermelho
  basico: '#FF9800',       // Laranja  
  intermediario: '#FFC107', // Amarelo
  aprimoramento: '#4CAF50', // Verde claro
  aprimorado: '#2E7D32'    // Verde escuro
};

// Função para obter cor baseada no score (valores entre 0-1)
const getMaturityColor = (score: number): string => {
  if (score >= 0.9) return MATURITY_COLORS.aprimorado;
  if (score >= 0.7) return MATURITY_COLORS.aprimoramento;
  if (score >= 0.5) return MATURITY_COLORS.intermediario;
  if (score >= 0.3) return MATURITY_COLORS.basico;
  return MATURITY_COLORS.inicial;
};

// Função para obter nível baseado no score
const getMaturityLevel = (score: number): ControleMaturityData['level'] => {
  if (score >= 0.9) return 'aprimorado';
  if (score >= 0.7) return 'aprimoramento';
  if (score >= 0.5) return 'intermediario';
  if (score >= 0.3) return 'basico';
  return 'inicial';
};

// Função para obter label baseado no score
const getMaturityLabel = (score: number): string => {
  if (score >= 0.9) return 'Aprimorado';
  if (score >= 0.7) return 'Em Aprimoramento';
  if (score >= 0.5) return 'Intermediário';
  if (score >= 0.3) return 'Básico';
  return 'Inicial';
};

export const useMaturityCache = (programaId: number) => {
  // Cache de maturidade para controles e diagnósticos
  const controleMaturityCache = useRef<Map<string, MaturityCacheEntry>>(new Map());
  const diagnosticoMaturityCache = useRef<Map<string, MaturityCacheEntry>>(new Map());
  
  // Versões para invalidação de cache
  const dataVersions = useRef<Map<string, number>>(new Map());
  
  // Estados para forçar re-renders
  const [cacheUpdateTrigger, setCacheUpdateTrigger] = useState(0);

  // Função para invalidar cache quando dados mudam
  const invalidateCache = useCallback((type: 'controle' | 'diagnostico', id: number) => {
    const key = `${type}-${id}-${programaId}`;
    
    if (type === 'controle') {
      controleMaturityCache.current.delete(key);
      
      // Invalidar também cache de diagnósticos que contêm este controle
      diagnosticoMaturityCache.current.forEach((_, cacheKey) => {
        if (cacheKey.includes(`programa-${programaId}`)) {
          diagnosticoMaturityCache.current.delete(cacheKey);
        }
      });
    } else {
      diagnosticoMaturityCache.current.delete(key);
    }
    
    // Incrementar versão dos dados
    const versionKey = `${type}-${id}`;
    const currentVersion = dataVersions.current.get(versionKey) || 0;
    dataVersions.current.set(versionKey, currentVersion + 1);
    
    // Forçar re-render
    setCacheUpdateTrigger(prev => prev + 1);
  }, [programaId]);

  // Calcular maturidade de controle com cache
  const getControleMaturity = useCallback((
    controle: Controle,
    medidas: any[],
    programaControle?: any
  ): ControleMaturityData => {
    const cacheKey = `controle-${controle.id}-${programaId}`;
    const now = Date.now();
    
    // Verificar cache primeiro
    const cached = controleMaturityCache.current.get(cacheKey);
    const dataVersion = dataVersions.current.get(`controle-${controle.id}`) || 0;
    
    if (cached && 
        (now - cached.timestamp) < CACHE_DURATION && 
        cached.version === dataVersion) {
      return {
        score: cached.score,
        label: cached.label,
        color: getMaturityColor(cached.score),
        level: getMaturityLevel(cached.score)
      };
    }

    // Calcular nova maturidade
    let score = 0;
    

    
    try {
      if (medidas && medidas.length > 0) {
        const programaMedidas: ProgramaMedida[] = medidas
          .filter(medida => medida.programa_medida)
          .map(medida => medida.programa_medida);



        if (programaMedidas.length > 0 && programaControle) {
          const result = calculateMaturityIndexForControle(controle, programaControle, programaMedidas);
          score = parseFloat(result);
        } else {
          // Fallback: cálculo simplificado usando pesos das respostas
          let totalScore = 0;
          let validMedidas = 0;

          medidas.forEach(medida => {
            if (medida.resposta !== null && medida.resposta !== undefined) {
              // Buscar o peso correto da resposta
              let peso = 0;
              if (controle.diagnostico === 1) {
                // Diagnóstico 1: respostas sim/não
                const respostaSim = medida.resposta === 1 ? 1 : 0;
                peso = respostaSim;
              } else {
                // Diagnósticos 2-3: escala de maturidade
                const respostaMapping: { [key: number]: number } = {
                  1: 1,    // Adota em maior parte ou totalmente
                  2: 0.75, // Adota em menor parte
                  3: 0.5,  // Adota parcialmente
                  4: 0.25, // Há decisão formal ou plano aprovado
                  5: 0     // A organização não adota essa medida
                  // 6 (Não se aplica) é ignorado
                };
                peso = respostaMapping[medida.resposta] || 0;
              }
              
              if (medida.resposta !== 6) { // Ignorar "Não se aplica"
                totalScore += peso;
                validMedidas++;
              }
            }
          });

          if (validMedidas > 0) {
            const baseIndex = totalScore / validMedidas;
            // Aplicar multiplicador INCC se disponível
            const inccLevel = programaControle?.nivel || 1;
            const inccMultiplier = 1 + ((inccLevel - 1) * 1 / 5);
            score = (baseIndex / 2) * inccMultiplier;
          } else {
            score = 0;
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao calcular maturidade do controle ${controle.id}:`, error);
      score = 0;
    }

    const label = getMaturityLabel(score);
    
    // Salvar no cache
    controleMaturityCache.current.set(cacheKey, {
      score,
      label,
      timestamp: now,
      version: dataVersion
    });

    return {
      score,
      label,
      color: getMaturityColor(score),
      level: getMaturityLevel(score)
    };
  }, [programaId]);

  // Calcular maturidade de diagnóstico com cache
  const getDiagnosticoMaturity = useCallback((
    diagnostico: Diagnostico,
    controles: Controle[],
    medidasData: { [key: number]: any[] }
  ): DiagnosticoMaturityData => {
    const cacheKey = `diagnostico-${diagnostico.id}-${programaId}`;
    const now = Date.now();
    
    // Verificar cache primeiro
    const cached = diagnosticoMaturityCache.current.get(cacheKey);
    const dataVersion = dataVersions.current.get(`diagnostico-${diagnostico.id}`) || 0;
    
    if (cached && 
        (now - cached.timestamp) < CACHE_DURATION && 
        cached.version === dataVersion) {
      return {
        score: cached.score,
        label: cached.label
      };
    }

    // Calcular nova maturidade
    let score = 0;
    
    try {
      if (controles && controles.length > 0) {
        let totalScore = 0;
        let validControles = 0;

        controles.forEach(controle => {
          const medidas = medidasData[controle.id] || [];
          if (medidas.length > 0) {
            // Construir programaControle para o controle
            const programaControle = {
              id: (controle as any).programa_controle_id || 0,
              programa: programaId,
              controle: controle.id,
              nivel: (controle as any).nivel || 1
            };
            const controleMaturity = getControleMaturity(controle, medidas, programaControle);
            totalScore += controleMaturity.score;
            validControles++;
          }
        });

        score = validControles > 0 ? totalScore / validControles : 0;
      }
    } catch (error) {
      console.error(`Erro ao calcular maturidade do diagnóstico ${diagnostico.id}:`, error);
      score = 0;
    }

    const label = getMaturityLabel(score);
    
    // Salvar no cache
    diagnosticoMaturityCache.current.set(cacheKey, {
      score,
      label,
      timestamp: now,
      version: dataVersion
    });

    return {
      score,
      label
    };
  }, [programaId, getControleMaturity]);

  // Função para pré-carregar maturidade de múltiplos itens
  const preloadMaturity = useCallback(async (
    diagnosticos: Diagnostico[],
    controlesData: { [key: number]: Controle[] },
    medidasData: { [key: number]: any[] }
  ) => {
    const promises: Promise<void>[] = [];

    diagnosticos.forEach(diagnostico => {
      promises.push(
        new Promise<void>((resolve) => {
          const controles = controlesData[diagnostico.id] || [];
          getDiagnosticoMaturity(diagnostico, controles, medidasData);
          
          controles.forEach(controle => {
            const medidas = medidasData[controle.id] || [];
            // Construir programaControle para preload
            const programaControle = {
              id: (controle as any).programa_controle_id || 0,
              programa: programaId,
              controle: controle.id,
              nivel: (controle as any).nivel || 1
            };
            getControleMaturity(controle, medidas, programaControle);
          });
          
          resolve();
        })
      );
    });

    await Promise.all(promises);
    setCacheUpdateTrigger(prev => prev + 1);
  }, [getDiagnosticoMaturity, getControleMaturity]);

  // Limpar cache antigo
  const clearOldCache = useCallback(() => {
    const now = Date.now();
    
    // Limpar cache de controles
    for (const [key, entry] of controleMaturityCache.current.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        controleMaturityCache.current.delete(key);
      }
    }
    
    // Limpar cache de diagnósticos
    for (const [key, entry] of diagnosticoMaturityCache.current.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        diagnosticoMaturityCache.current.delete(key);
      }
    }
  }, []);

  // Stats do cache para debug
  const cacheStats = useMemo(() => ({
    controles: controleMaturityCache.current.size,
    diagnosticos: diagnosticoMaturityCache.current.size,
    lastUpdate: cacheUpdateTrigger
  }), [cacheUpdateTrigger]);

  return {
    getControleMaturity,
    getDiagnosticoMaturity,
    invalidateCache,
    preloadMaturity,
    clearOldCache,
    cacheStats,
    MATURITY_COLORS
  };
}; 