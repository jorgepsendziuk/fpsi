// Tipos para sistema de plano de trabalho aprimorado

export interface PlanoAcao {
  id: number;
  programa_id: number;
  medida_id?: number;
  controle_id?: number;
  diagnostico_id?: number;
  titulo: string;
  descricao: string;
  objetivo: string;
  justificativa?: string;
  prioridade: PrioridadePlano;
  status: StatusPlanoAcao;
  data_inicio: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  progresso_percentual: number;
  orcamento_previsto?: number;
  orcamento_utilizado?: number;
  responsavel_principal: string;
  aprovado_por?: string;
  aprovado_em?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export enum StatusPlanoAcao {
  RASCUNHO = 'rascunho',
  AGUARDANDO_APROVACAO = 'aguardando_aprovacao',
  APROVADO = 'aprovado',
  EM_ANDAMENTO = 'em_andamento',
  PAUSADO = 'pausado',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
  ATRASADO = 'atrasado'
}

export enum PrioridadePlano {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export interface Marco {
  id: number;
  plano_acao_id: number;
  titulo: string;
  descricao?: string;
  data_prevista: string;
  data_real?: string;
  status: StatusMarco;
  ordem: number;
  percentual_conclusao: number;
  responsavel?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export enum StatusMarco {
  PENDENTE = 'pendente',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  ATRASADO = 'atrasado',
  CANCELADO = 'cancelado'
}

export interface Atividade {
  id: number;
  plano_acao_id: number;
  marco_id?: number;
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  status: StatusAtividade;
  responsavel?: string;
  horas_estimadas?: number;
  horas_reais?: number;
  ordem: number;
  dependencias?: number[]; // IDs de outras atividades
  created_at: string;
  updated_at: string;
}

export enum StatusAtividade {
  NAO_INICIADA = 'nao_iniciada',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDA = 'concluida',
  BLOQUEADA = 'bloqueada',
  CANCELADA = 'cancelada'
}

export interface RecursoPlano {
  id: number;
  plano_acao_id: number;
  tipo: TipoRecurso;
  nome: string;
  descricao?: string;
  quantidade: number;
  unidade: string;
  custo_unitario?: number;
  custo_total?: number;
  fornecedor?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export enum TipoRecurso {
  HUMANO = 'humano',
  MATERIAL = 'material',
  EQUIPAMENTO = 'equipamento',
  SOFTWARE = 'software',
  SERVICO = 'servico',
  TREINAMENTO = 'treinamento'
}

export interface RiscoPlano {
  id: number;
  plano_acao_id: number;
  titulo: string;
  descricao: string;
  probabilidade: NivelRisco;
  impacto: NivelRisco;
  nivel_risco: NivelRisco;
  estrategia_mitigacao: string;
  responsavel?: string;
  status: StatusRisco;
  created_at: string;
  updated_at: string;
}

export enum NivelRisco {
  MUITO_BAIXO = 'muito_baixo',
  BAIXO = 'baixo',
  MEDIO = 'medio',
  ALTO = 'alto',
  MUITO_ALTO = 'muito_alto'
}

export enum StatusRisco {
  IDENTIFICADO = 'identificado',
  EM_MONITORAMENTO = 'em_monitoramento',
  MITIGADO = 'mitigado',
  MATERIALIZADO = 'materializado',
  ACEITO = 'aceito'
}

export interface ComentarioPlano {
  id: number;
  plano_acao_id: number;
  marco_id?: number;
  atividade_id?: number;
  usuario_id: string;
  comentario: string;
  tipo: TipoComentario;
  anexos?: string[];
  created_at: string;
  updated_at: string;
}

export enum TipoComentario {
  GERAL = 'geral',
  PROGRESSO = 'progresso',
  PROBLEMA = 'problema',
  SOLUCAO = 'solucao',
  APROVACAO = 'aprovacao',
  REJEICAO = 'rejeicao'
}

export interface HistoricoPlano {
  id: number;
  plano_acao_id: number;
  usuario_id: string;
  acao: AcaoHistorico;
  campo_alterado?: string;
  valor_anterior?: string;
  valor_novo?: string;
  observacoes?: string;
  created_at: string;
}

export enum AcaoHistorico {
  CRIADO = 'criado',
  EDITADO = 'editado',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
  INICIADO = 'iniciado',
  PAUSADO = 'pausado',
  RETOMADO = 'retomado',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
  MARCO_CONCLUIDO = 'marco_concluido',
  ATIVIDADE_CONCLUIDA = 'atividade_concluida',
  COMENTARIO_ADICIONADO = 'comentario_adicionado'
}

export interface DashboardPlanos {
  total_planos: number;
  planos_por_status: Record<StatusPlanoAcao, number>;
  planos_por_prioridade: Record<PrioridadePlano, number>;
  planos_atrasados: number;
  planos_vencendo: number; // Próximos 7 dias
  progresso_medio: number;
  orcamento_total: number;
  orcamento_utilizado: number;
  marcos_proximos: Marco[];
  atividades_pendentes: Atividade[];
  riscos_altos: RiscoPlano[];
}

export interface GanttData {
  plano_id: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  progresso: number;
  marcos: {
    id: number;
    titulo: string;
    data: string;
    concluido: boolean;
  }[];
  dependencias?: number[];
}

// Funções utilitárias
export const getStatusDisplayName = (status: StatusPlanoAcao): string => {
  const statusNames = {
    [StatusPlanoAcao.RASCUNHO]: 'Rascunho',
    [StatusPlanoAcao.AGUARDANDO_APROVACAO]: 'Aguardando Aprovação',
    [StatusPlanoAcao.APROVADO]: 'Aprovado',
    [StatusPlanoAcao.EM_ANDAMENTO]: 'Em Andamento',
    [StatusPlanoAcao.PAUSADO]: 'Pausado',
    [StatusPlanoAcao.CONCLUIDO]: 'Concluído',
    [StatusPlanoAcao.CANCELADO]: 'Cancelado',
    [StatusPlanoAcao.ATRASADO]: 'Atrasado'
  };
  return statusNames[status] || status;
};

export const getPrioridadeDisplayName = (prioridade: PrioridadePlano): string => {
  const prioridadeNames = {
    [PrioridadePlano.BAIXA]: 'Baixa',
    [PrioridadePlano.MEDIA]: 'Média',
    [PrioridadePlano.ALTA]: 'Alta',
    [PrioridadePlano.CRITICA]: 'Crítica'
  };
  return prioridadeNames[prioridade] || prioridade;
};

export const getStatusColor = (status: StatusPlanoAcao): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case StatusPlanoAcao.RASCUNHO:
      return 'default';
    case StatusPlanoAcao.AGUARDANDO_APROVACAO:
      return 'warning';
    case StatusPlanoAcao.APROVADO:
      return 'info';
    case StatusPlanoAcao.EM_ANDAMENTO:
      return 'primary';
    case StatusPlanoAcao.PAUSADO:
      return 'secondary';
    case StatusPlanoAcao.CONCLUIDO:
      return 'success';
    case StatusPlanoAcao.CANCELADO:
      return 'error';
    case StatusPlanoAcao.ATRASADO:
      return 'error';
    default:
      return 'default';
  }
};

export const getPrioridadeColor = (prioridade: PrioridadePlano): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (prioridade) {
    case PrioridadePlano.BAIXA:
      return 'success';
    case PrioridadePlano.MEDIA:
      return 'info';
    case PrioridadePlano.ALTA:
      return 'warning';
    case PrioridadePlano.CRITICA:
      return 'error';
    default:
      return 'default';
  }
};

export const calcularProgressoPlano = (marcos: Marco[]): number => {
  if (marcos.length === 0) return 0;
  
  const progressoTotal = marcos.reduce((acc, marco) => acc + marco.percentual_conclusao, 0);
  return Math.round(progressoTotal / marcos.length);
};

export const verificarAtraso = (plano: PlanoAcao): boolean => {
  const hoje = new Date();
  const dataFim = new Date(plano.data_fim_prevista);
  
  return hoje > dataFim && plano.status !== StatusPlanoAcao.CONCLUIDO;
};

export const diasParaVencimento = (dataFim: string): number => {
  const hoje = new Date();
  const dataLimite = new Date(dataFim);
  const diferenca = dataLimite.getTime() - hoje.getTime();
  
  return Math.ceil(diferenca / (1000 * 3600 * 24));
};

export const calcularRiscoGeral = (probabilidade: NivelRisco, impacto: NivelRisco): NivelRisco => {
  const valores = {
    [NivelRisco.MUITO_BAIXO]: 1,
    [NivelRisco.BAIXO]: 2,
    [NivelRisco.MEDIO]: 3,
    [NivelRisco.ALTO]: 4,
    [NivelRisco.MUITO_ALTO]: 5
  };
  
  const valorRisco = (valores[probabilidade] + valores[impacto]) / 2;
  
  if (valorRisco <= 1.5) return NivelRisco.MUITO_BAIXO;
  if (valorRisco <= 2.5) return NivelRisco.BAIXO;
  if (valorRisco <= 3.5) return NivelRisco.MEDIO;
  if (valorRisco <= 4.5) return NivelRisco.ALTO;
  return NivelRisco.MUITO_ALTO;
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};

export const formatarDataHora = (data: string): string => {
  return new Date(data).toLocaleString('pt-BR');
};