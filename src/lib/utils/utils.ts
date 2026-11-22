import { State, Controle, Medida, Resposta, ProgramaMedida, ProgramaControle } from "../types/types";
import { calculateNacFromMedidas } from "./ppsiScoring";

/** Faixas dos indicadores iBase / iSeg / iPriv (IN 4/2026, Tabela 6). */
export const maturidade = [
  { id: 1, min: 0, max: 0.299999, label: "Inicial" },
  { id: 2, min: 0.3, max: 0.599999, label: "Intermediário" },
  { id: 3, min: 0.6, max: 0.899999, label: "Em aprimoramento" },
  { id: 4, min: 0.9, max: 1, label: "Aprimorado" },
];

/** Níveis de implementação da medida (NIM) — Anexo II, Tabela 3 (gradual). IDs 1–5 preservados no banco. */
export const respostas = [
  {
    id: 1,
    peso: 0,
    label: "1 — Não adota ou há decisão formal",
    descricao:
      "A medida é aplicável, mas não é implementada ou existe apenas um planejamento ou decisão formal para implementá-la.",
  },
  {
    id: 2,
    peso: 0.25,
    label: "2 — Inicial",
    descricao: "A implementação da medida atende menos de 40% do seu propósito.",
  },
  {
    id: 3,
    peso: 0.5,
    label: "3 — Intermediário",
    descricao: "A implementação da medida atende entre 40% e 80% do seu propósito.",
  },
  {
    id: 4,
    peso: 0.75,
    label: "4 — Completo",
    descricao: "A implementação da medida atende mais de 80% do seu propósito.",
  },
  {
    id: 5,
    peso: 1,
    label: "5 — Aprimorado",
    descricao:
      "A implementação atende mais de 80% do propósito, com monitoramento e revisão sistemáticos, com base em métricas quantitativas.",
  },
  {
    id: 6,
    peso: null,
    label: "0 — Não se aplica",
    descricao:
      "A medida não se aplica. Registre a justificativa com base em análise de riscos, conforme orientação do PPSI 2.0.",
  },
];

export const incc = [
  { id: 1, nivel: 0, indice: 0, label: "Ausência de capacidade para a implementação das medidas do controle, ou desconhecimento sobre o atendimento das medidas." },
  { id: 2, nivel: 1, indice: 20, label: "O controle atinge mais ou menos seu objetivo, por meio da aplicação de um conjunto incompleto de atividades que podem ser caracterizadas como iniciais ou intuitivas (pouco organizadas)." },
  { id: 3, nivel: 2, indice: 40, label: "O controle atinge seu objetivo por meio da aplicação de um conjunto básico, porém completo, de atividades que podem ser caracterizadas como realizadas." },
  { id: 4, nivel: 3, indice: 60, label: "O controle atinge seu objetivo de forma muito mais organizada utilizando os recursos organizacionais. Além disso, o controle é formalizado por meio de uma política institucional, específica ou como parte de outra maior." },
  { id: 5, nivel: 4, indice: 80, label: "O controle atinge seu objetivo, é bem definido e suas medidas são implementadas continuamente por meio de um processo decorrente da política formalizada." },
  { id: 6, nivel: 5, indice: 100, label: "O controle atinge seu objetivo, é bem definido, suas medidas são implementadas continuamente por meio de um processo e seu desempenho é mensurado quantitativamente por meio de indicadores." },
];

/** NIM binário — Anexo II, Tabela 4 (segmento base). */
export const respostasimnao = [
  {
    id: 1,
    peso: 1,
    label: "Sim",
    descricao: "Medida integralmente implementada.",
  },
  {
    id: 2,
    peso: 0,
    label: "Não",
    descricao:
      "A medida é aplicável, mas não é implementada ou existe apenas planejamento ou decisão formal para implementá-la.",
  },
];

export const setor = [
  { id: 1, label: 'Público' },
  { id: 2, label: 'Privado' }
];

export const status_medida = [
  { id: 1, label: 'Finalizado' },
  { id: 2, label: 'Não Finalizado' }
];

export const status_plano_acao = [
  { id: 1, label: 'Datas inválidas', color: '#8ecae6' },
  { id: 2, label: 'Concluído', color: '#95d5b2' },
  { id: 3, label: 'Não iniciado', color: '#e9ecef' },
  { id: 4, label: 'Em andamento', color: '#ffdd94' },
  { id: 5, label: 'Atrasado', color: '#ffadad' }
];

export const calculateSumOfResponses = (programaMedidas: ProgramaMedida[], diagnostico: number): number => {
  return programaMedidas.reduce((sum, programaMedida) => {
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) return sum;

    let resposta: Resposta | undefined;
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

// Versão temporária simplificada - usar a versão em calculations.ts quando possível
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

// TODO: Esta função precisa ser refatorada para usar programaControle e programaMedidas
// export const calculateSumOfResponsesForDiagnostico = (diagnosticoId: number, state: State): string | number => {

export const calculateTotalPointsForMedidas = (programaMedidas: ProgramaMedida[]): number => {
  return programaMedidas.reduce((sum, programaMedida) => {
    if (programaMedida.resposta === undefined || programaMedida.resposta === null) return sum;

    const respostaId = typeof programaMedida.resposta === 'string' ? parseInt(programaMedida.resposta, 10) : programaMedida.resposta;

    let resposta: Resposta | undefined;
    if (respostaId === 1 || respostaId === 2 || respostaId === 3 || respostaId === 4 || respostaId === 5 || respostaId === 6) {
      resposta = respostas.find((resposta) => resposta.id === respostaId);
    } else if (respostaId === 7 || respostaId === 8) {
      resposta = respostasimnao.find((resposta) => resposta.id === respostaId);
    }

    if (resposta?.peso === null) return sum;
    return sum + (resposta?.peso || 0);
  }, 0);
};

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

export const getMaturityLabel = (indice: number): string => {
  const maturity = maturidade.find(m => indice >= m.min && indice <= m.max);
  return maturity ? maturity.label : "";
};
