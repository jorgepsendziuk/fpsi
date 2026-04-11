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
  "Introdução. 1 Marco regulatório: LGPD, PPSI e o framework do programa. 1.1 Lei Geral de Proteção de Dados Pessoais (LGPD). 1.2 Programa de Privacidade e Segurança da Informação (PPSI) e o framework de privacidade e segurança da informação. 1.3 Ferramenta oficial do framework do PPSI. 2 Limitações da ferramenta oficial e demanda por alternativas. 3 Proposta: implementação open source (FPSI). 4 Funcionalidades e arquitetura do sistema. 4.1 Módulos principais. 4.2 Arquitetura técnica. 4.3 Multi-cliente. 4.4 Integração de referências normativas e assistência por IA. 5 Considerações sobre governança, auditoria e accountability. Conclusão. Referências.";

/** Borda preta fina nas figuras do artigo (alinhada ao contorno no Word) */
const artigoFiguraBoxSx = {
  mb: 2,
  border: "1px solid #000",
  overflow: "hidden",
  lineHeight: 0,
  "& img": { display: "block", maxWidth: "100%", height: "auto" },
} as const;

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
            <Box component="span" sx={{ fontWeight: "bold" }}>RESUMO:</Box> A transformação digital e a LGPD impulsionaram ferramentas de governança em privacidade e segurança da informação. Em 2023, o Ministério da Gestão e da Inovação em Serviços Públicos instituiu o PPSI e o respectivo framework, com ferramenta oficial em Excel; a dependência de planilha limita acessibilidade, colaboração e interoperabilidade. O artigo apresenta o FPSI, implementação open source alinhada ao PPSI 2.0, cobrindo diagnóstico, plano de trabalho, políticas, registro das operações de tratamento, portal e pedidos de titulares (art. 18 LGPD), mapeamento, auditoria e referências normativas integradas (LGPD, CIS, NIST, ISO), além de assistência por IA a levantamentos e vínculo com esse registro, com validação no servidor e revisão humana obrigatória.
          </Typography>
          <Typography variant="body1" paragraph>
            <Box component="span" sx={{ fontWeight: "bold" }}>Palavras-chave:</Box> LGPD; PPSI 2.0; software livre; inteligência artificial; privacidade e segurança da informação.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontStyle: "italic" }}>
            <Box component="span" sx={{ fontWeight: "bold", fontStyle: "normal" }}>ABSTRACT:</Box> Digital transformation and Brazil&apos;s LGPD have spurred privacy and information security governance tools. In 2023, the Ministry established the PPSI and its framework, with an official Excel workbook; spreadsheet limits motivate FPSI — an open-source implementation aligned with PPSI 2.0, covering diagnosis, work plans, policies, the record of processing activities, a privacy portal and data-subject requests (Art. 18 LGPD), mapping, audit trail, integrated references (LGPD, CIS, NIST, ISO), and AI-assisted mapping with server-side validation, mandatory human review, and alignment to that record.
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
            Este artigo apresenta o FPSI — implementação open source do framework do PPSI desenvolvida com tecnologias web —, que aborda as limitações identificadas e permite implantação sem custo de licença e adaptação para órgãos públicos, empresas e consultores. No PPSI 2.0, o framework de privacidade e segurança da informação organiza o catálogo de controles e medidas; o FPSI acompanha a ferramenta oficial vigente e esse catálogo, além de instrumentos do programa (mapeamento, registro das operações de tratamento, normas de referência, governança) e de uma trajetória de assistência por inteligência artificial para acelerar levantamentos, sempre sujeita a validação técnica e revisão humana. O trabalho está alinhado ao eixo temático de Privacidade e Proteção de Dados, abordando o impacto das legislações de proteção de dados (LGPD e correlatas), medidas de compliance digital e cultura organizacional voltada à privacidade.
          </Typography>
          <Typography variant="body1" paragraph>
            A seguir, a seção 1 sintetiza LGPD, PPSI e Ferramenta oficial; as seções 2 e 3 tratam limitações da planilha e da proposta open source; a seção 4 descreve funcionalidades, arquitetura e IA; a seção 5 aborda governança e auditoria; encerram-se conclusão e referências.
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
            A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes para o tratamento de dados pessoais no Brasil (BRASIL, 2018), com inspiração no GDPR e obrigações que incluem designação do Encarregado (DPO), registro das operações de tratamento e medidas de segurança adequadas ao risco, observados os princípios do art. 6º. O controlador deve manter o registro com informações sobre finalidade, base legal, titulares, categorias, compartilhamentos, segurança e retenção; o art. 41 institui o DPO como canal com titulares e ANPD, com atribuições compatíveis com orientação interna e apoio a RIPD quando aplicável, podendo o encargo ser exercido por pessoa interna ou externa.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            1.2 Programa de Privacidade e Segurança da Informação (PPSI) e seu framework
          </Typography>
          <Typography variant="body1" paragraph>
            Em 30 de março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou portaria que estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui, na administração pública federal, o framework de privacidade e segurança da informação previsto no programa (BRASIL, 2023). A configuração atual do programa, referida como PPSI 2.0 para os órgãos integrantes do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP), foi regulada pela Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025, com entrada em vigor em 1º de janeiro de 2026 (BRASIL, 2025). Esse framework apoia-se em referenciais de privacidade e segurança como CIS (Center for Internet Security), NIST (National Institute of Standards and Technology) e ISO/IEC.
          </Typography>
          <Typography variant="body1" paragraph>
            No catálogo metodológico vigente há 27 controles em três diagnósticos: estruturação básica (dois controles 0), controles 1 a 18 (segurança da informação) e 19 a 25 (privacidade e LGPD). O catálogo segue a Ferramenta oficial; atualizações do órgão gestor devem ser espelhadas em software para preservar comparabilidade de maturidade e de plano de trabalho. No âmbito normativo, o PPSI 2.0 vincula os órgãos do SISP e permanece referência útil à ANPD e ao setor privado em adoção voluntária.
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
            A justificativa da abertura inclui: (1) colaboração em evoluções do referencial PPSI e do FPSI; (2) implantação em órgãos, empresas e consultores sem custo de licença; (3) oferta hospedada com código auditável (PaaS); (4) adaptação de fluxos e integrações. Licença MIT: <Link href="https://github.com/jorgepsendziuk/fpsi" target="_blank" rel="noopener noreferrer">github.com/jorgepsendziuk/fpsi</Link>. Demonstração em <Link href="https://fpsi.com.br" target="_blank" rel="noopener noreferrer">fpsi.com.br</Link>.
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
            A implementação cobre os seguintes módulos, alinhados ao referencial oficial do framework do PPSI e ao Programa PPSI 2.0: diagnóstico de maturidade, plano de trabalho, políticas, registro das operações de tratamento, portal de privacidade, pedidos dos titulares, conformidade LGPD (incluindo mapeamento de dados pessoais com listas de domínio compatíveis com o inventário, normas e documentos de referência por programa e vínculo entre levantamentos e operações de tratamento quando aplicável), responsáveis, governança de papéis e auditoria.
          </Typography>
          <Typography variant="body1" paragraph>
            A Figura 1 apresenta o painel principal do programa na interface web: nele concentram-se os acessos a esses módulos e a indicação da estrutura de tratamento de dados (controlador e operador), servindo de mapa antes do detalhamento funcional nas figuras seguintes.
          </Typography>
          <Box sx={artigoFiguraBoxSx}>
            <Image src="/artigo/Painel.jpg" alt="Painel da plataforma FPSI — módulos do sistema e estrutura de tratamento" width={2976} height={2398} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 1. Painel do programa com módulos do sistema e estrutura de tratamento (controlador, operador).
          </Typography>
          <Typography variant="body1" paragraph>
            O núcleo metodológico materializa-se no diagnóstico de maturidade. A interface dispõe uma árvore que articula diagnóstico, controle e medida, coerente com os 27 controles do PPSI 2.0 e com o painel de acompanhamento: em cada medida o usuário atribui um Índice de Nível de Capacidade (INCC), em escala de 0 a 5; no agregado, o índice iMC e o dashboard consolidam o posicionamento da organização segundo as mesmas fórmulas e pesos da Ferramenta oficial tratados no §1.3, o que mantém comparabilidade com o referencial em planilha.
          </Typography>
          <Typography variant="body1" paragraph>
            No detalhe da medida, além da resposta propriamente dita, abrem-se atalhos para trechos de apoio à LGPD e para guias externos citados no framework (por exemplo, CIS), de modo que a avaliação não fique desconectada da base normativa. Quando cabível, ações são encadeadas ao plano de trabalho sem quebrar o fluxo de leitura — ponte entre a nota de maturidade e a execução. A Figura 2 ilustra esse percurso: à esquerda, a árvore de controles; à direita, a medida selecionada com resposta, INCC e vínculos ao plano de trabalho.
          </Typography>
          <Box sx={artigoFiguraBoxSx}>
            <Image src="/artigo/Diagnóstico.jpg" alt="Interface do módulo de diagnóstico: árvore de controles e detalhamento de medida" width={2722} height={2682} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 2. Módulo de diagnóstico: árvore de controles e detalhamento de medida com resposta e plano de trabalho.
          </Typography>
          <Typography variant="body1" paragraph>
            Fechado o ciclo de leitura e registro da maturidade no diagnóstico, o mesmo programa concentra as demais frentes do roteiro — execução documentada, conformidade operacional e canal com titulares — sem exigir troca de ferramenta.
          </Typography>
          <Typography variant="body1" paragraph>
            O plano de trabalho e as políticas ocupam o eixo seguinte: o primeiro organiza ações com responsáveis, prazos, avaliação de riscos e vínculo explícito aos controles já respondidos, de modo que o avanço da maturidade deixe rastro executável e auditável; o segundo oferece editor WYSIWYG, modelos reutilizáveis, exportação em PDF e versionamento, evitando que normas internas fiquem dispersas em arquivos estáticos.
          </Typography>
          <Typography variant="body1" paragraph>
            O registro das operações de tratamento consolida, por programa, categorias de dados envolvidos, titulares, critérios de retenção e rotinas de exportação para relatório ou fiscalização — fechando o elo entre o inventário e a demonstração de conformidade. Em paralelo, o portal de privacidade configurável por programa expõe ao titular canal de contato e fluxos para exercício de direitos; o backoffice mantém fila de pedidos, estados e responsáveis pelo atendimento. Cadastros de responsáveis e governança de papéis sustentam a distribuição de encargos; o módulo de auditoria, alinhado ao Controle 8 do framework, registra eventos relevantes na aplicação. A Figura 3 exemplifica a interface voltada ao titular nesse portal.
          </Typography>
          <Box sx={artigoFiguraBoxSx}>
            <Image src="/artigo/Portal.jpg" alt="Portal de privacidade para titulares: requisição de direitos" width={2492} height={2440} style={{ width: "100%", height: "auto" }} />
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
            O conceito de &quot;programa&quot; permite que um consultor gerencie vários clientes na mesma ferramenta, com isolamento de dados por programa e permissões configuráveis por usuário. Cada programa possui seu próprio diagnóstico, plano de trabalho, registro das operações de tratamento e políticas.
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
            4.4 Integração de referências normativas e assistência por IA
          </Typography>
          <Typography variant="body1" paragraph>
            A implementação mantém coerência com a metodologia da Ferramenta oficial (controles, medidas, pesos e fórmulas de maturidade publicados pelo governo), acompanhando atualizações do catálogo quando divulgadas, de modo a preservar comparabilidade com o referencial de apoio ao programa.
          </Typography>
          <Typography variant="body1" paragraph>
            A integração normativa consiste em vincular o diagnóstico e a conformidade a uma trilha de referências: dispositivos da LGPD, fundamentos do próprio programa e de seu framework e encadeamento com referenciais internacionais citados na base normativa do PPSI (como CIS, NIST e ISO/IEC), de modo que o usuário navegue da medida ou do levantamento ao texto normativo ou guia que a justifica — sem substituir parecer jurídico, mas reduzindo fricção na capacitação das equipes.
          </Typography>
          <Typography variant="body1" paragraph>
            A Lei nº 13.709/2018 encontra-se disponível no sistema com artigos indexados para consulta integral (referência alinhada ao texto compilado no Planalto). No diagnóstico, as normas de referência associadas a cada medida exibem atalhos: ao acionar uma citação à LGPD, abre-se caixa de diálogo com o texto do artigo mapeado, evitando troca de contexto a cada dúvida pontual; outras referências externas podem seguir para o site oficial em nova aba, conforme o mapeamento. A Figura 4 combina a tela do módulo de consulta à lei e um exemplo de popup acionado a partir da seção de normas da medida.
          </Typography>
          <Box sx={artigoFiguraBoxSx}>
            <Image src="/artigo/LGPD.jpg" alt="Módulo LGPD com artigos indexados e janela contextual com texto do artigo a partir da medida no diagnóstico" width={2478} height={2224} style={{ width: "100%", height: "auto" }} />
          </Box>
          <Typography variant="caption" display="block" sx={{ mb: 2, fontStyle: "italic", color: "text.primary" }}>
            Figura 4. Consulta à LGPD: texto integral por artigos e exemplo de janela contextual a partir das normas de referência na medida do diagnóstico.
          </Typography>
          <Typography variant="body1" paragraph>
            No mapeamento de dados (inventário LGPD), o painel de processos de referência oferece tipologia de setores e finalidades para o analista consultar e copiar ao formulário, acelerando o preenchimento sem substituir o juízo de negócio.
          </Typography>
          <Typography variant="body1" paragraph>
            A função &quot;Sugerir levantamentos com IA&quot; chama, no servidor, um modelo de linguagem alimentado apenas com metadados institucionais do programa e da organização (nome, escopo, atividade) — não envia dados pessoais de titulares — e devolve rascunhos em formato estruturado. Cada sugestão é validada contra as listas fechadas do inventário (setor, finalidade, meios de armazenamento, categorias de dados, titular, transferência internacional, entre outras); o usuário pré-visualiza, seleciona as linhas aceitas e grava com aviso de que o output é assistência operacional, não parecer jurídico. A API aplica limite de taxa por utilizador e programa. A evolução prevista é reutilizar esse desenho para apoiar a redação das operações no registro a partir de levantamentos já validados.
          </Typography>
        </Paper>

        {/* 5 Governança */}
        <Paper id="governanca" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            5 Considerações sobre governança, auditoria e accountability
          </Typography>
          <Typography variant="body1" paragraph>
            O FPSI oferece auditoria por programa, com listagem paginada e filtros por período, usuário, tipo de ação e tipo de recurso. As operações relevantes na aplicação autenticada geram registros com a ação (criação, alteração, exclusão e, conforme o fluxo, visualização, convite, exportação, download de arquivos, entre outras) e o recurso afetado — por exemplo respostas ao diagnóstico, planos de ação, políticas, levantamentos, operações de tratamento e snapshots do registro, pedidos de titulares, RIPD e incidentes —, além de identificadores, programa e usuário; nas APIs, quando couber, IP e agente. Pedidos pelo portal público podem ter trilha distinta. O desenho evita persistir dados sensíveis de titulares no detalhe da trilha, em linha com minimização e finalidade probatória.
          </Typography>
          <Typography variant="body1" paragraph>
            Em conjunto, a trilha sustenta a demonstração de responsabilização e de registro de operações prevista na LGPD e o alinhamento ao Controle 8 do framework (gestão de registros de auditoria). O código aberto permite, adicionalmente, rever a lógica de auditoria e as fórmulas de maturidade implementadas no software, reforçando accountability perante órgãos de controle e a comunidade técnica.
          </Typography>
        </Paper>

        {/* Conclusão */}
        <Paper id="conclusao" variant="outlined" sx={{ p: 3, mb: 3, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2, textTransform: "uppercase" }}>
            Conclusão
          </Typography>
          <Typography variant="body1" paragraph>
            O FPSI oferece uma alternativa à ferramenta oficial em Excel, combinando o roteiro metodológico do Programa PPSI 2.0 com trabalho colaborativo, independência de software proprietário e adaptabilidade. O sistema cobre diagnóstico de maturidade, plano de trabalho, políticas, registro das operações de tratamento, portal de privacidade, pedidos dos titulares, mapeamento de dados e demais fluxos de conformidade, trilha de auditoria e referências normativas integradas à LGPD e a referenciais internacionais, atendendo a necessidades de DPOs e gestores de segurança no setor público e privado.
          </Typography>
          <Typography variant="body1" paragraph>
            Em perspectiva, consolidar IA nos levantamentos e no registro das operações de tratamento, ampliar direitos de titulares, RIPD e incidentes, integrar gestão documental e relatórios para controle e acompanhar atualizações da Ferramenta oficial para manter paridade metodológica.
          </Typography>
        </Paper>

        {/* Referências */}
        <Paper id="referencias" variant="outlined" sx={{ p: 3, mb: 4, scrollMarginTop: 80 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            REFERÊNCIAS
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              textAlign: "justify",
              "& p": {
                mb: 1.5,
                pl: "1.25rem",
                textIndent: "-1.25rem",
                "& em": { fontStyle: "italic", fontFamily: "inherit" },
              },
            }}
          >
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Autoridade Nacional de Proteção de Dados. Site institucional. Disponível em: https://www.gov.br/anpd. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Lei nº 13.146, de 6 de julho de 2015. Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência. <em>Diário Oficial da União</em>, Poder Executivo, Brasília, DF, 7 jul. 2015. Disponível em:{" "}
              https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Lei nº 13.709, de 14 de agosto de 2018. Institui a Lei Geral de Proteção de Dados Pessoais. <em>Diário Oficial da União</em>, Poder Executivo, Brasília, DF, 15 ago. 2018. Disponível em:{" "}
              https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Ministério da Gestão e da Inovação em Serviços Públicos. Ferramenta do Framework de Privacidade e Segurança da Informação [recurso eletrônico]. Planilha Microsoft Excel e documentação de apoio ao PPSI 2.0. Disponível em:{" "}
              https://www.gov.br/mgi/pt-br/assuntos/seguranca-da-informacao/ferramenta-do-framework. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Ministério da Gestão e da Inovação em Serviços Públicos. Portaria MGISP nº 671, de 30 de março de 2023. Estabelece o Programa de Privacidade e Segurança da Informação (PPSI) e institui o framework de privacidade e segurança da informação. <em>Diário Oficial da União</em>, Brasília, DF, 31 mar. 2023. Disponível em:{" "}
              https://www.in.gov.br/en/web/dou/-/portaria-mgisp-n-671-de-30-de-marco-de-2023-477900728. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>BRASIL.</Box> Ministério da Gestão e da Inovação em Serviços Públicos. Portaria SGD/MGI nº 9.511, de 28 de outubro de 2025. Institui o Programa de Privacidade e Segurança da Informação na forma do PPSI 2.0 no âmbito dos órgãos do Sistema de Administração dos Recursos de Tecnologia da Informação (SISP). Disponível em:{" "}
              https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0. Acesso em: 31 mar. 2026.
            </p>
            <p>
              <Box component="strong" sx={{ fontWeight: 700 }}>FPSI.</Box> Plataforma de software livre em apoio ao framework do Programa de Privacidade e Segurança da Informação (PPSI) [recurso eletrônico]. Distribuição sob licença MIT. Disponível em: https://github.com/jorgepsendziuk/fpsi. Informações complementares e ambiente de demonstração: https://fpsi.com.br. Acesso em: 31 mar. 2026.
            </p>
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
