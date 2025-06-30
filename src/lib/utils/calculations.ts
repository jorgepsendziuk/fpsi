import { State, Controle, ProgramaControle, ProgramaMedida } from '../types/types';
import { respostas, respostasimnao, incc } from './utils';

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
    // ✅ CORREÇÃO: Medidas não respondidas são consideradas como peso 0
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) {
      return sum + 0; // Contribui com 0 para o cálculo
    }

    let resposta: any;
    const respostaId = typeof programaMedida.resposta === 'string' ? parseInt(programaMedida.resposta, 10) : programaMedida.resposta;

    if (diagnostico === 1) {
      resposta = respostasimnao.find((resposta) => resposta.id === respostaId);
    } else if (diagnostico === 2 || diagnostico === 3) {
      resposta = respostas.find((resposta) => resposta.id === respostaId);
    }

    if (resposta?.peso === null) return sum; // "Não se aplica" continua sendo ignorado
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
  
  // ✅ CORREÇÃO: Usar total de medidas (incluindo não respondidas), excluindo apenas "Não se aplica"
  const totalMedidas = programaMedidas.filter((pm) => {
    // Excluir apenas medidas com resposta "Não se aplica" (id: 6)
    if (pm.resposta === 6) return false;
    return true; // Incluir todas as outras (respondidas e não respondidas)
  }).length;
  
  if (totalMedidas === 0) return "0.00";

  const baseIndex = sumOfResponses / totalMedidas;
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
    let totalMedidas = 0;

    medidas.forEach((medida: any) => {
      // ✅ CORREÇÃO: Incluir todas as medidas no denominador, exceto "Não se aplica"
      if (medida.resposta === 6) return; // Ignorar "Não se aplica"
      
      totalMedidas++; // Contar todas as medidas (respondidas e não respondidas)
      
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
        }
      }
      // Se não tem resposta, contribui com 0 (já incluído em totalMedidas)
    });

    return totalMedidas > 0 ? totalResponses / totalMedidas : 0;
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