export type XzRect = { minX: number; maxX: number; minZ: number; maxZ: number };

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function resolveCircleXzRect(px: number, pz: number, r: number, rect: XzRect): { x: number; z: number } {
  const cx = clamp(px, rect.minX, rect.maxX);
  const cz = clamp(pz, rect.minZ, rect.maxZ);
  const dx = px - cx;
  const dz = pz - cz;
  const dist = Math.hypot(dx, dz);
  if (dist >= r || dist < 1e-6) return { x: px, z: pz };
  const push = (r - dist) / dist;
  return { x: px + dx * push, z: pz + dz * push };
}

export function resolveCircleAllXz(
  px: number,
  pz: number,
  r: number,
  rects: XzRect[],
): { x: number; z: number } {
  let p = { x: px, z: pz };
  for (let i = 0; i < 7; i++) {
    for (const rect of rects) {
      const q = resolveCircleXzRect(p.x, p.z, r, rect);
      p = q;
    }
  }
  return p;
}
