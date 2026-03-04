import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";

const TIPOS_PAPEL = ["controlador", "contratante", "operador"] as const;

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
 * PATCH /api/programas/[id]/papel-lgpd/instituicao/[instId]
 * Atualiza instituição.
 * Body: { tipo_papel?, nome?, descricao?, contato?, email?, site?, ordem? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instId: string }> }
) {
  try {
    const { id, instId } = await params;
    const programaId = parseInt(id, 10);
    const instituicaoId = parseInt(instId, 10);
    if (isNaN(programaId) || isNaN(instituicaoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { tipo_papel, nome, descricao, contato, email, site, ordem } = body;

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

    const { data: existing } = await supabase
      .from("programa_papel_lgpd_instituicao")
      .select("id, programa_id")
      .eq("id", instituicaoId)
      .eq("programa_id", programaId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Instituição não encontrada" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (tipo_papel !== undefined) {
      if (!TIPOS_PAPEL.includes(tipo_papel)) {
        return NextResponse.json({ error: "tipo_papel inválido" }, { status: 400 });
      }
      updates.tipo_papel = tipo_papel;
    }
    if (nome !== undefined) updates.nome = String(nome).trim();
    if (descricao !== undefined) updates.descricao = descricao ? String(descricao).trim() : null;
    if (contato !== undefined) updates.contato = contato ? String(contato).trim() : null;
    if (email !== undefined) updates.email = email ? String(email).trim() : null;
    if (site !== undefined) updates.site = site ? String(site).trim() : null;
    if (ordem !== undefined) updates.ordem = typeof ordem === "number" ? ordem : 0;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("programa_papel_lgpd_instituicao")
      .update(updates)
      .eq("id", instituicaoId)
      .eq("programa_id", programaId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar instituição:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar instituição", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "update",
      resourceType: "papel_lgpd_instituicao",
      resourceId: instituicaoId,
      programaId,
      details: { fields: Object.keys(updates) },
      req: { headers: request.headers },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro PATCH instituição:", error);
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
 * DELETE /api/programas/[id]/papel-lgpd/instituicao/[instId]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; instId: string }> }
) {
  try {
    const { id, instId } = await params;
    const programaId = parseInt(id, 10);
    const instituicaoId = parseInt(instId, 10);
    if (isNaN(programaId) || isNaN(instituicaoId)) {
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
      .from("programa_papel_lgpd_instituicao")
      .delete()
      .eq("id", instituicaoId)
      .eq("programa_id", programaId);

    if (error) {
      console.error("Erro ao excluir instituição:", error);
      return NextResponse.json(
        { error: "Erro ao excluir instituição", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "delete",
      resourceType: "papel_lgpd_instituicao",
      resourceId: instituicaoId,
      programaId,
      req: { headers: request.headers },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro DELETE instituição:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
