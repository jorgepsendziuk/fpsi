import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

/** Next.js 16 removeu `next lint`; o CLI do ESLint usa este flat config. */
const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    ".next */**",
    "**/.next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/swe-worker*.js",
    "var/**",
    "database/**",
    "supabase/functions/**",
  ]),
  {
    rules: {
      // eslint-plugin-react-hooks v7 (React Compiler) — ainda não alinhado ao código atual
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
]);

export default eslintConfig;
