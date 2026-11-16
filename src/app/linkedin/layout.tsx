import type { Metadata } from "next";
import { ogImagePath } from "@/lib/siteMetadata";

const title = "FPSI — Conheça o sistema (PPSI 2.0 open source)";
const description =
  "Prévias interativas do FPSI: diagnóstico PPSI, portal do titular, riscos, IA no mapeamento, governança de IA e código aberto.";

/** Vitrine publicável — capa LinkedIn + demos ao vivo + rascunhos de posts. */
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: "FPSI — Framework de Privacidade e Segurança da Informação",
    description: "Explore ao vivo os módulos do programa PPSI 2.0 em ambiente web open source.",
    url: "/linkedin",
    type: "website",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "FPSI — privacidade e segurança da informação (PPSI 2.0)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FPSI — Framework de Privacidade e Segurança da Informação",
    description: "Explore ao vivo os módulos do programa PPSI 2.0 em ambiente web open source.",
    images: [ogImagePath],
  },
  robots: { index: true, follow: true },
};

export default function LinkedInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
