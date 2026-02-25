import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * PATCH /api/programas/[id]/pedidos-titulares/[pedidoId]
 * Atualiza pedido. Requer usuário em programa_users (accepted).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pedidoId: string }> }
) {
  try {
    const { id, pedidoId } = await params;
    const programaId = parseInt(id, 10);
    const pid = parseInt(pedidoId, 10);
    if (isNaN(programaId) || isNaN(pid)) {
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

    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const body = await request.json();
    const allowed = [
      "tipo",
      "nome_titular",
      "email_titular",
      "documento_titular",
      "descricao_pedido",
      "status",
      "data_prazo_resposta",
      "data_resposta",
      "observacoes_internas",
    ];
    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) {
        const v = body[key];
        if (v === null || v === undefined) payload[key] = null;
        else payload[key] = typeof v === "string" ? v.trim() : v;
      }
    }

    const { data, error } = await supabase
      .from("pedido_titular")
      .update(payload)
      .eq("id", pid)
      .eq("programa_id", programaId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar pedido:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar pedido", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro PATCH pedidos-titulares:", error);
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
 * DELETE /api/programas/[id]/pedidos-titulares/[pedidoId]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; pedidoId: string }> }
) {
  try {
    const { id, pedidoId } = await params;
    const programaId = parseInt(id, 10);
    const pid = parseInt(pedidoId, 10);
    if (isNaN(programaId) || isNaN(pid)) {
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

    const { data: member } = await supabase
      .from("programa_users")
      .select("programa_id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    const { error } = await supabase
      .from("pedido_titular")
      .delete()
      .eq("id", pid)
      .eq("programa_id", programaId);

    if (error) {
      console.error("Erro ao excluir pedido:", error);
      return NextResponse.json(
        { error: "Erro ao excluir pedido", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro DELETE pedidos-titulares:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
