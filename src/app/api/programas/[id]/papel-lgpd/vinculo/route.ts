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
 * POST /api/programas/[id]/papel-lgpd/vinculo
 * Cria novo vínculo.
 * Body: { instituicao_origem_id, instituicao_destino_id?, destino_tipo_papel?, tipo_vinculo, ordem? }
 */
export async function POST(
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
    const { instituicao_origem_id, instituicao_destino_id, destino_tipo_papel, tipo_vinculo, ordem } = body;

    if (!instituicao_origem_id) {
      return NextResponse.json({ error: "instituicao_origem_id é obrigatório" }, { status: 400 });
    }
    if (!tipo_vinculo || typeof tipo_vinculo !== "string" || !tipo_vinculo.trim()) {
      return NextResponse.json({ error: "tipo_vinculo é obrigatório" }, { status: 400 });
    }
    if (!instituicao_destino_id && !destino_tipo_papel) {
      return NextResponse.json({ error: "Informe instituicao_destino_id ou destino_tipo_papel" }, { status: 400 });
    }
    if (instituicao_destino_id && destino_tipo_papel) {
      return NextResponse.json({ error: "Use apenas instituicao_destino_id ou destino_tipo_papel" }, { status: 400 });
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

    const { data: inserted, error } = await supabase
      .from("programa_papel_lgpd_vinculo")
      .insert({
        programa_id: programaId,
        instituicao_origem_id: Number(instituicao_origem_id),
        instituicao_destino_id: instituicao_destino_id ? Number(instituicao_destino_id) : null,
        destino_tipo_papel: destino_tipo_papel || null,
        tipo_vinculo: String(tipo_vinculo).trim(),
        ordem: typeof ordem === "number" ? ordem : 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar vínculo:", error);
      return NextResponse.json(
        { error: "Erro ao criar vínculo", details: error.message },
        { status: 500 }
      );
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "create",
      resourceType: "papel_lgpd_vinculo",
      resourceId: inserted.id,
      programaId,
      details: { tipo_vinculo: inserted.tipo_vinculo },
      req: { headers: request.headers },
    });

    return NextResponse.json(inserted);
  } catch (error) {
    console.error("Erro POST vínculo:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
