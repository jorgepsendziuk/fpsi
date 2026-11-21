"use client";

import React from "react";
import { Box, Paper, Stack, Typography, alpha } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

const GLOSSARIO_PRIVACIDADE: { termo: string; definicao: string }[] = [
  { termo: "Titular", definicao: "Pessoa a quem os dados se referem." },
  { termo: "Dado pessoal", definicao: "Informação que identifica ou pode identificar uma pessoa." },
  {
    termo: "Dado sensível",
    definicao:
      "Origem racial, saúde, religião, opinião política, biométricos etc. — proteção reforçada (art. 11).",
  },
  { termo: "Controlador", definicao: "Quem define finalidade e meios do tratamento." },
  { termo: "Operador", definicao: "Quem trata dados por conta do controlador." },
  { termo: "Encarregado (DPO)", definicao: "Canal com titulares e ANPD (art. 41)." },
  { termo: "Tratamento", definicao: "Qualquer uso de dado pessoal (coletar, usar, guardar…)." },
  { termo: "Base legal", definicao: "Hipótese da LGPD que autoriza o tratamento." },
  { termo: "Direitos do titular", definicao: "Pedidos do art. 18 (acesso, correção, eliminação, etc.)." },
];

const BLOCOS = [
  {
    Icon: ShieldOutlinedIcon,
    titulo: "O que é",
    texto: "Retrato do programa de privacidade e segurança de dados.",
  },
  {
    Icon: BalanceOutlinedIcon,
    titulo: "Por que importa",
    texto: "Sem papéis e finalidades claros, sobe o risco e cai a confiança do titular.",
  },
  {
    Icon: SummarizeOutlinedIcon,
    titulo: "Penalidades",
    texto: "Multas, sanções administrativas, interrupção da atividade de tratamento.",
  },
] as const;

const REFERENCIAS = [
  {
    Icon: GavelOutlinedIcon,
    titulo: "LGPD",
    texto: "Lei 13.709/2018: direitos e deveres no tratamento de dados.",
  },
  {
    Icon: SecurityOutlinedIcon,
    titulo: "PPSI 2.0",
    texto: "Diretrizes federais de segurança e privacidade de dados.",
  },
  {
    Icon: ShieldOutlinedIcon,
    titulo: "FPSI",
    texto: "Framework open source de Privacidade e Segurança da Informação.",
  },
] as const;

function IntroBloco({
  Icon,
  titulo,
  texto,
  compact,
}: {
  Icon: SvgIconComponent;
  titulo: string;
  texto: string;
  compact?: boolean;
}) {
  const iconBox = compact ? { xs: 28, print: 16 } : { xs: 32, print: 18 };
  const iconSize = compact ? { xs: 16, print: 11 } : { xs: 18, print: 12 };
  const titleSize = compact
    ? { xs: "0.8rem", print: "6.5pt" }
    : { xs: "0.85rem", print: "7pt" };
  const bodySize = compact
    ? { xs: "0.78rem", print: "6pt" }
    : { xs: "0.8rem", print: "6.5pt" };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.85, print: 0.35 }}
      alignItems="flex-start"
      sx={{ flex: 1, minWidth: 0 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: iconBox,
          height: iconBox,
          borderRadius: 0.75,
          flexShrink: 0,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          color: "primary.main",
          "@media print": { bgcolor: "transparent", border: "1px solid #ccc" },
        }}
      >
        <Icon sx={{ fontSize: iconSize }} aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          fontWeight={800}
          sx={{
            fontSize: titleSize,
            lineHeight: { xs: 1.2, print: 1.1 },
            mb: { xs: 0.2, print: 0 },
          }}
        >
          {titulo}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: { xs: 1.4, print: 1.15 },
            fontSize: bodySize,
          }}
        >
          {texto}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function PanoramaIntroducao() {
  return (
    <Paper
      variant="outlined"
      className="panorama-intro panorama-text-left"
      sx={{
        p: { xs: 1.5, md: 1.75, print: 0.4 },
        mb: { xs: 2, print: 0.25 },
        bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
        borderColor: (t) => alpha(t.palette.primary.main, 0.18),
        breakInside: "avoid",
        textAlign: "left",
        "@media print": {
          borderColor: "#ccc",
        },
      }}
    >
      <Stack
        spacing={{ xs: 1.25, print: 0.35 }}
        direction={{ xs: "column", md: "row" }}
        sx={{
          "@media print": {
            flexDirection: "row",
            gap: "4px",
            "& > *": { flex: "1 1 0", minWidth: 0 },
          },
        }}
      >
        {BLOCOS.map((bloco) => (
          <IntroBloco key={bloco.titulo} {...bloco} />
        ))}
      </Stack>

      <Box
        sx={{
          mt: { xs: 1.25, print: 0.25 },
          pt: { xs: 1, print: 0.25 },
          borderTop: 1,
          borderColor: (t) => alpha(t.palette.primary.main, 0.12),
          "@media print": { borderColor: "#ddd" },
        }}
      >
        <Typography
          variant="caption"
          fontWeight={800}
          color="text.secondary"
          display="block"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            mb: { xs: 0.75, print: 0.15 },
            fontSize: { xs: "0.7rem", print: "6pt" },
          }}
        >
          Contexto normativo e de referência
        </Typography>
        <Stack
          spacing={{ xs: 1, print: 0.2 }}
          direction={{ xs: "column", md: "row" }}
          className="panorama-intro-referencias"
          sx={{
            "@media print": {
              flexDirection: "row",
              gap: "3px",
              "& > *": { flex: "1 1 0", minWidth: 0 },
            },
          }}
        >
          {REFERENCIAS.map((ref) => (
            <IntroBloco key={ref.titulo} {...ref} compact />
          ))}
        </Stack>
      </Box>

      <Box
        className="panorama-intro-glossario"
        sx={{
          mt: { xs: 1.25, print: 0.25 },
          pt: { xs: 1, print: 0.25 },
          borderTop: 1,
          borderColor: (t) => alpha(t.palette.primary.main, 0.12),
          "@media print": { borderColor: "#ddd" },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.5, print: 0.35 }}
          alignItems="center"
          sx={{ mb: { xs: 0.75, print: 0.15 } }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: 22, print: 16 },
              height: { xs: 22, print: 16 },
              borderRadius: 0.5,
              flexShrink: 0,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              color: "primary.main",
              "@media print": { bgcolor: "transparent", border: "1px solid #ccc" },
            }}
          >
            <MenuBookOutlinedIcon sx={{ fontSize: { xs: 14, print: 11 } }} aria-hidden />
          </Box>
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              fontSize: { xs: "0.7rem", print: "6pt" },
            }}
          >
            Glossário simplificado
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              print: "1fr 1fr 1fr",
            },
            columnGap: { xs: 0, md: 1.5, print: 0.75 },
            rowGap: { xs: 0.45, print: 0.15 },
          }}
        >
          {GLOSSARIO_PRIVACIDADE.map((item) => (
            <Typography
              key={item.termo}
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: { xs: 1.35, print: 1.1 },
                fontSize: { xs: "0.76rem", print: "6pt" },
              }}
            >
              <Box component="span" fontWeight={700} color="text.primary">
                {item.termo}
              </Box>
              {" — "}
              {item.definicao}
            </Typography>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}