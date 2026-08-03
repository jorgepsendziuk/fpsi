import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";
import {
  buildEscopoFromPreset,
  detectPresetFromEscopo,
  normalizeEscopo,
  type PerfilEscopoPreset,
  type ProgramaEscopoV1,
} from "@/lib/programa/perfilEscopo";
import { canEditProgramaEscopo } from "@/lib/programa/programaEscopoAccess";

async function isProgramaMember(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  programaId: number,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("programa_users")
    .select("id, permissions")
    .eq("programa_id", programaId)
    .eq("user_id", userId)
    .eq("status", "accepted")
    .maybeSingle();
  return !!data;
}

/**
 * GET /api/programas/[id]/escopo
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
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
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { data: programa, error } = await supabase
      .from("programa")
      .select("perfil_escopo, gi_alvo, escopo")
      .eq("id", programaId)
      .maybeSingle();

    if (error || !programa) {
      return NextResponse.json({ error: "Programa não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      perfil_escopo: programa.perfil_escopo ?? "completo",
      gi_alvo: programa.gi_alvo ?? null,
      escopo: normalizeEscopo(programa.escopo),
    });
  } catch (err) {
    console.error("GET escopo:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

type PatchBody = {
  perfil_escopo?: PerfilEscopoPreset;
  gi_alvo?: "G1" | "G2" | "G3" | null;
  escopo?: ProgramaEscopoV1;
  aplicar_preset?: Exclude<PerfilEscopoPreset, "custom">;
};

/**
 * PATCH /api/programas/[id]/escopo
 * Aplica preset ou escopo customizado.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
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

    const canEdit = await canEditProgramaEscopo(supabase, programaId, user.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Sem permissão para alterar escopo" }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as PatchBody;
    let update: Record<string, unknown> = {};

    if (body.aplicar_preset) {
      const built = buildEscopoFromPreset(body.aplicar_preset);
      update = {
        perfil_escopo: built.perfil_escopo,
        gi_alvo: built.gi_alvo,
        escopo: built.escopo,
      };
    } else if (body.escopo) {
      const escopo = normalizeEscopo(body.escopo);
      update = {
        perfil_escopo: body.perfil_escopo ?? detectPresetFromEscopo(escopo),
        gi_alvo: body.gi_alvo !== undefined ? body.gi_alvo : undefined,
        escopo,
      };
      if (update.gi_alvo === undefined) delete update.gi_alvo;
    } else if (body.perfil_escopo && body.perfil_escopo !== "custom") {
      const built = buildEscopoFromPreset(body.perfil_escopo);
      update = {
        perfil_escopo: built.perfil_escopo,
        gi_alvo: built.gi_alvo,
        escopo: built.escopo,
      };
    } else {
      return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("programa")
      .update(update)
      .eq("id", programaId)
      .select("perfil_escopo, gi_alvo, escopo")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity(supabase, {
      userId: user.id,
      action: "update",
      resourceType: "programa",
      resourceId: programaId,
      programaId,
      details: { field: "escopo", perfil_escopo: data.perfil_escopo },
      req: { headers: request.headers },
    });

    return NextResponse.json({
      perfil_escopo: data.perfil_escopo,
      gi_alvo: data.gi_alvo,
      escopo: normalizeEscopo(data.escopo),
    });
  } catch (err) {
    console.error("PATCH escopo:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
