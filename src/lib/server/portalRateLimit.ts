import type { NextRequest } from "next/server";
import { checkRateLimit, PORTAL_RATE_LIMIT_MAX } from "@/lib/server/rateLimitMemory";

export function checkPortalRateLimit(
  request: NextRequest,
  routeKey: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";
  return checkRateLimit(`portal:${routeKey}:${ip}`, PORTAL_RATE_LIMIT_MAX);
}
