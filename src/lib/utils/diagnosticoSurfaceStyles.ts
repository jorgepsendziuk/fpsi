import { alpha, type Theme } from "@mui/material/styles";
import type { DiagnosticoTheme } from "./diagnosticoThemes";

/** Painel glass/pill alinhado ao DiagnosticoNavBar e cards da visão geral. */
export function diagnosticoGlassPanel(theme: Theme, accentColor?: string) {
  const accent = accentColor ?? theme.palette.primary.main;
  return {
    borderRadius: 2.5,
    border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.55 : 0.88),
    backdropFilter: "blur(10px)",
    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
    ...(accentColor
      ? {
          borderLeft: `4px solid ${accent}`,
        }
      : {}),
  };
}

/** Faixa de cabeçalho com gradiente do eixo (estrutura, segurança, privacidade, AIGP). */
export function diagnosticoHeaderBand(diagTheme: DiagnosticoTheme) {
  return {
    px: { xs: 2, sm: 2.5 },
    py: { xs: 1.75, sm: 2 },
    borderRadius: 2.5,
    background: diagTheme.gradient,
    color: "#fff",
    boxShadow: `0 8px 28px ${alpha(diagTheme.color, 0.22)}`,
  };
}

/** Chip/badge sobre fundo gradiente (id de medida ou número do controle). */
export function diagnosticoHeaderBadge() {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    px: 1.25,
    py: 0.5,
    borderRadius: 1.5,
    fontWeight: 800,
    fontSize: "0.875rem",
    bgcolor: alpha("#fff", 0.18),
    border: `1px solid ${alpha("#fff", 0.28)}`,
    backdropFilter: "blur(8px)",
    flexShrink: 0,
  };
}

/** Seção informativa com leve tint da cor do eixo. */
export function diagnosticoInfoSection(theme: Theme, accentColor: string) {
  return {
    ...diagnosticoGlassPanel(theme),
    borderLeft: `4px solid ${accentColor}`,
    bgcolor: alpha(accentColor, theme.palette.mode === "dark" ? 0.08 : 0.05),
    overflow: "hidden",
  };
}
