// Next.js config (no JSDoc type to avoid IDE analyzing 'next' and its dependencies)
const nextConfig = {
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

export default nextConfig;
