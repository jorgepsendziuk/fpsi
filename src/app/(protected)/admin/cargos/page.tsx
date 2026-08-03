"use client";

import AdminSimpleEntityPage from "@/components/admin/AdminSimpleEntityPage";
import { Badge as BadgeIcon } from "@mui/icons-material";

export default function AdminCargosPage() {
  return (
    <AdminSimpleEntityPage
      title="Cargos"
      description="Cargos institucionais disponíveis para perfis de usuário."
      icon={<BadgeIcon sx={{ fontSize: 30 }} aria-hidden />}
      apiPath="cargos"
      entityLabel="Cargo"
    />
  );
}
