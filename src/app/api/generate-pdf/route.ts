import {
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type RGB,
  type PDFImage,
} from "pdf-lib";
import { Buffer } from "node:buffer";
import fs from "node:fs/promises";
import path from "node:path";
import { decode } from "he";
import { NextResponse } from "next/server";
import {
  applyPoliticaPlaceholders,
  formatCnpjBrasil,
  getPoliticaPdfCabecalhoLinhasMetadados,
  getPoliticaPdfCabecalhoTitulo,
  mergeProgramaForPoliticaPlaceholders,
  type PoliticaProgramaDados,
} from "@/lib/utils/politicaPlaceholders";
import { FPSI_LOGO_PUBLIC_URL, isProgramaDemonstracao } from "@/lib/utils/programaDemoLogo";

const A4_W = 595.28;
const A4_H = 841.89;
/** Margens laterais e superior (pt ~ 20mm) */
const MARGIN = 56;
/** Margem inferior segura (evita corte ao imprimir / viewer) */
const MARGIN_BOTTOM = 64;
/** Baseline do texto de rodapé (numeração); abaixo da área útil do corpo). */
const FOOTER_BASELINE_Y = 32;
const FOOTER_FONT_SIZE = 9;

function getPublicAppBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return raw.replace(/\/$/, "");
}

/** URL pública do portal de privacidade (`/{slug}`), quando o programa tem slug. */
function resolvePortalPrivacidadeUrl(programa: PoliticaProgramaDados): string | null {
  if (!programa || typeof programa !== "object") return null;
  const slug = typeof programa.slug === "string" ? programa.slug.trim() : "";
  if (!slug) return null;
  return `${getPublicAppBaseUrl()}/${encodeURIComponent(slug)}`;
}

/** Link clicável (URI) sobre o retângulo; `uri` deve ser a URL completa. */
function addUriLinkAnnotation(
  pdfDoc: PDFDocument,
  page: PDFPage,
  rect: [number, number, number, number],
  uri: string
): void {
  const context = pdfDoc.context;
  const actionDict = context.obj({
    Type: PDFName.of("Action"),
    S: PDFName.of("URI"),
    URI: PDFString.of(uri),
  });
  const linkDict = context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Link"),
    Rect: rect,
    Border: [0, 0, 0],
    A: actionDict,
  });
  const ref = context.register(linkDict);
  page.node.addAnnot(ref);
}

/** Decodifica entidades HTML (&ordm;, &ecirc;, &nbsp;, etc.) e remove tags. */
function htmlToPlainText(html: string): string {
  const decoded = decode(String(html ?? ""));
  return decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type TextRun = { text: string; bold: boolean };

/** Remove tags que não sejam strong/b (placeholders vêm em <strong> após applyPoliticaPlaceholders). */
function stripNonStrongHtmlTags(html: string): string {
  return String(html).replace(/<(?!\/?(?:strong|b)\b)[^>]+>/gi, "");
}

/**
 * Converte HTML da política em sequência de trechos normais/negrito (para PDF).
 */
function parsePoliticaHtmlToRuns(html: string): TextRun[] {
  let s = decode(String(html ?? ""));
  s = s.replace(/\u00a0/g, " ").normalize("NFC");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, "\n");
  s = s.replace(/<li[^>]*>/gi, "• ");
  s = s.replace(/<span[^>]*>/gi, "").replace(/<\/span>/gi, "");
  s = stripNonStrongHtmlTags(s);

  const segments: TextRun[] = [];
  let bold = false;
  const tagRe = /<(\/?)(strong|b)(?:\s[^>]*)?>/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(s)) !== null) {
    const chunk = s.slice(lastIndex, m.index);
    if (chunk) segments.push({ text: chunk, bold });
    bold = m[1] !== "/";
    lastIndex = m.index + m[0].length;
  }
  const rest = s.slice(lastIndex);
  if (rest) segments.push({ text: rest, bold });

  const merged: TextRun[] = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    const prev = merged[merged.length - 1];
    if (prev && prev.bold === seg.bold) prev.text += seg.text;
    else merged.push({ ...seg });
  }
  return merged;
}

/** Divide runs em parágrafos pelos `\n`. */
function splitRunsIntoParagraphRuns(runs: TextRun[]): TextRun[][] {
  const paras: TextRun[][] = [];
  let current: TextRun[] = [];
  const pushPara = () => {
    if (current.length) paras.push(current);
    current = [];
  };
  for (const r of runs) {
    const lines = r.text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        pushPara();
        current = [];
      }
      const line = lines[i];
      if (line) current.push({ text: line, bold: r.bold });
    }
  }
  pushPara();
  return paras.filter((p) => p.length > 0);
}

