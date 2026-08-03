"use client";

import React from "react";
import { Box, LinearProgress, Stack, Typography, alpha, useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

export type CoberturaRespostasIndicatorProps = {
  respondidas: number;
  total: number;
  loading?: boolean;
  /** Cor da barra de progresso (padrão: success). */
  barColor?: string;
  compact?: boolean;
};

/** Resumo respondidas / pendentes + barra de cobertura (visão geral e cards por eixo). */
export function CoberturaRespostasIndicator({
  respondidas,
  total,
  loading = false,
  barColor,
  compact = false,
}: CoberturaRespostasIndicatorProps) {
  const theme = useTheme();
  const pendentes = Math.max(0, total - respondidas);
  const pct = total > 0 ? (respondidas / total) * 100 : 0;
  const accent = barColor ?? theme.palette.success.main;
  const showPlaceholder = loading && total === 0;

  return (
    <Stack
      direction={{ xs: "column", sm: compact ? "column" : "row" }}
      spacing={compact ? 0.75 : 1.25}
      alignItems={{ xs: "stretch", sm: compact ? "stretch" : "center" }}
      sx={{ width: "100%" }}
    >
      <Stack
        direction="row"
        spacing={compact ? 1.75 : 2.5}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ flexShrink: 0 }}
      >
        <Typography
          variant={compact ? "caption" : "caption"}
          color="text.secondary"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: compact ? 14 : 15, color: "success.main", opacity: 0.75 }} />
          <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
            {showPlaceholder ? "…" : respondidas}
          </Box>
          respondidas
        </Typography>
        <Typography
          variant={compact ? "caption" : "caption"}
          color="text.secondary"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 500 }}
        >
          <PendingActionsIcon sx={{ fontSize: compact ? 14 : 15, color: "warning.main", opacity: 0.75 }} />
          <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
            {showPlaceholder ? "…" : pendentes}
          </Box>
          pendentes
        </Typography>
        {!compact && total > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            de{" "}
            <Box component="span" sx={{ color: "text.primary", fontWeight: 700 }}>
              {showPlaceholder ? "…" : total}
            </Box>{" "}
            medidas
          </Typography>
        )}
      </Stack>
      <Box sx={{ flex: 1, minWidth: compact ? "100%" : { xs: "100%", sm: 120 } }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, pct)}
          aria-label="Cobertura de respostas"
          sx={{
            height: compact ? 3 : 4,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.divider, 0.35),
            "& .MuiLinearProgress-bar": {
              borderRadius: 2,
              bgcolor: accent,
              opacity: 0.85,
            },
          }}
        />
        {compact && total > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.5, fontWeight: 600, fontSize: "0.6875rem", textAlign: "center" }}
          >
            {showPlaceholder ? "…" : `${respondidas} de ${total} medidas`}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
