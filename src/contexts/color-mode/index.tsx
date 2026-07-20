"use client";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, createTheme } from "@mui/material/styles";
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

    return createTheme(
      {
        ...baseTheme,
        typography: {
          ...baseTheme.typography,
          fontFamily: "var(--font-brand), Montserrat, system-ui, sans-serif",
          h1: { ...baseTheme.typography?.h1, fontWeight: 800, letterSpacing: "-0.03em" },
          h2: { ...baseTheme.typography?.h2, fontWeight: 800, letterSpacing: "-0.028em" },
          h3: { ...baseTheme.typography?.h3, fontWeight: 800, letterSpacing: "-0.025em" },
          h4: { ...baseTheme.typography?.h4, fontWeight: 800, letterSpacing: "-0.02em" },
          h5: { ...baseTheme.typography?.h5, fontWeight: 800, letterSpacing: "-0.02em" },
          h6: { ...baseTheme.typography?.h6, fontWeight: 700, letterSpacing: "-0.015em" },
          subtitle1: { ...baseTheme.typography?.subtitle1, fontWeight: 700 },
          subtitle2: { ...baseTheme.typography?.subtitle2, fontWeight: 700 },
          overline: {
            ...baseTheme.typography?.overline,
            fontWeight: 700,
            letterSpacing: "0.08em",
          },
          button: {
            ...baseTheme.typography?.button,
            fontWeight: 600,
            textTransform: "none" as const,
          },
        },
        shape: { ...baseTheme.shape, borderRadius: 12 },
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
          background: {
            default: isLight ? landing.paper : landing.ink,
            paper: isLight ? "#FFFFFF" : "#0C1F33",
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
                backgroundImage: isLight
                  ? `radial-gradient(1200px 500px at 0% -10%, ${landing.mist} 0%, transparent 55%),
                     radial-gradient(900px 400px at 100% 0%, rgba(67,160,71,0.06) 0%, transparent 50%)`
                  : `radial-gradient(1000px 480px at 0% -10%, rgba(33,150,243,0.12) 0%, transparent 55%),
                     radial-gradient(800px 360px at 100% 0%, rgba(67,160,71,0.08) 0%, transparent 50%)`,
                backgroundAttachment: "fixed",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                borderColor: isLight ? landing.line : "rgba(244,248,252,0.12)",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
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
          }}
        />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
