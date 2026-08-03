import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin.from("medida").select("*").eq("id", id).single();
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

  const update: Record<string, unknown> = {};
  if (body.id_medida != null) update.id_medida = body.id_medida;
  if (body.id_controle != null) update.id_controle = Number(body.id_controle);
  if (body.id_cisv8 != null) update.id_cisv8 = body.id_cisv8;
  if (body.grupo_imple != null) update.grupo_imple = body.grupo_imple;
  if (body.funcao_nist_csf != null) update.funcao_nist_csf = body.funcao_nist_csf;
  if (body.medida != null) update.medida = body.medida;
  if (body.descricao != null) update.descricao = body.descricao;

  const { data, error } = await admin.from("medida").update(update).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { error } = await admin.from("medida").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
