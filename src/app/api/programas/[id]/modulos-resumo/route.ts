import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { computePlanoAcaoResumo } from "@/lib/server/planoAcaoResumo";

function politicaTemConteudoMinimo(secoes: unknown): boolean {
  if (!Array.isArray(secoes)) return false;
  return secoes.some((s: { texto?: string }) => (s?.texto && String(s.texto).trim().length > 0));
}

/**
 * GET /api/programas/[id]/modulos-resumo
 * Agrega contagens para os versos dos cards «Módulos do Sistema» na home do programa.
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

    const [
      planoRes,
      { count: mapeamentoDados },
      { count: ropaOps },
      { count: ripdCount },
      { count: incidentesCount },
      { count: usuariosPrograma },
      { data: instituicoesPapel },
      { data: vinculosPapel },
      { data: maturidadeRows },
      { data: diagnosticosCatalog },
      { data: catalogoPoliticas },
      { data: politicasPrograma },
      { data: programaRow },
      { count: pedidosTitulares },
      { count: reportesPortal },
      { count: contatoPortal },
      { data: atividadesRecentes },
    ] = await Promise.all([
      computePlanoAcaoResumo(supabase, programaId),
      supabase.from("mapeamento_dados").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("ropa").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("ripd").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("incidente").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("programa_users").select("*", { count: "exact", head: true }).eq("programa_id", programaId).eq("status", "accepted"),
      supabase.from("programa_papel_lgpd_instituicao").select("id").eq("programa_id", programaId),
      supabase.from("programa_papel_lgpd_vinculo").select("id").eq("programa_id", programaId),
      supabase
        .from("programa_diagnostico_maturidade")
        .select("diagnostico_id, score, label")
        .eq("programa_id", programaId),
      supabase.from("diagnostico").select("id, descricao"),
      supabase.from("politica_modelo").select("tipo_politica").eq("ativo", true),
      supabase.from("politica_programa").select("tipo_politica, secoes").eq("programa_id", programaId),
      supabase.from("programa").select("slug").eq("id", programaId).maybeSingle(),
      supabase.from("pedido_titular").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("programa_reportes").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase.from("programa_contato").select("*", { count: "exact", head: true }).eq("programa_id", programaId),
      supabase
        .from("user_activities")
        .select("id, action, resource_type, created_at, details")
        .eq("programa_id", programaId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const diagNome = new Map<number, string>();
    (diagnosticosCatalog || []).forEach((d: { id: number; descricao: string | null }) => {
      diagNome.set(d.id, d.descricao?.trim() || `Diagnóstico ${d.id}`);
    });
    const maturidade = (maturidadeRows || []).map((r: { diagnostico_id: number; score: number; label: string }) => ({
      diagnostico_id: r.diagnostico_id,
      nome: diagNome.get(r.diagnostico_id) ?? `Diagnóstico ${r.diagnostico_id}`,
      score: r.score,
      label: r.label,
    }));

    if (planoRes.error) {
      return NextResponse.json(
        { error: "Erro ao carregar resumo do plano", details: planoRes.error },
        { status: 500 }
      );
    }

    const tiposCatalogo = new Set((catalogoPoliticas || []).map((r: { tipo_politica: string }) => r.tipo_politica));
    const tiposImplementados = new Set<string>();
    (politicasPrograma || []).forEach((r: { tipo_politica: string; secoes: unknown }) => {
      if (politicaTemConteudoMinimo(r.secoes) && tiposCatalogo.has(r.tipo_politica)) {
        tiposImplementados.add(r.tipo_politica);
      }
    });
    const politicasCatalogoTotal = tiposCatalogo.size;
    const politicasImplementadas = tiposImplementados.size;
    const politicasNaoImplementadas = Math.max(0, politicasCatalogoTotal - politicasImplementadas);

    return NextResponse.json({
      planoAcao: planoRes.data,
      conformidade: {
        mapeamentoDados: mapeamentoDados ?? 0,
        ropaOperacoes: ropaOps ?? 0,
        ripd: ripdCount ?? 0,
        incidentes: incidentesCount ?? 0,
      },
      responsabilidades: {
        usuarios: usuariosPrograma ?? 0,
        papeisInstituicoes: (instituicoesPapel || []).length,
        conexoes: (vinculosPapel || []).length,
      },
      maturidade,
      politicas: {
        implementadas: politicasImplementadas,
        naoImplementadas: politicasNaoImplementadas,
        catalogoTipos: politicasCatalogoTotal,
      },
      portal: {
        pedidosTitulares: pedidosTitulares ?? 0,
        reportes: reportesPortal ?? 0,
        contato: contatoPortal ?? 0,
      },
      publicPortalPath: programaRow?.slug ? `/${programaRow.slug}` : null,
      auditoria: (atividadesRecentes || []).map(
        (a: { id: number; action: string; resource_type: string; created_at: string; details: unknown }) => ({
          id: a.id,
          action: a.action,
          resourceType: a.resource_type,
          createdAt: a.created_at,
          details: a.details,
        })
      ),
    });
  } catch (err) {
    console.error("Erro em modulos-resumo:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
