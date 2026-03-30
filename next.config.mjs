// Next.js config (no JSDoc type to avoid IDE analyzing 'next' and its dependencies)
import path from "node:path";
import os from "node:os";
import withSerwistInit from "@serwist/next";

/**
 * Em `next dev`, grava `.next` fora do repo (ex.: /tmp no macOS) para evitar ENOENT em
 * manifests quando a pasta do projeto está em iCloud/Dropbox e apaga ou atrasa ficheiros.
 * Produção (`next build` / `next start`) continua a usar `.next` na raiz.
 * Para forçar `.next` local no dev: FPSI_NEXT_LOCAL_DIST=1 npm run dev
 */
const devDistDir =
  process.env.NODE_ENV === "development" && process.env.FPSI_NEXT_LOCAL_DIST !== "1"
    ? path.join(os.tmpdir(), "fpsi-next-dev")
    : undefined;

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision: "1" }],
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig = {
  ...(devDistDir ? { distDir: devDistDir } : {}),
  turbopack: {},
  /** Dev: cache em memória evita corrupção/ENOENT no disco (ex.: pasta em iCloud/Dropbox). */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  // Acelera dev/build: compila só os imports usados desses pacotes
  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-data-grid',
      '@mui/x-date-pickers',
      '@mui/lab',
    ],
  },
};

export default withSerwist(nextConfig);
