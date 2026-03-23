import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { computePlanoAcaoResumo } from "@/lib/server/planoAcaoResumo";

/**
 * GET /api/programas/[id]/planos-acao/resumo
 * Retorna contagens agregadas para o Plano de Trabalho (lazy load).
 * Usado para os cards de resumo sem carregar todas as medidas.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
    if (isNaN(programaId) || programaId <= 0) {
      return NextResponse.json({ error: "ID do programa inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { data: member } = await supabase
      .from("programa_users")
      .select("id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const { data, error } = await computePlanoAcaoResumo(supabase, programaId);
    if (error) {
      console.error("Erro ao buscar programa_medida:", error);
      return NextResponse.json(
        { error: "Erro ao carregar resumo", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Erro em planos-acao/resumo:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
