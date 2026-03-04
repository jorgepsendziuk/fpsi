import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip auth para rotas que não precisam
  const path = request.nextUrl.pathname;
  if (path.startsWith('/demo') || path.startsWith('/api') || path.startsWith('/auth') ||
      path === '/login' || path === '/register' || path === '/forgot-password') {
    return NextResponse.next();
  }
  if (path === '/programas/demo' || path === '/programas/1') {
    return NextResponse.next();
  }

  const result = await updateSession(request);
  return result;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|ico_p|logo_p|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
