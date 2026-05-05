"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { RpgCharacterFigure, type RpgFigureVariant } from "./sprites/RpgCharacterFigure";

type Props = {
  href: string;
  title: string;
  subtitle: string;
  empty?: boolean;
  /** Cabeceira — sprite maior + gravata */
  accent?: boolean;
};

function shortLabel(text: string, max = 12): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Personagem RPG 2D (pixel-art) + placa de nome estilo diálogo SNES.
 */
export function GameHotspot({ href, title, subtitle, empty, accent }: Props) {
  const theme = useTheme();
  const pixelSize = accent ? 4 : 3;
  const variant: RpgFigureVariant = empty ? "shadow" : accent ? "director" : "worker";

  return (
    <Box
      component={NextLink}
      href={href}
      title={title}
      aria-label={`${title}. ${subtitle}`}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: accent ? 76 : 58,
        maxWidth: 92,
        textDecoration: "none",
        color: "inherit",
        pointerEvents: "auto",
        transition: "transform 0.15s ease",
        "&:hover": {
          transform: "translateY(-6px)",
        },
        "&:focus-visible": {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 4,
          borderRadius: 1,
        },
      }}
    >
      {/* Balão / placa de nome */}
      <Box
        sx={{
          mb: 0.35,
          px: 0.6,
          py: 0.35,
          minWidth: 52,
          maxWidth: 88,
          bgcolor: empty ? alpha(theme.palette.grey[400], 0.95) : alpha(theme.palette.common.white, 0.96),
          border: "3px solid",
          borderColor: empty ? theme.palette.grey[700] : "#1a1a2e",
          borderRadius: 0,
          boxShadow: "3px 3px 0 rgba(0,0,0,0.55)",
        }}
      >
        <Typography
          sx={{
            fontSize: accent ? "0.48rem" : "0.42rem",
            lineHeight: 1.25,
            fontWeight: 400,
            textAlign: "center",
            color: empty ? "grey.800" : "text.primary",
            wordBreak: "break-word",
          }}
        >
          {shortLabel(subtitle)}
        </Typography>
      </Box>

      {/* Sombra no chão + sprite */}
      <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            transform: "translateX(-50%)",
            width: accent ? 56 : 44,
            height: 10,
            borderRadius: "50%",
            bgcolor: alpha("#000", 0.35),
            filter: "blur(2px)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            opacity: empty ? 0.55 : 1,
            filter: empty ? "grayscale(1)" : "none",
          }}
        >
          <RpgCharacterFigure variant={variant} pixelSize={pixelSize} />
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: "0.45rem",
          lineHeight: 1.15,
          textAlign: "center",
          color: accent ? "warning.dark" : "text.secondary",
          textShadow: "1px 1px 0 rgba(255,255,255,0.4)",
          maxWidth: 88,
        }}
      >
        {shortLabel(title, 18)}
      </Typography>
    </Box>
  );
}
