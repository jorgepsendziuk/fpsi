"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export type ModuloNavSection = {
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  color: string;
  gradient: string;
};

type Props = {
  sections: ModuloNavSection[];
  idOrSlug: string;
  compact?: boolean;
};

export function ModuloNavGrid({ sections, idOrSlug, compact }: Props) {
  const theme = useTheme();

  return (
    <Grid container spacing={compact ? 1.5 : 2}>
      {sections.map((section) => (
        <Grid item xs={12} sm={6} md={4} key={section.key}>
          <Card
            sx={{
              height: "100%",
              border: `1px solid ${alpha(section.color, 0.25)}`,
              borderRadius: 2,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
            }}
          >
            <CardActionArea
              component={Link}
              href={`/programas/${idOrSlug}/${section.path}`}
              sx={{ height: "100%", alignItems: "stretch" }}
            >
              <CardContent sx={{ p: compact ? 1.5 : 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      background: section.gradient,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                      {section.title}
                    </Typography>
                    {!compact && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        {section.description}
                      </Typography>
                    )}
                  </Box>
                  <ArrowForwardIcon sx={{ fontSize: 18, color: alpha(theme.palette.text.primary, 0.4), mt: 0.5 }} />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
