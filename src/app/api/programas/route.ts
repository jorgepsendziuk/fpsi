import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/programas
 * Retorna os programas em que o usuário está em programa_users (status accepted).
 * Query: ?excluidos=1 ou ?excluidos=true → apenas programas na lixeira (deleted_at preenchido).
 * Sem query → apenas programas ativos (deleted_at nulo).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const excluidos = searchParams.get("excluidos") === "true" || searchParams.get("excluidos") === "1";

    const { data: programaUsers, error: puError } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (puError) {
      console.error("Erro ao buscar programa_users:", puError);
      return NextResponse.json(
        { error: "Erro ao buscar programas", details: puError.message },
        { status: 500 }
      );
    }

    const programaIds = (programaUsers || []).map((r: { programa_id: number }) => r.programa_id);
    if (programaIds.length === 0) {
      return NextResponse.json([]);
    }

    let query = supabase
      .from("programa")
      .select("*")
      .in("id", programaIds)
      .order("id", { ascending: true });

    if (excluidos) {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
    }

    const { data: programas, error: progError } = await query;

    if (progError) {
      console.error("Erro ao buscar programa:", progError);
      return NextResponse.json(
        { error: "Erro ao buscar programas", details: progError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(programas || []);
  } catch (error) {
    console.error("Erro na API de programas (GET):", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
