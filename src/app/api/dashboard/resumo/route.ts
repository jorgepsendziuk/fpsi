import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { fetchPendenciasUsuario } from "@/lib/server/pendenciasService";
import type { DashboardProgramaResumo, DashboardResumoApi } from "@/lib/types/pendencias";

/**
 * GET /api/dashboard/resumo
 * Agrega pendências e KPIs de todos os programas do usuário.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const pendencias = await fetchPendenciasUsuario(supabase, user.id);

    const { data: memberships } = await supabase
      .from("programa_users")
      .select("programa_id, programa:programa_id(id, nome, slug, deleted_at)")
      .eq("user_id", user.id)
      .eq("status", "accepted");

    const programas: DashboardProgramaResumo[] = [];
    let dsarAbertos = 0;
    let incidentesAbertos = 0;
    let reportesNovos = 0;
    let riscosCriticos = 0;
    let planosVencidos = 0;
    let ropasAtivos = 0;
    const maturidadeScores: number[] = [];

    for (const m of memberships || []) {
      const rawProg = m.programa as unknown;
      const prog = (Array.isArray(rawProg) ? rawProg[0] : rawProg) as
        | { id: number; nome: string; slug: string | null; deleted_at?: string | null }
        | null
        | undefined;
      // Lixeira: não entra nos KPIs nem na lista operacional
      if (!prog?.id || prog.deleted_at) continue;
      const pid = prog.id;

      const today = new Date().toISOString().slice(0, 10);

      const [matRes, dsarCount, incCount, repCount, riscoCount, planosCount, ropaCount] =
        await Promise.all([
          supabase
            .from("programa_diagnostico_maturidade")
            .select("score")
            .eq("programa_id", pid),
          supabase
            .from("pedido_titular")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid)
            .in("status", ["recebido", "em_analise"]),
          supabase
            .from("incidente")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid)
            .in("status", ["em_analise", "comunicado_anpd", "comunicado_titulares", "outro"]),
          supabase
            .from("programa_reportes")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid)
            .eq("status", "novo"),
          supabase
            .from("programa_risco")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid)
            .in("status", ["identificado", "em_tratamento"])
            .gte("score_residual", 12),
          supabase
            .from("plano_acao")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid)
            .in("status", ["nao_iniciado", "em_andamento", "atrasado"])
            .lt("data_fim_prevista", today),
          supabase
            .from("ropa")
            .select("*", { count: "exact", head: true })
            .eq("programa_id", pid),
        ]);

      const scores = (matRes.data || []).map((r: { score: number }) => Number(r.score));
      const maturidadeMedia =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      if (maturidadeMedia != null) maturidadeScores.push(maturidadeMedia);

      const pProg = pendencias.itens.filter((i) => i.programaId === pid);
      const pAtrasadas = pProg.filter((i) => {
        if (!i.dataLimite) return false;
        const d = new Date(i.dataLimite);
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        d.setHours(0, 0, 0, 0);
        return d < t;
      }).length;

      const dCount = dsarCount.count ?? 0;
      const iCount = incCount.count ?? 0;
      const rCount = repCount.count ?? 0;
      const rkCount = riscoCount.count ?? 0;
      const plCount = planosCount.count ?? 0;
      const roCount = ropaCount.count ?? 0;

      dsarAbertos += dCount;
      incidentesAbertos += iCount;
      reportesNovos += rCount;
      riscosCriticos += rkCount;
      planosVencidos += plCount;
      ropasAtivos += roCount;

      programas.push({
        programaId: pid,
        nome: prog.nome || `Programa ${pid}`,
        slug: prog.slug,
        maturidadeMedia,
        pendenciasTotal: pProg.length,
        pendenciasAtrasadas: pAtrasadas,
        dsarAbertos: dCount,
        incidentesAbertos: iCount,
        riscosCriticos: rkCount,
      });
    }

    programas.sort((a, b) => b.pendenciasAtrasadas - a.pendenciasAtrasadas || b.pendenciasTotal - a.pendenciasTotal);

    const maturidadeMediaGlobal =
      maturidadeScores.length > 0
        ? maturidadeScores.reduce((a, b) => a + b, 0) / maturidadeScores.length
        : null;

    const body: DashboardResumoApi = {
      pendencias,
      programas,
      kpis: {
        programasAtivos: programas.length,
        dsarAbertos,
        incidentesAbertos,
        reportesNovos,
        riscosCriticos,
        maturidadeMedia: maturidadeMediaGlobal,
        planosVencidos,
        ropasAtivos,
      },
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error("Erro GET dashboard/resumo:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
