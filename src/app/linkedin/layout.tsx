import type { Metadata } from "next";
import { ogImagePath } from "@/lib/siteMetadata";

const title = "FPSI — Ferramenta de Privacidade e Segurança da Informação";
const description =
  "Prévias interativas do FPSI: diagnóstico de maturidade, portal do titular, riscos, IA no mapeamento, governança de IA e código aberto (MIT).";

/** Vitrine publicável — capa LinkedIn + demos ao vivo + rascunhos de posts. */
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: "FPSI — Ferramenta de Privacidade e Segurança da Informação",
    description: "Explore ao vivo módulos de privacidade, segurança e governança de IA em ambiente web open source.",
    url: "/linkedin",
    type: "website",
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "FPSI — Ferramenta de Privacidade e Segurança da Informação",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FPSI — Ferramenta de Privacidade e Segurança da Informação",
    description: "Explore ao vivo módulos de privacidade, segurança e governança de IA em ambiente web open source.",
    images: [ogImagePath],
  },
  robots: { index: true, follow: true },
};

export default function LinkedInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
