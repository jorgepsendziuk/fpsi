import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const controleId = searchParams.get("controle_id");
  const q = searchParams.get("q")?.trim();

  let query = admin
    .from("medida")
    .select("id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao")
    .order("id_controle")
    .order("id_medida");

  if (controleId) query = query.eq("id_controle", controleId);
  if (q) query = query.or(`medida.ilike.%${q}%,id_medida.ilike.%${q}%,descricao.ilike.%${q}%`);

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
    .from("medida")
    .insert({
      id_medida: body.id_medida ?? null,
      id_controle: body.id_controle != null ? Number(body.id_controle) : null,
      id_cisv8: body.id_cisv8 ?? null,
      grupo_imple: body.grupo_imple ?? null,
      funcao_nist_csf: body.funcao_nist_csf ?? null,
      medida: body.medida ?? null,
      descricao: body.descricao ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
