import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

async function requireSystemAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: profile } = await supabase.from("profiles").select("is_system_admin").eq("user_id", user.id).single();
  if (profile?.is_system_admin !== true) return { ok: false };
  return { ok: true };
}

export async function GET(request: Request) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const controleId = searchParams.get("controle_id");

  let query = admin.from("medida").select("id, id_medida, id_controle, medida, descricao").order("id_controle").order("id_medida");

  if (controleId) query = query.eq("id_controle", controleId);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
