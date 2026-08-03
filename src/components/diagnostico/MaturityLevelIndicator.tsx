"use client";

import React from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import MaturityCalculationTooltip from "./MaturityCalculationTooltip";
import { formatMaturityIndex } from "@/lib/utils/maturity";

interface MaturityLevelIndicatorProps {
  score: number;
  label?: string;
  size?: "sm" | "md";
  calculationData?: React.ComponentProps<typeof MaturityCalculationTooltip>["calculationData"];
  controleId?: number;
  controleNome?: string;
}

/** Indicador único: pontos de nível (1–5) + índice iMC + rótulo — sem duplicar informação. */
export function MaturityLevelIndicator({
  score,
  label,
  size = "md",
  calculationData,
  controleId,
  controleNome,
}: MaturityLevelIndicatorProps) {
  const theme = useTheme();
  const formatted = formatMaturityIndex(score);
  if (!formatted) return null;

  const levelLabel = label ?? formatted.label;
  const isSm = size === "sm";

  const body = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={1.25}
      sx={{ py: isSm ? 0.25 : 0.5 }}
    >
      <Stack direction="row" spacing={0.45} aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <Box
            key={n}
            sx={{
              width: isSm ? 7 : 9,
              height: isSm ? 7 : 9,
              borderRadius: "50%",
              bgcolor:
                n <= formatted.levelId
                  ? formatted.color
                  : alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.45 : 0.55),
              boxShadow: n <= formatted.levelId ? `0 0 0 1px ${alpha(formatted.color, 0.35)}` : "none",
              transition: "background-color 0.2s ease",
            }}
          />
        ))}
      </Stack>
      <Typography
        variant={isSm ? "body2" : "body1"}
        fontWeight={800}
        sx={{ lineHeight: 1.2, letterSpacing: "-0.01em" }}
      >
        <Box component="span" sx={{ color: formatted.color, fontVariantNumeric: "tabular-nums" }}>
          {formatted.indexText}
        </Box>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, mx: 0.75 }}>
          ·
        </Box>
        <Box component="span" sx={{ color: "text.primary" }}>
          {levelLabel}
        </Box>
      </Typography>
    </Stack>
  );

  if (calculationData) {
    return (
      <MaturityCalculationTooltip
        calculationData={calculationData}
        controleId={controleId}
        controleNome={controleNome}
      >
        <Box component="span" sx={{ display: "inline-flex", cursor: "help" }}>
          {body}
        </Box>
      </MaturityCalculationTooltip>
    );
  }

  return (
    <Tooltip title={`Nível ${formatted.levelId} de 5 · ${levelLabel}`} enterDelay={400}>
      <Box component="span" sx={{ display: "inline-flex" }}>
        {body}
      </Box>
    </Tooltip>
  );
}
