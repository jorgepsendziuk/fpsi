import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material";

/** Identidade visual por seção do panorama (tela e impressão leve). */
export type PanoramaSectionAccent =
  | "diagnostico"
  | "entregas"
  | "sistemas"
  | "decisao"
  | "riscos"
  | "exposicao"
  | "planos"
  | "checklist";

function accentMain(theme: Theme, accent: PanoramaSectionAccent): string {
  switch (accent) {
    case "diagnostico":
      return theme.palette.primary.main;
    case "entregas":
      return theme.palette.success.main;
    case "sistemas":
      return theme.palette.info.main;
    case "decisao":
      return theme.palette.warning.main;
    case "riscos":
      return theme.palette.error.main;
    case "exposicao":
      return "#ed6c02";
    case "planos":
      return theme.palette.secondary?.main ?? "#5e35b1";
    case "checklist":
      return theme.palette.primary.dark;
    default:
      return theme.palette.primary.main;
  }
}

export function getPanoramaSectionPalette(theme: Theme, accent?: PanoramaSectionAccent) {
  const main = accent ? accentMain(theme, accent) : theme.palette.divider;
  return {
    main,
    tint: alpha(main, 0.06),
    tintPrint: alpha(main, 0.035),
    border: alpha(main, 0.22),
    iconBg: alpha(main, 0.14),
    watermark: alpha(main, 0.08),
    watermarkPrint: alpha(main, 0.06),
  };
}