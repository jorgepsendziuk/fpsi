import { State, Controle, Medida, Resposta } from "./types";

export const maturidade = [
  { id: 1, min: 0, max: 0.29, label: "Inicial" },
  { id: 2, min: 0.3, max: 0.49, label: "Básico" },
  { id: 3, min: 0.5, max: 0.69, label: "Intermediário" },
  { id: 4, min: 0.7, max: 0.89, label: "Em Aprimoramento" },
  { id: 5, min: 0.9, max: 1, label: "Aprimorado" },
];

export const respostas = [
  { id: 1, peso: 1, label: "Adota em maior parte ou totalmente" },
  { id: 2, peso: 0.75, label: "Adota em menor parte" },
  { id: 3, peso: 0.5, label: "Adota parcialmente" },
  { id: 4, peso: 0.25, label: "Há decisão formal ou plano aprovado para implementar" },
  { id: 5, peso: 0, label: "A organização não adota essa medida" },
  { id: 6, peso: null, label: "Não se aplica" },
];

export const incc = [
  { id: 1, nivel: 0, indice: 0, label: "Ausência de capacidade para a implementação das medidas do controle, ou desconhecimento sobre o atendimento das medidas." },
  { id: 2, nivel: 1, indice: 20, label: "O controle atinge mais ou menos seu objetivo, por meio da aplicação de um conjunto incompleto de atividades que podem ser caracterizadas como iniciais ou intuitivas (pouco organizadas)." },
  { id: 3, nivel: 2, indice: 40, label: "O controle atinge seu objetivo por meio da aplicação de um conjunto básico, porém completo, de atividades que podem ser caracterizadas como realizadas." },
  { id: 4, nivel: 3, indice: 60, label: "O controle atinge seu objetivo de forma muito mais organizada utilizando os recursos organizacionais. Além disso, o controle é formalizado por meio de uma política institucional, específica ou como parte de outra maior." },
  { id: 5, nivel: 4, indice: 80, label: "O controle atinge seu objetivo, é bem definido e suas medidas são implementadas continuamente por meio de um processo decorrente da política formalizada." },
  { id: 6, nivel: 5, indice: 100, label: "O controle atinge seu objetivo, é bem definido, suas medidas são implementadas continuamente por meio de um processo e seu desempenho é mensurado quantitativamente por meio de indicadores." },
];

export const respostasimnao = [
  { id: 1, peso: 1, label: "Sim" },
  { id: 2, peso: 0, label: "Não" },
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

export const calculateSumOfResponses = (medidas: Medida[], diagnostico: number): number => {
  return medidas.reduce((sum, medida) => {
    if (medida.resposta === undefined || medida.resposta === null) return sum;

    let resposta: Resposta | undefined;
    const respostaId = typeof medida.resposta === 'string' ? parseInt(medida.resposta, 10) : medida.resposta;

    if (diagnostico === 1) {
      resposta = respostasimnao.find((resposta) => resposta.id === respostaId);
    } else if (diagnostico === 2 || diagnostico === 3) {
      resposta = respostas.find((resposta) => resposta.id === respostaId);
    }

    if (resposta?.peso === null) return sum;
    return sum + (resposta?.peso || 0);
  }, 0);
};

export const calculateSumOfResponsesForDiagnostico = (diagnosticoId: number, state: State): string | number => {
  const controles = state.controles[diagnosticoId] || [];
  const controleZero: Controle | undefined = controles.find((controle: Controle) => controle.numero === 0);
  const maturityIndexControleZero = controleZero ? parseFloat(calculateMaturityIndexForControle(controleZero, state)) : 0;

  if (diagnosticoId === 1) {
    return maturityIndexControleZero;
  } else if (diagnosticoId === 2 || diagnosticoId === 3) {
    const maturityIndices: number[] = controles
      .filter((controle: Controle) => controle.diagnostico === diagnosticoId)
      .map((controle: Controle) => parseFloat(calculateMaturityIndexForControle(controle, state)));

    const sumOfMaturityIndices = maturityIndices.reduce((sum, index) => sum + index, 0);
    const numberOfControles = maturityIndices.length;

    return numberOfControles > 0
      ? (
          ((maturityIndexControleZero * 4) + sumOfMaturityIndices) / numberOfControles
        ).toFixed(2)
      : 0;
  }
  return 0;
};

export const calculateMaturityIndexForControle = (controle: Controle, state: State): string => {
  const medidas = state.medidas[controle.id] || [];
  const sumOfResponses = calculateSumOfResponses(medidas, controle.diagnostico);
  const numberOfMedidas = medidas.filter(m => m.resposta !== undefined && m.resposta !== null).length;
  
  if (numberOfMedidas === 0) return "0";

  const baseIndex = sumOfResponses / numberOfMedidas;
  const inccMultiplier = 1 + (((incc.find((incc) => incc.id === controle.nivel)?.nivel || 0)) * 1 / 5);
  
  return ((baseIndex / 2) * inccMultiplier).toFixed(2);
};

export const getMaturityLabel = (indice: number): string => {
  const maturity = maturidade.find(m => indice >= m.min && indice <= m.max);
  return maturity ? maturity.label : "";
};
