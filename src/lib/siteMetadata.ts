import type { Metadata } from "next";

export const SITE_ORIGIN = "https://www.fpsi.com.br";

const defaultTitle = "FPSI — Framework de Privacidade e Segurança da Informação";
const defaultDescription =
  "Quem lida com dados pessoais precisa de um programa de privacidade e segurança. O FPSI ajuda a montar e acompanhar diagnóstico, evidências e conformidade LGPD com base no PPSI 2.0.";

const ogImage = {
  url: "/og-home.png",
  width: 1200,
  height: 630,
  alt: "FPSI — privacidade e segurança da informação (PPSI 2.0)",
  type: "image/png",
} as const;

/** Metadados padrão do site (Open Graph / Twitter — WhatsApp, LinkedIn, etc.). */
export const rootSiteMetadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: defaultTitle,
  description: defaultDescription,
  applicationName: "FPSI",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "FPSI",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage.url],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FPSI",
  },
  icons: {
    icon: [
      { url: "/ico_p.png", sizes: "any" },
      { url: "/ico_p.png", type: "image/png" },
    ],
    shortcut: "/ico_p.png",
    apple: "/logo_p.png",
  },
};

export const ogImagePath = ogImage.url;