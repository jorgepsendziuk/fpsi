/**
 * Regras de sugestão de resposta com base em dados do programa (evidência assistida).
 * Ver docs/essentials/systems/MEDIDAS_FONTE_EVIDENCIA.md
 */

/** Política de Segurança da Informação (POSIN) no FPSI. */
export const TIPO_POLITICA_POSIN = "politica_seguranca_informacao";

export type EvidenciaConfianca = "alta" | "media" | "baixa";

export type EvidenciaSugestao = {
  /** Existe regra automática para esta medida (false = ex.: 0.4, 0.5). */
  regraDefinida: boolean;
  /** Valor sugerido para resposta Sim/Não (diag. 1); null se não há sugestão. */
  respostaSugerida: 1 | 2 | null;
  motivo: string;
  fontes: string[];
  confianca: EvidenciaConfianca;
};

export type EvidenciaProgramaSnapshot = {
  responsavel_ti: unknown;
  responsavel_si: unknown;
  responsavel_controle_interno: unknown;
  responsavel_privacidade: unknown;
};

export type EvidenciaPoliticaPosin = {
  secoes: unknown;
} | null;

function responsavelPreenchido(v: unknown): boolean {
  return typeof v === "number" && v > 0;
}

/** Pelo menos uma seção com texto não vazio (conteúdo da POSIN no programa). */
export function politicaPosinTemConteudoRelevante(secoes: unknown): boolean {
  if (!Array.isArray(secoes) || secoes.length === 0) return false;
  return secoes.some((s: { texto?: unknown }) => {
    const t = s?.texto != null ? String(s.texto).trim() : "";
    return t.length > 0;
  });
}

export function buildEvidenciaContext(
  programa: EvidenciaProgramaSnapshot | null | undefined,
  politicaPosin: EvidenciaPoliticaPosin
): {
  programa: EvidenciaProgramaSnapshot;
  posinComConteudo: boolean;
} {
  const p = programa as Partial<EvidenciaProgramaSnapshot> | null | undefined;
  return {
    programa: {
      responsavel_ti: p?.responsavel_ti,
      responsavel_si: p?.responsavel_si,
      responsavel_controle_interno: p?.responsavel_controle_interno,
      responsavel_privacidade: p?.responsavel_privacidade,
    },
    posinComConteudo: politicaPosin != null && politicaPosinTemConteudoRelevante(politicaPosin.secoes),
  };
}

/**
 * Retorna sugestão Sim (1) ou Não (2) para medidas do Controle 0 (id_medida "0.x") quando aplicável.
 * Diagnóstico 1: respostas 1 = Sim, 2 = Não.
 */
export function getEvidenciaSugestao(
  idMedida: string | undefined | null,
  ctx: ReturnType<typeof buildEvidenciaContext>
): EvidenciaSugestao {
  const id = (idMedida || "").trim();
  const { programa, posinComConteudo } = ctx;

  const semRegra: EvidenciaSugestao = {
    regraDefinida: false,
    respostaSugerida: null,
    motivo: "Não há correspondência automática no sistema para esta medida; avalie conforme a realidade do órgão.",
    fontes: [],
    confianca: "baixa",
  };

  if (!id.startsWith("0.")) {
    return semRegra;
  }

  switch (id) {
    case "0.1": {
      const ok = responsavelPreenchido(programa.responsavel_ti);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há responsável pela autoridade máxima de TI atribuído no cadastro do programa."
          : "Não há responsável pela autoridade máxima de TI atribuído no cadastro do programa.",
        fontes: ["programa.responsavel_ti"],
        confianca: "media",
      };
    }
    case "0.2": {
      const ok = responsavelPreenchido(programa.responsavel_si);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há Gestor de Segurança da Informação atribuído no cadastro do programa."
          : "Não há Gestor de Segurança da Informação atribuído no cadastro do programa.",
        fontes: ["programa.responsavel_si"],
        confianca: "media",
      };
    }
    case "0.3": {
      const ok = responsavelPreenchido(programa.responsavel_controle_interno);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há responsável pela unidade de controle interno atribuído no cadastro do programa."
          : "Não há responsável pela unidade de controle interno atribuído no cadastro do programa.",
        fontes: ["programa.responsavel_controle_interno"],
        confianca: "media",
      };
    }
    case "0.4":
    case "0.5":
      return {
        regraDefinida: false,
        respostaSugerida: null,
        motivo:
          id === "0.4"
            ? "Comitê de Segurança da Informação: sem registro equivalente no sistema; resposta manual."
            : "ETIR: sem registro equivalente no sistema; resposta manual.",
        fontes: [],
        confianca: "baixa",
      };
    case "0.6": {
      const ok = posinComConteudo;
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Existe Política de Segurança da Informação salva no programa com ao menos uma seção com texto."
          : "Não há POSIN salva no programa com conteúdo preenchido (tipo politica_seguranca_informacao).",
        fontes: [`politica_programa.${TIPO_POLITICA_POSIN}`],
        confianca: "media",
      };
    }
    case "0.7": {
      const ok = responsavelPreenchido(programa.responsavel_privacidade);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há Encarregado (DPO) atribuído no cadastro do programa."
          : "Não há Encarregado pelo Tratamento de Dados Pessoais atribuído no cadastro do programa.",
        fontes: ["programa.responsavel_privacidade"],
        confianca: "media",
      };
    }
    default:
      return semRegra;
  }
}

export function respostaAtualIgualSugestao(
  respostaAtual: unknown,
  sugerida: 1 | 2 | null
): boolean {
  if (sugerida == null) return false;
  const n = typeof respostaAtual === "string" ? parseInt(respostaAtual, 10) : respostaAtual;
  if (typeof n !== "number" || Number.isNaN(n)) return false;
  return n === sugerida;
}

export function textoJustificativaSugestao(s: EvidenciaSugestao): string {
  if (!s.regraDefinida || s.respostaSugerida == null) return "";
  return `[Sugestão do sistema] ${s.motivo} Fontes: ${s.fontes.length ? s.fontes.join(", ") : "—"}.`;
}
