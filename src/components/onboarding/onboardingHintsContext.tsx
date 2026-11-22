"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
const ONBOARDING_HINTS_ENABLED = process.env.NEXT_PUBLIC_ONBOARDING_HINTS !== "0";

type OnboardingHintsControl = {
  manualShowAll: boolean;
  toggleManualShowAll: () => void;
  setManualShowAll: (open: boolean) => void;
};

const OnboardingHintsContext = createContext<OnboardingHintsControl | null>(null);

export function OnboardingHintsProvider({ children }: { children: React.ReactNode }) {
  const [manualShowAll, setManualShowAll] = useState(false);
  const toggleManualShowAll = useCallback(() => setManualShowAll((v) => !v), []);

  const value = useMemo(
    () => ({
      manualShowAll,
      toggleManualShowAll,
      setManualShowAll,
    }),
    [manualShowAll, toggleManualShowAll]
  );

  return <OnboardingHintsContext.Provider value={value}>{children}</OnboardingHintsContext.Provider>;
}

export function useOnboardingHintsControl(): OnboardingHintsControl {
  const ctx = useContext(OnboardingHintsContext);
  if (!ctx) {
    throw new Error("useOnboardingHintsControl must be used within OnboardingHintsProvider");
  }
  return ctx;
}

export function useOnboardingHintsControlOptional(): OnboardingHintsControl | null {
  return useContext(OnboardingHintsContext);
}

type OnboardingHelpIconButtonProps = {
  /** Ícone claro sobre fundo escuro do menu lateral */
  onDark?: boolean;
  size?: "small" | "medium";
};

export function OnboardingHelpIconButton({ onDark = false, size = "small" }: OnboardingHelpIconButtonProps) {
  const theme = useTheme();
  const { manualShowAll, toggleManualShowAll } = useOnboardingHintsControl();

  if (!ONBOARDING_HINTS_ENABLED) return null;

  const active = manualShowAll;
  const label = active ? "Ocultar dicas do painel" : "Ver dicas do painel";

  return (
    <Tooltip title={label} placement="bottom">
      <IconButton
        size={size}
        aria-label={label}
        aria-pressed={active}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleManualShowAll();
        }}
        sx={
          onDark
            ? {
                color: active ? theme.palette.primary.light : alpha("#fff", 0.82),
                bgcolor: active ? alpha(theme.palette.primary.main, 0.22) : alpha("#fff", 0.06),
                border: `1px solid ${active ? alpha(theme.palette.primary.light, 0.45) : alpha("#fff", 0.1)}`,
                "&:hover": {
                  bgcolor: active ? alpha(theme.palette.primary.main, 0.32) : alpha("#fff", 0.12),
                },
              }
            : {
                color: active ? "primary.main" : "text.secondary",
                bgcolor: active ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
              }
        }
      >
        <HelpOutlineIcon fontSize={size === "small" ? "small" : "medium"} />
      </IconButton>
    </Tooltip>
  );
}