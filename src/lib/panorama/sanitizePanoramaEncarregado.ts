/**
 * Remove / neutraliza nomes provisórios de encarregado (ex.: indicação interna FPSI)
 * no texto exportado pelo Panorama — o relatório trata o cargo como pendente.
 */

const NOME_PROVISORIO = /\b(jorge\s+(felipe\s+roman\s+)?psendziuk)\b/gi;
const EMAIL_PROVISORIO = /\bjimxxx@gmail\.com\b/gi;

function mencionaProvisorio(text: string): boolean {
  return (
    /\b(jorge\s+(felipe\s+roman\s+)?psendziuk)\b/i.test(text) ||
    /\bjimxxx@gmail\.com\b/i.test(text)
  );
}

const FRASE_ENC_PENDENTE =
  "Encarregado de dados: a definir (pendente de indicação pelo titular do programa).";

export function textoMencionaEncarregadoProvisorio(text: string | null | undefined): boolean {
  if (!text) return false;
  return mencionaProvisorio(text);
}

/** Limpa menções a encarregado ainda não confirmado pelo cliente. */
export function sanitizePanoramaEncarregadoText(text: string | null | undefined): string | null {
  if (text == null) return null;
  const raw = String(text).trim();
  if (!raw) return null;
  if (!textoMencionaEncarregadoProvisorio(raw)) return raw;

  let out = raw.replace(NOME_PROVISORIO, "").replace(EMAIL_PROVISORIO, "");

  out = out.replace(
    /encarregad[oa][^.!?\n]*(?:indicad[oa]|publica|portal|jimxxx|psendziuk|jorge)[^.!?\n]*[.!?]?/gi,
    `${FRASE_ENC_PENDENTE} `
  );

  out = out
    .replace(/\(\s*[—–-]\s*\)/g, "")
    .replace(/:\s*[—–-]\s*/g, ": ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*[,.;]\s*/, "")
    .trim();

  if (!out || /^[—–-\s,;.]+$/.test(out)) {
    return FRASE_ENC_PENDENTE;
  }

  if (textoMencionaEncarregadoProvisorio(out)) {
    return FRASE_ENC_PENDENTE;
  }

  return out;
}

/** Campo “responsável” de plano/risco: não expor nome provisório como encarregado. */
export function sanitizePanoramaResponsavelNome(nome: string | null | undefined): string | null {
  if (nome == null) return null;
  const t = String(nome).trim();
  if (!t) return null;
  if (textoMencionaEncarregadoProvisorio(t)) return null;
  return t;
}