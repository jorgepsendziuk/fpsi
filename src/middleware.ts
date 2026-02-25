import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Allow access to demo routes without authentication
  if (request.nextUrl.pathname.startsWith('/demo')) {
    return NextResponse.next();
  }
  // Permitir /programas/demo e /programas/1 para acesso ao programa demo (com ou sem auth)
  if (request.nextUrl.pathname === '/programas/demo' || request.nextUrl.pathname === '/programas/1') {
    return NextResponse.next();
  }
  
  const result = await updateSession(request);
  return result;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
