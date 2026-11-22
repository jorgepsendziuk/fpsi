#!/usr/bin/env node
/** Aplica catálogo framework v2 via Supabase API (quando db push falha). */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(resolve(root, ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};
const sup = createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"));

const catalogo = JSON.parse(readFileSync(resolve(root, "content-packs/framework/catalogo.json"), "utf8"));

async function main() {
  await sup.from("programa_controle").delete().gte("controle", 1018).lte("controle", 1027);

  await sup.from("programa_medida").delete().gt("medida", 10102).lte("medida", 10210);
  const { error: dm } = await sup.from("medida").delete().eq("pack_id", "framework").gte("id", 10103).lte("id", 10210);
  if (dm) console.warn("delete medidas 10103-10210:", dm.message);

  const { error: dc } = await sup.from("controle").delete().eq("pack_id", "framework").gte("id", 1018).lte("id", 1027);
  if (dc) console.warn("delete controles 1018-1027:", dc.message);

  for (const c of catalogo.controles) {
    const id = 1000 + c.ordem_no_guia;
    const { error } = await sup.from("controle").upsert({
      id,
      numero: c.controle_numero,
      diagnostico: c.diagnostico_id,
      nome: c.titulo,
      pack_id: "framework",
      codigo_origem: `FV2-C${c.controle_numero}-D${c.diagnostico_id}-${c.ordem_no_guia}`,
    });
    if (error) throw error;
  }

  for (let i = 0; i < catalogo.medidas.length; i++) {
    const m = catalogo.medidas[i];
    const id = 10001 + i;
    const { error } = await sup.from("medida").upsert({
      id,
      id_medida: m.id_medida,
      id_controle: m.id_controle,
      medida: m.pergunta,
      descricao: m.descricao,
      pack_id: "framework",
      codigo_origem: m.id_medida,
      id_cisv8: null,
      grupo_imple: null,
      funcao_nist_csf: null,
    });
    if (error) throw error;
  }

  await sup
    .from("content_pack")
    .update({ versao: "2.0.0", descricao: catalogo.meta.nota })
    .eq("id", "framework");

  const { count: cc } = await sup
    .from("controle")
    .select("id", { count: "exact", head: true })
    .eq("pack_id", "framework");
  const { count: mm } = await sup
    .from("medida")
    .select("id", { count: "exact", head: true })
    .eq("pack_id", "framework");
  console.log("DB após apply:", { controles: cc, medidas: mm });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});