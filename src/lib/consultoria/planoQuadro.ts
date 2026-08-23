/** Quadro de planos para o DPO/consultor (sem timesheet). */

export type PlanoQuadroItem = {
  id: number;
  titulo: string;
  status: string;
  data_fim_prevista?: string | null;
  prioridade?: string | null;
};

export const QUADRO_COLUNAS = [
  { id: "a_fazer", label: "A fazer", statuses: ["rascunho", "nao_iniciado"] },
  { id: "andamento", label: "Em andamento", statuses: ["em_andamento", "em_revisao", "aprovado"] },
  { id: "atrasado", label: "Atrasado", statuses: ["atrasado"] },
  { id: "concluido", label: "Concluído", statuses: ["concluido"] },
] as const;

export type QuadroColunaId = (typeof QUADRO_COLUNAS)[number]["id"];

export function colunaDoStatus(status: string, dataFim?: string | null, hoje = new Date()): QuadroColunaId {
  const st = String(status || "");
  if (st === "cancelado") return "concluido";
  if (st === "atrasado") return "atrasado";
  if (st === "concluido") return "concluido";
  if (dataFim) {
    const d = new Date(dataFim);
    const h = new Date(hoje);
    h.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    if (!Number.isNaN(d.getTime()) && d < h && st !== "concluido") return "atrasado";
  }
  for (const col of QUADRO_COLUNAS) {
    if ((col.statuses as readonly string[]).includes(st)) return col.id;
  }
  return "a_fazer";
}

export function agruparQuadro(planos: PlanoQuadroItem[], hoje = new Date()) {
  const buckets: Record<QuadroColunaId, PlanoQuadroItem[]> = {
    a_fazer: [],
    andamento: [],
    atrasado: [],
    concluido: [],
  };
  for (const p of planos) {
    buckets[colunaDoStatus(p.status, p.data_fim_prevista, hoje)].push(p);
  }
  return buckets;
}
