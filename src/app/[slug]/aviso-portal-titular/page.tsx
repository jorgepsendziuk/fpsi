"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { AvisoPortalTitularContent } from "@/components/portal/PortalLegalContent";

export default function AvisoPortalTitularPage() {
  return (
    <PortalLegalDocShell documentTitle="Aviso do Portal do Titular">
      {(data) => <AvisoPortalTitularContent data={data} />}
    </PortalLegalDocShell>
  );
}
