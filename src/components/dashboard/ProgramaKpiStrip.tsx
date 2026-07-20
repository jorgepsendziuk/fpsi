"use client";

import React from "react";
import Link from "next/link";
import { Box, Card, CardActionArea, CardContent, Grid, Typography, alpha, useTheme } from "@mui/material";
import type { ModulosResumoApi } from "@/lib/services/dataService";

type Props = {
  postura?: ModulosResumoApi["postura"];
  loading?: boolean;
  compact?: boolean;
  /** Quando informado, o KPI de riscos críticos navega para a gestão de riscos. */
  idOrSlug?: string;
};

type KpiDef = {
  label: string;
  value: string | number;
  color: string;
  hint?: string;
  href?: string;
};

export function ProgramaKpiStrip({ postura, loading, compact, idOrSlug }: Props) {
  const theme = useTheme();

  const maturidadeLabel = (() => {
    const raw = postura?.maturidadeMedia;
    if (raw == null || Number.isNaN(Number(raw))) return "—";
    const n = Number(raw);
    const pct = n > 0 && n <= 1 ? n * 100 : n;
    return `${Math.round(pct * 10) / 10}%`;
  })();

  const kpis: KpiDef[] = [
    {
      label: "Maturidade",
      value: maturidadeLabel,
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
      href: idOrSlug ? `/programas/${idOrSlug}/riscos` : undefined,
    },
  ];

  return (
    <Grid container spacing={compact ? 1 : 2}>
      {kpis.map((kpi) => {
        const content = (
          <CardContent
            sx={{
              py: compact ? 0.85 : 1.5,
              px: compact ? 1.25 : 2,
              "&:last-child": { pb: compact ? 0.85 : 1.5 },
              display: compact ? "flex" : "block",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: compact ? "0.7rem" : undefined }}
            >
              {kpi.label}
            </Typography>
            <Box sx={{ textAlign: compact ? "right" : "left" }}>
              <Typography
                variant={compact ? "h6" : "h5"}
                fontWeight={800}
                sx={{ lineHeight: 1.15, mt: compact ? 0 : 0.25 }}
              >
                {loading ? "…" : kpi.value}
              </Typography>
              {kpi.hint && !loading && !compact && (
                <Typography variant="caption" color="text.secondary">
                  {kpi.hint}
                </Typography>
              )}
            </Box>
          </CardContent>
        );

        return (
          <Grid item xs={6} md={3} key={kpi.label}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: compact ? 1.5 : 2,
                borderTop: `${compact ? 2 : 3}px solid ${kpi.color}`,
                bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.72 : 0.92),
                backdropFilter: "blur(8px)",
                ...(kpi.href && {
                  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    borderColor: alpha(kpi.color, 0.55),
                    boxShadow: `0 4px 12px ${alpha(kpi.color, 0.16)}`,
                  },
                }),
              }}
            >
              {kpi.href ? (
                <CardActionArea
                  component={Link}
                  href={kpi.href}
                  sx={{ height: "100%", alignItems: "stretch" }}
                  aria-label={`Abrir ${kpi.label}`}
                >
                  {content}
                </CardActionArea>
              ) : (
                content
              )}
            </Card>
          </Grid>
        );
      })}
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

type DashboardKpisStripProps = DashboardKpisProps & { compact?: boolean };

export function DashboardKpiStrip({ kpis, loading, compact }: DashboardKpisStripProps) {
  const theme = useTheme();
  const items: KpiDef[] = [
    { label: "Programas", value: kpis?.programasAtivos ?? 0, color: theme.palette.primary.main },
    { label: "DSAR", value: kpis?.dsarAbertos ?? 0, color: theme.palette.info.main },
    { label: "Incidentes", value: kpis?.incidentesAbertos ?? 0, color: theme.palette.error.main },
    { label: "Reportes", value: kpis?.reportesNovos ?? 0, color: theme.palette.warning.main },
    { label: "Riscos", value: kpis?.riscosCriticos ?? 0, color: "#C62828" },
  ];

  return (
    <Box sx={{ mb: compact ? 0 : 2 }}>
      <Grid container spacing={compact ? 1 : 1.5}>
        {items.map((kpi) => (
          <Grid item xs={6} sm={4} md key={kpi.label} sx={{ minWidth: { md: 0 }, flex: { md: "1 1 0" } }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: compact ? 1.5 : 2,
                borderTop: `${compact ? 2 : 3}px solid ${kpi.color}`,
                bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.72 : 0.92),
                backgroundImage: `linear-gradient(180deg, ${alpha(kpi.color, theme.palette.mode === "dark" ? 0.1 : 0.05)} 0%, transparent 70%)`,
                backdropFilter: "blur(8px)",
              }}
            >
              <CardContent
                sx={{
                  py: compact ? 0.75 : 1.25,
                  px: compact ? 1.1 : 1.5,
                  display: compact ? "flex" : "block",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 0.75,
                  "&:last-child": { pb: compact ? 0.75 : 1.25 },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ fontSize: compact ? "0.68rem" : undefined }}
                >
                  {kpi.label}
                </Typography>
                <Typography variant={compact ? "h6" : "h5"} fontWeight={800} sx={{ lineHeight: 1.1 }}>
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
