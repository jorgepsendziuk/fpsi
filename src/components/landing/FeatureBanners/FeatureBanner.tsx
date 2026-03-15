"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface FeatureBannerProps {
  title: string;
  tagline: string;
  points: string[];
  gradient: string;
  icon?: React.ReactNode;
}

export function FeatureBanner({ title, tagline, points, gradient, icon }: FeatureBannerProps) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 560,
        display: "flex",
        flexDirection: "column",
        background: gradient,
        borderRadius: 2,
        p: 3,
        color: "white",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 50%)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          {icon ?? <CheckCircleOutlineIcon sx={{ fontSize: 32, opacity: 0.9 }} />}
          <Typography variant="h5" fontWeight="bold" sx={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.95, lineHeight: 1.5 }}>
          {tagline}
        </Typography>
        <Box component="ul" sx={{ m: 0, p: 0, pl: 2.5, flex: 1 }}>
          {points.map((point, i) => (
            <Box
              component="li"
              key={i}
              sx={{
                mb: 1.5,
                "&::marker": { color: "rgba(255,255,255,0.9)" },
                fontSize: "0.95rem",
                lineHeight: 1.4,
              }}
            >
              {point}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
