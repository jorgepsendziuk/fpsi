import type { AuditorListaItem } from "./auditorPortal";
import {
  vinculoFromControle,
  vinculoFromMedida,
  vinculoGenerico,
} from "./auditorEvidenciaVinculos";
import { getPoliticaCatalogMeta } from "@/lib/politicas/politicasCatalog";

type AdminLike = { from: (table: string) => any };

async function q<T = Record<string, unknown>>(p: unknown): Promise<T[]> {
  try {
    const res = (await p) as { data?: T[] | null; error?: { message: string } | null };
    if (res?.error) return [];
    return (res.data || []) as T[];
  } catch {
    return [];
  }
}

function idsOf(rows: Record<string, unknown>[], tipo: string): number[] {
  const out: number[] = [];
  for (const r of rows) {
    if (String(r.alvo_tipo) !== tipo) continue;
    const n = Number(r.alvo_id);
    if (Number.isFinite(n)) out.push(n);
  }
  return [...new Set(out)];
}

/** Completa evidências com medida/controle/diagnóstico — sem bytes nem PII. */
export async function loadAuditorEvidencias(
  admin: AdminLike,
  programaId: number,
  evidRows: Record<string, unknown>[]
): Promise<AuditorListaItem[]> {
  if (!evidRows.length) return [];
  const evidIds = evidRows.map((r) => Number(r.id)).filter(Number.isFinite);

  const vins = await q(
    admin
      .from("evidencia_vinculo")
      .select("evidencia_id, alvo_tipo, alvo_id")
      .eq("programa_id", programaId)
      .in("evidencia_id", evidIds)
  );

  const pmIds = idsOf(vins, "programa_medida");
  const medidaDirect = idsOf(vins, "medida");
  const controleDirect = idsOf(vins, "controle");
  const riscoIds = idsOf(vins, "risco");
  const polIds = idsOf(vins, "politica");
  const planoIds = idsOf(vins, "plano_acao");
  const incIds = idsOf(vins, "incidente");
  const ripdIds = idsOf(vins, "ripd");

  const pms = pmIds.length
    ? await q<{ id: number; medida?: number; controle?: number }>(
        admin.from("programa_medida").select("id, medida, controle").in("id", pmIds)
      )
    : [];
  const pmById = new Map(pms.map((p) => [Number(p.id), p]));

  const medidaIds = [
    ...new Set([...medidaDirect, ...pms.map((p) => Number(p.medida)).filter(Number.isFinite)]),
  ];
  const medidas = medidaIds.length
    ? await q<{ id: number; id_medida?: string; medida?: string; id_controle?: number }>(
        admin.from("medida").select("id, id_medida, medida, id_controle").in("id", medidaIds)
      )
    : [];
  const medidaById = new Map(medidas.map((m) => [Number(m.id), m]));

  const controleIds = [
    ...new Set(
      [
        ...controleDirect,
        ...pms.map((p) => Number(p.controle)),
        ...medidas.map((m) => Number(m.id_controle)),
      ].filter(Number.isFinite)
    ),
  ];
  const controles = controleIds.length
    ? await q<{ id: number; numero?: number | string; nome?: string; diagnostico?: number }>(
        admin.from("controle").select("id, numero, nome, diagnostico").in("id", controleIds)
      )
    : [];
  const controleById = new Map(controles.map((c) => [Number(c.id), c]));

  const diagIds = [...new Set(controles.map((c) => Number(c.diagnostico)).filter(Number.isFinite))];
  const diags = diagIds.length
    ? await q<{ id: number; descricao?: string }>(
        admin.from("diagnostico").select("id, descricao").in("id", diagIds)
      )
    : [];
  const diagById = new Map(diags.map((d) => [Number(d.id), d]));

  const riscos = riscoIds.length
    ? await q<{ id: number; titulo?: string; nome?: string }>(
        admin.from("programa_risco").select("id, titulo, nome").in("id", riscoIds)
      )
    : [];
  const riscoById = new Map(riscos.map((r) => [Number(r.id), r]));

  const politicas = polIds.length
    ? await q<{ id: number; tipo_politica?: string }>(
        admin.from("politica_programa").select("id, tipo_politica").in("id", polIds)
      )
    : [];
  const polById = new Map(politicas.map((p) => [Number(p.id), p]));

  const planos = planoIds.length
    ? await q<{ id: number; titulo?: string }>(
        admin.from("plano_acao").select("id, titulo").in("id", planoIds)
      )
    : [];
  const planoById = new Map(planos.map((p) => [Number(p.id), p]));

  const incs = incIds.length
    ? await q<{ id: number; titulo?: string }>(
        admin.from("incidente").select("id, titulo").in("id", incIds)
      )
    : [];
  const incById = new Map(incs.map((p) => [Number(p.id), p]));

  const ripds = ripdIds.length
    ? await q<{ id: number; titulo?: string }>(
        admin.from("ripd").select("id, titulo").in("id", ripdIds)
      )
    : [];
  const ripdById = new Map(ripds.map((p) => [Number(p.id), p]));

  const vinsByEv = new Map<number, Record<string, unknown>[]>();
  for (const v of vins) {
    const eid = Number(v.evidencia_id);
    if (!vinsByEv.has(eid)) vinsByEv.set(eid, []);
    vinsByEv.get(eid)!.push(v);
  }

  const withBytes = evidIds.length
    ? await q<{ id: number }>(
        admin.from("evidencia").select("id").in("id", evidIds).not("conteudo_base64", "is", null)
      )
    : [];
  const bytesSet = new Set(withBytes.map((x) => Number(x.id)));

  return evidRows.map((r) => {
    const list = vinsByEv.get(Number(r.id)) || [];
    const vinculos = list.map((v) => {
      const tipo = String(v.alvo_tipo || "");
      const alvoId = Number(v.alvo_id);
      if (tipo === "programa_medida" || tipo === "medida") {
        const medidaId =
          tipo === "programa_medida" ? Number(pmById.get(alvoId)?.medida) : alvoId;
        const m = medidaById.get(medidaId);
        const cId = Number(m?.id_controle || pmById.get(alvoId)?.controle);
        const c = controleById.get(cId);
        const d = c?.diagnostico != null ? diagById.get(Number(c.diagnostico)) : undefined;
        return vinculoFromMedida({
          codigo: m?.id_medida,
          texto: m?.medida,
          controleNumero: c?.numero,
          controleNome: c?.nome,
          diagnosticoId: c?.diagnostico != null ? Number(c.diagnostico) : null,
          diagnosticoNome: d?.descricao,
        });
      }
      if (tipo === "controle") {
        const c = controleById.get(alvoId);
        return vinculoFromControle({
          numero: c?.numero,
          nome: c?.nome,
          diagnosticoId: c?.diagnostico != null ? Number(c.diagnostico) : null,
        });
      }
      if (tipo === "risco") {
        const row = riscoById.get(alvoId);
        return vinculoGenerico("risco", row?.titulo || row?.nome);
      }
      if (tipo === "politica") {
        const tipoPol = polById.get(alvoId)?.tipo_politica;
        const meta = tipoPol ? getPoliticaCatalogMeta(tipoPol) : undefined;
        return vinculoGenerico("politica", meta?.nome || tipoPol);
      }
      if (tipo === "plano_acao") return vinculoGenerico("plano_acao", planoById.get(alvoId)?.titulo);
      if (tipo === "incidente") return vinculoGenerico("incidente", incById.get(alvoId)?.titulo);
      if (tipo === "ripd") return vinculoGenerico("ripd", ripdById.get(alvoId)?.titulo);
      return vinculoGenerico(tipo, String(v.alvo_id || ""));
    });

    const tags: string[] = [];
    if (r.categoria) tags.push(String(r.categoria));
    if (r.versao) tags.push(`v${r.versao}`);
    if (r.validade) tags.push(`validade ${String(r.validade).slice(0, 10)}`);

    const nomeArq = String(r.nome_arquivo || "").trim();
    const rawTitulo = String(r.titulo || "").trim();
    const pareceNomeArquivo = /\.[a-zA-Z0-9]{2,5}$/.test(rawTitulo);
    const tituloFeio = !rawTitulo || pareceNomeArquivo || (nomeArq && rawTitulo === nomeArq);
    const titulo = tituloFeio ? vinculos[0]?.rotulo || "Evidência" : rawTitulo;

    const campos: { rotulo: string; valor: string }[] = [];
    if (r.categoria) campos.push({ rotulo: "Tipo", valor: String(r.categoria) });
    if (r.versao) campos.push({ rotulo: "Versão", valor: `v${r.versao}` });
    if (r.validade) campos.push({ rotulo: "Validade", valor: String(r.validade).slice(0, 10) });
    const bytes = Number(r.tamanho_bytes);
    if (Number.isFinite(bytes) && bytes > 0) {
      const kb =
        bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      campos.push({ rotulo: "Tamanho", valor: kb });
    }

    const temLink = Boolean(r.url_externa);
    const temArquivo = bytesSet.has(Number(r.id));

    return {
      id: (r.id as string | number) ?? "",
      titulo,
      detalhe: vinculos[0]?.rotulo,
      descricao: r.descricao ? String(r.descricao) : undefined,
      status: r.status ? String(r.status) : undefined,
      data: r.created_at ? String(r.created_at) : null,
      categoria: r.categoria ? String(r.categoria) : undefined,
      tags,
      vinculos,
      campos,
      baixavel: temLink || temArquivo,
      arquivoTipo: temArquivo ? "arquivo" : temLink ? "link" : undefined,
    };
  });
}
