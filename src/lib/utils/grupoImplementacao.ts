/** Filtro global do diagnóstico por grupo de implementação (planilha oficial). */
export type GrupoImpleFilter = "all" | "G1" | "G2" | "G3";

export function matchesGrupoFilter(
  grupo_imple: string | undefined | null,
  filter: GrupoImpleFilter
): boolean {
  if (filter === "all") return true;
  const g = (grupo_imple ?? "").trim().toUpperCase();
  return g === filter;
}
