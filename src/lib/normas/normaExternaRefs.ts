/**
 * URLs oficiais para normas citadas em "Normas de referência:" das medidas (PPSI 2.0).
 *
 * Regra: preferir links **explícitos** conferidos (DOU in.gov.br, Planalto, páginas gov.br/Governo Digital).
 * Onde não há página única estável, usar busca no DOU ou hub institucional (ver comentários no catálogo).
 */

const NAO_IDENTIFICADA = /n[aã]o\s+identificada/i;

export type NormaExternaResolve = {
  url: string;
  siteLabel: string;
};

// --- Hubs (várias normas ou consulta) ---

export const ANPD_RESOLUCOES_CD_URL =
  "https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/resolucoes_cd";

export const ANPD_ENUNCIADOS_URL =
  "https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/enunciados-anpd";

/** Normas complementares e contexto ETIR / IN 1 — citadas junto com NC no catálogo. */
export const CTIR_BASE_NORMATIVA_URL = "https://www.gov.br/ctir/pt-br/assuntos/base-normativa";

export const GOVERNO_DIGITAL_CONTRATACOES_TIC_URL =
  "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic";

function buscaDouUrl(termo: string): string {
  return `https://www.in.gov.br/consulta/-/buscar/dou?q=${encodeURIComponent(termo)}&sortType=0&delta=20&view=true`;
}

// --- Decretos federais (Planalto): catálogo + fallback por período ---

const DECRETO_PLANALTO_EXPLICITO: Record<string, string> = {
  // Conferidos em planalto.gov.br (março/2026)
  "9203-2017": "https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/2017/Decreto/D9203.htm",
  "10046-2019": "https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/2019/Decreto/D10046.htm",
  "11529-2023": "https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2023/Decreto/D11529.htm",
  "12572-2025": "https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2025/Decreto/D12572.htm",
  "12573-2025": "https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/2025/Decreto/D12573.htm",
};

/**
 * Fallback quando o decreto não está no catálogo: caminhos do Planalto mudam por período.
 */
export function planaltoDecretoUrlFallback(numSemPontos: number, year: number): string | null {
  if (!Number.isFinite(numSemPontos) || !Number.isFinite(year)) return null;
  const d = `D${numSemPontos}`;
  if (year >= 2023) {
    return `https://www.planalto.gov.br/ccivil_03/_Ato2023-2026/${year}/Decreto/${d}.htm`;
  }
  if (year >= 2019 && year <= 2022) {
    return `https://www.planalto.gov.br/ccivil_03/_Ato2019-2022/${year}/Decreto/${d}.htm`;
  }
  if (year >= 2015 && year <= 2018) {
    return `https://www.planalto.gov.br/ccivil_03/_Ato2015-2018/${year}/Decreto/${d}.htm`;
  }
  return null;
}

// --- IN GSI/PR (DOU ou busca) ---

const IN_GSI_PR_URL: Record<string, string> = {
  "1-2020": "https://www.in.gov.br/web/dou/-/instrucao-normativa-n-1-de-27-de-maio-de-2020-258915215",
  "5-2021": "https://www.in.gov.br/web/dou/-/instrucao-normativa-n-5-de-30-de-agosto-de-2021-341649684",
  "8-2025": "https://www.in.gov.br/web/dou/-/instrucao-normativa-gsi/pr-n-8-de-6-de-outubro-de-2025-660716869",
  // Publicação institucional (texto no portal GSI)
  "3-2013": "https://www.gov.br/gsi/pt-br/seguranca-da-informacao-e-cibernetica/legislacao",
};

// --- IN SGD/ME (DOU) ---

const IN_SGD_ME_URL: Record<string, string> = {
  "117-2020": "https://www.in.gov.br/web/dou/-/instrucao-normativa-sgd/me-n-117-de-19-de-novembro-de-2020-289515596",
  "94-2022": "https://www.in.gov.br/web/dou/-/instrucao-normativa-sgd/me-n-94-de-23-de-dezembro-de-2022-454510332",
};

// --- Resoluções CD/ANPD (DOU) — demais: lista ANPD ---

const RESOLUCAO_CD_ANPD_URL: Record<string, string> = {
  "15-2024": "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024",
  "18-2024": "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-18-de-16-de-julho-de-2024-572632074",
  "19-2024": "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-19-de-23-de-agosto-de-2024-580095396",
};

// --- Portarias SGD/MGI (páginas Governo Digital / modelos SISP) ---

