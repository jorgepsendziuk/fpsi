"use client";

import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  panoramaFoldOneCardClass,
  panoramaFoldOneCardSx,
} from "@/lib/panorama/panoramaFoldOneCards";

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
    texto: "Ferramenta que integra referenciais de privacidade, segurança e governança de IA.",
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
      className="panorama-intro-bloco-interno"
      sx={{
        width: "100%",
        minWidth: 0,
        height: "100%",
        boxSizing: "border-box",
        p: { xs: 0.75, md: 0.85, print: 0 },
        borderRadius: 1,
        bgcolor: { xs: "rgba(255,255,255,0.55)", print: "transparent" },
        border: { xs: 1, print: 0 },
        borderColor: { xs: "rgba(0,0,0,0.06)", print: "transparent" },
      }}
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
          bgcolor: "grey.100",
          color: "text.secondary",
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
      className={`panorama-intro panorama-text-left ${panoramaFoldOneCardClass("intro")}`}
      sx={[
        panoramaFoldOneCardSx("intro"),
        {
          p: { xs: 1.5, md: 1.75, print: 0 },
          mb: { xs: 0, print: 0 },
          breakInside: "avoid",
          textAlign: "left",
        },
      ]}
    >
      <Box
        className="panorama-intro-blocos"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 1.25, md: 1, print: 0.5 },
          alignItems: "stretch",
          "@media print": {
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {BLOCOS.map((bloco) => (
          <IntroBloco key={bloco.titulo} {...bloco} />
        ))}
      </Box>

      <Box
        sx={{
          mt: { xs: 1.25, print: 0.35 },
          pt: { xs: 1, print: 0.35 },
          borderTop: 1,
          borderColor: "divider",
          "@media print": { borderColor: "rgba(0,0,0,0.1)" },
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
        <Box
          className="panorama-intro-referencias"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: { xs: 1, md: 0.85, print: 0.35 },
            alignItems: "stretch",
            "@media print": {
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {REFERENCIAS.map((ref) => (
            <IntroBloco key={ref.titulo} {...ref} compact />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}