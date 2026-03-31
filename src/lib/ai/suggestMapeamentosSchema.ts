import { z } from "zod";
import {
  SETOR_AREA_OPCOES,
  FINALIDADE_OPCOES,
  MEIOS_ARMAZENAMENTO_OPCOES,
  TIPOS_DADOS_OPCOES,
  FLUXO_COMPARTILHAMENTO_OPCOES,
  CATEGORIA_TITULAR_OPCOES,
  TRANSFERENCIA_INTERNACIONAL_OPCOES,
} from "@/lib/utils/mapeamentoDadosOptions";

function enumFromKeys<const T extends readonly { key: string }[]>(opts: T): z.ZodEnum<[string, ...string[]]> {
  const keys = opts.map((o) => o.key) as [string, ...string[]];
  return z.enum(keys);
}

const setorZ = enumFromKeys(SETOR_AREA_OPCOES);
const finalidadeZ = enumFromKeys(FINALIDADE_OPCOES);
const meioZ = enumFromKeys(MEIOS_ARMAZENAMENTO_OPCOES);
const tipoZ = enumFromKeys(TIPOS_DADOS_OPCOES);
const fluxoZ = enumFromKeys(FLUXO_COMPARTILHAMENTO_OPCOES);
const titularZ = enumFromKeys(CATEGORIA_TITULAR_OPCOES);
const transfZ = enumFromKeys(TRANSFERENCIA_INTERNACIONAL_OPCOES);

/** Um levantamento sugerido (alinhado a `MapeamentoDadosRow` insert). */
export const mapeamentoSugestaoItemSchema = z.object({
  nome: z.string().min(1).max(500),
  descricao: z.string().max(8000).nullable().optional(),
  sistemas_ou_fontes: z.string().max(8000).nullable().optional(),
  setor_area: setorZ,
  setor_outro: z.string().max(500).nullable().optional(),
  finalidade_categoria: finalidadeZ,
  finalidade_detalhe: z.string().max(8000).nullable().optional(),
  meios_armazenamento: z.array(meioZ).default([]),
  meios_outro: z.string().max(2000).nullable().optional(),
  tipos_dados: z.array(tipoZ).default([]),
  tipos_outro: z.string().max(2000).nullable().optional(),
  fluxo_compartilhamento: fluxoZ.nullable().optional(),
  compartilhamento_detalhe: z.string().max(2000).nullable().optional(),
  categoria_titular: titularZ,
  titular_outro: z.string().max(500).nullable().optional(),
  transferencia_internacional: transfZ,
});

export type MapeamentoSugestaoItem = z.infer<typeof mapeamentoSugestaoItemSchema>;

export const suggestMapeamentosResponseSchema = z.object({
  suggestions: z.array(mapeamentoSugestaoItemSchema).min(1).max(12),
});

export type SuggestMapeamentosResponse = z.infer<typeof suggestMapeamentosResponseSchema>;

/**
 * Ajusta campos condicionais (outro) e remove chaves inválidas de arrays.
 */
export function sanitizeMapeamentoSugestao(raw: MapeamentoSugestaoItem): MapeamentoSugestaoItem {
  const meios = Array.from(new Set(raw.meios_armazenamento)).filter((k) =>
    MEIOS_ARMAZENAMENTO_OPCOES.some((o) => o.key === k)
  );
  const tipos = Array.from(new Set(raw.tipos_dados)).filter((k) => TIPOS_DADOS_OPCOES.some((o) => o.key === k));

  return {
    ...raw,
    setor_outro: raw.setor_area === "outro" ? (raw.setor_outro?.trim() || "Área não listada — revisar") : null,
    finalidade_detalhe:
      raw.finalidade_categoria === "outro"
        ? raw.finalidade_detalhe?.trim() || "Revisar finalidade."
        : raw.finalidade_detalhe?.trim() || null,
    titular_outro:
      raw.categoria_titular === "outros" ? raw.titular_outro?.trim() || "Revisar titulares." : null,
    meios_armazenamento: meios.length ? meios : ["sistema_interno"],
    meios_outro: meios.includes("outro") ? raw.meios_outro?.trim() || null : null,
    tipos_dados: tipos.length ? tipos : ["identificacao"],
    tipos_outro: tipos.includes("outros_tipos") ? raw.tipos_outro?.trim() || null : null,
    descricao: raw.descricao?.trim() || null,
    sistemas_ou_fontes: raw.sistemas_ou_fontes?.trim() || null,
    compartilhamento_detalhe: raw.compartilhamento_detalhe?.trim() || null,
  };
}
