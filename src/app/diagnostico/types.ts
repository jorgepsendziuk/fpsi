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
  programa_sgd_data_limite_retorno: Date;
  programa_sgd_retorno_data: Date;
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
  nivel: number;
}

export interface Medida {
  resposta: number;
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;
}
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
  programas: any[];
  diagnosticos: any[];
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