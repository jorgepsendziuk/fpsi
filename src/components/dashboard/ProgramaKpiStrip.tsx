"use client";

import React from "react";
import { Box, Card, CardContent, Grid, Typography, alpha, useTheme } from "@mui/material";
import type { ModulosResumoApi } from "@/lib/services/dataService";

type Props = {
  postura?: ModulosResumoApi["postura"];
  loading?: boolean;
};

type KpiDef = {
  label: string;
  value: string | number;
  color: string;
  hint?: string;
};

export function ProgramaKpiStrip({ postura, loading }: Props) {
  const theme = useTheme();

  const kpis: KpiDef[] = [
    {
      label: "Maturidade",
      value: postura?.maturidadeMedia != null ? `${postura.maturidadeMedia}%` : "—",
      color: theme.palette.primary.main,
    },
    {
      label: "DSAR abertos",
      value: postura?.dsarAbertos ?? 0,
      color: theme.palette.info.main,
    },
    {
      label: "Reportes novos",
      value: postura?.reportesNovos ?? 0,
      color: theme.palette.warning.main,
    },
    {
      label: "Riscos críticos",
      value: postura?.riscosCriticos ?? 0,
      color: theme.palette.error.main,
      hint: postura?.riscosTotal != null ? `${postura.riscosTotal} no total` : undefined,
    },
  ];

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid item xs={6} md={3} key={kpi.label}>
          <Card
            sx={{
              height: "100%",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              borderTop: `3px solid ${kpi.color}`,
            }}
          >
            <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {kpi.label}
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                {loading ? "…" : kpi.value}
              </Typography>
              {kpi.hint && !loading && (
                <Typography variant="caption" color="text.secondary">
                  {kpi.hint}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

type DashboardKpisProps = {
  kpis?: {
    programasAtivos: number;
    dsarAbertos: number;
    incidentesAbertos: number;
    reportesNovos: number;
    riscosCriticos: number;
  };
  loading?: boolean;
};

export function DashboardKpiStrip({ kpis, loading }: DashboardKpisProps) {
  const theme = useTheme();
  const items: KpiDef[] = [
    { label: "Programas", value: kpis?.programasAtivos ?? 0, color: theme.palette.primary.main },
    { label: "DSAR abertos", value: kpis?.dsarAbertos ?? 0, color: theme.palette.info.main },
    { label: "Incidentes abertos", value: kpis?.incidentesAbertos ?? 0, color: theme.palette.error.main },
    { label: "Reportes novos", value: kpis?.reportesNovos ?? 0, color: theme.palette.warning.main },
    { label: "Riscos críticos", value: kpis?.riscosCriticos ?? 0, color: "#C62828" },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {items.map((kpi) => (
          <Grid item xs={6} sm={4} md key={kpi.label} sx={{ minWidth: { md: 0 }, flex: { md: "1 1 0" } }}>
            <Card
              sx={{
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(kpi.color, 0.04),
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {kpi.label}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {loading ? "…" : kpi.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
