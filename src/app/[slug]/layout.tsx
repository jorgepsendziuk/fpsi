"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PortalPublicShell } from "@/components/portal/PortalPublicShell";

export default function PortalSlugLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPanoramaDocument = /\/panorama\/?$/.test(pathname);

  if (isPanoramaDocument) {
    return <>{children}</>;
  }

  return <PortalPublicShell>{children}</PortalPublicShell>;
}