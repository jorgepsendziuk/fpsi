/** Ciclo de vida de fornecedor — PPSI Controle 15 / ISO 27002:2022 5.19–5.23 / LGPD art. 39. */

export const FORNECEDOR_TIPOS = [
  { id: "operador", label: "Operador" },
  { id: "controlador_conjunto", label: "Controlador conjunto" },
  { id: "suboperador", label: "Suboperador" },
  { id: "software", label: "Software / SaaS" },
  { id: "outro", label: "Outro" },
] as const;

export const FORNECEDOR_AVALIACAO = [
  { id: "pendente", label: "Pendente" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "aprovado", label: "Aprovado" },
  { id: "reprovado", label: "Reprovado" },
] as const;

export const FORNECEDOR_CRITICIDADE = [
  { id: "baixa", label: "Baixa" },
  { id: "media", label: "Média" },
  { id: "alta", label: "Alta" },
  { id: "critica", label: "Crítica" },
] as const;

export type DueDiligenceItem = {
  id: string;
  medida: string;
  texto: string;
};

/** Checklist operacional alinhado às medidas 15.x / 22.x (PPSI + ATPP). */
export const DUE_DILIGENCE_ITENS: DueDiligenceItem[] = [
  { id: "inventario", medida: "15.1", texto: "Fornecedor consta do inventário de provedores" },
  { id: "risco", medida: "15.3", texto: "Classificação de criticidade / risco registrada" },
  { id: "clausulas", medida: "15.4 / 22.1", texto: "Cláusulas LGPD e SI no contrato (art. 39)" },
  { id: "incidentes", medida: "22.2", texto: "Obrigação de comunicar incidentes ao controlador" },
  { id: "subop", medida: "22.3", texto: "Suboperadores identificados ou vedados contratualmente" },
  { id: "revisao", medida: "15.5", texto: "Revisão periódica agendada (no máximo anual)" },
  { id: "encerramento", medida: "15.6 / ISO 5.23", texto: "Plano de encerramento (contas, fluxos, descarte)" },
];

export function revisaoVencida(dataProxima: string | null | undefined, hoje = new Date()): boolean {
  if (!dataProxima) return true;
  const d = new Date(dataProxima);
  if (Number.isNaN(d.getTime())) return true;
  const h = new Date(hoje);
  h.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d < h;
}

export function proximaRevisaoAnual(ultima: string | null | undefined, hoje = new Date()): string {
  const base = ultima ? new Date(ultima) : new Date(hoje);
  if (Number.isNaN(base.getTime())) {
    const n = new Date(hoje);
    n.setFullYear(n.getFullYear() + 1);
    return n.toISOString().slice(0, 10);
  }
  base.setFullYear(base.getFullYear() + 1);
  return base.toISOString().slice(0, 10);
}

export function dueDiligenceProgresso(feitos: string[] | null | undefined): {
  feitos: number;
  total: number;
  percentual: number;
} {
  const set = new Set(feitos || []);
  const n = DUE_DILIGENCE_ITENS.filter((i) => set.has(i.id)).length;
  return {
    feitos: n,
    total: DUE_DILIGENCE_ITENS.length,
    percentual: Math.round((n / DUE_DILIGENCE_ITENS.length) * 100),
  };
}
