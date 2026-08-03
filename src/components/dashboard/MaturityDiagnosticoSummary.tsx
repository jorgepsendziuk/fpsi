"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { formatMaturityIndex } from "@/lib/utils/maturity";
import { escopoGreyedSx, ESCOPO_CHIP_LABEL } from "@/lib/programa/escopoVisual";

export type MaturityDiagnosticoItem = {
  diagnostico_id: number;
  nome: string;
  score: number;
  label?: string;
  /** false = fora do escopo — visível, não entra na média */
  ativo?: boolean;
};

type Props = {
  items?: MaturityDiagnosticoItem[];
  /** Catálogo de diagnósticos — preenche itens ausentes com índice zero. */
  diagnosticos?: Array<{ id: number; descricao?: string | null }>;
  loading?: boolean;
  compact?: boolean;
  href?: string;
  /** kpi = linha de cards iguais aos KPIs; panel = grid compacto embutido. */
  layout?: "kpi" | "panel";
};

function useMaturityRows(
  items: MaturityDiagnosticoItem[],
  diagnosticos?: Array<{ id: number; descricao?: string | null }>
) {
  return useMemo(() => {
    const byId = new Map(items.map((m) => [m.diagnostico_id, m]));
    const catalog = diagnosticos?.length
      ? diagnosticos
      : items.map((m) => ({ id: m.diagnostico_id, descricao: m.nome }));

    return catalog.map((diag) => {
      const entry = byId.get(diag.id);
      const score = entry ? Number(entry.score) : 0;
      const fmt = formatMaturityIndex(score);
      return {
        id: diag.id,
        nome: entry?.nome || diag.descricao || `Diagnóstico ${diag.id}`,
        score,
        label: entry?.label || fmt?.label || "Inicial",
        fmt,
        outOfScope: entry?.ativo === false,
      };
    });
  }, [items, diagnosticos]);
}

function KpiMaturityCard({
  row,
  compact,
  href,
  loading,
}: {
  row: ReturnType<typeof useMaturityRows>[number];
  compact?: boolean;
  href?: string;
  loading?: boolean;
}) {
  const theme = useTheme();
  const greyed = Boolean(row.outOfScope);
  const color = greyed ? theme.palette.text.secondary : (row.fmt?.color ?? theme.palette.text.secondary);

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
        noWrap
        title={row.nome}
        sx={{ fontSize: compact ? "0.8125rem" : "0.875rem", lineHeight: 1.25, mb: 0.35 }}
      >
        {row.nome}
      </Typography>
      {greyed && (
        <Chip
          size="small"
          label={ESCOPO_CHIP_LABEL}
          sx={{ mb: 0.35, height: 20, fontSize: "0.65rem", maxWidth: "100%" }}
        />
      )}
      <Typography
        variant={compact ? "h6" : "h4"}
        fontWeight={800}
        sx={{
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          fontSize: compact ? "1.15rem" : undefined,
          color,
        }}
      >
        {loading ? "…" : (
          <>
            {row.fmt?.indexText ?? "—"}
            <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, mx: 0.45, fontSize: "0.82em" }}>
              ·
            </Box>
            {row.label}
          </>
        )}
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
          {row.fmt ? `Nível ${row.fmt.levelId} · índice iMC` : "Índice iMC"}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 1,
        borderLeft: `3px solid ${color}`,
        backgroundImage: greyed
          ? undefined
          : `linear-gradient(135deg, ${alpha(color, theme.palette.mode === "dark" ? 0.12 : 0.06)} 0%, transparent 62%)`,
        ...(greyed ? escopoGreyedSx(theme) : {}),
        ...(href && !greyed && {
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
          "&:hover": {
            boxShadow: `0 4px 14px ${alpha(color, 0.16)}`,
            transform: "translateY(-1px)",
          },
        }),
      }}
    >
      {href ? (
        <CardActionArea
          component={Link}
          href={href}
          sx={{ height: "100%", alignItems: "stretch" }}
          aria-label={`Abrir ${row.nome}`}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

export function MaturityDiagnosticoSummary({
  items = [],
  diagnosticos,
  loading,
  compact,
  href,
  layout = "panel",
}: Props) {
  const theme = useTheme();
  const rows = useMaturityRows(items, diagnosticos);

  if (layout === "kpi") {
    const cols = rows.length >= 4 ? { xs: 6, sm: 3, md: true as const } : { xs: 6, md: 3 };

    return (
      <Grid container spacing={compact ? 0.75 : 1.25}>
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Grid
                item
                xs={cols.xs}
                sm={"sm" in cols ? cols.sm : undefined}
                md={cols.md}
                key={i}
                sx={cols.md === true ? { minWidth: { md: 0 }, flex: { md: "1 1 0" } } : undefined}
              >
                <Skeleton variant="rounded" height={compact ? 72 : 96} sx={{ borderRadius: 1 }} />
              </Grid>
            ))
          : rows.map((row) => (
              <Grid
                item
                xs={cols.xs}
                sm={"sm" in cols ? cols.sm : undefined}
                md={cols.md}
                key={row.id}
                sx={cols.md === true ? { minWidth: { md: 0 }, flex: { md: "1 1 0" } } : undefined}
              >
                <KpiMaturityCard row={row} compact={compact} href={href} />
              </Grid>
            ))}
      </Grid>
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ display: "block", mb: 0.65, letterSpacing: "0.03em" }}
      >
        Maturidade por diagnóstico
      </Typography>
      {loading ? (
        <Grid container spacing={0.75}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} key={i}>
              <Skeleton variant="rounded" height={44} />
            </Grid>
          ))}
        </Grid>
      ) : rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
          Sem índices ainda.
        </Typography>
      ) : (
        <Grid container spacing={0.75}>
          {rows.map((row) => {
            const greyed = Boolean(row.outOfScope);
            const color = greyed ? theme.palette.text.secondary : (row.fmt?.color ?? theme.palette.text.secondary);
            return (
              <Grid item xs={12} sm={6} key={row.id}>
                <Box
                  sx={{
                    py: 0.55,
                    px: 0.85,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    borderLeft: `3px solid ${color}`,
                    bgcolor: greyed ? undefined : alpha(color, 0.04),
                    height: "100%",
                    ...(greyed ? escopoGreyedSx(theme) : {}),
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    title={row.nome}
                    sx={{ fontSize: "0.75rem", mb: 0.2 }}
                  >
                    {row.nome}
                  </Typography>
                  {greyed && (
                    <Chip
                      size="small"
                      label={ESCOPO_CHIP_LABEL}
                      sx={{ mb: 0.35, height: 18, fontSize: "0.62rem" }}
                    />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 800, color, lineHeight: 1.15, fontSize: "0.88rem" }}>
                    {row.fmt?.indexText ?? "—"}
                    <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, mx: 0.45 }}>
                      ·
                    </Box>
                    {row.label}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
