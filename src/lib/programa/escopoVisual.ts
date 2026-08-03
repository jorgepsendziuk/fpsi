import type { SxProps, Theme } from "@mui/material";

/** Estilo para itens fora do escopo: visíveis, consultáveis, sem contar no score. */
export function escopoGreyedSx(theme: Theme): SxProps<Theme> {
  return {
    opacity: 0.62,
    filter: "grayscale(0.35)",
    borderStyle: "dashed !important",
    borderColor: `${theme.palette.divider} !important`,
    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    "&:hover": {
      opacity: 0.82,
      filter: "grayscale(0.15)",
    },
  };
}

export const ESCOPO_CHIP_LABEL = "Fora do escopo";
