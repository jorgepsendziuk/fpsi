"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { PoliticaPrivacidadeContent } from "@/components/portal/PortalLegalContent";

export default function PoliticaDePrivacidadePage() {
  return (
    <PortalLegalDocShell documentTitle="Política de Privacidade" pdfDoc="politica">
      {(data) => <PoliticaPrivacidadeContent data={data} />}
    </PortalLegalDocShell>
  );
}
