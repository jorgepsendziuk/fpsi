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
const LINE_SPACING = 360;

const defaultParagraphProps = {
  alignment: AlignmentType.JUSTIFIED,
  spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 0, after: 120 },
  indent: { firstLine: INDENT_FIRST_LINE },
};

// Sem cores: texto preto explícito para evitar cores do tema do Word
const textRunProps = { font: "Times New Roman", size: 24, color: "000000" };

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

// Dimensões reais: Painel 2154x2250, Diagnóstico 2376x2152, Portal 1968x2254
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

export async function GET() {
  try {
    const imgPainel = imageParagraph("artigo/Painel.jpg", 483, 450);
    const imgDiagnostico = imageParagraph("artigo/Diagnóstico.jpg", 497, 450);
    const imgPortal = imageParagraph("artigo/Portal.jpg", 393, 450);

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
              children: [new TextRun({ text: "FPSI: IMPLEMENTAÇÃO OPEN SOURCE DO FRAMEWORK DO PROGRAMA DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO (PPSI 2.0) COM ASSISTÊNCIA POR INTELIGÊNCIA ARTIFICIAL INTEGRADA AOS FLUXOS DE CONFORMIDADE", ...textRunProps, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
              indent: { firstLine: 0 },
            }),
            pNoIndent(""),
            new Paragraph({
              children: [new TextRun({ text: "FPSI: OPEN-SOURCE IMPLEMENTATION OF THE BRAZILIAN PPSI 2.0 PROGRAM'S PRIVACY AND INFORMATION SECURITY FRAMEWORK WITH INTEGRATED ARTIFICIAL INTELLIGENCE ASSISTANCE FOR COMPLIANCE WORKFLOWS", ...textRunProps, italics: true })],
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
            pBoldLabel("SUMÁRIO: ", "Introdução. 1 Marco regulatório: LGPD, PPSI e o framework do programa. 1.1 Lei Geral de Proteção de Dados Pessoais (LGPD). 1.2 Programa de Privacidade e Segurança da Informação (PPSI) e o framework de privacidade e segurança da informação. 1.3 Ferramenta oficial do framework do PPSI. 2 Limitações da ferramenta oficial e demanda por alternativas. 3 Proposta: implementação open source (FPSI). 4 Funcionalidades e arquitetura do sistema. 4.1 Módulos principais. 4.2 Arquitetura técnica. 4.3 Multi-cliente. 4.4 Camada educativa, referências normativas e assistência por IA. 5 Considerações sobre governança, auditoria e accountability. Conclusão. Referências."),
            pNoIndent(""),
            pBoldLabel("RESUMO: ", "A transformação digital e a LGPD impulsionaram ferramentas de governança em privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos instituiu o PPSI e o respectivo framework de privacidade e segurança da informação, com ferramenta oficial em Excel para diagnóstico de controles; a dependência de planilha limita acessibilidade, colaboração e interoperabilidade. O artigo apresenta o FPSI — implementação open source desse framework (Next.js, React, Supabase) —, alinhada ao PPSI 2.0 e à metodologia oficial vigente, com diagnóstico, plano de trabalho, políticas, ROPA, portal e pedidos de titulares (art. 18 LGPD), mapeamento de dados, auditoria e camada educativa (LGPD, CIS, NIST, ISO), além de assistência por IA a levantamentos e fluxo ao ROPA, com validação no servidor e revisão humana obrigatória."),
            pBoldLabel("Palavras-chave: ", "LGPD; PPSI 2.0; software livre; inteligência artificial; privacidade e segurança da informação."),
            pNoIndent(""),
            pBoldLabel("ABSTRACT: ", "Digital transformation and Brazil's LGPD have increased demand for privacy and information security tooling. In 2023, the Ministry of Management and Innovation established the PPSI and its privacy and information security framework, with an official Excel workbook; spreadsheet dependence limits accessibility, collaboration, and interoperability. This article presents FPSI, an open-source implementation of that framework (Next.js, React, Supabase), aligned with PPSI 2.0 and the current official methodology, covering maturity diagnosis, work plans, policies, ROPA, a privacy portal and data-subject requests (Art. 18 LGPD), personal-data mapping, audit trail, an educational layer (LGPD, CIS, NIST, ISO), and AI-assisted mapping drafts with server-side validation and mandatory human review toward ROPA.", true),
            pBoldLabel("Keywords: ", "LGPD; PPSI 2.0; open-source software; artificial intelligence; privacy and information security.", true),
            pNoIndent(""),
            heading("INTRODUÇÃO", 2),
            p("No Brasil, a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) em setembro de 2020 consolidou exigências de adequação a organizações públicas e privadas (BRASIL, 2018), em linha com o GDPR na União Europeia: designação de DPO, mapeamento de operações e medidas técnicas e organizacionais adequadas ao risco, num contexto em que a digitalização de serviços tornou a privacidade e a segurança da informação eixo central de governança."),
            p("Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e instituiu o framework de privacidade e segurança da informação previsto no programa, disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles (BRASIL, 2023). A ferramenta oferece um roteiro metodológico alinhado aos principais referenciais internacionais de segurança e privacidade, permitindo que órgãos públicos avaliem seu nível de maturidade e elaborem planos de ação."),
            p("Apesar da eficácia metodológica da ferramenta oficial na validação de medidas e no cálculo de níveis de maturidade, sua dependência de planilha eletrônica impõe limitações significativas em termos de acessibilidade, trabalho colaborativo e interoperabilidade. As soluções comerciais de gestão de privacidade, por sua vez, são pagas e, em geral, não seguem o padrão do framework do PPSI nem permitem adaptação do código à realidade de cada organização."),
            p("Este artigo apresenta o FPSI — implementação open source do framework do PPSI desenvolvida com tecnologias web —, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. No PPSI 2.0, o framework de privacidade e segurança da informação organiza o catálogo de controles e medidas; o FPSI acompanha a ferramenta oficial vigente e esse catálogo, além de instrumentos do programa (mapeamento, ROPA, normas de referência, governança) e de uma trajetória de assistência por inteligência artificial para acelerar levantamentos, sempre sujeita a validação técnica e revisão humana. O trabalho está alinhado ao eixo temático de Privacidade e Proteção de Dados, abordando o impacto das legislações de proteção de dados (LGPD e correlatas), medidas de compliance digital e cultura organizacional voltada à privacidade."),
            p("A seção 1 sintetiza LGPD, PPSI 2.0 e Ferramenta oficial; a seção 2, limitações da planilha e demanda por alternativas; a seção 3, a proposta open source; a seção 4, funcionalidades, arquitetura, camada educativa e IA; a seção 5, governança e auditoria; seguem conclusão e referências."),
            pNoIndent(""),
            heading("1 MARCO REGULATÓRIO: LGPD, PPSI E O FRAMEWORK DO PROGRAMA", 2),
            heading("1.1 Lei Geral de Proteção de Dados Pessoais (LGPD)", 3),
            p("A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil (BRASIL, 2018), com inspiração no Regulamento Geral de Proteção de Dados (GDPR) da União Europeia e obrigações que incluem designação do Encarregado pelo Tratamento de Dados Pessoais (DPO), registro das operações de tratamento (ROPA, art. 37) e adoção de medidas de segurança técnicas e organizacionais adequadas ao risco, observados os princípios de finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização e prestação de contas. O art. 37 impõe ao controlador a manutenção de registro das operações com informações sobre finalidade, base legal, titulares, categorias de dados, compartilhamentos, medidas de segurança e prazos de retenção; o art. 41 institui o DPO como canal entre controlador, titulares e Autoridade Nacional de Proteção de Dados (ANPD), cabendo-lhe, entre outras atribuições, receber comunicações dos titulares, orientar a organização sobre boas práticas e apoiar a realização de Avaliação de Impacto à Proteção de Dados Pessoais (RIPD) e o relatório correspondente quando aplicável, podendo o encargo ser exercido por pessoa interna ou externa."),
            heading("1.2 PROGRAMA DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO (PPSI) E O FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO", 3),
            p("Em 30 de março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui, na administração pública federal, o framework de privacidade e segurança da informação previsto no programa (BRASIL, 2023). A configuração atual do programa, referida como PPSI 2.0 para os órgãos integrantes do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP), foi regulada pela Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025, com entrada em vigor em 1º de janeiro de 2026 (BRASIL, 2025). Esse framework apoia-se em referenciais de privacidade e segurança como CIS (Center for Internet Security), NIST (National Institute of Standards and Technology) e ISO/IEC. No catálogo metodológico do PPSI 2.0 vigente, dispõe-se de 27 controles em três diagnósticos complementares: o primeiro abrange a estruturação básica para governança (dois controles de base, identificados no guia pelo número 0); o segundo reúne os controles 1 a 18, com foco em segurança da informação e controles afins; o terceiro compreende os controles 19 a 25, voltados à privacidade e ao arcabouço da LGPD. O catálogo de medidas segue a Ferramenta oficial e a documentação publicada pelo órgão gestor; revisões podem alterar quantidade ou redação dos itens, de modo que soluções digitais devem acompanhar o material em vigor para preservar comparabilidade de maturidade e do plano de trabalho. No âmbito normativo do PPSI 2.0, o programa vincula os órgãos do SISP; o mesmo referencial permanece útil à ANPD e ao setor privado que adote o roteiro voluntariamente."),
            heading("1.3 FERRAMENTA OFICIAL DO FRAMEWORK DO PPSI", 3),
            p("No PPSI 2.0, o órgão gestor disponibiliza ao público a Ferramenta do Framework de Privacidade e Segurança da Informação (denominação oficial da planilha) em Excel, com guia e manuais alinhados ao catálogo vigente. A estrutura da pasta de trabalho consolida o arranjo metodológico: cadastros; segmento de estruturação básica (dois controles de número 0); controles 1 a 18; controles 19 a 25; relatório consolidado; e plano de trabalho, permitindo registrar respostas às medidas, fatores de ponderação e consolidações para relatório."),
            p("Na metodologia associada ao PPSI 2.0, a avaliação centra-se nos 27 controles e nas respectivas medidas de implementação; atribui-se a cada controle um Índice de Nível de Capacidade (INCC) em escala de 0 a 5, coerente com a leitura de efetividade daquele conjunto de práticas na Ferramenta. Consolida-se então o índice de maturidade iMC mediante a fórmula parametrizada na planilha oficial iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100), com enquadramento nos níveis Inicial, Básico, Intermediário, Em Aprimoramento e Aprimorado e derivação de ações prioritárias no plano de trabalho. O FPSI descrito nas seções seguintes visa convergir a essa metodologia e ao conteúdo funcional do referencial publicado pelo órgão gestor."),
            pNoIndent(""),
            heading("2 LIMITAÇÕES DA FERRAMENTA OFICIAL E DEMANDA POR ALTERNATIVAS", 2),
            p("A ferramenta oficial, em Excel, impõe limites estruturais: dificulta acessibilidade (leitores de tela e LBI, Lei nº 13.146/2015) (BRASIL, 2015), trabalho colaborativo e controle de versão (arquivo local, risco de perda ou conflitos, proliferação de cópias em trabalho remoto), além de dependência de suíte proprietária e custos de licença. Soluções comerciais de governança em privacidade costumam ser pagas, não seguem o padrão do framework do PPSI nem permitem auditar ou adaptar o código. Daí a demanda por alternativa web, colaborativa e open source alinhada ao mesmo roteiro metodológico."),
            pNoIndent(""),
            heading("3 PROPOSTA: IMPLEMENTAÇÃO OPEN SOURCE", 2),
            p("Propõe-se o FPSI: implementação web espelhando a ferramenta oficial de apoio ao framework do PPSI (React, Node.js, Supabase), em modelo open source, favorecendo colaboração, acesso multiplataforma e implantação em nuvem ou on-premises (autenticação, PostgreSQL, APIs REST)."),
            p("A justificativa da abertura do código inclui: (1) Colaboração da comunidade — permitir que a comunidade contribua com evoluções no referencial do PPSI e no software FPSI; (2) Implantação ampla — facilitar a implantação em órgãos públicos, empresas e consultores independentes, sem custo de licença; (3) PaaS (Privacy as a Service) — permitir que plataformas ofereçam o serviço hospedado, mantendo a possibilidade de auditoria do código; (4) Adaptabilidade — garantir que organizações possam adaptar o código à sua realidade, customizando fluxos, campos ou integrações. O código é distribuído sob licença MIT e está disponível em https://github.com/jorgepsendziuk/fpsi. O sistema está hospedado em https://fpsi.com.br, com um programa de demonstração disponível para visualização do funcionamento."),
            pNoIndent(""),
            heading("4 FUNCIONALIDADES E ARQUITETURA DO SISTEMA", 2),
            heading("4.1 Módulos principais", 3),
            p("A implementação cobre os seguintes módulos, alinhados ao referencial oficial do framework do PPSI e ao Programa PPSI 2.0: diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, conformidade LGPD (incluindo mapeamento de dados pessoais com listas de domínio compatíveis com o inventário, normas e documentos de referência por programa e vínculo entre levantamentos e operações de tratamento quando aplicável), responsáveis, governança de papéis e auditoria."),
            ...(imgPainel ? [imgPainel, pCaption("Figura 1. Painel do programa com módulos do sistema e estrutura de tratamento (controlador, operador).")] : []),
            p("Diagnóstico de maturidade: árvore diagnóstico–controle–medida, INCC 0 a 5, dashboard e 27 controles alinhados ao PPSI 2.0; consulta contextual a LGPD e referenciais (ex.: CIS) nas medidas; índice iMC conforme §1.3."),
            ...(imgDiagnostico ? [imgDiagnostico, pCaption("Figura 2. Módulo de diagnóstico: árvore de controles e detalhamento de medida com resposta e plano de trabalho.")] : []),
            p("Plano de trabalho (ações, responsáveis, prazos, riscos, vínculo a controles); políticas (editor WYSIWYG, modelos, PDF, versionamento); ROPA (art. 37 LGPD, categorias, titulares, retenção, exportação); portal por programa (art. 18 LGPD, direitos dos titulares, contato); pedidos e fila de atendimento; responsáveis e papéis; auditoria (Controle 8, art. 37 LGPD). A Figura 3 exemplifica o portal de titulares."),
            ...(imgPortal ? [imgPortal, pCaption("Figura 3. Portal de privacidade para titulares: requisição de direitos (art. 18 LGPD) e acompanhamento de pedidos.")] : []),
            heading("4.2 Arquitetura técnica", 3),
            p("Frontend: Next.js 15, React 19, TypeScript, Material-UI. Backend: Supabase (autenticação por e-mail/senha e OAuth, banco de dados PostgreSQL, APIs REST, Row Level Security)."),
            heading("4.3 Multi-cliente", 3),
            p("O conceito de \"programa\" permite que um consultor gerencie vários clientes na mesma ferramenta, com isolamento de dados por programa e permissões configuráveis por usuário. Cada programa possui seu próprio diagnóstico, plano de trabalho, ROPA e políticas."),
            heading("4.4 Camada educativa, referências normativas e assistência por IA", 3),
            p("A implementação mantém coerência com a metodologia da Ferramenta oficial (controles, medidas, pesos e fórmulas de maturidade publicados pelo governo), acompanhando atualizações do catálogo quando divulgadas, de modo a preservar comparabilidade com o referencial de apoio ao programa."),
            p("O diferencial educativo consiste em integrar o diagnóstico e a conformidade a uma trilha de referências: dispositivos da LGPD, fundamentos do próprio programa e de seu framework e encadeamento com referenciais internacionais citados na base normativa do PPSI (como CIS, NIST e ISO/IEC), de modo que o usuário navegue da medida ou do levantamento ao texto normativo ou guia que a justifica — sem substituir parecer jurídico, mas reduzindo fricção na capacitação das equipes."),
            p("No eixo de IA: catálogo e painel de processos de referência no mapeamento; API em servidor com rascunhos validados contra domínios fechados, metadados institucionais apenas, pré-visualização editável e gravação após aceitação pelo analista ou DPO; evolução prevista para ROPA a partir de levantamentos validados, com limites de taxa no servidor."),
            pNoIndent(""),
            heading("5 CONSIDERAÇÕES SOBRE GOVERNANÇA, AUDITORIA E ACCOUNTABILITY", 2),
            p("Trilha de auditoria (Controle 8, art. 37 LGPD) e código aberto permitem verificar fórmulas, tratamento de dados e riscos, reforçando accountability perante órgãos de controle e a comunidade técnica."),
            pNoIndent(""),
            heading("CONCLUSÃO", 2),
            p("O FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do Programa PPSI 2.0 com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema cobre diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, mapeamento de dados e demais fluxos de conformidade, trilha de auditoria e camada educativa com referências LGPD e a referenciais internacionais, atendendo a necessidades de DPOs e gestores de segurança no setor público e privado."),
            p("O código aberto amplia opções de adequação à LGPD e ao framework do PPSI. Perspectivas: consolidar IA em levantamentos e ROPA, ampliar direitos de titulares, RIPD e incidentes, integrar gestão documental e relatórios para controle; acompanhar atualizações da Ferramenta oficial para manter paridade metodológica."),
            pNoIndent(""),
            heading("REFERÊNCIAS", 2),
            new Paragraph({
              children: [new TextRun({ text: "ANPD — Autoridade Nacional de Proteção de Dados. Disponível em: https://www.gov.br/anpd. Acesso em: 12 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "BRASIL. Lei n. 13.146, de 6 de julho de 2015. Lei Brasileira de Inclusão da Pessoa com Deficiência. Diário Oficial da União, Poder Executivo, Brasília, DF, 7 jul. 2015. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso em: 12 mar. 2026.", ...textRunProps }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "BRASIL. Lei n. 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Diário Oficial da União, Poder Executivo, Brasília, DF, 15 ago. 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 12 mar. 2026.", ...textRunProps }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o framework de privacidade e segurança da informação. 30 mar. 2023. Disponível em: https://www.in.gov.br/en/web/dou/-/portaria-mgisp-n-671-de-30-de-marco-de-2023-477900728. Acesso em: 31 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025. Institui o Programa de Privacidade e Segurança da Informação na forma do PPSI 2.0 no âmbito dos órgãos do SISP. Disponível em: https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0. Acesso em: 31 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "FPSI. Plataforma de software livre em apoio ao framework do Programa de Privacidade e Segurança da Informação (PPSI). Código-fonte sob licença MIT. Disponível em: https://github.com/jorgepsendziuk/fpsi. Sistema hospedado em: https://fpsi.com.br (programa de demonstração). Acesso em: 31 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "GOVERNO FEDERAL. Ferramenta do Framework de Privacidade e Segurança da Informação. Planilha Excel e documentação de apoio (PPSI 2.0). Disponível em: https://www.gov.br/mgi/pt-br/assuntos/seguranca-da-informacao/ferramenta-do-framework. Acesso em: 31 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
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
