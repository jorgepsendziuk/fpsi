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
  Group as GroupIcon,
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
            Em março de 2023, o Ministério da Gestão e da Inovação em Serviços Públicos publicou a portaria que estabelece o <strong>Programa de Privacidade e Segurança da Informação (PPSI)</strong> e institui o <strong>Framework de Privacidade e Segurança da Informação (FPSI)</strong>, baseado em CIS, NIST e ISO/IEC. O documento traz <strong>31 controles</strong> de segurança e privacidade para repartições públicas e ferramentas de diagnóstico e melhoria. A <strong>ANPD</strong> utiliza essas diretrizes como referência; o setor privado também pode se beneficiar para processos de adequação.
          </Typography>
        </Paper>

        {/* Fluxo Governança ROPA e Maturidade */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold", mb: 2 }}>
            Fluxo: governança, ROPA e maturidade
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
              <Typography variant="body1" paragraph>
                O processo de governança em privacidade e segurança da informação segue um fluxo que parte do <strong>levantamento e governança</strong>, passa pelo <strong>ROPA</strong> (Registro de Operações de Tratamento de Dados Pessoais) e pelo <strong>diagnóstico de maturidade</strong>. Quando o diagnóstico indica <strong>risco alto</strong>, é elaborado o <strong>RIPD</strong> (Relatório de Impacto à Proteção de Dados). Em seguida vêm o <strong>plano de trabalho</strong>, a <strong>implementação</strong> das medidas e, por fim, a disponibilização de <strong>canal para titulares e ANPD</strong>.
              </Typography>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                maxWidth: { xs: "100%", md: 280 },
                "& img": { width: "100%", height: "auto", display: "block" },
              }}
            >
              <img
                src="/Governança ROPA Maturidade-2026-02-20-031018.png"
                alt="Fluxograma: Levantamento e governança, ROPA, Diagnóstico maturidade, Risco alto?, RIPD, Plano de trabalho, Implementação, Canal titulares e ANPD"
              />
            </Box>
          </Box>
        </Paper>

        {/* Ferramenta oficial */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <TableChartIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Ferramenta oficial (planilha Excel)
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            O framework é distribuído no site do Governo Federal em uma planilha Excel — <em>Ferramenta do Framework de Privacidade e Segurança da Informação</em>, ciclo 2 — com manual de implementação. A pasta de trabalho contém:
          </Typography>
          <List dense disablePadding>
            {[
              "CADASTROS: órgão, encarregados, gestores e responsáveis por departamento.",
              "CONTROLE 0: estruturação básica de gestão (questionário e medidas).",
              "CONTROLES 1 A 18: segurança da informação (medidas, justificativas, maturidade).",
              "CONTROLES 19 A 31: privacidade (medidas, justificativas, maturidade).",
              "RELATÓRIO DE TODOS OS CONTROLES: indicadores e nível de maturidade.",
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
            As soluções comerciais, além de custar caro, não seguem o padrão do Framework PPSI nem permitem alteração do código para adaptar à realidade da organização.
          </Typography>
        </Paper>

        {/* Proposta open source */}
        <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CodeIcon color="primary" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
              Proposta: implementação open source
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            Esta aplicação é uma <strong>implementação da Ferramenta do Framework do PPSI</strong> com tecnologias modernas e escaláveis, com o objetivo de ser um <strong>software de referência</strong> em privacidade e segurança da informação em <strong>modelo open source</strong>.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            A abertura do código permite:
          </Typography>
          <List dense disablePadding>
            {[
              "Colaboração da comunidade em novas versões do framework.",
              "Implantação em órgãos públicos, empresas e consultores independentes.",
              "Uso como base para PaaS (Privacy as a Service)."
            ].map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} color="primary" />
                </ListItemIcon>
                <ListItemText primary={item} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Divider sx={{ my: 4 }} />

        <Typography variant="caption" display="block" color="text.secondary">
          Referências: LGPD (Lei nº 13.709/2018), Portaria PPSI (Ministério da Gestão e da Inovação em Serviços Públicos), Ferramenta oficial do Framework (planilha Excel, ciclo 2), ANPD.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            startIcon={<ArrowBackIcon />}
          >
            Voltar à página inicial
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
