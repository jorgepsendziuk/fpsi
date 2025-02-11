import { Action, State } from "./types";

export const initialState: State = {
  programas: [],
  diagnosticos: [],
  controles: {},
  medidas: {},
  medidas_programas: [],
  respostas: [],
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_PROGRAMAS":
      return { ...state, programas: action.payload };
    case "SET_DIAGNOSTICOS":
      return { ...state, diagnosticos: action.payload };
    case "SET_CONTROLES":
      return {
        ...state,
        controles: { ...state.controles, [action.diagnosticoId!]: action.payload },
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
          [action.controleId!]: state.medidas[action.controleId!].map((medida: any) =>
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
          [action.diagnosticoId!]: state.controles[action.diagnosticoId!].map((controle: any) =>
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


