/**
 * HOOK OTIMIZADO PARA DIAGNÓSTICOS
 * 
 * Substitui toda a lógica complexa de carregamento por uma estratégia eficiente:
 * 1. Carregamento essencial mínimo inicial
 * 2. Lazy loading sob demanda
 * 3. Cache inteligente
 * 4. Logs mínimos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { loadEssentialData, loadMedidasDetalhadas, invalidateCache } from '../../../lib/services/optimizedDataService';

interface DiagnosticoData {
  id: number;
  descricao: string;
}

interface ControleData {
  id: number;
  numero: string;
  nome: string;
  texto?: string;
  diagnostico: number;
  nivel: number;
  programa_controle_id: number;
}

interface TreeNode {
  id: string;
  type: 'dashboard' | 'diagnostico' | 'controle' | 'medida';
  label: string;
  description?: string;
  icon: React.ReactNode;
  data: any;
  children?: TreeNode[];
  expanded?: boolean;
  maturityScore?: number;
  maturityLabel?: string;
}

interface OptimizedDiagnosticoState {
  // Dados essenciais (sempre carregados)
  diagnosticos: DiagnosticoData[];
  controlesPorDiagnostico: { [diagnosticoId: number]: ControleData[] };
  respostasPorChave: { [key: string]: any };
  
  // Dados detalhados (lazy loading)
  medidasDetalhadas: { [controleId: number]: any[] | undefined };
  
  // Estados de carregamento
  isLoadingEssential: boolean;
  isLoadingDetailed: { [controleId: number]: boolean };
  
  // Erros
  error: string | null;
  
  // Última atualização
  lastUpdate: number;
}

export const useOptimizedDiagnostico = (programaId: number) => {
  const [state, setState] = useState<OptimizedDiagnosticoState>({
    diagnosticos: [],
    controlesPorDiagnostico: {},
    respostasPorChave: {},
    medidasDetalhadas: {},
    isLoadingEssential: true,
    isLoadingDetailed: {},
    error: null,
    lastUpdate: 0
  });

  // Carregamento inicial dos dados essenciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, isLoadingEssential: true, error: null }));
        
        const essentialData = await loadEssentialData(programaId);
        
        setState(prev => ({
          ...prev,
          diagnosticos: essentialData.diagnosticos,
          controlesPorDiagnostico: essentialData.controlesPorDiagnostico,
          respostasPorChave: essentialData.respostasPorChave,
          isLoadingEssential: false,
          lastUpdate: Date.now()
        }));
        
      } catch (error) {
        console.error('❌ Failed to load essential data:', error);
        setState(prev => ({
          ...prev,
          isLoadingEssential: false,
          error: 'Falha ao carregar dados essenciais'
        }));
      }
    };

    loadInitialData();
  }, [programaId]);

  // Função para carregar medidas detalhadas sob demanda
  const loadMedidasForControle = useCallback(async (controleId: number) => {
    // Evitar múltiplos carregamentos
    if (state.isLoadingDetailed[controleId] || state.medidasDetalhadas[controleId]) {
      return state.medidasDetalhadas[controleId] || [];
    }

    try {
      setState(prev => ({
        ...prev,
        isLoadingDetailed: { ...prev.isLoadingDetailed, [controleId]: true }
      }));

      const medidas = await loadMedidasDetalhadas(controleId, programaId);
      
      setState(prev => ({
        ...prev,
        medidasDetalhadas: { ...prev.medidasDetalhadas, [controleId]: medidas },
        isLoadingDetailed: { ...prev.isLoadingDetailed, [controleId]: false }
      }));

      return medidas;
      
    } catch (error) {
      console.error(`❌ Failed to load medidas for controle ${controleId}:`, error);
      setState(prev => ({
        ...prev,
        isLoadingDetailed: { ...prev.isLoadingDetailed, [controleId]: false }
      }));
      return [];
    }
  }, [state.isLoadingDetailed, state.medidasDetalhadas, programaId]);

  // Função para atualizar resposta de medida
  const updateMedidaResposta = useCallback(async (
    medidaId: number,
    controleId: number,
    field: string,
    value: any
  ) => {
    try {
      // Atualizar no banco (implementar)
      // await updateProgramaMedida(medidaId, controleId, programaId, { [field]: value });
      
      // Atualizar estado local
      const key = `${medidaId}-${controleId}-${programaId}`;
      setState(prev => ({
        ...prev,
        respostasPorChave: {
          ...prev.respostasPorChave,
          [key]: { ...prev.respostasPorChave[key], [field]: value }
        },
        lastUpdate: Date.now()
      }));
      
      // Invalidar cache de maturidade
      invalidateCache('controle', controleId);
      
    } catch (error) {
      console.error('❌ Failed to update medida:', error);
    }
  }, [programaId]);

  // Função para atualizar nível INCC
  const updateControleINCC = useCallback(async (controleId: number, nivel: number) => {
    try {
      // Atualizar no banco (implementar)
      // await updateControleNivel(controleId, nivel);
      
      // Atualizar estado local
      setState(prev => {
        const newControlesPorDiagnostico = { ...prev.controlesPorDiagnostico };
        
        Object.keys(newControlesPorDiagnostico).forEach(diagnosticoId => {
          newControlesPorDiagnostico[parseInt(diagnosticoId)] = 
            newControlesPorDiagnostico[parseInt(diagnosticoId)].map(controle =>
              controle.id === controleId ? { ...controle, nivel } : controle
            );
        });
        
        return {
          ...prev,
          controlesPorDiagnostico: newControlesPorDiagnostico,
          lastUpdate: Date.now()
        };
      });
      
      // Invalidar cache
      invalidateCache('controle', controleId);
      
    } catch (error) {
      console.error('❌ Failed to update INCC:', error);
    }
  }, []);

  // Função para calcular maturidade de controle
  const getControleMaturidade = useCallback((controle: ControleData) => {
    // Buscar respostas das medidas deste controle
    const respostasControle = Object.entries(state.respostasPorChave)
      .filter(([key]) => key.includes(`-${controle.id}-${programaId}`))
      .map(([, resposta]) => resposta);

    if (respostasControle.length === 0) {
      return { score: 0, label: 'Sem dados', color: '#9E9E9E' };
    }

    // Calcular usando fórmula oficial
    let somaRespostas = 0;
    let totalMedidas = 0;

    respostasControle.forEach(resposta => {
      if (resposta.resposta === 6) return; // Ignorar "Não se aplica"
      
      totalMedidas++;
      
      if (resposta.resposta !== null && resposta.resposta !== undefined) {
        let peso = 0;
        if (controle.diagnostico === 1) {
          peso = resposta.resposta === 1 ? 1 : 0;
        } else {
          const pesos = { 1: 1, 2: 0.75, 3: 0.5, 4: 0.25, 5: 0 };
          peso = pesos[resposta.resposta as keyof typeof pesos] || 0;
        }
        somaRespostas += peso;
      }
    });

    if (totalMedidas === 0) {
      return { score: 0, label: 'Sem medidas', color: '#9E9E9E' };
    }

    // Aplicar fórmula oficial
    const baseIndex = somaRespostas / totalMedidas;
    const inccMultiplier = 1 + ((controle.nivel || 0) * 1 / 5);
    const finalScore = (baseIndex / 2) * inccMultiplier;

    // Determinar label e cor
    let label = 'Inicial';
    let color = '#FF5252';
    
    if (finalScore >= 0.9) {
      label = 'Aprimorado';
      color = '#2E7D32';
    } else if (finalScore >= 0.7) {
      label = 'Em Aprimoramento';
      color = '#4CAF50';
    } else if (finalScore >= 0.5) {
      label = 'Intermediário';
      color = '#FFC107';
    } else if (finalScore >= 0.3) {
      label = 'Básico';
      color = '#FF9800';
    }

    return { score: finalScore, label, color };
  }, [state.respostasPorChave, programaId]);

  // Função para calcular maturidade de diagnóstico
  const getDiagnosticoMaturidade = useCallback((diagnosticoId: number) => {
    const controles = state.controlesPorDiagnostico[diagnosticoId] || [];
    
    if (controles.length === 0) {
      return { score: 0, label: 'Sem controles', color: '#9E9E9E' };
    }

    let totalScore = 0;
    let controlesComDados = 0;

    controles.forEach(controle => {
      const maturity = getControleMaturidade(controle);
      if (maturity.score > 0) {
        totalScore += maturity.score;
        controlesComDados++;
      }
    });

    const averageScore = controlesComDados > 0 ? totalScore / controlesComDados : 0;
    
    let label = 'Inicial';
    let color = '#FF5252';
    
    if (averageScore >= 0.9) {
      label = 'Aprimorado';
      color = '#2E7D32';
    } else if (averageScore >= 0.7) {
      label = 'Em Aprimoramento';
      color = '#4CAF50';
    } else if (averageScore >= 0.5) {
      label = 'Intermediário';
      color = '#FFC107';
    } else if (averageScore >= 0.3) {
      label = 'Básico';
      color = '#FF9800';
    }

    return { score: averageScore, label, color };
  }, [state.controlesPorDiagnostico, getControleMaturidade]);

  // Construir árvore de navegação otimizada
  const treeData = useMemo((): TreeNode[] => {
    if (state.isLoadingEssential) {
      return [];
    }

    const nodes: TreeNode[] = [
      {
        id: 'dashboard',
        type: 'dashboard',
        label: 'Dashboard',
        description: 'Visão geral consolidada',
        icon: null, // Será definido no componente
        data: { type: 'dashboard' }
      }
    ];

    state.diagnosticos.forEach(diagnostico => {
      const controles = state.controlesPorDiagnostico[diagnostico.id] || [];
      const maturity = getDiagnosticoMaturidade(diagnostico.id);

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: 'diagnostico',
        label: diagnostico.descricao,
        icon: null, // Será definido no componente
        data: diagnostico,
        maturityScore: maturity.score,
        maturityLabel: maturity.label,
        children: controles.map(controle => {
          const controleMaturidade = getControleMaturidade(controle);
          
          return {
            id: `controle-${controle.id}`,
            type: 'controle',
            label: `${controle.numero} - ${controle.nome}`,
            icon: null, // Será definido no componente
            data: controle,
            maturityScore: controleMaturidade.score,
            maturityLabel: controleMaturidade.label,
            children: [] // Medidas serão carregadas sob demanda
          };
        })
      };

      nodes.push(diagnosticoNode);
    });

    return nodes;
  }, [
    state.isLoadingEssential,
    state.diagnosticos,
    state.controlesPorDiagnostico,
    getDiagnosticoMaturidade,
    getControleMaturidade
  ]);

  return {
    // Dados
    diagnosticos: state.diagnosticos,
    controlesPorDiagnostico: state.controlesPorDiagnostico,
    respostasPorChave: state.respostasPorChave,
    treeData,
    
    // Estados
    isLoadingEssential: state.isLoadingEssential,
    isLoadingDetailed: state.isLoadingDetailed,
    error: state.error,
    lastUpdate: state.lastUpdate,
    
    // Funções
    loadMedidasForControle,
    updateMedidaResposta,
    updateControleINCC,
    getControleMaturidade,
    getDiagnosticoMaturidade,
    
    // Cache
    invalidateCache: () => invalidateCache('programa', programaId)
  };
};
