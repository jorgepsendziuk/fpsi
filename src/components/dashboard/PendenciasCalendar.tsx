"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, type PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import type { PendenciaItem, PendenciaSeveridade } from "@/lib/types/pendencias";
import { landing } from "@/components/landing/landingTokens";

const WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

type DayMeta = {
  count: number;
  worst: PendenciaSeveridade;
};

function worstSeverity(a: PendenciaSeveridade, b: PendenciaSeveridade): PendenciaSeveridade {
  const rank = { critical: 3, warning: 2, info: 1 } as const;
  return rank[a] >= rank[b] ? a : b;
}

function buildDayMap(itens: PendenciaItem[]): Map<string, DayMeta> {
  const map = new Map<string, DayMeta>();
  for (const item of itens) {
    const raw = item.dataLimite || item.dataReferencia;
    if (!raw) continue;
    const key = dayjs(raw).format("YYYY-MM-DD");
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { count: 1, worst: item.severidade });
    } else {
      map.set(key, {
        count: prev.count + 1,
        worst: worstSeverity(prev.worst, item.severidade),
      });
    }
  }
  return map;
}

function formatMonthLabel(month: Dayjs): string {
  const raw = month.locale("pt-br").format("MMMM YYYY");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

type Props = {
  itens: PendenciaItem[];
  selectedDate: Dayjs | null;
  onSelectDate: (date: Dayjs | null) => void;
  loading?: boolean;
  bare?: boolean;
  compact?: boolean;
  /** Altura total do frame (grade + legenda), alinhada à matriz de riscos. */
  matrixHeight?: number;
};

function ServerDay(
  props: PickersDayProps<Dayjs> & {
    dayMap?: Map<string, DayMeta>;
    selectedKey?: string | null;
    cellSize?: number;
  }
) {
  const theme = useTheme();
  const { day, dayMap, selectedKey, outsideCurrentMonth, cellSize, ...other } = props;
  const key = day.format("YYYY-MM-DD");
  const meta = dayMap?.get(key);
  const isSelected = selectedKey === key;

  const dotColor =
    meta?.worst === "critical"
      ? theme.palette.error.main
      : meta?.worst === "warning"
        ? theme.palette.warning.main
        : theme.palette.info.main;

  const size = cellSize ?? 36;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={isSelected}
        sx={{
          width: Math.min(size, 38),
          height: Math.min(size, 38),
          fontWeight: meta ? 700 : 500,
          fontSize: "0.8125rem",
          borderRadius: 1,
          ...(meta &&
            !isSelected && {
              bgcolor: alpha(dotColor, theme.palette.mode === "dark" ? 0.18 : 0.1),
            }),
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
      />
      {meta && !outsideCurrentMonth && (
        <Box
          sx={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.25,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: meta.count > 1 ? 5 : 4,
              height: 4,
              borderRadius: 0.5,
              bgcolor: isSelected ? "common.white" : dotColor,
            }}
          />
          {meta.count > 2 && (
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: 0.5,
                bgcolor: isSelected ? alpha("#fff", 0.7) : alpha(dotColor, 0.7),
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export function PendenciasCalendar({
  itens,
  selectedDate,
  onSelectDate,
  loading,
  bare,
  compact,
  matrixHeight,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dayMap = useMemo(() => buildDayMap(itens), [itens]);
  const frameHeight = matrixHeight ?? (compact ? 272 : undefined);
  const legendH = 22;
  const framePad = 4;
  const gridArea =
    frameHeight != null ? Math.max(180, frameHeight - legendH - framePad) : compact ? 228 : undefined;
  const dayCell =
    gridArea != null ? Math.min(38, Math.max(30, Math.floor((gridArea - 22) / 6))) : compact ? 32 : 36;

  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? dayjs()).startOf("month"));

  const viewMonthKey = viewMonth.format("YYYY-MM");

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate.startOf("month"));
    }
  }, [selectedDate ? selectedDate.format("YYYY-MM") : null]);

  const selectedKey = selectedDate?.format("YYYY-MM-DD") ?? null;
  const selectedMeta = selectedKey ? dayMap.get(selectedKey) : undefined;

  const lineColor = alpha(theme.palette.divider, isDark ? 0.45 : 0.4);
  const cellColumnSx = {
    flex: "1 1 0",
    minWidth: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRight: `1px solid ${lineColor}`,
    "&:last-child": { borderRight: 0 },
  };

  const inner = (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 0.75,
          mb: 0.35,
          px: bare ? 0 : 0,
        }}
      >
        <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.015em" sx={{ flexShrink: 0 }}>
          Calendário
        </Typography>

        {!loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.15, minWidth: 0, flex: 1, justifyContent: "flex-end" }}>
            <IconButton
              size="small"
              aria-label="Mês anterior"
              onClick={() => setViewMonth((m) => m.subtract(1, "month").startOf("month"))}
              sx={{ p: 0.35 }}
            >
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ minWidth: { xs: 96, sm: 108 }, textAlign: "center", fontSize: "0.8125rem", px: 0.25 }}
            >
              {formatMonthLabel(viewMonth)}
            </Typography>
            <IconButton
              size="small"
              aria-label="Próximo mês"
              onClick={() => setViewMonth((m) => m.add(1, "month").startOf("month"))}
              sx={{ p: 0.35 }}
            >
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </IconButton>
            {selectedDate && (
              <Typography
                component="button"
                variant="caption"
                onClick={() => onSelectDate(null)}
                sx={{
                  border: 0,
                  background: "none",
                  cursor: "pointer",
                  color: "primary.main",
                  fontWeight: 700,
                  p: 0,
                  ml: 0.5,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem",
                }}
              >
                Ver todas
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {loading ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: compact ? 2 : 4 }}>
          Carregando…
        </Typography>
      ) : (
        <Box
          sx={{
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
            bgcolor: alpha(theme.palette.background.default, isDark ? 0.35 : 0.4),
            px: 0.25,
            py: 0.25,
            display: "flex",
            flexDirection: "column",
            ...(frameHeight != null ? { maxHeight: frameHeight } : {}),
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <DateCalendar
              key={viewMonthKey}
              value={selectedDate}
              referenceDate={viewMonth}
              onMonthChange={(month) => setViewMonth(month.startOf("month"))}
              dayOfWeekFormatter={(date) => WEEKDAY_PT[date.day()]}
              onChange={(v) => {
                if (!v) {
                  onSelectDate(null);
                  return;
                }
                if (selectedDate && v.isSame(selectedDate, "day")) {
                  onSelectDate(null);
                } else {
                  onSelectDate(v);
                }
              }}
              slots={{ day: ServerDay }}
              slotProps={{
                day: {
                  dayMap,
                  selectedKey,
                  cellSize: dayCell,
                } as object,
              }}
              sx={{
                width: "100%",
                height: "auto",
                flex: "0 0 auto",
                minHeight: 0,
                "&.MuiDateCalendar-root": {
                  width: "100%",
                  height: "auto",
                  maxHeight: gridArea != null ? gridArea : undefined,
                },
                "& .MuiPickersCalendarHeader-root": { display: "none" },
                "& .MuiPickersSlideTransition-root": {
                  overflow: "hidden",
                },
                "& .MuiDayCalendar-root": {
                  width: "100%",
                },
                "& .MuiDayCalendar-header": {
                  display: "flex",
                  width: "100%",
                  margin: 0,
                  padding: 0,
                  borderBottom: `1px solid ${lineColor}`,
                  "& .MuiDayCalendar-weekDayLabel": {
                    ...cellColumnSx,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    height: 22,
                    color: "text.secondary",
                    margin: 0,
                    width: "auto",
                    maxWidth: "none",
                  },
                },
                "& .MuiDayCalendar-weekContainer": {
                  display: "flex",
                  width: "100%",
                  margin: 0,
                  borderBottom: `1px solid ${lineColor}`,
                  "&:last-of-type": { borderBottom: 0 },
                  "& > *": cellColumnSx,
                },
                "& .MuiPickersDay-root": {
                  margin: 0,
                },
              }}
            />
          </LocalizationProvider>

          <Box
            sx={{
              display: "flex",
              gap: compact ? 0.5 : 0.75,
              flexWrap: "wrap",
              alignItems: "center",
              px: 0.25,
              py: 0.25,
              borderTop: `1px solid ${lineColor}`,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: 0.5, bgcolor: "error.main" }} />
              Crítico
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: 0.5, bgcolor: "warning.main" }} />
              Atenção
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: 0.5, bgcolor: "info.main" }} />
              Info
            </Typography>
            {selectedMeta && (
              <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ ml: "auto" }}>
                {selectedMeta.count} neste dia
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </>
  );

  if (bare) {
    return <Box>{inner}</Box>;
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 1,
        overflow: "hidden",
        "&::before": {
          content: '""',
          display: "block",
          height: 3,
          background: `linear-gradient(90deg, ${landing.navy} 0%, ${landing.blue} 50%, ${landing.blueBright} 100%)`,
        },
      }}
    >
      <CardContent sx={{ py: 1.5, px: 1.25, "&:last-child": { pb: 1.5 } }}>{inner}</CardContent>
    </Card>
  );
}
