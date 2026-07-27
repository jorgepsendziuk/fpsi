"use client";

import React, { useMemo } from "react";
import { Box, Tooltip, Typography, alpha, useTheme } from "@mui/material";
import type { ProgramaRiscoRow } from "@/lib/services/dataService";

const LEVELS = ["muito_baixo", "baixo", "medio", "alto", "muito_alto"] as const;
const SHORT = ["1", "2", "3", "4", "5"] as const;
const LEVEL_NAMES = ["M. baixo", "Baixo", "Médio", "Alto", "M. alto"] as const;

function cellColor(score: number): string {
  if (score >= 20) return "#C62828";
  if (score >= 12) return "#EF6C00";
  if (score >= 6) return "#F9A825";
  return "#66BB6A";
}

export type RiscoHeatmapFilter = { probabilidade: string; impacto: string } | null;

type Props = {
  riscos: ProgramaRiscoRow[];
  selected?: RiscoHeatmapFilter;
  onSelect?: (filter: RiscoHeatmapFilter) => void;
  compact?: boolean;
  panel?: boolean;
  embedded?: boolean;
  /** Matriz embedded com mais respiro (página dedicada de riscos). */
  relaxed?: boolean;
  hideChrome?: boolean;
};

export function RiscoHeatmap({ riscos, selected, onSelect, compact, panel, embedded, relaxed, hideChrome }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const embeddedTight = embedded && !relaxed;
  const labelSize = compact ? "0.75rem" : embeddedTight ? "0.7rem" : embedded ? "0.8125rem" : panel ? "0.75rem" : "0.8125rem";
  const cellMin = compact ? 24 : embedded ? (relaxed ? 48 : 34) : panel ? 36 : 40;
  const cellFont = compact ? "0.8125rem" : embedded ? (relaxed ? "0.9375rem" : "0.8125rem") : panel ? "0.9rem" : "0.95rem";
  const gap = compact ? 0.35 : embedded ? (relaxed ? 0.55 : 0.35) : panel ? 0.5 : 0.6;
  const axisCol = compact ? 18 : embedded ? (relaxed ? 72 : 52) : panel ? 20 : 24;
  const maxH = compact ? 220 : embedded ? undefined : panel ? 300 : 320;
  const ratio = compact ? "1 / 1" : embedded ? undefined : panel ? "1 / 1" : "1.1 / 1";
  const showAxisLabels = !compact && !embedded;

  const axisLabelSecondarySx = relaxed
    ? {
        fontSize: "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        textAlign: "center" as const,
        whiteSpace: "normal" as const,
      }
    : {
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.1,
        textAlign: "center" as const,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
      };

  const axisLabelSecondaryRowSx = relaxed
    ? {
        fontSize: "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        textAlign: "right" as const,
        maxWidth: "100%",
      }
    : {
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.15,
        textAlign: "right" as const,
        maxWidth: "100%",
      };

  const matrix = useMemo(() => {
    const m: Record<string, ProgramaRiscoRow[]> = {};
    for (const r of riscos) {
      if (r.status === "encerrado" || r.status === "mitigado") continue;
      const key = `${r.probabilidade}:${r.impacto}`;
      if (!m[key]) m[key] = [];
      m[key].push(r);
    }
    return m;
  }, [riscos]);

  const renderCell = (prob: (typeof LEVELS)[number], imp: (typeof LEVELS)[number], pi: number, ii: number) => {
    const score = (pi + 1) * (ii + 1);
    const items = matrix[`${prob}:${imp}`] || [];
    const bg = cellColor(score);
    const isSelected = selected?.probabilidade === prob && selected?.impacto === imp;
    const interactive = Boolean(onSelect);

    return (
      <Tooltip
        key={`${prob}-${imp}`}
        title={
          items.length > 0
            ? `${items.length} risco(s): ${items.map((r) => r.titulo).join(", ")}`
            : `Prob. ${LEVEL_NAMES[pi]} × Impacto ${LEVEL_NAMES[ii]} (score ${score})`
        }
      >
        <Box
          component={interactive ? "button" : "div"}
          type={interactive ? "button" : undefined}
          onClick={
            interactive
              ? () =>
                  onSelect?.(
                    isSelected ? null : { probabilidade: prob, impacto: imp },
                  )
              : undefined
          }
          sx={{
            width: "100%",
            height: "100%",
            minHeight: cellMin,
            p: 0,
            m: 0,
            borderRadius: embedded ? 0.75 : compact ? 0.75 : 1,
            bgcolor: alpha(bg, items.length > 0 ? 0.88 : isDark ? 0.2 : 0.18),
            border: isSelected
              ? `2px solid ${theme.palette.text.primary}`
              : `1px solid ${alpha(theme.palette.divider, 0.55)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: items.length > 0 ? "#fff" : "text.secondary",
            fontWeight: 800,
            fontSize: cellFont,
            cursor: interactive ? "pointer" : "default",
            outline: "none",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            "&:hover": interactive
              ? {
                  transform: "scale(1.03)",
                  boxShadow: `0 2px 10px ${alpha(bg, 0.45)}`,
                  zIndex: 1,
                }
              : undefined,
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 1,
            },
          }}
        >
          {items.length > 0 ? items.length : ""}
        </Box>
      </Tooltip>
    );
  };

  const embeddedGrid = (
    <Box sx={{ width: "100%", display: "flex", gap: relaxed ? 0.75 : 0.5, alignItems: "stretch" }}>
      <Box
        sx={{
          width: relaxed ? 22 : 18,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pb: relaxed ? 3 : 2.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: relaxed ? "0.75rem" : "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            lineHeight: 1.1,
          }}
        >
          Probabilidade
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, maxWidth: relaxed ? 720 : undefined, mx: relaxed ? "auto" : undefined }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ fontSize: relaxed ? "0.8125rem" : "0.75rem", fontWeight: 700, letterSpacing: "0.04em", mb: relaxed ? 0.5 : 0.35 }}
        >
          Impacto
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${axisCol}px repeat(5, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(5, minmax(${cellMin}px, 1fr))`,
            gap,
            width: "100%",
            minHeight: relaxed ? 300 : 220,
          }}
        >
          <Box />
          {LEVELS.map((_, ii) => (
            <Box
              key={`ih-${ii}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                pb: 0.15,
                minWidth: 0,
              }}
            >
              <Typography variant="caption" sx={{ fontSize: labelSize, fontWeight: 800, lineHeight: 1.1 }}>
                {SHORT[ii]}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={axisLabelSecondarySx}
              >
                {LEVEL_NAMES[ii]}
              </Typography>
            </Box>
          ))}

          {LEVELS.map((prob, pi) => (
            <React.Fragment key={prob}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  pr: 0.35,
                  minWidth: 0,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: labelSize, fontWeight: 800, lineHeight: 1.1 }}>
                  {SHORT[pi]}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={axisLabelSecondaryRowSx}
                >
                  {LEVEL_NAMES[pi]}
                </Typography>
              </Box>
              {LEVELS.map((imp, ii) => renderCell(prob, imp, pi, ii))}
            </React.Fragment>
          ))}
        </Box>

      </Box>
    </Box>
  );

  const standardGrid = (
    <Box sx={{ display: "flex", gap: compact ? 0.5 : 1, width: "100%" }}>
      {showAxisLabels && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            alignSelf: "center",
            fontSize: panel ? "0.68rem" : "0.7rem",
            letterSpacing: "0.04em",
            flexShrink: 0,
          }}
        >
          Probabilidade →
        </Typography>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {showAxisLabels && (
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            sx={{ fontSize: panel ? "0.68rem" : "0.7rem", letterSpacing: "0.04em", mb: 0.5 }}
          >
            Impacto →
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${axisCol}px repeat(5, minmax(${cellMin}px, 1fr))`,
            gridAutoRows: `minmax(${cellMin}px, 1fr)`,
            gap,
            width: "100%",
            aspectRatio: ratio,
            ...(maxH != null ? { maxHeight: maxH } : {}),
          }}
        >
          <Box />
          {SHORT.map((n) => (
            <Typography
              key={`i-${n}`}
              variant="caption"
              align="center"
              color="text.secondary"
              sx={{
                fontSize: labelSize,
                fontWeight: 700,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 0.15,
              }}
            >
              {n}
            </Typography>
          ))}

          {LEVELS.map((prob, pi) => (
            <React.Fragment key={prob}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: labelSize,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {SHORT[pi]}
              </Typography>
              {LEVELS.map((imp, ii) => renderCell(prob, imp, pi, ii))}
            </React.Fragment>
          ))}
        </Box>

        {!hideChrome && !compact && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, fontSize: "0.7rem" }}>
            Escala 1–5 · só riscos ativos (não mitigados/encerrados)
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {!hideChrome && !compact && !embedded && (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
            Matriz 5×5
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {onSelect ? "Clique para filtrar" : "P × I"}
          </Typography>
        </Box>
      )}

      {embedded ? embeddedGrid : standardGrid}
    </Box>
  );
}
