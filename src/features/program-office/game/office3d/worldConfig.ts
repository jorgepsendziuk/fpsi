/** Metade do escritório principal (plano XZ). */
export const WORLD_HALF = 5;

/** Sala de setor menor. */
export const SECTOR_HALF = 3;

/** Metade da largura do corredor central no anexo (salas alternam esquerda/direita). */
export const CORRIDOR_HALF_WIDTH = 1.12;

/** Meia-largura da abertura na parede sul (ligeiramente maior que o corredor). */
export function mainSouthOpeningHalf(corridorHalf: number): number {
  return corridorHalf + 0.1;
}

/** Largura útil de cada ala (sala quadrada cabe aqui). */
export function annexWingWidth(hw: number = WORLD_HALF): number {
  return hw - CORRIDOR_HALF_WIDTH;
}

export type AnnexSectorSide = "west" | "east";

/** Salas alternam: índice par → leste, ímpar → oeste. */
export function annexSectorSide(deptIndex: number): AnnexSectorSide {
  return deptIndex % 2 === 0 ? "east" : "west";
}

export function annexWingCenterX(side: AnnexSectorSide, hw: number = WORLD_HALF): number {
  const ch = CORRIDOR_HALF_WIDTH;
  return side === "west" ? (ch - hw) / 2 : (ch + hw) / 2;
}

/** Face da porta no corredor (coordenada X mundial relativa ao grupo do anexo). */
export function annexSectorDoorX(deptIndex: number, hw: number = WORLD_HALF): number {
  const ch = CORRIDOR_HALF_WIDTH;
  return annexSectorSide(deptIndex) === "east" ? ch - 0.05 : -ch + 0.05;
}

/** Comprimento do anexo (eixo Z). */
export const ANNEX_CORRIDOR_LEN = 10.8;
export const ANNEX_START_GAP = 0.2;

export function annexCorridorWorldZCenter(hw: number): number {
  return hw + ANNEX_START_GAP + ANNEX_CORRIDOR_LEN / 2;
}

/** Lado S e centros Z de salas quadradas ao longo do corredor. */
export function annexSquareRoomSlots(nRooms: number, len: number = ANNEX_CORRIDOR_LEN, hw: number = WORLD_HALF) {
  const wingW = annexWingWidth(hw);
  const zPad = 0.42;
  const usableZ = len - 2 * zPad;
  const n = Math.max(nRooms, 1);
  const size = Math.min(wingW - 0.08, (usableZ / n) * 0.94);
  const sizeClamped = Math.max(2.0, Math.min(size, wingW - 0.06));
  const gap = n > 0 ? (usableZ - size * n) / (n + 1) : 0;
  const centers: number[] = [];
  for (let i = 0; i < n; i++) {
    const cz = -len / 2 + zPad + gap * (i + 1) + size * (i + 0.5);
    centers.push(cz);
  }
  return { size: sizeClamped, centers, wingW };
}
