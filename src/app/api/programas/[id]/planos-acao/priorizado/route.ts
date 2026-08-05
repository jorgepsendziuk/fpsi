import { NextRequest, NextResponse } from "next/server";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { isGapMedida, scorePrioridade } from "@/lib/planos/prioridadeScore";

/** GET — backlog priorizado do plano (lacunas ranqueadas). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const onlyGaps = searchParams.get("onlyGaps") !== "false";
  const quickWins = searchParams.get("quickWins") === "true";

  const { data: pmRows, error } = await auth.supabase
    .from("programa_medida")
    .select(
      "id, medida, controle, resposta, prioridade, impacto_negocio, status_plano_acao, status_medida, responsavel, previsao_inicio, previsao_fim, justificativa"
    )
    .eq("programa", programaId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = pmRows || [];

  if (auth.access.mode === "scoped" && auth.access.controleIds.length > 0) {
    const allowed = new Set(auth.access.controleIds);
    const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
    const { data: medidasMeta } = await auth.supabase
      .from("medida")
      .select("id, id_controle")
      .in("id", medidaIds);
    const medidaCtrl = new Map((medidasMeta || []).map((m) => [m.id, m.id_controle]));
    rows = rows.filter((r) => {
      const c = r.controle ?? medidaCtrl.get(r.medida);
      return c != null && allowed.has(c);
    });
  } else if (auth.access.mode === "minimal") {
    rows = [];
  }

  const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
  const { data: medidas } = medidaIds.length
    ? await auth.supabase
        .from("medida")
        .select("id, id_medida, medida, id_controle, grupo_imple")
        .in("id", medidaIds)
    : { data: [] as Array<{ id: number; id_medida: string; medida: string; id_controle: number; grupo_imple: string }> };

  const medidaMap = new Map((medidas || []).map((m) => [m.id, m]));
  const controleIds = Array.from(
    new Set(rows.map((r) => r.controle ?? medidaMap.get(r.medida)?.id_controle).filter(Boolean) as number[])
  );
  const { data: controles } = controleIds.length
    ? await auth.supabase.from("controle").select("id, nome, diagnostico").in("id", controleIds)
    : { data: [] as Array<{ id: number; nome: string; diagnostico: number }> };
  const controleMap = new Map((controles || []).map((c) => [c.id, c]));

  let items = rows.map((r) => {
    const m = medidaMap.get(r.medida);
    const ctrlId = r.controle ?? m?.id_controle;
    const scored = scorePrioridade({
      resposta: r.resposta,
      prioridade: r.prioridade,
      grupoImple: m?.grupo_imple,
      impactoNegocio: r.impacto_negocio,
    });
    const gap = isGapMedida(r.resposta, r.status_plano_acao);
    return {
      id: r.id,
      medidaId: r.medida,
      idMedida: m?.id_medida,
      titulo: m?.medida,
      controleId: ctrlId,
      controleNome: ctrlId ? controleMap.get(ctrlId)?.nome : null,
      diagnostico: ctrlId ? controleMap.get(ctrlId)?.diagnostico : null,
      grupoImple: m?.grupo_imple,
      resposta: r.resposta,
      prioridade: r.prioridade,
      impacto_negocio: r.impacto_negocio || "medio",
      status_plano_acao: r.status_plano_acao,
      responsavel: r.responsavel,
      previsao_inicio: r.previsao_inicio,
      previsao_fim: r.previsao_fim,
      gap,
      ...scored,
    };
  });

  if (onlyGaps) items = items.filter((i) => i.gap || i.prioridade);
  if (quickWins) items = items.filter((i) => i.esforco <= 1 && i.impacto >= 3 && i.gap);

  items.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    total: items.length,
    items,
    accessMode: auth.access.mode,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId);
  if ("error" in auth) return auth.error;
  if (auth.access.mode === "minimal") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const body = await request.json();
  const medidaRowId = Number(body.id);
  if (!medidaRowId) return NextResponse.json({ error: "id obrigatório" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (body.impacto_negocio != null) {
    if (auth.access.mode !== "full") {
      return NextResponse.json({ error: "Somente gestores alteram impacto" }, { status: 403 });
    }
    update.impacto_negocio = body.impacto_negocio;
  }
  if (body.prioridade != null) update.prioridade = !!body.prioridade;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("programa_medida")
    .update(update)
    .eq("id", medidaRowId)
    .eq("programa", programaId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
