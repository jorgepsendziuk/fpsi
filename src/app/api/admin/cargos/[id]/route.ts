import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

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
  if (body.nome != null) update.nome = String(body.nome).trim();
  if (body.ativo != null) update.ativo = Boolean(body.ativo);

  const { data, error } = await admin.from("cargo").update(update).eq("id", id).select().single();
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

  const { error } = await admin.from("cargo").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
