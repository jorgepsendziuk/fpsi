const LGPD_HINT = /\b(LGPD|Lei\s*n[º°]?\s*13\.709|13\.709\/2018)\b/i;

/** Segmento de normas (após split por `;`) refere-se à LGPD? */
export function isLgpdNormaSegment(segment: string): boolean {
  return LGPD_HINT.test(segment);
}

/**
 * Extrai números de artigos (1–65) citados em um trecho que menciona a LGPD.
 * Evita confundir "13.709" com artigos.
 */
export function extractLgpdArtigoNumbers(segment: string): number[] {
  if (!isLgpdNormaSegment(segment)) return [];
  let s = segment.replace(/13\.709\/\d{4}/g, "");
  s = s.replace(/\b13\.709\b/g, "");
  const nums = new Set<number>();
  const add = (v: number) => {
    if (v >= 1 && v <= 65) nums.add(v);
  };
  for (const m of Array.from(s.matchAll(/\bart[s]?\.?\s*(\d{1,2})\s*º?/gi))) {
    add(parseInt(m[1], 10));
  }
  for (const m of Array.from(s.matchAll(/\be\s+(\d{1,2})\s*º?\b/gi))) {
    add(parseInt(m[1], 10));
  }
  for (const m of Array.from(s.matchAll(/\b(\d{1,2})\s*º(?=\s|,|;|\.|\)|\s+[A-Z])/g))) {
    add(parseInt(m[1], 10));
  }
  return Array.from(nums).sort((a, b) => a - b);
}

export function splitNormasSegments(normasReferencia: string): string[] {
  return normasReferencia
    .split(";")
    .map((s) => s.replace(/^\s*\*+/, "").replace(/\*+\s*$/, "").trim())
    .filter(Boolean);
}

export const LGPD_PLANALTO_COMPILADO_URL =
  "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm";
