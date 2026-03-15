"use client";

import React from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Chip } from "@mui/material";
import { Folder as FolderIcon, CheckCircleOutline } from "@mui/icons-material";
import { DEMO_DIAGNOSTICOS, DEMO_CONTROLES } from "@/lib/data/demoData";

export function DiagnosticoPreview() {
  const firstDiagnostico = DEMO_DIAGNOSTICOS[0];
  const controles = firstDiagnostico ? DEMO_CONTROLES[firstDiagnostico.id as keyof typeof DEMO_CONTROLES] || [] : [];

  return (
    <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Diagnósticos
      </Typography>
      <List dense disablePadding>
        {DEMO_DIAGNOSTICOS.slice(0, 3).map((d) => (
          <ListItem key={d.id} disablePadding sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <FolderIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText primary={d.descricao} primaryTypographyProps={{ variant: "body2" }} />
          </ListItem>
        ))}
      </List>
      {firstDiagnostico && controles.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Controles ({firstDiagnostico.descricao})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
            {controles.slice(0, 4).map((c: { numero: string; nome: string }) => (
              <Chip key={c.numero} label={`${c.numero}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
