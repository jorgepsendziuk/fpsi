"use client";

import { Container, Typography, Paper } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

export default function AdminConfigPage() {
  return (
    <Container maxWidth="md">
      <PageHeroHeader
        title="Configurações"
        icon={<SettingsIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Parâmetros gerais do sistema (em desenvolvimento)."
      />
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Configurações gerais do sistema. Em desenvolvimento.
        </Typography>
      </Paper>
    </Container>
  );
}
