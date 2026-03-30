/**
 * Regras de sugestão de resposta com base em dados do programa (evidência assistida).
 * Ver docs/essentials/systems/MEDIDAS_FONTE_EVIDENCIA.md
 */

import type { GovernancaAbaQuery } from "@/lib/governanca/abaGovernanca";

/** Política de Segurança da Informação (POSIN) no FPSI. */
export const TIPO_POLITICA_POSIN = "politica_seguranca_informacao";

/** Política de Proteção de Dados Pessoais (medida 0.12 e documento correlato). */
export const TIPO_POLITICA_PROTECAO_DADOS = "politica_protecao_dados_pessoais";

export type EvidenciaConfianca = "alta" | "media" | "baixa";

export type EvidenciaSugestao = {
  /** Existe regra automática Sim/Não (false = manual ou sem modelo no sistema). */
  regraDefinida: boolean;
  /** Valor sugerido para resposta Sim/Não (diag. 1); null se não há sugestão. */
  respostaSugerida: 1 | 2 | null;
  motivo: string;
  fontes: string[];
  confianca: EvidenciaConfianca;
  /**
   * Medidas 0.1–0.8 (Controle 0): correspondência com a página Estrutura de Governança do programa
   * (abas Papéis e equipe / Comitê SI / Comitê priva / ETIR).
   */
  governancaContexto?: {
    aba: GovernancaAbaQuery;
    detalhe: string;
  };
};

export type EvidenciaProgramaSnapshot = {
  representante_alta_administracao: unknown;
  gestor_tic: unknown;
  gestor_seguranca_informacao: unknown;
  encarregado_dados_pessoais: unknown;
  responsavel_gestao_integridade: unknown;
};

/** Contagem de membros em comitês / ETIR (Estrutura de Governança do programa). */
export type EvidenciaGruposGovernanca = {
  comiteSi: number;
  comiteDados: number;
  etir: number;
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
  politicaPosin: EvidenciaPoliticaPosin,
  politicaProtecaoDados: EvidenciaPoliticaPosin = null,
  gruposGovernanca: EvidenciaGruposGovernanca | null | undefined = null
): {
  programa: EvidenciaProgramaSnapshot;
  grupos: EvidenciaGruposGovernanca;
  posinComConteudo: boolean;
  protecaoDadosComConteudo: boolean;
} {
  const p = programa as Partial<EvidenciaProgramaSnapshot> | null | undefined;
  const grupos: EvidenciaGruposGovernanca = gruposGovernanca ?? {
    comiteSi: 0,
    comiteDados: 0,
    etir: 0,
  };
  return {
    programa: {
      representante_alta_administracao: p?.representante_alta_administracao,
      gestor_tic: p?.gestor_tic,
      gestor_seguranca_informacao: p?.gestor_seguranca_informacao,
      encarregado_dados_pessoais: p?.encarregado_dados_pessoais,
      responsavel_gestao_integridade: p?.responsavel_gestao_integridade,
    },
    grupos,
    posinComConteudo: politicaPosin != null && politicaPosinTemConteudoRelevante(politicaPosin.secoes),
    protecaoDadosComConteudo:
      politicaProtecaoDados != null &&
      politicaPosinTemConteudoRelevante(politicaProtecaoDados.secoes),
  };
}

/**
 * Sugestão Sim (1) / Não (2) para medidas com id_medida "0.x" (PPSI 2.0 — controles iniciais do diagnóstico 1).
 * Mapeamento alinhado à migração `20260327120000_ppsi20_catalogo_controles_medidas.sql`.
 * Diagnóstico 1: respostas 1 = Sim, 2 = Não.
 */
