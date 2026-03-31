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
              children: [new TextRun({ text: "IMPLEMENTAÇÃO OPEN SOURCE DO FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO NO PROGRAMA PPSI 2.0 COM APOIO ASSISTIDO POR IA EM MAPEAMENTOS", ...textRunProps, bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST },
              indent: { firstLine: 0 },
            }),
            pNoIndent(""),
            new Paragraph({
              children: [new TextRun({ text: "OPEN-SOURCE IMPLEMENTATION OF THE PRIVACY AND INFORMATION SECURITY FRAMEWORK UNDER BRAZIL'S PPSI 2.0 PROGRAM WITH AI-ASSISTED MAPPING SUPPORT", ...textRunProps, italics: true })],
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
            pBoldLabel("SUMÁRIO: ", "Introdução. 1 Marco regulatório: LGPD, PPSI e o Framework FPSI. 1.1 Lei Geral de Proteção de Dados Pessoais (LGPD). 1.2 Programa de Privacidade e Segurança da Informação (PPSI) e Framework FPSI. 1.3 Ferramenta oficial do Framework. 2 Limitações da ferramenta oficial e demanda por alternativas. 3 Proposta: implementação open source. 4 Funcionalidades e arquitetura do sistema. 4.1 Módulos principais. 4.2 Arquitetura técnica. 4.3 Multi-cliente. 4.4 Camada educativa, referências normativas e assistência por IA. 5 Considerações sobre governança, auditoria e accountability. Conclusão. Referências."),
            pNoIndent(""),
            pBoldLabel("RESUMO: ", "A intensificação da transformação digital e a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) impulsionaram a necessidade de ferramentas que auxiliem organizações a implementar programas de privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e o Framework de Privacidade e Segurança da Informação (FPSI), disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles. Apesar da eficácia metodológica da ferramenta oficial, sua dependência de planilha eletrônica impõe limitações de acessibilidade, trabalho colaborativo e interoperabilidade. Este artigo apresenta uma implementação open source do Framework FPSI, desenvolvida com tecnologias web (Next.js, React, Supabase), alinhada ao Programa PPSI 2.0 e à metodologia da ferramenta oficial vigente, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. O sistema implementa diagnóstico de maturidade, plano de trabalho, políticas, ROPA (Registro das Operações de Tratamento), portal de privacidade para titulares, pedidos dos titulares (art. 18 LGPD), mapeamento de dados e demais módulos de conformidade, trilha de auditoria e gestão de responsáveis, com camada educativa que relaciona medidas a dispositivos da LGPD e referenciais CIS, NIST e ISO. Em paralelo, descreve-se assistência por inteligência artificial para rascunhos de levantamentos e apoio ao fluxo rumo ao ROPA, com validação de domínio no servidor e revisão humana obrigatória. A abertura do código permite colaboração da comunidade, adaptação à realidade de cada organização e oferta como PaaS (Privacy as a Service), reforçando o papel do software livre na promoção da privacidade e da segurança da informação."),
            pBoldLabel("Palavras-chave: ", "LGPD; PPSI 2.0; software livre; inteligência artificial; privacidade e segurança da informação."),
            pNoIndent(""),
            pBoldLabel("ABSTRACT: ", "The intensification of digital transformation and the enactment of the Brazilian General Data Protection Law (LGPD) have driven the need for tools that help organizations implement privacy and information security programs. In 2023, the Ministry of Management and Innovation in Public Services established the Privacy and Information Security Program (PPSI) and the Privacy and Information Security Framework (FPSI), providing an official Excel spreadsheet tool for diagnosis and monitoring of controls. Despite the methodological effectiveness of the official tool, its dependence on spreadsheets imposes limitations on accessibility, collaborative work, and interoperability. This article presents an open-source implementation of the FPSI Framework, developed with modern web technologies (Next.js, React, Supabase), aligned with Brazil's PPSI 2.0 program and the methodology of the current official tool, addressing these gaps and offering a free and adaptable alternative for public agencies, companies, and consultants. The system implements maturity diagnosis, work plans, policies, ROPA (Record of Processing Activities), privacy portal for data subjects, data subject requests (Art. 18 LGPD), personal-data mapping and related compliance modules, audit trail, and responsibility management, including an educational layer linking measures to LGPD provisions and frameworks such as CIS, NIST, and ISO. The article also outlines responsible use of large language models for drafting mapping inventories and supporting the path to ROPA, with server-side domain validation and mandatory human review. Opening the code allows community collaboration, adaptation to each organization's reality, and offering as PaaS (Privacy as a Service), reinforcing the role of free software in promoting privacy and information security.", true),
            pBoldLabel("Keywords: ", "LGPD; PPSI 2.0; open-source software; artificial intelligence; privacy and information security.", true),
            pNoIndent(""),
            heading("INTRODUÇÃO", 2),
            p("A intensificação da transformação digital nas últimas décadas alterou profundamente a forma como organizações públicas e privadas coletam, armazenam e tratam dados pessoais. A digitalização de serviços, a expansão de plataformas e sistemas de informação e a crescente dependência de dados para decisões estratégicas tornaram a proteção da privacidade e da segurança da informação um desafio central para governos de todo o mundo."),
            p("No Brasil, a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) em setembro de 2020 representou um marco regulatório fundamental para a adequação de organizações públicas e privadas às exigências de proteção de dados (BRASIL, 2018). Com inspiração no Regulamento Geral de Proteção de Dados (GDPR) da União Europeia, a LGPD estabelece obrigações que exigem mudanças estruturais nas organizações, incluindo a designação de Encarregado pelo Tratamento de Dados Pessoais (DPO), o mapeamento de operações de tratamento e a implementação de medidas técnicas e organizacionais adequadas ao risco."),
            p("Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e instituiu o Framework de Privacidade e Segurança da Informação (FPSI), disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles (BRASIL, 2023). A ferramenta oferece um roteiro metodológico alinhado aos principais referenciais internacionais de segurança e privacidade, permitindo que órgãos públicos avaliem seu nível de maturidade e elaborem planos de ação."),
            p("Apesar da eficácia metodológica da ferramenta oficial na validação de medidas e no cálculo de níveis de maturidade, sua dependência de planilha eletrônica impõe limitações significativas em termos de acessibilidade, trabalho colaborativo e interoperabilidade. Em paralelo, as soluções comerciais de gestão de privacidade disponíveis no mercado são pagas e, em geral, não seguem o padrão do Framework PPSI nem permitem adaptação do código à realidade de cada organização."),
            p("Este artigo apresenta uma implementação open source do Framework FPSI, desenvolvida com tecnologias web, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. O Framework de Privacidade e Segurança da Informação integra o Programa de Privacidade e Segurança da Informação (PPSI 2.0); a solução acompanha a ferramenta oficial vigente e o respectivo catálogo de controles e medidas, além de instrumentos do programa (mapeamento, ROPA, normas de referência, governança) e de uma trajetória de assistência por inteligência artificial para acelerar levantamentos, sempre sujeita a validação técnica e revisão humana. O trabalho está alinhado ao eixo temático de Privacidade e Proteção de Dados, abordando o impacto das legislações de proteção de dados (LGPD e correlatas), medidas de compliance digital e cultura organizacional voltada à privacidade."),
            p("O texto está organizado em sete seções. Após esta introdução, a seção 1 apresenta o marco regulatório (LGPD, PPSI e Framework FPSI), enquanto a seção 2 discute as limitações da ferramenta oficial e a demanda por alternativas. A seção 3 apresenta a proposta de implementação open source e a seção 4 detalha as funcionalidades e a arquitetura do sistema — incluindo camada educativa com referências normativas e desenho de assistência por IA. Em seguida, a seção 5 trata de governança, auditoria e accountability, e a conclusão encerra o artigo."),
            pNoIndent(""),
            heading("1 MARCO REGULATÓRIO: LGPD, PPSI E O FRAMEWORK FPSI", 2),
            heading("1.1 Lei Geral de Proteção de Dados Pessoais (LGPD)", 3),
            p("A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil (BRASIL, 2018). Inspirada no Regulamento Geral de Proteção de Dados (GDPR) da União Europeia, a LGPD impõe obrigações às organizações que coletam, armazenam, tratam e compartilham dados pessoais, incluindo a designação de Encarregado pelo Tratamento de Dados Pessoais (DPO), o registro das operações de tratamento (ROPA, art. 37) e a adoção de medidas de segurança técnicas e organizacionais adequadas ao risco."),
            p("A LGPD fundamenta-se em princípios como finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização e prestação de contas. O artigo 37 estabelece a obrigatoriedade de manutenção de registro das operações de tratamento de dados pessoais realizadas pelos controladores, que deve conter informações sobre a finalidade, a base legal, os titulares afetados, as categorias de dados, os compartilhamentos, as medidas de segurança e o prazo de retenção."),
            p("O DPO, previsto no artigo 41 da LGPD, atua como canal de comunicação entre o controlador, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD). Entre suas atribuições estão aceitar reclamações e comunicações dos titulares, orientar colaboradores sobre práticas de proteção de dados, orientar sobre a realização de Avaliação de Impacto à Proteção de Dados Pessoais (RIPD) e elaborar o Relatório de Impacto quando aplicável. O DPO pode ser interno ou externo à organização, atuando como consultor em projetos de adequação."),
            heading("1.2 Programa de Privacidade e Segurança da Informação (PPSI) e Framework FPSI", 3),
            p("Em 30 de março de 2023, foi publicada pelo Ministério da Gestão e da Inovação em Serviços Públicos a portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o Framework de Privacidade e Segurança da Informação (BRASIL, 2023). O Framework, que já havia sido lançado em novembro de 2022, é baseado nos principais referenciais de privacidade e segurança, como CIS (Center for Internet Security), NIST (National Institute of Standards and Technology) e ISO/IEC, e oferece 31 controles de segurança e privacidade a serem implementados pelas repartições públicas."),
            p("O PPSI visa promover a governança em privacidade e segurança da informação no âmbito da administração pública federal, alinhando-se à Política Nacional de Segurança da Informação (PNSI) e à LGPD. O Framework estrutura-se em três diagnósticos: o Diagnóstico 1 (Controle 0) aborda a estruturação básica de gestão em privacidade e segurança; o Diagnóstico 2 cobre os Controles 1 a 18 de segurança da informação; e o Diagnóstico 3 abrange os Controles 19 a 31 de privacidade."),
            p("O conjunto de medidas de implementação associadas aos 31 controles acompanha as atualizações divulgadas na Ferramenta oficial do Framework; alterações na quantidade de itens ou na qualidade das formulações (redação, recortes temáticos ou critérios) refletem revisões periódicas do órgão gestor. Implementações digitais devem manter paridade com a planilha e o manual em vigor para que níveis de maturidade e plano de trabalho permaneçam comparáveis ao referencial publicado."),
            p("O documento disponibiliza ferramentas para auxiliar no diagnóstico e na melhoria do nível de segurança das organizações. Além de ser normativo para o setor público, a ANPD utiliza as diretrizes elaboradas para o setor público como referência, de modo que o setor privado também pode se beneficiar de processos de adequação ao Framework. Empresas que desejam demonstrar conformidade com boas práticas de privacidade e segurança encontram no Framework um roteiro estruturado e reconhecido."),
            heading("1.3 Ferramenta oficial do Framework", 3),
            p("A ferramenta oficial do Framework é distribuída no site do Governo Federal no formato de uma planilha Excel — Ferramenta do Framework de Privacidade e Segurança da Informação —, acompanhada de um manual de implementação e atualizada conforme o calendário do programa. A pasta de trabalho contém planilhas de CADASTROS; CONTROLE 0 (estruturação básica); CONTROLES 1 A 18 (segurança da informação); CONTROLES 19 A 31 (privacidade); RELATÓRIO DE TODOS OS CONTROLES; e PLANO DE TRABALHO."),
            p("A interface utiliza fórmulas para calcular níveis de maturidade a partir das respostas às medidas e para gerar ações prioritárias no plano de trabalho. O cálculo considera o Índice de Nível de Capacidade do Controle (INCC), que avalia qualitativamente a efetividade de cada controle, e as pontuações das medidas de implementação. A ferramenta permite simplificar a validação das medidas e medir o nível de maturidade de um programa. A implementação descrita neste artigo busca convergência com essa metodologia e com o conteúdo da planilha oficial vigente."),
            pNoIndent(""),
            heading("2 LIMITAÇÕES DA FERRAMENTA OFICIAL E DEMANDA POR ALTERNATIVAS", 2),
            p("Apesar da eficiência na avaliação dos controles, a ferramenta oficial apresenta limitações decorrentes da tecnologia utilizada (planilha no formato Excel). Tais limitações afetam especialmente órgãos públicos de maior porte, consultorias que atendem múltiplos clientes e organizações que priorizam trabalho colaborativo e software livre."),
            p("Quanto à acessibilidade, a interface de planilha possui restrições para usuários com necessidades especiais. Leitores de tela e tecnologias assistivas têm dificuldade em interpretar a estrutura de células, fórmulas e elementos gráficos típicos do Excel. Em um contexto em que a administração pública deve garantir acessibilidade conforme a Lei Brasileira de Inclusão (Lei nº 13.146/2015) (BRASIL, 2015), a dependência de planilha representa uma barreira."),
            p("Quanto ao trabalho distribuído, os dados ficam armazenados em um arquivo no computador de um usuário, dificultando o trabalho colaborativo entre vários usuários (DPO, gestores, analistas de diferentes departamentos). A manutenção de uma versão única e atualizada exige procedimentos manuais de consolidação, com risco de conflitos e perda de alterações."),
            p("Quanto à disponibilidade, há dependência de um único arquivo local, com risco de perda por falha de hardware, exclusão acidental ou corrupção. Em cenários de trabalho remoto ou híbrido, o compartilhamento do arquivo por e-mail ou drives aumenta o risco de proliferar versões desatualizadas."),
            p("Quanto ao software proprietário, a edição com total compatibilidade depende de Microsoft Office. Órgãos que adotam software livre (como LibreOffice) podem enfrentar incompatibilidades. O custo de licenciamento para múltiplos usuários pode ser significativo para pequenas organizações ou consultorias."),
            p("As principais soluções comerciais existentes para a gestão de um programa de governança em privacidade são pagas, sem alternativas gratuitas para implementação em órgãos públicos ou pequenas empresas. Além disso, as soluções existentes não seguem o padrão de conformidade do Framework do PPSI nem permitem modificação no código. Diante desse cenário, surge a demanda por uma ferramenta que combine o roteiro metodológico do Framework com as vantagens de uma aplicação web colaborativa e open source."),
            pNoIndent(""),
            heading("3 PROPOSTA: IMPLEMENTAÇÃO OPEN SOURCE", 2),
            p("Propõe-se desenvolver uma implementação da Ferramenta do Framework do PPSI utilizando tecnologias escaláveis e de ampla adoção no mercado, como React, Node.js e plataformas de armazenamento como Supabase, com o objetivo de fornecer um software de referência em privacidade e segurança da informação no modelo de distribuição open source."),
            p("A escolha por tecnologias web (em oposição a aplicações desktop) justifica-se pela necessidade de trabalho colaborativo, acesso de qualquer dispositivo e independência de sistema operacional. React e Next.js são amplamente adotados no mercado, com documentação disponível, o que facilita a manutenção e a evolução do projeto. O Supabase oferece autenticação, banco de dados PostgreSQL e APIs REST em um modelo que permite implantação em nuvem ou on-premises, adequando-se a diferentes contextos de uso."),
            p("A justificativa da abertura do código inclui: (1) Colaboração da comunidade — permitir que a comunidade contribua com novas versões do framework e com evoluções na ferramenta; (2) Implantação ampla — facilitar a implantação em órgãos públicos, empresas e consultores independentes, sem custo de licença; (3) PaaS (Privacy as a Service) — permitir que plataformas ofereçam o serviço hospedado, mantendo a possibilidade de auditoria do código; (4) Adaptabilidade — garantir que organizações possam adaptar o código à sua realidade, customizando fluxos, campos ou integrações. O código é distribuído sob licença MIT e está disponível em https://github.com/jorgepsendziuk/fpsi. O sistema está hospedado em https://fpsi.com.br, com um programa de demonstração disponível para visualização do funcionamento."),
            pNoIndent(""),
            heading("4 FUNCIONALIDADES E ARQUITETURA DO SISTEMA", 2),
            heading("4.1 Módulos principais", 3),
            p("A implementação cobre os seguintes módulos, alinhados ao Framework oficial e ao Programa PPSI 2.0: Diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, conformidade LGPD (incluindo mapeamento de dados pessoais com listas de domínio compatíveis com o inventário, normas e documentos de referência por programa, vínculo entre levantamentos e operações de tratamento quando aplicável), responsáveis, governança de papéis e auditoria."),
            ...(imgPainel ? [pNoIndent("A Figura 1 ilustra o painel do programa com os módulos disponíveis e a estrutura de tratamento (controlador, operador)."), imgPainel, pCaption("Figura 1. Painel do programa com módulos do sistema e estrutura de tratamento (controlador, operador).")] : []),
            p("Diagnóstico de maturidade: estrutura em árvore (diagnóstico → controle → medida); respostas e justificativas por medida; níveis INCC de 0 a 5; dashboard de maturidade com indicadores visuais; 31 controles e respectivas medidas alinhados ao Framework no âmbito do PPSI 2.0. Onde o texto da medida remete à lei ou a boas práticas, a interface favorece a consulta contextual (por exemplo, trechos da LGPD ou menção a referenciais como CIS), reforçando o uso pedagógico do instrumento. O cálculo de maturidade implementa a fórmula oficial iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100), com classificação em níveis Inicial, Básico, Intermediário, Em Aprimoramento e Aprimorado."),
            ...(imgDiagnostico ? [pNoIndent("A Figura 2 apresenta a interface do módulo de diagnóstico com a árvore de controles e o detalhamento de medida."), imgDiagnostico, pCaption("Figura 2. Módulo de diagnóstico: árvore de controles e detalhamento de medida com resposta e plano de trabalho.")] : []),
            p("Plano de trabalho: ações prioritárias derivadas das respostas do diagnóstico; atribuição de responsáveis, datas, status; campos para orçamento e riscos; dashboard executivo; vinculação entre ações e controles/medidas."),
            p("Políticas: editor com interface rica (WYSIWYG), incluindo política de proteção de dados pessoais, política de segurança da informação e outras políticas institucionais; modelos pré-configurados; exportação em PDF; versionamento."),
            p("ROPA: módulo para registro das operações conforme art. 37 da LGPD; campos para nome do processo, finalidade, base legal, categorias de dados, titulares, compartilhamento, retenção e medidas de segurança; listagem com filtros; exportação."),
            p("Portal de privacidade: página pública por programa (URL customizável por slug), onde titulares exercem direitos previstos no art. 18 da LGPD — acesso, correção, exclusão, portabilidade, revogação de consentimento, informação sobre compartilhamento e oposição — além de reportar vulnerabilidades ou incidentes e enviar mensagens de contato. Cada programa possui seu próprio portal; o DPO obtém o link para distribuir aos titulares."),
            ...(imgPortal ? [pNoIndent("A Figura 3 mostra o portal de privacidade para titulares com o formulário de requisição de direitos."), imgPortal, pCaption("Figura 3. Portal de privacidade para titulares: requisição de direitos (art. 18 LGPD) e acompanhamento de pedidos.")] : []),
            p("Pedidos dos titulares: módulo para registro e acompanhamento de pedidos recebidos pelo portal; fluxo de atendimento com prazos e status; procedimentos alinhados ao art. 18 da LGPD; exportação em PDF para documentação e auditoria."),
            p("Responsáveis: cadastro e atribuição de papéis (admin, coordenador, analista, consultor, auditor); gestão de convites por e-mail; associação de usuários a múltiplos programas."),
            p("Auditoria: trilha que registra quem fez o quê e quando; alinhada ao Controle 8 do Framework e ao art. 37 da LGPD; filtros por usuário, ação, recurso e período."),
            heading("4.2 Arquitetura técnica", 3),
            p("Frontend: Next.js 15, React 19, TypeScript, Material-UI. Backend: Supabase (autenticação por e-mail/senha e OAuth, banco de dados PostgreSQL, APIs REST, Row Level Security)."),
            heading("4.3 Multi-cliente", 3),
            p("O conceito de \"programa\" permite que um consultor gerencie vários clientes na mesma ferramenta, com isolamento de dados por programa e permissões configuráveis por usuário. Cada programa possui seu próprio diagnóstico, plano de trabalho, ROPA e políticas."),
            heading("4.4 Camada educativa, referências normativas e assistência por IA", 3),
            p("A implementação mantém coerência com a metodologia da Ferramenta oficial (controles, medidas, pesos e fórmulas de maturidade publicados pelo governo), acompanhando atualizações do catálogo quando divulgadas, de modo a preservar comparabilidade com o referencial de apoio ao programa."),
            p("O diferencial educativo consiste em integrar o diagnóstico e a conformidade a uma trilha de referências: dispositivos da LGPD, fundamentos do próprio Framework e encadeamento com referenciais internacionais citados na base normativa do PPSI (como CIS, NIST e ISO/IEC), de modo que o usuário navegue da medida ou do levantamento ao texto normativo ou guia que a justifica — sem substituir parecer jurídico, mas reduzindo fricção na capacitação das equipes."),
            p("No eixo de inteligência artificial, o projeto adota desenho centrado em privacidade e revisão humana: (1) catálogo curado de áreas e processos-tipo para apoiar o mapeamento inicial (sem dados pessoais, inspirado em materiais de boas práticas de inventário LGPD); (2) na interface de mapeamento, painel de processos de referência pesquisável e filtrável por setor, copiando campos seguros para o formulário; (3) API em servidor que solicita rascunhos estruturados a um modelo de linguagem usando apenas metadados institucionais do programa (evitando enviar dados de titulares ou conteúdo identificável desnecessário), com validação das respostas contra listas fechadas de domínio já previstas no sistema; (4) pré-visualização editável e gravação somente após aceitação explícita do analista ou DPO; (5) avisos de que o output é sugestão e não substitui análise do encarregado. A evolução em curso prevê assistência para gerar operações de ROPA a partir de mapeamentos validados — privilegiando regras determinísticas e texto legal sempre revisável —, além de limites de taxa e instrumentos de observabilidade no servidor. Esses itens traduzem, em linguagem de produto, o plano funcional de IA para mapeamento e ROPA em desenvolvimento no repositório aberto."),
            pNoIndent(""),
            heading("5 CONSIDERAÇÕES SOBRE GOVERNANÇA, AUDITORIA E ACCOUNTABILITY", 2),
            p("O sistema implementa trilha de auditoria (logs de atividades) que registra ações dos usuários no programa — criação, alteração e exclusão de recursos — em conformidade com o Controle 8 do Framework e com exigências de rastreabilidade do art. 37 da LGPD. A trilha permite responder a perguntas como \"quem alterou este controle?\" e \"quando foi feita a última modificação?\", essenciais para accountability e para auditorias internas ou externas."),
            p("A abertura do código permite auditoria independente da implementação: qualquer organização ou pesquisador pode verificar as fórmulas de maturidade, o tratamento dos dados e se não há vulnerabilidades ocultas. Isso contribui para a transparência e a accountability na governança de dados, alinhando-se aos princípios de privacy by design e de demonstração de conformidade. Em um contexto em que órgãos de controle (como TCU e CGU) exigem evidências de adequação à LGPD e ao Framework PPSI, a possibilidade de auditar tanto os processos quanto a ferramenta que os suporta favorece a confiabilidade da solução."),
            pNoIndent(""),
            heading("CONCLUSÃO", 2),
            p("A implementação open source do Framework FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do Programa PPSI 2.0 com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema cobre diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, mapeamento de dados e demais fluxos de conformidade, trilha de auditoria e camada educativa com referências LGPD e referenciais internacionais, atendendo a necessidades de DPOs e gestores de segurança no setor público e privado."),
            p("A abertura do código permite que a comunidade contribua com melhorias e que organizações adaptem a ferramenta às suas realidades, reforçando o papel do software livre na promoção da privacidade e da segurança da informação. Em um cenário de intensificação da transformação digital e de exigências crescentes de compliance, implementações open source e auditáveis podem ampliar as opções disponíveis para adequação à LGPD e ao Framework PPSI."),
            p("Perspectivas de trabalho futuro incluem a consolidação da assistência por IA (sugestões de levantamento, geração assistida de operações de ROPA com validação e disclaimers), a ampliação dos módulos de gestão de direitos dos titulares, RIPD e gestão de incidentes, bem como a integração com sistemas de gestão documental e relatórios padronizados para órgãos de controle. Atualizações do Framework e da Ferramenta oficial exigirão acompanhamento contínuo para manter a paridade da implementação com o referencial publicado."),
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
                new TextRun({ text: "BRASIL. Lei n. 13.146, de 6 de julho de 2015. Lei Brasileira de Inclusão da Pessoa com Deficiência. ", ...textRunProps }),
                new TextRun({ text: "Diário Oficial da União", ...textRunProps, bold: true }),
                new TextRun({ text: ", Poder Executivo, Brasília, DF, 7 jul. 2015. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso em: 12 mar. 2026.", ...textRunProps }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "BRASIL. Lei n. 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). ", ...textRunProps }),
                new TextRun({ text: "Diário Oficial da União", ...textRunProps, bold: true }),
                new TextRun({ text: ", Poder Executivo, Brasília, DF, 15 ago. 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 12 mar. 2026.", ...textRunProps }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o Framework de Privacidade e Segurança da Informação. 30 mar. 2023. Disponível em: https://www.in.gov.br/en/web/dou/-/portaria-mgisp-n-671-de-30-de-marco-de-2023-477900728. Acesso em: 12 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "FPSI. Framework de Privacidade e Segurança da Informação. Código-fonte sob licença MIT. Disponível em: https://github.com/jorgepsendziuk/fpsi. Sistema hospedado em: https://fpsi.com.br (programa de demonstração). Acesso em: 12 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "GOVERNO FEDERAL. Ferramenta do Framework de Privacidade e Segurança da Informação. Planilha Excel. Disponível em: https://www.gov.br/mgi/pt-br/assuntos/seguranca-da-informacao/ferramenta-do-framework. Acesso em: 12 mar. 2026.", ...textRunProps })],
              alignment: AlignmentType.LEFT,
              spacing: { line: LINE_SPACING, lineRule: LineRuleType.AT_LEAST, before: 120, after: 0 },
              indent: { firstLine: 0 },
            }),
            new Paragraph({
              children: [new TextRun({ text: "PSENDZIUK, Jorge Felipe Roman. Documentação do projeto FPSI. Disponível em: https://github.com/jorgepsendziuk/fpsi. Acesso em: 12 mar. 2026.", ...textRunProps })],
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
