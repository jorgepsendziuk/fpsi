import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";

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
 * PATCH /api/programas/[id]/papel-lgpd/vinculo/[vinculoId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vinculoId: string }> }
) {
  try {
    const { id, vinculoId } = await params;
    const programaId = parseInt(id, 10);
    const vId = parseInt(vinculoId, 10);
    if (isNaN(programaId) || isNaN(vId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { instituicao_origem_id, instituicao_destino_id, destino_tipo_papel, tipo_vinculo, ordem } = body;

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

    const updates: Record<string, unknown> = {};
    if (instituicao_origem_id !== undefined) updates.instituicao_origem_id = Number(instituicao_origem_id);
    if (instituicao_destino_id !== undefined) updates.instituicao_destino_id = instituicao_destino_id ? Number(instituicao_destino_id) : null;
    if (destino_tipo_papel !== undefined) updates.destino_tipo_papel = destino_tipo_papel || null;
    if (tipo_vinculo !== undefined) updates.tipo_vinculo = String(tipo_vinculo).trim();
    if (ordem !== undefined) updates.ordem = typeof ordem === "number" ? ordem : 0;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("programa_papel_lgpd_vinculo")
      .update(updates)
      .eq("id", vId)
      .eq("programa_id", programaId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar vínculo:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar vínculo", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "update",
      resourceType: "papel_lgpd_vinculo",
      resourceId: vId,
      programaId,
      details: { fields: Object.keys(updates) },
      req: { headers: request.headers },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro PATCH vínculo:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/programas/[id]/papel-lgpd/vinculo/[vinculoId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vinculoId: string }> }
) {
  try {
    const { id, vinculoId } = await params;
    const programaId = parseInt(id, 10);
    const vId = parseInt(vinculoId, 10);
    if (isNaN(programaId) || isNaN(vId)) {
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

    const { error } = await supabase
      .from("programa_papel_lgpd_vinculo")
      .delete()
      .eq("id", vId)
      .eq("programa_id", programaId);

    if (error) {
      console.error("Erro ao excluir vínculo:", error);
      return NextResponse.json(
        { error: "Erro ao excluir vínculo", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "delete",
      resourceType: "papel_lgpd_vinculo",
      resourceId: vId,
      programaId,
      req: { headers: request.headers },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro DELETE vínculo:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
