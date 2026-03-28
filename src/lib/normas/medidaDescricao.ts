/**
 * Separa o texto orientativo da medida do bloco "Normas de referência:",
 * como armazenado no catálogo (descrição vinda do guia PPSI).
 */
export function splitMedidaDescricao(descricao: string): {
  textoOrientativo: string;
  normasReferencia: string | null;
} {
  if (!descricao || typeof descricao !== "string") {
    return { textoOrientativo: "", normasReferencia: null };
  }
  const re = /\n\s*Normas de referência:\s*/i;
  const idx = descricao.search(re);
  if (idx === -1) {
    return { textoOrientativo: descricao.trim(), normasReferencia: null };
  }
  const textoOrientativo = descricao.slice(0, idx).trim();
  const rest = descricao.slice(idx).replace(/^\s*\n*\s*Normas de referência:\s*/i, "").trim();
  const normas =
    rest && !/^não identificada\.?$/i.test(rest) ? rest.replace(/\s+$/, "") : null;
  return { textoOrientativo, normasReferencia: normas };
}
