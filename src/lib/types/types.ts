import { DateTimeFieldOwnerState } from "@mui/x-date-pickers/DateTimeField/DateTimeField.types";

/**
 * Programa interface - represents a security program
 */
export interface Programa {
  id: number; 
  orgao: number;
  sgd_versao_diagnostico_enviado: string;
  sgd_versao_diagnostico: string;
  responsavel_controle_interno: number;
  responsavel_si: number;
  responsavel_privacidade: number;
  responsavel_ti: number;
  sgd_numero_documento_nota_tecnica: string;
  sgd_data_limite_retorno: Date;
  sgd_retorno_data: Date;
  setor: number;
  cnpj: number;
  razao_social: string;
  nome_fantasia: string;
  atendimento_fone: string;
  atendimento_email: string;
  atendimento_site: string;
  politica_inicio_vigencia: Date;
  politica_prazo_revisao: Date;
}

/**
 * Diagnostico interface - represents a diagnostic area
 */
export interface Diagnostico {
  id: number;
  descricao: string;
  cor: string;
  indice: number;
  maturidade: number;
} 

/**
 * Controle interface - represents a security control
 */
export interface Controle {
  id: number;
  diagnostico: number;
  numero: number;
  nome: string;
  texto?: string;
  por_que_implementar?: string;
  fique_atento?: string | null;
  aplicabilidade_privacidade?: string;
  nivel?: number;
  programa_controle_id?: number;
  programa?: number;
}

/**
 * ProgramaControle interface - represents the relationship between a program and control
 */
export interface ProgramaControle {
  id?: number;
  programa: number;
  controle: number;
  nivel?: number;
}

/**
 * Medida type - represents a security measure
 * Consolidated version with all possible properties
 */
export type Medida = {
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;
  // Optional properties that may be present
  resposta?: number;
  justificativa?: string;
  observacao_orgao?: string;
  responsavel?: number;
  previsao_inicio?: Date;
  previsao_fim?: Date;
  nova_resposta?: string;
  encaminhamento_interno?: string;
  status_medida?: number;
  status_plano_acao?: number;
  // Relationship to ProgramaMedida
  programa_medida?: ProgramaMedida;
};

/**
 * ProgramaMedida interface - represents the relationship between a program and measure
 */
export interface ProgramaMedida {
  id: number;
  programa: number;
  medida: number;
  resposta: number;
  justificativa: string;
  encaminhamento_interno: string;
  observacao_orgao: string;
  responsavel: number;
  previsao_inicio: Date;
  previsao_fim: Date;
  status_medida: number;
  status_plano_acao: number;
  nova_resposta: string;
}

/**
 * Responsavel interface - represents a responsible person
 */
export interface Responsavel {
  id: number;
  programa: number;
  departamento: string;
  email: string;
  nome: string;
}

/**
 * Resposta interface - represents an answer option
 */
export interface Resposta {
  id: number;
  peso: number | null;
  label: string;
}

/**
 * State interface - represents the application state
 */
export interface State {
  responsaveis: Responsavel[];
  programas: Programa[];
  diagnosticos: Diagnostico[];
  controles: { [key: string]: Controle[] };
  medidas: { [key: string]: Medida[] };
  medidas_programas: ProgramaMedida[];
  respostas: Resposta[];
}

/**
 * Action interface - represents a state action
 */
export interface Action {
  type: string;
  payload?: any;
  programaId?: number;
  diagnosticoId?: number;
  controleId?: number;
  programaControleId?: number;
  medidaId?: number;
  field?: string;
  value?: any;
}

/**
 * TextFieldsState interface - represents form text field states
 */
export interface TextFieldsState {
  justificativa: string;
  encaminhamento_interno: string;
  observacao_orgao: string;
  nova_resposta: string;
}

/**
 * MedidaTextField type - represents available text fields for measures
 */
export type MedidaTextField = keyof TextFieldsState;

/**
 * Tree node types for navigation
 */
export type NodeType = 'diagnostico' | 'controle' | 'medida';

/**
 * Navigation tree node interface
 */
export interface TreeNode {
  id: string;
  type: NodeType;
  data: any;
  children?: TreeNode[];
}

/**
 * Maturity calculation result
 */
export interface MaturityResult {
  score: number;
  label: string;
  level: number;
}

/**
 * Cache key for maturity calculations
 */
export type MaturityCacheKey = `controle-${number}` | `diagnostico-${number}` | `programa-${number}`;

/**
 * Loading states
 */
export interface LoadingState {
  diagnosticos: boolean;
  controles: boolean;
  medidas: boolean;
  responsaveis: boolean;
}