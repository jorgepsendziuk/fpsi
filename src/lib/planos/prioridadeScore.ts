/** Score de priorização do plano: criticidade × esforço × impacto. */

export type ImpactoNegocio = "muito_baixo" | "baixo" | "medio" | "alto" | "muito_alto";

const IMPACTO_SCORE: Record<ImpactoNegocio, number> = {
  muito_baixo: 1,
  baixo: 2,
  medio: 3,
  alto: 4,
  muito_alto: 5,
};

/** GI1 = menos esforço (quick win), GI3 = mais esforço */
export function esforcoFromGrupoImple(grupo: string | null | undefined): number {
  const g = (grupo || "").toUpperCase().replace(/\s/g, "");
  if (g.includes("G1") || g === "1") return 1;
  if (g.includes("G2") || g === "2") return 2;
  if (g.includes("G3") || g === "3") return 3;
  return 2;
}

/**
 * Criticidade 1–5 a partir de resposta (peso) e flag de prioridade manual.
 * Respostas PPSI: pesos altos = mais maduro; ausência/baixa = gap.
 */
export function criticidadeFromResposta(
  resposta: unknown,
  prioridadeManual?: boolean,
  temRiscoAberto?: boolean
): number {
  let base = 3;
  if (resposta == null || resposta === "") {
    base = 4;
  } else {
    const n = typeof resposta === "number" ? resposta : Number(resposta);
    // Escala 1–6: 1 = adota totalmente (baixo gap), 5/6 = não adota / NSA
    if (n === 1) base = 1;
    else if (n === 2) base = 2;
    else if (n === 3) base = 3;
    else if (n === 4) base = 4;
    else if (n === 5 || n === 6) base = 5;
    else if (n === 0) base = 4; // sim/não "não"
  }
  if (prioridadeManual) base = Math.min(5, base + 1);
  if (temRiscoAberto) base = Math.min(5, base + 1);
  return base;
}

export function impactoScore(impacto: ImpactoNegocio | string | null | undefined): number {
  const key = (impacto || "medio") as ImpactoNegocio;
  return IMPACTO_SCORE[key] ?? 3;
}

/**
 * Score composto (maior = fazer antes).
 * criticidade * impacto / esforço  → quick wins (alto impacto, baixo esforço) sobem.
 */
export function scorePrioridade(opts: {
  resposta: unknown;
  prioridade?: boolean;
  grupoImple?: string | null;
  impactoNegocio?: string | null;
  temRiscoAberto?: boolean;
}): { score: number; criticidade: number; esforco: number; impacto: number } {
  const criticidade = criticidadeFromResposta(opts.resposta, opts.prioridade, opts.temRiscoAberto);
  const esforco = esforcoFromGrupoImple(opts.grupoImple);
  const impacto = impactoScore(opts.impactoNegocio);
  const score = Math.round(((criticidade * impacto) / esforco) * 10) / 10;
  return { score, criticidade, esforco, impacto };
}

export function isGapMedida(resposta: unknown, statusPlano?: number | null): boolean {
  if (resposta == null || resposta === "") return true;
  const n = typeof resposta === "number" ? resposta : Number(resposta);
  if (Number.isFinite(n) && n >= 3 && n !== 6) return true; // parcial / não adota (6 = NSA)
  if (statusPlano === 5) return true; // atrasado
  return false;
}
