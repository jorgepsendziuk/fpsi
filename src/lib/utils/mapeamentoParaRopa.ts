import type { MapeamentoDadosRow, RopaRow } from "@/lib/services/dataService";
import {
  labelFinalidade,
  labelTitular,
  labelTiposDados,
  labelFluxoCompartilhamento,
  labelTransferencia,
} from "@/lib/utils/mapeamentoDadosOptions";

export type RopaInsertPayload = Omit<RopaRow, "id" | "programa_id" | "registro_ropa_id" | "created_at" | "updated_at">;

const BASE_LEGAL_REVISAR =
  "Revisar: indicar a hipótese legal aplicável (art. 7º ou 11º LGPD) ao caso concreto, com apoio do encarregado/DPO.";

/**
 * Monta payload para `createRopa` a partir de um levantamento de mapeamento (regras determinísticas).
 */
export function buildRopaPayloadFromMapeamento(m: MapeamentoDadosRow): RopaInsertPayload {
  const nome = (m.nome ?? "").trim() || "Operação sem nome";
  const finDet = m.finalidade_detalhe?.trim();
  const finCat = m.finalidade_categoria ? labelFinalidade(m.finalidade_categoria) : "";
  const finalidade =
    [finDet, finCat].filter(Boolean).join(" — ").trim() || "Tratamento de dados pessoais conforme levantamento de mapeamento.";

  const titular =
    m.categoria_titular === "outros" && m.titular_outro?.trim()
      ? m.titular_outro.trim()
      : labelTitular(m.categoria_titular);

  const tiposLabel = labelTiposDados(m.tipos_dados);
  const categoriasDados = tiposLabel !== "—" ? tiposLabel : null;
  const categoriasTitulares = titular !== "—" ? titular : null;

  const fluxo = m.fluxo_compartilhamento ? labelFluxoCompartilhamento(m.fluxo_compartilhamento) : "";
  const det = m.compartilhamento_detalhe?.trim();
  const compartilhamento =
    [fluxo, det].filter(Boolean).join(" — ").trim() || null;

  const transf = m.transferencia_internacional ? labelTransferencia(m.transferencia_internacional) : null;

  const extras = [m.descricao?.trim(), m.sistemas_ou_fontes?.trim(), transf ? `Transferência internacional: ${transf}` : ""]
    .filter(Boolean)
    .join("\n");

  return {
    nome,
    finalidade,
    base_legal: BASE_LEGAL_REVISAR,
    mapeamento_id: m.id,
    categorias_dados: categoriasDados,
    categorias_titulares: categoriasTitulares,
    compartilhamento: compartilhamento || (extras ? `Ver levantamento de mapeamento.\n${extras}` : null),
    retencao: null,
    medidas_seguranca: null,
    responsavel: null,
  };
}
