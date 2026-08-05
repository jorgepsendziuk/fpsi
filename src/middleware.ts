import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip auth para rotas que não precisam
  const path = request.nextUrl.pathname;

  // Confirmação de e-mail / magic link do Supabase cai em Site URL (?code=...).
  // Encaminha para a rota que troca o code por sessão.
  const authCode = request.nextUrl.searchParams.get("code");
  if (authCode && !path.startsWith("/auth/callback") && !path.startsWith("/api")) {
    const callback = request.nextUrl.clone();
    callback.pathname = "/auth/callback";
    return NextResponse.redirect(callback);
  }

  if (path.startsWith('/demo') || path.startsWith('/api') || path.startsWith('/auth') ||
      path === '/login' || path === '/register' || path === '/forgot-password' ||
      path === '/setup' || path.startsWith('/setup/') ||
      path === '/linkedin' || path.startsWith('/linkedin/')) {
    return NextResponse.next();
  }
  if (path === '/programas/demo' || path === '/programas/1') {
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
    "/((?!_next/static|_next/image|favicon.ico|ico_p|logo_p|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
