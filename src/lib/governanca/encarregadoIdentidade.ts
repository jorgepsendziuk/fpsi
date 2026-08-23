/**
 * Identidade do encarregado (DPO) — pessoa natural ou jurídica.
 * Resolução CD/ANPD nº 18/2024, art. 12: o encarregado pode ser PF ou PJ;
 * se PJ, divulga-se o nome empresarial e a pessoa natural responsável
 * perante a ANPD e os titulares.
 */

export type TipoPessoaEncarregado = "pessoa_natural" | "pessoa_juridica";

export type EncarregadoIdentidade = {
  tipo_pessoa?: string | null;
  nome?: string | null;
  email?: string | null;
  razao_social?: string | null;
  cnpj?: string | null;
  pessoa_natural_responsavel_nome?: string | null;
  pessoa_natural_responsavel_email?: string | null;
};

export function isPessoaJuridicaEncarregado(
  row: EncarregadoIdentidade | null | undefined
): boolean {
  return String(row?.tipo_pessoa ?? "").trim() === "pessoa_juridica";
}

function trimStr(v: unknown): string {
  return v == null ? "" : String(v).trim();
}

/** Rótulo para selects de papéis (equipe). */
export function labelEncarregadoSelect(row: EncarregadoIdentidade & { nome?: string | null }): string {
  const nome = trimStr(row.nome) || "Sem nome";
  if (!isPessoaJuridicaEncarregado(row)) return nome;
  const pn = trimStr(row.pessoa_natural_responsavel_nome);
  return pn ? `${nome} (PJ) — resp.: ${pn}` : `${nome} (pessoa jurídica)`;
}

export type EncarregadoPublicoFormatado = {
  titulo: string;
  detalhe: string | null;
  email: string | null;
};

/**
 * Texto público (portal, políticas): PJ exige nome empresarial + pessoa natural (art. 12, II).
 */
export function formatEncarregadoPublico(
  row: EncarregadoIdentidade | null | undefined
): EncarregadoPublicoFormatado | null {
  if (!row) return null;
  const email = trimStr(row.email) || trimStr(row.pessoa_natural_responsavel_email) || null;
  if (isPessoaJuridicaEncarregado(row)) {
    const empresa = trimStr(row.razao_social) || trimStr(row.nome);
    const pn = trimStr(row.pessoa_natural_responsavel_nome);
    if (!empresa && !pn && !email) return null;
    const detalheParts = [
      pn ? `Pessoa natural responsável: ${pn}` : null,
      trimStr(row.cnpj) ? `CNPJ ${trimStr(row.cnpj)}` : null,
    ].filter(Boolean);
    return {
      titulo: empresa || "Encarregado (pessoa jurídica)",
      detalhe: detalheParts.length ? detalheParts.join(" · ") : "DPO as a Service (pessoa jurídica)",
      email,
    };
  }
  const nome = trimStr(row.nome);
  if (!nome && !email) return null;
  return { titulo: nome || "Encarregado", detalhe: null, email };
}
