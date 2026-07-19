import { checkRateLimit } from "@/lib/server/rateLimitMemory";

const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * @returns ok true se dentro do limite; caso contrário retryAfterSec estimado
 */
export function checkAiSuggestRateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  return checkRateLimit(key, MAX_REQUESTS_PER_WINDOW);
}
