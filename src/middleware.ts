import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SKIP_SESSION_PREFIXES = [
  "/demo",
  "/api",
  "/auth",
  "/setup",
  "/linkedin",
  "/divulgacao",
  "/educacao",
  "/auditor",
  "/_next",
] as const;

const SKIP_SESSION_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/setup",
  "/linkedin",
  "/programas/demo",
  "/programas/1",
  "/privacidade",
  "/sobre",
  "/gestao",
  "/artigo",
  "/offline",
  "/sw.js",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

function shouldSkipSession(path: string): boolean {
  if (SKIP_SESSION_EXACT.has(path)) return true;
  return SKIP_SESSION_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("-auth-token"));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Confirmação de e-mail / magic link do Supabase cai em Site URL (?code=...).
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && !path.startsWith("/auth/callback") && !path.startsWith("/api")) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    return NextResponse.redirect(callback);
  }

  // Página pública ou visitante sem sessão: não chama o Auth (evita 504 se o Supabase falhar).
  if (shouldSkipSession(path) || !hasSupabaseAuthCookie(request)) {
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch (e) {
    console.error("[middleware] updateSession:", e);
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ico_p|logo_p|sw\\.js|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
