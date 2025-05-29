import { State, Controle } from '../types';

export const calculateSumOfResponsesForDiagnostico = (diagnosticoId: number, state: State): number => {
  const controles = state.controles?.[diagnosticoId] || [];
  
  if (controles.length === 0) {
    return 0;
  }

  // Calculate sum based on controles data
  let sum = 0;
  controles.forEach((controle: any) => {
    if (controle.incc && typeof controle.incc === 'number') {
      sum += controle.incc;
    }
  });

  return sum;
};

export const calculateMaturityIndex = (controle: Controle, state: State): number => {
  // Calculate maturity index for a specific controle
  const medidas = state.medidas?.[controle.id] || [];
  
  if (medidas.length === 0) {
    return 0;
  }

  let totalResponses = 0;
  let responseCount = 0;

  medidas.forEach((medida: any) => {
    if (medida.resposta && typeof medida.resposta === 'number') {
      totalResponses += medida.resposta;
      responseCount++;
    }
  });

  return responseCount > 0 ? totalResponses / responseCount : 0;
};

export const calculateMaturityIndexForControle = (controle: Controle, state: any): number => {
  // Alternative implementation for compatibility
  return calculateMaturityIndex(controle, state);
}; 