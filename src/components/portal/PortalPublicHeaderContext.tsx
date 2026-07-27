"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type PortalPublicHeaderState = {
  slug?: string;
  orgName?: string;
  logoUrl?: string | null;
};

type Ctx = {
  header: PortalPublicHeaderState;
  setHeader: React.Dispatch<React.SetStateAction<PortalPublicHeaderState>>;
};

const PortalPublicHeaderContext = createContext<Ctx | null>(null);

export function PortalPublicHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeader] = useState<PortalPublicHeaderState>({});
  const value = useMemo(() => ({ header, setHeader }), [header]);
  return <PortalPublicHeaderContext.Provider value={value}>{children}</PortalPublicHeaderContext.Provider>;
}

export function usePortalPublicHeader() {
  const ctx = useContext(PortalPublicHeaderContext);
  if (!ctx) {
    throw new Error("usePortalPublicHeader must be used within PortalPublicHeaderProvider");
  }
  return ctx;
}

/** Atualiza título/logo da barra conforme dados do programa. */
export function PortalPublicHeaderSync({
  slug,
  orgName,
  logoUrl,
}: {
  slug: string;
  orgName: string;
  logoUrl?: string | null;
}) {
  const { setHeader } = usePortalPublicHeader();
  React.useEffect(() => {
    setHeader({ slug, orgName, logoUrl: logoUrl ?? null });
    return () => setHeader({});
  }, [slug, orgName, logoUrl, setHeader]);
  return null;
}
