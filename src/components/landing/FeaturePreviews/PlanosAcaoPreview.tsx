"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, LinearProgress, Chip } from "@mui/material";
import { DEMO_PROGRAMA_MEDIDAS } from "@/lib/data/demoData";

const statusLabels: Record<string, string> = {
  Concluído: "Concluído",
  "Em andamento": "Em andamento",
  "Não iniciado": "Não iniciado",
};

export function PlanosAcaoPreview() {
  const items = Object.values(DEMO_PROGRAMA_MEDIDAS).slice(0, 4);
  const concluidos = items.filter((i) => i.status_plano_acao === "Concluído").length;
  const progress = items.length > 0 ? (concluidos / items.length) * 100 : 0;

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Plano de Trabalho
      </Typography>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 6, borderRadius: 1 }} />
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
            <ListItemText
              primary={item.plano_acao?.slice(0, 40) + (item.plano_acao && item.plano_acao.length > 40 ? "…" : "")}
              secondary={item.status_plano_acao}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
            <Chip
              label={statusLabels[item.status_plano_acao] || item.status_plano_acao}
              size="small"
              color={item.status_plano_acao === "Concluído" ? "success" : item.status_plano_acao === "Em andamento" ? "warning" : "default"}
              sx={{ ml: 0.5, fontSize: 10 }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
