import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";

async function ensureAssignmentsForAreaUsers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  programaId: number,
  areaId: number,
  userIds: string[]
) {
  if (userIds.length === 0) return;

  const { data: escopo } = await supabase
    .from("programa_area_escopo")
    .select("diagnostico_ids, controle_ids")
    .eq("area_id", areaId)
    .maybeSingle();

  const diagnostico_ids = (escopo?.diagnostico_ids || []).map(Number).filter(Number.isFinite);
  let controle_ids = (escopo?.controle_ids || []).map(Number).filter(Number.isFinite);

  if (controle_ids.length === 0 && diagnostico_ids.length > 0) {
    const { data: controles } = await supabase
      .from("controle")
      .select("id")
      .in("diagnostico", diagnostico_ids);
    controle_ids = (controles || []).map((c: { id: number }) => c.id as number);
  }

  const scope = { diagnostico_ids, controle_ids };

  for (const user_id of userIds) {
    const { data: existing } = await supabase
      .from("questionario_assignment")
      .select("id")
      .eq("programa_id", programaId)
      .eq("assignee_user_id", user_id)
      .eq("area_id", areaId)
      .in("status", ["pending", "in_progress"])
      .limit(1);

    if (existing && existing.length > 0) continue;

    await supabase.from("questionario_assignment").insert({
      programa_id: programaId,
      assignee_user_id: user_id,
      area_id: areaId,
      scope,
      status: "pending",
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; areaId: string }> }
) {
  const { id, areaId: areaIdRaw } = await params;
  const programaId = parseInt(id, 10);
  const areaId = parseInt(areaIdRaw, 10);
  if (isNaN(programaId) || isNaN(areaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const areaUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.nome != null) areaUpdate.nome = String(body.nome).trim();
  if (body.descricao != null) areaUpdate.descricao = String(body.descricao);
  if (body.ativo != null) areaUpdate.ativo = !!body.ativo;

  const { error: areaErr } = await auth.supabase
    .from("programa_area")
    .update(areaUpdate)
    .eq("id", areaId)
    .eq("programa_id", programaId);

  if (areaErr) return NextResponse.json({ error: areaErr.message }, { status: 500 });

  const escopoUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let hasEscopo = false;
  if (Array.isArray(body.diagnostico_ids)) {
    escopoUpdate.diagnostico_ids = body.diagnostico_ids.map(Number).filter(Number.isFinite);
    hasEscopo = true;
  }
  if (Array.isArray(body.controle_ids)) {
    escopoUpdate.controle_ids = body.controle_ids.map(Number).filter(Number.isFinite);
    hasEscopo = true;
  }
  if (Array.isArray(body.modulos)) {
    escopoUpdate.modulos = body.modulos.map(String);
    hasEscopo = true;
  }
  if (Array.isArray(body.kpi_keys)) {
    escopoUpdate.kpi_keys = body.kpi_keys.map(String);
    hasEscopo = true;
  }

  if (hasEscopo) {
    const { data: existing } = await auth.supabase
      .from("programa_area_escopo")
      .select("id")
      .eq("area_id", areaId)
      .maybeSingle();

    if (existing) {
      await auth.supabase.from("programa_area_escopo").update(escopoUpdate).eq("area_id", areaId);
    } else {
      await auth.supabase.from("programa_area_escopo").insert({
        area_id: areaId,
        diagnostico_ids: (escopoUpdate.diagnostico_ids as number[]) || [],
        controle_ids: (escopoUpdate.controle_ids as number[]) || [],
        modulos: (escopoUpdate.modulos as string[]) || ["questionario", "kpis"],
        kpi_keys: (escopoUpdate.kpi_keys as string[]) || [],
      });
    }
  }

  // Membros da área
  if (Array.isArray(body.user_ids)) {
    const userIds: string[] = Array.from(
      new Set(
        (body.user_ids as unknown[])
          .map((id) => String(id))
          .filter((id) => id.length > 0)
      )
    );

    const { data: prevLinks } = await auth.supabase
      .from("programa_user_areas")
      .select("user_id")
      .eq("programa_id", programaId)
      .eq("area_id", areaId);
    const prevIds = new Set((prevLinks || []).map((l) => String(l.user_id)));

    await auth.supabase
      .from("programa_user_areas")
      .delete()
      .eq("programa_id", programaId)
      .eq("area_id", areaId);

    if (userIds.length > 0) {
      await auth.supabase.from("programa_user_areas").insert(
        userIds.map((user_id: string) => ({
          programa_id: programaId,
          user_id,
          area_id: areaId,
        }))
      );
    }

    const added = userIds.filter((uid) => !prevIds.has(uid));
    if (added.length > 0) {
      await ensureAssignmentsForAreaUsers(auth.supabase, programaId, areaId, added);
    }
  }

  const { data: full } = await auth.supabase
    .from("programa_area")
    .select("*, programa_area_escopo(*)")
    .eq("id", areaId)
    .single();

  return NextResponse.json(full);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; areaId: string }> }
) {
  const { id, areaId: areaIdRaw } = await params;
  const programaId = parseInt(id, 10);
  const areaId = parseInt(areaIdRaw, 10);
  if (isNaN(programaId) || isNaN(areaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const { error } = await auth.supabase
    .from("programa_area")
    .delete()
    .eq("id", areaId)
    .eq("programa_id", programaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
