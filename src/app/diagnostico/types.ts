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

export interface ProgramaControle {
  id?: number;
  programa: number;
  controle: number;
  nivel?: number;
}

export type Medida = {
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;
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
  programa_medida?: ProgramaMedida;
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
  status_medida: number;
  status_plano_acao: number;
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