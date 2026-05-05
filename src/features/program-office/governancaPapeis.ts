import type { Programa } from "@/lib/types/types";
import type { CampoResponsavelProgramaId } from "@/content/governancaOrientacaoPrograma";

/** Ordem na mesa: cabeceira (alta administração) à esquerda, demais à direita — PPSI 2.0. */
export const MESA_PAPéis_ORDER: {
  campo: CampoResponsavelProgramaId;
  rotulo: string;
  /** Indica cadeira “cabeceira” (destaque visual). */
  chefe: boolean;
}[] = [
  { campo: "representante_alta_administracao", rotulo: "Representante da alta administração", chefe: true },
  { campo: "responsavel_gestao_integridade", rotulo: "Gestão da integridade", chefe: false },
  { campo: "gestor_seguranca_informacao", rotulo: "Gestor de SI", chefe: false },
  { campo: "encarregado_dados_pessoais", rotulo: "Encarregado (dados pessoais)", chefe: false },
  { campo: "gestor_tic", rotulo: "Gestor de TIC", chefe: false },
];

export function idResponsavelPapel(programa: Programa, campo: CampoResponsavelProgramaId): number | null {
  const v = programa[campo];
  if (v == null || v === undefined) return null;
  return typeof v === "number" ? v : null;
}

export type TipoComite = "comite_seguranca_informacao" | "comite_protecao_dados" | "etir";

export const COMITES: { tipo: TipoComite; titulo: string; subtitulo: string; aba: "si" | "priva" | "etir" }[] = [
  {
    tipo: "comite_seguranca_informacao",
    titulo: "Comitê de segurança da informação",
    subtitulo: "CSI",
    aba: "si",
  },
  {
    tipo: "comite_protecao_dados",
    titulo: "Comitê de privacidade",
    subtitulo: "Proteção de dados",
    aba: "priva",
  },
  {
    tipo: "etir",
    titulo: "ETIR",
    subtitulo: "Prevenção e resposta a incidentes",
    aba: "etir",
  },
];
