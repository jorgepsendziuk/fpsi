import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { logActivity } from "@/lib/services/auditService";

async function requireMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) } as const;
  }
  const { data } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!data) {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) } as const;
  }
  return { supabase, user } as const;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase } = auth;

    const { data, error } = await supabase
      .from("plano_acao")
      .select("*")
      .eq("programa_id", programaId)
      .neq("status", "cancelado")
      .order("data_fim_prevista", { ascending: true, nullsFirst: false });
    if (error) throw error;
    return NextResponse.json({ planos: data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase, user } = auth;
    const body = await request.json();
    const titulo = String(body.titulo || "").trim();
    if (!titulo) {
      return NextResponse.json({ error: "título obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("plano_acao")
      .insert({
        programa_id: programaId,
        programa_medida_id: body.programa_medida_id ?? null,
        risco_id: body.risco_id ?? null,
        titulo,
        descricao: body.descricao ?? "",
        prioridade: body.prioridade ?? "media",
        status: body.status ?? "nao_iniciado",
        data_inicio: body.data_inicio ?? null,
        data_fim_prevista: body.data_fim_prevista ?? null,
        responsavel: body.responsavel ?? "",
        progresso_percentual: body.progresso_percentual ?? 0,
        workflow_estado: body.workflow_estado ?? "rascunho",
        created_by: user.id,
      })
      .select("*")
      .single();
    if (error) throw error;

    await supabase.from("workflow_evento").insert({
      programa_id: programaId,
      alvo_tipo: "plano_acao",
      alvo_id: String(data.id),
      de_estado: null,
      para_estado: data.workflow_estado,
      comentario: "Criação",
      ator_user_id: user.id,
    });

    await logActivity(supabase, {
      userId: user.id,
      action: "create",
      resourceType: "plano_acao",
      resourceId: data.id,
      programaId,
      details: { titulo },
      req: { headers: request.headers },
    });

    return NextResponse.json({ plano: data }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(id, 10);
    if (Number.isNaN(programaId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const { supabase, user } = auth;
    const body = await request.json();
    const planoId = Number(body.id);
    if (Number.isNaN(planoId)) {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    const { data: prev } = await supabase
      .from("plano_acao")
      .select("workflow_estado, status")
      .eq("id", planoId)
      .eq("programa_id", programaId)
      .maybeSingle();

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of [
      "titulo",
      "descricao",
      "prioridade",
      "status",
      "data_inicio",
      "data_fim_prevista",
      "data_fim_real",
      "responsavel",
      "progresso_percentual",
      "workflow_estado",
      "programa_medida_id",
      "risco_id",
    ]) {
      if (body[k] !== undefined) patch[k] = body[k];
    }

    const { data, error } = await supabase
      .from("plano_acao")
      .update(patch)
      .eq("programa_id", programaId)
      .eq("id", planoId)
      .select("*")
      .single();
    if (error) throw error;

    if (
      body.workflow_estado &&
      prev &&
      body.workflow_estado !== prev.workflow_estado
    ) {
      await supabase.from("workflow_evento").insert({
        programa_id: programaId,
        alvo_tipo: "plano_acao",
        alvo_id: String(planoId),
        de_estado: prev.workflow_estado,
        para_estado: body.workflow_estado,
        comentario: body.comentario_workflow ?? "",
        ator_user_id: user.id,
      });
    }

    return NextResponse.json({ plano: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
