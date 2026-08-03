/**
 * Regras de sugestão de resposta com base em dados do programa (evidência assistida).
 * Ver docs/essentials/systems/MEDIDAS_FONTE_EVIDENCIA.md
 */

import type { GovernancaAbaQuery } from "@/lib/governanca/abaGovernanca";

import {
  TIPO_POLITICA_PGP,
  TIPO_POLITICA_PGSI,
  TIPO_POLITICA_POSIN,
  TIPO_POLITICA_PROTECAO_DADOS,
} from "@/lib/politicas/politicasCatalog";

export {
  TIPO_POLITICA_PGP,
  TIPO_POLITICA_PGSI,
  TIPO_POLITICA_POSIN,
  TIPO_POLITICA_PROTECAO_DADOS,
};

export type EvidenciaConfianca = "alta" | "media" | "baixa";

export type EvidenciaSugestao = {
  regraDefinida: boolean;
  respostaSugerida: number | null;
  tipoEscala: "binario" | "maturidade";
  motivo: string;
  fontes: string[];
  confianca: EvidenciaConfianca;
  governancaContexto?: {
    aba: GovernancaAbaQuery;
    detalhe: string;
  };
  /** Link para módulo fora da estrutura de governança (ex.: inventário de IA). */
  acaoModulo?: {
    path: string;
    label: string;
    detalhe?: string;
  };
};

export type EvidenciaProgramaSnapshot = {
  representante_alta_administracao: unknown;
  gestor_tic: unknown;
  gestor_seguranca_informacao: unknown;
  encarregado_dados_pessoais: unknown;
  responsavel_gestao_integridade: unknown;
  responsavel_governanca_ia?: unknown;
  substituto_governanca_ia?: unknown;
  comite_si_ia_na_pauta?: boolean;
  comite_priva_ia_na_pauta?: boolean;
};

export type EvidenciaGruposGovernanca = {
  comiteSi: number;
  comiteDados: number;
  etir: number;
  comiteIa: number;
};

export type EvidenciaPoliticaPosin = {
  secoes: unknown;
} | null;

export type EvidenciaConformidadeSnapshot = {
  ropaCount: number;
  mapeamentoCount: number;
  incidenteCount: number;
  pedidoTitularCount: number;
  ripdCount: number;
  temSlugPortal: boolean;
  temPoliticaProtecao: boolean;
  temPosin: boolean;
  sistemasIaCount?: number;
  sistemasIaProducaoCount?: number;
};

export type EvidenciaContext = {
  programa: EvidenciaProgramaSnapshot;
  grupos: EvidenciaGruposGovernanca;
  posinComConteudo: boolean;
  protecaoDadosComConteudo: boolean;
  pgsiComConteudo: boolean;
  pgpComConteudo: boolean;
  conformidade?: EvidenciaConformidadeSnapshot;
};

function responsavelPreenchido(v: unknown): boolean {
  return typeof v === "number" && v > 0;
}

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
  gruposGovernanca: EvidenciaGruposGovernanca | null | undefined = null,
  conformidade?: EvidenciaConformidadeSnapshot,
  politicaPgsi: EvidenciaPoliticaPosin = null,
  politicaPgp: EvidenciaPoliticaPosin = null
): EvidenciaContext {
  const grupos: EvidenciaGruposGovernanca = gruposGovernanca ?? {
    comiteSi: 0,
    comiteDados: 0,
    etir: 0,
    comiteIa: 0,
  };
  const pg = programa as Partial<
    EvidenciaProgramaSnapshot & {
      comite_si_ia_na_pauta?: boolean;
      comite_priva_ia_na_pauta?: boolean;
    }
  > | null | undefined;
  return {
    programa: {
      representante_alta_administracao: pg?.representante_alta_administracao,
      gestor_tic: pg?.gestor_tic,
      gestor_seguranca_informacao: pg?.gestor_seguranca_informacao,
      encarregado_dados_pessoais: pg?.encarregado_dados_pessoais,
      responsavel_gestao_integridade: pg?.responsavel_gestao_integridade,
      responsavel_governanca_ia: pg?.responsavel_governanca_ia,
      substituto_governanca_ia: pg?.substituto_governanca_ia,
      comite_si_ia_na_pauta: pg?.comite_si_ia_na_pauta,
      comite_priva_ia_na_pauta: pg?.comite_priva_ia_na_pauta,
    },
    grupos,
    posinComConteudo: politicaPosin != null && politicaPosinTemConteudoRelevante(politicaPosin.secoes),
    protecaoDadosComConteudo:
      politicaProtecaoDados != null &&
      politicaPosinTemConteudoRelevante(politicaProtecaoDados.secoes),
    pgsiComConteudo: politicaPgsi != null && politicaPosinTemConteudoRelevante(politicaPgsi.secoes),
    pgpComConteudo: politicaPgp != null && politicaPosinTemConteudoRelevante(politicaPgp.secoes),
    conformidade,
  };
}

