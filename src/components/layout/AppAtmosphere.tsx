"use client";

import { Box, useTheme } from "@mui/material";
import { landing } from "@/components/landing/landingTokens";

/**
 * Atmosfera suave da área logada — eco da landing sem competir com o conteúdo.
 * Fundo cool (mist/navy/verde), grade sutil e vinheta leve.
 */
export function AppAtmosphere() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: isDark
          ? `
            radial-gradient(ellipse 80% 55% at 100% -5%, ${landing.blue}33 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at -5% 90%, ${landing.shield}22 0%, transparent 50%),
            linear-gradient(165deg, ${landing.ink} 0%, ${landing.navy} 55%, #0C1F33 100%)
          `
          : `
            radial-gradient(ellipse 90% 50% at 100% -8%, ${landing.mist} 0%, transparent 55%),
            radial-gradient(ellipse 60% 45% at -8% 100%, rgba(67,160,71,0.10) 0%, transparent 52%),
            radial-gradient(ellipse 40% 30% at 85% 75%, rgba(249,168,37,0.06) 0%, transparent 45%),
            linear-gradient(165deg, ${landing.paper} 0%, ${landing.mist} 42%, #EEF4F9 100%)
          `,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: isDark ? 0.07 : 0.09,
          backgroundImage: `
            linear-gradient(${isDark ? "rgba(255,255,255,0.07)" : "rgba(10,39,68,0.06)"} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.07)" : "rgba(10,39,68,0.06)"} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse 85% 70% at 50% 20%, black 10%, transparent 75%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: isDark
            ? `linear-gradient(180deg, transparent 70%, ${landing.ink}aa 100%)`
            : `linear-gradient(180deg, transparent 65%, ${landing.paper}cc 100%)`,
        }}
      />
    </Box>
  );
}
