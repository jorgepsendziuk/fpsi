"use client";

import { Box } from "@mui/material";
import type { SeloMetalPalette, SeloPlanoId } from "@/lib/programa/seloLgpd";
import { getSeloPlano } from "@/lib/programa/seloLgpd";
import { landing } from "@/components/landing/landingTokens";

export type SeloLgpdBadgeProps = {
  plano: SeloPlanoId;
  palette: SeloMetalPalette;
  greyed?: boolean;
  revealColors?: boolean;
  size?: number;
  uid?: string;
  className?: string;
};

/** Escudo só com segmentos retos (sem arcos). */
const SHIELD_OUTER = "M 20 8 L 180 8 L 180 120 L 100 192 L 20 120 Z";
const SHIELD_MID = "M 30 18 L 170 18 L 170 116 L 100 180 L 30 116 Z";
const SHIELD_FACE = "M 40 26 L 160 26 L 160 112 L 100 170 L 40 112 Z";

/**
 * Selo LGPD em escudo — borda metálica, logo FPSI e plano.
 * Sem rótulo bronze/prata/ouro no desenho.
 */
export function SeloLgpdBadge({
  plano,
  palette,
  greyed = false,
  revealColors = false,
  size = 114,
  uid = "selo",
  className,
}: SeloLgpdBadgeProps) {
  const planoDef = getSeloPlano(plano);
  const desaturate = greyed && !revealColors;
  const g = (name: string) => `${uid}-${name}`;
  const height = Math.round(size * 1.12);

  return (
    <Box
      className={className}
      sx={{
        width: size,
        height,
        position: "relative",
        flexShrink: 0,
        filter: desaturate ? "grayscale(1) brightness(0.92) contrast(0.9)" : "none",
        opacity: desaturate ? 0.5 : 1,
        transition: "filter 0.35s ease, opacity 0.35s ease, transform 0.35s ease",
        transform: revealColors && greyed ? "scale(1.05)" : "scale(1)",
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
        },
      }}
      aria-hidden
    >
      <svg viewBox="0 0 200 200" width={size} height={height} role="img" style={{ display: "block" }}>
        <defs>
          <linearGradient id={g("metal")} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.metalLight} />
            <stop offset="45%" stopColor={palette.metal} />
            <stop offset="100%" stopColor={palette.metalDeep} />
          </linearGradient>
          <linearGradient id={g("face")} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor={landing.mist} />
            <stop offset="100%" stopColor="#C5D7EA" />
          </linearGradient>
          <linearGradient id={g("band")} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={landing.navy} />
            <stop offset="100%" stopColor={landing.blue} />
          </linearGradient>
          <filter id={g("soft")} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#0A2744" floodOpacity="0.28" />
          </filter>
          <clipPath id={g("logoClip")}>
            <rect x="68" y="60" width="64" height="64" />
          </clipPath>
        </defs>

        <path d={SHIELD_OUTER} fill={`url(#${g("metal")})`} filter={`url(#${g("soft")})`} />
        <path d={SHIELD_MID} fill={palette.ring} opacity="0.25" />
        <path d={SHIELD_FACE} fill={`url(#${g("face")})`} />

        <path
          d="M 48 34 L 152 34 L 152 108 L 100 158 L 48 108 Z"
          fill="none"
          stroke={`url(#${g("metal")})`}
          strokeWidth="2"
        />

        <text
          x="100"
          y="42"
          textAnchor="middle"
          fill={palette.ink}
          fontSize="14"
          fontWeight="800"
          letterSpacing="1.4"
          style={{ fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif" }}
        >
          LGPD
        </text>
        <text
          x="100"
          y="56"
          textAnchor="middle"
          fill={palette.ink}
          fontSize="11.5"
          fontWeight="700"
          letterSpacing="1"
          style={{ fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif" }}
        >
          COMPLIANCE
        </text>

        <rect x="66" y="58" width="68" height="68" fill={`url(#${g("metal")})`} opacity="0.3" />
        <rect x="68" y="60" width="64" height="64" fill={landing.blue} />
        <image
          href="/logo_p.png"
          x="68"
          y="60"
          width="64"
          height="64"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${g("logoClip")})`}
        />

        {/* Faixa do plano — larga o bastante só onde o escudo ainda é largo */}
        <rect x="54" y="128" width="92" height="26" fill={`url(#${g("band")})`} />
        <rect x="54" y="128" width="92" height="2" fill={palette.metalLight} opacity="0.75" />
        <text
          x="100"
          y="147"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="800"
          letterSpacing="0.9"
          style={{ fontFamily: "ui-sans-serif, system-ui, Segoe UI, sans-serif" }}
        >
          {planoDef.shortLabel.toUpperCase()}
        </text>
      </svg>
    </Box>
  );
}
