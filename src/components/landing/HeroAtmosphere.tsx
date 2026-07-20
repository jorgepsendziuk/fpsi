"use client";

import { Box } from "@mui/material";
import { landing } from "./landingTokens";

/** Plano visual full-bleed do hero — atmosfera sem o escudo/cadeado. */
export function HeroAtmosphere() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 60% at 78% 40%, ${landing.blue}44 0%, transparent 58%),
          radial-gradient(ellipse 50% 45% at 12% 80%, ${landing.shield}28 0%, transparent 52%),
          radial-gradient(ellipse 35% 30% at 90% 10%, ${landing.lock}18 0%, transparent 45%),
          linear-gradient(160deg, ${landing.ink} 0%, ${landing.navy} 48%, #0C3A66 100%)
        `,
        "@keyframes lpGrid": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "48px 48px" },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 75% 65% at 70% 45%, black 15%, transparent 78%)",
          animation: "lpGrid 28s linear infinite",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            linear-gradient(90deg, ${landing.ink}f2 0%, ${landing.ink}88 42%, transparent 72%),
            linear-gradient(180deg, transparent 60%, ${landing.ink}cc 100%)
          `,
        }}
      />
    </Box>
  );
}
