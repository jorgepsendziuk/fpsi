#!/usr/bin/env node
/**
 * Instalação de pacotes FPSI (padrão = todos, como hoje).
 * Flags de exclusão: -public -ia -framework -ppsi
 * Não apaga catálogo nem respostas existentes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = path.join(ROOT, "config/fpsi-packages.json");

const FLAG_MAP = {
  "-public": "publico",
  "-ia": "governanca-ia",
  "-framework": "framework",
  "-ppsi": "ppsi-2.0",
};

const ALL_IDS = ["publico", "ppsi-2.0", "governanca-ia", "framework"];

function parseOmit(argv) {
  const omit = new Set();
  for (const arg of argv) {
    const id = FLAG_MAP[arg];
    if (id) omit.add(id);
  }
  return omit;
}

function loadManifest(packId) {
  if (packId === "publico") {
    const p = path.join(ROOT, "packages/publico/manifest.json");
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  const p = path.join(ROOT, "content-packs", packId, "manifest.json");
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeConfig(omit) {
  const packages = {};
  for (const id of ALL_IDS) {
    packages[id] = !omit.has(id);
  }
  const payload = {
    v: 1,
    packages,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload;
}

async function syncContentPackRows(supabase, omit) {
  const KNOWN_PROFILES = new Set([
    "ppsi-nim-nac-v1",
    "framework-v1",
    "framework-v2",
    null,
    undefined,
  ]);

  for (const id of ["ppsi-2.0", "governanca-ia", "framework"]) {
    if (omit.has(id)) {
      console.log(`[install:fpsi] Conteúdo ${id}: omitido (flag). Nada removido do banco.`);
      continue;
    }
    const manifest = loadManifest(id);
    if (!manifest) continue;
    if (manifest.scoring_profile && !KNOWN_PROFILES.has(manifest.scoring_profile)) {
      console.error(
        `[install:fpsi] Perfil de pontuação desconhecido: ${manifest.scoring_profile} (${id})`
      );
      process.exit(1);
    }
    const row = {
      id: manifest.id,
      nome: manifest.nome,
      versao: manifest.versao,
      descricao: manifest.descricao ?? null,
      origem: manifest.origem,
      titular: manifest.titular ?? null,
      licenca: manifest.licenca ?? null,
      url_fonte: manifest.url_fonte ?? null,
      schema_versao: String(manifest.schema_versao ?? "1"),
      scoring_profile: manifest.scoring_profile ?? null,
      pack_tipo: manifest.pack_tipo ?? "conteudo",
      instalado_em: new Date().toISOString(),
    };
    const { error } = await supabase.from("content_pack").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn(`[install:fpsi] Aviso ao registrar ${id}:`, error.message);
    } else {
      console.log(`[install:fpsi] Pacote registrado no banco: ${id}`);
    }
  }
}

async function main() {
  const omit = parseOmit(process.argv.slice(2));
  const config = writeConfig(omit);
  console.log("[install:fpsi] Config atualizado:", CONFIG_PATH);
  console.log(JSON.stringify(config.packages, null, 2));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    const supabase = createClient(url, key);
    await syncContentPackRows(supabase, omit);
    if (omit.has("ppsi-2.0")) {
      console.log(
        "[install:fpsi] -ppsi: catálogo existente no banco permanece; nenhum DELETE executado."
      );
    }
    if (omit.has("governanca-ia")) {
      console.log(
        "[install:fpsi] -ia: eixo 4 existente no banco permanece; nenhum DELETE executado."
      );
    }
  } else {
    console.log(
      "[install:fpsi] Supabase não configurado no ambiente — apenas config/fpsi-packages.json atualizado."
    );
    console.log("  Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para registrar content_pack.");
  }

  if (omit.has("publico")) {
    console.log("[install:fpsi] Site institucional desligado. Portal do titular (/[slug]) permanece na Ferramenta.");
  }
  if (omit.has("framework")) {
    console.log("[install:fpsi] Encaixe framework omitido (sem catálogo nesta versão).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});