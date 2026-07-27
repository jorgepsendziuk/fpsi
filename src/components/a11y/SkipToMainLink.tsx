"use client";

import React from "react";
import { Box } from "@mui/material";
import { landing } from "@/components/landing/landingTokens";

/** Link “pular conteúdo” (e-MAG / WCAG 2.4.1). */
export function SkipToMainLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <Box
      component="a"
      href={`#${targetId}`}
      sx={{
        position: "absolute",
        left: 8,
        top: 8,
        zIndex: 9999,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        bgcolor: landing.navy,
        color: landing.heroText,
        fontWeight: 700,
        fontSize: "0.875rem",
        textDecoration: "none",
        boxShadow: `0 4px 16px rgba(0,0,0,0.25)`,
        transform: "translateY(-160%)",
        transition: "transform 0.15s ease",
        "&:focus": {
          transform: "translateY(0)",
          outline: `3px solid ${landing.blueBright}`,
          outlineOffset: 2,
        },
      }}
    >
      Ir para o conteúdo principal
    </Box>
  );
}
