import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FPSI - Framework de Privacidade e Segurança da Informação",
    short_name: "FPSI",
    description: "Sistema de diagnóstico de privacidade e segurança da informação para organizações",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#667eea",
    orientation: "portrait",
    icons: [
      {
        src: "/ico_p.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/ico_p.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo_p.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
