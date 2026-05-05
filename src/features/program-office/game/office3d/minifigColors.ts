/** Paleta sóbria para camisas “aleatórias” mas estáveis por seed. */
const SHIRT_PALETTE = [
  "#3949ab",
  "#00897b",
  "#6d4c41",
  "#c62828",
  "#7b1fa2",
  "#1565c0",
  "#2e7d32",
  "#ef6c00",
  "#455a64",
  "#5e35b1",
  "#00695c",
  "#ad1457",
];

export function shirtColorFromSeed(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return SHIRT_PALETTE[Math.abs(h) % SHIRT_PALETTE.length]!;
}

const PANTS_PALETTE = ["#1b2838", "#263238", "#37474f", "#3e2723", "#212121", "#283593", "#004d40"];

export function pantsColorFromSeed(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return PANTS_PALETTE[Math.abs(h) % PANTS_PALETTE.length]!;
}
