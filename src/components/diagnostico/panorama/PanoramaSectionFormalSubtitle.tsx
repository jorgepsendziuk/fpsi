"use client";

import React from "react";
import { Typography } from "@mui/material";

type PanoramaSectionSubtitleProps = {
  subtitulo: string;
  /** Índice da 1ª página: linha mais compacta na impressão. */
  compact?: boolean;
};

/** Subtítulo informal abaixo do título (índice ou seção). */
export function PanoramaSectionSubtitle({ subtitulo, compact = false }: PanoramaSectionSubtitleProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      component="div"
      sx={{
        mt: compact ? { xs: 0.12, print: 0.02 } : { xs: 0.35, print: 0.2 },
        fontSize: compact
          ? { xs: "0.76rem", md: "0.78rem", print: "6.5pt" }
          : { xs: "0.82rem", md: "0.85rem", print: "7.5pt" },
        lineHeight: compact ? { xs: 1.3, print: 1.2 } : 1.35,
        fontWeight: 500,
      }}
    >
      {subtitulo}
    </Typography>
  );
}

/** @deprecated Use PanoramaSectionSubtitle */
export const PanoramaSectionFormalSubtitle = PanoramaSectionSubtitle;