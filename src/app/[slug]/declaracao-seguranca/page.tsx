"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { DeclaracaoSegurancaContent } from "@/components/portal/PortalLegalContent";

export default function DeclaracaoSegurancaPage() {
  return (
    <PortalLegalDocShell documentTitle="Declaração de Segurança">
      {(data) => <DeclaracaoSegurancaContent data={data} />}
    </PortalLegalDocShell>
  );
}
