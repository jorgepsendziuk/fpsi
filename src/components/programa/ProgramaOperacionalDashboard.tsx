"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NextLink from "next/link";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import type { ModulosResumoApi, ProgramaRiscoRow } from "@/lib/services/dataService";
import type { PendenciasResumo } from "@/lib/types/pendencias";
import { PendenciasPanel } from "@/components/dashboard/PendenciasPanel";
import { ProgramaKpiStrip } from "@/components/dashboard/ProgramaKpiStrip";
import { PendenciasCalendar } from "@/components/dashboard/PendenciasCalendar";
import { ModuloNavGrid, type ModuloNavSection } from "@/components/programa/ModuloNavGrid";
import { RiscoHeatmap, type RiscoHeatmapFilter } from "@/components/riscos/RiscoHeatmap";
import { landing } from "@/components/landing/landingTokens";

const LEVEL_SHORT: Record<string, string> = {
  muito_baixo: "1",
  baixo: "2",
  medio: "3",
  alto: "4",
  muito_alto: "5",
};

const PENDENCIAS_PAGE = 1;
const RISCOS_LIST_PAGE = 1;

/** Altura máx. do frame calendário (grade + legenda), alinhada à matriz. */
const EMBEDDED_MATRIX_FRAME_PX = 272;

function scoreOf(r: ProgramaRiscoRow): number {
  if (r.score_residual != null) return r.score_residual;
  if (r.score_inerente != null) return r.score_inerente;
  const p = Number(LEVEL_SHORT[r.probabilidade] || 0);
  const i = Number(LEVEL_SHORT[r.impacto] || 0);
  return p * i;
}

function scoreColor(score: number): string {
  if (score >= 20) return "#C62828";
  if (score >= 12) return "#EF6C00";
  if (score >= 6) return "#F9A825";
  return "#66BB6A";
}

function isRiscoAtivo(r: ProgramaRiscoRow): boolean {
  return r.status !== "encerrado" && r.status !== "mitigado";
}

type Props = {
  idOrSlug: string;
  programaId: number;
  isDemoMode: boolean;
  modulosResumo: ModulosResumoApi | null;
  modulosResumoLoading: boolean;
  sections: ModuloNavSection[];
  onEnableSection?: (key: string) => void;
  programaNome?: string;
};

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
  return { ...pendencias, itens, total: itens.length };
}

