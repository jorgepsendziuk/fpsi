#!/usr/bin/env node
/** Reparo pontual: PCO #41 → PPSI; #36/#37/#38 framework completo. */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const env = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};
const sup = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"));

const PPSI_CONTROLES = Array.from({ length: 27 }, (_, i) => i + 1);
const FW_CONTROLES = Array.from({ length: 27 }, (_, i) => 1001 + i);

const { data: controles } = await sup.from("controle").select("id,pack_id");
const iaControleIds = (controles ?? []).filter((c) => c.pack_id === "governanca-ia").map((c) => c.id);

async function dedupePc(programaId) {
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
    const drop = ids.slice(1);
    await sup.from("programa_controle").delete().in("id", drop);
    removed += drop.length;
  }
  return removed;
}

async function audit(programaId) {
  const { data: pcs } = await sup.from("programa_controle").select("controle").eq("programa", programaId);
  const ids = pcs?.map((r) => r.controle) ?? [];
  const { data: meta } = await sup.from("controle").select("id,pack_id").in("id", ids.length ? ids : [-1]);
  const packs = {};
  for (const c of meta ?? []) packs[c.pack_id] = (packs[c.pack_id] || 0) + 1;
  const { count: pmLo } = await sup.from("programa_medida").select("id", { count: "exact", head: true }).eq("programa", programaId).gte("medida", 1).lte("medida", 210);
  const { count: pmFw } = await sup.from("programa_medida").select("id", { count: "exact", head: true }).eq("programa", programaId).gte("medida", 10001).lte("medida", 10210);
  return { packs, pc: ids.length, pmLo, pmFw };
}

// --- 1) PCO #41 → PPSI ---
const PCO = 41;
console.log("=== Revert PCO #41 ===");

// Copiar respostas framework → PPSI onde ainda não existe em 1-210
const { data: pmFw41 } = await sup
  .from("programa_medida")
  .select("*")
  .eq("programa", PCO)
  .gte("medida", 10001)
  .lte("medida", 10210);
for (const fw of pmFw41 ?? []) {
  const ppsiMedida = fw.medida - 10000;
  const { data: existing } = await sup
    .from("programa_medida")
    .select("id")
    .eq("programa", PCO)
    .eq("medida", ppsiMedida)
    .maybeSingle();
  const payload = {
    programa: PCO,
    medida: ppsiMedida,
    resposta: fw.resposta,
    justificativa: fw.justificativa,
    observacao_orgao: fw.observacao_orgao,
    nova_resposta: fw.nova_resposta,
    encaminhamento_interno: fw.encaminhamento_interno,
    responsavel: fw.responsavel,
    previsao_inicio: fw.previsao_inicio,
    previsao_fim: fw.previsao_fim,
    status_medida: fw.status_medida,
    status_plano_acao: fw.status_plano_acao,
    controle: fw.controle != null && fw.controle >= 1001 ? fw.controle - 1000 : fw.controle,
  };
  if (existing) {
    await sup.from("programa_medida").update(payload).eq("id", existing.id);
  } else {
    await sup.from("programa_medida").insert(payload);
  }
}

await sup.from("programa_medida").delete().eq("programa", PCO).gte("medida", 10001).lte("medida", 10210);

const fwPcIds = (await sup.from("programa_controle").select("id,controle,nivel").eq("programa", PCO)).data ?? [];
const nivelByFw = new Map(fwPcIds.filter((r) => r.controle >= 1001 && r.controle <= 1027).map((r) => [r.controle - 1000, r.nivel]));

await sup
  .from("programa_controle")
  .delete()
  .eq("programa", PCO)
  .gte("controle", 1001)
  .lte("controle", 1027);

const { data: existingPc41 } = await sup.from("programa_controle").select("controle").eq("programa", PCO);
const havePc = new Set((existingPc41 ?? []).map((r) => r.controle));

for (const cId of PPSI_CONTROLES) {
  if (havePc.has(cId)) continue;
  await sup.from("programa_controle").insert({
    programa: PCO,
    controle: cId,
    nivel: nivelByFw.get(cId) ?? 1,
  });
}

await dedupePc(PCO);

// PPSI na UI exige setor órgão (pack ppsi-2.0)
await sup.from("programa").update({ setor: 1 }).eq("id", PCO);

console.log("PCO após:", await audit(PCO));

// --- 2) #36, #37, #38 framework ---
async function ensureFwControle1001(programaId) {
  const { data: row } = await sup
    .from("programa_controle")
    .select("id")
    .eq("programa", programaId)
    .eq("controle", 1001)
    .maybeSingle();
  if (row) return "1001 já existe";
  const { data: ref } = await sup
    .from("programa_controle")
    .select("nivel")
    .eq("programa", programaId)
    .eq("controle", 1002)
    .maybeSingle();
  await sup.from("programa_controle").insert({ programa: programaId, controle: 1001, nivel: ref?.nivel ?? 1 });
  return "1001 inserido";
}

async function ensureFwMedidas210(programaId) {
  const { data: existing } = await sup
    .from("programa_medida")
    .select("medida")
    .eq("programa", programaId)
    .gte("medida", 10001)
    .lte("medida", 10210);
  const have = new Set((existing ?? []).map((r) => r.medida));
  let inserted = 0;
  for (let m = 10001; m <= 10210; m++) {
    if (have.has(m)) continue;
    const { data: med } = await sup.from("medida").select("id_controle").eq("id", m).maybeSingle();
    await sup.from("programa_medida").insert({
      programa: programaId,
      medida: m,
      controle: med?.id_controle ?? null,
    });
    inserted++;
  }
  return inserted;
}

for (const pid of [36, 37, 38]) {
  console.log(`\n=== Framework finish #${pid} ===`);
  console.log(await ensureFwControle1001(pid));
  if (pid === 38) {
    const n = await ensureFwMedidas210(pid);
    console.log(`medidas framework inseridas: ${n}`);
  }
  console.log("após:", await audit(pid));
}

console.log("\nConcluído.");