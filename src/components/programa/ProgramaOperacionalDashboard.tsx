"use client";

import React from "react";
import { Box, Button, Grid, Paper, Typography, alpha, useTheme } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import PublicIcon from "@mui/icons-material/Public";
import NextLink from "next/link";
import type { ModulosResumoApi } from "@/lib/services/dataService";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { ProgramaKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { ModuloNavGrid, type ModuloNavSection } from "@/components/programa/ModuloNavGrid";
import { PapelLgpdDiagramWithEdit } from "@/components/programa/PapelLgpdDiagramWithEdit";

type Props = {
  idOrSlug: string;
  programaId: number;
  isDemoMode: boolean;
  modulosResumo: ModulosResumoApi | null;
  modulosResumoLoading: boolean;
  sections: ModuloNavSection[];
  onSwitchToModulos: () => void;
};

export function ProgramaOperacionalDashboard({
  idOrSlug,
  programaId,
  isDemoMode,
  modulosResumo,
  modulosResumoLoading,
  sections,
  onSwitchToModulos,
}: Props) {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Painel operacional
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {modulosResumo?.publicPortalPath && (
            <Button
              component={NextLink}
              href={modulosResumo.publicPortalPath}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              startIcon={<PublicIcon />}
            >
              Portal público
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<ViewModuleIcon />} onClick={onSwitchToModulos}>
            Ver módulos (cards)
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ProgramaKpiStrip postura={modulosResumo?.postura} loading={modulosResumoLoading} />
      </Box>

      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} lg={7}>
          <PendenciasPanel
            pendencias={modulosResumo?.pendencias}
            loading={modulosResumoLoading}
            title="Pendências do programa"
            emptyMessage="Nenhuma pendência operacional neste programa."
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              minHeight: 280,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Estrutura de tratamento
            </Typography>
            <Box sx={{ minHeight: 240 }}>
              <PapelLgpdDiagramWithEdit
                programaId={programaId}
                idOrSlug={idOrSlug}
                isDemoMode={isDemoMode}
                showManageButton={false}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            Acesso rápido aos módulos
          </Typography>
          <ModuloNavGrid sections={sections} idOrSlug={idOrSlug} compact />
        </Grid>
      </Grid>
    </Box>
  );
}
