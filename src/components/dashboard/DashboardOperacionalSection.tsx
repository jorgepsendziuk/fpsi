"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Chip,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import * as dataService from "@/lib/services/dataService";
import type { DashboardResumoApi } from "@/lib/types/pendencias";
import { DashboardKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { landing } from "@/components/landing/landingTokens";

export function DashboardOperacionalSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [resumo, setResumo] = useState<DashboardResumoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchDashboardResumo()
      .then((d) => {
        if (!cancelled) {
          setResumo(d);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResumo(null);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="overline"
        sx={{
          display: "block",
          mb: 1,
          color: "text.secondary",
          letterSpacing: "0.08em",
          fontSize: "0.68rem",
        }}
      >
        Operação
      </Typography>
      <DashboardKpiStrip kpis={resumo?.kpis} loading={loading} compact />

      <Grid container spacing={1.5} sx={{ mt: 0.25 }}>
        <Grid item xs={12} md={7}>
          <PendenciasPanel
            pendencias={resumo?.pendencias}
            loading={loading}
            title="Pendências prioritárias"
            emptyMessage={
              error
                ? "Não foi possível carregar pendências."
                : "Nenhuma pendência entre seus programas."
            }
            dense
            maxItems={6}
            maxHeight={240}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              height: "100%",
              maxHeight: 240,
              overflow: "auto",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 1.25,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03),
              backgroundImage: isDark
                ? `linear-gradient(145deg, ${alpha(landing.navy, 0.65)} 0%, transparent 75%)`
                : `linear-gradient(145deg, ${alpha(landing.mist, 0.95)} 0%, transparent 75%)`,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                letterSpacing: "0.08em",
                display: "block",
                mb: 0.75,
                color: "text.secondary",
                fontSize: "0.65rem",
              }}
            >
              Programas
            </Typography>
            {loading && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                Carregando…
              </Typography>
            )}
            {!loading && (!resumo?.programas || resumo.programas.length === 0) && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                Nenhum programa vinculado.
              </Typography>
            )}
            {!loading &&
              resumo?.programas.map((p) => (
                <Box
                  key={p.programaId}
                  component={Link}
                  href={p.slug ? `/programas/${p.slug}` : `/programas/${p.programaId}`}
                  sx={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    px: 1,
                    py: 0.65,
                    mb: 0.4,
                    borderRadius: 1.25,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.paper, isDark ? 0.35 : 0.8),
                    transition: "border-color 0.15s ease, background 0.15s ease",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.45),
                      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: "0.8rem" }}>
                      {p.nome}
                    </Typography>
                    {p.maturidadeMedia != null && (
                      <Chip
                        size="small"
                        label={`${Math.round(Number(p.maturidadeMedia) * 10) / 10}%`}
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                  </Box>
                  {(p.pendenciasAtrasadas > 0 || p.dsarAbertos > 0 || p.riscosCriticos > 0) && (
                    <Box sx={{ display: "flex", gap: 0.4, flexWrap: "wrap", mt: 0.4 }}>
                      {p.pendenciasAtrasadas > 0 && (
                        <Chip size="small" color="error" label={`${p.pendenciasAtrasadas} atras.`} sx={{ height: 18, fontSize: "0.62rem" }} />
                      )}
                      {p.dsarAbertos > 0 && (
                        <Chip size="small" color="info" label={`${p.dsarAbertos} DSAR`} sx={{ height: 18, fontSize: "0.62rem" }} />
                      )}
                      {p.riscosCriticos > 0 && (
                        <Chip size="small" color="warning" label={`${p.riscosCriticos} risco`} sx={{ height: 18, fontSize: "0.62rem" }} />
                      )}
                    </Box>
                  )}
                </Box>
              ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
