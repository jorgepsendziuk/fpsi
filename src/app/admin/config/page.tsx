"use client";

import { Box, Container, Typography, Paper } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";

export default function AdminConfigPage() {
  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">
          Configurações
        </Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Configurações gerais do sistema. Em desenvolvimento.
        </Typography>
      </Paper>
    </Container>
  );
}
