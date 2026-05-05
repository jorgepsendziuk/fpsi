"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

type Props = {
  href: string;
  icon: ReactNode;
  label: string;
  detail: string;
};

export function PaperGameChip({ href, icon, label, detail }: Props) {
  const theme = useTheme();
  return (
    <Box
      component={NextLink}
      href={href}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.warning.light, theme.palette.mode === "dark" ? 0.12 : 0.35),
        border: `2px solid ${alpha(theme.palette.warning.dark, 0.35)}`,
        boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
        textDecoration: "none",
        color: "inherit",
        pointerEvents: "auto",
        minWidth: 120,
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-3px)" },
      }}
    >
      <Box sx={{ color: "warning.dark", opacity: 0.95 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={900} display="block" lineHeight={1.1}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {detail}
        </Typography>
      </Box>
    </Box>
  );
}
