/**
 * PDF — Ato Formal para Indicação de Encarregado (Anexos I e II, Resolução CD/ANPD nº 18/2024).
 */
import { jsPDF } from "jspdf";
import {
  getPoliticaNomeProgramaRotulo,
  getPoliticaPdfCabecalhoTitulo,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import {
  CONTENT_W,
  drawFooterAllPages,
  drawProgramaPoliticaPdfHeader,
  ensureSpace,
  LINE_BODY,
  MARGIN,
} from "@/lib/utils/ropaPdf";
import {
  atoFormalAnexoId,
  atoFormalTituloLinhas,
  buildAtoFormalParagrafos,
  formatDataExtensoPt,
  type TermoNomeacaoDpoDraft,
} from "@/lib/utils/termoNomeacaoDpo";

const BODY_SIZE = 10;
const LINE = LINE_BODY + 0.7;

function writeParagraph(doc: jsPDF, y: number, text: string, opts?: { bold?: boolean; indent?: number }): number {
  const indent = opts?.indent ?? 0;
  const maxW = CONTENT_W - indent;
  doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  doc.setFontSize(BODY_SIZE);
  doc.setTextColor(25, 25, 25);
  const lines = doc.splitTextToSize(text, maxW) as string[];
  for (const ln of lines) {
    y = ensureSpace(doc, y, LINE + 2);
    doc.text(ln, MARGIN + indent, y);
    y += LINE;
  }
  return y + 3.2;
}

function writeSignedBlock(
  doc: jsPDF,
  y: number,
  left: { name: string; role: string },
  right?: { name: string; role: string } | null
): number {
  y = ensureSpace(doc, y, 36);
  const colW = right ? CONTENT_W / 2 - 4 : CONTENT_W;
  const drawCol = (x: number, person: { name: string; role: string }) => {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(x, y, x + Math.min(colW, 78), y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(person.name || "[Nome]", x, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 70, 70);
    doc.text(person.role, x, y + 9.5);
    doc.setTextColor(25, 25, 25);
  };
  drawCol(MARGIN, left);
  if (right) drawCol(MARGIN + CONTENT_W / 2 + 2, right);
  return y + 18;
}

export type BuildTermoNomeacaoDpoPdfParams = {
  programa: PoliticaProgramaDados;
  idOrSlug: string;
  draft: TermoNomeacaoDpoDraft;
};

export async function buildTermoNomeacaoDpoPdf(params: BuildTermoNomeacaoDpoPdfParams): Promise<jsPDF> {
  const { programa, idOrSlug, draft } = params;
  const anexo = atoFormalAnexoId(draft.tipoEncarregado);
  const tituloLinhas = atoFormalTituloLinhas(draft.tipoEncarregado);

  const nomeFallback =
    getPoliticaPdfCabecalhoTitulo(programa) || getPoliticaNomeProgramaRotulo(programa, idOrSlug);

  const metaLine = `Anexo ${anexo} da Resolução CD/ANPD nº 18/2024 | Programa: ${getPoliticaNomeProgramaRotulo(programa, idOrSlug)} | Gerado em ${new Date().toLocaleString("pt-BR")}`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = await drawProgramaPoliticaPdfHeader(doc, programa, nomeFallback, tituloLinhas, metaLine);

  const [p1, p2, p3] = buildAtoFormalParagrafos(draft);
  y = writeParagraph(doc, y, p1);
  y = writeParagraph(doc, y, p2);
  y = writeParagraph(doc, y, p3);

  const dataExtenso = formatDataExtensoPt(draft.dataNomeacao);
  const cidade = draft.cidadeAssinatura.trim();
  const localData = cidade ? `${cidade}, ${dataExtenso}.` : `${dataExtenso}.`;
  y = writeParagraph(doc, y, localData, { bold: true });

  y += 8;
  y = writeSignedBlock(doc, y, {
    name: draft.representanteLegalNome.trim().toUpperCase() || "[REPRESENTANTE LEGAL]",
    role: draft.representanteLegalCargo.trim() || "Representante legal do controlador",
  });

  const cienciaNome =
    draft.tipoEncarregado === "pessoa_juridica"
      ? draft.dpoPessoaNaturalResponsavel.trim()
      : draft.dpoNome.trim();
  const cienciaRole =
    draft.tipoEncarregado === "pessoa_juridica"
      ? "Pessoa natural responsável (ciência)"
      : "Encarregado(a) (ciência)";

  y += 4;
  y = writeSignedBlock(
    doc,
    y,
    {
      name: cienciaNome.toUpperCase() || "[ENCARREGADO(A)]",
      role: cienciaRole,
    },
    draft.substitutoNome.trim()
      ? {
          name: draft.substitutoNome.trim().toUpperCase(),
          role: "Substituto(a) (ciência)",
        }
      : null
  );

  const hasPlaceholder = /\[.+?\]/.test([p1, p2, p3, draft.representanteLegalNome].join(" "));
  if (hasPlaceholder || !draft.representanteLegalNome.trim()) {
    y = ensureSpace(doc, y, 14);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 80, 20);
    const note =
      "Nota: trechos entre colchetes [ ] indicam dados não disponíveis no cadastro no momento da geração. Complete antes da assinatura formal. Texto alinhado aos Anexos I e II da Resolução CD/ANPD nº 18/2024.";
    const noteLines = doc.splitTextToSize(note, CONTENT_W) as string[];
    for (const ln of noteLines) {
      y = ensureSpace(doc, y, 4);
      doc.text(ln, MARGIN, y);
      y += 3.5;
    }
  }

  drawFooterAllPages(doc);
  return doc;
}

export function safeTermoPdfFileName(organizacao: string, tipo?: TermoNomeacaoDpoDraft["tipoEncarregado"]): string {
  const anexo = tipo ? atoFormalAnexoId(tipo) : "I";
  const base = (organizacao || "ato-encarregado")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `Ato-Formal-Encarregado-Anexo-${anexo}-${base || "org"}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
