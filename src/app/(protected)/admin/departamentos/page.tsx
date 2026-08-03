"use client";

import AdminSimpleEntityPage from "@/components/admin/AdminSimpleEntityPage";
import { Business as BusinessIcon } from "@mui/icons-material";

export default function AdminDepartamentosPage() {
  return (
    <AdminSimpleEntityPage
      title="Departamentos"
      description="Departamentos institucionais para perfis e cadastro de responsáveis."
      icon={<BusinessIcon sx={{ fontSize: 30 }} aria-hidden />}
      apiPath="departamentos"
      entityLabel="Departamento"
    />
  );
}
