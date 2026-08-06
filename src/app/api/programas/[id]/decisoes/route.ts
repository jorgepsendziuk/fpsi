import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

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
      .from("decision_record")
      .select("*")
      .eq("programa_id", programaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ decisoes: data || [] });
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
      .from("decision_record")
      .insert({
        programa_id: programaId,
        titulo,
        contexto: body.contexto ?? "",
        problema: body.problema ?? "",
        alternativas: body.alternativas ?? "",
        decisao: body.decisao ?? "",
        justificativa: body.justificativa ?? "",
        responsaveis: body.responsaveis ?? "",
        data_decisao: body.data_decisao ?? null,
        status: body.status ?? "rascunho",
        created_by: user.id,
      })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ decisao: data }, { status: 201 });
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
    const { supabase } = auth;
    const body = await request.json();
    const decisionId = Number(body.id);
    if (Number.isNaN(decisionId)) {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of [
      "titulo",
      "contexto",
      "problema",
      "alternativas",
      "decisao",
      "justificativa",
      "responsaveis",
      "data_decisao",
      "status",
    ]) {
      if (body[k] !== undefined) patch[k] = body[k];
    }
    const { data, error } = await supabase
      .from("decision_record")
      .update(patch)
      .eq("programa_id", programaId)
      .eq("id", decisionId)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ decisao: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
