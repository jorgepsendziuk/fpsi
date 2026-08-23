import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do auditor · FPSI",
  description:
    "Visão somente leitura do programa de privacidade e segurança da informação para auditoria e due diligence.",
};

export default function AuditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
