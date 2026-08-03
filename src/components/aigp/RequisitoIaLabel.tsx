"use client";

import React from "react";
import { Box, Tooltip, Typography, type TypographyProps } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { AIGP_ACCENT, AIGP_TEXT, aigpTextSx } from "@/lib/aigp/aigpVisualTokens";

export type RequisitoIaLabelProps = {
  children: React.ReactNode;
  variant?: "inline" | "section" | "tab";
  showIcon?: boolean;
  tooltip?: string;
  component?: TypographyProps["component"];
  sx?: TypographyProps["sx"];
};

const TOOLTIP_DEFAULT =
  "Requisito do diagnóstico Governança de IA (AIGP). Complementa o PPSI; preencha na Estrutura de Governança ou módulos indicados.";

export function RequisitoIaLabel({
  children,
  variant = "inline",
  showIcon = true,
  tooltip = TOOLTIP_DEFAULT,
  component = "span",
  sx,
}: RequisitoIaLabelProps) {
  const fontSize =
    variant === "section" ? "0.9375rem" : variant === "tab" ? "0.875rem" : "inherit";
  const fontWeight = variant === "section" ? 800 : 600;

  const label = (
    <Typography
      component={component}
      variant={variant === "section" ? "subtitle2" : "inherit"}
      sx={{
        ...aigpTextSx(),
        fontSize,
        fontWeight,
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        lineHeight: 1.35,
        ...sx,
      }}
    >
      {showIcon && (
        <AutoAwesomeIcon
          sx={{
            fontSize: variant === "section" ? 18 : 15,
            color: AIGP_ACCENT,
            opacity: 0.92,
            flexShrink: 0,
          }}
          aria-hidden
        />
      )}
      <Box component="span" sx={{ color: AIGP_TEXT }}>
        {children}
      </Box>
    </Typography>
  );

  if (!tooltip) return label;

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box component="span" sx={{ display: "inline-flex", maxWidth: "100%" }}>
        {label}
      </Box>
    </Tooltip>
  );
}
