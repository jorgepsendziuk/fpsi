import type { SupabaseClient } from "@supabase/supabase-js";
import type { PendenciaItem, PendenciasResumo } from "@/lib/types/pendencias";

const DSAR_ABERTOS = new Set(["recebido", "em_analise"]);
const REPORTE_PENDENTES = new Set(["novo", "em_triagem", "em_atendimento"]);
const CONTATO_PENDENTES = new Set(["novo", "em_triagem", "em_atendimento"]);
const INCIDENTE_ABERTOS = new Set(["em_analise", "comunicado_anpd", "comunicado_titulares", "outro"]);

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

function severidadeFromPrazo(dias: number | null, tipo: PendenciaItem["tipo"]): PendenciaItem["severidade"] {
  if (dias !== null && dias < 0) return "critical";
  if (dias !== null && dias <= 3) return "warning";
  if (tipo === "reporte" || tipo === "contato") return "info";
  return "info";
}

type ProgramaMeta = { id: number; nome: string; slug: string | null };

export async function fetchPendenciasPrograma(
  supabase: SupabaseClient,
  programaId: number,
  meta: ProgramaMeta,
  limit = 20
): Promise<PendenciasResumo> {
  const itens: PendenciaItem[] = [];
  const slug = meta.slug;
  const base = slug ? `/programas/${slug}` : `/programas/${programaId}`;

  const [dsarRes, reportesRes, contatoRes, incidentesRes, riscosRes] = await Promise.all([
    supabase
      .from("pedido_titular")
      .select("id, protocolo, tipo, nome_titular, status, data_prazo_resposta, created_at")
      .eq("programa_id", programaId)
      .in("status", Array.from(DSAR_ABERTOS))
      .order("data_prazo_resposta", { ascending: true, nullsFirst: false })
      .limit(limit),
    supabase
      .from("programa_reportes")
      .select("id, tipo, email, status, created_at")
      .eq("programa_id", programaId)
      .in("status", Array.from(REPORTE_PENDENTES))
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("programa_contato")
      .select("id, assunto, nome, status, created_at")
      .eq("programa_id", programaId)
      .in("status", Array.from(CONTATO_PENDENTES))
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("incidente")
      .select("id, titulo, status, data_ocorrencia, created_at")
      .eq("programa_id", programaId)
      .in("status", Array.from(INCIDENTE_ABERTOS))
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("programa_risco")
      .select("id, titulo, score_residual, status, data_revisao")
      .eq("programa_id", programaId)
      .in("status", ["identificado", "em_tratamento"])
      .gte("score_residual", 12)
      .order("score_residual", { ascending: false })
      .limit(limit),
  ]);

  for (const p of dsarRes.data || []) {
    const dias = daysUntil(p.data_prazo_resposta as string);
    itens.push({
      id: `dsar-${p.id}`,
      tipo: "dsar",
      programaId,
      programaNome: meta.nome,
      programaSlug: slug,
      titulo: `DSAR ${p.protocolo || `#${p.id}`}`,
      subtitulo: `${p.nome_titular} · ${p.tipo}`,
      dataReferencia: p.created_at as string,
      dataLimite: (p.data_prazo_resposta as string) || null,
      severidade: severidadeFromPrazo(dias, "dsar"),
      href: `${base}/conformidade/pedidos-titulares`,
      status: p.status as string,
    });
  }

  for (const r of reportesRes.data || []) {
    itens.push({
      id: `reporte-${r.id}`,
      tipo: "reporte",
      programaId,
      programaNome: meta.nome,
      programaSlug: slug,
      titulo: `Reporte: ${r.tipo}`,
      subtitulo: r.email as string,
      dataReferencia: r.created_at as string,
      severidade: r.status === "novo" ? "warning" : "info",
      href: `${base}/conformidade/reportes`,
      status: r.status as string,
    });
  }

  for (const c of contatoRes.data || []) {
    itens.push({
      id: `contato-${c.id}`,
      tipo: "contato",
      programaId,
      programaNome: meta.nome,
      programaSlug: slug,
      titulo: c.assunto ? String(c.assunto) : `Contato de ${c.nome}`,
      subtitulo: c.nome as string,
      dataReferencia: c.created_at as string,
      severidade: c.status === "novo" ? "warning" : "info",
      href: `${base}/conformidade/contato`,
      status: c.status as string,
    });
  }

  for (const i of incidentesRes.data || []) {
    itens.push({
      id: `incidente-${i.id}`,
      tipo: "incidente",
      programaId,
      programaNome: meta.nome,
      programaSlug: slug,
      titulo: i.titulo as string,
      subtitulo: i.status as string,
      dataReferencia: (i.data_ocorrencia as string) || (i.created_at as string),
      severidade: "warning",
      href: `${base}/conformidade/incidentes`,
      status: i.status as string,
    });
  }

  for (const r of riscosRes.data || []) {
    const diasRev = daysUntil(r.data_revisao as string);
    itens.push({
      id: `risco-${r.id}`,
      tipo: "risco",
      programaId,
      programaNome: meta.nome,
      programaSlug: slug,
      titulo: r.titulo as string,
      subtitulo: `Score ${r.score_residual}`,
      dataReferencia: (r.data_revisao as string) || new Date().toISOString(),
      dataLimite: (r.data_revisao as string) || null,
      severidade: Number(r.score_residual) >= 20 ? "critical" : "warning",
      href: `${base}/riscos`,
      status: r.status as string,
    });
  }

  const order: Record<PendenciaItem["severidade"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  itens.sort((a, b) => order[a.severidade] - order[b.severidade]);

  const limited = itens.slice(0, limit);
  const atrasados = limited.filter((i) => {
    const d = daysUntil(i.dataLimite);
    return d !== null && d < 0;
  }).length;
  const vencendo7d = limited.filter((i) => {
    const d = daysUntil(i.dataLimite);
    return d !== null && d >= 0 && d <= 7;
  }).length;
  const novos = limited.filter((i) => i.status === "novo" || i.status === "recebido").length;

  return {
    total: limited.length,
    atrasados,
    vencendo7d,
    novos,
    itens: limited,
  };
}

export async function fetchPendenciasUsuario(
  supabase: SupabaseClient,
  userId: string,
  limitPerPrograma = 8
): Promise<PendenciasResumo> {
  const { data: memberships } = await supabase
    .from("programa_users")
    .select("programa_id, programa:programa_id(id, nome, slug)")
    .eq("user_id", userId)
    .eq("status", "accepted");

  const all: PendenciaItem[] = [];
  for (const m of memberships || []) {
    const rawProg = m.programa as unknown;
    const prog = (Array.isArray(rawProg) ? rawProg[0] : rawProg) as
      | { id: number; nome: string; slug: string | null }
      | null
      | undefined;
    if (!prog?.id) continue;
    const resumo = await fetchPendenciasPrograma(
      supabase,
      prog.id,
      { id: prog.id, nome: prog.nome || `Programa ${prog.id}`, slug: prog.slug },
      limitPerPrograma
    );
    all.push(...resumo.itens);
  }

  const order: Record<PendenciaItem["severidade"], number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };
  all.sort((a, b) => order[a.severidade] - order[b.severidade]);

  const limited = all.slice(0, 40);
  const atrasados = limited.filter((i) => {
    const d = daysUntil(i.dataLimite);
    return d !== null && d < 0;
  }).length;
  const vencendo7d = limited.filter((i) => {
    const d = daysUntil(i.dataLimite);
    return d !== null && d >= 0 && d <= 7;
  }).length;
  const novos = limited.filter((i) => i.status === "novo" || i.status === "recebido").length;

  return { total: limited.length, atrasados, vencendo7d, novos, itens: limited };
}

export { daysUntil };
