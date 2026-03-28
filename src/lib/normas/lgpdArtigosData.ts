import raw from "@/data/lgpd_artigos.json";
import type { LgpdOutlineEntry } from "@/lib/normas/lgpdOutline";
import type { LgpdArtigosPayload } from "@/lib/normas/lgpdArtigosTypes";

export type { LgpdArtigosPayload };

const data = raw as LgpdArtigosPayload;

export function getLgpdArtigoTexto(num: number): string | null {
  const key = String(num);
  const t = data.artigos[key];
  return t && t.trim() ? t : null;
}

export function getLgpdMeta(): LgpdArtigosPayload["meta"] {
  return data.meta;
}

export function listLgpdArtigoNumeros(): number[] {
  return Object.keys(data.artigos)
    .map((k) => parseInt(k, 10))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
}

/** Árvore capítulo/seção gerada pelo script `scripts/extract_lgpd_artigos.py` a partir do HTML do Planalto. */
export function getLgpdArvore(): LgpdOutlineEntry[] {
  const a = data.arvore;
  if (a?.length) return a;
  const nums = listLgpdArtigoNumeros();
  return [{ id: "lgpd-flat", titulo: "Artigos", artigos: nums }];
}
