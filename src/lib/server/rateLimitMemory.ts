/** Limite simples em memória (instância do servidor). Não substitui rate limit de edge/CDN. */

const WINDOW_MS = 60 * 60 * 1000;

type Bucket = { at: number[] };

const buckets = new Map<string, Bucket>();

function prune(at: number[], now: number): number[] {
  return at.filter((t) => now - t < WINDOW_MS);
}

export function checkRateLimit(
  key: string,
  maxRequests: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    buckets.set(key, { at: [now] });
    return { ok: true };
  }
  b.at = prune(b.at, now);
  if (b.at.length >= maxRequests) {
    const oldest = b.at[0]!;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  b.at.push(now);
  return { ok: true };
}

/** Portal público: 30 req/h por IP+rota */
export const PORTAL_RATE_LIMIT_MAX = 30;
