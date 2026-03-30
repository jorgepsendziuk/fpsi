/**
 * Tipos e utilitários da árvore LGPD.
 * A estrutura (capítulos/seções/artigos) vem de `arvore` em `lgpd_artigos.json`,
 * gerada por `scripts/extract_lgpd_artigos.py` a partir do HTML do Planalto.
 */

import { normalizeLgpdQuery } from "@/lib/normas/lgpdTextSearch";
export type LgpdOutlineEntry = {
  id: string;
  titulo: string;
  artigos?: readonly number[];
  filhos?: readonly LgpdOutlineEntry[];
};

function pruneNode(node: LgpdOutlineEntry, numeros: ReadonlySet<number>): LgpdOutlineEntry | null {
  const arts = (node.artigos ?? []).filter((n) => numeros.has(n));
  const filhosRaw = node.filhos?.map((f) => pruneNode(f, numeros)).filter((x): x is LgpdOutlineEntry => x !== null) ?? [];
  if (filhosRaw.length === 0 && arts.length === 0) return null;
  return {
    ...node,
    ...(arts.length ? { artigos: arts } : {}),
    ...(filhosRaw.length ? { filhos: filhosRaw } : {}),
  };
}

/** Remove ramos vazios e artigos que não existem no JSON carregado. */
export function pruneLgpdOutline(
  outline: readonly LgpdOutlineEntry[],
  numeros: ReadonlySet<number>,
): LgpdOutlineEntry[] {
  return outline.map((n) => pruneNode(n, numeros)).filter((x): x is LgpdOutlineEntry => x !== null);
}

export type FilterLgpdOutlineOptions = {
  /** Artigos cujo corpo (texto) contém a query — vindos de `collectArtigosNumerosMatchingBody`. */
  bodyMatchingNumeros?: ReadonlySet<number>;
};

function filterNode(
  node: LgpdOutlineEntry,
  q: string,
  bodyMatch: ReadonlySet<number>,
): LgpdOutlineEntry | null {
  if (!q) return node;
  const filteredFilhos =
    node.filhos?.map((f) => filterNode(f, q, bodyMatch)).filter((x): x is LgpdOutlineEntry => x !== null) ??
    [];
  const matchedArts = (node.artigos ?? []).filter(
    (n) =>
      normalizeLgpdQuery(String(n)).includes(q) ||
      normalizeLgpdQuery(`artigo ${n}`).includes(q) ||
      bodyMatch.has(n),
  );
  const titleHit = normalizeLgpdQuery(node.titulo ?? "").includes(q);

  if (filteredFilhos.length > 0) {
    return {
      ...node,
      filhos: filteredFilhos,
      ...(matchedArts.length ? { artigos: matchedArts } : {}),
    };
  }
  if (matchedArts.length > 0) return { ...node, artigos: matchedArts };
  if (titleHit && node.filhos?.length) {
    const full = node.filhos
      .map((f) => filterNode(f, "", bodyMatch))
      .filter((x): x is LgpdOutlineEntry => x !== null);
    return full.length ? { ...node, filhos: full } : null;
  }
  if (titleHit && (node.artigos?.length ?? 0) > 0) return node;
  return null;
}

/**
 * Filtra por texto: número do artigo, trecho do título da árvore e/ou corpo do artigo
 * (`bodyMatchingNumeros`). `outline` já deve estar podado.
 */
export function filterLgpdOutlineByQuery(
  outline: readonly LgpdOutlineEntry[],
  query: string,
  options?: FilterLgpdOutlineOptions,
): LgpdOutlineEntry[] {
  const q = normalizeLgpdQuery(query);
  if (!q) return [...outline];
  const bodyMatch = options?.bodyMatchingNumeros ?? new Set<number>();
  return outline
    .map((n) => filterNode(n, q, bodyMatch))
    .filter((x): x is LgpdOutlineEntry => x !== null);
}

/** Coleta ids de nós expansíveis (filhos e/ou artigos listados na árvore). */
export function collectExpandableIds(nodes: readonly LgpdOutlineEntry[]): string[] {
  const ids: string[] = [];
  const walk = (list: readonly LgpdOutlineEntry[]) => {
    for (const n of list) {
      const hasFilhos = (n.filhos?.length ?? 0) > 0;
      const hasArts = (n.artigos?.length ?? 0) > 0;
      if (hasFilhos || hasArts) {
        ids.push(n.id);
        if (hasFilhos) walk(n.filhos!);
      }
    }
  };
  walk(nodes);
  return ids;
}

/** Só capítulos (ou nós raiz) que têm seções — estado inicial da árvore. */
export function collectRootExpandableIds(nodes: readonly LgpdOutlineEntry[]): string[] {
  return nodes.filter((n) => (n.filhos?.length ?? 0) > 0).map((n) => n.id);
}

/** Ids dos nós com filhos no caminho até o artigo, para expandir a árvore no item atual. */
export function collectAncestorIdsForArtigo(nodes: readonly LgpdOutlineEntry[], artigo: number): string[] {
  const findPath = (list: readonly LgpdOutlineEntry[], ancestors: string[]): string[] | null => {
    for (const n of list) {
      if (n.artigos?.includes(artigo)) return ancestors;
      if (n.filhos?.length) {
        const inner = findPath(n.filhos, [...ancestors, n.id]);
        if (inner !== null) return inner;
      }
    }
    return null;
  };
  return findPath(nodes, []) ?? [];
}
