/** Valores de `?aba=` na rota Estrutura de Governança (ordem = índice das Tabs). */
export const GOVERNANCA_ABA_QUERY = ["equipe", "si", "priva", "etir", "tratamento"] as const;

export type GovernancaAbaQuery = (typeof GOVERNANCA_ABA_QUERY)[number];

export function governancaAbaQueryFromIndex(index: number): GovernancaAbaQuery | null {
  if (index < 0 || index >= GOVERNANCA_ABA_QUERY.length) return null;
  return GOVERNANCA_ABA_QUERY[index];
}

export function governancaIndexFromQueryParam(raw: string | null): number | null {
  if (!raw) return null;
  const i = GOVERNANCA_ABA_QUERY.indexOf(raw.trim() as GovernancaAbaQuery);
  return i >= 0 ? i : null;
}

export function hrefEstruturaGovernanca(programaPathSegment: string, aba: GovernancaAbaQuery): string {
  return `/programas/${programaPathSegment}/responsabilidades?aba=${aba}`;
}
