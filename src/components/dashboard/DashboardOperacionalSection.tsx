"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import * as dataService from "@/lib/services/dataService";
import type { DashboardResumoApi } from "@/lib/types/pendencias";
import { DashboardKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";

export function DashboardOperacionalSection() {
  const theme = useTheme();
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
    <Box sx={{ mb: 5 }}>
      <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Central operacional do DPO
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Pendências, prazos e indicadores consolidados de todos os seus programas.
      </Typography>

      <DashboardKpiStrip kpis={resumo?.kpis} loading={loading} />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <PendenciasPanel
            pendencias={resumo?.pendencias}
            loading={loading}
            title="Pendências prioritárias"
            emptyMessage={
              error
                ? "Não foi possível carregar pendências."
                : "Nenhuma pendência entre seus programas."
            }
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%", border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                Programas
              </Typography>
              {loading && (
                <Typography variant="body2" color="text.secondary">
                  Carregando…
                </Typography>
              )}
              {!loading && (!resumo?.programas || resumo.programas.length === 0) && (
                <Typography variant="body2" color="text.secondary">
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
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1.5,
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {p.nome}
                      </Typography>
                      {p.maturidadeMedia != null && (
                        <Chip size="small" label={`${p.maturidadeMedia}%`} color="primary" variant="outlined" />
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.75 }}>
                      {p.pendenciasAtrasadas > 0 && (
                        <Chip size="small" color="error" label={`${p.pendenciasAtrasadas} atrasada(s)`} />
                      )}
                      {p.dsarAbertos > 0 && (
                        <Chip size="small" color="info" label={`${p.dsarAbertos} DSAR`} />
                      )}
                      {p.riscosCriticos > 0 && (
                        <Chip size="small" color="warning" label={`${p.riscosCriticos} risco(s)`} />
                      )}
                    </Box>
                  </Box>
                ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 4 }} />
    </Box>
  );
}
