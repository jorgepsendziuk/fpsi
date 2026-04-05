"use client";

import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Link,
} from "@mui/material";
import {
  DarkModeOutlined,
  LightModeOutlined,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import LinkNext from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { ColorModeContext } from "@contexts/color-mode";

const sumarioTexto =
  "Introdução. 1 Marco regulatório: LGPD, PPSI e o framework do programa. 1.1 Lei Geral de Proteção de Dados Pessoais (LGPD). 1.2 Programa de Privacidade e Segurança da Informação (PPSI) e o framework de privacidade e segurança da informação. 1.3 Ferramenta oficial do framework do PPSI. 2 Limitações da ferramenta oficial e demanda por alternativas. 3 Proposta: implementação open source (FPSI). 4 Funcionalidades e arquitetura do sistema. 4.1 Módulos principais. 4.2 Arquitetura técnica. 4.3 Multi-cliente. 4.4 Camada educativa, referências normativas e assistência por IA. 5 Considerações sobre governança, auditoria e accountability. Conclusão. Referências.";

export default function ArtigoPage() {
  const { mode, setMode } = useContext(ColorModeContext);
  const [exporting, setExporting] = useState(false);

  const handleExportWord = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/artigo/export-word", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao exportar");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Artigo FPSI - Inovacoes Digitais.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <IconButton component={LinkNext} href="/" aria-label="Voltar" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Artigo — Livro Inovações Digitais
          </Typography>
          <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5, pb: 8, "& .MuiTypography-body1": { textAlign: "justify" }, "& .MuiTypography-body2": { textAlign: "justify" } }}>
        {/* Folha de rosto */}
        <Paper variant="outlined" sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: "bold", textAlign: "center", textTransform: "uppercase", mb: 1 }}>
            Implementação open source do framework do Programa de Privacidade e Segurança da Informação (PPSI 2.0) com assistência por Inteligência Artificial integrada aos fluxos de conformidade
          </Typography>
          <Typography variant="h6" sx={{ textAlign: "center", fontStyle: "italic", textTransform: "uppercase", mb: 3 }}>
            OPEN-SOURCE IMPLEMENTATION OF THE BRAZILIAN PPSI 2.0 PROGRAM&apos;S PRIVACY AND INFORMATION SECURITY FRAMEWORK WITH INTEGRATED ARTIFICIAL INTELLIGENCE ASSISTANCE FOR COMPLIANCE WORKFLOWS
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right", mb: 2 }}>
            Jorge Felipe Roman Psendziuk
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Chamada para o livro &quot;Inovações Digitais: Governança Algorítmica, Privacidade e Segurança Pública&quot; — Eixo 2: Privacidade e Proteção de Dados
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: "text.primary" }}>
            Prazo de submissão: 10 de abril de 2026
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" display="block" sx={{ mb: 2, color: "text.primary" }}>
            Formatação conforme edital: Times New Roman 12, margens 2/3 cm, espaçamento 1,5, recuo 1,25 cm
          </Typography>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportWord} disabled={exporting}>
            {exporting ? "Gerando..." : "Exportar para Word (.docx)"}
          </Button>
        </Paper>

        {/* Sumário */}
        <Typography variant="body1" sx={{ mb: 4 }}>
          <Box component="span" sx={{ fontWeight: "bold" }}>SUMÁRIO:</Box> {sumarioTexto}
        </Typography>

        {/* Resumo e Abstract */}
        <Paper id="resumo" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="body1" paragraph>
            <Box component="span" sx={{ fontWeight: "bold" }}>RESUMO:</Box> A transformação digital e a LGPD impulsionaram ferramentas de governança em privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos instituiu o PPSI e o respectivo framework de privacidade e segurança da informação, com ferramenta oficial em Excel para diagnóstico de controles; a dependência de planilha limita acessibilidade, colaboração e interoperabilidade. O artigo apresenta o FPSI, implementação open source desse framework, alinhada ao PPSI 2.0 e à metodologia oficial vigente, com diagnóstico, plano de trabalho, políticas, ROPA, portal e pedidos de titulares, mapeamento de dados, auditoria e camada educativa (LGPD, CIS, NIST, ISO), além de assistência por IA a levantamentos e fluxo ao ROPA, com validação no servidor e revisão humana obrigatória.
          </Typography>
          <Typography variant="body1" paragraph>
            <Box component="span" sx={{ fontWeight: "bold" }}>Palavras-chave:</Box> LGPD; PPSI 2.0; software livre; inteligência artificial; privacidade e segurança da informação.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: "italic" }}>
            <Box component="span" sx={{ fontWeight: "bold", fontStyle: "normal" }}>ABSTRACT:</Box> Digital transformation and Brazil&apos;s LGPD have increased demand for privacy and information security tooling. In 2023, the Ministry of Management and Innovation established the PPSI and its privacy and information security framework, with an official Excel workbook; spreadsheet dependence limits accessibility, collaboration, and interoperability. This article presents FPSI, an open-source implementation of that framework, aligned with PPSI 2.0 and the current official methodology, covering maturity diagnosis, work plans, policies, ROPA, a privacy portal and data-subject requests, personal-data mapping, audit trail, an educational layer (LGPD, CIS, NIST, ISO), and AI-assisted mapping drafts with server-side validation and mandatory human review toward ROPA.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: "italic" }}>
            <Box component="span" sx={{ fontWeight: "bold", fontStyle: "normal" }}>Keywords:</Box> LGPD; PPSI 2.0; open-source software; artificial intelligence; privacy and information security.
          </Typography>
        </Paper>

        {/* INTRODUÇÃO */}
        <Paper id="introducao" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            Introdução
          </Typography>
          <Typography variant="body1" paragraph>
            No Brasil, a entrada em vigor da Lei Geral de Proteção de Dados Pessoais (LGPD) em setembro de 2020 consolidou exigências de adequação a organizações públicas e privadas (BRASIL, 2018), em linha com o GDPR na União Europeia: designação de DPO, mapeamento de operações e medidas técnicas e organizacionais adequadas ao risco, num contexto em que a digitalização de serviços tornou a privacidade e a segurança da informação eixo central de governança.
          </Typography>
          <Typography variant="body1" paragraph>
            Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos estabeleceu o Programa de Privacidade e Segurança da Informação (PPSI) e instituiu o framework de privacidade e segurança da informação previsto no programa, disponibilizando uma ferramenta oficial em planilha Excel para diagnóstico e acompanhamento de controles (BRASIL, 2023). A ferramenta oferece um roteiro metodológico alinhado aos principais referenciais internacionais de segurança e privacidade, permitindo que órgãos públicos avaliem seu nível de maturidade e elaborem planos de ação.
          </Typography>
          <Typography variant="body1" paragraph>
            Apesar da eficácia metodológica da ferramenta oficial na validação de medidas e no cálculo de níveis de maturidade, sua dependência de planilha eletrônica impõe limitações significativas em termos de acessibilidade, trabalho colaborativo e interoperabilidade. As soluções comerciais de gestão de privacidade, por sua vez, são pagas e, em geral, não seguem o padrão do framework do PPSI nem permitem adaptação do código à realidade de cada organização.
          </Typography>
          <Typography variant="body1" paragraph>
            Este artigo apresenta o FPSI — implementação open source do framework do PPSI desenvolvida com tecnologias web —, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. No PPSI 2.0, o framework de privacidade e segurança da informação organiza o catálogo de controles e medidas; o FPSI acompanha a ferramenta oficial vigente e esse catálogo, além de instrumentos do programa (mapeamento, ROPA, normas de referência, governança) e de uma trajetória de assistência por inteligência artificial para acelerar levantamentos, sempre sujeita a validação técnica e revisão humana. O trabalho está alinhado ao eixo temático de Privacidade e Proteção de Dados, abordando o impacto das legislações de proteção de dados (LGPD e correlatas), medidas de compliance digital e cultura organizacional voltada à privacidade.
          </Typography>
          <Typography variant="body1" paragraph>
            A seção 1 sintetiza LGPD, PPSI 2.0 e Ferramenta oficial; a seção 2, limitações da planilha e demanda por alternativas; a seção 3, a proposta open source; a seção 4, funcionalidades, arquitetura, camada educativa e IA; a seção 5, governança e auditoria; seguem conclusão e referências.
          </Typography>
        </Paper>

        {/* 1 Marco regulatório */}
        <Paper id="marco" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            1 Marco regulatório: LGPD, PPSI e o framework do programa
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            1.1 Lei Geral de Proteção de Dados Pessoais (LGPD)
          </Typography>
          <Typography variant="body1" paragraph>
            A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil (BRASIL, 2018), com inspiração no Regulamento Geral de Proteção de Dados (GDPR) da União Europeia e obrigações que incluem designação do Encarregado pelo Tratamento de Dados Pessoais (DPO), registro das operações de tratamento (ROPA, art. 37) e adoção de medidas de segurança técnicas e organizacionais adequadas ao risco, observados os princípios de finalidade, adequação, necessidade, livre acesso, qualidade dos dados, transparência, segurança, prevenção, não discriminação e responsabilização e prestação de contas. 
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            1.2 Programa de Privacidade e Segurança da Informação (PPSI) e seu framework
          </Typography>
          <Typography variant="body1" paragraph>
            Em 30 de março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui, na administração pública federal, o framework de privacidade e segurança da informação previsto no programa (BRASIL, 2023). A configuração atual do programa, referida como PPSI 2.0 para os órgãos integrantes do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP), foi regulada pela Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025, com entrada em vigor em 1º de janeiro de 2026 (BRASIL, 2025). Esse framework apoia-se em referenciais de privacidade e segurança como CIS (Center for Internet Security), NIST (National Institute of Standards and Technology) e ISO/IEC. 
            </Typography>
          <Typography variant="body1" paragraph>No catálogo metodológico do PPSI 2.0 vigente, dispõe-se de 27 controles em três diagnósticos complementares: o primeiro abrange a estruturação básica para governança (dois controles de base, identificados no guia pelo número 0); o segundo reúne os controles 1 a 18, com foco em segurança da informação e controles afins; o terceiro compreende os controles 19 a 25, voltados à privacidade e ao arcabouço da LGPD. O catálogo de medidas segue a Ferramenta oficial e a documentação publicada pelo órgão gestor; revisões podem alterar quantidade ou redação dos itens, de modo que soluções digitais devem acompanhar o material em vigor para preservar comparabilidade de maturidade e do plano de trabalho. No âmbito normativo do PPSI 2.0, o programa vincula os órgãos do SISP; o mesmo referencial permanece útil à ANPD e ao setor privado que adote o roteiro voluntariamente.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            1.3 Ferramenta oficial do framework do PPSI
          </Typography>
          <Typography variant="body1" paragraph>
            No PPSI 2.0, o órgão gestor disponibiliza ao público a <em>Ferramenta do Framework de Privacidade e Segurança da Informação</em> (denominação oficial da planilha) em Excel, com guia e manuais alinhados ao catálogo vigente. A estrutura da pasta de trabalho consolida o arranjo metodológico: cadastros; segmento de estruturação básica (dois controles de número 0); controles 1 a 18; controles 19 a 25; relatório consolidado; e plano de trabalho, permitindo registrar respostas às medidas, fatores de ponderação e consolidações para relatório.
          </Typography>
          <Typography variant="body1" paragraph>
            Na metodologia associada ao PPSI 2.0, a avaliação centra-se nos 27 controles e nas respectivas medidas de implementação; atribui-se a cada controle um Índice de Nível de Capacidade (INCC) em escala de 0 a 5, coerente com a leitura de efetividade daquele conjunto de práticas na Ferramenta. Consolida-se então o índice de maturidade iMC mediante a fórmula parametrizada na planilha oficial iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100), com enquadramento nos níveis Inicial, Básico, Intermediário, Em Aprimoramento e Aprimorado e derivação de ações prioritárias no plano de trabalho. O FPSI descrito nas seções seguintes visa convergir a essa metodologia e ao conteúdo funcional do referencial publicado pelo órgão gestor.
          </Typography>
        </Paper>

        {/* 2 Limitações */}
        <Paper id="limitacoes" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            2 Limitações da ferramenta oficial e demanda por alternativas
          </Typography>
          <Typography variant="body1" paragraph>
            A ferramenta oficial, em Excel, impõe limites estruturais: dificulta acessibilidade (leitores de tela e LBI, Lei nº 13.146/2015) (BRASIL, 2015), trabalho colaborativo e controle de versão (arquivo local, risco de perda ou conflitos, proliferação de cópias em trabalho remoto), além de dependência de suíte proprietária e custos de licença. Soluções comerciais de governança em privacidade costumam ser pagas, não seguem o padrão do framework do PPSI nem permitem auditar ou adaptar o código. Daí a demanda por alternativa web, colaborativa e open source alinhada ao mesmo roteiro metodológico.
          </Typography>
        </Paper>

        {/* 3 Proposta */}
        <Paper id="proposta" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            3 Proposta: implementação open source
          </Typography>
          <Typography variant="body1" paragraph>
            Propõe-se o FPSI, implementação web espelhando a ferramenta oficial de apoio ao framework do PPSI, em modelo open source, favorecendo colaboração, acesso multiplataforma e implantação em nuvem ou on-premises.
          </Typography>
          <Typography variant="body1" paragraph>
            A justificativa da abertura do código inclui: (1) Colaboração da comunidade — permitir que a comunidade contribua com evoluções no referencial do PPSI e no software FPSI; (2) Implantação ampla — facilitar a implantação em órgãos públicos, empresas e consultores independentes, sem custo de licença; (3) PaaS (Privacy as a Service) — permitir que plataformas ofereçam o serviço hospedado, mantendo a possibilidade de auditoria do código; (4) Adaptabilidade — garantir que organizações possam adaptar o código à sua realidade, customizando fluxos, campos ou integrações. O código é distribuído sob licença MIT e está disponível em <Link href="https://github.com/jorgepsendziuk/fpsi" target="_blank" rel="noopener noreferrer">github.com/jorgepsendziuk/fpsi</Link>. O sistema está hospedado em <Link href="https://fpsi.com.br" target="_blank" rel="noopener noreferrer">fpsi.com.br</Link>, com um programa de demonstração disponível para visualização do funcionamento.
          </Typography>
        </Paper>

        {/* 4 Funcionalidades */}
        <Paper id="funcionalidades" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            4 Funcionalidades e arquitetura do sistema
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            4.1 Módulos principais
          </Typography>
          <Typography variant="body1" paragraph>
            A implementação cobre os seguintes módulos, alinhados ao referencial oficial do framework do PPSI e ao Programa PPSI 2.0: diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, conformidade LGPD (incluindo mapeamento de dados pessoais com listas de domínio compatíveis com o inventário, normas e documentos de referência por programa e vínculo entre levantamentos e operações de tratamento quando aplicável), responsáveis, governança de papéis e auditoria.
          </Typography>
          <Box sx={{ mb: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", "& img": { display: "block", maxWidth: "100%", height: "auto" } }}>
            <Image src="/artigo/Painel.jpg" alt="Painel da plataforma FPSI — módulos do sistema e estrutura de tratamento" width={1200} height={800} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 1. Painel do programa com módulos do sistema e estrutura de tratamento (controlador, operador).
          </Typography>
          <Typography variant="body1" paragraph>
            Diagnóstico de maturidade: árvore diagnóstico–controle–medida, INCC 0 a 5, dashboard e 27 controles alinhados ao PPSI 2.0; consulta contextual a LGPD e referenciais (ex.: CIS) nas medidas; índice iMC conforme §1.3.
          </Typography>
          <Box sx={{ mb: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", "& img": { display: "block", maxWidth: "100%", height: "auto" } }}>
            <Image src="/artigo/Diagnóstico.jpg" alt="Interface do módulo de diagnóstico: árvore de controles e detalhamento de medida" width={1200} height={800} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 2. Módulo de diagnóstico: árvore de controles e detalhamento de medida com resposta e plano de trabalho.
          </Typography>
          <Typography variant="body1" paragraph>
            Plano de trabalho (ações, responsáveis, prazos, riscos, vínculo a controles); políticas (editor WYSIWYG, modelos, PDF, versionamento); ROPA (art. 37 LGPD, categorias, titulares, retenção, exportação); portal por programa (art. 18 LGPD, direitos dos titulares, contato); pedidos e fila de atendimento; responsáveis e papéis; auditoria (Controle 8, art. 37 LGPD). A Figura 3 exemplifica o portal de titulares.
          </Typography>
          <Box sx={{ mb: 2, border: "1px solid", borderColor: "divider", overflow: "hidden", "& img": { display: "block", maxWidth: "100%", height: "auto" } }}>
            <Image src="/artigo/Portal.jpg" alt="Portal de privacidade para titulares: requisição de direitos" width={1200} height={800} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 3. Portal de privacidade para titulares: requisição de direitos e acompanhamento de pedidos.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            4.2 Arquitetura técnica
          </Typography>
          <Typography variant="body1" paragraph>
            A solução adota arquitetura em camadas (cliente e servidor), com autenticação de usuários, persistência em banco relacional e APIs, podendo ser implantada em nuvem ou on-premises.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            4.3 Multi-cliente
          </Typography>
          <Typography variant="body1" paragraph>
            O conceito de &quot;programa&quot; permite que um consultor gerencie vários clientes na mesma ferramenta, com isolamento de dados por programa e permissões configuráveis por usuário. Cada programa possui seu próprio diagnóstico, plano de trabalho, ROPA e políticas.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            4.4 Camada educativa, referências normativas e assistência por IA
          </Typography>
          <Typography variant="body1" paragraph>
            A implementação mantém coerência com a metodologia da Ferramenta oficial (controles, medidas, pesos e fórmulas de maturidade publicados pelo governo), acompanhando atualizações do catálogo quando divulgadas, de modo a preservar comparabilidade com o referencial de apoio ao programa.
          </Typography>
          <Typography variant="body1" paragraph>
            O diferencial educativo consiste em integrar o diagnóstico e a conformidade a uma trilha de referências: dispositivos da LGPD, fundamentos do próprio programa e de seu framework e encadeamento com referenciais internacionais citados na base normativa do PPSI (como CIS, NIST e ISO/IEC), de modo que o usuário navegue da medida ou do levantamento ao texto normativo ou guia que a justifica — sem substituir parecer jurídico, mas reduzindo fricção na capacitação das equipes.
          </Typography>
          <Typography variant="body1" paragraph>
            No mapeamento de dados (inventário LGPD), o sistema oferece um painel de processos de referência, com tipologia de setores e finalidades, que o analista consulta e copia para o formulário de levantamento, acelerando o preenchimento sem substituir o juízo de negócio. A função &quot;Sugerir levantamentos com IA&quot; chama, no servidor, um modelo de linguagem que recebe apenas metadados institucionais do programa e da organização (nome, escopo, atividade) — não envia dados pessoais de titulares — e devolve rascunhos em formato estruturado. Cada sugestão é validada e saneada contra as mesmas listas fechadas do inventário (setor, finalidade, meios de armazenamento, categorias de dados, titular, transferência internacional, entre outras), garantindo que só valores admitidos pelo modelo de registro entram na base; o usuário pré-visualiza, seleciona as linhas aceitas e grava-as como novos levantamentos, com aviso explícito de que o output é assistência operacional, não parecer jurídico. A API aplica limite de taxa por utilizador e programa. A evolução prevista é reutilizar o mesmo desenho para apoiar a redação de operações de ROPA a partir de levantamentos já validados.
          </Typography>
        </Paper>

        {/* 5 Governança */}
        <Paper id="governanca" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            5 Considerações sobre governança, auditoria e accountability
          </Typography>
          <Typography variant="body1" paragraph>
            O FPSI inclui módulo de auditoria por programa, com listagem paginada e filtros por período, usuário, tipo de ação e tipo de recurso, para reconstituir quem alterou o quê e quando ao longo do ciclo de conformidade. As operações relevantes na aplicação autenticada geram registros com a ação (criação, alteração, exclusão e, conforme o fluxo, visualização, aprovação, rejeição, convite, exportação, restauração, envio ou download de arquivos, entre outras), o recurso afetado — por exemplo respostas a medidas e níveis de controle no diagnóstico, planos de ação, políticas e relatórios, levantamentos de mapeamento de dados, operações e cabeçalho de ROPA, versões congeladas do ROPA (snapshot para histórico), pedidos de titulares, RIPD, incidentes, governança LGPD e dados cadastrais ligados ao programa —, identificador interno, programa e usuário. Nas APIs, quando aplicável, guardam-se ainda endereço IP e agente de usuário; ações originadas no portal público dos titulares podem ficar registradas com origem distinta e sem usuário de backoffice. O desenho procura não persistir dados pessoais sensíveis dos titulares no campo de detalhes da trilha, alinhado à minimização e à finalidade probatória do registro.
          </Typography>
          <Typography variant="body1" paragraph>
            Em conjunto, a trilha sustenta a demonstração de responsabilização e de registro de operações prevista no art. 37 da LGPD e o alinhamento ao Controle 8 do framework (gestão de registros de auditoria). O código aberto permite, adicionalmente, rever a lógica de auditoria e as fórmulas de maturidade implementadas no software, reforçando accountability perante órgãos de controle e a comunidade técnica.
          </Typography>
        </Paper>

        {/* Conclusão */}
        <Paper id="conclusao" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            Conclusão
          </Typography>
          <Typography variant="body1" paragraph>
            O FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do Programa PPSI 2.0 com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema cobre diagnóstico de maturidade, plano de trabalho, políticas, ROPA, portal de privacidade, pedidos dos titulares, mapeamento de dados e demais fluxos de conformidade, trilha de auditoria e camada educativa com referências LGPD e a referenciais internacionais, atendendo a necessidades de DPOs e gestores de segurança no setor público e privado.
          </Typography>
          <Typography variant="body1" paragraph>
            O código aberto amplia opções de adequação à LGPD e ao framework do PPSI. Perspectivas: consolidar IA em levantamentos e ROPA, ampliar direitos de titulares, RIPD e incidentes, integrar gestão documental e relatórios para controle; acompanhar atualizações da Ferramenta oficial para manter paridade metodológica.
          </Typography>
        </Paper>

        {/* Referências */}
        <Paper id="referencias" variant="outlined" sx={{ p: 3, mb: 4, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            REFERÊNCIAS
          </Typography>
          <Typography variant="body2" component="div" sx={{ "& p": { mb: 1.5 }, textAlign: "left" }}>
            <p>ANPD — Autoridade Nacional de Proteção de Dados. Disponível em: https://www.gov.br/anpd. Acesso em: 12 mar. 2026.</p>
            <p>BRASIL. Lei n. 13.146, de 6 de julho de 2015. Lei Brasileira de Inclusão da Pessoa com Deficiência. Diário Oficial da União, Poder Executivo, Brasília, DF, 7 jul. 2015. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso em: 12 mar. 2026.</p>
            <p>BRASIL. Lei n. 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD). Diário Oficial da União, Poder Executivo, Brasília, DF, 15 ago. 2018. Disponível em: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 12 mar. 2026.</p>
            <p>BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o framework de privacidade e segurança da informação. 30 mar. 2023. Disponível em: https://www.in.gov.br/en/web/dou/-/portaria-mgisp-n-671-de-30-de-marco-de-2023-477900728. Acesso em: 31 mar. 2026.</p>
            <p>BRASIL. Ministério da Gestão e da Inovação em Serviços Públicos. Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025. Institui o Programa de Privacidade e Segurança da Informação na forma do PPSI 2.0 no âmbito dos órgãos do SISP. Disponível em: https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0. Acesso em: 31 mar. 2026.</p>
            <p>FPSI. Plataforma de software livre em apoio ao framework do Programa de Privacidade e Segurança da Informação (PPSI). Código-fonte sob licença MIT. Disponível em: https://github.com/jorgepsendziuk/fpsi. Sistema hospedado em: https://fpsi.com.br (programa de demonstração). Acesso em: 31 mar. 2026.</p>
            <p>GOVERNO FEDERAL. Ferramenta do Framework de Privacidade e Segurança da Informação. Planilha Excel e documentação de apoio (PPSI 2.0). Disponível em: https://www.gov.br/mgi/pt-br/assuntos/seguranca-da-informacao/ferramenta-do-framework. Acesso em: 31 mar. 2026.</p>
          </Typography>
        </Paper>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="outlined" onClick={handleExportWord} startIcon={<DownloadIcon />} disabled={exporting}>
            {exporting ? "Gerando..." : "Exportar para Word"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
