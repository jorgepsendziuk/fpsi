import type { MapeamentoDadosRow } from "@/lib/services/dataService";
import type { MapeamentoSugestaoItem } from "@/lib/ai/suggestMapeamentosSchema";
import { sanitizeMapeamentoSugestao } from "@/lib/ai/suggestMapeamentosSchema";

export function sugestaoItemToMapeamentoPayload(
  s: MapeamentoSugestaoItem
): Omit<MapeamentoDadosRow, "id" | "programa_id" | "created_at" | "updated_at"> {
  const x = sanitizeMapeamentoSugestao(s);
  return {
    nome: x.nome.trim(),
    descricao: x.descricao ?? null,
    sistemas_ou_fontes: x.sistemas_ou_fontes ?? null,
    setor_area: x.setor_area,
    setor_outro: x.setor_outro ?? null,
    finalidade_categoria: x.finalidade_categoria,
    finalidade_detalhe: x.finalidade_detalhe ?? null,
    meios_armazenamento: x.meios_armazenamento,
    meios_outro: x.meios_outro ?? null,
    tipos_dados: x.tipos_dados,
    tipos_outro: x.tipos_outro ?? null,
    fluxo_compartilhamento: x.fluxo_compartilhamento ?? null,
    compartilhamento_detalhe: x.compartilhamento_detalhe ?? null,
    categoria_titular: x.categoria_titular,
    titular_outro: x.titular_outro ?? null,
    transferencia_internacional: x.transferencia_internacional,
  };
}
