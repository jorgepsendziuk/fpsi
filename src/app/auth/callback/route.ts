import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/**
 * Troca o `code` do fluxo OAuth/PKCE por sessão (cookies).
 * Sem esta rota, o redirect direto para /dashboard competia com o layout protegido
 * e a sessão podia não ser aplicada a tempo (login Google “não funciona”).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"), "/dashboard");
  const err = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (err) {
    const login = new URL("/login", url.origin);
    login.searchParams.set("error", "oauth");
    login.searchParams.set("error_description", err);
    return NextResponse.redirect(login);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert(
          {
            user_id: user.id,
            email: user.email,
            verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
