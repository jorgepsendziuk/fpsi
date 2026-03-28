// Next.js config (no JSDoc type to avoid IDE analyzing 'next' and its dependencies)
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/offline", revision: "1" }],
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig = {
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
