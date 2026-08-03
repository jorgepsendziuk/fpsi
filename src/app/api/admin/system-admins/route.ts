import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin
    .from("profiles")
    .select("user_id, nome, email, is_system_admin, created_at")
    .eq("is_system_admin", true)
    .order("email");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(request: Request) {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await request.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const isSystemAdmin = body.is_system_admin === true;

  if (!email) {
    return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });

  const { data, error } = await admin
    .from("profiles")
    .update({ is_system_admin: isSystemAdmin, updated_at: new Date().toISOString() })
    .eq("email", email)
    .select("user_id, nome, email, is_system_admin")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  return NextResponse.json(data);
}
