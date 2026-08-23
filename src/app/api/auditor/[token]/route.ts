import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  emptyAuditorKpis,
  mediaScores,
  pickCampos,
  toListaItem,
  type AuditorDiagnostico,
  type AuditorListaItem,
  type AuditorPortalPayload,
} from "@/lib/auditor/auditorPortal";
import {
  completarDiagnosticosEixos,
  indiceDiagnostico,
  nomeDiagnostico,
} from "@/lib/auditor/auditorEvidenciaVinculos";
import { loadAuditorEvidencias } from "@/lib/auditor/loadAuditorEvidencias";
import { getPoliticaCatalogMeta } from "@/lib/politicas/politicasCatalog";

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
    const rows = (res?.data || []) as Record<string, unknown>[];
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
        admin
          .from("programa_diagnostico_maturidade")
          .select("diagnostico_id, score, label")
          .eq("programa_id", pid)
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
          .select(
            "id, titulo, descricao, categoria, nome_arquivo, mime_type, tamanho_bytes, url_externa, validade, versao, status, created_at"
          )
          .eq("programa_id", pid)
          .eq("status", "ativo")
          .order("created_at", { ascending: false })
          .limit(40)
      ),
      safeList(() =>
        admin
          .from("decision_record")
          .select(
            "id, titulo, status, data_decisao, created_at, contexto, problema, decisao, justificativa, alternativas, responsaveis"
          )
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
    const encId = Number(
      (progRes.data as { encarregado_dados_pessoais?: number } | null)?.encarregado_dados_pessoais
    );
    if (Number.isFinite(encId) && encId > 0) {
      const { data: resp } = await admin
        .from("responsavel")
        .select("nome, email")
        .eq("id", encId)
        .maybeSingle();
      dpoNome = resp?.nome ? String(resp.nome) : null;
      dpoEmail = resp?.email ? String(resp.email) : null;
    }

    const catDiag = await safeList(() => admin.from("diagnostico").select("id, descricao"));
    const nomeByDiag = new Map(catDiag.rows.map((r) => [Number(r.id), String(r.descricao || "")]));
    const diagnosticosRaw: AuditorDiagnostico[] = mat.rows
      .map((r) => {
        const id = Number(r.diagnostico_id);
        if (!Number.isFinite(id)) return null;
        const score = Number.isFinite(Number(r.score)) ? Number(r.score) : null;
        return {
          diagnosticoId: id,
          nome: nomeDiagnostico(id, nomeByDiag.get(id)),
          indice: indiceDiagnostico(id),
          score,
          nivel: String(r.label || "").trim() || "—",
        } satisfies AuditorDiagnostico;
      })
      .filter((x): x is AuditorDiagnostico => Boolean(x))
      .sort((a, b) => a.diagnosticoId - b.diagnosticoId);
    const diagnosticos = completarDiagnosticosEixos(diagnosticosRaw, nomeByDiag);

    const kpis = emptyAuditorKpis();
    kpis.maturidadeMedia = mediaScores(
      (diagnosticosRaw.length
        ? diagnosticosRaw.map((d) => d.score)
        : mat.rows.map((r) => r.score)
      ).map((s) => Number(s))
    );
    kpis.riscosCriticos = riscos.rows.filter((r) => Number(r.score_residual) >= 12).length;
    kpis.incidentesAbertos = inc.count;
    kpis.evidencias = ev.count;
    kpis.decisoes = dec.count;
    kpis.politicasPublicadas = pol.count;
    kpis.mapeamentos = map.count;
    kpis.ropaOperacoes = ropa.count;
    kpis.ripds = ripd.count;
    kpis.planosAbertos = planos.rows.filter(
      (p) => !["concluido", "cancelado"].includes(String(p.status))
    ).length;
    kpis.ciencias = cien.count;
    kpis.pedidosTitularesAbertos = pedidos.count;

    const list = (
      rows: Record<string, unknown>[],
      titulo: string[],
      detalhe?: string[],
      status = "status"
    ): AuditorListaItem[] => rows.map((r) => toListaItem(r, titulo, detalhe, status));

    const evidencias = await loadAuditorEvidencias(admin, pid, ev.rows);

    const politicas: AuditorListaItem[] = pol.rows.map((r) => {
      const tipo = String(r.tipo_politica || "");
      const meta = getPoliticaCatalogMeta(tipo);
      const item = toListaItem(r, ["tipo_politica"], undefined, "status");
      item.titulo = meta?.nome || tipo || item.titulo;
      item.detalhe = meta?.descricao || "Política publicada no programa (PPSI 0.9–0.12).";
      item.descricao = meta?.descricao;
      item.tags = [tipo].filter(Boolean);
      item.categoria = meta?.grupo;
      item.campos = [
        ...pickCampos(r, [["status", "Situação"], ["updated_at", "Atualizado em"]]),
        ...(meta?.grupo ? [{ rotulo: "Grupo", valor: meta.grupo }] : []),
        ...(tipo ? [{ rotulo: "Tipo interno", valor: tipo }] : []),
      ];
      return item;
    });

    const ropaRows = ropa.rows.length ? ropa.rows : map.rows;
    const ropaItems: AuditorListaItem[] = ropaRows.map((r) => {
      const item = toListaItem(r, ["nome"], ["finalidade", "base_legal", "finalidade_detalhe"]);
      const tags = [r.base_legal, r.finalidade_categoria]
        .map((x) => (x != null ? String(x) : ""))
        .filter(Boolean);
      item.tags = tags;
      item.descricao = item.detalhe;
      item.detalhe = tags.length
        ? `Base legal / finalidade: ${tags.join(" · ")}`
        : "Operação de tratamento (LGPD art. 37).";
      item.campos = pickCampos(r, [
        ["base_legal", "Base legal"],
        ["finalidade", "Finalidade"],
        ["finalidade_detalhe", "Detalhe da finalidade"],
        ["finalidade_categoria", "Categoria"],
        ["tipos_dados", "Tipos de dados"],
        ["fluxo_compartilhamento", "Compartilhamento"],
      ]);
      return item;
    });

    const riscosItems: AuditorListaItem[] = riscos.rows
      .filter((r) => Number(r.score_residual) >= 12)
      .map((r) => {
        const item = toListaItem(r, ["titulo", "nome"]);
        const score = Number(r.score_residual);
        item.tags = Number.isFinite(score) ? [`score residual ${score}`] : [];
        item.detalhe = `Risco residual alto (limiar ≥ 12)${r.status ? ` · ${r.status}` : ""}.`;
        item.campos = pickCampos(r, [
          ["nome", "Nome"],
          ["status", "Situação"],
          ["score_residual", "Score residual"],
        ]);
        return item;
      });

    const planosItems: AuditorListaItem[] = planos.rows.map((r) => {
      const item = toListaItem(r, ["titulo"]);
      const prazo = r.data_fim_prevista ? String(r.data_fim_prevista).slice(0, 10) : "";
      item.tags = [prazo ? `prazo ${prazo}` : ""].filter(Boolean);
      item.detalhe = prazo ? `Prazo previsto: ${prazo}` : "Ação do plano de trabalho PPSI.";
      item.campos = pickCampos(r, [
        ["status", "Situação"],
        ["data_fim_prevista", "Prazo previsto"],
      ]);
      return item;
    });

    const ripdsItems = list(ripd.rows, ["titulo"]).map((item, i) => {
      const row = ripd.rows[i] || {};
      const st = row.status;
      item.detalhe = st ? `RIPD (LGPD art. 38) · ${st}` : "Relatório de impacto à proteção de dados (LGPD art. 38).";
      item.status = st ? String(st) : item.status;
      item.campos = pickCampos(row, [
        ["status", "Situação"],
        ["updated_at", "Atualizado em"],
      ]);
      return item;
    });

    const incidentesItems = list(inc.rows, ["titulo"]).map((item, i) => {
      const row = inc.rows[i] || {};
      const st = row.status;
      item.detalhe = st
        ? `Incidente em tratamento · ${st}`
        : "Incidente de segurança ou privacidade em aberto.";
      item.campos = pickCampos(row, [
        ["status", "Situação"],
        ["created_at", "Registrado em"],
      ]);
      return item;
    });

    const decisoesItems = list(dec.rows, ["titulo"], undefined, "status").map((item, i) => {
      const row = dec.rows[i] || {};
      item.detalhe = item.detalhe || "Decisão formal da alta administração (accountability).";
      item.descricao = row.decisao ? String(row.decisao) : undefined;
      item.campos = pickCampos(row, [
        ["status", "Situação"],
        ["data_decisao", "Data da decisão"],
        ["contexto", "Contexto"],
        ["problema", "Problema"],
        ["alternativas", "Alternativas"],
        ["decisao", "Decisão"],
        ["justificativa", "Justificativa"],
        ["responsaveis", "Responsáveis"],
      ]);
      return item;
    });

    const timelineItems = list(timeline.rows, ["titulo"], ["detalhe", "origem"], "tipo").map((item, i) => {
      const row = timeline.rows[i] || {};
      item.campos = pickCampos(row, [
        ["tipo", "Tipo"],
        ["origem", "Origem"],
        ["detalhe", "Detalhe"],
        ["ocorrido_em", "Quando"],
      ]);
      return item;
    });
    const cienciasItems = list(cien.rows, ["documento_titulo"], ["versao"], "versao").map((item, i) => {
      const row = cien.rows[i] || {};
      item.detalhe = item.detalhe
        ? `Ciência registrada · versão ${item.detalhe}`
        : "Registro de ciência em documento versionado.";
      item.campos = pickCampos(row, [
        ["versao", "Versão"],
        ["aceito_em", "Ciência em"],
      ]);
      return item;
    });

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
      diagnosticos,
      evidencias,
      politicas,
      ropa: ropaItems,
      ripds: ripdsItems,
      riscos: riscosItems,
      incidentes: incidentesItems,
      decisoes: decisoesItems,
      timeline: timelineItems,
      planos: planosItems,
      ciencias: cienciasItems,
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
