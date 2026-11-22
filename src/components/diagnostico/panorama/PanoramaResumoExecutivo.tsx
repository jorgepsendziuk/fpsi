"use client";

import React from "react";
import { Box, Paper, Stack, Typography, alpha } from "@mui/material";
import {
  PANORAMA_EXECUTIVE_DISCLAIMER,
  PANORAMA_EXECUTIVE_HIGHLIGHTS,
} from "@/lib/panorama/panoramaExecutiveHighlights";
import {
  panoramaFoldOneCardClass,
  panoramaFoldOneCardSx,
} from "@/lib/panorama/panoramaFoldOneCards";

export default function PanoramaResumoExecutivo() {
  return (
    <Paper
      variant="outlined"
      className={`panorama-resumo-executivo panorama-text-left ${panoramaFoldOneCardClass("executive")}`}
      sx={[
        panoramaFoldOneCardSx("executive"),
        {
          p: { xs: 1.5, md: 2, print: 0 },
          mb: { xs: 0, print: 0 },
          textAlign: "left",
          breakInside: "avoid",
        },
      ]}
    >
      <Typography
        variant="subtitle1"
        fontWeight={800}
        sx={{ mb: { xs: 0.75, print: 0.35 }, fontSize: { xs: "1rem", print: "9.5pt" } }}
      >
        Principais pontos de atenção
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: { xs: 1.45, print: 1.25 },
          mb: { xs: 1.25, print: 0.4 },
          fontSize: { xs: "0.86rem", print: "7.5pt" },
        }}
      >
        {PANORAMA_EXECUTIVE_DISCLAIMER}
      </Typography>
      <Stack
        spacing={{ xs: 0.85, print: 0.35 }}
        component="ul"
        sx={{ m: 0, p: 0, listStyle: "none" }}
      >
        {PANORAMA_EXECUTIVE_HIGHLIGHTS.map((item) => (
          <Box
            component="li"
            key={item.id}
            className="panorama-exec-item"
            sx={{
              display: "flex",
              gap: { xs: 1, print: 0.55 },
              alignItems: "flex-start",
              p: { xs: 0.85, print: 0 },
              borderRadius: 1,
              bgcolor: { xs: "rgba(255,255,255,0.65)", print: "transparent" },
              border: { xs: 1, print: 0 },
              borderColor: { xs: "rgba(0,0,0,0.06)", print: "transparent" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: { xs: 32, print: 21 },
                height: { xs: 32, print: 21 },
                borderRadius: 1,
                flexShrink: 0,
                bgcolor: item.softBg,
                color: item.color,
                border: `1px solid ${alpha(item.color, 0.35)}`,
                "@media print": {
                  borderColor: `${alpha(item.color, 0.35)} !important`,
                  bgcolor: `${item.softBg} !important`,
                },
              }}
            >
              <item.Icon sx={{ fontSize: { xs: 18, print: 13 } }} aria-hidden />
            </Box>
            <Typography
              variant="body2"
              sx={{
                pt: { xs: 0.35, print: 0.1 },
                lineHeight: { xs: 1.4, print: 1.22 },
                fontSize: { xs: "0.86rem", print: "7.5pt" },
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {item.texto}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}