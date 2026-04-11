import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  LineRuleType,
  AlignmentType,
} from "docx";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Edital: margens 2cm top/bottom, 3cm left/right; Times New Roman 12; espaçamento 1,5; recuo 1,25cm na primeira linha
const CM_TO_TWIPS = 567;
const MARGIN_TOP_BOTTOM = 2 * CM_TO_TWIPS;
const MARGIN_LEFT_RIGHT = 3 * CM_TO_TWIPS;
const INDENT_FIRST_LINE = Math.round(1.25 * CM_TO_TWIPS);
/** Recuo pendente (NBR 6023): primeira linha na margem, continuação recuada ~1,25 cm */
const REF_HANGING_TWIPS = Math.round(1.25 * CM_TO_TWIPS);
const LINE_SPACING = 360;

const defaultParagraphProps = {
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 0, after: 120 },
  indent: { firstLine: INDENT_FIRST_LINE },
};

// Sem cores: texto preto explícito para evitar cores do tema do Word
const textRunProps = { font: "Times New Roman", size: 24, color: "000000" };

/** Contorno nas figuras (~1px em 96dpi ≈ 0,75 pt; EMU: 12700/pt — docx ImageRun `outline`) */
const ARTIGO_IMAGE_OUTLINE = {
  width: Math.round(0.75 * 12700),
  type: "solidFill" as const,
  solidFillType: "rgb" as const,
  value: "000000",
};

function p(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, ...textRunProps })],
    ...defaultParagraphProps,
  });
}

function heading(text: string, level: 1 | 2 | 3 = 1) {
  return new Paragraph({
    children: [new TextRun({ text, ...textRunProps, bold: true })],
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
    indent: { firstLine: 0 },
  });
}

function pNoIndent(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, ...textRunProps })],
    spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 0, after: 120 },
    indent: { firstLine: 0 },
  });
}

function pBoldLabel(boldLabel: string, content: string, contentItalic = false) {
  return new Paragraph({
    children: [
      new TextRun({ text: boldLabel, ...textRunProps, bold: true, italics: contentItalic }),
      new TextRun({ text: content, ...textRunProps, italics: contentItalic }),
    ],
    ...defaultParagraphProps,
    indent: { firstLine: 0 },
  });
}

// Fonte em public/artigo (px): Painel 2976×2398, Diagnóstico 2722×2682, Portal 2492×2440, LGPD 2478×2224. Word: escala com altura ~450 px mantendo proporção; contorno fino preto via ImageRun.outline.
function imageParagraph(imagePath: string, widthPx: number, heightPx: number) {
  const fullPath = path.join(process.cwd(), "public", imagePath);
  if (!fs.existsSync(fullPath)) return null;
  const data = fs.readFileSync(fullPath);
  const ext = path.extname(imagePath).toLowerCase().slice(1);
  const type: "jpg" | "png" | "gif" | "bmp" = ext === "jpeg" ? "jpg" : (ext as "jpg" | "png" | "gif" | "bmp");
  return new Paragraph({
    children: [
      new ImageRun({
        data,
        type,
        transformation: { width: widthPx, height: heightPx },
        outline: ARTIGO_IMAGE_OUTLINE,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
    indent: { firstLine: 0 },
  });
}

function pCaption(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, ...textRunProps, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
    indent: { firstLine: 0 },
  });
}

/** Referências bibliográficas (ABNT NBR 6023): texto justificado, recuo pendente (docx exige valores positivos: left + hanging) */
function refP(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, ...textRunProps })],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
    indent: { left: REF_HANGING_TWIPS, hanging: REF_HANGING_TWIPS },
  });
}

