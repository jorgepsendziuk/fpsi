"use client";

import React from "react";
import { Box, Stack, type SxProps, type Theme, alpha } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { calcularScoreRisco, labelNivelRisco } from "@/lib/server/riscoScore";

export type PanoramaNivelBand = "baixo" | "medio" | "alto" | "critico";

export type PanoramaNivelVisual = {
  band: PanoramaNivelBand;
  score: number;
  color: string;
  printInk: string;
  Icon: SvgIconComponent;
  legenda: string;
};

function bandFromScore(score: number): PanoramaNivelBand {
  if (score >= 20) return "critico";
  if (score >= 12) return "alto";
  if (score >= 6) return "medio";
  return "baixo";
}

function visualFromScore(score: number, legenda: string): PanoramaNivelVisual {
  const band = bandFromScore(score);
  const palette: Record<
    PanoramaNivelBand,
    { color: string; printInk: string; Icon: SvgIconComponent }
  > = {
    baixo: { color: "#2E7D32", printInk: "#1b5e20", Icon: ArrowDownwardIcon },
    medio: { color: "#F9A825", printInk: "#6d4c00", Icon: TrendingFlatIcon },
    alto: { color: "#EF6C00", printInk: "#4e2600", Icon: ArrowUpwardIcon },
    critico: { color: "#C62828", printInk: "#5c0a0a", Icon: PriorityHighIcon },
  };
  const p = palette[band];
  return { band, score, legenda, ...p };
}

export function panoramaNivelFromRisco(r: {
  probabilidade: string;
  impacto: string;
  score_residual?: number | null;
  score_inerente?: number | null;
}): PanoramaNivelVisual {
  const calc =
    r.score_residual != null && r.score_residual > 0
      ? r.score_residual
      : r.score_inerente != null && r.score_inerente > 0
        ? r.score_inerente
        : calcularScoreRisco(r.probabilidade, r.impacto);
  const legenda = `Prob. ${labelNivelRisco(r.probabilidade)} · Impacto ${labelNivelRisco(r.impacto)}`;
  return visualFromScore(calc, legenda);
}

const PLANO_SCORE: Record<string, number> = {
  baixa: 4,
  media: 9,
  alta: 16,
  critica: 25,
};

const PLANO_LABEL: Record<string, string> = {
  baixa: "Prioridade baixa",
  media: "Prioridade média",
  alta: "Prioridade alta",
  critica: "Prioridade crítica",
};

export function panoramaNivelFromPlano(prioridade: string | null | undefined): PanoramaNivelVisual {
  const key = String(prioridade || "media")
    .toLowerCase()
    .trim();
  const score = PLANO_SCORE[key] ?? 9;
  const legenda = PLANO_LABEL[key] ?? `Prioridade: ${prioridade || "média"}`;
  return visualFromScore(score, legenda);
}

export function panoramaNivelRowSx(visual: PanoramaNivelVisual): SxProps<Theme> {
  return {
    bgcolor: (t) => alpha(visual.color, t.palette.mode === "dark" ? 0.14 : 0.08),
    "& > .MuiTableCell-root": {
      borderBottomColor: (t) => alpha(visual.color, 0.22),
    },
    boxShadow: (t) => `inset 4px 0 0 ${alpha(visual.color, t.palette.mode === "dark" ? 0.95 : 0.85)}`,
    "@media print": {
      bgcolor: "transparent",
      boxShadow: `inset 3px 0 0 ${visual.printInk}`,
      "& > .MuiTableCell-root": { borderBottomColor: "#ddd" },
    },
  };
}

export function PanoramaNivelIcon({
  visual,
  size = "row",
}: {
  visual: PanoramaNivelVisual;
  size?: "row" | "compact";
}) {
  const { Icon } = visual;
  return (
    <Icon
      aria-hidden
      titleAccess={visual.legenda}
      sx={{
        fontSize: size === "compact" ? { xs: 16, print: 13 } : { xs: 20, print: 15 },
        color: visual.color,
        mt: 0.15,
        flexShrink: 0,
        "@media print": { color: visual.printInk },
      }}
    />
  );
}

export function PanoramaNivelCelulaComIcone({
  visual,
  children,
}: {
  visual: PanoramaNivelVisual;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ minWidth: 0 }}>
      <PanoramaNivelIcon visual={visual} />
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
    </Stack>
  );
}

export const PANORAMA_CELULA_ESTREITA = "panorama-celula-estreita";