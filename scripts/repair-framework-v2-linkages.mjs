#!/usr/bin/env node
/**
 * Antes de aplicar 20261122180000_framework_catalog_v2_lean.sql:
 * migra programa_medida 10001–10210 → 10001–10102 e limpa programa_controle 1018–1027.
 */
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

const CTRL_V1_TO_V2 = {
  1001: 1001, 1002: 1001, 1003: 1002, 1004: 1002, 1005: 1003, 1006: 1004,
  1007: 1005, 1008: 1005, 1009: 1006, 1010: 1007, 1011: 1008, 1012: 1008,
  1013: 1009, 1014: 1007, 1015: 1007, 1016: 1010, 1017: 1011, 1018: 1012,
  1019: 1013, 1020: 1013, 1021: 1014, 1022: 1014, 1023: 1015, 1024: 1016,
  1025: 1017, 1026: 1016, 1027: 1017,
};

const MEDIDAS_PER_CTRL = 6;

function newControlOrdem(ctrlId) {
  return ctrlId - 1000;
}

function targetMedidaId(newCtrlId, slotIndex) {
  const ordem = newControlOrdem(newCtrlId);
  return 10000 + (ordem - 1) * MEDIDAS_PER_CTRL + slotIndex + 1;
}

async function main() {
  const { data: medidas } = await sup
    .from("medida")
    .select("id,id_controle")
    .eq("pack_id", "framework")
    .gte("id", 10001)
    .lte("id", 10210);
  const medToCtrl = new Map((medidas ?? []).map((m) => [m.id, m.id_controle]));

  const { data: programas } = await sup.from("programa").select("id,setor,escopo").neq("setor", 1);
  const frameworkProgramIds = [];
  for (const p of programas ?? []) {
    const esc = p.escopo;
    if (esc && typeof esc === "object" && esc.operational_pack_id === "ppsi-2.0") continue;
    const { data: pcs } = await sup.from("programa_controle").select("controle").eq("programa", p.id);
    const ids = pcs?.map((r) => r.controle) ?? [];
    const hasFramework = ids.some((id) => id >= 1001 && id <= 1027);
    const hasPpsiOnly = ids.some((id) => id >= 1 && id <= 27) && !hasFramework;
    if (hasPpsiOnly) continue;
    if (hasFramework || esc?.operational_pack_id === "framework") frameworkProgramIds.push(p.id);
  }

  console.log("Programas framework a reparar:", frameworkProgramIds);

  for (const pid of frameworkProgramIds) {
    await sup.from("programa_controle").delete().eq("programa", pid).gte("controle", 1018).lte("controle", 1027);

    const { data: pms } = await sup
      .from("programa_medida")
      .select("*")
      .eq("programa", pid)
      .gte("medida", 10001)
      .lte("medida", 10210);

    const slotByTarget = new Map();
    for (const pm of pms ?? []) {
      const oldCtrl = medToCtrl.get(pm.medida) ?? pm.controle;
      const newCtrl = CTRL_V1_TO_V2[oldCtrl];
      if (!newCtrl) continue;
      const slot = slotByTarget.get(newCtrl) ?? 0;
      slotByTarget.set(newCtrl, slot + 1);
      const newMed = targetMedidaId(newCtrl, slot % MEDIDAS_PER_CTRL);

      const { data: existing } = await sup
        .from("programa_medida")
        .select("id,resposta,justificativa")
        .eq("programa", pid)
        .eq("medida", newMed)
        .maybeSingle();

      const merge = (a, b) => (a && String(a).trim() ? a : b);

      if (existing) {
        await sup
          .from("programa_medida")
          .update({
            resposta: merge(existing.resposta, pm.resposta),
            justificativa: merge(existing.justificativa, pm.justificativa),
            controle: newCtrl,
          })
          .eq("id", existing.id);
      } else {
        const { id, ...rest } = pm;
        await sup.from("programa_medida").insert({
          ...rest,
          medida: newMed,
          controle: newCtrl,
        });
      }
      await sup.from("programa_medida").delete().eq("id", pm.id);
    }

    for (let ordem = 1; ordem <= 17; ordem++) {
      const ctrlId = 1000 + ordem;
      const { data: pc } = await sup
        .from("programa_controle")
        .select("id")
        .eq("programa", pid)
        .eq("controle", ctrlId)
        .maybeSingle();
      if (!pc) {
        await sup.from("programa_controle").insert({ programa: pid, controle: ctrlId, nivel: 1 });
      }
    }

    const { data: extraPm } = await sup
      .from("programa_medida")
      .select("medida")
      .eq("programa", pid)
      .gt("medida", 10102)
      .lte("medida", 10210);
    if (extraPm?.length) {
      await sup.from("programa_medida").delete().eq("programa", pid).gt("medida", 10102).lte("medida", 10210);
      console.log(`  prog ${pid}: removidas ${extraPm.length} medidas legadas >10102`);
    }
    console.log(`  prog ${pid}: OK`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});