const PORTARIA_SGD_MGI_URL: Record<string, string> = {
  "370-2023":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-servicos-de-outsourcing-de-impressao/anexos/portaria-sgd-mgi-no-370-de-8-de-marco-de-2023",
  "750-2023":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-servicos-de-desenvolvimento-manutencao-e-sustentacao-de-software/vigentes/portaria-sgd-mgi-no-750-de-20-de-marco-de-2023",
  "1070-2023":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contracao-de-servicos-de-operacao-de-infraestrutura-e-de-atendimento-a-usuarios-de-tic/vigentes/portaria-sgd-mgi-no-1-070-de-1o-de-junho-de-2023",
  "2715-2023": "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/portaria-sgd-mgi-no-2-715-de-21-de-junho-de-2023",
  "5950-2023":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-software-e-servicos-em-nuvem/vigentes/portaria-sgd-mgi-no-5-950-de-26-de-outubro-de-2023",
  "6679-2024":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contratacao-de-servicos-de-desenvolvimento-manutencao-e-sustentacao-de-software/vigentes/portaria-sgd-mgi-no-6679-de-17-de-setembro-de-2024",
  "6680-2024":
    "https://www.gov.br/governodigital/pt-br/contratacoes-de-tic/legislacao/modelo-de-contracao-de-servicos-de-operacao-de-infraestrutura-e-de-atendimento-a-usuarios-de-tic/vigentes/portaria-sgd-mgi-no-6-680-de-4-de-outubro-de-2024",
};

const PORTARIA_SGD_ME_778_2019 =
  "https://www.gov.br/governodigital/pt-br/estrategias-e-governanca-digital/sisp/portaria-sgd-me-no-778-de-4-de-abril-de-2019";

const PORTARIA_GSI_PR_120_2022 =
  "https://www.gov.br/gsi/pt-br/seguranca-da-informacao-e-cibernetica/noticias-anteriores/copy_of_publicacao-da-portaria-gsi-pr-no-120-de-21-de-dezembro-de-2022";

const ENUNCIADO_ANPD_1_2023_NOTICIA =
  "https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes";

function normalizeForMatch(segment: string): string {
  return segment.replace(/\*+/g, " ").replace(/\s+/g, " ").trim();
}

function chaveDecreto(numRaw: string, yearRaw: string): string {
  const num = String(parseInt(numRaw.replace(/\./g, ""), 10));
  return `${num}-${yearRaw}`;
}

function tryDecreto(s: string): NormaExternaResolve | null {
  const m = s.match(/decreto\s+n[º°oO]?\s*([\d.]+)\/(\d{4})/i);
  if (!m) return null;
  const key = chaveDecreto(m[1], m[2]);
  const explicit = DECRETO_PLANALTO_EXPLICITO[key];
  if (explicit) return { url: explicit, siteLabel: "Planalto" };
  const num = parseInt(m[1].replace(/\./g, ""), 10);
  const year = parseInt(m[2], 10);
  const fb = planaltoDecretoUrlFallback(num, year);
  if (fb) return { url: fb, siteLabel: "Planalto" };
  return null;
}

function tryInGsiPr(s: string): NormaExternaResolve | null {
  const m = s.match(/\bin\s+gsi\/pr\s+n[º°oO]?\s*(\d+)\s*\/\s*(\d{4})/i);
  if (!m) return null;
  const key = `${m[1]}-${m[2]}`;
  const url = IN_GSI_PR_URL[key];
  if (url) {
    const label = key === "3-2013" ? "GSI/PR (legislação)" : "DOU (Imprensa Nacional)";
    return { url, siteLabel: label };
  }
  if (key === "3-2021") {
    return {
      url: buscaDouUrl("Instrução Normativa GSI/PR 3 28 de maio de 2021"),
      siteLabel: "Busca DOU",
    };
  }
  return {
    url: buscaDouUrl(`Instrução Normativa GSI/PR ${m[1]} ${m[2]}`),
    siteLabel: "Busca DOU",
  };
}

function tryInSgdMe(s: string): NormaExternaResolve | null {
  const m = s.match(/\bin\s+sgd\/me\s+n[º°oO]?\s*(\d+)(?:\s*\/\s*(\d{4}))?/i);
  if (!m) return null;
  const n = m[1];
  const y = m[2] ?? (n === "117" ? "2020" : n === "94" ? "2022" : null);
  if (!y) {
    return {
      url: buscaDouUrl(`Instrução Normativa SGD/ME ${n}`),
      siteLabel: "Busca DOU",
    };
  }
  const key = `${n}-${y}`;
  const url = IN_SGD_ME_URL[key];
  if (url) return { url, siteLabel: "DOU (Imprensa Nacional)" };
  return {
    url: buscaDouUrl(`Instrução Normativa SGD/ME ${n} ${y}`),
    siteLabel: "Busca DOU",
  };
}

