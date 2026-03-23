import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanoAcaoResumoResult = {
  total: number;
  comResposta: number;
  concluidas: number;
  emAndamento: number;
  atrasadas: number;
  comPrioridade: number;
  diagnosticos: Array<{
    id: number;
    nome: string;
    qtdControles: number;
    qtdMedidas: number;
    controles: Array<{ id: number; nome: string; qtdMedidas: number }>;
  }>;
};

/**
 * Agrega contagens de programa_medida para plano de trabalho / diagnóstico (mesma lógica da rota planos-acao/resumo).
 */
export async function computePlanoAcaoResumo(
  supabase: SupabaseClient,
  programaId: number
): Promise<{ data: PlanoAcaoResumoResult; error: string | null }> {
  const { data: pmRows, error: pmError } = await supabase
    .from("programa_medida")
    .select("medida, controle, resposta, status_medida, status_plano_acao, prioridade")
    .eq("programa", programaId);

  if (pmError) {
    return { data: getEmptyPlanoResumo(), error: pmError.message };
  }

  const rows = (pmRows || []) as {
    medida: number;
    controle: number | null;
    resposta: unknown;
    status_medida: number | null;
    status_plano_acao: number | null;
    prioridade?: boolean;
  }[];

  const total = rows.length;
  const comResposta = rows.filter((r) => r.resposta != null && r.resposta !== "").length;
  const concluidas = rows.filter((r) => r.status_plano_acao === 2).length;
  const emAndamento = rows.filter((r) => r.status_plano_acao === 4).length;
  const atrasadas = rows.filter((r) => r.status_plano_acao === 5).length;
  const comPrioridade = rows.filter((r) => r.prioridade === true).length;

  if (rows.length === 0) {
    return { data: getEmptyPlanoResumo(), error: null };
  }

  const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
  const { data: medidasData } = await supabase.from("medida").select("id, id_controle").in("id", medidaIds);

  const medidaToControle = new Map<number, number>();
  (medidasData || []).forEach((m: { id: number; id_controle: number }) => {
    medidaToControle.set(m.id, m.id_controle);
  });

  const controleIds = new Set<number>();
  rows.forEach((r) => {
    const ctrlId = r.controle ?? medidaToControle.get(r.medida);
    if (ctrlId) controleIds.add(ctrlId);
  });

  const { data: controlesData } = await supabase
    .from("controle")
    .select("id, diagnostico, nome")
    .in("id", Array.from(controleIds));

  const controleMap = new Map<number, { diagnostico: number; nome: string }>();
  (controlesData || []).forEach((c: { id: number; diagnostico: number; nome: string }) => {
    controleMap.set(c.id, { diagnostico: c.diagnostico, nome: c.nome || `Controle ${c.id}` });
  });

  const diagIds = new Set(Array.from(controleMap.values()).map((c) => c.diagnostico));
  const { data: diagnosticosData } = await supabase
    .from("diagnostico")
    .select("id, descricao")
    .in("id", Array.from(diagIds));

  const diagMap = new Map<number, string>();
  (diagnosticosData || []).forEach((d: { id: number; descricao: string }) => {
    diagMap.set(d.id, d.descricao || `Diagnóstico ${d.id}`);
  });

  const diagStructure = new Map<
    number,
    { id: number; nome: string; controles: Map<number, { id: number; nome: string; qtdMedidas: number }> }
  >();

  for (const row of rows) {
    const ctrlId = row.controle ?? medidaToControle.get(row.medida);
    if (!ctrlId) continue;
    const ctrl = controleMap.get(ctrlId);
    if (!ctrl) continue;
    const diagId = ctrl.diagnostico;
    const diagNome = diagMap.get(diagId) || `Diagnóstico ${diagId}`;
    const ctrlNome = ctrl.nome;

    if (!diagStructure.has(diagId)) {
      diagStructure.set(diagId, {
        id: diagId,
        nome: diagNome,
        controles: new Map(),
      });
    }
    const diag = diagStructure.get(diagId)!;
    if (!diag.controles.has(ctrlId)) {
      diag.controles.set(ctrlId, { id: ctrlId, nome: ctrlNome, qtdMedidas: 0 });
    }
    diag.controles.get(ctrlId)!.qtdMedidas += 1;
  }

  const diagnosticos = Array.from(diagStructure.values())
    .sort((a, b) => a.id - b.id)
    .map((d) => ({
      id: d.id,
      nome: d.nome,
      qtdControles: d.controles.size,
      qtdMedidas: Array.from(d.controles.values()).reduce((s, c) => s + c.qtdMedidas, 0),
      controles: Array.from(d.controles.values()).sort((a, b) => a.id - b.id),
    }));

  return {
    data: {
      total,
      comResposta,
      concluidas,
      emAndamento,
      atrasadas,
      comPrioridade,
      diagnosticos,
    },
    error: null,
  };
}

function getEmptyPlanoResumo(): PlanoAcaoResumoResult {
  return {
    total: 0,
    comResposta: 0,
    concluidas: 0,
    emAndamento: 0,
    atrasadas: 0,
    comPrioridade: 0,
    diagnosticos: [],
  };
}
