import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";
import { parseProgramaId, requireProgramaMember } from "@/lib/educacao/acesso";
import { carregarEstado, podeGerirEducacao } from "@/lib/educacao/servico";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseProgramaId(id);
    if (programaId === null) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const auth = await requireProgramaMember(programaId);
    if ("error" in auth && auth.error) return auth.error;
    const estado = await carregarEstado(
      auth.supabase,
      programaId,
      auth.user.id,
      podeGerirEducacao(auth.role),
      createSupabaseAdminClient()
    );
    return NextResponse.json(estado);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
