#!/usr/bin/env node
/**
 * Aplica o backfill empresa → framework quando `supabase db push` não está disponível.
 * Uso: node scripts/backfill-empresa-framework-pack.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env.local");
const env = readFileSync(envPath, "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};

const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local");
  process.exit(1);
}

const sup = createClient(url, key);

const { data: programas, error: pErr } = await sup
  .from("programa")
  .select("id,nome,setor")
  .neq("setor", 1);
if (pErr) throw pErr;

const { data: controles } = await sup.from("controle").select("id,numero,diagnostico,pack_id");
const ppsi = (controles ?? []).filter((c) => c.pack_id === "ppsi-2.0");
const fw = (controles ?? []).filter((c) => c.pack_id === "framework");
const fwByKey = new Map(fw.map((c) => [`${c.diagnostico}:${c.numero}`, c.id]));

function fwControleId(ppsiControleId) {
  const c = ppsi.find((x) => x.id === ppsiControleId);
  if (!c) return null;
  return fwByKey.get(`${c.diagnostico}:${c.numero}`) ?? null;
}

for (const prog of programas ?? []) {
  const pid = prog.id;
  console.log(`\n=== Programa #${pid} (${prog.nome}) setor=${prog.setor} ===`);

  const { data: pcs } = await sup.from("programa_controle").select("id,controle,nivel").eq("programa", pid);
  const byControle = new Map();
  for (const row of pcs ?? []) {
    if (!byControle.has(row.controle)) byControle.set(row.controle, []);
    byControle.get(row.controle).push(row);
  }

  for (const [, rows] of byControle) {
    if (rows.length <= 1) continue;
    rows.sort((a, b) => a.id - b.id);
    const drop = rows.slice(1).map((r) => r.id);
    await sup.from("programa_controle").delete().in("id", drop);
    console.log(`  dedupe programa_controle: removed ${drop.length} rows`);
  }

  const { data: pcs2 } = await sup.from("programa_controle").select("id,controle,nivel").eq("programa", pid);
  const existingFw = new Set((pcs2 ?? []).filter((r) => r.controle >= 1000).map((r) => r.controle));

  for (const row of pcs2 ?? []) {
    if (row.controle > 0 && row.controle <= 27) {
      const target = fwControleId(row.controle);
      if (target && !existingFw.has(target)) {
        await sup.from("programa_controle").insert({ programa: pid, controle: target, nivel: row.nivel ?? 1 });
        existingFw.add(target);
      }
      await sup.from("programa_controle").delete().eq("id", row.id);
    }
  }
  console.log("  programa_controle: ppsi removidos, framework garantidos");

  const { data: pms } = await sup
    .from("programa_medida")
    .select("*")
    .eq("programa", pid)
    .gte("medida", 1)
    .lte("medida", 210);

  const { data: pmFwExisting } = await sup
    .from("programa_medida")
    .select("id,medida")
    .eq("programa", pid)
    .gte("medida", 10001)
    .lte("medida", 10210);
  const fwMedidaSet = new Set((pmFwExisting ?? []).map((r) => r.medida));

  const pickText = (a, b) => {
    const t = (s) => (s && String(s).trim() ? s : null);
    return t(a) ?? t(b) ?? a ?? b;
  };

  for (const old of pms ?? []) {
    const newMedidaId = old.medida + 10000;
    const newControle =
      old.controle != null && old.controle <= 27 ? old.controle + 1000 : old.controle;

    if (fwMedidaSet.has(newMedidaId)) {
      const { data: fwRow } = await sup
        .from("programa_medida")
        .select("*")
        .eq("programa", pid)
        .eq("medida", newMedidaId)
        .maybeSingle();
      if (fwRow) {
        await sup
          .from("programa_medida")
          .update({
            resposta: pickText(fwRow.resposta, old.resposta),
            justificativa: pickText(fwRow.justificativa, old.justificativa),
            observacao_orgao: pickText(fwRow.observacao_orgao, old.observacao_orgao),
            nova_resposta: pickText(fwRow.nova_resposta, old.nova_resposta),
            encaminhamento_interno: pickText(fwRow.encaminhamento_interno, old.encaminhamento_interno),
            responsavel: fwRow.responsavel ?? old.responsavel,
            previsao_inicio: fwRow.previsao_inicio ?? old.previsao_inicio,
            previsao_fim: fwRow.previsao_fim ?? old.previsao_fim,
            status_medida: fwRow.status_medida ?? old.status_medida,
            status_plano_acao: fwRow.status_plano_acao ?? old.status_plano_acao,
            controle: fwRow.controle ?? newControle,
          })
          .eq("id", fwRow.id);
      }
    } else {
      const { id, ...rest } = old;
      await sup.from("programa_medida").insert({
        ...rest,
        medida: newMedidaId,
        controle: newControle,
      });
      fwMedidaSet.add(newMedidaId);
    }
    await sup.from("programa_medida").delete().eq("id", old.id);
  }
  console.log(`  programa_medida: migradas ${(pms ?? []).length} linhas PPSI → framework`);
}

console.log("\nBackfill concluído.");