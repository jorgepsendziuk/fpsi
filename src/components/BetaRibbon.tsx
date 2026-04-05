"use client";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

/**
 * Etiqueta vertical fixa na lateral direita (estilo aba de arquivo), abaixo do AppBar,
 * para não cobrir perfil ou tema. pointer-events: none.
 */
export function BetaRibbon() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const topOffset = (isMdUp ? 64 : 56) + 10;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: topOffset,
        right: 0,
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        zIndex: theme.zIndex.appBar - 1,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          display: "inline-block",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          padding: "12px 5px",
          backgroundColor: "#aa0000",
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0.08) 100%)",
          color: "#fff",
          fontFamily: 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          textShadow: "0 1px 0 rgba(0,0,0,0.35)",
          borderLeft: "1px solid rgba(255,255,255,0.35)",
          borderTop: "1px solid rgba(0,0,0,0.12)",
          borderBottom: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "0px 0 0 0px",
          boxShadow: "-3px 0 10px rgba(0,0,0,0.18)",
        }}
      >
        Beta
      </span>
    </div>
  );
}
