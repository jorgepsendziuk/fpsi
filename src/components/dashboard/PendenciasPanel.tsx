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
}: Props) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {pendencias && pendencias.total > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {pendencias.atrasados > 0 && (
                <Chip size="small" color="error" label={`${pendencias.atrasados} atrasado(s)`} />
              )}
              {pendencias.vencendo7d > 0 && (
                <Chip size="small" color="warning" label={`${pendencias.vencendo7d} vence em 7d`} />
              )}
              {pendencias.novos > 0 && (
                <Chip size="small" color="info" label={`${pendencias.novos} novo(s)`} />
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

        {!loading && pendencias && pendencias.itens.length > 0 && (
          <List dense disablePadding>
            {pendencias.itens.map((item) => (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    borderRadius: 1.5,
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
                      <>
                        {item.programaNome && item.subtitulo
                          ? `${item.programaNome} · ${item.subtitulo}`
                          : item.subtitulo || item.programaNome}
                        {item.dataLimite && (
                          <> · Prazo: {dayjs(item.dataLimite).format("DD/MM/YYYY")}</>
                        )}
                      </>
                    }
                    primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                    secondaryTypographyProps={{ fontSize: "0.78rem" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
