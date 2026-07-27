import React from "react";
import { PortalPublicShell } from "@/components/portal/PortalPublicShell";

export default function PortalSlugLayout({ children }: { children: React.ReactNode }) {
  return <PortalPublicShell>{children}</PortalPublicShell>;
}
