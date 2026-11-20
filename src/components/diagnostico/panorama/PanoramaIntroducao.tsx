"use client";

import React from "react";
import { Box, Paper, Stack, Typography, alpha } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

const BLOCOS = [
  {
    Icon: ShieldOutlinedIcon,
    titulo: "O que é",
    texto: "Retrato objetivo de como o programa trata dados pessoais, alinhado à LGPD e ao PPSI.",
  },
  {
    Icon: BalanceOutlinedIcon,
    titulo: "Por que importa",
    texto: "Sem clareza sobre o quê, o para quê e quem responde, o risco sobe e a confiança do titular cai.",
  },
  {
    Icon: SummarizeOutlinedIcon,
    titulo: "O que você ganha com esta entrega",
    texto: "Leitura executiva do que existe, do que decide e por onde começar — apoio à direção, não parecer jurídico.",
  },
] as const;

const REFERENCIAS = [
  {
    Icon: GavelOutlinedIcon,
    titulo: "LGPD",
    texto: "Lei 13.709/2018: direitos dos titulares e deveres de quem trata dados no Brasil.",
  },
  {
    Icon: SecurityOutlinedIcon,
    titulo: "PPSI 2.0",
    texto: "Marco para diagnosticar governança, controles e privacidade neste diagnóstico.",
  },
  {
    Icon: PublicOutlinedIcon,
    titulo: "GovBR",
    texto: "Referências federais em privacidade e serviços digitais como pano de fundo.",
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
  const iconBox = compact ? { xs: 30, print: 20 } : { xs: 36, print: 22 };
  const iconSize = compact ? { xs: 18, print: 14 } : { xs: 22, print: 15 };
  const titleSize = compact
    ? { xs: "0.82rem", print: "7.5pt" }
    : { xs: "0.9rem", print: "8pt" };
  const bodySize = compact ? { print: "7pt" } : { print: "7.5pt" };

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, print: 0.5 }}
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
          borderRadius: 1,
          flexShrink: 0,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          color: "primary.main",
          mt: { print: 0.1 },
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
            lineHeight: { xs: 1.25, print: 1.15 },
            mb: { xs: 0.35, print: 0.05 },
          }}
        >
          {titulo}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: { xs: 1.5, print: 1.22 },
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
        p: { xs: 1.75, md: 2, print: 0.65 },
        mb: { xs: 2.5, print: 0.4 },
        bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
        borderColor: (t) => alpha(t.palette.primary.main, 0.18),
        breakInside: "avoid",
        textAlign: "left",
      }}
    >
      <Stack
        spacing={{ xs: 1.5, print: 0.5 }}
        direction={{ xs: "column", md: "row" }}
        sx={{
          "@media print": {
            flexDirection: "row",
            gap: "6px",
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
          mt: { xs: 1.75, print: 0.4 },
          pt: { xs: 1.5, print: 0.4 },
          borderTop: 1,
          borderColor: (t) => alpha(t.palette.primary.main, 0.12),
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
            mb: { xs: 1, print: 0.25 },
            fontSize: { xs: "0.72rem", print: "6.5pt" },
          }}
        >
          Contexto normativo e de referência
        </Typography>
        <Stack
          spacing={{ xs: 1.25, print: 0.35 }}
          direction={{ xs: "column", md: "row" }}
          className="panorama-intro-referencias"
          sx={{
            "@media print": {
              flexDirection: "row",
              gap: "4px",
              "& > *": { flex: "1 1 0", minWidth: 0 },
            },
          }}
        >
          {REFERENCIAS.map((ref) => (
            <IntroBloco key={ref.titulo} {...ref} compact />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}