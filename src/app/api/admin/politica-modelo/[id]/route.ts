import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

async function requireSystemAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_system_admin")
    .eq("user_id", user.id)
    .single();

  if (profile?.is_system_admin !== true) return { ok: false };
  return { ok: true };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin
    .from("politica_modelo")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.nome != null) update.nome = body.nome;
  if (body.descricao != null) update.descricao = body.descricao;
  if (body.cor != null) update.cor = body.cor;
  if (body.ordem != null) update.ordem = body.ordem;
  if (body.secoes != null) update.secoes = body.secoes;
  if (body.ativo != null) update.ativo = body.ativo;

  const { data, error } = await admin
    .from("politica_modelo")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