function tryResolucaoCdAnpd(s: string): NormaExternaResolve | null {
  const m = s.match(/resolu[cç][aã]o\s+cd\/anpd\s+n[º°oO]?\s*(\d+)\s*\/\s*(\d{4})/i);
  if (!m) return null;
  const key = `${m[1]}-${m[2]}`;
  const url = RESOLUCAO_CD_ANPD_URL[key];
  if (url) return { url, siteLabel: "DOU (Imprensa Nacional)" };
  return { url: ANPD_RESOLUCOES_CD_URL, siteLabel: "ANPD (resoluções CD)" };
}

/** Primeira portaria SGD/MGI no trecho; se várias, hub contratações TIC. */
function tryPortariaSgdMgi(s: string): NormaExternaResolve | null {
  if (!/sgd\/mgi/i.test(s)) return null;
  const matches = Array.from(s.matchAll(/n[º°oO]?\s*([\d.]+)\/(\d{4})/gi));
  if (matches.length === 0) {
    return { url: GOVERNO_DIGITAL_CONTRATACOES_TIC_URL, siteLabel: "Governo Digital (contratações TIC)" };
  }
  if (matches.length > 1) {
    return { url: GOVERNO_DIGITAL_CONTRATACOES_TIC_URL, siteLabel: "Governo Digital (várias portarias)" };
  }
  const num = matches[0][1].replace(/\./g, "");
  const year = matches[0][2];
  const key = `${num}-${year}`;
  const url = PORTARIA_SGD_MGI_URL[key];
  if (url) return { url, siteLabel: "Governo Digital" };
  return {
    url: buscaDouUrl(`Portaria SGD/MGI ${matches[0][1]}/${year}`),
    siteLabel: "Busca DOU",
  };
}

function tryPortariaSgdMe778(s: string): NormaExternaResolve | null {
  if (!/\bportaria\s+sgd\/me\b/i.test(s)) return null;
  if (/\b778\b/.test(s) && /2019/.test(s)) {
    return { url: PORTARIA_SGD_ME_778_2019, siteLabel: "Governo Digital (SISP)" };
  }
  return {
    url: buscaDouUrl(s.slice(0, 120)),
    siteLabel: "Busca DOU",
  };
}

function tryPortariaGsiPr120(s: string): NormaExternaResolve | null {
  if (!/\bportaria\s+gsi\/pr\b/i.test(s)) return null;
  if (/\b120\b/.test(s) && /2022/.test(s)) {
    return { url: PORTARIA_GSI_PR_120_2022, siteLabel: "GSI/PR" };
  }
  return {
    url: buscaDouUrl(s.slice(0, 120)),
    siteLabel: "Busca DOU",
  };
}

function tryEnunciadoAnpd(s: string): NormaExternaResolve | null {
  if (!/\benunciado/i.test(s) || !/\banpd\b/i.test(s)) return null;
  if (/enunciado\s+n[°ºo]?\s*1\s*\/\s*2023/i.test(s)) {
    return { url: ENUNCIADO_ANPD_1_2023_NOTICIA, siteLabel: "ANPD" };
  }
  return { url: ANPD_ENUNCIADOS_URL, siteLabel: "ANPD (enunciados)" };
}

function tryNc(s: string): NormaExternaResolve | null {
  if (!/\bnc\s+n[º°oO]?\s*\d/i.test(s)) return null;
  return { url: CTIR_BASE_NORMATIVA_URL, siteLabel: "CTIR Gov (base normativa)" };
}

function tryInternacionais(s: string): NormaExternaResolve | null {
  if (/\bcis\s+controls?\b/i.test(s) || /\bcis\s+benchmark/i.test(s)) {
    return { url: "https://www.cisecurity.org/controls", siteLabel: "CIS" };
  }
  if (/\bnist\b/i.test(s)) {
    return { url: "https://www.nist.gov/cyberframework", siteLabel: "NIST" };
  }
  if (/\biso\s*\/\s*iec\b/i.test(s) || /\biso\s+27001\b/i.test(s)) {
    return { url: "https://www.iso.org/standard/27001", siteLabel: "ISO" };
  }
  return null;
}

/**
 * Resolve um segmento isolado (após `splitNormasSegments`) para URL + rótulo.
 */
export function resolveNormaReferenciaUrl(segment: string): NormaExternaResolve | null {
  const s = normalizeForMatch(segment);
  if (!s || NAO_IDENTIFICADA.test(s)) return null;

  return (
    tryEnunciadoAnpd(s) ??
    tryPortariaSgdMe778(s) ??
    tryPortariaGsiPr120(s) ??
    tryResolucaoCdAnpd(s) ??
    tryInSgdMe(s) ??
    tryPortariaSgdMgi(s) ??
    tryInGsiPr(s) ??
    tryDecreto(s) ??
    tryNc(s) ??
    tryInternacionais(s) ??
    null
  );
}
