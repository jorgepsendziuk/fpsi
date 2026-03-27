"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { PoliticaPrivacidadeContent } from "@/components/portal/PortalLegalContent";

export default function PoliticaPrivacidadePage() {
  return (
    <PortalLegalDocShell documentTitle="Política de Privacidade">
      {(data) => <PoliticaPrivacidadeContent data={data} />}
    </PortalLegalDocShell>
  );
}
