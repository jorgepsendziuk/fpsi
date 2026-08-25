"use client";

import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import { landing, featureAccents } from "@/components/landing/landingTokens";

export type PortalSectionTone = "primary" | "shield" | "neutral";

const toneStyles: Record<
  PortalSectionTone,
  { gradient: string; shadow: string }
> = {
  primary: {
    gradient: `linear-gradient(135deg, ${landing.blue} 0%, ${landing.blueBright} 100%)`,
    shadow: `0 4px 14px ${alpha(landing.blue, 0.35)}`,
  },
  shield: {
    gradient: `linear-gradient(135deg, ${landing.shieldDeep} 0%, ${landing.shield} 100%)`,
    shadow: `0 4px 14px ${alpha(landing.shield, 0.35)}`,
  },
  neutral: {
    gradient: featureAccents["portal-privacidade"],
    shadow: `0 4px 14px ${alpha(landing.navy, 0.2)}`,
  },
};

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  tone?: PortalSectionTone;
  mb?: number;
};

/** Cabeçalho padronizado das seções do portal público. */
export function PortalSectionHeader({
  icon,
  title,
  subtitle,
  tone = "primary",
  mb = 2,
}: Props) {
  const style = toneStyles[tone];

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.5,
          background: style.gradient,
          color: "#fff",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          boxShadow: style.shadow,
          "& .MuiSvgIcon-root": { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, pt: 0.15 }}>
        <Typography variant="subtitle1" component="h2" fontWeight={800} lineHeight={1.25}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.4 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
