/**
 * PDF do ROPA (cliente, jsPDF) — visual alinhado ao cabeçalho das políticas (generate-pdf).
 */
import { jsPDF } from "jspdf";
import type { RegistroRopaRow } from "@/lib/services/dataService";
import {
  formatCnpjBrasil,
  getPoliticaNomeOrgao,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import {
  FPSI_LOGO_PUBLIC_URL,
  getProgramaLogoDisplayUrl,
  isProgramaDemonstracao,
} from "@/lib/utils/programaDemoLogo";

const MARGIN = 20;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - 10;

const CATEGORIA_LABELS: Record<string, string> = {
  titulares_em_geral: "Titulares em geral",
  criancas_adolescentes: "Crianças e adolescentes",
  idosos: "Idosos",
};

const TIPO_DADO_LABELS: Record<string, string> = {
  nome: "Nome",
  endereco: "Endereço",
  rg: "RG",
  email: "E-mail",
  cpf: "CPF",
  telefone: "Telefone",
};

function formatCategoriasTitulares(keys: string[]): string {
  if (!keys.length) return "—";
  return keys.map((k) => CATEGORIA_LABELS[k] ?? k).join(", ");
}

function formatTiposDados(keys: string[]): string {
  if (!keys.length) return "—";
  return keys.map((k) => TIPO_DADO_LABELS[k] ?? k).join(", ");
}

function getPublicBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  const raw = process.env.NEXT_PUBLIC_APP_URL || "";
  return raw.replace(/\/$/, "");
}

function resolvePortalPrivacidadeUrl(programa: PoliticaProgramaDados): string | null {
  if (!programa || typeof programa !== "object") return null;
  const slug = typeof programa.slug === "string" ? programa.slug.trim() : "";
  if (!slug) return null;
  return `${getPublicBaseUrl()}/${encodeURIComponent(slug)}`;
}

function getImageDimensionsFromDataUrl(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined") {
      resolve({ w: 240, h: 120 });
      return;
    }
    const img = new Image();
    img.onload = () =>
      resolve({
        w: img.naturalWidth || 240,
        h: img.naturalHeight || 120,
      });
    img.onerror = () => resolve({ w: 240, h: 120 });
    img.src = dataUrl;
  });
}

