"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { TermoUsoContent } from "@/components/portal/PortalLegalContent";

export default function TermoUsoPage() {
  return (
    <PortalLegalDocShell documentTitle="Termo de Uso">
      {(data) => <TermoUsoContent data={data} />}
    </PortalLegalDocShell>
  );
}
