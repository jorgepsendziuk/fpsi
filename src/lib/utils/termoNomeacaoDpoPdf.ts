/**
 * PDF — Termo de Nomeação do DPO (cliente, jsPDF).
 * Modelo alinhado a atos formais (ex.: nomeação CENPEC), com placeholders para lacunas.
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
  describePessoaQualificacao,
  formatDataExtensoPt,
  placeholderOr,
  type TermoNomeacaoDpoDraft,
} from "@/lib/utils/termoNomeacaoDpo";

const BODY_SIZE = 9.2;
const LINE = LINE_BODY + 0.55;

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
  return y + 2.2;
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

  const nomeFallback =
    getPoliticaPdfCabecalhoTitulo(programa) || getPoliticaNomeProgramaRotulo(programa, idOrSlug);

  const metaLine = `Programa: ${getPoliticaNomeProgramaRotulo(programa, idOrSlug)} | Gerado em ${new Date().toLocaleString("pt-BR")}`;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  let y = await drawProgramaPoliticaPdfHeader(
    doc,
    programa,
    nomeFallback,
    ["Termo de Nomeação do DPO", "(Data Protection Officer)"],
    metaLine
  );

  const org = placeholderOr(draft.organizacaoNome, "Razão social / organização");
  const cnpj = placeholderOr(draft.cnpj, "CNPJ");
  const endereco = placeholderOr(draft.endereco, "endereço completo");
  const ccmPart = draft.ccm.trim() ? ` e no CCM sob o nº ${draft.ccm.trim()},` : "";
  const dataExtenso = formatDataExtensoPt(draft.dataNomeacao);
  const cidade = placeholderOr(draft.cidadeAssinatura, "cidade");

  const dpoQualif = describePessoaQualificacao(draft.dpo, "DPO");
  const suplQualif = describePessoaQualificacao(draft.suplente, "suplente");

  y = writeParagraph(
    doc,
    y,
    `${org}, inscrito no CNPJ/MF sob nº ${cnpj}${ccmPart} com sede em ${endereco}, neste ato representado na forma de seu estatuto social / atos constitutivos, por meio deste ato formal, nos termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais ou “LGPD”) e em atenção à Resolução CD/ANPD nº 18, de 16 de julho de 2024, nomeia, nesta data, seu Encarregado pelo Tratamento de Dados Pessoais (“ENCARREGADO” ou “DPO”)${
      draft.incluirSuplente ? " e suplente" : ""
    }, cujas funções e responsabilidades estão a seguir delimitadas.`
  );

  if (draft.incluirSuplente) {
    y = writeParagraph(
      doc,
      y,
      `Pelo presente termo de nomeação, a organização, por seu representante legal ao final assinado, designa ${dpoQualif}, para ocupar o encargo de DPO (Data Protection Officer) e designa ${suplQualif}, para ocupar o encargo de Suplente de DPO, conforme previsto no art. 40 e seguintes da LGPD.`
    );
  } else {
    y = writeParagraph(
      doc,
      y,
      `Pelo presente termo de nomeação, a organização, por seu representante legal ao final assinado, designa ${dpoQualif}, para ocupar o encargo de DPO (Data Protection Officer), conforme previsto no art. 40 e seguintes da LGPD.`
    );
  }

  y = writeParagraph(
    doc,
    y,
    `O DPO${draft.incluirSuplente ? " e o Suplente" : ""}, ora nomeado${draft.incluirSuplente ? "s" : ""}, será${draft.incluirSuplente ? "ão" : ""} responsável${draft.incluirSuplente ? "eis" : ""} por supervisionar e manter a conformidade em proteção de dados da organização, com base nas responsabilidades e atividades a seguir. Deverão avaliar os riscos associados às operações de tratamento de dados pessoais, levando em conta a natureza, o âmbito, o contexto e as finalidades de tratamento, opinando acerca da avaliação de impacto sobre a proteção de dados pessoais.`
  );

  y = writeParagraph(
    doc,
    y,
    `O ENCARREGADO${draft.incluirSuplente ? " e a SUPLENTE" : ""}, ora nomeado${draft.incluirSuplente ? "s" : ""}, atuarão como agente catalisador para viabilizar que as regras de proteção de dados sejam respeitadas e que a organização atue sempre em cooperação com a Autoridade Nacional de Proteção de Dados (“ANPD”) e em respeito aos titulares de dados pessoais, executando as atividades e responsabilidades em conformidade com o art. 41 da LGPD:`
  );

  const itens = [
    "i) Atuar como canal de comunicação entre a organização, a ANPD e os titulares de dados pessoais, inclusive no caso de reclamações e comunicações dos titulares acerca de seus direitos e/ou de providências junto à ANPD;",
    "ii) Garantir que os agentes de tratamento e os titulares dos dados sejam informados sobre seus direitos, deveres e responsabilidades em relação à proteção de dados;",
    "iii) Dar recomendações à organização sobre a interpretação e aplicação das regras de proteção de dados;",
    "iv) Monitorar as estratégias da organização para proteção de dados pessoais, incluindo a conscientização e o treinamento periódico dos colaboradores e demais pessoas envolvidas no tratamento de dados pessoais em seu nome;",
    "v) Assessorar a organização, quando Controlador, na realização de avaliação de impacto à proteção de dados e suas implementações, conforme LGPD;",
    "vi) Cooperar com a ANPD, sempre em atenção ao inerente dever de confidencialidade para com a organização.",
  ];
  for (const item of itens) {
    y = writeParagraph(doc, y, item, { indent: 3 });
  }

  y = writeParagraph(
    doc,
    y,
    "O ENCARREGADO compromete-se, ainda, a notificar imediatamente à organização, quando controlador, em qualquer caso, sem demora injustificada, caso ocorra um conflito de interesses no futuro, para exercício de suas atribuições e responsabilidades."
  );

  y = writeParagraph(
    doc,
    y,
    "Concretamente, o cargo e respectivas obrigações derivam da LGPD, especificamente do art. 40 e seguintes, além dos provimentos eventualmente editados pela ANPD."
  );

  y = writeParagraph(
    doc,
    y,
    `Diante do exposto, a${draft.incluirSuplente ? "s pessoas nomeadas como ENCARREGADO e SUPLENTE declaram" : " pessoa nomeada como ENCARREGADO declara"} aceitar a responsabilidade conferida, comprometendo-se ao fiel cumprimento do presente Termo.`
  );

  y = writeParagraph(
    doc,
    y,
    "Por fim, fica desde já autorizado, sempre que necessário e enquanto durar a nomeação, o ENCARREGADO a manter contato e prestar informações relativas à proteção de dados para titulares, representantes, clientes, fornecedores e colaboradores, assim como a representar a organização perante comunicações da ANPD e de outras entidades legais em assuntos relativos à proteção de dados."
  );

  y = writeParagraph(
    doc,
    y,
    "E, por estarem assim justas e pactuadas, as Partes assinam abaixo."
  );

  y = writeParagraph(doc, y, `${cidade}, ${dataExtenso}.`, { bold: true });

  y += 6;
  y = writeSignedBlock(doc, y, {
    name: draft.representanteLegal.nome.trim().toUpperCase() || "[REPRESENTANTE LEGAL]",
    role: draft.representanteLegal.cargoAssinatura.trim() || "Representante Legal",
  });

  y += 4;
  y = writeSignedBlock(
    doc,
    y,
    {
      name: draft.dpo.nome.trim().toUpperCase() || "[DPO]",
      role: "DPO / Encarregado",
    },
    draft.incluirSuplente
      ? {
          name: draft.suplente.nome.trim().toUpperCase() || "[SUPLENTE]",
          role: "Suplente de DPO",
        }
      : null
  );

  const contactBits = [draft.telefone, draft.site, draft.emailOrg].filter((x) => x.trim());
  if (contactBits.length) {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    for (const line of contactBits) {
      y = ensureSpace(doc, y, 5);
      doc.text(line, MARGIN, y);
      y += 4;
    }
  }

  const hasPlaceholder = /\[.+?\]/.test(
    [
      org,
      cnpj,
      endereco,
      dpoQualif,
      draft.incluirSuplente ? suplQualif : "",
      draft.representanteLegal.nome,
    ].join(" ")
  );
  if (hasPlaceholder || !draft.representanteLegal.nome.trim() || !draft.dpo.cpf.trim()) {
    y = ensureSpace(doc, y, 14);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 80, 20);
    const note =
      "Nota: trechos entre colchetes [ ] indicam dados não disponíveis no cadastro no momento da geração. Complete antes da assinatura formal.";
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

export function safeTermoPdfFileName(organizacao: string): string {
  const base = (organizacao || "termo-dpo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `Termo-Nomeacao-DPO-${base || "org"}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