export function getEvidenciaSugestao(
  idMedida: string | undefined | null,
  ctx: ReturnType<typeof buildEvidenciaContext>
): EvidenciaSugestao {
  const id = (idMedida || "").trim();
  const { programa, grupos, posinComConteudo, protecaoDadosComConteudo } = ctx;

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
      const ok = responsavelPreenchido(programa.representante_alta_administracao);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há representante da alta administração indicado na Estrutura de Governança do programa (Decreto 9.203/2017, art. 17; Portaria SGD/MGI 9.511/2025)."
          : "Não há representante da alta administração indicado no cadastro do programa.",
        fontes: ["programa.representante_alta_administracao"],
        confianca: "media",
        governancaContexto: {
          aba: "equipe",
          detalhe: "Campo «Representante da alta administração» (aba Papéis e equipe).",
        },
      };
    }
    case "0.2": {
      const ok = responsavelPreenchido(programa.gestor_tic);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há gestor de TIC vinculado no cadastro do programa (Portaria SGD/ME 778/2019, art. 4º, IV; Portaria SGD/MGI 9.511/2025, arts. 7º e 9º)."
          : "Não há gestor de TIC vinculado no cadastro do programa.",
        fontes: ["programa.gestor_tic"],
        confianca: "media",
        governancaContexto: { aba: "equipe", detalhe: "Campo «Gestor de TIC» (aba Papéis e equipe)." },
      };
    }
    case "0.3": {
      const ok = responsavelPreenchido(programa.gestor_seguranca_informacao);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há gestor de segurança da informação atribuído no cadastro do programa."
          : "Não há gestor de segurança da informação atribuído no cadastro do programa.",
        fontes: ["programa.gestor_seguranca_informacao"],
        confianca: "media",
        governancaContexto: {
          aba: "equipe",
          detalhe: "Campo «Gestor de segurança da informação» (aba Papéis e equipe).",
        },
      };
    }
    case "0.4": {
      const ok = responsavelPreenchido(programa.encarregado_dados_pessoais);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há encarregado (DPO) atribuído no cadastro do programa."
          : "Não há encarregado pelo tratamento de dados pessoais atribuído no cadastro do programa.",
        fontes: ["programa.encarregado_dados_pessoais"],
        confianca: "media",
        governancaContexto: {
          aba: "equipe",
          detalhe: "Campo «Encarregado (dados pessoais)» (aba Papéis e equipe).",
        },
      };
    }
    case "0.5": {
      const ok = responsavelPreenchido(programa.responsavel_gestao_integridade);
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Há responsável pela gestão da integridade atribuído no cadastro (Decreto 11.529/2023; Portaria SGD/MGI 9.511/2025, art. 12)."
          : "Não há responsável pela gestão da integridade atribuído no cadastro do programa.",
        fontes: ["programa.responsavel_gestao_integridade"],
        confianca: "media",
        governancaContexto: {
          aba: "equipe",
          detalhe: "Campo «Responsável pela gestão da integridade» (aba Papéis e equipe).",
        },
      };
    }
    case "0.6": {
      const ok = grupos.comiteSi > 0;
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? `Comitê de segurança da informação: ${grupos.comiteSi} membro(s) registrado(s) na Estrutura de Governança.`
          : "Nenhum membro registrado para o comitê de segurança da informação na Estrutura de Governança do programa.",
        fontes: ["programa_grupo_governanca.comite_seguranca_informacao"],
        confianca: "media",
        governancaContexto: { aba: "si", detalhe: "Membros do comitê de SI (aba Comitê SI)." },
      };
    }
    case "0.7": {
      const ok = grupos.comiteDados > 0;
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? `Comitê de proteção de dados pessoais: ${grupos.comiteDados} membro(s) registrado(s) na Estrutura de Governança.`
          : "Nenhum membro registrado para o comitê de proteção de dados pessoais na Estrutura de Governança do programa.",
        fontes: ["programa_grupo_governanca.comite_protecao_dados"],
        confianca: "media",
        governancaContexto: { aba: "priva", detalhe: "Membros do comitê de privacidade (aba Comitê priva)." },
      };
    }
    case "0.8": {
      const ok = grupos.etir > 0;
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? `ETIR: ${grupos.etir} membro(s) registrado(s) na Estrutura de Governança.`
          : "Nenhum membro registrado para a ETIR na Estrutura de Governança do programa.",
        fontes: ["programa_grupo_governanca.etir"],
        confianca: "media",
        governancaContexto: { aba: "etir", detalhe: "Membros da ETIR (aba ETIR)." },
      };
    }
    case "0.9":
      return {
        regraDefinida: false,
        respostaSugerida: null,
        motivo:
          "Programa de Governança em Segurança da Informação (PGSI): não há modelo equivalente no FPSI; avalie conforme a documentação do órgão.",
        fontes: [],
        confianca: "baixa",
      };
    case "0.10":
      return {
        regraDefinida: false,
        respostaSugerida: null,
        motivo:
          "Programa de Governança em Privacidade (PGP): não há modelo equivalente no FPSI; avalie conforme a documentação do órgão.",
        fontes: [],
        confianca: "baixa",
      };
    case "0.11": {
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
    case "0.12": {
      const ok = protecaoDadosComConteudo;
      return {
        regraDefinida: true,
        respostaSugerida: ok ? 1 : 2,
        motivo: ok
          ? "Existe Política de Proteção de Dados Pessoais salva no programa com ao menos uma seção com texto."
          : "Não há política do tipo politica_protecao_dados_pessoais com conteúdo preenchido no programa.",
        fontes: [`politica_programa.${TIPO_POLITICA_PROTECAO_DADOS}`],
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
