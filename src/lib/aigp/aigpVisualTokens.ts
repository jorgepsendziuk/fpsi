import { alpha, type Theme } from "@mui/material/styles";
import { getDiagnosticoTheme } from "@/lib/utils/diagnosticoThemes";

/** Texto de requisitos IA em telas mescladas com PPSI (azul escuro legível). */
export const AIGP_TEXT = "#0A2744";

/** Acento para ícones/links de IA assistida (alinhado ao mapeamento / landing). */
export const AIGP_ACCENT = "#1565C0";

/** Domínio diagnóstico AIGP (id 4) — roxo, coerente com diagnosticoThemes. */
export const AIGP_DOMAIN = "#7E57C2";

export const DIAGNOSTICO_IA_ID = 4;

export function aigpTextSx() {
  return {
    color: AIGP_TEXT,
    fontWeight: 600,
  } as const;
}

export function aigpSectionBg(theme: Theme, opacity = 0.06) {
  return alpha(AIGP_ACCENT, theme.palette.mode === "dark" ? opacity * 1.4 : opacity);
}

export function aigpBorderColor(theme: Theme) {
  return alpha(AIGP_ACCENT, theme.palette.mode === "dark" ? 0.35 : 0.22);
}

/** Tema do eixo AIGP no diagnóstico (cards, nav bar). */
export function getAigpDiagnosticoTheme() {
  return getDiagnosticoTheme(DIAGNOSTICO_IA_ID);
}
