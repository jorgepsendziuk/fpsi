"use client";

import { Container, Typography, Paper, Button, Alert } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";

export default function AdminConfigPage() {
  return (
    <Container maxWidth="md">
      <PageHeroHeader
        title="Configurações"
        icon={<SettingsIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Implantação, variáveis de ambiente e verificação do banco."
      />
      <Paper sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Use o assistente de implantação para configurar Supabase, gerar <code>.env.local</code> e validar
          migrações.
        </Alert>
        <Typography color="text.secondary" paragraph>
          Indicado na primeira instalação ou ao apontar o app para um novo projeto Supabase.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RocketLaunchIcon />}
          href="/setup"
        >
          Abrir implantação guiada
        </Button>
      </Paper>
    </Container>
  );
}
