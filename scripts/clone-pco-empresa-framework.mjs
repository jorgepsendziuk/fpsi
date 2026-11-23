#!/usr/bin/env node
/**
 * Clona o programa PCO (PPSI) para pco-2 (catálogo framework v2),
 * copiando respostas/justificativas por alinhamento de controle + ordem da medida.
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

async function loadMedidaRankMap(packId) {
  const { data: medidas, error } = await sup
    .from("medida")
    .select("id,id_controle,pack_id")
    .eq("pack_id", packId)
    .order("id", { ascending: true });
  if (error) throw error;
  const { data: controles } = await sup
    .from("controle")
    .select("id,numero,pack_id")
    .eq("pack_id", packId);
  const ctrlNum = new Map((controles ?? []).map((c) => [c.id, c.numero]));
  const rankInCtrl = new Map();
  const mapKeyToId = new Map();
  for (const m of medidas ?? []) {
    const key = `${ctrlNum.get(m.id_controle)}:${(rankInCtrl.get(m.id_controle) ?? 0) + 1}`;
    rankInCtrl.set(m.id_controle, (rankInCtrl.get(m.id_controle) ?? 0) + 1);
    mapKeyToId.set(key, m.id);
  }
  return { mapKeyToId, ctrlNum };
}

function buildPpsiToFrameworkMap(ppsi, fw) {
  const out = new Map();
  for (const [key, ppsiId] of ppsi.mapKeyToId) {
    const fwId = fw.mapKeyToId.get(key);
    if (fwId) out.set(ppsiId, fwId);
  }
  return out;
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
        escopo,
        perfil_escopo: src.perfil_escopo ?? "essencial",
      })
      .select("id")
      .single();
    if (error) throw error;
    tgt = inserted;
    console.log("Criado programa", TARGET_SLUG, "id", tgt.id);
  } else {
    await sup.from("programa").update({ nome: TARGET_NOME, escopo }).eq("id", tgt.id);
    console.log("Atualizado programa", TARGET_SLUG, "id", tgt.id);
  }

  const pidSrc = src.id;
  const pidTgt = tgt.id;

  const { data: users } = await sup.from("programa_users").select("*").eq("programa_id", pidSrc);
  for (const u of users ?? []) {
    const { id, programa_id, ...row } = u;
    await sup.from("programa_users").upsert({ ...row, programa_id: pidTgt }, { onConflict: "programa_id,user_id" });
  }

  const ppsiMaps = await loadMedidaRankMap("ppsi-2.0");
  const fwMaps = await loadMedidaRankMap("framework");
  const medMap = buildPpsiToFrameworkMap(ppsiMaps, fwMaps);
  console.log("Mapeamentos PPSI→framework:", medMap.size);

  const { data: fwCtrls } = await sup.from("controle").select("id").eq("pack_id", "framework").gte("id", 1001).lte("id", 1017);
  for (const c of fwCtrls ?? []) {
    await sup.from("programa_controle").upsert(
      { programa: pidTgt, controle: c.id, nivel: 1 },
      { onConflict: "programa,controle", ignoreDuplicates: true }
    );
  }

  const { data: srcPm } = await sup.from("programa_medida").select("*").eq("programa", pidSrc);
  let copied = 0;
  let skipped = 0;
  for (const pm of srcPm ?? []) {
    const fwMed = medMap.get(pm.medida);
    if (!fwMed) {
      skipped++;
      continue;
    }
    const { id, programa, medida, controle, ...fields } = pm;
    const fwCtrl = Math.floor((fwMed - 10001) / 6) + 1001;
    await sup.from("programa_medida").upsert(
      {
        ...fields,
        programa: pidTgt,
        medida: fwMed,
        controle: fwCtrl,
      },
      { onConflict: "programa,medida" }
    );
    copied++;
  }

  console.log("Respostas copiadas:", copied, "ignoradas (sem par framework):", skipped);
  console.log("Origem:", `/programas/${pidSrc}/diagnostico`, "→ Novo:", `/programas/${pidTgt}/diagnostico`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});