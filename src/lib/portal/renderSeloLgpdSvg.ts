import { landing } from "@/components/landing/landingTokens";
import { getSeloPlano, type ResolveSeloLgpdResult } from "@/lib/programa/seloLgpd";

const SHIELD_OUTER = "M 20 8 L 180 8 L 180 120 L 100 192 L 20 120 Z";
const SHIELD_MID = "M 30 18 L 170 18 L 170 116 L 100 180 L 30 116 Z";
const SHIELD_FACE = "M 40 26 L 160 26 L 160 112 L 100 170 L 40 112 Z";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** SVG autocontido para embed em site institucional (`<img src="...">`). */
export function renderSeloLgpdSvg(result: ResolveSeloLgpdResult, opts?: { uid?: string }): string {
  const uid = opts?.uid ?? "selo";
  const palette = result.displayPalette;
  const plano = getSeloPlano(result.plano);
  const label = esc(plano.shortLabel.toUpperCase());
  const greyFilter = result.greyed
    ? `<filter id="${uid}-grey"><feColorMatrix type="saturate" values="0"/></filter>`
    : "";
  const gAttr = result.greyed ? ` filter="url(#${uid}-grey)" opacity="0.55"` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="224" role="img" aria-label="Selo LGPD ${esc(plano.label)}">
  <defs>
    ${greyFilter}
    <linearGradient id="${uid}-metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.metalLight}"/>
      <stop offset="45%" stop-color="${palette.metal}"/>
      <stop offset="100%" stop-color="${palette.metalDeep}"/>
    </linearGradient>
    <linearGradient id="${uid}-face" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="${landing.mist}"/>
      <stop offset="100%" stop-color="#C5D7EA"/>
    </linearGradient>
    <linearGradient id="${uid}-band" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${landing.navy}"/>
      <stop offset="100%" stop-color="${landing.blue}"/>
    </linearGradient>
  </defs>
  <g${gAttr}>
    <path d="${SHIELD_OUTER}" fill="url(#${uid}-metal)"/>
    <path d="${SHIELD_MID}" fill="${palette.ring}" opacity="0.25"/>
    <path d="${SHIELD_FACE}" fill="url(#${uid}-face)"/>
    <path d="M 48 34 L 152 34 L 152 108 L 100 158 L 48 108 Z" fill="none" stroke="url(#${uid}-metal)" stroke-width="2"/>
    <text x="100" y="42" text-anchor="middle" fill="${palette.ink}" font-size="14" font-weight="800" letter-spacing="1.4" font-family="ui-sans-serif, system-ui, sans-serif">LGPD</text>
    <text x="100" y="56" text-anchor="middle" fill="${palette.ink}" font-size="11.5" font-weight="700" letter-spacing="1" font-family="ui-sans-serif, system-ui, sans-serif">COMPLIANCE</text>
    <rect x="66" y="58" width="68" height="68" fill="url(#${uid}-metal)" opacity="0.3"/>
    <rect x="68" y="60" width="64" height="64" fill="${landing.blue}"/>
    <text x="100" y="98" text-anchor="middle" fill="#FFFFFF" font-size="16" font-weight="800" font-family="ui-sans-serif, system-ui, sans-serif">FPSI</text>
    <rect x="54" y="128" width="92" height="26" fill="url(#${uid}-band)"/>
    <rect x="54" y="128" width="92" height="2" fill="${palette.metalLight}" opacity="0.75"/>
    <text x="100" y="147" text-anchor="middle" fill="#FFFFFF" font-size="13" font-weight="800" letter-spacing="0.9" font-family="ui-sans-serif, system-ui, sans-serif">${label}</text>
  </g>
</svg>`;
}
