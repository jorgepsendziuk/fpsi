/**
 * Tema visual da “sala” — paleta escritório / casual game.
 * Mantido na feature para remoção fácil.
 */
export const GAME_SCENE = {
  wall: "linear-gradient(180deg, #e8e0d5 0%, #ddd4c8 55%, #cfc4b6 100%)",
  floor: `
    repeating-linear-gradient(
      90deg,
      rgba(93, 64, 55, 0.08) 0px,
      rgba(93, 64, 55, 0.08) 2px,
      transparent 2px,
      transparent 48px
    ),
    linear-gradient(180deg, #c9b18d 0%, #a1887f 45%, #8d6e63 100%)
  `,
  table: "linear-gradient(145deg, #4e342e 0%, #3e2723 55%, #5d4037 100%)",
  frame: "4px solid #5d4037",
  frameInner: "inset 0 0 0 2px rgba(255,255,255,0.35)",
  shadowDeep: "0 18px 40px rgba(30, 20, 10, 0.35)",
  shadowLift: "0 8px 24px rgba(0,0,0,0.22)",
} as const;

/** Moldura “cartucho RPG” em volta da cena inteira. */
export const GAME_RPG_FRAME = {
  border: "4px solid #16213e",
  boxShadow:
    "inset 2px 2px 0 rgba(255,255,255,0.12), 4px 4px 0 #0f0f0f, 0 0 0 1px #000",
} as const;

export const GAME_Z = {
  floor: 0,
  furniture: 1,
  seat: 2,
  paper: 3,
  hud: 4,
} as const;
