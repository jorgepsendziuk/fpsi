"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Chip } from "@mui/material";

const mockAtividades = [
  { acao: "Medida IG.01.01 atualizada", usuario: "João Silva", data: "12/03/2025 14:32" },
  { acao: "Controle AC.01 avaliado", usuario: "Maria Oliveira", data: "12/03/2025 11:15" },
  { acao: "Política de privacidade criada", usuario: "Carlos Lima", data: "11/03/2025 16:45" },
];

export function AuditoriaPreview() {
  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Histórico de Atividades
      </Typography>
      <List dense disablePadding>
        {mockAtividades.map((a, i) => (
          <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
            <ListItemText
              primary={a.acao}
              secondary={`${a.usuario} · ${a.data}`}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        LGPD art. 37 · Framework FPSI Controle 8
      </Typography>
    </Box>
  );
}
