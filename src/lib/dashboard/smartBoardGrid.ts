/** Tamanho de coluna MUI (12-grid) para board programas+empresas. */
export type BoardItemSize = { xs: number; sm: number; md: number };

/**
 * Grade responsiva inteligente pelo total de cards:
 * - 1 → largura plena
 * - 2 (ex.: 1+1) → lado a lado
 * - 3 → três na mesma linha (md+)
 * - 4 (ex.: 2+2) → duas por linha
 * - 5–6 → até 3 por linha
 * - 7+ → até 4 por linha no desktop
 */
export function smartBoardItemSize(total: number): BoardItemSize {
  const n = Math.max(0, total);
  if (n <= 1) return { xs: 12, sm: 12, md: 12 };
  if (n === 2) return { xs: 12, sm: 6, md: 6 };
  if (n === 3) return { xs: 12, sm: 6, md: 4 };
  if (n === 4) return { xs: 12, sm: 6, md: 6 };
  if (n <= 6) return { xs: 12, sm: 6, md: 4 };
  return { xs: 12, sm: 6, md: 3 };
}
