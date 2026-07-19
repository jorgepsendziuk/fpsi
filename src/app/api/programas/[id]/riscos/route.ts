import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { calcularScoreRisco } from "@/lib/server/riscoScore";

async function assertMember(programaId: number) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };

  const { data: member } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();

  if (!member) return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  return { supabase, user };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await assertMember(programaId);
  if ("error" in auth && auth.error) return auth.error;

  const { data, error } = await auth.supabase!
    .from("programa_risco")
    .select("*")
    .eq("programa_id", programaId)
    .order("score_residual", { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await assertMember(programaId);
  if ("error" in auth && auth.error) return auth.error;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });

  const body = await request.json();
  const probabilidade = body.probabilidade || "medio";
  const impacto = body.impacto || "medio";
  const scoreInerente = calcularScoreRisco(probabilidade, impacto);
  const scoreResidual =
    body.score_residual != null ? Number(body.score_residual) : scoreInerente;

  const payload = {
    programa_id: programaId,
    titulo: String(body.titulo || "").trim(),
    descricao: body.descricao ? String(body.descricao).trim() : null,
    categoria: body.categoria || "privacidade",
    origem_tipo: body.origem_tipo || "manual",
    origem_id: body.origem_id ?? null,
    probabilidade,
    impacto,
    score_inerente: scoreInerente,
    score_residual: scoreResidual,
    status: body.status || "identificado",
    estrategia_mitigacao: body.estrategia_mitigacao || null,
    responsavel: body.responsavel || null,
    data_revisao: body.data_revisao || null,
  };

  if (!payload.titulo) {
    return NextResponse.json({ error: "titulo é obrigatório" }, { status: 400 });
  }

  const { data, error } = await admin.from("programa_risco").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
