import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import {
  mergeAssignmentScopes,
  type AssignmentScope,
} from "@/lib/questionarios/areaQuestionarioScope";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;

  let query = auth.supabase
    .from("questionario_assignment")
    .select("*, programa_area(id, nome, slug)")
    .eq("programa_id", programaId)
    .order("created_at", { ascending: false });

  if (auth.access.mode !== "full") {
    query = query.eq("assignee_user_id", auth.user.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const assignee = String(body.assignee_user_id || "").trim();
  if (!assignee) {
    return NextResponse.json({ error: "assignee_user_id obrigatório" }, { status: 400 });
  }

  const areaIds: number[] = Array.isArray(body.area_ids)
    ? body.area_ids.map(Number).filter(Number.isFinite)
    : body.area_id
      ? [Number(body.area_id)]
      : [];

  let scope: AssignmentScope = body.scope || {};
  if (areaIds.length > 0) {
    const { data: escopos } = await auth.supabase
      .from("programa_area_escopo")
      .select("diagnostico_ids, controle_ids")
      .in("area_id", areaIds);

    const scopes: AssignmentScope[] = (escopos || []).map((e) => ({
      diagnostico_ids: e.diagnostico_ids || [],
      controle_ids: e.controle_ids || [],
    }));
    if (body.scope) scopes.push(body.scope);
    scope = mergeAssignmentScopes(...scopes);

    // Garante vínculo user↔área
    for (const areaId of areaIds) {
      await auth.supabase.from("programa_user_areas").upsert(
        { programa_id: programaId, user_id: assignee, area_id: areaId },
        { onConflict: "programa_id,user_id,area_id" }
      );
    }
  }

  // Expandir controles a partir de eixos se necessário
  if ((!scope.controle_ids || scope.controle_ids.length === 0) && scope.diagnostico_ids?.length) {
    const { data: controles } = await auth.supabase
      .from("controle")
      .select("id")
      .in("diagnostico", scope.diagnostico_ids);
    scope.controle_ids = (controles || []).map((c) => c.id as number);
  }

  const { data, error } = await auth.supabase
    .from("questionario_assignment")
    .insert({
      programa_id: programaId,
      assignee_user_id: assignee,
      area_id: areaIds[0] ?? null,
      scope,
      due_at: body.due_at || null,
      status: "pending",
    })
    .select("*, programa_area(id, nome, slug)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
