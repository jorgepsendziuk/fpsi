"use client";

import React from "react";
import { Box, Grid, Typography, alpha, useTheme } from "@mui/material";
import type { ModulosResumoApi } from "@/lib/services/dataService";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { ProgramaKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { ModuloNavGrid, type ModuloNavSection } from "@/components/programa/ModuloNavGrid";

type Props = {
  idOrSlug: string;
  programaId: number;
  isDemoMode: boolean;
  modulosResumo: ModulosResumoApi | null;
  modulosResumoLoading: boolean;
  sections: ModuloNavSection[];
};

/** Painel operacional denso: KPIs + pendências + módulos — primeira viewport sem chrome extra. */
export function ProgramaOperacionalDashboard({
  idOrSlug,
  modulosResumo,
  modulosResumoLoading,
  sections,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <ProgramaKpiStrip
        postura={modulosResumo?.postura}
        loading={modulosResumoLoading}
        compact
        idOrSlug={idOrSlug}
      />

      <Grid container spacing={1.5} alignItems="stretch">
        <Grid item xs={12}>
          <PendenciasPanel
            pendencias={modulosResumo?.pendencias}
            loading={modulosResumoLoading}
            title="Pendências"
            emptyMessage="Nenhuma pendência operacional."
            dense
            maxItems={6}
            maxHeight={220}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(
                theme.palette.primary.main,
                isDark ? 0.08 : 0.03
              ),
              backgroundImage: isDark
                ? `linear-gradient(135deg, ${alpha("#0A2744", 0.55)} 0%, transparent 70%)`
                : `linear-gradient(135deg, ${alpha("#E8F1F8", 0.9)} 0%, transparent 70%)`,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                display: "block",
                mb: 1,
                px: 0.25,
                color: "text.secondary",
                fontSize: "0.68rem",
              }}
            >
              Módulos
            </Typography>
            <ModuloNavGrid sections={sections} idOrSlug={idOrSlug} dense />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
