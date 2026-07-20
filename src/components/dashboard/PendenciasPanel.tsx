"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { PendenciasResumo } from "@/lib/types/pendencias";
import dayjs from "dayjs";

type Props = {
  pendencias: PendenciasResumo | null | undefined;
  loading?: boolean;
  title?: string;
  emptyMessage?: string;
  dense?: boolean;
  maxItems?: number;
  maxHeight?: number | string;
};

function severidadeIcon(sev: string) {
  if (sev === "critical") return <ErrorOutlineIcon color="error" fontSize="small" />;
  if (sev === "warning") return <WarningAmberIcon color="warning" fontSize="small" />;
  return <InfoOutlinedIcon color="info" fontSize="small" />;
}

export function PendenciasPanel({
  pendencias,
  loading,
  title = "Pendências",
  emptyMessage = "Nenhuma pendência no momento.",
  dense,
  maxItems,
  maxHeight,
}: Props) {
  const theme = useTheme();
  const itens = pendencias?.itens ?? [];
  const visible = typeof maxItems === "number" ? itens.slice(0, maxItems) : itens;
  const hiddenCount = Math.max(0, itens.length - visible.length);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        maxHeight: maxHeight,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.72 : 0.92),
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          py: dense ? 1.25 : 2,
          px: dense ? 1.5 : 2,
          "&:last-child": { pb: dense ? 1.25 : 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: dense ? 1 : 1.5,
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Typography variant={dense ? "subtitle2" : "subtitle1"} fontWeight={700}>
            {title}
          </Typography>
          {pendencias && pendencias.total > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {pendencias.atrasados > 0 && (
                <Chip size="small" color="error" label={`${pendencias.atrasados} atras.`} />
              )}
              {pendencias.vencendo7d > 0 && (
                <Chip size="small" color="warning" label={`${pendencias.vencendo7d} em 7d`} />
              )}
              {pendencias.novos > 0 && (
                <Chip size="small" color="info" label={`${pendencias.novos} novo`} />
              )}
            </Box>
          )}
        </Box>

        {loading && (
          <Typography variant="body2" color="text.secondary">
            Carregando…
          </Typography>
        )}

        {!loading && (!pendencias || pendencias.itens.length === 0) && (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        )}

        {!loading && visible.length > 0 && (
          <List
            dense
            disablePadding
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: maxHeight ? "auto" : "visible",
            }}
          >
            {visible.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: dense ? 0.35 : 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 1.5,
                    py: dense ? 0.6 : 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    bgcolor:
                      item.severidade === "critical"
                        ? alpha(theme.palette.error.main, 0.06)
                        : item.severidade === "warning"
                          ? alpha(theme.palette.warning.main, 0.06)
                          : "transparent",
                  }}
                >
                  <Box sx={{ mr: 1, display: "flex", alignItems: "center" }}>
                    {severidadeIcon(item.severidade)}
                  </Box>
                  <ListItemText
                    primary={item.titulo}
                    secondary={
                      dense ? (
                        item.dataLimite ? `Prazo: ${dayjs(item.dataLimite).format("DD/MM/YYYY")}` : item.subtitulo
                      ) : (
                        <>
                          {item.programaNome && item.subtitulo
                            ? `${item.programaNome} · ${item.subtitulo}`
                            : item.subtitulo || item.programaNome}
                          {item.dataLimite && (
                            <> · Prazo: {dayjs(item.dataLimite).format("DD/MM/YYYY")}</>
                          )}
                        </>
                      )
                    }
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: dense ? "0.82rem" : "0.9rem",
                      noWrap: Boolean(dense),
                    }}
                    secondaryTypographyProps={{ fontSize: dense ? "0.7rem" : "0.78rem" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {hiddenCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, flexShrink: 0 }}>
            +{hiddenCount} pendência(s)
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
