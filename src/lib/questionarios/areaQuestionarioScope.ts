/** Seeds sugeridos de pacote de questionário por slug de área (editável na UI). */

export type AreaSeed = {
  slug: string;
  nome: string;
  descricao: string;
  /** Eixos do diagnóstico PPSI liberados no pacote inicial */
  diagnostico_ids: number[];
  modulos: string[];
};

export const AREA_SEEDS: AreaSeed[] = [
  {
    slug: "rh",
    nome: "RH / Pessoas",
    descricao: "Questionário focado em privacidade e tratamentos de dados de pessoas",
    diagnostico_ids: [3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "ti",
    nome: "TI / Tecnologia",
    descricao: "Questionário focado em segurança da informação e TIC",
    diagnostico_ids: [2],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "juridico",
    nome: "Jurídico / Compliance",
    descricao: "Estrutura de governança e privacidade",
    diagnostico_ids: [1, 3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "comercial",
    nome: "Comercial / Vendas",
    descricao: "Privacidade em relacionamento com clientes",
    diagnostico_ids: [3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "financeiro",
    nome: "Financeiro",
    descricao: "Tratamentos e controles de dados financeiros",
    diagnostico_ids: [3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "operacoes",
    nome: "Operações / Produção",
    descricao: "Controles operacionais de privacidade e SI",
    diagnostico_ids: [2, 3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "marketing",
    nome: "Marketing / Comunicação",
    descricao: "Privacidade em comunicação e marketing",
    diagnostico_ids: [3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "atendimento",
    nome: "Atendimento / Suporte",
    descricao: "Canal com titulares e tratamentos de atendimento",
    diagnostico_ids: [3],
    modulos: ["questionario", "kpis"],
  },
  {
    slug: "outro",
    nome: "Outro",
    descricao: "Área customizada — defina o escopo de controles",
    diagnostico_ids: [],
    modulos: ["questionario", "kpis"],
  },
];

export type AssignmentScope = {
  controle_ids?: number[];
  medida_ids?: number[];
  diagnostico_ids?: number[];
};

export async function resolveControleIdsFromEscopo(
  fetchControlesByDiagnostico: (diagIds: number[]) => Promise<number[]>,
  escopo: { diagnostico_ids?: number[]; controle_ids?: number[] }
): Promise<number[]> {
  const explicit = (escopo.controle_ids || []).filter((n) => Number.isFinite(n));
  if (explicit.length > 0) return Array.from(new Set(explicit));
  const diagIds = (escopo.diagnostico_ids || []).filter((n) => Number.isFinite(n));
  if (diagIds.length === 0) return [];
  return fetchControlesByDiagnostico(diagIds);
}

export function mergeAssignmentScopes(...scopes: AssignmentScope[]): AssignmentScope {
  const controle = new Set<number>();
  const medida = new Set<number>();
  const diag = new Set<number>();
  for (const s of scopes) {
    for (const id of s.controle_ids || []) controle.add(id);
    for (const id of s.medida_ids || []) medida.add(id);
    for (const id of s.diagnostico_ids || []) diag.add(id);
  }
  return {
    controle_ids: Array.from(controle),
    medida_ids: Array.from(medida),
    diagnostico_ids: Array.from(diag),
  };
}
