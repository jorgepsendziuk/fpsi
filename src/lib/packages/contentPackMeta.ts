import {
  operationalPackIdForPrograma,
  type ProgramaPackContext,
} from "@/lib/packages/programaContentPack";

export type ContentPackOrigem = "proprio" | "terceiro";

export type ContentPackMeta = {
  id: string;
  nome: string;
  origem: ContentPackOrigem;
  titular: string;
  licenca: string;
  url_fonte?: string | null;
  notaUi?: string;
};

export const CONTENT_PACK_UI: Record<string, ContentPackMeta> = {
  "ppsi-2.0": {
    id: "ppsi-2.0",
    nome: "PPSI 2.0",
    origem: "terceiro",
    titular: "SGD/MGI — Governo Federal",
    licenca: "CC BY-NC-ND 4.0",
    url_fonte: "https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/",
    notaUi: "Metodologia do Guia PPSI 2.0. Não é criação autoral do FPSI.",
  },
  "governanca-ia": {
    id: "governanca-ia",
    nome: "Governança de IA",
    origem: "proprio",
    titular: "FPSI",
    licenca: "MIT",
    notaUi: "Conteúdo autoral do FPSI. Referências a AIGP/IAPP, NIST e ISO são indicativas.",
  },
  framework: {
    id: "framework",
    nome: "Framework da FPSI",
    origem: "proprio",
    titular: "FPSI",
    licenca: "MIT",
    notaUi:
      "Metodologia própria da Ferramenta para empresas privadas (estrutura, SI, privacidade; CSI, CPDP, ETIR). Distinta do pacote PPSI 2.0.",
  },
};

export function packMetaForDiagnosticoId(diagnosticoId: number): ContentPackMeta | null {
  return packMetaForProgramaDiagnostico(diagnosticoId, { setor: 1 });
}

export function packMetaForProgramaDiagnostico(
  diagnosticoId: number,
  programa: ProgramaPackContext | number | null | undefined
): ContentPackMeta | null {
  const ctx: ProgramaPackContext | null =
    typeof programa === "number" || programa == null ? { setor: programa ?? undefined } : programa;
  if (diagnosticoId >= 1 && diagnosticoId <= 3) {
    return CONTENT_PACK_UI[operationalPackIdForPrograma(ctx)];
  }
  if (diagnosticoId === 4) return CONTENT_PACK_UI["governanca-ia"];
  return null;
}

export function attributionLabel(meta: ContentPackMeta): string {
  const origem = meta.origem === "terceiro" ? "Terceiro" : "FPSI";
  return `${meta.nome} — Fonte: ${origem} — Licença: ${meta.licenca}`;
}

/** Aviso ao criar programa de órgão público — alinhado a content-packs/ppsi-2.0/LICENSE.md e manifest.json. */
export const PPSI_WIZARD_LICENSE_NOTICE = {
  intro:
    "Textos e catálogo de controles e medidas derivados do Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0) são conteúdo de terceiros.",
  titular: "Governo Federal do Brasil (SGD/MGI)",
  licencaLonga:
    "Creative Commons Atribuição–NãoComercial–SemDerivações 4.0 Internacional (CC BY-NC-ND 4.0), com atribuição ao governo federal",
  restricoes: [
    "Atribuição ao governo federal",
    "Uso não comercial do conteúdo do Guia e do catálogo",
    "Sem obras derivadas (SemDerivações)",
    "Confirme a licença no PDF oficial do Guia antes de redistribuir esse conteúdo",
  ],
  notaFerramenta:
    "O código da Ferramenta FPSI permanece sob MIT e não redistribui esses textos sob licença mais permissiva.",
} as const;