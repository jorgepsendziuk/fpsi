"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { TermoUsoContent } from "@/components/portal/PortalLegalContent";

export default function TermosDeUsoPage() {
  return (
    <PortalLegalDocShell documentTitle="Termos de Uso" pdfDoc="termo">
      {(data) => <TermoUsoContent data={data} />}
    </PortalLegalDocShell>
  );
}
