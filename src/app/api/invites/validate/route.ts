import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

async function getSupabaseClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return await createSupabaseServerClient();
}

// GET /api/invites/validate?token=xxx - Validar token e obter dados do convite
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
    }

    const supabase = await getSupabaseClient();

    const { data: invite, error } = await supabase
      .from("programa_invites")
      .select("id, email, role, programa_id, status, expires_at, message")
      .eq("token", token)
      .single();

    if (error || !invite) {
      return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 404 });
    }

    if (invite.status !== "pending") {
      return NextResponse.json({ error: "Convite já foi utilizado" }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json({ error: "Convite expirado" }, { status: 400 });
    }

    const { data: programa } = await supabase
      .from("programa")
      .select("nome_fantasia, razao_social")
      .eq("id", invite.programa_id)
      .single();

    let nome: string | undefined;
    if (invite.message) {
      try {
        const parsed = JSON.parse(invite.message) as { nome?: string };
        if (parsed?.nome) nome = parsed.nome;
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({
      ...invite,
      programaNome: programa?.nome_fantasia || programa?.razao_social || `Programa #${invite.programa_id}`,
      nome,
    });
  } catch (error) {
    console.error("Erro ao validar convite:", error);
    return NextResponse.json(
      { error: "Erro interno", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
