/** Metade do escritório principal (plano XZ). */
export const WORLD_HALF = 5;

/** Sala de setor menor. */
export const SECTOR_HALF = 3;

/** Metade da largura útil do corredor no eixo X (alinhado à abertura sul da sala). */
export const CORRIDOR_HALF_WIDTH = 1.12;

/** Meia-largura da abertura na parede sul (ligeiramente maior que o corredor). */
export function mainSouthOpeningHalf(corridorHalf: number): number {
  return corridorHalf + 0.1;
}

/** Comprimento do corredor + alas (eixo Z), alinhado a `MainOfficeAnnexPlan`. */
export const ANNEX_CORRIDOR_LEN = 11.8;
/** Folga entre parede sul da sala principal e início do piso do anexo. */
export const ANNEX_START_GAP = 0.2;

/** Centro mundial Z do corredor/anexo (grupo do anexo posicionado aqui). */
export function annexCorridorWorldZCenter(hw: number): number {
  return hw + ANNEX_START_GAP + ANNEX_CORRIDOR_LEN / 2;
}
