import type { SxProps, Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { featureAccents, landing } from "@/components/landing/landingTokens";

/** Faixa superior colorida (cards do portal público). */
export const portalAccentBefore = {
  content: '""',
  display: "block",
  height: 3,
  background: featureAccents["portal-privacidade"],
} as const;

export function portalPanelSx(theme: Theme, opts?: { accentTop?: boolean; tint?: "primary" | "shield" | "none" }): SxProps<Theme> {
  const isDark = theme.palette.mode === "dark";
  const tint = opts?.tint ?? "none";
  const tintBg =
    tint === "primary"
      ? alpha(landing.blue, isDark ? 0.14 : 0.06)
      : tint === "shield"
        ? alpha(landing.shield, isDark ? 0.12 : 0.05)
        : alpha(theme.palette.background.paper, isDark ? 0.65 : 0.9);

  return {
    position: "relative",
    overflow: "hidden",
    borderRadius: 1.5,
    border: `1px solid ${alpha(isDark ? "#fff" : landing.navy, isDark ? 0.12 : 0.1)}`,
    bgcolor: tintBg,
    backdropFilter: "blur(10px)",
    boxShadow: isDark ? `0 8px 28px ${alpha("#000", 0.25)}` : `0 8px 24px ${alpha(landing.navy, 0.06)}`,
    ...(opts?.accentTop && {
      "&::before": portalAccentBefore,
    }),
  };
}

export const portalHeroBandSx: SxProps<Theme> = {
  borderRadius: 1.5,
  overflow: "hidden",
  mb: 2.5,
  background: featureAccents["portal-privacidade"],
  color: landing.heroText,
  boxShadow: (t) => `0 10px 32px ${alpha(landing.navy, t.palette.mode === "dark" ? 0.45 : 0.18)}`,
};
