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
  programa: number;
  numero: number;
  nome: string;
  nivel: number;
}

export type Medida = {
  // Read-only fields
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
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
  numero: number;
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
  medidaId?: number;
  field?: string;
  value?: any;
}