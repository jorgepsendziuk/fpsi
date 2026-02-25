import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

async function isCreator(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, programaId: number, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("user_id")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.user_id === userId;
}

/**
 * DELETE /api/programas/[id]
 * Query ?permanent=1 ou ?permanent=true → exclusão definitiva (apenas criador, requer service role).
 * Sem query → soft delete: marca programa como excluído (lixeira). Apenas criador.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true" || searchParams.get("permanent") === "1";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const creator = await isCreator(supabase, programaId, user.id);
    const { data: programa } = await supabase.from("programa").select("id, deleted_at").eq("id", programaId).maybeSingle();
    if (!programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    if (!creator) {
      return NextResponse.json(
        { error: "Apenas o criador do programa pode excluí-lo ou restaurá-lo" },
        { status: 403 }
      );
    }

    if (permanent) {
      const admin = createSupabaseAdminClient();
      if (!admin) {
        return NextResponse.json(
          { error: "Serviço indisponível para exclusão definitiva. Configure SUPABASE_SERVICE_ROLE_KEY." },
          { status: 503 }
        );
      }
      const { error: deleteError } = await admin.from("programa").delete().eq("id", programaId);
      if (deleteError) {
        console.error("Erro ao excluir programa (definitivo):", deleteError);
        return NextResponse.json(
          { error: "Erro ao excluir programa", details: deleteError.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: "Programa excluído definitivamente" });
    }

    // Soft delete: marcar como excluído (lixeira)
    const { error: updateError } = await supabase
      .from("programa")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", programaId);

    if (updateError) {
      console.error("Erro ao mover programa para lixeira:", updateError);
      return NextResponse.json(
        { error: "Erro ao excluir programa", details: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Programa movido para a lixeira" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API DELETE programa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/programas/[id]
 * Body: { restore: true } → restaura programa da lixeira (deleted_at = null). Apenas criador.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    if (body?.restore !== true) {
      return NextResponse.json({ error: "Use { restore: true } para restaurar" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const creator = await isCreator(supabase, programaId, user.id);
    if (!creator) {
      return NextResponse.json(
        { error: "Apenas o criador do programa pode restaurá-lo" },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("programa")
      .update({ deleted_at: null })
      .eq("id", programaId);

    if (updateError) {
      console.error("Erro ao restaurar programa:", updateError);
      return NextResponse.json(
        { error: "Erro ao restaurar programa", details: updateError.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Programa restaurado" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na API PATCH programa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: message },
      { status: 500 }
    );
  }
}
