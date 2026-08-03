import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin
    .from("politica_modelo")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