function binario(ok: boolean, motivoSim: string, motivoNao: string, fontes: string[]): EvidenciaSugestao {
  return {
    regraDefinida: true,
    respostaSugerida: ok ? 1 : 2,
    tipoEscala: "binario",
    motivo: ok ? motivoSim : motivoNao,
    fontes,
    confianca: "media",
  };
}

function maturidade(
  resposta: number,
  motivo: string,
  fontes: string[],
  confianca: EvidenciaConfianca = "media"
): EvidenciaSugestao {
  return {
    regraDefinida: true,
    respostaSugerida: resposta,
    tipoEscala: "maturidade",
    motivo,
    fontes,
    confianca,
  };
}

export function getEvidenciaSugestao(
  idMedida: string | undefined | null,
  ctx: EvidenciaContext
): EvidenciaSugestao {
  const id = (idMedida || "").trim();
  const {
    programa,
    grupos,
    posinComConteudo,
    protecaoDadosComConteudo,
    pgsiComConteudo,
    pgpComConteudo,
    conformidade,
  } = ctx;

  const semRegra: EvidenciaSugestao = {
    regraDefinida: false,
    respostaSugerida: null,
    tipoEscala: id.startsWith("0.") ? "binario" : "maturidade",
    motivo: "Não há correspondência automática no sistema para esta medida; avalie conforme a realidade do órgão.",
    fontes: [],
    confianca: "baixa",
  };

  if (id.startsWith("0.")) {
    switch (id) {
      case "0.1":
        return {
          ...binario(
            responsavelPreenchido(programa.representante_alta_administracao),
            "Há representante da alta administração indicado na Estrutura de Governança do programa.",
            "Não há representante da alta administração indicado no cadastro do programa.",
            ["programa.representante_alta_administracao"]
          ),
          governancaContexto: { aba: "equipe", detalhe: "Campo «Representante da alta administração»." },
        };
      case "0.2":
        return {
          ...binario(
            responsavelPreenchido(programa.gestor_tic),
            "Há gestor de TIC vinculado no cadastro do programa.",
            "Não há gestor de TIC vinculado no cadastro do programa.",
            ["programa.gestor_tic"]
          ),
          governancaContexto: { aba: "equipe", detalhe: "Campo «Gestor de TIC»." },
        };
      case "0.3":
        return {
          ...binario(
            responsavelPreenchido(programa.gestor_seguranca_informacao),
            "Há gestor de segurança da informação atribuído no cadastro do programa.",
            "Não há gestor de segurança da informação atribuído no cadastro do programa.",
            ["programa.gestor_seguranca_informacao"]
          ),
          governancaContexto: { aba: "equipe", detalhe: "Campo «Gestor de segurança da informação»." },
        };
      case "0.4":
        return {
          ...binario(
            responsavelPreenchido(programa.encarregado_dados_pessoais),
            "Há encarregado (DPO) atribuído no cadastro do programa.",
            "Não há encarregado pelo tratamento de dados pessoais atribuído no cadastro do programa.",
            ["programa.encarregado_dados_pessoais"]
          ),
          governancaContexto: { aba: "equipe", detalhe: "Campo «Encarregado (dados pessoais)»." },
        };
      case "0.5":
        return {
          ...binario(
            responsavelPreenchido(programa.responsavel_gestao_integridade),
            "Há responsável pela gestão da integridade atribuído no cadastro.",
            "Não há responsável pela gestão da integridade atribuído no cadastro do programa.",
            ["programa.responsavel_gestao_integridade"]
          ),
          governancaContexto: { aba: "equipe", detalhe: "Campo «Responsável pela gestão da integridade»." },
        };
      case "0.6":
        return {
          ...binario(
            grupos.comiteSi > 0,
            `Comitê de SI: ${grupos.comiteSi} membro(s) registrado(s).`,
            "Nenhum membro registrado para o comitê de segurança da informação.",
            ["programa_grupo_governanca.comite_seguranca_informacao"]
          ),
          governancaContexto: { aba: "si", detalhe: "Membros do comitê de SI." },
        };
      case "0.7":
        return {
          ...binario(
            grupos.comiteDados > 0,
            `Comitê de proteção de dados: ${grupos.comiteDados} membro(s) registrado(s).`,
            "Nenhum membro registrado para o comitê de proteção de dados pessoais.",
            ["programa_grupo_governanca.comite_protecao_dados"]
          ),
          governancaContexto: { aba: "priva", detalhe: "Membros do comitê de privacidade." },
        };
      case "0.8":
        return {
          ...binario(
            grupos.etir > 0,
            `ETIR: ${grupos.etir} membro(s) registrado(s).`,
            "Nenhum membro registrado para a ETIR.",
            ["programa_grupo_governanca.etir"]
          ),
          governancaContexto: { aba: "etir", detalhe: "Membros da ETIR." },
        };
      case "0.9":
        return binario(
          pgsiComConteudo,
          "Existe PGSI salvo no programa com ao menos uma seção com texto.",
          "Não há PGSI com conteúdo preenchido (politica_pgsi).",
          [`politica_programa.${TIPO_POLITICA_PGSI}`]
        );
      case "0.10":
        return binario(
          pgpComConteudo,
          "Existe PGP salvo no programa com ao menos uma seção com texto.",
          "Não há PGP com conteúdo preenchido (politica_pgp).",
          [`politica_programa.${TIPO_POLITICA_PGP}`]
        );
      case "0.11":
        return binario(
          posinComConteudo,
          "Existe POSIN salva no programa com ao menos uma seção com texto.",
          "Não há POSIN com conteúdo preenchido (politica_seguranca_informacao).",
          [`politica_programa.${TIPO_POLITICA_POSIN}`]
        );
      case "0.12":
        return binario(
          protecaoDadosComConteudo,
          "Existe Política de Proteção de Dados Pessoais com conteúdo preenchido.",
          "Não há política politica_protecao_dados_pessoais com conteúdo preenchido.",
          [`politica_programa.${TIPO_POLITICA_PROTECAO_DADOS}`]
        );
      default:
        return semRegra;
    }
  }

  if (id.startsWith("26.")) {
    const comiteIaOk =
      grupos.comiteIa > 0 ||
      programa.comite_si_ia_na_pauta === true ||
      programa.comite_priva_ia_na_pauta === true;

    switch (id) {
      case "26.1":
        return {
          ...maturidade(
            responsavelPreenchido(programa.responsavel_governanca_ia) ? 1 : 5,
            responsavelPreenchido(programa.responsavel_governanca_ia)
              ? "Há responsável por governança de IA indicado na Estrutura de Governança."
              : "Não há responsável por governança de IA no cadastro do programa.",
            ["programa.responsavel_governanca_ia"],
            responsavelPreenchido(programa.responsavel_governanca_ia) ? "media" : "media"
          ),
          governancaContexto: {
            aba: "equipe",
            detalhe: "Campo «Responsável por governança de IA» (seção AIGP).",
          },
        };
      case "26.2": {
        const motivoComite =
          grupos.comiteIa > 0
            ? `Comitê de IA: ${grupos.comiteIa} membro(s) registrado(s).`
            : programa.comite_si_ia_na_pauta || programa.comite_priva_ia_na_pauta
              ? "IA na pauta formal de comitê SI/privacidade (confirme atas institucionais)."
              : "Nenhum comitê de IA nem flag de pauta em comitês PPSI.";
        return {
          ...maturidade(
            comiteIaOk ? (grupos.comiteIa > 0 ? 1 : 3) : 5,
            motivoComite,
            [
              "programa_grupo_governanca.comite_governanca_ia",
              "programa.comite_si_ia_na_pauta",
              "programa.comite_priva_ia_na_pauta",
            ],
            grupos.comiteIa > 0 ? "media" : "baixa"
          ),
          governancaContexto: {
            aba: grupos.comiteIa > 0 ? "ia" : programa.comite_si_ia_na_pauta ? "si" : "priva",
            detalhe: grupos.comiteIa > 0
              ? "Membros do comitê de governança de IA."
              : "Marque «IA na pauta» no comitê SI ou privacidade, ou cadastre comitê dedicado.",
          },
        };
      }
      case "26.3": {
        const papeis = [
          programa.representante_alta_administracao,
          programa.gestor_tic,
          programa.gestor_seguranca_informacao,
          programa.encarregado_dados_pessoais,
          programa.responsavel_gestao_integridade,
        ];
        const preenchidos = papeis.filter((v) => responsavelPreenchido(v)).length;
        const nivel = preenchidos >= 5 ? 1 : preenchidos >= 3 ? 3 : 5;
        return {
          ...maturidade(
            nivel,
            `${preenchidos}/5 papéis PPSI preenchidos na equipe${responsavelPreenchido(programa.responsavel_governanca_ia) ? "; responsável IA indicado." : "."}`,
            ["programa.*_papeis_ppsi", "programa.responsavel_governanca_ia"]
          ),
          governancaContexto: {
            aba: "equipe",
            detalhe: "Papéis PPSI + responsável por governança de IA (RACI operacional).",
          },
        };
      }
      default:
        return semRegra;
    }
  }

  if (id.startsWith("27.") && conformidade) {
    const n = conformidade.sistemasIaCount ?? 0;
    const nProd = conformidade.sistemasIaProducaoCount ?? 0;
    switch (id) {
      case "27.1":
        return {
          ...maturidade(
            n > 0 ? 1 : 5,
            n > 0 ? `${n} sistema(s) de IA no inventário.` : "Inventário de IA vazio.",
            ["sistema_ia"]
          ),
          acaoModulo: {
            path: "conformidade/inventario-ia",
            label: "Abrir inventário de IA",
            detalhe: "Cadastre sistemas e usos de IA para fundamentar as medidas 27.x.",
          },
        };
      case "27.2":
        return {
          ...maturidade(
            n > 0 ? 3 : 5,
            n > 0
              ? "Verifique dono de negócio e responsável técnico em cada item do inventário."
              : "Sem sistemas cadastrados no inventário de IA.",
            ["sistema_ia.dono_negocio", "sistema_ia.responsavel_tecnico_id"],
            "baixa"
          ),
          acaoModulo: {
            path: "conformidade/inventario-ia",
            label: "Abrir inventário de IA",
            detalhe: "Preencha dono de negócio e responsável técnico em cada sistema.",
          },
        };
      case "27.5":
        return {
          ...maturidade(
            nProd > 0 ? 3 : n > 0 ? 4 : 5,
            nProd > 0
              ? `${nProd} sistema(s) em produção no inventário (gate parcial).`
              : "Nenhum sistema em status produção no inventário.",
            ["sistema_ia.status_ciclo"]
          ),
          acaoModulo: {
            path: "conformidade/inventario-ia",
            label: "Abrir inventário de IA",
            detalhe: "Atualize o status de ciclo de vida dos sistemas de IA.",
          },
        };
      default:
        break;
    }
  }

  if (!conformidade) return semRegra;

  const c = conformidade;
  switch (id) {
    case "19.1":
      return maturidade(
        c.ropaCount > 0 ? 1 : 5,
        c.ropaCount > 0
          ? `${c.ropaCount} operação(ões) no ROPA.`
          : "Nenhuma operação cadastrada no ROPA.",
        ["ropa"]
      );
    case "19.2":
      return maturidade(
        c.mapeamentoCount > 0 && c.ropaCount > 0 ? 1 : c.ropaCount > 0 ? 3 : 5,
        "Fluxos documentados via mapeamento de dados e ROPA.",
        ["mapeamento_dados", "ropa"]
      );
    case "19.3":
      return maturidade(c.ropaCount > 0 ? 3 : 5, "Agentes e compartilhamentos no ROPA (revisar transferências).", [
        "ropa",
      ]);
    case "19.4":
      return maturidade(
        c.ropaCount > 0 ? 1 : 5,
        c.ropaCount > 0 ? "Categorias de dados/titulares no ROPA." : "ROPA sem operações.",
        ["ropa"]
      );
    case "20.1":
      return maturidade(
        c.incidenteCount >= 0 ? 1 : 5,
        "Módulo de incidentes disponível no FPSI.",
        ["incidente"]
      );
    case "21.1":
      return maturidade(
        responsavelPreenchido(programa.encarregado_dados_pessoais) ? 1 : 5,
        "Encarregado cadastrado + dashboard operacional.",
        ["programa.encarregado_dados_pessoais"]
      );
    case "21.2":
      return maturidade(
        c.temSlugPortal ? 1 : 5,
        c.temSlugPortal ? "Portal público configurado (slug)." : "Programa sem slug de portal.",
        ["programa.slug"]
      );
    case "21.3":
      return maturidade(1, "Módulo pedidos de titulares com SLA 15 dias.", ["pedido_titular"]);
    case "21.4":
      return maturidade(
        c.temSlugPortal && responsavelPreenchido(programa.encarregado_dados_pessoais) ? 1 : 3,
        "Portal público + DPO no cadastro.",
        ["programa.slug", "programa.encarregado_dados_pessoais"]
      );
    case "3.3":
      return maturidade(1, "RLS Supabase + RBAC programa_users implementados no código.", ["migrations RLS"]);
    case "3.14":
      return maturidade(1, "Trilha user_activities + módulo Auditoria.", ["user_activities"]);
    case "6.8":
      return maturidade(1, "RBAC por programa e checagens em APIs.", ["programa_users"]);
    case "16.4":
      return maturidade(1, "Inventário de componentes via package-lock.json.", ["package-lock.json"]);
    case "25.7":
      return maturidade(3, "HTTPS, RLS e auditoria; MFA ainda pendente.", ["vercel.json", "RLS"]);
    default:
      return semRegra;
  }
}

export function respostaAtualIgualSugestao(respostaAtual: unknown, sugerida: number | null): boolean {
  if (sugerida == null) return false;
  const n = typeof respostaAtual === "string" ? parseInt(respostaAtual, 10) : respostaAtual;
  if (typeof n !== "number" || Number.isNaN(n)) return false;
  return n === sugerida;
}

export function textoJustificativaSugestao(s: EvidenciaSugestao): string {
  if (!s.regraDefinida || s.respostaSugerida == null) return "";
  return `[Sugestão do sistema] ${s.motivo} Fontes: ${s.fontes.length ? s.fontes.join(", ") : "—"}.`;
}

export function labelRespostaSugerida(s: EvidenciaSugestao): string {
  if (s.respostaSugerida == null) return "";
  if (s.tipoEscala === "binario") return s.respostaSugerida === 1 ? "Sim" : "Não";
  if (s.respostaSugerida === 6) return "Não se aplica";
  return `Nível ${s.respostaSugerida}`;
}
