"use client";

import React, { useMemo } from "react";
import { Box, Tooltip, Typography, alpha, useTheme } from "@mui/material";
import type { ProgramaRiscoRow } from "@/lib/services/dataService";

const PROB_LEVELS = ["muito_baixo", "baixo", "medio", "alto", "muito_alto"] as const;
const IMPACT_LEVELS = ["muito_baixo", "baixo", "medio", "alto", "muito_alto"] as const;

const PROB_LABELS = ["Muito baixa", "Baixa", "Média", "Alta", "Muito alta"];
const IMPACT_LABELS = ["Muito baixo", "Baixo", "Médio", "Alto", "Muito alto"];

function cellColor(score: number): string {
  if (score >= 20) return "#C62828";
  if (score >= 12) return "#EF6C00";
  if (score >= 6) return "#F9A825";
  return "#66BB6A";
}

type Props = {
  riscos: ProgramaRiscoRow[];
};

export function RiscoHeatmap({ riscos }: Props) {
  const theme = useTheme();

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

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Matriz 5×5 (probabilidade × impacto)
      </Typography>
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "auto repeat(5, 1fr)", gap: 0.5, minWidth: 420 }}>
          <Box />
          {IMPACT_LABELS.map((l) => (
            <Typography key={l} variant="caption" align="center" color="text.secondary" sx={{ px: 0.5 }}>
              {l}
            </Typography>
          ))}
          {PROB_LEVELS.map((prob, pi) => (
            <React.Fragment key={prob}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", pr: 1, whiteSpace: "nowrap" }}
              >
                {PROB_LABELS[pi]}
              </Typography>
              {IMPACT_LEVELS.map((imp, ii) => {
                const score = (pi + 1) * (ii + 1);
                const items = matrix[`${prob}:${imp}`] || [];
                const bg = cellColor(score);
                return (
                  <Tooltip
                    key={`${prob}-${imp}`}
                    title={
                      items.length > 0
                        ? items.map((r) => r.titulo).join(", ")
                        : `Score ${score} — sem riscos ativos`
                    }
                  >
                    <Box
                      sx={{
                        aspectRatio: "1",
                        minHeight: 48,
                        borderRadius: 1,
                        bgcolor: alpha(bg, items.length > 0 ? 0.85 : 0.25),
                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: items.length > 0 ? "#fff" : "text.secondary",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {items.length > 0 ? items.length : ""}
                    </Box>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
