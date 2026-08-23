"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
} from "@mui/material";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import type { DashboardProgramaResumo, DashboardResumoApi, PendenciasResumo } from "@/lib/types/pendencias";
import { DashboardKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { ConsultorCockpit } from "@/components/dashboard/ConsultorCockpit";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { PendenciasCalendar } from "@/components/dashboard/PendenciasCalendar";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { landing } from "@/components/landing/landingTokens";

const PENDENCIAS_PAGE = 1;
const EMBEDDED_MATRIX_FRAME_PX = 220;
const RIGHT_COL_MAX_H = "calc(100dvh - 200px)";

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

type LeftContext = {
  programasOps: DashboardProgramaResumo[];
};

type Props = {
  left: ReactNode | ((ctx: LeftContext) => ReactNode);
};

export function DashboardOperacionalSection({ left }: Props) {
  const theme = useTheme();
  const [resumo, setResumo] = useState<DashboardResumoApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [modo, setModo] = useState<"operacional" | "executivo">("operacional");

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

  const executivo = modo === "executivo";

  const cardShellSx = {
    height: "100%",
    borderRadius: 1,
    overflow: "hidden" as const,
    "&::before": {
      content: '""',
      display: "block",
      height: 2,
    },
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
      <Box
        sx={{
          mb: 0.25,
          px: { xs: 1.25, md: 1.5 },
          py: 1,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.55 : 0.65),
          backdropFilter: "blur(10px)",
          backgroundImage:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, ${alpha("#0A2744", 0.5)} 0%, transparent 70%)`
              : `linear-gradient(135deg, ${alpha("#E8F1F8", 0.85)} 0%, transparent 70%)`,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <PageHeroHeader
          sx={{
            mb: 0,
            gap: 1.25,
            flex: 1,
            minWidth: 200,
            "& h2": { fontSize: { xs: "1.2rem", md: "1.4rem" }, mb: 0.15, letterSpacing: "-0.025em" },
          }}
          icon={<DashboardCustomizeOutlinedIcon sx={{ fontSize: 26 }} aria-hidden />}
          title={executivo ? "Visão executiva" : "Central operacional"}
          description={
            executivo
              ? "Conformidade, maturidade e exposição — linguagem para diretoria"
              : "Programas, empresas e pendências entre todas as contas"
          }
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          color="primary"
          value={modo}
          onChange={(_, v) => v && setModo(v)}
          sx={{
            alignSelf: "center",
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.divider}`,
            "& .MuiToggleButton-root": { px: 1.5, py: 0.75, textTransform: "none", fontWeight: 600 },
          }}
        >
          <ToggleButton value="operacional">Operacional</ToggleButton>
          <ToggleButton value="executivo">Executivo</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <DashboardKpiStrip
        kpis={resumo?.kpis}
        atrasados={resumo?.pendencias?.atrasados}
        vencendo7d={resumo?.pendencias?.vencendo7d}
        loading={loading}
        compact
        executivo={executivo}
      />

      {!loading && resumo?.programas?.length ? (
        <ConsultorCockpit programas={resumo.programas} />
      ) : null}

      {executivo ? (
        <Card elevation={0} sx={{ ...cardShellSx, p: 2 }}>
          <Box
            component="p"
            sx={{ m: 0, color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.5 }}
          >
            {error
              ? "Não foi possível carregar os indicadores."
              : "Resumo consolidado dos programas. Para o detalhe operacional (calendário e fila), alterne para Operacional."}
          </Box>
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            {(resumo?.programas || []).map((p) => (
              <Grid item xs={12} sm={6} md={4} key={p.programaId}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>{p.nome}</Box>
                  <Box sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                    Maturidade:{" "}
                    {p.maturidadeMedia != null ? Number(p.maturidadeMedia).toFixed(1) : "—"}
                    {" · "}Riscos críticos: {p.riscosCriticos}
                    {" · "}Incidentes: {p.incidentesAbertos}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      ) : (
        <Grid container spacing={1} alignItems="flex-start">
          <Grid item xs={12} lg={6} sx={{ display: "flex" }}>
            {typeof left === "function" ? left({ programasOps: resumo?.programas ?? [] }) : left}
          </Grid>

          <Grid
            item
            xs={12}
            lg={6}
            sx={{ display: "flex", alignSelf: { lg: "stretch" }, maxHeight: { lg: RIGHT_COL_MAX_H } }}
          >
            <Card
              elevation={0}
              sx={{
                ...cardShellSx,
                flex: 1,
                width: "100%",
                maxHeight: { lg: RIGHT_COL_MAX_H },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                "&::before": {
                  ...cardShellSx["&::before"],
                  background: `linear-gradient(90deg, ${landing.blue} 0%, ${landing.shield} 55%, ${landing.lock} 100%)`,
                },
              }}
            >
              <CardContent
                sx={{
                  py: 1,
                  px: 1.25,
                  "&:last-child": { pb: 1 },
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ flexShrink: 0 }}>
                  <PendenciasCalendar
                    bare
                    compact
                    matrixHeight={EMBEDDED_MATRIX_FRAME_PX}
                    itens={resumo?.pendencias?.itens ?? []}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    loading={loading}
                  />
                </Box>
                <Divider sx={{ my: 0.5, flexShrink: 0 }} />
                <PendenciasPanel
                  bare
                  dense
                  fillAvailable
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
                  maxItems={PENDENCIAS_PAGE}
                  peekNext
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
