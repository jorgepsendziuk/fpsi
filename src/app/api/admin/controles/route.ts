import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const diagnosticoId = searchParams.get("diagnostico_id");
  const q = searchParams.get("q")?.trim();

  let query = admin.from("controle").select("*").order("diagnostico").order("numero");

  if (diagnosticoId) query = query.eq("diagnostico", diagnosticoId);
  if (q) query = query.or(`nome.ilike.%${q}%,numero.eq.${Number(q) || -1}`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await request.json();
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin
    .from("controle")
    .insert({
      numero: body.numero != null ? Number(body.numero) : null,
      diagnostico: body.diagnostico != null ? Number(body.diagnostico) : null,
      nome: body.nome ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