function runsToWordTokens(runs: TextRun[]): TextRun[] {
  const tokens: TextRun[] = [];
  for (const r of runs) {
    const parts = r.text.split(/(\s+)/);
    for (const p of parts) {
      if (p) tokens.push({ text: p, bold: r.bold });
    }
  }
  return tokens;
}

function breakLongTokenToLines(
  tok: TextRun,
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number
): TextRun[][] {
  const f = tok.bold ? boldFont : font;
  const lines: TextRun[][] = [];
  let chunk = "";
  let line: TextRun[] = [];
  let lineW = 0;
  for (const ch of tok.text) {
    const cw = f.widthOfTextAtSize(ch, fontSize);
    if (lineW === 0 || lineW + cw <= maxWidth) {
      chunk += ch;
      lineW += cw;
    } else {
      if (chunk) line.push({ text: chunk, bold: tok.bold });
      lines.push(line);
      line = [];
      chunk = ch;
      lineW = cw;
    }
  }
  if (chunk) line.push({ text: chunk, bold: tok.bold });
  if (line.length) lines.push(line);
  return lines;
}

function wrapParagraphTokensToLines(
  tokens: TextRun[],
  maxWidth: number,
  font: PDFFont,
  boldFont: PDFFont,
  fontSize: number
): TextRun[][] {
  const measure = (t: string, b: boolean) => (b ? boldFont : font).widthOfTextAtSize(t, fontSize);
  const lines: TextRun[][] = [];
  let line: TextRun[] = [];
  let lineWidth = 0;

  const flush = () => {
    if (line.length) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
  };

  for (const tok of tokens) {
    if (!tok.text) continue;
    const w = measure(tok.text, tok.bold);
    if (line.length === 0) {
      if (w <= maxWidth) {
        line.push(tok);
        lineWidth = w;
      } else {
        const broken = breakLongTokenToLines(tok, maxWidth, font, boldFont, fontSize);
        for (const bl of broken) {
          lines.push(bl);
        }
      }
      continue;
    }
    const trial = lineWidth + w;
    if (trial <= maxWidth) {
      line.push(tok);
      lineWidth = trial;
    } else {
      flush();
      if (w <= maxWidth) {
        line.push(tok);
        lineWidth = w;
      } else {
        const broken = breakLongTokenToLines(tok, maxWidth, font, boldFont, fontSize);
        for (let i = 0; i < broken.length; i++) {
          lines.push(broken[i]);
        }
      }
    }
  }
  flush();
  return lines;
}

function drawTextLineRuns(
  page: PDFPage,
  line: TextRun[],
  x: number,
  y: number,
  fontSize: number,
  font: PDFFont,
  boldFont: PDFFont,
  color: RGB
) {
  let cursorX = x;
  for (const run of line) {
    if (!run.text) continue;
    const f = run.bold ? boldFont : font;
    page.drawText(run.text, {
      x: cursorX,
      y,
      size: fontSize,
      font: f,
      color,
    });
    cursorX += f.widthOfTextAtSize(run.text, fontSize);
  }
}

function isWhitespaceRun(r: TextRun): boolean {
  return r.text.length > 0 && /^[\s\u00a0]+$/.test(r.text);
}

function measureRunsWidth(runs: TextRun[], fontSize: number, font: PDFFont, boldFont: PDFFont): number {
  let w = 0;
  for (const r of runs) {
    if (!r.text) continue;
    const f = r.bold ? boldFont : font;
    w += f.widthOfTextAtSize(r.text, fontSize);
  }
  return w;
}

/** Segmentos em ordem: gaps (incl. recuo inicial) e palavras (runs). */
function segmentLineOrdered(lineRuns: TextRun[]): Array<{ type: "word" | "gap"; runs: TextRun[] }> {
  const out: Array<{ type: "word" | "gap"; runs: TextRun[] }> = [];
  let i = 0;
  while (i < lineRuns.length) {
    if (isWhitespaceRun(lineRuns[i])) {
      const gap: TextRun[] = [];
      while (i < lineRuns.length && isWhitespaceRun(lineRuns[i])) {
        gap.push(lineRuns[i]);
        i++;
      }
      out.push({ type: "gap", runs: gap });
      continue;
    }
    const word: TextRun[] = [];
    while (i < lineRuns.length && !isWhitespaceRun(lineRuns[i])) {
      word.push(lineRuns[i]);
      i++;
    }
    if (word.length) out.push({ type: "word", runs: word });
  }
  return out;
}

