import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

async function isProgramaMember(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, programaId: number, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return !!data;
}

/**
 * GET /api/programas/[id]/papel-lgpd
 * Lista instituições e vínculos dos papéis LGPD do programa.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const member = await isProgramaMember(supabase, programaId, user.id);
    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const { data: instituicoes, error: errInst } = await supabase
      .from("programa_papel_lgpd_instituicao")
      .select("*")
      .eq("programa_id", programaId)
      .order("tipo_papel")
      .order("ordem");

    if (errInst) {
      console.error("Erro ao listar instituições:", errInst);
      return NextResponse.json(
        { error: "Erro ao listar instituições", details: errInst.message },
        { status: 500 }
      );
    }

    const { data: vinculos, error: errVin } = await supabase
      .from("programa_papel_lgpd_vinculo")
      .select("*")
      .eq("programa_id", programaId)
      .order("ordem");

    if (errVin) {
      console.error("Erro ao listar vínculos:", errVin);
      return NextResponse.json(
        { error: "Erro ao listar vínculos", details: errVin.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      instituicoes: instituicoes || [],
      vinculos: vinculos || [],
    });
  } catch (error) {
    console.error("Erro GET papel-lgpd:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
