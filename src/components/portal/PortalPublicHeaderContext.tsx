"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type PortalPublicHeaderOrgDetails = {
  razao_social?: string | null;
  cnpj?: string | number | null;
  dpo_nome?: string | null;
  dpo_email?: string | null;
  dpo_tipo_pessoa?: string | null;
  dpo_pessoa_natural_nome?: string | null;
  dpo_cnpj?: string | null;
  atendimento_fone?: string | null;
  atendimento_email?: string | null;
  atendimento_site?: string | null;
};

export type PortalPublicHeaderState = {
  slug?: string;
  orgName?: string;
  logoUrl?: string | null;
  orgDetails?: PortalPublicHeaderOrgDetails | null;
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
  orgDetails,
}: {
  slug: string;
  orgName: string;
  logoUrl?: string | null;
  orgDetails?: PortalPublicHeaderOrgDetails | null;
}) {
  const { setHeader } = usePortalPublicHeader();
  const orgDetailsKey = orgDetails ? JSON.stringify(orgDetails) : "";
  React.useEffect(() => {
    setHeader({
      slug,
      orgName,
      logoUrl: logoUrl ?? null,
      orgDetails: orgDetailsKey ? (JSON.parse(orgDetailsKey) as PortalPublicHeaderOrgDetails) : null,
    });
    return () => setHeader({});
  }, [slug, orgName, logoUrl, orgDetailsKey, setHeader]);
  return null;
}
