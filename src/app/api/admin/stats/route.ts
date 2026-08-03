import { NextResponse } from "next/server";
import { requireSystemAdmin } from "@/lib/admin/requireSystemAdmin";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { getSetupStatus } from "@/lib/setup/setupStatus";

async function countTable(table: string): Promise<number | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { count, error } = await admin.from(table).select("*", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

export async function GET() {
  const { ok } = await requireSystemAdmin();
  if (!ok) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Configuração inválida" }, { status: 500 });
  }

  const [
    diagnosticos,
    controles,
    medidas,
    cargos,
    departamentos,
    politicaModelos,
    programas,
    profiles,
    systemAdmins,
    setup,
  ] = await Promise.all([
    countTable("diagnostico"),
    countTable("controle"),
    countTable("medida"),
    countTable("cargo"),
    countTable("departamento"),
    countTable("politica_modelo"),
    countTable("programa"),
    countTable("profiles"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_system_admin", true),
    getSetupStatus(),
  ]);

  return NextResponse.json({
    counts: {
      diagnosticos,
      controles,
      medidas,
      cargos,
      departamentos,
      politicaModelos,
      programas,
      profiles,
      systemAdmins: systemAdmins.count ?? 0,
    },
    setup,
  });
}
