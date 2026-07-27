"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import type { DashboardResumoApi, PendenciasResumo } from "@/lib/types/pendencias";
import { DashboardKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { PendenciasCalendar } from "@/components/dashboard/PendenciasCalendar";
import { landing } from "@/components/landing/landingTokens";
import { alpha } from "@mui/material/styles";

function filterPendenciasByDay(
  pendencias: PendenciasResumo | null | undefined,
  day: Dayjs | null
): PendenciasResumo | null | undefined {
  if (!pendencias || !day) return pendencias;
  const key = day.format("YYYY-MM-DD");
  const itens = pendencias.itens.filter((item) => {
    const raw = item.dataLimite || item.dataReferencia;
    return raw ? dayjs(raw).format("YYYY-MM-DD") === key : false;
  });
  return {
    ...pendencias,
    itens,
    total: itens.length,
  };
}

export function DashboardOperacionalSection() {
  const [resumo, setResumo] = useState<DashboardResumoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

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

  const filteredPendencias = useMemo(
    () => filterPendenciasByDay(resumo?.pendencias, selectedDate),
    [resumo?.pendencias, selectedDate]
  );

  const listTitle = selectedDate
    ? `Pendências · ${selectedDate.format("DD/MM")}`
    : "Pendências prioritárias";

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        sx={{
          mb: 1.75,
          px: 2,
          py: 1.35,
          borderRadius: 1,
          border: `1px solid ${alpha(landing.navy, 0.1)}`,
          background: `
            radial-gradient(ellipse 70% 140% at 100% 0%, ${alpha(landing.blueBright, 0.22)} 0%, transparent 55%),
            linear-gradient(120deg, ${landing.ink} 0%, ${landing.navy} 48%, #0C3A66 100%)
          `,
          color: landing.heroText,
        }}
      >
        <Typography variant="overline" sx={{ color: landing.heroMuted, letterSpacing: "0.1em" }}>
          Central operacional
        </Typography>
        <Typography variant="h6" fontWeight={800} letterSpacing="-0.025em" sx={{ lineHeight: 1.2, mt: 0.15 }}>
          Indicadores e pendências
        </Typography>
      </Box>
      <DashboardKpiStrip
        kpis={resumo?.kpis}
        atrasados={resumo?.pendencias?.atrasados}
        vencendo7d={resumo?.pendencias?.vencendo7d}
        loading={loading}
      />

      <Grid container spacing={{ xs: 1.25, lg: 1.5 }} sx={{ mt: 0.25 }} alignItems="stretch">
        <Grid item xs={12} md={7} lg={8}>
          <PendenciasPanel
            pendencias={filteredPendencias}
            loading={loading}
            title={listTitle}
            emptyMessage={
              error
                ? "Não foi possível carregar pendências."
                : selectedDate
                  ? "Nenhuma pendência neste dia."
                  : "Nenhuma pendência entre seus programas."
            }
            maxItems={selectedDate ? 8 : 5}
          />
        </Grid>
        <Grid item xs={12} md={5} lg={4}>
          <PendenciasCalendar
            itens={resumo?.pendencias?.itens ?? []}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
