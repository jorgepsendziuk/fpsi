import type { Metadata } from "next";

/** Vitrine publicável — capa LinkedIn + demos ao vivo + rascunhos de posts. */
export const metadata: Metadata = {
  title: "FPSI — Conheça o sistema (PPSI 2.0 open source)",
  description:
    "Prévias interativas do FPSI: diagnóstico PPSI, portal do titular, riscos, IA no mapeamento, governança de IA e código aberto.",
  openGraph: {
    title: "FPSI — Framework de Privacidade e Segurança da Informação",
    description: "Explore ao vivo os módulos do programa PPSI 2.0 em ambiente web open source.",
    url: "https://www.fpsi.com.br/linkedin",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function LinkedInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