/** Espaço entre duas palavras (não recuo inicial nem espaço final). */
function isInterWordGap(
  segments: Array<{ type: "word" | "gap"; runs: TextRun[] }>,
  gapIndex: number
): boolean {
  if (segments[gapIndex]?.type !== "gap") return false;
  return (
    gapIndex > 0 &&
    segments[gapIndex - 1].type === "word" &&
    gapIndex + 1 < segments.length &&
    segments[gapIndex + 1].type === "word"
  );
}

/** Justifica a linha (exceto última do parágrafo): distribui espaço entre palavras. */
function drawTextLineRunsJustified(
  page: PDFPage,
  lineRuns: TextRun[],
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
  boldFont: PDFFont,
  color: RGB,
  justify: boolean
) {
  const totalW = measureRunsWidth(lineRuns, fontSize, font, boldFont);
  if (!justify || totalW >= maxWidth - 0.75) {
    drawTextLineRuns(page, lineRuns, x, y, fontSize, font, boldFont, color);
    return;
  }

  const segments = segmentLineOrdered(lineRuns);
  let interWordGaps = 0;
  for (let si = 0; si < segments.length; si++) {
    if (segments[si].type === "gap" && isInterWordGap(segments, si)) interWordGaps++;
  }
  if (interWordGaps === 0) {
    drawTextLineRuns(page, lineRuns, x, y, fontSize, font, boldFont, color);
    return;
  }

  const extra = maxWidth - totalW;
  const extraPerGap = extra / interWordGaps;
  let cursorX = x;
  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const w = measureRunsWidth(seg.runs, fontSize, font, boldFont);
    drawTextLineRuns(page, seg.runs, cursorX, y, fontSize, font, boldFont, color);
    cursorX += w;
    if (seg.type === "gap" && isInterWordGap(segments, si)) {
      cursorX += extraPerGap;
    }
  }
}

async function drawWrappedRichText(
  pdfDoc: PDFDocument,
  page: PDFPage,
  startY: number,
  html: string,
  x: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
  boldFont: PDFFont,
  color: RGB,
  onNewPage: (p: PDFPage) => Promise<number>
): Promise<{ page: PDFPage; y: number }> {
  const lineHeight = fontSize * 1.45;
  const minY = MARGIN_BOTTOM;
  let currentPage = page;
  let y = startY;

  const runs = parsePoliticaHtmlToRuns(html);
  const paragraphs = splitRunsIntoParagraphRuns(runs);
  if (paragraphs.length === 0) return { page: currentPage, y };

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const tokens = runsToWordTokens(paragraphs[pi]);
    const wrappedLines = wrapParagraphTokensToLines(tokens, maxWidth, font, boldFont, fontSize);
    for (let li = 0; li < wrappedLines.length; li++) {
      const lineRuns = wrappedLines[li];
      if (y < minY + lineHeight) {
        currentPage = pdfDoc.addPage([A4_W, A4_H]);
        y = await onNewPage(currentPage);
      }
      const isLastLineOfPara = li === wrappedLines.length - 1;
      const justifyLine = wrappedLines.length > 1 && !isLastLineOfPara;
      drawTextLineRunsJustified(
        currentPage,
        lineRuns,
        x,
        y,
        maxWidth,
        fontSize,
        font,
        boldFont,
        color,
        justifyLine
      );
      y -= lineHeight;
    }
    if (pi < paragraphs.length - 1) {
      y -= lineHeight * 0.35;
    }
  }

  return { page: currentPage, y };
}

/** Quebra um parágrafo em linhas que cabem em `maxWidth` (Helvetica). */
function wrapParagraphToLines(
  paragraph: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number
): string[] {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let currentLine = "";

  const flushLongWord = (word: string) => {
    let chunk = "";
    for (const ch of word) {
      const trial = chunk + ch;
      if (font.widthOfTextAtSize(trial, fontSize) <= maxWidth) {
        chunk = trial;
      } else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    if (chunk) currentLine = chunk;
  };

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
      continue;
    }
    if (currentLine) {
      lines.push(currentLine);
      currentLine = "";
    }
    if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
      currentLine = word;
    } else {
      flushLongWord(word);
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [""];
}

