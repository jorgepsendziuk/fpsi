/**
 * PDF do RIPD (cliente, jsPDF) — art. 38 LGPD, cabeçalho alinhado ao ROPA/políticas.
 */
import { jsPDF } from "jspdf";
import type { RipdRow } from "@/lib/services/dataService";
import {
  getPoliticaNomeProgramaRotulo,
  getPoliticaPdfCabecalhoTitulo,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import {
  drawFooterAllPages,
  drawProgramaPoliticaPdfHeader,
  fieldBlock,
  sectionBar,
} from "@/lib/utils/ropaPdf";
import {
  labelBaseLegalRipd,
  labelCategoriaDadoRipd,
  labelDecisaoControlador,
  labelNivelRisco,
  labelParecerDpoStatus,
  labelTipoRiscoRipd,
  RIPD_STATUS_LABELS,
} from "@/lib/utils/ripdOptions";

export type BuildRipdPdfParams = {
  programa: PoliticaProgramaDados;
  idOrSlug: string;
  row: RipdRow;
  /** Nome da operação ROPA vinculada, se houver */
  ropaNome: string | null;
};

export async function buildRipdPdfDocument(params: BuildRipdPdfParams): Promise<jsPDF> {
  const { programa, idOrSlug, row, ropaNome } = params;

  const nomeFallback =
    getPoliticaPdfCabecalhoTitulo(programa) ||
    getPoliticaNomeProgramaRotulo(programa, idOrSlug);

  const metaLine = `Programa: ${getPoliticaNomeProgramaRotulo(programa, idOrSlug)} | Exportado em ${new Date().toLocaleString("pt-BR")} | Status: ${RIPD_STATUS_LABELS[row.status] ?? row.status}`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const titleLines = ["Relatório de Impacto à Proteção de Dados Pessoais", "(RIPD) — art. 38 LGPD"];

  let y = await drawProgramaPoliticaPdfHeader(doc, programa, nomeFallback, titleLines, metaLine);

  y = fieldBlock(doc, y, "Título do relatório", row.titulo ?? "");
  y = fieldBlock(doc, y, "Operação vinculada (ROPA)", ropaNome?.trim() ? ropaNome : "—");

  y = sectionBar(doc, y, "I — Descrição dos tipos de dados coletados (art. 38, I)");
  y = fieldBlock(doc, y, "Categorias (referência)", labelCategoriaDadoRipd(row.categorias_dados_chaves));
  y = fieldBlock(doc, y, "Descrição", row.descricao_dados ?? "");
  y = fieldBlock(doc, y, "Base legal predominante (apoio)", labelBaseLegalRipd(row.base_legal_predominante));

  y = sectionBar(doc, y, "II — Metodologia de coleta e segurança (art. 38, II)");
  y = fieldBlock(doc, y, "Metodologia e segurança", row.metodologia_coleta_seguranca ?? "");

  y = sectionBar(doc, y, "III — Medidas, salvaguardas e mitigação (art. 38, III)");
  y = fieldBlock(doc, y, "Análise do controlador", row.medidas_salvaguardas_mitigacao ?? "");

  y = sectionBar(doc, y, "IV — Riscos decorrentes do tratamento (art. 38, IV)");
  y = fieldBlock(doc, y, "Nível de risco (apoio)", labelNivelRisco(row.nivel_risco));
  y = fieldBlock(doc, y, "Tipos de risco identificados", labelTipoRiscoRipd(row.tipos_risco));
  y = fieldBlock(doc, y, "Descrição dos riscos", row.riscos_tratamento ?? "");

  y = sectionBar(doc, y, "Parecer do encarregado (DPO)");
  y = fieldBlock(doc, y, "Posição", labelParecerDpoStatus(row.parecer_dpo_status));
  y = fieldBlock(doc, y, "Texto do parecer", row.parecer_dpo ?? "");

  y = sectionBar(doc, y, "Decisão e conclusão");
  y = fieldBlock(doc, y, "Decisão do controlador", labelDecisaoControlador(row.decisao_controlador));
  y = fieldBlock(doc, y, "Conclusão / próximos passos", row.conclusao ?? "");

  drawFooterAllPages(doc);
  return doc;
}
