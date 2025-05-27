import { DateTimeFieldOwnerState } from "@mui/x-date-pickers/DateTimeField/DateTimeField.types";

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
export interface Diagnostico {
  id: number;
  descricao: string;
  cor: string;
  indice: number;
  maturidade: number;
} 

export interface Controle {
  // Static fields from controle table
  id: number;
  diagnostico: number;
  numero: number;
  nome: string;
  texto?: string;
  por_que_implementar?: string;
  fique_atento?: string | null;
  aplicabilidade_privacidade?: string;

  // Dynamic fields from programa_controle table (optional when not joined)
  programa_controle_id?: number; // ID from programa_controle table for updates
  programa?: number;
  nivel?: number;
}

export interface ProgramaControle {
  id: number;
  programa: number;
  controle: number;
  nivel?: number;
}

export type Medida = {
  // Read-only fields
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  status_medida: number;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;

  // Editable fields
  resposta?: number;
  justificativa?: string;
  encaminhamento_interno?: string;
  observacao_orgao?: string;
  nova_resposta?: string;
  responsavel?: number;
  previsao_inicio?: string | null;
  previsao_fim?: string | null;
  status_plano_acao?: number;
};

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
  nova_resposta: string;
}

export interface Responsavel {
  id: number;
  programa: number;
  departamento: string;
  email: string ;
  nome: string;
}
export interface Resposta {
  id: number;
  peso: number | null;
  label: string;
}

export interface State {
  responsaveis: any;
  programas: Programa[];
  diagnosticos: Diagnostico[];
  controles: { [key: string]: any };
  medidas: { [key: string]: any };
  medidas_programas: any[];
  respostas: any[];
}

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

export interface TextFieldsState {
  justificativa: string;
  encaminhamento_interno: string;
  observacao_orgao: string;
  nova_resposta: string;
}

export type MedidaTextField = keyof TextFieldsState;