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
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  DarkModeOutlined,
  LightModeOutlined,
  ArrowBack as ArrowBackIcon,
  Gavel as GavelIcon,
  TableChart as TableChartIcon,
  Warning as WarningIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import LinkNext from "next/link";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { ColorModeContext } from "@contexts/color-mode";

export default function SobrePage() {
  const router = useRouter();
  const { mode, setMode } = useContext(ColorModeContext);

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <IconButton
            component={LinkNext}
            href="/"
            aria-label="Voltar"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Sobre o FPSI
          </Typography>
          <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 5, pb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Sobre o projeto
        </Typography>

        {/* Contexto regulatório */}
        <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <GavelIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Contexto regulatório
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            A <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>, sancionada em agosto de 2018 e em vigor desde setembro de 2020, estabelece diretrizes rigorosas para a coleta, armazenamento, tratamento e compartilhamento de dados pessoais. Inspirada no GDPR europeu, impõe obrigações às organizações que lidam com essas informações.
          </Typography>
          <Typography variant="body1" paragraph>
            Em março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou a portaria que institui o <strong>Programa de Privacidade e Segurança da Informação (PPSI)</strong> e o <strong>Framework de Privacidade e Segurança da Informação (FPSI)</strong>. O programa evoluiu para a linha <strong>PPSI 2.0</strong>, com <strong>Guia do Framework</strong> atualizado pela Secretaria de Governo Digital, alinhado ao <strong>CIS Controls v8</strong>, aos referenciais NIST e ISO/IEC e à LGPD. Na estrutura vigente do guia há <strong>27 controles</strong> (dois eixos no Controle 0 — estruturação e instrumentos; Controles 1 a 18 de segurança da informação; Controles 19 a 25 de privacidade) e <strong>210 medidas</strong> de avaliação no catálogo alinhado ao PPSI 2.0. A <strong>ANPD</strong> utiliza essas diretrizes como referência; o setor privado também pode adotá-las em processos de adequação.
          </Typography>
        </Paper>

        {/* Fluxo Governança ROPA e Maturidade */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            Governança, ROPA e maturidade: roteiro de referência
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "flex-start" },
              gap: 3,
            }}
          >
            <Box sx={{ flex: { md: "1 1 auto" }, minWidth: 0 }}>
              <Typography variant="body1" paragraph sx={{ mb: 1.5 }}>
                Na adequação, <strong>governança</strong>, <strong>inventário e ROPA</strong>, <strong>diagnóstico do programa</strong> (PPSI 2.0), <strong>RIPD</strong> quando couber, <strong>plano de ação</strong> e <strong>canais com titulares e ANPD</strong> trabalham em conjunto — muitas vezes em paralelo. A figura ao lado condensa isso em um <strong>encadeamento de referência</strong>, para comunicar com clareza a gestores e ao encarregado (DPO) como o <strong>Framework FPSI</strong> organiza a jornada.
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Etapas em foco
              </Typography>
              <List dense disablePadding sx={{ mb: 1.5 }}>
                {[
                  "Estrutura e governança: papéis, políticas e escopo do programa de privacidade e segurança da informação.",
                  "Mapeamento e ROPA: levantamento dos tratamentos e registro das operações quando aplicável (art. 37 da LGPD).",
                  "Diagnóstico de maturidade: avaliação dos controles e medidas do PPSI 2.0 para medir lacunas e priorizar melhorias.",
                  "RIPD (relatório de impacto à proteção de dados): exigido em hipóteses legais e regulamentares — por exemplo, quando a ANPD determinar ou quando normas complementares assim preverem (art. 38 da LGPD). O diagnóstico de maturidade ajuda a evidenciar riscos e gaps, mas não substitui o critério legal de cada caso.",
                  "Plano de trabalho e implementação: ações, prazos, responsáveis e medidas de segurança e governança.",
                  "Titulares e ANPD: canais para direitos dos titulares e comunicação com a autoridade são obrigações contínuas (ex.: papel do DPO, art. 41), não apenas um encerramento de fluxo.",
                ].map((item, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.35, alignItems: "flex-start" }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} color="action" />
                    </ListItemIcon>
                    <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                maxWidth: { xs: "100%", md: 280 },
                "& img": { width: "100%", height: "auto", display: "block" },
              }}
            >
              <Box component="figure" sx={{ m: 0 }}>
                <img
                  src="/Governança ROPA Maturidade-2026-02-20-031018.png"
                  alt="Fluxograma ilustrativo: levantamento e governança, ROPA, diagnóstico de maturidade, decisão de risco, RIPD, plano de trabalho, implementação, canal titulares e ANPD"
                />
                <Typography variant="caption" component="figcaption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                  Figura ilustrativa do projeto (não é documento oficial da ANPD nem do PPSI).
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Ferramenta oficial */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TableChartIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Materiais oficiais (Guia PPSI 2.0 e planilha)
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            O governo disponibiliza o <strong>Guia do Framework de Privacidade e Segurança da Informação (PPSI 2.0)</strong> e materiais em{" "}
            <Link href="https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/" target="_blank" rel="noopener noreferrer">
              gov.br/ppsi-2.0
            </Link>
            , incluindo orientações metodológicas e, em geral, a <strong>planilha Excel</strong> de apoio ao diagnóstico (<em>Ferramenta do Framework</em>), com manual. A organização típica da pasta de trabalho inclui:
          </Typography>
          <List dense disablePadding>
            {[
              "CADASTROS: órgão, encarregados, gestores e responsáveis por departamento.",
              "CONTROLE 0: estruturação básica para governança e instrumentos fundamentais (dois eixos no PPSI 2.0).",
              "CONTROLES 1 A 18: segurança da informação (medidas, justificativas, maturidade).",
              "CONTROLES 19 A 25: privacidade e LGPD (medidas, justificativas, maturidade).",
              "RELATÓRIO CONSOLIDADO: indicadores e nível de maturidade.",
              "PLANO DE TRABALHO: ações prioritárias, responsáveis, datas e status."
            ].map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} color="action" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Paper>


        {/* Problemas da planilha */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <WarningIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Limitações da planilha oficial
            </Typography>
          </Box>
          <List dense disablePadding>
            {[
              "Acessibilidade: interface de planilha com limitações.",
              "Trabalho distribuído: dados em um único arquivo no computador de um usuário.",
              "Disponibilidade: dependência de um arquivo local.",
              "Software proprietário: necessidade de Microsoft Office para edição com compatibilidade total."
            ].map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <WarningIcon sx={{ fontSize: 18 }} color="warning" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
            As soluções comerciais, além de custar caro, em geral não replicam o catálogo e a lógica do PPSI 2.0 nem permitem auditar ou adaptar o código à realidade da organização. A planilha oficial também tende a acompanhar o guia com algum descompasso de versão; convém conferir sempre o pacote publicado no site do programa.
          </Typography>
        </Paper>

        {/* Proposta open source */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Proposta: implementação open source (PPSI 2.0)
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            Esta aplicação é uma <strong>reimplementação web</strong> da lógica do <strong>Guia e catálogo PPSI 2.0</strong> (controles, medidas, maturidade e priorização alinhada ao CIS Controls v8 onde o guia assim prevê), com <strong>Next.js</strong>, <strong>React</strong> e <strong>Supabase</strong> — dados centralizados, multiusuário, trilha de auditoria e acesso por perfil. O objetivo é servir como <strong>software de referência open source</strong> complementar à planilha oficial, não substituto normativo do Guia ou dos atos do órgão gestor.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            O que a plataforma cobre hoje (além do diagnóstico)
          </Typography>
          <List dense disablePadding sx={{ mb: 2 }}>
            {[
              "Plano de trabalho (ações, responsáveis, prazos e acompanhamento).",
              "Políticas e modelos; responsabilidades por departamento/cargo.",
              "ROPA, RIPD e fluxos de conformidade LGPD (portal, pedidos de titulares, incidentes/reportes).",
              "Múltiplos programas/clientes com isolamento de dados; referência educativa aos artigos da LGPD na área logada.",
            ].map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Por que open source
          </Typography>
          <List dense disablePadding>
            {[
              "Transparência: fórmulas de maturidade e regras de negócio auditáveis por qualquer organização ou pesquisador.",
              "Evolução conjunta quando o Guia PPSI ou a planilha oficial forem atualizados — a comunidade pode propor patches alinhados ao novo catálogo.",
              "Implantação em órgãos públicos, empresas e consultoria, inclusive como base para ofertas tipo Privacy as a Service (PaaS).",
            ].map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} color="action" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Typography variant="caption" display="block" color="text.secondary" component="div">
          Referências: LGPD (Lei nº 13.709/2018); programa e Guia{" "}
          <Link href="https://www.gov.br/governodigital/pt-br/privacidade-e-seguranca/ppsi-2.0/" target="_blank" rel="noopener noreferrer" color="inherit" underline="hover">
            PPSI 2.0
          </Link>{" "}
          (MGI / Governo Digital); planilha oficial de apoio ao Framework; ANPD.
        </Typography>

        <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            startIcon={<ArrowBackIcon />}
          >
            Voltar à página inicial
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/artigo")}
          >
            Ver artigo para o livro Inovações Digitais
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
