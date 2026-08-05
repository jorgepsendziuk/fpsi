import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireProgramaAccess } from "@/lib/authz/requireProgramaAccess";
import { isGapMedida, scorePrioridade } from "@/lib/planos/prioridadeScore";

async function buildSnapshot(supabase: SupabaseClient, programaId: number) {
  const { data: programa } = await supabase
    .from("programa")
    .select("id, nome, empresa, unidade")
    .eq("id", programaId)
    .maybeSingle();

  const { data: pmRows } = await supabase
    .from("programa_medida")
    .select(
      "medida, controle, resposta, justificativa, prioridade, impacto_negocio, status_plano_acao, status_medida"
    )
    .eq("programa", programaId);

  const rows = pmRows || [];
  const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
  const { data: medidas } = medidaIds.length
    ? await supabase
        .from("medida")
        .select("id, id_medida, medida, id_controle, grupo_imple")
        .in("id", medidaIds)
    : { data: [] as Array<{ id: number; id_medida: string; medida: string; id_controle: number; grupo_imple: string }> };

  const medidaMap = new Map((medidas || []).map((m) => [m.id, m]));
  const controleIds = Array.from(
    new Set(
      rows
        .map((r) => r.controle ?? medidaMap.get(r.medida)?.id_controle)
        .filter((x): x is number => typeof x === "number")
    )
  );

  const { data: controles } = controleIds.length
    ? await supabase.from("controle").select("id, nome, diagnostico").in("id", controleIds)
    : { data: [] as Array<{ id: number; nome: string; diagnostico: number }> };
  const controleMap = new Map((controles || []).map((c) => [c.id, c]));

  const { data: riscos } = await supabase
    .from("programa_risco")
    .select("id, titulo, probabilidade, impacto, score_residual, status, categoria")
    .eq("programa_id", programaId)
    .order("score_residual", { ascending: false })
    .limit(20);

  const gaps = rows
    .filter((r) => isGapMedida(r.resposta, r.status_plano_acao))
    .map((r) => {
      const m = medidaMap.get(r.medida);
      const ctrlId = r.controle ?? m?.id_controle;
      const ctrl = ctrlId ? controleMap.get(ctrlId) : undefined;
      const scored = scorePrioridade({
        resposta: r.resposta,
        prioridade: r.prioridade,
        grupoImple: m?.grupo_imple,
        impactoNegocio: r.impacto_negocio,
      });
      return {
        medidaId: r.medida,
        idMedida: m?.id_medida,
        titulo: m?.medida,
        controleId: ctrlId,
        controleNome: ctrl?.nome,
        diagnostico: ctrl?.diagnostico,
        justificativa: r.justificativa,
        ...scored,
      };
    })
    .sort((a, b) => b.score - a.score);

  const achados = gaps.slice(0, 25);
  const evidencias = rows
    .filter((r) => r.justificativa && String(r.justificativa).trim())
    .slice(0, 30)
    .map((r) => {
      const m = medidaMap.get(r.medida);
      return {
        medidaId: r.medida,
        idMedida: m?.id_medida,
        titulo: m?.medida,
        justificativa: r.justificativa,
      };
    });

  const total = rows.length;
  const comResposta = rows.filter((r) => r.resposta != null && r.resposta !== "").length;
  const gapsCount = gaps.length;

  return {
    geradoEm: new Date().toISOString(),
    programa,
    resumo: {
      totalMedidas: total,
      respondidas: comResposta,
      gaps: gapsCount,
      coberturaPct: total ? Math.round((comResposta / total) * 100) : 0,
      riscosAbertos: (riscos || []).filter((r) => r.status !== "encerrado" && r.status !== "aceito")
        .length,
    },
    achados,
    evidencias,
    riscos: riscos || [],
    planoPriorizado: gaps.slice(0, 15),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const { data: saved } = await auth.supabase
    .from("programa_relatorio_executivo")
    .select("*")
    .eq("programa_id", programaId)
    .maybeSingle();

  const snapshot = await buildSnapshot(auth.supabase, programaId);

  return NextResponse.json({
    snapshot: saved?.snapshot && Object.keys(saved.snapshot as object).length ? saved.snapshot : snapshot,
    live: snapshot,
    narrativa_resumo: saved?.narrativa_resumo ?? null,
    narrativa_impacto: saved?.narrativa_impacto ?? null,
    updated_at: saved?.updated_at ?? null,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const programaId = parseInt(id, 10);
  if (isNaN(programaId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const auth = await requireProgramaAccess(programaId, { fullOnly: true });
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const live = await buildSnapshot(auth.supabase, programaId);
  const payload = {
    programa_id: programaId,
    snapshot: body.refresh === false && body.snapshot ? body.snapshot : live,
    narrativa_resumo: body.narrativa_resumo ?? null,
    narrativa_impacto: body.narrativa_impacto ?? null,
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await auth.supabase
    .from("programa_relatorio_executivo")
    .upsert(payload, { onConflict: "programa_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
