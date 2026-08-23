"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { DeclaracaoSegurancaContent } from "@/components/portal/PortalLegalContent";

export default function DeclaracaoDeSegurancaPage() {
  return (
    <PortalLegalDocShell documentTitle="Declaração de Segurança" pdfDoc="declaracao">
      {(data) => <DeclaracaoSegurancaContent data={data} />}
    </PortalLegalDocShell>
  );
}
