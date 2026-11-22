import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FPSI — Ferramenta de Privacidade e Segurança da Informação",
    short_name: "FPSI",
    description:
      "Plataforma que integra referenciais de privacidade, segurança da informação e governança de IA (LGPD, PPSI 2.0 e correlatos).",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#667eea",
    orientation: "portrait",
    icons: [
      {
        src: "/ico_p.png",
        sizes: "44x49",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_p.png",
        sizes: "275x277",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_p.png",
        sizes: "275x277",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
