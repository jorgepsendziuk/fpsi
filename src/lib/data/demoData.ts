// Dados sintéticos para modo de demonstração
export const DEMO_PROGRAMA = {
  id: 1,
  nome: "Programa de Demonstração - FPSI",
  nome_fantasia: "Empresa Demo Tech Ltda",
  razao_social: "Empresa Demo Tech Ltda",
  cnpj: "12.345.678/0001-99",
  setor: 2, // Empresa privada
  orgao: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const DEMO_DIAGNOSTICOS = [
  {
    id: 1,
    descricao: "Gestão de Ativos"
  },
  {
    id: 2,
    descricao: "Controle de Acesso"
  },
  {
    id: 3,
    descricao: "Proteção de Dados"
  },
  {
    id: 4,
    descricao: "Continuidade de Negócios"
  },
  {
    id: 5,
    descricao: "Resposta a Incidentes"
  }
];

export const DEMO_CONTROLES = {
  1: [ // Gestão de Ativos
    {
      id: 101,
      numero: "IG.01",
      nome: "Inventário de Ativos",
      texto: "Manter inventário atualizado de todos os ativos de informação da organização.",
      nivel: 3,
      programa_controle_id: 1001
    },
    {
      id: 102, 
      numero: "IG.02",
      nome: "Classificação de Ativos",
      texto: "Classificar ativos conforme criticidade e sensibilidade das informações.",
      nivel: 2,
      programa_controle_id: 1002
    },
    {
      id: 103,
      numero: "IG.03", 
      nome: "Tratamento de Ativos",
      texto: "Estabelecer procedimentos para manuseio seguro dos ativos.",
      nivel: 4,
      programa_controle_id: 1003
    }
  ],
  2: [ // Controle de Acesso
    {
      id: 201,
      numero: "AC.01",
      nome: "Política de Controle de Acesso",
      texto: "Definir e manter política de controle de acesso lógico e físico.",
      nivel: 3,
      programa_controle_id: 2001
    },
    {
      id: 202,
      numero: "AC.02", 
      nome: "Gestão de Usuários",
      texto: "Processos para criação, alteração e remoção de contas de usuário.",
      nivel: 2,
      programa_controle_id: 2002
    }
  ],
  3: [ // Proteção de Dados
    {
      id: 301,
      numero: "PD.01",
      nome: "Classificação de Dados",
      texto: "Implementar sistema de classificação de dados conforme sensibilidade.",
      nivel: 3,
      programa_controle_id: 3001
    },
    {
      id: 302,
      numero: "PD.02",
      nome: "Backup e Recuperação", 
      texto: "Estabelecer procedimentos de backup e recuperação de dados críticos.",
      nivel: 4,
      programa_controle_id: 3002
    }
  ],
  4: [ // Continuidade de Negócios
    {
      id: 401,
      numero: "CN.01",
      nome: "Plano de Continuidade",
      texto: "Desenvolver e manter plano de continuidade de negócios.",
      nivel: 2,
      programa_controle_id: 4001
    }
  ],
  5: [ // Resposta a Incidentes
    {
      id: 501,
      numero: "RI.01", 
      nome: "Detecção de Incidentes",
      texto: "Implementar capacidades de detecção de incidentes de segurança.",
      nivel: 3,
      programa_controle_id: 5001
    }
  ]
};

export const DEMO_MEDIDAS = {
  101: [ // IG.01 - Inventário de Ativos
    {
      id: 10101,
      id_medida: "IG.01.01",
      medida: "Manter inventário de hardware",
      descricao: "Documentar todos os equipamentos de hardware da organização"
    },
    {
      id: 10102,
      id_medida: "IG.01.02", 
      medida: "Manter inventário de software",
      descricao: "Documentar todos os softwares instalados e licenças"
    },
    {
      id: 10103,
      id_medida: "IG.01.03",
      medida: "Revisar inventário periodicamente", 
      descricao: "Realizar revisões trimestrais do inventário de ativos"
    }
  ],
  102: [ // IG.02 - Classificação de Ativos
    {
      id: 10201,
      id_medida: "IG.02.01",
      medida: "Definir critérios de classificação",
      descricao: "Estabelecer critérios claros para classificação de ativos"
    },
    {
      id: 10202,
      id_medida: "IG.02.02",
      medida: "Aplicar classificação aos ativos",
      descricao: "Classificar todos os ativos conforme critérios definidos"
    }
  ],
  103: [ // IG.03 - Tratamento de Ativos
    {
      id: 10301,
      id_medida: "IG.03.01", 
      medida: "Procedimentos de manuseio",
      descricao: "Definir procedimentos seguros para manuseio de ativos"
    }
  ],
  201: [ // AC.01 - Política de Controle de Acesso
    {
      id: 20101,
      id_medida: "AC.01.01",
      medida: "Elaborar política de acesso",
      descricao: "Criar política formal de controle de acesso"
    },
    {
      id: 20102,
      id_medida: "AC.01.02",
      medida: "Aprovar política de acesso", 
      descricao: "Obter aprovação formal da alta direção"
    }
  ],
  202: [ // AC.02 - Gestão de Usuários
    {
      id: 20201,
      id_medida: "AC.02.01",
      medida: "Processo de criação de usuários",
      descricao: "Definir processo formal para criação de contas"
    },
    {
      id: 20202,
      id_medida: "AC.02.02",
      medida: "Processo de remoção de usuários",
      descricao: "Definir processo para desativação de contas"
    }
  ],
  301: [ // PD.01 - Classificação de Dados
    {
      id: 30101,
      id_medida: "PD.01.01",
      medida: "Definir níveis de classificação",
      descricao: "Estabelecer níveis de sensibilidade dos dados"
    }
  ],
  302: [ // PD.02 - Backup e Recuperação
    {
      id: 30201,
      id_medida: "PD.02.01",
      medida: "Definir estratégia de backup",
      descricao: "Estabelecer estratégia de backup conforme criticidade"
    },
    {
      id: 30202,
      id_medida: "PD.02.02",
      medida: "Testar recuperação de dados",
      descricao: "Realizar testes periódicos de recuperação"
    }
  ],
  401: [ // CN.01 - Plano de Continuidade
    {
      id: 40101,
      id_medida: "CN.01.01", 
      medida: "Análise de impacto nos negócios",
      descricao: "Realizar análise de impacto nos processos críticos"
    }
  ],
  501: [ // RI.01 - Detecção de Incidentes
    {
      id: 50101,
      id_medida: "RI.01.01",
      medida: "Implementar monitoramento",
      descricao: "Implementar ferramentas de monitoramento de segurança"
    }
  ]
};

export const DEMO_PROGRAMA_MEDIDAS = {
  // Medidas do IG.01 - algumas implementadas, outras não
  "10101-101-999999": {
    id: 90001,
    programa: 999999,
    medida: 10101,
    controle: 101,
    resposta: "S", // Sim
    justificativa: "Inventário de hardware mantido em planilha atualizada mensalmente",
    status_plano_acao: "Concluído",
    data_inicio_plano_acao: "2024-01-15",
    data_fim_plano_acao: "2024-02-15",
    plano_acao: "Implementação de sistema automatizado de inventário",
    responsavel: 1
  },
  "10102-101-999999": {
    id: 90002,
    programa: 999999,
    medida: 10102, 
    controle: 101,
    resposta: "P", // Parcial
    justificativa: "Inventário de software em processo de implementação",
    status_plano_acao: "Em andamento",
    data_inicio_plano_acao: "2024-02-01",
    data_fim_plano_acao: "2024-04-30",
    plano_acao: "Completar inventário de software e implementar controle de licenças",
    responsavel: 2
  },
  "10103-101-999999": {
    id: 90003,
    programa: 999999,
    medida: 10103,
    controle: 101, 
    resposta: "N", // Não
    justificativa: "Revisões ainda não implementadas sistematicamente",
    status_plano_acao: "Não iniciado",
    data_inicio_plano_acao: "2024-03-01",
    data_fim_plano_acao: "2024-05-31",
    plano_acao: "Estabelecer cronograma de revisões trimestrais",
    responsavel: 1
  },

  // Medidas do IG.02
  "10201-102-999999": {
    id: 90004,
    programa: 999999,
    medida: 10201,
    controle: 102,
    resposta: "S",
    justificativa: "Critérios de classificação definidos e documentados",
    status_plano_acao: "Concluído",
    data_inicio_plano_acao: "2024-01-01",
    data_fim_plano_acao: "2024-01-31",
    plano_acao: "Definição e documentação dos critérios",
    responsavel: 3
  },
  "10202-102-999999": {
    id: 90005,
    programa: 999999,
    medida: 10202,
    controle: 102,
    resposta: "P",
    justificativa: "Classificação aplicada parcialmente aos ativos críticos",
    status_plano_acao: "Em andamento", 
    data_inicio_plano_acao: "2024-02-15",
    data_fim_plano_acao: "2024-06-30",
    plano_acao: "Completar classificação de todos os ativos",
    responsavel: 3
  },

  // Medidas do AC.01
  "20101-201-999999": {
    id: 90006,
    programa: 999999,
    medida: 20101,
    controle: 201,
    resposta: "S",
    justificativa: "Política de controle de acesso elaborada e implementada",
    status_plano_acao: "Concluído",
    data_inicio_plano_acao: "2023-11-01",
    data_fim_plano_acao: "2023-12-31",
    plano_acao: "Elaboração e implementação da política",
    responsavel: 2
  },

  // Medidas do PD.02 
  "30201-302-999999": {
    id: 90007,
    programa: 999999,
    medida: 30201,
    controle: 302,
    resposta: "S",
    justificativa: "Estratégia de backup implementada com backup diário",
    status_plano_acao: "Concluído",
    data_inicio_plano_acao: "2023-12-01", 
    data_fim_plano_acao: "2024-01-15",
    plano_acao: "Implementação de solução de backup automatizada",
    responsavel: 1
  },
  "30202-302-999999": {
    id: 90008,
    programa: 999999,
    medida: 30202,
    controle: 302,
    resposta: "P",
    justificativa: "Testes de recuperação realizados semestralmente",
    status_plano_acao: "Em andamento",
    data_inicio_plano_acao: "2024-01-15",
    data_fim_plano_acao: "2024-03-31",
    plano_acao: "Implementar testes mensais de recuperação",
    responsavel: 1
  }
};

export const DEMO_RESPONSAVEIS = [
  {
    id: 1,
    nome: "João Silva Santos",
    cargo: "Coordenador de TI",
    email: "joao.silva@empresademo.com.br",
    telefone: "(11) 98765-4321",
    programa: 999999
  },
  {
    id: 2,
    nome: "Maria Oliveira Costa", 
    cargo: "Analista de Segurança",
    email: "maria.oliveira@empresademo.com.br",
    telefone: "(11) 97654-3210",
    programa: 999999
  },
  {
    id: 3,
    nome: "Carlos Roberto Lima",
    cargo: "Gestor de Qualidade",
    email: "carlos.lima@empresademo.com.br", 
    telefone: "(11) 96543-2109",
    programa: 999999
  }
];

export const DEMO_ORGAOS = [
  {
    id: 1,
    nome: "Ministério da Economia",
    sigla: "ME"
  },
  {
    id: 2, 
    nome: "Controladoria-Geral da União",
    sigla: "CGU"
  }
];

// Função para verificar se está no modo demo
export const isDemoMode = () => {
  return typeof window !== 'undefined' && window.location.pathname.includes('/demo');
};

// Função para obter dados demo
export const getDemoData = () => {
  return {
    programa: DEMO_PROGRAMA,
    diagnosticos: DEMO_DIAGNOSTICOS,
    controles: DEMO_CONTROLES,
    medidas: DEMO_MEDIDAS,
    programaMedidas: DEMO_PROGRAMA_MEDIDAS,
    responsaveis: DEMO_RESPONSAVEIS,
    orgaos: DEMO_ORGAOS
  };
};