async function loadImageDataUrlForPdf(src: string): Promise<string | null> {
  try {
    const s = src.trim();
    if (s.startsWith("data:image")) return s;
    const url = s.startsWith("/") ? `${getPublicBaseUrl()}${s}` : s;
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(new Error("read"));
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export type RopaPdfOperacao = {
  /** ID da linha em `ropa` (auditoria) */
  id?: string;
  nome: string;
  finalidade: string;
  baseLegal: string;
  createdAt: string;
  mapeamentoId?: string | null;
  mapeamentoNome?: string | null;
  responsavel?: string | null;
  retencao?: string | null;
  categoriasDados?: string | null;
  categoriasTitulares?: string | null;
  compartilhamento?: string | null;
  medidasSeguranca?: string | null;
};

export type BuildRopaPdfParams = {
  programa: PoliticaProgramaDados;
  /** Identificador do programa na faixa de meta (slug ou id) */
  idOrSlug: string;
  registro: RegistroRopaRow | null;
  operacoes: RopaPdfOperacao[];
  /** Linha abaixo do título: ex. data de exportação ou versão congelada */
  metaLine: string;
};

function drawFooterAllPages(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    const label = `Página ${i} de ${total}`;
    const w = doc.getTextWidth(label);
    doc.text(label, (PAGE_W - w) / 2, FOOTER_Y);
    doc.setTextColor(0, 0, 0);
  }
}

/**
 * Cabeçalho estilo política: logo + metadados + título + linha.
 * Retorna Y (mm) para iniciar o corpo, abaixo da linha.
 */
async function drawRopaPolicyStyleHeader(
  doc: jsPDF,
  programa: PoliticaProgramaDados,
  nomeFallback: string,
  docTitleLines: string[],
  metaLine: string
): Promise<number> {
  const top = MARGIN;
  const left = MARGIN;
  const maxLogoW = 38;
  const maxLogoH = 18;

  let logoBottomY = top;
  let textLeft = left;

  let dataUrl: string | null = null;
  if (programa && typeof programa === "object" && isProgramaDemonstracao(programa as { slug?: string; id?: number })) {
    dataUrl = await loadImageDataUrlForPdf(FPSI_LOGO_PUBLIC_URL);
  }
  if (!dataUrl && programa && typeof programa === "object") {
    const displayUrl = getProgramaLogoDisplayUrl(
      programa as {
        id?: number;
        slug?: string | null;
        nome?: string | null;
        logo_programa?: string | null;
        logo_orgao_empresa?: string | null;
      }
    );
    if (displayUrl) dataUrl = await loadImageDataUrlForPdf(displayUrl);
  }

  if (dataUrl) {
    const fmt = dataUrl.includes("image/jpeg") || dataUrl.includes("image/jpg") ? "JPEG" : "PNG";
    try {
      const { w: iw, h: ih } = await getImageDimensionsFromDataUrl(dataUrl);
      const scale = Math.min(maxLogoW / iw, maxLogoH / ih, 1);
      const dw = iw * scale;
      const dh = ih * scale;
      doc.addImage(dataUrl, fmt, left, top, dw, dh);
      textLeft = left + dw + 5;
      logoBottomY = top + dh;
    } catch {
      textLeft = left;
    }
  }

  const nome =
    getPoliticaNomeOrgao(programa) ||
    (nomeFallback?.trim() ? nomeFallback.trim() : "") ||
    "Programa";

  let y = top + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(nome, textLeft, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  if (programa && typeof programa === "object") {
    const p = programa as Record<string, unknown>;
    const rs = typeof p.razao_social === "string" ? p.razao_social.trim() : "";
    if (rs && rs !== nome) {
      const lines = doc.splitTextToSize(rs, CONTENT_W - (textLeft - MARGIN));
      lines.forEach((ln: string) => {
        doc.text(ln, textLeft, y);
        y += 3.6;
      });
    }
    const cnpj = formatCnpjBrasil(p.cnpj);
    if (cnpj) {
      doc.text(`CNPJ: ${cnpj}`, textLeft, y);
      y += 3.6;
    }
    const email = typeof p.atendimento_email === "string" ? p.atendimento_email.trim() : "";
    const fone = typeof p.atendimento_fone === "string" ? p.atendimento_fone.trim() : "";
    const site = typeof p.atendimento_site === "string" ? p.atendimento_site.trim() : "";
    const contato = [email, fone, site].filter(Boolean).join(" · ");
    if (contato) {
      const lines = doc.splitTextToSize(contato, CONTENT_W - (textLeft - MARGIN));
      lines.forEach((ln: string) => {
        doc.text(ln, textLeft, y);
        y += 3.6;
      });
    }
  }

  const portalUrl = resolvePortalPrivacidadeUrl(programa);
  if (portalUrl) {
    y += 1;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("Portal de privacidade", textLeft, y);
    y += 3.8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 82, 191);
    const urlLines = doc.splitTextToSize(portalUrl, CONTENT_W - (textLeft - MARGIN));
    urlLines.forEach((ln: string) => {
      const tw = doc.getTextWidth(ln);
      doc.text(ln, textLeft, y);
      try {
        doc.link(textLeft, y - 2.5, tw, 3.5, { url: portalUrl });
      } catch {
        /* ignore */
      }
      y += 3.6;
    });
    doc.setTextColor(0, 0, 0);
  }

  const textBlockBottom = y;
  const blockBottom = Math.max(logoBottomY, textBlockBottom);

  let titleY = blockBottom + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(31, 31, 31);
  for (const line of docTitleLines) {
    const tl = doc.splitTextToSize(line, CONTENT_W);
    tl.forEach((ln: string) => {
      doc.text(ln, MARGIN, titleY);
      titleY += 6.5;
    });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(90, 90, 90);
  doc.text(metaLine, MARGIN, titleY + 1);
  titleY += 6;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.4);
  const ruleY = titleY + 2;
  doc.line(MARGIN, ruleY, PAGE_W - MARGIN, ruleY);
  doc.setTextColor(0, 0, 0);

  return ruleY + 8;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - 18) {
    doc.addPage();
    return MARGIN + 4;
  }
  return y;
}

