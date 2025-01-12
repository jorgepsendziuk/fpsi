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
  id: number;
  id_medida: string;
  id_controle: number;
  id_cisv8: string;
  grupo_imple: string;
  funcao_nist_csf: string;
  medida: string;
  descricao: string;
  resposta: number;
  justificativa: string;
  prazo: string;
}

export interface Resposta {
  id: number;
  peso: number | null;
  label: string;
}

export interface State {
  diagnosticos: Diagnostico[];
  controles: { [key: number]: Controle[] };
  medidas: { [key: number]: Medida[] };
  respostas: Resposta[];
}

export interface Action {
  type: string;
  payload?: any;
  diagnosticoId?: number;
  controleId?: number;
  medidaId?: number;
  field?: string;
  value?: any;
}

export const initialState: State = {
  diagnosticos: [],
  controles: {},
  medidas: {},
  respostas: [],
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_DIAGNOSTICOS":
      return { ...state, diagnosticos: action.payload };
    case "SET_CONTROLES":
      return {
        ...state,
        controles: {
          ...state.controles,
          [action.diagnosticoId!]: action.payload,
        },
      };
    case "SET_MEDIDAS":
      return {
        ...state,
        medidas: { ...state.medidas, [action.controleId!]: action.payload },
      };
    case "SET_RESPOSTAS":
      return { ...state, respostas: action.payload };
    case "UPDATE_MEDIDA":
      return {
        ...state,
        medidas: {
          ...state.medidas,
          [action.controleId!]: state.medidas[action.controleId!].map((medida) =>
            medida.id === action.medidaId
              ? { ...medida, [action.field!]: action.value }
              : medida
          ),
        },
      };
    case "UPDATE_CONTROLE":
      return {
        ...state,
        controles: {
          ...state.controles,
          [action.diagnosticoId!]: state.controles[action.diagnosticoId!].map((controle) =>
            controle.id === action.controleId
              ? { ...controle, [action.field!]: action.value }
              : controle
          ),
        },
      };
    default:
      return state;
  }
}
