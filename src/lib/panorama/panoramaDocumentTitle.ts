import { getPoliticaPdfCabecalhoTitulo, type PoliticaProgramaDados } from "@/lib/utils/politicaPlaceholders";

const SUFIXO = "Panorama FPSI";

function nomeProgramaParaTitulo(programa: PoliticaProgramaDados | null | undefined): string {
  const fromHelper = programa ? getPoliticaPdfCabecalhoTitulo(programa) : "";
  if (fromHelper?.trim()) return fromHelper.trim();
  if (programa && typeof programa === "object") {
    const nf = String((programa as { nome_fantasia?: string }).nome_fantasia ?? "").trim();
    if (nf) return nf;
  }
  return "Programa";
}

/** Título do documento (aba do navegador / nome sugerido ao salvar PDF). */
export function buildPanoramaDocumentTitle(programa: PoliticaProgramaDados | null | undefined): string {
  const nome = nomeProgramaParaTitulo(programa).replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim();
  return `${nome} - ${SUFIXO}`;
}