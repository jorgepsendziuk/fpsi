"use client";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";
import useMediaQuery from "@mui/material/useMediaQuery";
import { RefineThemes } from "@refinedev/mui";
import Cookies from "js-cookie";
import React, {
  type PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { landing } from "@/components/landing/landingTokens";

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType
);

type ColorModeContextProviderProps = {
  defaultMode?: string;
};

/** Superfície de card — frosted cool, não branco puro. */
const paperLight = "#F3F7FB";
const paperDark = "#0E2236";

export const ColorModeContextProvider: React.FC<
  PropsWithChildren<ColorModeContextProviderProps>
> = ({ children, defaultMode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState(defaultMode || "light");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useMediaQuery(`(prefers-color-scheme: dark)`);

  useEffect(() => {
    if (isMounted) {
      const theme = Cookies.get("theme") || defaultMode || "light";
      setMode(theme);
    }
  }, [isMounted, defaultMode]);

  const toggleTheme = () => {
    const nextTheme = mode === "light" ? "dark" : "light";
    setMode(nextTheme);
    Cookies.set("theme", nextTheme);
  };

  const themeWithLocale = useMemo(() => {
    const baseTheme = mode === "light" ? RefineThemes.Blue : RefineThemes.BlueDark;
    const isLight = mode === "light";

    const focusRing = `2px solid ${isLight ? landing.blue : landing.blueBright}`;
    const focusOffset = 2;

    return createTheme(
      {
        ...baseTheme,
        typography: {
          ...baseTheme.typography,
          fontFamily: "var(--font-brand), Montserrat, system-ui, sans-serif",
          fontSize: 15,
          h1: { ...baseTheme.typography?.h1, fontWeight: 800, letterSpacing: "-0.03em" },
          h2: { ...baseTheme.typography?.h2, fontWeight: 800, letterSpacing: "-0.028em" },
          h3: { ...baseTheme.typography?.h3, fontWeight: 800, letterSpacing: "-0.025em" },
          h4: { ...baseTheme.typography?.h4, fontWeight: 800, letterSpacing: "-0.02em" },
          h5: { ...baseTheme.typography?.h5, fontWeight: 800, letterSpacing: "-0.02em" },
          h6: { ...baseTheme.typography?.h6, fontWeight: 700, letterSpacing: "-0.015em" },
          subtitle1: { ...baseTheme.typography?.subtitle1, fontWeight: 700, fontSize: "1.05rem" },
          subtitle2: { ...baseTheme.typography?.subtitle2, fontWeight: 700, fontSize: "0.95rem" },
          body1: { ...baseTheme.typography?.body1, fontSize: "1rem", lineHeight: 1.55 },
          body2: { ...baseTheme.typography?.body2, fontSize: "0.925rem", lineHeight: 1.5 },
          caption: { ...baseTheme.typography?.caption, fontSize: "0.8125rem", lineHeight: 1.45 },
          overline: {
            ...baseTheme.typography?.overline,
            fontWeight: 700,
            letterSpacing: "0.08em",
            fontSize: "0.75rem",
          },
          button: {
            ...baseTheme.typography?.button,
            fontWeight: 600,
            fontSize: "0.9rem",
            textTransform: "none" as const,
          },
        },
        shape: { ...baseTheme.shape, borderRadius: 6 },
        palette: {
          ...baseTheme.palette,
          mode: isLight ? "light" : "dark",
          primary: {
            main: isLight ? landing.blue : landing.blueBright,
            dark: landing.navy,
            light: landing.blueBright,
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: isLight ? landing.shieldDeep : landing.shield,
            dark: landing.shieldDeep,
            light: landing.shield,
            contrastText: "#FFFFFF",
          },
          success: {
            ...baseTheme.palette.success,
            main: landing.shield,
            dark: landing.shieldDeep,
          },
          warning: {
            ...baseTheme.palette.warning,
            main: landing.lock,
          },
          info: {
            ...baseTheme.palette.info,
            main: landing.blueBright,
            dark: landing.blue,
          },
          background: {
            default: isLight ? landing.paper : landing.ink,
            paper: isLight ? paperLight : paperDark,
          },
          text: {
            primary: isLight ? landing.text : landing.heroText,
            secondary: isLight ? landing.muted : landing.heroMuted,
          },
          divider: isLight ? landing.line : "rgba(244, 248, 252, 0.12)",
        },
        components: {
          ...baseTheme.components,
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: isLight ? landing.paper : landing.ink,
                backgroundImage: "none",
              },
              "#main-content:focus": {
                outline: "none",
              },
              "@media (prefers-reduced-motion: reduce)": {
                "*": {
                  animationDuration: "0.01ms !important",
                  animationIterationCount: "1 !important",
                  transitionDuration: "0.01ms !important",
                  scrollBehavior: "auto !important",
                },
              },
            },
          },
          MuiButtonBase: {
            defaultProps: {
              disableRipple: false,
            },
            styleOverrides: {
              root: {
                "&:focus-visible": {
                  outline: focusRing,
                  outlineOffset: focusOffset,
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                "&:focus-visible": {
                  outline: focusRing,
                  outlineOffset: focusOffset,
                },
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                "&:focus-visible": {
                  outline: focusRing,
                  outlineOffset: focusOffset,
                  borderRadius: 2,
                },
              },
            },
          },
          MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: {
                backgroundImage: isLight
                  ? `linear-gradient(165deg, ${alpha("#FFFFFF", 0.92)} 0%, ${alpha(landing.mist, 0.55)} 100%)`
                  : "none",
                backgroundColor: isLight ? alpha("#FFFFFF", 0.72) : alpha(paperDark, 0.88),
                borderRadius: 6,
                border: `1px solid ${isLight ? landing.line : "rgba(244,248,252,0.12)"}`,
                backdropFilter: "blur(10px)",
                boxShadow: isLight
                  ? `0 1px 0 ${alpha(landing.navy, 0.04)}, 0 8px 24px ${alpha(landing.navy, 0.06)}`
                  : `0 8px 28px ${alpha("#000", 0.35)}`,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                borderRadius: 6,
              },
              elevation1: {
                boxShadow: isLight
                  ? `0 4px 18px ${alpha(landing.navy, 0.07)}`
                  : `0 4px 18px ${alpha("#000", 0.35)}`,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
              },
              containedPrimary: {
                color: "#FFFFFF",
                background: `linear-gradient(145deg, ${landing.blueBright} 0%, ${landing.blue} 55%, ${landing.navy} 140%)`,
                boxShadow: `0 4px 14px ${alpha(landing.blue, 0.28)}`,
                "&:hover": {
                  color: "#FFFFFF",
                  background: `linear-gradient(145deg, ${landing.blue} 0%, ${landing.navy} 100%)`,
                  boxShadow: `0 6px 18px ${alpha(landing.blue, 0.36)}`,
                },
              },
              containedSecondary: {
                color: "#FFFFFF",
                background: `linear-gradient(145deg, ${landing.shield} 0%, ${landing.shieldDeep} 100%)`,
                boxShadow: `0 4px 14px ${alpha(landing.shieldDeep, 0.28)}`,
              },
              outlined: {
                borderColor: alpha(landing.blue, isLight ? 0.28 : 0.4),
                backgroundColor: isLight ? alpha("#FFFFFF", 0.45) : alpha("#fff", 0.04),
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: 4,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 8,
                border: `1px solid ${isLight ? landing.line : "rgba(244,248,252,0.12)"}`,
                backgroundImage: isLight
                  ? `linear-gradient(180deg, ${alpha("#FFFFFF", 0.98)} 0%, ${alpha(landing.mist, 0.5)} 100%)`
                  : "none",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundImage: "none",
                borderColor: isLight ? landing.line : "rgba(244,248,252,0.12)",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                "&:focus-visible": {
                  outline: focusRing,
                  outlineOffset: focusOffset,
                },
                "&.Mui-selected": {
                  backgroundColor: alpha(landing.blue, isLight ? 0.12 : 0.22),
                  "&:hover": {
                    backgroundColor: alpha(landing.blue, isLight ? 0.18 : 0.28),
                  },
                },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: isLight ? alpha("#FFFFFF", 0.65) : alpha("#fff", 0.04),
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isLight ? landing.line : "rgba(244,248,252,0.16)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 2,
                },
              },
            },
          },
        },
      },
      ptBR
    );
  }, [mode]);

  return (
    <ColorModeContext.Provider
      value={{
        setMode: toggleTheme,
        mode,
      }}
    >
      <ThemeProvider theme={themeWithLocale}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            html: { WebkitFontSmoothing: "auto" },
            body: {
              fontFamily: "var(--font-brand), Montserrat, system-ui, sans-serif",
            },
            ":where(a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])):focus:not(:focus-visible)": {
              outline: "none",
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
