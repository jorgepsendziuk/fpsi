"use client";

import React from "react";
import Link from "next/link";
import { Box, Card, CardActionArea, CardContent, Grid, Typography, alpha, useTheme } from "@mui/material";
import type { ModulosResumoApi } from "@/lib/services/dataService";
import { MaturityDiagnosticoSummary } from "@/components/dashboard/MaturityDiagnosticoSummary";

type Props = {
  postura?: ModulosResumoApi["postura"];
  maturidade?: ModulosResumoApi["maturidade"];
  /** Pendências atrasadas do programa (quando disponível). */
  atrasados?: number;
  vencendo7d?: number;
  loading?: boolean;
  compact?: boolean;
  /** Quando informado, o KPI de riscos críticos navega para a gestão de riscos. */
  idOrSlug?: string;
};

type KpiDef = {
  label: string;
  value: string | number;
  color: string;
  hint: string;
  href?: string;
};

export function ProgramaKpiStrip({
  postura,
  maturidade,
  atrasados,
  vencendo7d,
  loading,
  compact,
  idOrSlug,
}: Props) {
  const theme = useTheme();

  const showOps = atrasados != null || vencendo7d != null;

  const kpis: KpiDef[] = showOps
    ? [
        {
          label: "Atrasadas",
          value: atrasados ?? 0,
          color: theme.palette.error.main,
          hint: "Pendências com prazo vencido",
          href: idOrSlug ? `/programas/${idOrSlug}/conformidade` : undefined,
        },
        {
          label: "Vencem em 7 dias",
          value: vencendo7d ?? 0,
          color: theme.palette.warning.main,
          hint: "Vencimento nos próximos 7 dias",
          href: idOrSlug ? `/programas/${idOrSlug}/conformidade` : undefined,
        },
        {
          label: "Pedidos abertos",
          value: postura?.dsarAbertos ?? 0,
          color: theme.palette.info.main,
          hint: "Pedidos de titulares (DSAR)",
          href: idOrSlug ? `/programas/${idOrSlug}/conformidade/pedidos-titulares` : undefined,
        },
        {
          label: "Riscos críticos",
          value: postura?.riscosCriticos ?? 0,
          color: theme.palette.error.main,
          hint:
            postura?.riscosTotal != null
              ? `Score ≥ 12 · ${postura.riscosTotal} registrado(s)`
              : "Riscos ativos com score ≥ 12",
          href: idOrSlug ? `/programas/${idOrSlug}/riscos` : undefined,
        },
      ]
    : [
        {
          label: "Pedidos abertos",
          value: postura?.dsarAbertos ?? 0,
          color: theme.palette.info.main,
          hint: "Pedidos de titulares (DSAR)",
          href: idOrSlug ? `/programas/${idOrSlug}/conformidade/pedidos-titulares` : undefined,
        },
        {
          label: "Reportes novos",
          value: postura?.reportesNovos ?? 0,
          color: theme.palette.warning.main,
          hint: "Reportes do canal público",
          href: idOrSlug ? `/programas/${idOrSlug}/conformidade/reportes` : undefined,
        },
        {
          label: "Riscos críticos",
          value: postura?.riscosCriticos ?? 0,
          color: theme.palette.error.main,
          hint:
            postura?.riscosTotal != null
              ? `Score ≥ 12 · ${postura.riscosTotal} registrado(s)`
              : "Riscos ativos com score ≥ 12",
          href: idOrSlug ? `/programas/${idOrSlug}/riscos` : undefined,
        },
      ];

  const cols = kpis.length >= 4 ? { xs: 6, sm: 4, md: true as const } : { xs: 6, md: 3 };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: compact ? 0.75 : 1.25 }}>
      <MaturityDiagnosticoSummary
        items={maturidade}
        loading={loading}
        compact={compact}
        layout="kpi"
        href={idOrSlug ? `/programas/${idOrSlug}/diagnostico` : undefined}
      />
      <Grid container spacing={compact ? 0.75 : 1.25}>
      {kpis.map((kpi) => {
        const emphasize =
          typeof kpi.value === "number" &&
          kpi.value > 0 &&
          (kpi.label === "Atrasadas" || kpi.label === "Riscos críticos");

        const content = (
          <CardContent
            sx={{
              py: compact ? 0.65 : 1.5,
              px: compact ? 1 : 1.75,
              "&:last-child": { pb: compact ? 0.65 : 1.5 },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ fontSize: compact ? "0.8125rem" : "0.875rem", lineHeight: 1.25, mb: 0.35 }}
            >
              {kpi.label}
            </Typography>
            <Typography
              variant={compact ? "h6" : "h4"}
              fontWeight={800}
              sx={{
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                fontSize: compact ? "1.35rem" : undefined,
                color: emphasize ? kpi.color : "text.primary",
              }}
            >
              {loading ? "…" : kpi.value}
            </Typography>
            {!loading && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.35,
                  lineHeight: 1.35,
                  fontSize: compact ? "0.75rem" : "0.8125rem",
                }}
              >
                {kpi.hint}
              </Typography>
            )}
          </CardContent>
        );

        return (
          <Grid
            item
            xs={cols.xs}
            sm={"sm" in cols ? cols.sm : undefined}
            md={cols.md}
            key={kpi.label}
            sx={cols.md === true ? { minWidth: { md: 0 }, flex: { md: "1 1 0" } } : undefined}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 1,
                borderLeft: `3px solid ${kpi.color}`,
                backgroundImage: `linear-gradient(135deg, ${alpha(kpi.color, theme.palette.mode === "dark" ? 0.12 : 0.06)} 0%, transparent 62%)`,
                ...(kpi.href && {
                  transition: "box-shadow 0.15s ease, transform 0.15s ease",
                  "&:hover": {
                    boxShadow: `0 4px 14px ${alpha(kpi.color, 0.16)}`,
                    transform: "translateY(-1px)",
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
    </Box>
  );
}

type DashboardKpisProps = {
  kpis?: {
    programasAtivos: number;
    dsarAbertos: number;
    incidentesAbertos: number;
    reportesNovos: number;
    riscosCriticos: number;
    maturidadeMedia?: number | null;
    planosVencidos?: number;
    ropasAtivos?: number;
  };
  /** Pendências com prazo vencido — prioridade operacional. */
  atrasados?: number;
  vencendo7d?: number;
  loading?: boolean;
  /** Linguagem de diretoria (sem inbox operacional). */
  executivo?: boolean;
};

type DashboardKpisStripProps = DashboardKpisProps & { compact?: boolean };

export function DashboardKpiStrip({
  kpis,
  atrasados,
  vencendo7d,
  loading,
  compact,
  executivo,
}: DashboardKpisStripProps) {
  const theme = useTheme();
  const mat =
    kpis?.maturidadeMedia != null && Number.isFinite(kpis.maturidadeMedia)
      ? Number(kpis.maturidadeMedia).toFixed(1)
      : "—";

  const items: KpiDef[] = executivo
    ? [
        {
          label: "Maturidade",
          value: mat,
          color: theme.palette.primary.main,
          hint: "Média dos programas",
        },
        {
          label: "Exposição a risco",
          value: kpis?.riscosCriticos ?? 0,
          color: "#B71C1C",
          hint: "Riscos críticos ativos",
        },
        {
          label: "Planos em atraso",
          value: kpis?.planosVencidos ?? atrasados ?? 0,
          color: theme.palette.error.main,
          hint: "Prazo vencido",
        },
        {
          label: "Incidentes",
          value: kpis?.incidentesAbertos ?? 0,
          color: "#C62828",
          hint: "Em tratamento",
        },
        {
          label: "ROPAs",
          value: kpis?.ropasAtivos ?? 0,
          color: theme.palette.info.main,
          hint: "Registros de tratamento",
        },
        {
          label: "Pedidos de titulares",
          value: kpis?.dsarAbertos ?? 0,
          color: theme.palette.warning.main,
          hint: "Em aberto",
        },
      ]
    : [
    {
      label: "Atrasadas",
      value: atrasados ?? 0,
      color: theme.palette.error.main,
      hint: "Pendências vencidas",
    },
    {
      label: "Vencem em 7 dias",
      value: vencendo7d ?? 0,
      color: theme.palette.warning.main,
      hint: "Próximos 7 dias",
    },
    {
      label: "Pedidos abertos",
      value: kpis?.dsarAbertos ?? 0,
      color: theme.palette.info.main,
      hint: "DSAR em aberto",
    },
    {
      label: "Incidentes",
      value: kpis?.incidentesAbertos ?? 0,
      color: "#C62828",
      hint: "Incidentes em tratamento",
    },
    {
      label: "Riscos críticos",
      value: kpis?.riscosCriticos ?? 0,
      color: "#B71C1C",
      hint: "Score ≥ 12",
    },
  ];

  return (
    <Box sx={{ mb: compact ? 0 : 0.5 }}>
      <Grid container spacing={1.25}>
        {items.map((kpi) => (
          <Grid item xs={6} sm={4} md key={kpi.label} sx={{ minWidth: { md: 0 }, flex: { md: "1 1 0" } }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 1,
                borderLeft: `3px solid ${kpi.color}`,
                backgroundImage: `linear-gradient(135deg, ${alpha(kpi.color, theme.palette.mode === "dark" ? 0.14 : 0.07)} 0%, transparent 62%)`,
              }}
            >
              <CardContent
                sx={{
                  py: 1.5,
                  px: 1.75,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ fontSize: "0.8125rem", lineHeight: 1.25, mb: 0.5 }}
                >
                  {kpi.label}
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    color: Number(kpi.value) > 0 && (kpi.label === "Atrasadas" || kpi.label === "Riscos críticos" || kpi.label === "Incidentes")
                      ? kpi.color
                      : "text.primary",
                  }}
                >
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