function sectionBar(doc: jsPDF, y: number, title: string): number {
  y = ensureSpace(doc, y, 12);
  doc.setFillColor(241, 243, 246);
  doc.rect(MARGIN, y, CONTENT_W, 6.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(45, 55, 72);
  doc.text(title, MARGIN + 2, y + 4.3);
  doc.setTextColor(0, 0, 0);
  return y + 9;
}

/** Rótulo em negrito + “: ” e valor (quebra em linhas adicionais alinhadas à margem) */
function fieldBlock(doc: jsPDF, startY: number, label: string, value: string, fontSize = 7.8): number {
  let y = startY;
  const display = (value || "").trim() || "—";
  const prefix = `${label}: `;
  y = ensureSpace(doc, y, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  const labelW = doc.getTextWidth(prefix);
  doc.text(prefix, MARGIN, y);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(display, CONTENT_W - labelW);
  if (lines.length === 0) return y + 3.5;
  doc.text(lines[0], MARGIN + labelW, y);
  y += 3.4;
  for (let i = 1; i < lines.length; i++) {
    y = ensureSpace(doc, y, 4);
    doc.text(lines[i], MARGIN, y);
    y += 3.4;
  }
  return y + 1.2;
}

/** Duas colunas: rótulos curtos */
function fieldPair(
  doc: jsPDF,
  y: number,
  labelA: string,
  valA: string,
  labelB: string,
  valB: string
): number {
  const mid = MARGIN + CONTENT_W / 2 + 2;
  const colW = CONTENT_W / 2 - 4;
  y = ensureSpace(doc, y, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.text(`${labelA}:`, MARGIN, y);
  doc.setFont("helvetica", "normal");
  const la = doc.splitTextToSize(valA || "—", colW - 22);
  doc.text(la[0] ?? "—", MARGIN + 22, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${labelB}:`, mid, y);
  doc.setFont("helvetica", "normal");
  const lb = doc.splitTextToSize(valB || "—", colW - 24);
  doc.text(lb[0] ?? "—", mid + 24, y);
  let extra = 3.4;
  if (la.length > 1 || lb.length > 1) {
    const maxL = Math.max(la.length, lb.length);
    for (let i = 1; i < maxL; i++) {
      y += 3.3;
      y = ensureSpace(doc, y, 4);
      if (la[i]) doc.text(la[i], MARGIN, y);
      if (lb[i]) doc.text(lb[i], mid, y);
    }
    extra += (maxL - 1) * 3.3;
  }
  return y + extra;
}

function addRegistroBody(doc: jsPDF, reg: RegistroRopaRow | null, startY: number): number {
  let y = sectionBar(doc, startY, "Informações do registro");
  if (!reg) {
    y = fieldBlock(doc, y, "Registro", "Não preenchido.");
    return y;
  }

  const cnpjFmt = formatCnpjBrasil(reg.cnpj) || reg.cnpj || "—";

  y = fieldBlock(doc, y, "Organização", reg.organizacao ?? "");
  y = fieldPair(doc, y, "CNPJ", cnpjFmt, "Data do registro", reg.data_registro ?? "");
  y = fieldBlock(doc, y, "Endereço", reg.endereco ?? "");
  y = fieldBlock(doc, y, "Principal atividade", reg.atividade_principal ?? "");
  y = fieldPair(doc, y, "Gestor responsável", reg.gestor_responsavel ?? "", "E-mail", reg.email ?? "");
  y = fieldBlock(doc, y, "Telefone", reg.telefone ?? "");
  y = fieldBlock(doc, y, "Categorias de titulares", formatCategoriasTitulares(reg.categorias_titulares ?? []));
  y = fieldBlock(doc, y, "Medidas de segurança", reg.medidas_seguranca ?? "");
  y = fieldBlock(doc, y, "Dados pessoais (tipos)", formatTiposDados(reg.tipos_dados_pessoais ?? []));
  if ((reg.outros_dados_pessoais ?? "").trim()) {
    y = fieldBlock(doc, y, "Outros dados pessoais", reg.outros_dados_pessoais ?? "");
  }
  y = fieldBlock(doc, y, "Compartilhamento", reg.compartilhamento ?? "");
  y = fieldBlock(doc, y, "Período de armazenamento", reg.periodo_armazenamento ?? "");
  if ((reg.observacoes ?? "").trim()) {
    y = fieldBlock(doc, y, "Observações", reg.observacoes ?? "");
  }
  return y;
}

function addOperacaoBody(doc: jsPDF, op: RopaPdfOperacao, index: number, total: number, startY: number): number {
  let y = startY;
  if (index > 0) {
    y = ensureSpace(doc, y, 6);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 5;
  }

  y = sectionBar(
    doc,
    y,
    total > 1 ? `Operação ${index + 1} de ${total} — ${op.nome || "Sem nome"}` : `Processo — ${op.nome || "Sem nome"}`
  );

  y = fieldBlock(doc, y, "Finalidade", op.finalidade);
  y = fieldBlock(doc, y, "Hipótese legal", op.baseLegal);
  if ((op.mapeamentoNome ?? "").trim()) {
    y = fieldBlock(doc, y, "Levantamento de mapeamento", op.mapeamentoNome ?? "");
  } else if ((op.mapeamentoId ?? "").toString().trim()) {
    y = fieldBlock(doc, y, "Levantamento de mapeamento (id)", String(op.mapeamentoId));
  }
  y = fieldPair(doc, y, "Data de registro", op.createdAt, "ID (sistema)", op.id?.trim() ? op.id : "—");

  if ((op.responsavel ?? "").trim()) {
    y = fieldBlock(doc, y, "Responsável (operação)", op.responsavel ?? "");
  }
  if ((op.retencao ?? "").trim()) {
    y = fieldBlock(doc, y, "Retenção / prazo", op.retencao ?? "");
  }
  if ((op.categoriasDados ?? "").trim()) {
    y = fieldBlock(doc, y, "Categorias de dados (operação)", op.categoriasDados ?? "");
  }
  if ((op.categoriasTitulares ?? "").trim()) {
    y = fieldBlock(doc, y, "Categorias de titulares (operação)", op.categoriasTitulares ?? "");
  }
  if ((op.compartilhamento ?? "").trim()) {
    y = fieldBlock(doc, y, "Compartilhamento (operação)", op.compartilhamento ?? "");
  }
  if ((op.medidasSeguranca ?? "").trim()) {
    y = fieldBlock(doc, y, "Medidas de segurança (operação)", op.medidasSeguranca ?? "");
  }

  return y;
}

export async function buildRopaPdfDocument(params: BuildRopaPdfParams): Promise<jsPDF> {
  const { programa, idOrSlug, registro, operacoes, metaLine } = params;

  const nomeFallback =
    getPoliticaNomeOrgao(programa) ||
    (registro?.organizacao ?? "").trim() ||
    idOrSlug;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const titleLines = ["Registro das Operações de Tratamento", "(ROPA) — art. 37 LGPD"];

  let y = await drawRopaPolicyStyleHeader(doc, programa, nomeFallback, titleLines, metaLine);

  y = addRegistroBody(doc, registro, y);

  if (operacoes.length > 0) {
    y += 2;
    for (let idx = 0; idx < operacoes.length; idx++) {
      y = addOperacaoBody(doc, operacoes[idx], idx, operacoes.length, y);
    }
  }

  drawFooterAllPages(doc);
  return doc;
}
