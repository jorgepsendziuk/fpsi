import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * GET /api/programas/[id]/planos-acao/resumo
 * Retorna contagens agregadas para o Plano de Trabalho (lazy load).
 * Usado para os cards de resumo sem carregar todas as medidas.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const programaId = parseInt(String(id || "").trim(), 10);
    if (isNaN(programaId) || programaId <= 0) {
      return NextResponse.json({ error: "ID do programa inválido" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se usuário é membro do programa
    const { data: member } = await supabase
      .from("programa_users")
      .select("id")
      .eq("programa_id", programaId)
      .eq("user_id", user.id)
      .eq("status", "accepted")
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Acesso negado ao programa" }, { status: 403 });
    }

    // 1. Buscar programa_medida (apenas campos necessários para contagens)
    const { data: pmRows, error: pmError } = await supabase
      .from("programa_medida")
      .select("medida, controle, resposta, status_medida, status_plano_acao, prioridade")
      .eq("programa", programaId);

    if (pmError) {
      console.error("Erro ao buscar programa_medida:", pmError);
      return NextResponse.json(
        { error: "Erro ao carregar resumo", details: pmError.message },
        { status: 500 }
      );
    }

    const rows = (pmRows || []) as { medida: number; controle: number | null; resposta: unknown; status_medida: number | null; status_plano_acao: number | null; prioridade?: boolean }[];

    // Calcular contagens
    const total = rows.length;
    const comResposta = rows.filter((r) => r.resposta != null && r.resposta !== "").length;
    const concluidas = rows.filter((r) => r.status_plano_acao === 2).length;
    const emAndamento = rows.filter((r) => r.status_plano_acao === 4).length;
    const atrasadas = rows.filter((r) => r.status_plano_acao === 5).length;
    const comPrioridade = rows.filter((r) => r.prioridade === true).length;

    if (rows.length === 0) {
      return NextResponse.json({
        total: 0,
        comResposta: 0,
        concluidas: 0,
        emAndamento: 0,
        atrasadas: 0,
        comPrioridade: 0,
        diagnosticos: [],
      });
    }

    // 2. Buscar medidas para mapear medida -> id_controle
    const medidaIds = Array.from(new Set(rows.map((r) => r.medida)));
    const { data: medidasData } = await supabase
      .from("medida")
      .select("id, id_controle")
      .in("id", medidaIds);

    const medidaToControle = new Map<number, number>();
    (medidasData || []).forEach((m: { id: number; id_controle: number }) => {
      medidaToControle.set(m.id, m.id_controle);
    });

    // 3. Obter controles únicos (usar pm.controle ou medida.id_controle)
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

    // 4. Montar estrutura diagnósticos -> controles -> qtdMedidas
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

    return NextResponse.json({
      total,
      comResposta,
      concluidas,
      emAndamento,
      atrasadas,
      comPrioridade,
      diagnosticos,
    });
  } catch (err) {
    console.error("Erro em planos-acao/resumo:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
