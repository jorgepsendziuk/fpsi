// Service que substitui as chamadas de API por dados sintéticos no modo demo
import { getDemoData } from '../data/demoData';

const demoData = getDemoData();

// Import do dataService real para buscar dados padrão
let realDataService: any = null;
const getRealDataService = async () => {
  if (!realDataService) {
    const dataService = await import('./dataService');
    realDataService = dataService;
  }
  return realDataService;
};

// Simulação de delay de rede para realismo
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const demoDataService = {
  // Programas
  fetchProgramaById: async (id: number) => {
    await simulateDelay();
    if (id === 999999) {
      return demoData.programa;
    }
    throw new Error('Programa não encontrado no modo demo');
  },

  fetchProgramas: async () => {
    await simulateDelay();
    return [demoData.programa];
  },

  // Diagnósticos
  fetchDiagnosticos: async () => {
    await simulateDelay();
    // Para o modo demo, usar dados reais do banco de dados
    try {
      const realService = await getRealDataService();
      const realDiagnosticos = await realService.fetchDiagnosticos();
      return realDiagnosticos;
    } catch (error) {
      console.warn('[DEMO MODE] Falha ao buscar diagnósticos reais, usando dados sintéticos:', error);
      return demoData.diagnosticos;
    }
  },

  // Controles
  fetchControles: async (diagnosticoId: number, programaId: number) => {
    await simulateDelay();
    if (programaId !== 999999) {
      throw new Error('Programa não encontrado no modo demo');
    }
    // Para o modo demo, usar dados reais do banco de dados
    try {
      const realService = await getRealDataService();
      const realControles = await realService.fetchControles(diagnosticoId, programaId);
      return realControles;
    } catch (error) {
      console.warn('[DEMO MODE] Falha ao buscar controles reais, usando dados sintéticos:', error);
      return (demoData.controles as any)[diagnosticoId] || [];
    }
  },

  // Medidas
  fetchMedidas: async (controleId: number, programaId: number) => {
    await simulateDelay();
    if (programaId !== 999999) {
      throw new Error('Programa não encontrado no modo demo');
    }
    // Para o modo demo, usar dados reais do banco de dados
    try {
      const realService = await getRealDataService();
      const realMedidas = await realService.fetchMedidas(controleId, programaId);
      return realMedidas;
    } catch (error) {
      console.warn('[DEMO MODE] Falha ao buscar medidas reais, usando dados sintéticos:', error);
      return (demoData.medidas as any)[controleId] || [];
    }
  },

  // Programa Medidas
  fetchProgramaMedida: async (medidaId: number, controleId: number, programaId: number) => {
    await simulateDelay();
    if (programaId !== 999999) {
      return null;
    }
    const key = `${medidaId}-${controleId}-${programaId}`;
    return (demoData.programaMedidas as any)[key] || null;
  },

  // Responsáveis
  fetchResponsaveis: async (programaId: number) => {
    await simulateDelay();
    if (programaId !== 999999) {
      return [];
    }
    return demoData.responsaveis;
  },

  // Órgãos
  fetchOrgaos: async () => {
    await simulateDelay();
    return demoData.orgaos;
  },

  // Operações de escrita (simuladas - não persistem)
  updateProgramaMedida: async (programaMedidaId: number, updates: any) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando atualização de programa_medida:', programaMedidaId, updates);
    return { success: true };
  },

  updateControleNivel: async (programaControleId: number, nivel: number) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando atualização de nível INCC:', programaControleId, nivel);
    return { success: true };
  },

  updatePrograma: async (programaId: number, updates: any) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando atualização de programa:', programaId, updates);
    return { success: true };
  },

  createProgramaMedida: async (data: any) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando criação de programa_medida:', data);
    return { id: Math.floor(Math.random() * 90000) + 90000 };
  },

  createResponsavel: async (data: any) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando criação de responsável:', data);
    return { id: Math.floor(Math.random() * 9000) + 1000 };
  },

  updateResponsavel: async (id: number, data: any) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando atualização de responsável:', id, data);
    return { success: true };
  },

  deleteResponsavel: async (id: number) => {
    await simulateDelay();
    console.log('[DEMO MODE] Simulando exclusão de responsável:', id);
    return { success: true };
  },

  // Campos principais do programa
  fetchProgramaCamposPrincipais: async (programaId: number) => {
    await simulateDelay();
    if (programaId !== 999999) {
      return null;
    }
    return {
      id: demoData.programa.id,
      nome: demoData.programa.nome,
      nome_fantasia: demoData.programa.nome_fantasia,
      razao_social: demoData.programa.razao_social,
      cnpj: demoData.programa.cnpj,
      setor: demoData.programa.setor,
      orgao: demoData.programa.orgao
    };
  }
};

// Função para verificar se deve usar dados demo
export const shouldUseDemoData = (programaId?: number) => {
  // Usar dados demo se o programaId é 999999 ou se está na rota /demo
  return programaId === 999999 || 
         (typeof window !== 'undefined' && window.location.pathname.includes('/demo'));
};

// Factory function que retorna o service apropriado
export const getDataService = (programaId?: number) => {
  if (shouldUseDemoData(programaId)) {
    return demoDataService;
  }
  // Retorna o service normal (será importado dinamicamente para evitar ciclo)
  return null; // Será tratado pelo código chamador
};