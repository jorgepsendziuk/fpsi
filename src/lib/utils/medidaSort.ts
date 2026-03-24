/**
 * Ordena identificadores de medida no padrão do framework (ex.: "19.1", "19.2", "19.10"),
 * em ordem numérica por segmento — não na ordem lexicográfica do banco (`19.10` antes de `19.2`).
 */
export function compareIdMedida(
  a: string | null | undefined,
  b: string | null | undefined
): number {
  const sa = String(a ?? "").trim();
  const sb = String(b ?? "").trim();
  return sa.localeCompare(sb, "pt-BR", { numeric: true, sensitivity: "base" });
}

export function sortMedidasByIdMedida<T extends { id_medida?: string | null; id?: number }>(
  items: T[]
): T[] {
  return [...items].sort((x, y) => {
    const c = compareIdMedida(x.id_medida, y.id_medida);
    if (c !== 0) return c;
    return (x.id ?? 0) - (y.id ?? 0);
  });
}
