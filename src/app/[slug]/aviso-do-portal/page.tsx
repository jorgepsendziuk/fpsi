"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { AvisoPortalTitularContent } from "@/components/portal/PortalLegalContent";

export default function AvisoDoPortalPage() {
  return (
    <PortalLegalDocShell documentTitle="Aviso do Portal do Titular" pdfDoc="aviso">
      {(data) => <AvisoPortalTitularContent data={data} />}
    </PortalLegalDocShell>
  );
}
