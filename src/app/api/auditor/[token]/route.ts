import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  emptyAuditorKpis,
  mediaScores,
  toListaItem,
  type AuditorListaItem,
  type AuditorPortalPayload,
} from "@/lib/auditor/auditorPortal";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function safeList(
  fn: () => unknown
): Promise<{ rows: Record<string, unknown>[]; count: number }> {
  try {
    const res = (await fn()) as {
      data?: unknown[] | null;
      count?: number | null;
      error?: { message: string } | null;
    };
    if (res?.error) return { rows: [], count: 0 };
    const rows = ((res?.data || []) as Record<string, unknown>[]);
    return { rows, count: res?.count ?? rows.length };
  } catch {
    return { rows: [], count: 0 };
  }
}

/**
 * GET /api/auditor/[token] — portal somente leitura (sem login).
 * Sem PII de titulares: pedidos entram só como contagem.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }
    const admin = adminClient();
    if (!admin) {
      return NextResponse.json({ error: "Configuração incompleta" }, { status: 500 });
    }

    const { data: acesso, error } = await admin
      .from("programa_auditor_acesso")
      .select("id, programa_id, email, expires_at, revoked_at")
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    if (!acesso || acesso.revoked_at) {
      return NextResponse.json({ error: "Acesso inválido ou revogado" }, { status: 403 });
    }
    if (new Date(acesso.expires_at) < new Date()) {
      return NextResponse.json({ error: "Acesso expirado" }, { status: 403 });
    }

    await admin
      .from("programa_auditor_acesso")
      .update({ last_access_at: new Date().toISOString() })
      .eq("id", acesso.id);

    const pid = acesso.programa_id as number;

    const [
      progRes,
      mat,
      riscos,
      inc,
      ev,
      dec,
      pol,
      map,
      ropa,
      ripd,
      planos,
      cien,
      timeline,
      pedidos,
    ] = await Promise.all([
      admin
        .from("programa")
        .select("id, nome, slug, encarregado_dados_pessoais")
        .eq("id", pid)
        .maybeSingle(),
      safeList(() =>
        admin.from("programa_diagnostico_maturidade").select("score").eq("programa_id", pid)
      ),
      safeList(() =>
        admin
          .from("programa_risco")
          .select("id, titulo, nome, status, score_residual")
          .eq("programa_id", pid)
      ),
      safeList(() =>
        admin
          .from("incidente")
          .select("id, titulo, status, created_at")
          .eq("programa_id", pid)
          .in("status", ["em_analise", "comunicado_anpd", "comunicado_titulares", "outro"])
      ),
      safeList(() =>
        admin
          .from("evidencia")
          .select("id, titulo, categoria, status, created_at")
          .eq("programa_id", pid)
          .eq("status", "ativo")
          .order("created_at", { ascending: false })
          .limit(40)
      ),
      safeList(() =>
        admin
          .from("decision_record")
          .select("id, titulo, status, data_decisao, created_at")
          .eq("programa_id", pid)
          .neq("status", "rascunho")
      ),
      safeList(() =>
        admin
          .from("politica_programa")
          .select("id, tipo_politica, status, updated_at")
          .eq("programa_id", pid)
          .eq("status", "publicado")
      ),
      safeList(() =>
        admin
          .from("mapeamento_dados")
          .select(
            "id, nome, finalidade_categoria, finalidade_detalhe, tipos_dados, fluxo_compartilhamento",
            { count: "exact" }
          )
          .eq("programa_id", pid)
          .limit(30)
      ),
      safeList(() =>
        admin.from("ropa").select("id, nome, finalidade, base_legal").eq("programa_id", pid).limit(30)
      ),
      safeList(() =>
        admin.from("ripd").select("id, titulo, status, updated_at").eq("programa_id", pid).limit(20)
      ),
      safeList(() =>
        admin
          .from("plano_acao")
          .select("id, titulo, status, data_fim_prevista")
          .eq("programa_id", pid)
          .neq("status", "cancelado")
          .limit(40)
      ),
      safeList(() =>
        admin
          .from("ciencia_documento")
          .select("id, documento_titulo, versao, aceito_em")
          .eq("programa_id", pid)
          .limit(30)
      ),
      safeList(() =>
        admin
          .from("programa_timeline_evento")
          .select("id, titulo, origem, tipo, ocorrido_em, detalhe")
          .eq("programa_id", pid)
          .order("ocorrido_em", { ascending: false })
          .limit(30)
      ),
      safeList(() =>
        admin
          .from("pedido_titular")
          .select("id", { count: "exact", head: true })
          .eq("programa_id", pid)
          .in("status", ["recebido", "em_analise"])
      ),
    ]);

    let dpoNome: string | null = null;
    let dpoEmail: string | null = null;
    const encId = Number((progRes.data as { encarregado_dados_pessoais?: number } | null)?.encarregado_dados_pessoais);
    if (Number.isFinite(encId) && encId > 0) {
      const { data: resp } = await admin
        .from("responsavel")
        .select("nome, email")
        .eq("id", encId)
        .maybeSingle();
      dpoNome = resp?.nome ? String(resp.nome) : null;
      dpoEmail = resp?.email ? String(resp.email) : null;
    }
    const kpis = emptyAuditorKpis();
    kpis.maturidadeMedia = mediaScores(mat.rows.map((r) => Number(r.score)));
    kpis.riscosCriticos = riscos.rows.filter((r) => Number(r.score_residual) >= 12).length;
    kpis.incidentesAbertos = inc.count;
    kpis.evidencias = ev.count;
    kpis.decisoes = dec.count;
    kpis.politicasPublicadas = pol.count;
    kpis.mapeamentos = map.count;
    kpis.ropaOperacoes = ropa.count;
    kpis.ripds = ripd.count;
    kpis.planosAbertos = planos.rows.filter((p) => !["concluido", "cancelado"].includes(String(p.status))).length;
    kpis.ciencias = cien.count;
    kpis.pedidosTitularesAbertos = pedidos.count;

    const list = (
      rows: Record<string, unknown>[],
      titulo: string[],
      detalhe?: string[],
      status = "status"
    ): AuditorListaItem[] => rows.map((r) => toListaItem(r, titulo, detalhe, status));

    const prog = (progRes.data || {}) as Record<string, unknown>;
    const payload: AuditorPortalPayload = {
      ok: true,
      programa: {
        nome: String(prog.nome || "Programa"),
        slug: (prog.slug as string) || null,
        dpoNome,
        dpoEmail,
      },
      expires_at: acesso.expires_at,
      resumo: kpis,
      evidencias: list(ev.rows, ["titulo"], ["categoria"]),
      politicas: list(pol.rows, ["tipo_politica"], undefined, "status"),
      ropa: list(
        ropa.rows.length ? ropa.rows : map.rows,
        ["nome"],
        ["finalidade", "base_legal", "finalidade_detalhe", "finalidade_categoria"]
      ),
      ripds: list(ripd.rows, ["titulo"]),
      riscos: list(
        riscos.rows.filter((r) => Number(r.score_residual) >= 12),
        ["titulo", "nome"]
      ),
      incidentes: list(inc.rows, ["titulo"]),
      decisoes: list(dec.rows, ["titulo"], undefined, "status"),
      timeline: list(timeline.rows, ["titulo"], ["detalhe", "origem"], "tipo"),
      planos: list(planos.rows, ["titulo"]),
      ciencias: list(cien.rows, ["documento_titulo"], ["versao"], "versao"),
    };

    return NextResponse.json(payload);
  } catch (e) {
    console.error("auditor portal", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
