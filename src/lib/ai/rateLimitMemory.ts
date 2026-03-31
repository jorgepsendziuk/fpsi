/** Limite simples em memória (instância do servidor). Não substitui rate limit de edge/CDN. */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

type Bucket = { at: number[] };

const buckets = new Map<string, Bucket>();

function prune(at: number[], now: number): number[] {
  return at.filter((t) => now - t < WINDOW_MS);
}

/**
 * @returns ok true se dentro do limite; caso contrário retryAfterSec estimado
 */
export function checkAiSuggestRateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    buckets.set(key, { at: [now] });
    return { ok: true };
  }
  b.at = prune(b.at, now);
  if (b.at.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = b.at[0]!;
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  b.at.push(now);
  return { ok: true };
}
