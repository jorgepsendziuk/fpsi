import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertificadoPdfInput = {
  nome: string;
  trilha: string;
  orgao: string;
  codigo: string;
  emitidoEm: string;
  cargaMinutos: number;
  versao: string;
  notaMinima: number;
};

export async function buildCertificadoPdf(input: CertificadoPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const azul = rgb(0.05, 0.22, 0.38);
  const cinza = rgb(0.25, 0.28, 0.32);

  page.drawRectangle({ x: 36, y: 36, width: 523, height: 770, borderColor: azul, borderWidth: 1.5 });
  page.drawRectangle({ x: 44, y: 760, width: 507, height: 6, color: azul });

  let y = 720;
  page.drawText("FPSI", { x: 64, y, size: 14, font: bold, color: azul });
  y -= 28;
  page.drawText("Certificado de conscientizacao em privacidade", {
    x: 64,
    y,
    size: 16,
    font: bold,
    color: azul,
  });
  y -= 22;
  page.drawText("Programa de privacidade e LGPD", { x: 64, y, size: 12, font, color: cinza });

  y -= 48;
  page.drawText("Certificamos que", { x: 64, y, size: 11, font, color: cinza });
  y -= 26;
  drawWrapped(page, bold, semAcento(input.nome) || "Colaborador", 64, y, 470, 16, azul);
  y -= 36;
  page.drawText("concluiu a trilha", { x: 64, y, size: 11, font, color: cinza });
  y -= 24;
  drawWrapped(page, bold, semAcento(input.trilha), 64, y, 470, 14, azul);

  y -= 40;
  const linhas = [
    `Organizacao: ${semAcento(input.orgao) || "-"}`,
    `Carga horaria estimada: ${input.cargaMinutos} minutos`,
    `Nota minima da trilha: ${input.notaMinima}%`,
    `Versao do conteudo: ${input.versao}`,
    `Emitido em: ${input.emitidoEm}`,
    `Codigo de verificacao: ${input.codigo}`,
  ];
  for (const linha of linhas) {
    page.drawText(linha, { x: 64, y, size: 11, font, color: cinza });
    y -= 18;
  }

  y -= 16;
  const aviso =
    "Conteudo de conscientizacao e boas praticas. Nao substitui orientacao do Encarregado nem o texto da lei.";
  drawWrapped(page, font, aviso, 64, y, 470, 10, cinza);

  page.drawText("PPSI Controle 14 / art. 41, paragrafo 2, III, da LGPD", {
    x: 64,
    y: 64,
    size: 9,
    font,
    color: azul,
  });

  return doc.save();
}

export async function buildCoberturaPdf(input: {
  orgao: string;
  emitidoEm: string;
  resumo: string;
  linhas: string[];
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595.28, 841.89]);
  let y = 800;
  const nova = () => {
    page = doc.addPage([595.28, 841.89]);
    y = 800;
  };
  const linha = (text: string, size = 10, strong = false) => {
    if (y < 48) nova();
    page.drawText(semAcento(text).slice(0, 110), {
      x: 40,
      y,
      size,
      font: strong ? bold : font,
      color: rgb(0.1, 0.12, 0.16),
    });
    y -= size + 6;
  };
  linha("FPSI - Cobertura de treinamento LGPD", 14, true);
  linha(`Organizacao: ${input.orgao}`);
  linha(input.resumo);
  linha(`Gerado em ${input.emitidoEm}`);
  linha("PPSI Controle 14 / art. 41, paragrafo 2, III, da LGPD");
  y -= 6;
  for (const item of input.linhas) linha(item);
  return doc.save();
}

function semAcento(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function drawWrapped(
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: ReturnType<typeof rgb>
) {
  const words = text.split(" ");
  let line = "";
  let cursor = y;
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      page.drawText(line, { x, y: cursor, size, font, color });
      cursor -= size + 4;
      line = word;
    } else {
      line = next;
    }
  }
  if (line) page.drawText(line, { x, y: cursor, size, font, color });
}
