import type { Metadata } from "next";

/** Rota de apoio à publicação no LinkedIn — capa + rascunho do artigo. */
export const metadata: Metadata = {
  title: "Artigo LinkedIn — FPSI",
  description: "Capa e rascunho do artigo sobre a implementação open source do Framework PPSI 2.0.",
  robots: { index: false, follow: false },
};

export default function LinkedInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
