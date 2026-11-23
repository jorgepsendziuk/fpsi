#!/usr/bin/env node
/**
 * Clona o programa PCO (PPSI) para pco-2 (catálogo framework enxuto):
 * respostas por controle/medida, níveis de maturidade, módulos GRC (riscos, planos, ativos, ROPA…).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(resolve(ROOT, ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};
const sup = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"));

const SOURCE_SLUG = "pco";
const TARGET_SLUG = "pco-2";
const TARGET_NOME = "PCO — framework empresa (comparativo)";

const pickText = (a, b) => {
  const t = (s) => (s && String(s).trim() ? s : null);
  return t(a) ?? t(b) ?? a ?? b;
};

function omitKeys(row, keys) {
  const out = { ...row };
  for (const k of keys) delete out[k];
  return out;
}

async function loadPackControles(packId) {
  const { data, error } = await sup.from("controle").select("id,numero,diagnostico,pack_id").eq("pack_id", packId);
  if (error) throw error;
  const byKey = new Map();
  for (const c of data ?? []) {
    byKey.set(`${c.diagnostico}:${c.numero}`, c.id);
  }
  return { list: data ?? [], byKey };
}

async function loadMedidasByControle(packId) {
  const { data: medidas, error } = await sup
    .from("medida")
    .select("id,id_controle")
    .eq("pack_id", packId)
    .order("id", { ascending: true });
  if (error) throw error;
  const byCtrl = new Map();
  for (const m of medidas ?? []) {
    if (!byCtrl.has(m.id_controle)) byCtrl.set(m.id_controle, []);
    byCtrl.get(m.id_controle).push(m.id);
  }
  const allIds = new Set((medidas ?? []).map((m) => m.id));
  return { byCtrl, allIds };
}

async function buildPpsiToFrameworkMedidaMap() {
  const ppsi = await loadPackControles("ppsi-2.0");
  const fw = await loadPackControles("framework");
  const ppsiMed = await loadMedidasByControle("ppsi-2.0");
  const fwMed = await loadMedidasByControle("framework");

  const map = new Map();

  for (const pc of ppsi.list) {
    const fwCtrl = fw.byKey.get(`${pc.diagnostico}:${pc.numero}`);
    if (!fwCtrl) continue;
    const srcList = ppsiMed.byCtrl.get(pc.id) ?? [];
    const tgtList = fwMed.byCtrl.get(fwCtrl) ?? [];
    const n = Math.min(srcList.length, tgtList.length);
    for (let i = 0; i < n; i++) {
      map.set(srcList[i], tgtList[i]);
    }
    if (tgtList.length > 0 && srcList.length > tgtList.length) {
      for (let i = tgtList.length; i < srcList.length; i++) {
        map.set(srcList[i], tgtList[tgtList.length - 1]);
      }
    }
  }

  for (const srcId of ppsiMed.allIds) {
    const shifted = srcId + 10000;
    if (fwMed.allIds.has(shifted)) map.set(srcId, shifted);
  }

  return map;
}

async function dedupeProgramaControle(programaId) {
  const { data: pcs } = await sup.from("programa_controle").select("id,controle").eq("programa", programaId);
  const byC = new Map();
  for (const r of pcs ?? []) {
    if (!byC.has(r.controle)) byC.set(r.controle, []);
    byC.get(r.controle).push(r.id);
  }
  let removed = 0;
  for (const ids of byC.values()) {
    if (ids.length <= 1) continue;
    ids.sort((a, b) => a - b);
    await sup.from("programa_controle").delete().in("id", ids.slice(1));
    removed += ids.length - 1;
  }
  return removed;
}

async function upsertProgramaControleRow(programa, controle, nivel) {
  const { data: existing, error: selErr } = await sup
    .from("programa_controle")
    .select("id")
    .eq("programa", programa)
    .eq("controle", controle)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) {
    const { error } = await sup.from("programa_controle").update({ nivel }).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await sup.from("programa_controle").insert({ programa, controle, nivel });
    if (error) throw error;
  }
}

async function syncProgramaControleFromPpsi(pidSrc, pidTgt) {
  const ppsi = await loadPackControles("ppsi-2.0");
  const fw = await loadPackControles("framework");

  const { data: srcPc } = await sup.from("programa_controle").select("controle,nivel").eq("programa", pidSrc);
  const nivelByPpsi = new Map((srcPc ?? []).map((r) => [r.controle, r.nivel ?? 1]));

  const { data: ctrlMeta } = await sup.from("controle").select("id,pack_id");
  const packById = new Map((ctrlMeta ?? []).map((c) => [c.id, c.pack_id]));

  await sup.from("programa_controle").delete().eq("programa", pidTgt);

  for (const pc of ppsi.list) {
    const fwId = fw.byKey.get(`${pc.diagnostico}:${pc.numero}`);
    if (!fwId) continue;
    const nivel = nivelByPpsi.get(pc.id) ?? 1;
    await upsertProgramaControleRow(pidTgt, fwId, nivel);
  }

  for (const row of srcPc ?? []) {
    if (packById.get(row.controle) === "governanca-ia") {
      await upsertProgramaControleRow(pidTgt, row.controle, row.nivel ?? 1);
    }
  }

  const { data: allFwCtrls } = await sup
    .from("controle")
    .select("id")
    .eq("pack_id", "framework")
    .gte("id", 1001)
    .lte("id", 1017);
  for (const c of allFwCtrls ?? []) {
    const { data: has } = await sup
      .from("programa_controle")
      .select("id")
      .eq("programa", pidTgt)
      .eq("controle", c.id)
      .maybeSingle();
    if (!has) await upsertProgramaControleRow(pidTgt, c.id, 1);
  }
}

async function syncProgramaMedida(pidSrc, pidTgt, medMap) {
  await sup.from("programa_medida").delete().eq("programa", pidTgt).lte("medida", 1027);

  const { data: fwMeds } = await sup.from("medida").select("id").eq("pack_id", "framework").gte("id", 10001).lte("id", 10102);
  for (const m of fwMeds ?? []) {
    const fwCtrl = Math.floor((m.id - 10001) / 6) + 1001;
    await sup
      .from("programa_medida")
      .upsert(
        { programa: pidTgt, medida: m.id, controle: fwCtrl, resposta: null },
        { onConflict: "programa,medida", ignoreDuplicates: true }
      );
  }

  const { data: srcPm } = await sup.from("programa_medida").select("*").eq("programa", pidSrc).lte("medida", 210);
  const byFwMed = new Map();
  let skipped = 0;
  for (const pm of srcPm ?? []) {
    const fwMed = medMap.get(pm.medida);
    if (!fwMed) {
      skipped++;
      continue;
    }
    const hasContent =
      (pm.resposta != null && String(pm.resposta).trim() !== "") ||
      (pm.justificativa != null && String(pm.justificativa).trim() !== "") ||
      pm.nova_resposta != null;
    if (!hasContent) continue;
    if (!byFwMed.has(fwMed)) byFwMed.set(fwMed, []);
    byFwMed.get(fwMed).push(pm);
  }

  let copied = 0;
  for (const [fwMed, rows] of byFwMed) {
    const merged = { ...rows[0] };
    const joinText = (field) =>
      rows
        .map((r) => (r[field] != null && String(r[field]).trim() ? String(r[field]).trim() : ""))
        .filter(Boolean)
        .join("\n\n");
    merged.justificativa = joinText("justificativa") || merged.justificativa;
    merged.observacao_orgao = joinText("observacao_orgao") || merged.observacao_orgao;
    merged.encaminhamento_interno = joinText("encaminhamento_interno") || merged.encaminhamento_interno;
    const bestResposta = rows.find((r) => r.resposta != null && String(r.resposta).trim());
    merged.resposta = bestResposta?.resposta ?? merged.resposta;
    merged.nova_resposta = bestResposta?.nova_resposta ?? merged.nova_resposta;

    const { data: existing } = await sup
      .from("programa_medida")
      .select("*")
      .eq("programa", pidTgt)
      .eq("medida", fwMed)
      .maybeSingle();

    const fwCtrl = Math.floor((fwMed - 10001) / 6) + 1001;
    const { id, programa, medida, controle, ...fields } = merged;
    const payload = {
      ...(existing ?? {}),
      ...fields,
      programa: pidTgt,
      medida: fwMed,
      controle: fwCtrl,
      resposta: pickText(existing?.resposta, merged.resposta),
      justificativa: pickText(existing?.justificativa, merged.justificativa),
      observacao_orgao: pickText(existing?.observacao_orgao, merged.observacao_orgao),
      nova_resposta: pickText(existing?.nova_resposta, merged.nova_resposta),
      encaminhamento_interno: pickText(existing?.encaminhamento_interno, merged.encaminhamento_interno),
      responsavel: existing?.responsavel ?? merged.responsavel,
      previsao_inicio: existing?.previsao_inicio ?? merged.previsao_inicio,
      previsao_fim: existing?.previsao_fim ?? merged.previsao_fim,
      status_medida: existing?.status_medida ?? merged.status_medida,
      status_plano_acao: existing?.status_plano_acao ?? merged.status_plano_acao,
    };
    if (existing) {
      await sup.from("programa_medida").update(payload).eq("id", existing.id);
    } else {
      await sup.from("programa_medida").insert(payload);
    }
    copied++;
  }
  return { copied, skipped };
}

async function clearTargetGrm(pidTgt) {
  await sup.from("plano_acao").delete().eq("programa_id", pidTgt);
  await sup.from("ripd").delete().eq("programa_id", pidTgt);
  await sup.from("mapeamento_dados").delete().eq("programa_id", pidTgt);
  await sup.from("programa_risco").delete().eq("programa_id", pidTgt);
  await sup.from("registro_ropa").delete().eq("programa_id", pidTgt);
  await sup.from("programa_sistema").delete().eq("programa_id", pidTgt);
  await sup.from("programa_fornecedor").delete().eq("programa_id", pidTgt);
}

async function cloneGrm(pidSrc, pidTgt, medMap) {
  const fornecedorMap = new Map();
  const { data: forn } = await sup.from("programa_fornecedor").select("*").eq("programa_id", pidSrc);
  for (const row of forn ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    const { data: ins, error } = await sup.from("programa_fornecedor").insert(payload).select("id").single();
    if (error) throw error;
    fornecedorMap.set(row.id, ins.id);
  }

  const sistemaMap = new Map();
  const { data: sis } = await sup.from("programa_sistema").select("*").eq("programa_id", pidSrc);
  for (const row of sis ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    if (row.fornecedor_id && fornecedorMap.has(row.fornecedor_id)) {
      payload.fornecedor_id = fornecedorMap.get(row.fornecedor_id);
    } else {
      payload.fornecedor_id = null;
    }
    payload.processo_id = null;
    const { data: ins, error } = await sup.from("programa_sistema").insert(payload).select("id").single();
    if (error) throw error;
    sistemaMap.set(row.id, ins.id);
  }

  const mapeamentoMap = new Map();
  const { data: maps } = await sup.from("mapeamento_dados").select("*").eq("programa_id", pidSrc);
  for (const row of maps ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    payload.sistema_id = row.sistema_id && sistemaMap.has(row.sistema_id) ? sistemaMap.get(row.sistema_id) : null;
    payload.fornecedor_id =
      row.fornecedor_id && fornecedorMap.has(row.fornecedor_id) ? fornecedorMap.get(row.fornecedor_id) : null;
    payload.processo_id = null;
    const { data: ins, error } = await sup.from("mapeamento_dados").insert(payload).select("id").single();
    if (error) throw error;
    mapeamentoMap.set(row.id, ins.id);
  }

  const ropaMap = new Map();
  const { data: ropas } = await sup.from("registro_ropa").select("*").eq("programa_id", pidSrc);
  for (const row of ropas ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    const { data: ins, error } = await sup.from("registro_ropa").insert(payload).select("id").single();
    if (error) throw error;
    ropaMap.set(row.id, ins.id);
  }

  const ripdMap = new Map();
  const { data: ripds } = await sup.from("ripd").select("*").eq("programa_id", pidSrc);
  for (const row of ripds ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    payload.ropa_id = row.ropa_id && ropaMap.has(row.ropa_id) ? ropaMap.get(row.ropa_id) : row.ropa_id;
    const { data: ins, error } = await sup.from("ripd").insert(payload).select("id").single();
    if (error) throw error;
    ripdMap.set(row.id, ins.id);
  }

  const riscoMap = new Map();
  const { data: riscos } = await sup.from("programa_risco").select("*").eq("programa_id", pidSrc);
  for (const row of riscos ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    payload.sistema_id = row.sistema_id && sistemaMap.has(row.sistema_id) ? sistemaMap.get(row.sistema_id) : null;
    payload.fornecedor_id =
      row.fornecedor_id && fornecedorMap.has(row.fornecedor_id) ? fornecedorMap.get(row.fornecedor_id) : null;
    payload.processo_id = null;
    const { data: ins, error } = await sup.from("programa_risco").insert(payload).select("id").single();
    if (error) throw error;
    riscoMap.set(row.id, ins.id);
  }

  const { data: planos } = await sup.from("plano_acao").select("*").eq("programa_id", pidSrc);
  for (const row of planos ?? []) {
    const payload = omitKeys(row, ["id", "created_at", "updated_at"]);
    payload.programa_id = pidTgt;
    payload.risco_id = row.risco_id && riscoMap.has(row.risco_id) ? riscoMap.get(row.risco_id) : null;
    if (row.programa_medida_id) {
      const { data: srcPm } = await sup
        .from("programa_medida")
        .select("medida")
        .eq("id", row.programa_medida_id)
        .maybeSingle();
      const fwMed = srcPm?.medida ? medMap.get(srcPm.medida) : null;
      if (fwMed) {
        const { data: tgtPm } = await sup
          .from("programa_medida")
          .select("id")
          .eq("programa", pidTgt)
          .eq("medida", fwMed)
          .maybeSingle();
        payload.programa_medida_id = tgtPm?.id ?? null;
      } else {
        payload.programa_medida_id = null;
      }
    }
    const { error } = await sup.from("plano_acao").insert(payload);
    if (error) throw error;
  }

  return {
    fornecedores: fornecedorMap.size,
    sistemas: sistemaMap.size,
    mapeamentos: mapeamentoMap.size,
    ropas: ropaMap.size,
    ripds: ripdMap.size,
    riscos: riscoMap.size,
    planos: (planos ?? []).length,
  };
}

async function main() {
  const { data: src, error: srcErr } = await sup.from("programa").select("*").eq("slug", SOURCE_SLUG).single();
  if (srcErr || !src) throw new Error(`Programa origem ${SOURCE_SLUG} não encontrado`);

  const escopo = {
    ...(typeof src.escopo === "object" && src.escopo ? src.escopo : {}),
    v: 1,
    operational_pack_id: "framework",
  };

  let { data: tgt } = await sup.from("programa").select("id").eq("slug", TARGET_SLUG).maybeSingle();
  if (!tgt) {
    const { id: _id, created_at, updated_at, slug, nome, escopo: _e, ...rest } = src;
    const { data: inserted, error } = await sup
      .from("programa")
      .insert({
        ...rest,
        slug: TARGET_SLUG,
        nome: TARGET_NOME,
        nome_fantasia: "PCO — catálogo framework (FPSI)",
        setor: 2,
        escopo,
        perfil_escopo: src.perfil_escopo ?? "completo",
      })
      .select("id")
      .single();
    if (error) throw error;
    tgt = inserted;
    console.log("Criado programa", TARGET_SLUG, "id", tgt.id);
  } else {
    const { empresa, atividade, endereco, ...keep } = src;
    await sup
      .from("programa")
      .update({
        nome: TARGET_NOME,
        nome_fantasia: "PCO — catálogo framework (FPSI)",
        setor: 2,
        escopo,
        perfil_escopo: src.perfil_escopo ?? "completo",
        empresa,
        atividade: src.atividade,
        endereco: src.endereco,
      })
      .eq("id", tgt.id);
    console.log("Atualizado programa", TARGET_SLUG, "id", tgt.id);
  }

  const pidSrc = src.id;
  const pidTgt = tgt.id;

  const { data: users } = await sup
    .from("programa_users")
    .select("*")
    .eq("programa_id", pidSrc)
    .then(async (r1) => {
      if (!r1.error && (r1.data?.length ?? 0) > 0) return r1;
      return sup.from("programa_users").select("*").eq("programa", pidSrc);
    });
  for (const u of users.data ?? []) {
    const { id, programa_id, programa, ...row } = u;
    const rowPrograma = programa_id ?? programa;
    const payload = { ...row, programa_id: pidTgt };
    if (programa != null) payload.programa = pidTgt;
    const { data: ex } = await sup
      .from("programa_users")
      .select("id")
      .eq("programa_id", pidTgt)
      .eq("user_id", u.user_id)
      .maybeSingle();
    if (ex) await sup.from("programa_users").update(payload).eq("id", ex.id);
    else await sup.from("programa_users").insert(payload);
  }

  const medMap = await buildPpsiToFrameworkMedidaMap();
  console.log("Mapeamentos medida PPSI→framework:", medMap.size);

  const deduped = await dedupeProgramaControle(pidTgt);
  if (deduped) console.log("Dedupe programa_controle:", deduped);

  await syncProgramaControleFromPpsi(pidSrc, pidTgt);
  console.log("programa_controle sincronizado (framework + IA)");

  const { copied, skipped } = await syncProgramaMedida(pidSrc, pidTgt, medMap);
  console.log("Respostas copiadas:", copied, "origem sem par no framework:", skipped);

  await clearTargetGrm(pidTgt);
  const grm = await cloneGrm(pidSrc, pidTgt, medMap);
  console.log("GRC clonado:", grm);

  console.log("Origem:", `/programas/${pidSrc}/diagnostico`, "→", `/programas/${pidTgt}/diagnostico`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});