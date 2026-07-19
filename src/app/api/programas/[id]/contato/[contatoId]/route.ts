import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createSupabaseAdminClient } from "@/utils/supabase/admin";

const STATUS_VALIDOS = new Set([
  "novo",
  "em_triagem",
  "em_atendimento",
  "respondido",
  "encerrado",
  "arquivado",
]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contatoId: string }> }
) {
  const { id, contatoId } = await params;
  const programaId = parseInt(id, 10);
  const cid = parseInt(contatoId, 10);
  if (isNaN(programaId) || isNaN(cid)) {
    return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: member } = await supabase
    .from("programa_users")
    .select("id")
    .eq("programa_id", programaId)
    .eq("user_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (body.status !== undefined) {
    if (!STATUS_VALIDOS.has(body.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.observacoes_internas !== undefined) {
    patch.observacoes_internas = body.observacoes_internas;
  }
  if (body.responsavel_user_id !== undefined) {
    patch.responsavel_user_id = body.responsavel_user_id;
  }

  const admin = createSupabaseAdminClient();
  const client = admin || supabase;
  const { data, error } = await client
    .from("programa_contato")
    .update(patch)
    .eq("id", cid)
    .eq("programa_id", programaId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
