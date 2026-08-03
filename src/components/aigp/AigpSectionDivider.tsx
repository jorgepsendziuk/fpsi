"use client";

import React from "react";
import { Box, Divider, Typography, alpha, useTheme } from "@mui/material";
import { RequisitoIaLabel } from "./RequisitoIaLabel";
import { AIGP_ACCENT, aigpBorderColor, aigpSectionBg } from "@/lib/aigp/aigpVisualTokens";

type AigpSectionDividerProps = {
  title?: string;
  subtitle?: string;
};

export function AigpSectionDivider({
  title = "Governança de IA (AIGP)",
  subtitle = "Papéis e registros que alimentam o diagnóstico de Governança de IA — complementares ao PPSI 2.0.",
}: AigpSectionDividerProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 3,
        mb: 2,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: aigpSectionBg(theme),
        border: `1px solid ${aigpBorderColor(theme)}`,
      }}
    >
      <RequisitoIaLabel variant="section" component="div">
        {title}
      </RequisitoIaLabel>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75, pl: 2.75 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Divider sx={{ mt: 1.5, borderColor: alpha(AIGP_ACCENT, 0.15) }} />
    </Box>
  );
}
