/**
 * Enriquecimento do programa para cabeçalhos de PDF/print (DPO, etc.).
 */
import type { PoliticaProgramaDados } from "@/lib/utils/politicaPlaceholders";

export type ProgramaCabecalhoDpo = {
  dpo_nome?: string | null;
  dpo_email?: string | null;
};

/** Linhas extras do cabeçalho: DPO + e-mail. */
export function getCabecalhoLinhasDpo(programa: PoliticaProgramaDados): string[] {
  if (!programa || typeof programa !== "object") return [];
  const nome = String(programa.dpo_nome ?? "").trim();
  const email = String(programa.dpo_email ?? "").trim();
  const out: string[] = [];
  if (nome) out.push(`Encarregado (DPO): ${nome}`);
  else if (email) out.push("Encarregado (DPO)");
  if (email) out.push(`E-mail do encarregado: ${email}`);
  return out;
}

/**
 * Busca nome/e-mail do encarregado a partir de `encarregado_dados_pessoais`.
 * Aceita cliente browser ou server supabase-like.
 */
export async function enrichProgramaWithDpo(
  programa: Record<string, unknown> | null | undefined,
  fetchResponsavel: (id: number) => Promise<{ nome?: string | null; email?: string | null } | null>
): Promise<Record<string, unknown> | null> {
  if (!programa || typeof programa !== "object") return programa ?? null;
  const out = { ...programa };
  if (String(out.dpo_nome ?? "").trim()) return out;
  const encId = Number(out.encarregado_dados_pessoais);
  if (!Number.isFinite(encId) || encId <= 0) return out;
  try {
    const resp = await fetchResponsavel(encId);
    if (resp?.nome) out.dpo_nome = resp.nome;
    if (resp?.email) out.dpo_email = resp.email;
  } catch {
    /* ignore */
  }
  return out;
}
