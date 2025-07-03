// Service que substitui as chamadas de API por dados reais no modo demo
// O modo demo agora usa dados reais do banco de dados, apenas simula delays

// Import do dataService real
let realDataService: any = null;
const getRealDataService = async () => {
  if (!realDataService) {
    const dataService = await import('./dataService');
    realDataService = dataService;
  }
  return realDataService;
};

// Simulação de delay de rede para realismo
const simulateDelay = (ms: number = 200) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const demoDataService = {
  // Programas
  fetchProgramaById: async (id: number) => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const programa = await realService.fetchProgramaById(id);
      return programa;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar programa:', error);
      throw error;
    }
  },

  fetchProgramas: async () => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const programas = await realService.fetchProgramas();
      return programas;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar programas:', error);
      throw error;
    }
  },

  // Diagnósticos
  fetchDiagnosticos: async () => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const diagnosticos = await realService.fetchDiagnosticos();
      return diagnosticos;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar diagnósticos:', error);
      throw error;
    }
  },

  // Controles
  fetchControles: async (diagnosticoId: number, programaId: number) => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const controles = await realService.fetchControles(diagnosticoId, programaId);
      return controles;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar controles:', error);
      throw error;
    }
  },

  // Medidas
  fetchMedidas: async (controleId: number, programaId: number) => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const medidas = await realService.fetchMedidas(controleId, programaId);
      return medidas;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar medidas:', error);
      throw error;
    }
  },

  // Programa Medidas
  fetchProgramaMedida: async (medidaId: number, controleId: number, programaId: number) => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const programaMedida = await realService.fetchProgramaMedida(medidaId, controleId, programaId);
      return programaMedida;
    } catch (error) {
      console.warn('[DEMO MODE] ProgramaMedida não encontrada:', error);
      return null;
    }
  },

  // Responsáveis
  fetchResponsaveis: async (programaId: number) => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const responsaveis = await realService.fetchResponsaveis(programaId);
      return responsaveis;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar responsáveis:', error);
      return [];
    }
  },

  // Órgãos
  fetchOrgaos: async () => {
    await simulateDelay();
    try {
      const realService = await getRealDataService();
      const orgaos = await realService.fetchOrgaos();
      return orgaos;
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar órgãos:', error);
      return [];
    }
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
    try {
      const realService = await getRealDataService();
      const programa = await realService.fetchProgramaById(programaId);
      if (!programa) return null;
      
      return {
        id: programa.id,
        nome: programa.nome,
        nome_fantasia: programa.nome_fantasia,
        razao_social: programa.razao_social,
        cnpj: programa.cnpj,
        setor: programa.setor,
        orgao: programa.orgao
      };
    } catch (error) {
      console.error('[DEMO MODE] Erro ao buscar campos principais:', error);
      return null;
    }
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