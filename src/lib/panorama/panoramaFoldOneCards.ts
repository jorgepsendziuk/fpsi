import type { Theme } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export type PanoramaFoldOneCardVariant =
  | "identity"
  | "title"
  | "intro"
  | "executive"
  | "indice"
  | "consultor";

const PALETTE: Record<
  PanoramaFoldOneCardVariant,
  { screenBg: string; screenBorder: string; printBg: string; printBorder: string }
> = {
  identity: {
    screenBg: "#f2f8f7",
    screenBorder: "#c5ddd8",
    printBg: "#eff7f5",
    printBorder: "#a8c9c1",
  },
  title: {
    screenBg: "#faf7f2",
    screenBorder: "#e6d9c8",
    printBg: "#faf6f0",
    printBorder: "#dcc9b0",
  },
  intro: {
    screenBg: "#f4f7f2",
    screenBorder: "#cfd9c8",
    printBg: "#f3f6f1",
    printBorder: "#c0cdb8",
  },
  executive: {
    screenBg: "#faf6f8",
    screenBorder: "#e6d4dc",
    printBg: "#f9f4f6",
    printBorder: "#dbc4ce",
  },
  indice: {
    screenBg: "#f6f5fb",
    screenBorder: "#d5d2e6",
    printBg: "#f4f3f9",
    printBorder: "#c8c4dc",
  },
  consultor: {
    screenBg: "#f1f5f9",
    screenBorder: "#c9d4e3",
    printBg: "#eff4f9",
    printBorder: "#b8c8db",
  },
};

export function panoramaFoldOneCardClass(variant: PanoramaFoldOneCardVariant): string {
  return `panorama-fold-one-card panorama-fold-one-card--${variant}`;
}

/** Caixa da 1ª página: fundo leve, borda e margem via pai `#panorama-fold-one`. */
export function panoramaFoldOneCardSx(variant: PanoramaFoldOneCardVariant): SystemStyleObject<Theme> {
  const c = PALETTE[variant];
  return {
    borderRadius: { xs: 1.5, print: 1 },
    border: 1,
    borderColor: c.screenBorder,
    bgcolor: c.screenBg,
    boxShadow: "none",
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
    "@media print": {
      borderColor: `${c.printBorder} !important`,
      bgcolor: `${c.printBg} !important`,
    },
  };
}