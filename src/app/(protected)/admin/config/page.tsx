"use client";

import { Container } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminConfigPanel } from "@/components/admin/AdminConfigPanel";

export default function AdminConfigPage() {
  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Configurações"
        icon={<SettingsIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Variáveis de ambiente, saúde do catálogo, administradores do sistema e implantação."
      />
      <AdminConfigPanel />
    </Container>
  );
}
