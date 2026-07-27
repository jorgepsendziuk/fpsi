/**
 * Separa o texto orientativo da medida do bloco de referências,
 * como no catálogo PPSI ("Normas de referência:") ou AIGP ("Referências:").
 */
const BLOCO_REFS_RE = /\n\s*(?:Normas de referência|Referências):\s*/i;
const BLOCO_REFS_STRIP_RE = /^\s*\n*\s*(?:Normas de referência|Referências):\s*/i;

export function splitMedidaDescricao(descricao: string): {
  textoOrientativo: string;
  normasReferencia: string | null;
} {
  if (!descricao || typeof descricao !== "string") {
    return { textoOrientativo: "", normasReferencia: null };
  }
  const idx = descricao.search(BLOCO_REFS_RE);
  if (idx === -1) {
    return { textoOrientativo: descricao.trim(), normasReferencia: null };
  }
  const textoOrientativo = descricao.slice(0, idx).trim();
  const rest = descricao.slice(idx).replace(BLOCO_REFS_STRIP_RE, "").trim();
  const normas =
    rest && !/^não identificada\.?$/i.test(rest) ? rest.replace(/\s+$/, "") : null;
  return { textoOrientativo, normasReferencia: normas };
}
