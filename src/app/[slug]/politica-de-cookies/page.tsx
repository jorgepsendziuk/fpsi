"use client";

import { PortalLegalDocShell } from "@/components/portal/PortalLegalDocShell";
import { CookiesContent } from "@/components/portal/PortalLegalContent";

export default function PoliticaDeCookiesPage() {
  return (
    <PortalLegalDocShell documentTitle="Política de Cookies" pdfDoc="cookies">
      {(data) => <CookiesContent data={data} />}
    </PortalLegalDocShell>
  );
}
