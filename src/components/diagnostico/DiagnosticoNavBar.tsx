"use client";

import React from "react";
import { Box, IconButton, Typography, alpha, useTheme } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

interface DiagnosticoNavBarProps {
  currentIndex: number;
  total: number;
  title: string;
  subtitle?: string;
  onPrev?: () => void;
  onNext?: () => void;
  accentColor?: string;
}

/** Barra de navegação entre diagnósticos / medidas — estilo pill moderno. */
export function DiagnosticoNavBar({
  currentIndex,
  total,
  title,
  subtitle,
  onPrev,
  onNext,
  accentColor,
}: DiagnosticoNavBarProps) {
  const theme = useTheme();
  const accent = accentColor ?? theme.palette.primary.main;

  return (
    <Box
      sx={{
        mb: 2,
        p: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.6 : 0.85),
        backdropFilter: "blur(10px)",
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
      }}
    >
      <IconButton
        size="small"
        onClick={onPrev}
        disabled={!onPrev}
        aria-label="Anterior"
        sx={{
          border: `1px solid ${alpha(accent, 0.25)}`,
          bgcolor: alpha(accent, 0.06),
          "&:hover": { bgcolor: alpha(accent, 0.12) },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <Box sx={{ flex: 1, textAlign: "center", minWidth: 0, px: 0.5 }}>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, mb: 0.25 }}>
            {subtitle}
          </Typography>
        )}
        <Typography
          variant="subtitle1"
          fontWeight={800}
          noWrap
          sx={{
            letterSpacing: "-0.02em",
            background: `linear-gradient(90deg, ${accent} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {currentIndex} de {total}
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={onNext}
        disabled={!onNext}
        aria-label="Próximo"
        sx={{
          border: `1px solid ${alpha(accent, 0.25)}`,
          bgcolor: alpha(accent, 0.06),
          "&:hover": { bgcolor: alpha(accent, 0.12) },
        }}
      >
        <ArrowForwardIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
