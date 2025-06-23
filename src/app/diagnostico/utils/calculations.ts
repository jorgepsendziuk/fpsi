import { State, Controle, ProgramaControle, ProgramaMedida } from '../types';
import { respostas, respostasimnao, incc } from '../utils';

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

/**
 * Calcula a soma das respostas ponderadas para um conjunto de medidas
 * @param programaMedidas Array de medidas com respostas
 * @param diagnostico ID do diagnóstico (determina qual conjunto de respostas usar)
 * @returns Soma ponderada das respostas
 */
export const calculateSumOfResponses = (programaMedidas: ProgramaMedida[], diagnostico: number): number => {
  return programaMedidas.reduce((sum, programaMedida) => {
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) return sum;

    let resposta: any;
    const respostaId = typeof programaMedida.resposta === 'string' ? parseInt(programaMedida.resposta, 10) : programaMedida.resposta;

    if (diagnostico === 1) {
      resposta = respostasimnao.find((resposta) => resposta.id === respostaId);
    } else if (diagnostico === 2 || diagnostico === 3) {
      resposta = respostas.find((resposta) => resposta.id === respostaId);
    }

    if (resposta?.peso === null) return sum;
    return sum + (resposta?.peso || 0);
  }, 0);
};

/**
 * FÓRMULA CORRETA DE CÁLCULO DE MATURIDADE DO CONTROLE
 * 
 * Fórmula: ((média_respostas_ponderadas / 2) * multiplicador_incc)
 * 
 * Onde:
 * - média_respostas_ponderadas = soma dos pesos das respostas / número de medidas
 * - multiplicador_incc = 1 + (nível_incc * 1 / 5)
 * 
 * @param controle Dados do controle
 * @param programaControle Dados do programa_controle (contém nível INCC)
 * @param programaMedidas Array de medidas com respostas do programa
 * @returns Índice de maturidade como string formatada
 */
export const calculateMaturityIndexForControle = (
  controle: Controle, 
  programaControle: ProgramaControle, 
  programaMedidas: ProgramaMedida[]
): string => {
  const sumOfResponses = calculateSumOfResponses(programaMedidas, controle.diagnostico);
  const numberOfMedidas = programaMedidas.filter((pm) => pm.resposta !== undefined && pm.resposta !== null).length;
  
  if (numberOfMedidas === 0) return "0.00";

  const baseIndex = sumOfResponses / numberOfMedidas;
  const inccLevel = incc.find((incc) => incc.id === programaControle.nivel);
  const inccMultiplier = 1 + ((inccLevel?.nivel || 0) * 1 / 5);
  
  const finalScore = (baseIndex / 2) * inccMultiplier;
  
  return finalScore.toFixed(2);
};

/**
 * Versão simplificada para compatibilidade com a interface atual
 * Tenta extrair os dados necessários do state para usar a fórmula correta
 */
export const calculateMaturityIndex = (controle: Controle, state: State): number => {
  const medidas = state.medidas?.[controle.id] || [];
  
  if (medidas.length === 0) {
    return 0;
  }

  // Tentar construir programaMedidas a partir dos dados disponíveis
  const programaMedidas: ProgramaMedida[] = medidas
    .filter((medida: any) => medida.programa_medida)
    .map((medida: any) => medida.programa_medida as ProgramaMedida);

  if (programaMedidas.length === 0) {
    // Fallback para dados sem programa_medida
    let totalResponses = 0;
    let responseCount = 0;

    medidas.forEach((medida: any) => {
      if (medida.resposta && typeof medida.resposta === 'number') {
        // Buscar o peso correto da resposta
        let resposta: any;
        if (controle.diagnostico === 1) {
          resposta = respostasimnao.find((r) => r.id === medida.resposta);
        } else {
          resposta = respostas.find((r) => r.id === medida.resposta);
        }
        
        if (resposta && resposta.peso !== null) {
          totalResponses += resposta.peso;
          responseCount++;
        }
      }
    });

    return responseCount > 0 ? totalResponses / responseCount : 0;
  }

  // Usar a fórmula correta se temos os dados necessários
  const programaControle: ProgramaControle = {
    id: (controle as any).programa_controle_id || 0,
    programa: (controle as any).programa || 0,
    controle: controle.id,
    nivel: (controle as any).nivel || 1
  };

  const result = calculateMaturityIndexForControle(controle, programaControle, programaMedidas);
  return parseFloat(result);
}; 