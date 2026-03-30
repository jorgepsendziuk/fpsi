/**
 * Busca textual no corpo dos artigos (JSON `artigos`), além de títulos/números na árvore.
 * Normalização: minúsculas, espaços colapsados e remoção de diacríticos (ação ≈ acao).
 */

const NBSP = /\u00a0/g;

/** Marcas combinantes Latinas (NFD) — evita `\p{M}` por compatibilidade com `target` TS antigo. */
const COMBINING_MARK_LATIN = /[\u0300-\u036f]/g;

/** Remove acentos e cedilhas para comparação insensível a diacríticos (pt-BR). */
export function foldLgpdDiacritics(s: string): string {
  return s.normalize("NFD").replace(COMBINING_MARK_LATIN, "");
}

/**
 * Query do utilizador pronta para `includes`: trim, minúsculas, espaços únicos, sem acentos.
 */
export function normalizeLgpdQuery(query: string): string {
  const collapsed = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!collapsed) return "";
  return foldLgpdDiacritics(collapsed);
}

/** Corpo do artigo: sem HTML, minúsculas, espaços colapsados, sem acentos. */
export function normalizeLgpdBodyForSearch(raw: string): string {
  let s = String(raw ?? "");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s.replace(NBSP, " ");
  s = s.replace(/\s+/g, " ").trim().toLowerCase();
  return foldLgpdDiacritics(s);
}

/** Números de artigo cujo texto (corpo) contém a query. */
export function collectArtigosNumerosMatchingBody(
  artigos: Readonly<Record<string, string>>,
  query: string,
): Set<number> {
  const q = normalizeLgpdQuery(query);
  const out = new Set<number>();
  if (!q) return out;
  for (const [k, v] of Object.entries(artigos)) {
    const n = parseInt(k, 10);
    if (Number.isNaN(n)) continue;
    if (normalizeLgpdBodyForSearch(v).includes(q)) out.add(n);
  }
  return out;
}
