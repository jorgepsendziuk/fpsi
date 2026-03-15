"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { DEMO_RESPONSAVEIS } from "@/lib/data/demoData";

const papeis = [
  { tipo: "Controlador", nome: "Empresa Demo Tech Ltda" },
  { tipo: "Contratante", nome: "Prestador de Serviços" },
  { tipo: "Operador", nome: "Operador de Dados" },
];

export function ResponsabilidadesPreview() {
  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Estrutura de Tratamento
      </Typography>
      <List dense disablePadding>
        {papeis.map((p, i) => (
          <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
            <ListItemText
              primary={p.nome}
              secondary={p.tipo}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
        Responsáveis: {DEMO_RESPONSAVEIS.slice(0, 2).map((r) => r.nome.split(" ")[0]).join(", ")}
      </Typography>
    </Box>
  );
}