/** Entrada com elemento de responsabilidade em negrito (ex.: BRASIL., FPSI.), uso comum em referências ABNT */
function refPAbnt(text: string) {
  let authorBold = "";
  let rest = text;
  if (text.startsWith("BRASIL. ")) {
    authorBold = "BRASIL.";
    rest = text.slice(8);
  } else if (text.startsWith("FPSI. ")) {
    authorBold = "FPSI.";
    rest = text.slice(6);
  } else {
    return refP(text);
  }
  return new Paragraph({
    children: [
      new TextRun({ text: `${authorBold} `, ...textRunProps, bold: true }),
      new TextRun({ text: rest, ...textRunProps }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
    indent: { left: REF_HANGING_TWIPS, hanging: REF_HANGING_TWIPS },
  });
}

export async function GET() {
  try {
    const imgPainel = imageParagraph("artigo/Painel.jpg", 559, 450);
    const imgDiagnostico = imageParagraph("artigo/Diagnóstico.jpg", 457, 450);
    const imgPortal = imageParagraph("artigo/Portal.jpg", 459, 450);
    const imgLgpd = imageParagraph("artigo/LGPD.jpg", 501, 450);

    const doc = new Document({
      compatibility: { printColorsBlack: true },
      styles: {
        default: {
          document: { run: { color: "000000" } },
          heading1: { run: { color: "000000" } },
          heading2: { run: { color: "000000" } },
          heading3: { run: { color: "000000" } },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: MARGIN_TOP_BOTTOM,
                right: MARGIN_LEFT_RIGHT,
                bottom: MARGIN_TOP_BOTTOM,
                left: MARGIN_LEFT_RIGHT,
              },
            },
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: "IMPLEMENTAÇÃO OPEN SOURCE DO FRAMEWORK DO PROGRAMA DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO (PPSI 2.0) COM ASSISTÊNCIA POR INTELIGÊNCIA ARTIFICIAL INTEGRADA AOS FLUXOS DE CONFORMIDADE", ...textRunProps, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
              indent: { firstLine: 0 },
            }),
            pNoIndent(""),
            new Paragraph({
              children: [new TextRun({ text: "OPEN-SOURCE IMPLEMENTATION OF THE BRAZILIAN PPSI 2.0 PROGRAM'S PRIVACY AND INFORMATION SECURITY FRAMEWORK WITH INTEGRATED ARTIFICIAL INTELLIGENCE ASSISTANCE FOR COMPLIANCE WORKFLOWS", ...textRunProps, italics: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
              indent: { firstLine: 0 },
            }),
            pNoIndent(""),
            new Paragraph({
              children: [new TextRun({ text: "Jorge Felipe Roman Psendziuk", ...textRunProps })],
              alignment: AlignmentType.END,
              spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
              indent: { firstLine: 0 },
            }),
            pNoIndent(""),
            pBoldLabel("SUMÁRIO: ", "Introdução. 1 Marco regulatório: LGPD, PPSI e o framework do programa. 1.1 Lei Geral de Proteção de Dados Pessoais (LGPD). 1.2 Programa de Privacidade e Segurança da Informação (PPSI) e o framework de privacidade e segurança da informação. 1.3 Ferramenta oficial do framework do PPSI. 2 Limitações da ferramenta oficial e demanda por alternativas. 3 Proposta: implementação open source (FPSI). 4 Funcionalidades e arquitetura do sistema. 4.1 Módulos principais. 4.2 Arquitetura técnica. 4.3 Multi-cliente. 4.4 Integração de referências normativas e assistência por IA. 5 Considerações sobre governança, auditoria e accountability. Conclusão. Referências."),
            pNoIndent(""),
            pBoldLabel("RESUMO: ", "A transformação digital e a LGPD impulsionaram ferramentas de governança em privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos instituiu o PPSI e o respectivo framework, com ferramenta oficial em Excel; a dependência de planilha limita acessibilidade, colaboração e interoperabilidade. O artigo apresenta o FPSI, implementação open source alinhada ao PPSI 2.0, cobrindo diagnóstico, plano de trabalho, políticas, registro das operações de tratamento, portal e pedidos de titulares (art. 18 LGPD), mapeamento, auditoria e referências normativas integradas (LGPD, CIS, NIST, ISO), além de assistência por IA a levantamentos e vínculo com esse registro, com validação no servidor e revisão humana obrigatória."),
            pBoldLabel("Palavras-chave: ", "LGPD; PPSI 2.0; software livre; inteligência artificial; privacidade e segurança da informação."),
            pNoIndent(""),
            pBoldLabel("ABSTRACT: ", "Digital transformation and Brazil's LGPD have spurred privacy and information security governance tools. In 2023, the Ministry established the PPSI and its framework, with an official Excel workbook; spreadsheet limits motivate FPSI — an open-source implementation aligned with PPSI 2.0, covering diagnosis, work plans, policies, the record of processing activities, a privacy portal and data-subject requests (Art. 18 LGPD), mapping, audit trail, integrated references (LGPD, CIS, NIST, ISO), and AI-assisted mapping with server-side validation, mandatory human review, and alignment to that record.", true),
            pBoldLabel("Keywords: ", "LGPD; PPSI 2.0; open-source software; artificial intelligence; privacy and information security.", true),
            pNoIndent(""),
            heading("INTRODUÇÃO", 2),
            p("No Brasil, a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) em setembro de 2020 consolidou exigências de adequação a organizações públicas e privadas (BRASIL, 2018), em linha com o GDPR na União Europeia: designação de DPO, mapeamento de operações e medidas técnicas e organizacionais adequadas ao risco, num contexto em que a digitalização de serviços tornou a privacidade e a segurança da informação eixo central de governança."),
            p("Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e instituiu o framework de privacidade e segurança da informação previsto no programa, disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles (BRASIL, 2023). A ferramenta oferece um roteiro metodológico alinhado aos principais referenciais internacionais de segurança e privacidade, permitindo que órgãos públicos avaliem seu nível de maturidade e elaborem planos de ação."),
            p("Apesar da eficácia metodológica da ferramenta oficial na validação de medidas e no cálculo de níveis de maturidade, sua dependência de planilha eletrônica impõe limitações significativas em termos de acessibilidade, trabalho colaborativo e interoperabilidade. As soluções comerciais de gestão de privacidade, por sua vez, são pagas e, em geral, não seguem o padrão do framework do PPSI nem permitem adaptação do código à realidade de cada organização."),
            p("Este artigo apresenta o FPSI — implementação open source do framework do PPSI desenvolvida com tecnologias web —, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. No PPSI 2.0, o framework de privacidade e segurança da informação organiza o catálogo de controles e medidas; o FPSI acompanha a ferramenta oficial vigente e esse catálogo, além de instrumentos do programa (mapeamento, registro das operações de tratamento, normas de referência, governança) e de uma trajetória de assistência por inteligência artificial para acelerar levantamentos, sempre sujeita a validação técnica e revisão humana. O trabalho está alinhado ao eixo temático de Privacidade e Proteção de Dados, abordando o impacto das legislações de proteção de dados (LGPD e correlatas), medidas de compliance digital e cultura organizacional voltada à privacidade."),
            p("A seguir, a seção 1 sintetiza LGPD, PPSI e Ferramenta oficial; as seções 2 e 3 tratam limitações da planilha e da proposta open source; a seção 4 descreve funcionalidades, arquitetura e IA; a seção 5 aborda governança e auditoria; encerram-se conclusão e referências."),
            pNoIndent(""),
            heading("1 MARCO REGULATÓRIO: LGPD, PPSI E O FRAMEWORK DO PROGRAMA", 2),
            heading("1.1 Lei Geral de Proteção de Dados Pessoais (LGPD)", 3),
            p("A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil (BRASIL, 2018), com inspiração no GDPR e obrigações que incluem designação do Encarregado (DPO), registro das operações de tratamento e medidas de segurança adequadas ao risco, observados os princípios do art. 6º. O controlador deve manter o registro com informações sobre finalidade, base legal, titulares, categorias, compartilhamentos, segurança e retenção; o art. 41 institui o DPO como canal com titulares e ANPD, com atribuições compatíveis com orientação interna e apoio a RIPD quando aplicável, podendo o encargo ser exercido por pessoa interna ou externa."),
            heading("1.2 PROGRAMA DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO (PPSI) E O FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO", 3),
            p("Em 30 de março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui, na administração pública federal, o framework de privacidade e segurança da informação previsto no programa (BRASIL, 2023). A configuração atual do programa, referida como PPSI 2.0 para os órgãos integrantes do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP), foi regulada pela Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025, com entrada em vigor em 1º de janeiro de 2026 (BRASIL, 2025). Esse framework apoia-se em referenciais de privacidade e segurança como CIS (Center for Internet Security), NIST (National Institute of Standards and Technology) e ISO/IEC."),
            p("No catálogo metodológico vigente há 27 controles em três diagnósticos: estruturação básica (dois controles 0), controles 1 a 18 (segurança da informação) e 19 a 25 (privacidade e LGPD). O catálogo segue a Ferramenta oficial; atualizações do órgão gestor devem ser espelhadas em software para preservar comparabilidade de maturidade e de plano de trabalho. No âmbito normativo, o PPSI 2.0 vincula os órgãos do SISP e permanece referência útil à ANPD e ao setor privado em adoção voluntária."),
            heading("1.3 FERRAMENTA OFICIAL DO FRAMEWORK DO PPSI", 3),
            p("No PPSI 2.0, o órgão gestor disponibiliza ao público a Ferramenta do Framework de Privacidade e Segurança da Informação (denominação oficial da planilha) em Excel, com guia e manuais alinhados ao catálogo vigente. A estrutura da pasta de trabalho consolida o arranjo metodológico: cadastros; segmento de estruturação básica (dois controles de número 0); controles 1 a 18; controles 19 a 25; relatório consolidado; e plano de trabalho, permitindo registrar respostas às medidas, fatores de ponderação e consolidações para relatório."),
            p("Na metodologia associada ao PPSI 2.0, a avaliação centra-se nos 27 controles e nas respectivas medidas de implementação; atribui-se a cada controle um Índice de Nível de Capacidade (INCC) em escala de 0 a 5, coerente com a leitura de efetividade daquele conjunto de práticas na Ferramenta. Consolida-se então o índice de maturidade iMC mediante a fórmula parametrizada na planilha oficial iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100), com enquadramento nos níveis Inicial, Básico, Intermediário, Em Aprimoramento e Aprimorado e derivação de ações prioritárias no plano de trabalho. O FPSI descrito nas seções seguintes visa convergir a essa metodologia e ao conteúdo funcional do referencial publicado pelo órgão gestor."),
            pNoIndent(""),
            heading("2 LIMITAÇÕES DA FERRAMENTA OFICIAL E DEMANDA POR ALTERNATIVAS", 2),
            p("A ferramenta oficial, em Excel, impõe limites estruturais: dificulta acessibilidade (leitores de tela e LBI, Lei nº 13.146/2015) (BRASIL, 2015), trabalho colaborativo e controle de versão (arquivo local, risco de perda ou conflitos, proliferação de cópias em trabalho remoto), além de dependência de suíte proprietária e custos de licença. Soluções comerciais de governança em privacidade costumam ser pagas, não seguem o padrão do framework do PPSI nem permitem auditar ou adaptar o código. Daí a demanda por alternativa web, colaborativa e open source alinhada ao mesmo roteiro metodológico."),
            pNoIndent(""),
            heading("3 PROPOSTA: IMPLEMENTAÇÃO OPEN SOURCE", 2),
            p("Propõe-se o FPSI, implementação web espelhando a ferramenta oficial de apoio ao framework do PPSI, em modelo open source, favorecendo colaboração, acesso multiplataforma e implantação em nuvem ou on-premises."),
            p("A justificativa da abertura inclui: (1) colaboração em evoluções do referencial PPSI e do FPSI; (2) implantação em órgãos, empresas e consultores sem custo de licença; (3) oferta hospedada com código auditável (PaaS); (4) adaptação de fluxos e integrações. Licença MIT: https://github.com/jorgepsendziuk/fpsi. Demonstração em https://fpsi.com.br."),
            pNoIndent(""),
            heading("4 FUNCIONALIDADES E ARQUITETURA DO SISTEMA", 2),
            heading("4.1 Módulos principais", 3),
            p("A implementação cobre os seguintes módulos, alinhados ao referencial oficial do framework do PPSI e ao Programa PPSI 2.0: diagnóstico de maturidade, plano de trabalho, políticas, registro das operações de tratamento, portal de privacidade, pedidos dos titulares, conformidade LGPD (incluindo mapeamento de dados pessoais com listas de domínio compatíveis com o inventário, normas e documentos de referência por programa e vínculo entre levantamentos e operações de tratamento quando aplicável), responsáveis, governança de papéis e auditoria."),
            p("A Figura 1 apresenta o painel principal do programa na interface web: nele concentram-se os acessos a esses módulos e a indicação da estrutura de tratamento de dados (controlador e operador), servindo de mapa antes do detalhamento funcional nas figuras seguintes."),
            ...(imgPainel ? [imgPainel, pCaption("Figura 1. Painel do programa com módulos do sistema e estrutura de tratamento (controlador, operador).")] : []),
            p("O núcleo metodológico materializa-se no diagnóstico de maturidade. A interface dispõe uma árvore que articula diagnóstico, controle e medida, coerente com os 27 controles do PPSI 2.0 e com o painel de acompanhamento: em cada medida o usuário atribui um Índice de Nível de Capacidade (INCC), em escala de 0 a 5; no agregado, o índice iMC e o dashboard consolidam o posicionamento da organização segundo as mesmas fórmulas e pesos da Ferramenta oficial tratados no §1.3, o que mantém comparabilidade com o referencial em planilha."),
            p("No detalhe da medida, além da resposta propriamente dita, abrem-se atalhos para trechos de apoio à LGPD e para guias externos citados no framework (por exemplo, CIS), de modo que a avaliação não fique desconectada da base normativa. Quando cabível, ações são encadeadas ao plano de trabalho sem quebrar o fluxo de leitura — ponte entre a nota de maturidade e a execução. A Figura 2 ilustra esse percurso: à esquerda, a árvore de controles; à direita, a medida selecionada com resposta, INCC e vínculos ao plano de trabalho."),
            ...(imgDiagnostico ? [imgDiagnostico, pCaption("Figura 2. Módulo de diagnóstico: árvore de controles e detalhamento de medida com resposta e plano de trabalho.")] : []),
            p("Fechado o ciclo de leitura e registro da maturidade no diagnóstico, o mesmo programa concentra as demais frentes do roteiro — execução documentada, conformidade operacional e canal com titulares — sem exigir troca de ferramenta."),
            p("O plano de trabalho e as políticas ocupam o eixo seguinte: o primeiro organiza ações com responsáveis, prazos, avaliação de riscos e vínculo explícito aos controles já respondidos, de modo que o avanço da maturidade deixe rastro executável e auditável; o segundo oferece editor WYSIWYG, modelos reutilizáveis, exportação em PDF e versionamento, evitando que normas internas fiquem dispersas em arquivos estáticos."),
            p("O registro das operações de tratamento consolida, por programa, categorias de dados envolvidos, titulares, critérios de retenção e rotinas de exportação para relatório ou fiscalização — fechando o elo entre o inventário e a demonstração de conformidade. Em paralelo, o portal de privacidade configurável por programa expõe ao titular canal de contato e fluxos para exercício de direitos; o backoffice mantém fila de pedidos, estados e responsáveis pelo atendimento. Cadastros de responsáveis e governança de papéis sustentam a distribuição de encargos; o módulo de auditoria, alinhado ao Controle 8 do framework, registra eventos relevantes na aplicação. A Figura 3 exemplifica a interface voltada ao titular nesse portal."),
            ...(imgPortal ? [imgPortal, pCaption("Figura 3. Portal de privacidade para titulares: requisição de direitos (art. 18 LGPD) e acompanhamento de pedidos.")] : []),
            heading("4.2 Arquitetura técnica", 3),
            p("A solução adota arquitetura em camadas (cliente e servidor), com autenticação de usuários, persistência em banco relacional e APIs, podendo ser implantada em nuvem ou on-premises."),
            heading("4.3 Multi-cliente", 3),
            p("O conceito de \"programa\" permite que um consultor gerencie vários clientes na mesma ferramenta, com isolamento de dados por programa e permissões configuráveis por usuário. Cada programa possui seu próprio diagnóstico, plano de trabalho, registro das operações de tratamento e políticas."),
            heading("4.4 Integração de referências normativas e assistência por IA", 3),
            p("A implementação mantém coerência com a metodologia da Ferramenta oficial (controles, medidas, pesos e fórmulas de maturidade publicados pelo governo), acompanhando atualizações do catálogo quando divulgadas, de modo a preservar comparabilidade com o referencial de apoio ao programa."),
            p("A integração normativa consiste em vincular o diagnóstico e a conformidade a uma trilha de referências: dispositivos da LGPD, fundamentos do próprio programa e de seu framework e encadeamento com referenciais internacionais citados na base normativa do PPSI (como CIS, NIST e ISO/IEC), de modo que o usuário navegue da medida ou do levantamento ao texto normativo ou guia que a justifica — sem substituir parecer jurídico, mas reduzindo fricção na capacitação das equipes."),
            p("A Lei nº 13.709/2018 encontra-se disponível no sistema com artigos indexados para consulta integral (referência alinhada ao texto compilado no Planalto). No diagnóstico, as normas de referência associadas a cada medida exibem atalhos: ao acionar uma citação à LGPD, abre-se caixa de diálogo com o texto do artigo mapeado, evitando troca de contexto a cada dúvida pontual; outras referências externas podem seguir para o site oficial em nova aba, conforme o mapeamento. A Figura 4 combina a tela do módulo de consulta à lei e um exemplo de popup acionado a partir da seção de normas da medida."),
            ...(imgLgpd ? [imgLgpd, pCaption("Figura 4. Consulta à LGPD: texto integral por artigos e exemplo de janela contextual a partir das normas de referência na medida do diagnóstico.")] : []),
            p("No mapeamento de dados (inventário LGPD), o painel de processos de referência oferece tipologia de setores e finalidades para o analista consultar e copiar ao formulário, acelerando o preenchimento sem substituir o juízo de negócio."),
            p("A função \"Sugerir levantamentos com IA\" chama, no servidor, um modelo de linguagem alimentado apenas com metadados institucionais do programa e da organização (nome, escopo, atividade) — não envia dados pessoais de titulares — e devolve rascunhos em formato estruturado. Cada sugestão é validada contra as listas fechadas do inventário (setor, finalidade, meios de armazenamento, categorias de dados, titular, transferência internacional, entre outras); o usuário pré-visualiza, seleciona as linhas aceitas e grava com aviso de que o output é assistência operacional, não parecer jurídico. A API aplica limite de taxa por utilizador e programa. A evolução prevista é reutilizar esse desenho para apoiar a redação das operações no registro a partir de levantamentos já validados."),
            pNoIndent(""),
            heading("5 CONSIDERAÇÕES SOBRE GOVERNANÇA, AUDITORIA E ACCOUNTABILITY", 2),
            p("O FPSI oferece auditoria por programa, com listagem paginada e filtros por período, usuário, tipo de ação e tipo de recurso. As operações relevantes na aplicação autenticada geram registros com a ação (criação, alteração, exclusão e, conforme o fluxo, visualização, convite, exportação, download de arquivos, entre outras) e o recurso afetado — por exemplo respostas ao diagnóstico, planos de ação, políticas, levantamentos, operações de tratamento e snapshots do registro, pedidos de titulares, RIPD e incidentes —, além de identificadores, programa e usuário; nas APIs, quando couber, IP e agente. Pedidos pelo portal público podem ter trilha distinta. O desenho evita persistir dados sensíveis de titulares no detalhe da trilha, em linha com minimização e finalidade probatória."),
            p("Em conjunto, a trilha sustenta a demonstração de responsabilização e de registro de operações prevista na LGPD e o alinhamento ao Controle 8 do framework (gestão de registros de auditoria). O código aberto permite, adicionalmente, rever a lógica de auditoria e as fórmulas de maturidade implementadas no software, reforçando accountability perante órgãos de controle e a comunidade técnica."),
            pNoIndent(""),
            heading("CONCLUSÃO", 2),
            p("O FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do Programa PPSI 2.0 com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema cobre diagnóstico de maturidade, plano de trabalho, políticas, registro das operações de tratamento, portal de privacidade, pedidos dos titulares, mapeamento de dados e demais fluxos de conformidade, trilha de auditoria e referências normativas integradas à LGPD e a referenciais internacionais, atendendo a necessidades de DPOs e gestores de segurança no setor público e privado."),
            p("Em perspectiva, consolidar IA nos levantamentos e no registro das operações de tratamento, ampliar direitos de titulares, RIPD e incidentes, integrar gestão documental e relatórios para controle e acompanhar atualizações da Ferramenta oficial para manter paridade metodológica."),
            pNoIndent(""),
            heading("REFERÊNCIAS", 2),
            refPAbnt(
              "BRASIL. Autoridade Nacional de Proteção de Dados. Site institucional. Disponível em: https://www.gov.br/anpd. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "BRASIL. Lei nº 13.146, de 6 de julho de 2015. Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência. Diário Oficial da União, Poder Executivo, Brasília, DF, 7 jul. 2015. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Institui a Lei Geral de Proteção de Dados Pessoais. Diário Oficial da União, Poder Executivo, Brasília, DF, 15 ago. 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Ferramenta do Framework de Privacidade e Segurança da Informação [recurso eletrônico]. Planilha Microsoft Excel e documentação de apoio ao PPSI 2.0. Disponível em: https://www.gov.br/mgi/pt-br/assuntos/seguranca-da-informacao/ferramenta-do-framework. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria MGISP nº 671, de 30 de março de 2023. Estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o framework de privacidade e segurança da informação. Diário Oficial da União, Brasília, DF, 31 mar. 2023. Disponível em: https://www.in.gov.br/en/web/dou/-/portaria-mgisp-n-671-de-30-de-marco-de-2023-477900728. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025. Institui o Programa de Privacidade e Segurança da Informação na forma do PPSI 2.0 no âmbito dos órgãos do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP). Disponível em: https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0. Acesso em: 31 mar. 2026.",
            ),
            refPAbnt(
              "FPSI. Plataforma de software livre em apoio ao framework do Programa de Privacidade e Segurança da Informação (PPSI) [recurso eletrônico]. Distribuição sob licença MIT. Disponível em: https://github.com/jorgepsendziuk/fpsi. Informações complementares e ambiente de demonstração: https://fpsi.com.br. Acesso em: 31 mar. 2026.",
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = "Artigo FPSI - Inovacoes Digitais.docx";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error("[artigo/export-word] Erro:", error);
    return NextResponse.json({ error: "Erro ao gerar documento" }, { status: 500 });
  }
}
