import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { calcularScoreRisco } from "@/lib/server/riscoScore";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; riscoId: string }> }
) {
  const { id, riscoId } = await params;
  const programaId = parseInt(id, 10);
  const rid = parseInt(riscoId, 10);
  if (isNaN(programaId) || isNaN(rid)) {
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: member } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });

  const body = await request.json();
  const patch: Record<string, unknown> = {};
  const fields = [
    "titulo",
    "descricao",
    "categoria",
    "origem_tipo",
    "origem_id",
    "probabilidade",
    "impacto",
    "status",
    "estrategia_mitigacao",
    "responsavel",
    "data_revisao",
    "score_residual",
  ] as const;
  for (const f of fields) {
    if (body[f] !== undefined) patch[f] = body[f];
  }

  if (body.probabilidade || body.impacto) {
    const { data: current } = await admin
      .from("programa_risco")
      .select("probabilidade, impacto")
      .eq("id", rid)
      .eq("programa_id", programaId)
      .maybeSingle();
    const p = (body.probabilidade as string) || current?.probabilidade || "medio";
    const i = (body.impacto as string) || current?.impacto || "medio";
    patch.score_inerente = calcularScoreRisco(p, i);
    if (body.score_residual === undefined) {
      patch.score_residual = patch.score_inerente;
    }
  }

  const { data, error } = await admin
    .from("programa_risco")
    .update(patch)
    .eq("id", rid)
    .eq("programa_id", programaId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; riscoId: string }> }
) {
  const { id, riscoId } = await params;
  const programaId = parseInt(id, 10);
  const rid = parseInt(riscoId, 10);
  if (isNaN(programaId) || isNaN(rid)) {
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: member } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });

  const { error } = await admin.from("programa_risco").delete().eq("id", rid).eq("programa_id", programaId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
