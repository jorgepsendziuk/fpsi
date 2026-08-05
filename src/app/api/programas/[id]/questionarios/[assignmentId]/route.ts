import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assignmentId: string }> }
) {
  const { id, assignmentId: raw } = await params;
  const programaId = parseInt(id, 10);
  const assignmentId = parseInt(raw, 10);
  if (isNaN(programaId) || isNaN(assignmentId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;

  const { data: row } = await auth.supabase
    .from("questionario_assignment")
    .select("*")
    .eq("id", assignmentId)
    .eq("programa_id", programaId)
    .maybeSingle();

  if (!row) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const isOwner = row.assignee_user_id === auth.user.id;
  if (!isOwner && auth.access.mode !== "full") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const body = await request.json();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status && ["pending", "in_progress", "done", "cancelled"].includes(body.status)) {
    update.status = body.status;
  }
  if (body.due_at !== undefined && auth.access.mode === "full") {
    update.due_at = body.due_at;
  }

  const { data, error } = await auth.supabase
    .from("questionario_assignment")
    .update(update)
    .eq("id", assignmentId)
    .select("*, programa_area(id, nome, slug)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
