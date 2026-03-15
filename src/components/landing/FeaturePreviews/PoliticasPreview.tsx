"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Description as DescriptionIcon } from "@mui/icons-material";

const mockPoliticas = [
  { nome: "Política de Segurança da Informação", tipo: "Segurança" },
  { nome: "Política de Privacidade", tipo: "Privacidade" },
  { nome: "Política de Proteção de Dados", tipo: "Proteção de dados" },
];

export function PoliticasPreview() {
  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Políticas Institucionais
      </Typography>
      <List dense disablePadding>
        {mockPoliticas.map((p, i) => (
          <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <DescriptionIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary={p.nome}
              secondary={p.tipo}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