/** Painel operacional compacto: KPIs, pendências+calendário | riscos, módulos full width. */
export function ProgramaOperacionalDashboard({
  idOrSlug,
  programaId,
  modulosResumo,
  modulosResumoLoading,
  sections,
  onEnableSection,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [riscos, setRiscos] = useState<ProgramaRiscoRow[]>([]);
  const [riscosLoading, setRiscosLoading] = useState(true);
  const [riscoFilter, setRiscoFilter] = useState<RiscoHeatmapFilter>(null);
  const [riscosShown, setRiscosShown] = useState(RISCOS_LIST_PAGE);

  useEffect(() => {
    if (!programaId) {
      setRiscos([]);
      setRiscosLoading(false);
      return;
    }
    let cancelled = false;
    setRiscosLoading(true);
    dataService
      .fetchProgramaRiscos(programaId)
      .then((rows) => {
        if (!cancelled) setRiscos(rows || []);
      })
      .catch(() => {
        if (!cancelled) setRiscos([]);
      })
      .finally(() => {
        if (!cancelled) setRiscosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const filteredPendencias = useMemo(
    () => filterPendenciasByDay(modulosResumo?.pendencias, selectedDate),
    [modulosResumo?.pendencias, selectedDate]
  );

  const riscosAtivos = useMemo(() => riscos.filter(isRiscoAtivo), [riscos]);

  const riscosFiltrados = useMemo(() => {
    if (riscoFilter) {
      return riscosAtivos.filter(
        (r) => r.probabilidade === riscoFilter.probabilidade && r.impacto === riscoFilter.impacto
      );
    }
    return [...riscos].sort((a, b) => {
      const aAtivo = isRiscoAtivo(a) ? 1 : 0;
      const bAtivo = isRiscoAtivo(b) ? 1 : 0;
      if (aAtivo !== bAtivo) return bAtivo - aAtivo;
      return scoreOf(b) - scoreOf(a);
    });
  }, [riscos, riscosAtivos, riscoFilter]);

  useEffect(() => {
    setRiscosShown(RISCOS_LIST_PAGE);
  }, [riscoFilter, riscosFiltrados.length]);

  const riscosVisiveis = riscosFiltrados.slice(0, riscosShown);
  const riscoPeek =
    riscosShown <= RISCOS_LIST_PAGE && riscosFiltrados.length > riscosVisiveis.length
      ? riscosFiltrados[riscosVisiveis.length]
      : null;
  const riscosRestantes = Math.max(0, riscosFiltrados.length - riscosShown);

  const listTitle = selectedDate
    ? `Pendências · ${selectedDate.format("DD/MM")}`
    : "Pendências prioritárias";

  const renderRiscoRow = (r: ProgramaRiscoRow, peek?: boolean) => {
    const score = scoreOf(r);
    const color = scoreColor(score);
    const ativo = isRiscoAtivo(r);
    return (
      <ListItem key={r.id} disablePadding sx={{ mb: 0.3 }}>
        <ListItemButton
          component={NextLink}
          href={`/programas/${idOrSlug}/riscos`}
          tabIndex={peek ? -1 : undefined}
          sx={{
            borderRadius: 1,
            py: 0.45,
            pointerEvents: peek ? "none" : undefined,
            opacity: ativo ? 1 : 0.75,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            borderLeft: `3px solid ${color}`,
            bgcolor: alpha(color, ativo ? 0.05 : 0.02),
          }}
        >
          <ListItemText
            primary={r.titulo}
            secondary={`${r.status.replace(/_/g, " ")} · score ${score}`}
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: "0.8125rem",
              noWrap: true,
            }}
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

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
      <ProgramaKpiStrip
        postura={modulosResumo?.postura}
        maturidade={modulosResumo?.maturidade}
        atrasados={modulosResumo?.pendencias?.atrasados}
        vencendo7d={modulosResumo?.pendencias?.vencendo7d}
        loading={modulosResumoLoading}
        idOrSlug={idOrSlug}
        compact
      />

      <Grid container spacing={1} alignItems="stretch">
        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              ...cardShellSx,
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
                height: "100%",
              }}
            >
              <PendenciasCalendar
                bare
                compact
                matrixHeight={EMBEDDED_MATRIX_FRAME_PX}
                itens={modulosResumo?.pendencias?.itens ?? []}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                loading={modulosResumoLoading}
              />
              <Divider sx={{ my: 0.5 }} />
              <PendenciasPanel
                bare
                dense
                pendencias={filteredPendencias}
                loading={modulosResumoLoading}
                title={listTitle}
                emptyMessage={
                  selectedDate ? "Nenhuma pendência neste dia." : "Nenhuma pendência operacional."
                }
                maxItems={PENDENCIAS_PAGE}
                peekNext
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card
            elevation={0}
            sx={{
              ...cardShellSx,
              "&::before": {
                ...cardShellSx["&::before"],
                background: `linear-gradient(90deg, #B71C1C 0%, #EF6C00 50%, #F9A825 100%)`,
              },
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, "&:last-child": { pb: 1 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 0.75,
                  mb: 0.35,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.015em">
                  Riscos · matriz P×I
                </Typography>
                <Button
                  component={NextLink}
                  href={`/programas/${idOrSlug}/riscos`}
                  size="small"
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                  sx={{ fontWeight: 700, borderRadius: 1, fontSize: "0.8125rem" }}
                >
                  Gestão
                </Button>
              </Box>

              {riscosLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                  Carregando…
                </Typography>
              ) : (
                <>
                  <Box
                    sx={{
                      px: 0.25,
                      py: 0.25,
                      mb: 0.35,
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                      bgcolor: alpha(theme.palette.background.default, isDark ? 0.35 : 0.4),
                    }}
                  >
                    <RiscoHeatmap
                      riscos={riscos}
                      embedded
                      selected={riscoFilter}
                      onSelect={setRiscoFilter}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {riscoFilter
                        ? `Itens · P${LEVEL_SHORT[riscoFilter.probabilidade] || "?"} × I${LEVEL_SHORT[riscoFilter.impacto] || "?"}`
                        : "Itens"}
                    </Typography>
                    {riscoFilter && (
                      <Chip
                        size="small"
                        label="Limpar"
                        onClick={() => setRiscoFilter(null)}
                        onDelete={() => setRiscoFilter(null)}
                        sx={{ height: 26, fontSize: "0.75rem", fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {riscosFiltrados.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                      {riscoFilter ? "Nenhum risco ativo nesta célula." : "Nenhum risco registrado."}
                    </Typography>
                  ) : (
                    <>
                      <List dense disablePadding>
                        {riscosVisiveis.map((r) => renderRiscoRow(r))}
                      </List>
                      {riscoPeek && (
                        <Box sx={{ position: "relative", mt: -0.15, maxHeight: 38, overflow: "hidden" }}>
                          <List dense disablePadding>{renderRiscoRow(riscoPeek, true)}</List>
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: 0,
                              height: "70%",
                              pointerEvents: "none",
                              background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0)} 0%, ${theme.palette.background.paper} 88%)`,
                            }}
                          />
                        </Box>
                      )}
                      {riscosRestantes > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: riscoPeek ? 0.25 : 0.25 }}>
                          <Button
                            size="small"
                            onClick={() => setRiscosShown((n) => n + RISCOS_LIST_PAGE)}
                            endIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                            sx={{ fontWeight: 700, textTransform: "none", fontSize: "0.8125rem" }}
                          >
                            Carregar mais · {riscosRestantes}
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box
        sx={{
          p: { xs: 1, md: 1.25 },
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          position: "relative",
          bgcolor: alpha(theme.palette.background.paper, isDark ? 0.55 : 0.55),
          backgroundImage: isDark
            ? `linear-gradient(145deg, ${alpha(landing.navy, 0.45)} 0%, transparent 70%)`
            : `linear-gradient(145deg, ${alpha(landing.mist, 0.9)} 0%, transparent 72%)`,
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${landing.blue} 0%, ${landing.shield} 55%, ${landing.lock} 100%)`,
          },
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: "block",
            mb: 1,
            pt: 0.25,
            color: "text.secondary",
            letterSpacing: "0.08em",
            fontSize: "0.8125rem",
          }}
        >
          Módulos do programa
        </Typography>
        <ModuloNavGrid
          sections={sections}
          idOrSlug={idOrSlug}
          layout="wide"
          onEnableSection={onEnableSection}
        />
      </Box>
    </Box>
  );
}