async function embedLogoFromDataUrl(
  pdfDoc: PDFDocument,
  dataUrl: string
): Promise<{ image: PDFImage; width: number; height: number } | null> {
  const trimmed = dataUrl.trim();
  const m = /^data:image\/(png|jpeg|jpg);base64,(.+)$/i.exec(trimmed);
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const b64 = m[2];
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(Buffer.from(b64, "base64"));
  } catch {
    return null;
  }
  try {
    if (kind === "png") {
      const image = await pdfDoc.embedPng(bytes);
      return { image, width: image.width, height: image.height };
    }
    const image = await pdfDoc.embedJpg(bytes);
    return { image, width: image.width, height: image.height };
  } catch {
    return null;
  }
}

/**
 * Cabeçalho: logo + dados do programa + título da política + linha separadora.
 * Retorna a coordenada Y (baseline) sugerida para a primeira linha do corpo.
 */
async function drawPolicyHeader(
  pdfDoc: PDFDocument,
  page: PDFPage,
  font: PDFFont,
  boldFont: PDFFont,
  programa: PoliticaProgramaDados,
  politicaNome: string,
  nomeFantasiaFallback: string
): Promise<number> {
  const top = A4_H - MARGIN;
  const left = MARGIN;
  const maxLogoW = 108;
  const maxLogoH = 52;

  let emb: { image: PDFImage; width: number; height: number } | null = null;

  if (programa && typeof programa === "object" && isProgramaDemonstracao(programa)) {
    try {
      const rel = FPSI_LOGO_PUBLIC_URL.replace(/^\//, "");
      const logoPath = path.join(process.cwd(), "public", rel);
      const bytes = await fs.readFile(logoPath);
      const image = await pdfDoc.embedPng(bytes);
      emb = { image, width: image.width, height: image.height };
    } catch {
      emb = null;
    }
  }

  if (!emb && programa && typeof programa === "object") {
    const lp = programa.logo_programa;
    const lo = programa.logo_orgao_empresa;
    let logoData: string | null = null;
    if (typeof lp === "string" && lp.startsWith("data:image")) logoData = lp;
    else if (typeof lo === "string" && lo.startsWith("data:image")) logoData = lo;
    if (logoData) {
      emb = await embedLogoFromDataUrl(pdfDoc, logoData);
    }
  }

  let textLeft = left;
  let logoBottomY = top;

  if (emb) {
    const { image, width: iw, height: ih } = emb;
    const scale = Math.min(maxLogoW / iw, maxLogoH / ih, 1);
    const dw = iw * scale;
    const dh = ih * scale;
    page.drawImage(image, {
      x: left,
      y: top - dh,
      width: dw,
      height: dh,
    });
    textLeft = left + dw + 14;
    logoBottomY = top - dh;
  }

  const titulo =
    getPoliticaPdfCabecalhoTitulo(programa) ||
    (nomeFantasiaFallback?.trim() ? nomeFantasiaFallback.trim() : "") ||
    "Programa";

  const metaLines: { text: string; bold: boolean; size: number }[] = [];
  metaLines.push({ text: titulo, bold: true, size: 11 });

  if (programa && typeof programa === "object") {
    for (const linha of getPoliticaPdfCabecalhoLinhasMetadados(programa)) {
      metaLines.push({ text: linha, bold: false, size: 9 });
    }
    const cnpj = formatCnpjBrasil(programa.cnpj);
    if (cnpj) {
      metaLines.push({ text: `CNPJ: ${cnpj}`, bold: false, size: 9 });
    }
    const email = typeof programa.atendimento_email === "string" ? programa.atendimento_email.trim() : "";
    const fone = typeof programa.atendimento_fone === "string" ? programa.atendimento_fone.trim() : "";
    const site = typeof programa.atendimento_site === "string" ? programa.atendimento_site.trim() : "";
    const contato = [email, fone, site].filter(Boolean).join(" · ");
    if (contato) {
      metaLines.push({ text: contato, bold: false, size: 9 });
    }
  }

  const maxTextW = A4_W - MARGIN - textLeft;
  let baseline = top - 11;

  for (const { text, bold, size } of metaLines) {
    if (!text) continue;
    const f = bold ? boldFont : font;
    const parts = wrapParagraphToLines(text, maxTextW, f, size);
    for (const pl of parts) {
      page.drawText(pl, {
        x: textLeft,
        y: baseline,
        size,
        font: f,
        color: rgb(0, 0, 0),
      });
      baseline -= size * 1.38;
    }
  }

  const portalUrl = resolvePortalPrivacidadeUrl(programa);
  const portalFontSize = 9;
  const portalBlue = rgb(0.12, 0.32, 0.75);
  const black = rgb(0, 0, 0);
  if (portalUrl) {
    baseline -= portalFontSize * 0.35;
    const prefix = "Portal de privacidade: ";
    const combined = prefix + portalUrl;
    const portalLines = wrapParagraphToLines(combined, maxTextW, font, portalFontSize);
    for (const ln of portalLines) {
      if (ln.startsWith(prefix)) {
        page.drawText(prefix, {
          x: textLeft,
          y: baseline,
          size: portalFontSize,
          font,
          color: black,
        });
        const prefixW = font.widthOfTextAtSize(prefix, portalFontSize);
        const rest = ln.slice(prefix.length);
        const w = font.widthOfTextAtSize(rest, portalFontSize);
        page.drawText(rest, {
          x: textLeft + prefixW,
          y: baseline,
          size: portalFontSize,
          font,
          color: portalBlue,
        });
        addUriLinkAnnotation(
          pdfDoc,
          page,
          [textLeft + prefixW, baseline - 3, textLeft + prefixW + w, baseline + portalFontSize],
          portalUrl
        );
      } else {
        const w = font.widthOfTextAtSize(ln, portalFontSize);
        page.drawText(ln, {
          x: textLeft,
          y: baseline,
          size: portalFontSize,
          font,
          color: portalBlue,
        });
        addUriLinkAnnotation(pdfDoc, page, [textLeft, baseline - 3, textLeft + w, baseline + portalFontSize], portalUrl);
      }
      baseline -= portalFontSize * 1.38;
    }
  }

  const textLowestY = baseline;
  const lowestY = Math.min(logoBottomY, textLowestY);

  /** Título do documento: bloco próprio, largura total, maior que os metadados do órgão */
  const docTitle = politicaNome.trim() || "Política";
  const titleSize = 17;
  /** Espaço entre o fim do bloco logo/dados e a 1ª linha do título (evita “grudar” no cabeçalho) */
  const titleGapAbove = 34;
  const titleLineGap = 1.42;
  const titleMaxW = A4_W - 2 * MARGIN;
  let titleBaseline = lowestY - titleGapAbove;
  const titleColor = rgb(0.12, 0.12, 0.12);

  const titleLines = wrapParagraphToLines(docTitle, titleMaxW, boldFont, titleSize);
  let lastTitleLineBaseline = titleBaseline;
  for (let i = 0; i < titleLines.length; i++) {
    const pl = titleLines[i];
    page.drawText(pl, {
      x: MARGIN,
      y: titleBaseline,
      size: titleSize,
      font: boldFont,
      color: titleColor,
    });
    lastTitleLineBaseline = titleBaseline;
    if (i < titleLines.length - 1) {
      titleBaseline -= titleSize * titleLineGap;
    }
  }

  /** Linha logo abaixo do título (sem o “salto” extra que vinha do decremento após a última linha) */
  const gapTitleToRule = 11;
  const separatorY = lastTitleLineBaseline - gapTitleToRule;

  page.drawLine({
    start: { x: MARGIN, y: separatorY },
    end: { x: A4_W - MARGIN, y: separatorY },
    thickness: 0.75,
    color: rgb(0.78, 0.78, 0.78),
  });

  /** Espaço entre a linha do título e o início do corpo (1ª seção / introdução) */
  const gapBelowTitleRule = 30;
  return separatorY - gapBelowTitleRule;
}

const SECTION_HEADER_FONT_SIZE = 13;
const SECTION_HEADER_LINE_GAP = SECTION_HEADER_FONT_SIZE * 1.35;

/** Cabeçalho da seção no PDF: só `id - secao`. O campo `titulo` do JSON é só orientação na edição, não entra no PDF. */
async function drawSectionTitleBlock(
  pdfDoc: PDFDocument,
  page: PDFPage,
  startY: number,
  section: { id: number; secao: string; titulo?: string },
  boldFont: PDFFont,
  contentWidth: number,
  onNewPage: (p: PDFPage) => Promise<number>
): Promise<{ page: PDFPage; y: number }> {
  let p = page;
  let y = startY;
  const minY = MARGIN_BOTTOM;

  const ensureSpace = async (needed: number) => {
    if (y < minY + needed) {
      p = pdfDoc.addPage([A4_W, A4_H]);
      y = await onNewPage(p);
    }
  };

  const main = `${section.id} - ${section.secao ?? ""}`;
  for (const line of wrapParagraphToLines(main, contentWidth, boldFont, SECTION_HEADER_FONT_SIZE)) {
    await ensureSpace(SECTION_HEADER_LINE_GAP + 4);
    p.drawText(line, {
      x: MARGIN,
      y,
      size: SECTION_HEADER_FONT_SIZE,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= SECTION_HEADER_LINE_GAP;
  }

  y -= 8;
  return { page: p, y };
}

/** Numeração centralizada no rodapé (só após todo o conteúdo, para obter o total de páginas). */
function drawPoliticaPageFooters(pdfDoc: PDFDocument, font: PDFFont): void {
  const pages = pdfDoc.getPages();
  const total = pages.length;
  const color = rgb(0.42, 0.42, 0.42);
  for (let i = 0; i < total; i++) {
    const label = `Página ${i + 1} de ${total}`;
    const w = font.widthOfTextAtSize(label, FOOTER_FONT_SIZE);
    pages[i].drawText(label, {
      x: (A4_W - w) / 2,
      y: FOOTER_BASELINE_Y,
      size: FOOTER_FONT_SIZE,
      font,
      color,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sections, politicaNome, nomeFantasia, programa } = body as {
      sections?: Array<{
        id: number;
        secao: string;
        titulo?: string;
        texto?: string;
      }>;
      politicaNome?: string;
      nomeFantasia?: string;
      programa?: Record<string, unknown>;
    };

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections array is required" }, { status: 400 });
    }

    const nomeFantasiaBody = typeof nomeFantasia === "string" ? nomeFantasia.trim() : "";
    /** Cabeçalho + texto: mesmos dados do programa; body pode trazer só nomeFantasia */
    const programaMerged = mergeProgramaForPoliticaPlaceholders(programa, nomeFantasiaBody || undefined);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const bodyFontSize = 11;
    const sectionSpacing = 20;
    const contentWidth = A4_W - 2 * MARGIN;

    const docTitle =
      (typeof politicaNome === "string" && politicaNome.trim()) ||
      (typeof nomeFantasia === "string" && nomeFantasia.trim()) ||
      "Política";

    const nomeFallback =
      (typeof nomeFantasia === "string" && nomeFantasia.trim()) ||
      (programa && typeof programa === "object" && typeof programa.nome_fantasia === "string"
        ? programa.nome_fantasia
        : "") ||
      "";

    let page = pdfDoc.addPage([A4_W, A4_H]);

    const headerOnPage = async (p: PDFPage) =>
      drawPolicyHeader(pdfDoc, p, font, boldFont, programaMerged, docTitle, nomeFallback);

    /** Páginas após a 1ª: só margem superior; não repetir logo/título/linha do cabeçalho. */
    const continuationPageStartY = async (_p: PDFPage) => A4_H - MARGIN;

    let y = await headerOnPage(page);

    for (const section of sections) {
      try {
        const htmlComPlaceholders = applyPoliticaPlaceholders(
          String(section.texto ?? ""),
          programa,
          nomeFantasiaBody || undefined
        );
        if (!htmlToPlainText(htmlComPlaceholders).trim()) continue;

        const sectionId = Number(section.id);
        /** Seção 0 (introdução): só o texto, sem cabeçalho de seção. */
        if (sectionId !== 0) {
          const head = await drawSectionTitleBlock(
            pdfDoc,
            page,
            y,
            section,
            boldFont,
            contentWidth,
            continuationPageStartY
          );
          page = head.page;
          y = head.y;
        }

        const r = await drawWrappedRichText(
          pdfDoc,
          page,
          y,
          htmlComPlaceholders,
          MARGIN,
          contentWidth,
          bodyFontSize,
          font,
          boldFont,
          rgb(0, 0, 0),
          continuationPageStartY
        );
        page = r.page;
        y = r.y - sectionSpacing;
      } catch (err) {
        console.error(`Error processing section ${section.id}:`, err);
      }
    }

    drawPoliticaPageFooters(pdfDoc, font);
    const pdfBytes = await pdfDoc.save();
    const safeName = String(docTitle).replace(/[/\\?%*:|"<>]/g, "-").slice(0, 80);

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
