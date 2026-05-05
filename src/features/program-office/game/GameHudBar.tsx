"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import type { ModulosResumoApi } from "@/lib/services/dataService";
import { pickEducationalHint } from "./gameHints";

type Props = {
  programaId: number;
  base: string;
  resumo: ModulosResumoApi | null;
};

/** Barra inferior estilo HUD: dica PPSI + atalhos rápidos. */
export function GameHudBar({ programaId, base, resumo }: Props) {
  const theme = useTheme();
  const hint = pickEducationalHint(programaId);
  const matPct =
    resumo?.maturidade?.length && resumo.maturidade[0]?.score != null
      ? `${Math.round(Number(resumo.maturidade[0].score) * 100)}%`
      : "—";

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 5,
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.grey[900], 0.92)
            : alpha(theme.palette.grey[900], 0.88),
        color: alpha(theme.palette.common.white, 0.95),
        borderTop: `3px solid ${alpha(theme.palette.primary.main, 0.45)}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
          <LightbulbOutlinedIcon sx={{ color: "warning.light", flexShrink: 0, mt: 0.25 }} />
          <Typography variant="body2" sx={{ lineHeight: 1.45, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
            {hint}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="caption" sx={{ opacity: 0.85, mr: 0.5 }}>
            Atalhos:
          </Typography>
          <Tooltip title={`Diagnóstico · maturidade indicativa ${matPct}`}>
            <IconButton
              component={NextLink}
              href={`${base}/diagnostico`}
              size="small"
              sx={{ color: "common.white", border: `1px solid ${alpha("#fff", 0.25)}` }}
              aria-label="Abrir diagnóstico e níveis de maturidade"
            >
              <DashboardOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Plano de trabalho">
            <IconButton
              component={NextLink}
              href={`${base}/planos-acao`}
              size="small"
              sx={{ color: "common.white", border: `1px solid ${alpha("#fff", 0.25)}` }}
              aria-label="Plano de trabalho"
            >
              <AssignmentOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Políticas">
            <IconButton
              component={NextLink}
              href={`${base}/politicas`}
              size="small"
              sx={{ color: "common.white", border: `1px solid ${alpha("#fff", 0.25)}` }}
              aria-label="Políticas e documentos"
            >
              <PolicyOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Histórico / auditoria">
            <IconButton
              component={NextLink}
              href={`${base}/auditoria`}
              size="small"
              sx={{ color: "common.white", border: `1px solid ${alpha("#fff", 0.25)}` }}
              aria-label="Auditoria"
            >
              <HistoryOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}
