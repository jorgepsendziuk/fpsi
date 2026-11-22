import { State, Controle, ProgramaControle, ProgramaMedida } from '../types/types';
import { calculateNacFromMedidas, getPesoNim, parseRespostaId } from './ppsiScoring';

export const calculateSumOfResponsesForDiagnostico = (diagnosticoId: number, state: State): number => {
  const controles = state.controles?.[diagnosticoId] || [];
  
  if (controles.length === 0) {
    return 0;
  }

  let sum = 0;
  controles.forEach((controle: any) => {
    if (controle.nac && typeof controle.nac === 'number') {
      sum += controle.nac;
    }
  });

  return sum;
};

export const calculateSumOfResponses = (programaMedidas: ProgramaMedida[], diagnostico: number): number => {
  return programaMedidas.reduce((sum, programaMedida) => {
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) {
      return sum;
    }

    const respostaId = parseRespostaId(programaMedida.resposta);
    const peso = getPesoNim(respostaId, diagnostico);
    if (peso === null) return sum;
    return sum + peso;
  }, 0);
};

/** NAC do controle: média NIM das medidas aplicáveis. */
export const calculateMaturityIndexForControle = (
  controle: Controle, 
  _programaControle: ProgramaControle, 
  programaMedidas: ProgramaMedida[]
): string => {
  const { nac } = calculateNacFromMedidas(
    programaMedidas,
    controle.diagnostico,
    (pm) => pm.resposta
  );
  return nac.toFixed(2);
};

export const calculateMaturityIndex = (controle: Controle, state: State): number => {
  const medidas = state.medidas?.[controle.id] || [];
  
  if (medidas.length === 0) {
    return 0;
  }

  const programaMedidas: ProgramaMedida[] = medidas
    .filter((medida: any) => medida.programa_medida)
    .map((medida: any) => medida.programa_medida as ProgramaMedida);

  if (programaMedidas.length > 0) {
    const programaControle: ProgramaControle = {
      id: (controle as any).programa_controle_id || 0,
      programa: (controle as any).programa || 0,
      controle: controle.id,
      nivel: (controle as any).nivel || 1
    };

    const result = calculateMaturityIndexForControle(controle, programaControle, programaMedidas);
    return parseFloat(result);
  }

  const { nac } = calculateNacFromMedidas(
    medidas,
    controle.diagnostico,
    (m: any) => m.resposta
  );
  return nac;
}; 