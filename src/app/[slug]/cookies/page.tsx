"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { CookiesContent } from "@/components/portal/PortalLegalContent";

export default function CookiesPage() {
  return (
    <PortalLegalDocShell documentTitle="Política de Cookies">
      {(data) => <CookiesContent data={data} />}
    </PortalLegalDocShell>
  );
}
