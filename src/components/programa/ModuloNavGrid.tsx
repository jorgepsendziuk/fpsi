"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
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
  featured?: boolean;
  badge?: string;
};

type Props = {
  sections: ModuloNavSection[];
  idOrSlug: string;
  compact?: boolean;
  /** Grade mais apertada (mais colunas, menos altura) para home single-face. */
  dense?: boolean;
};

function ModuloTile({
  section,
  idOrSlug,
  dense,
  compact,
}: {
  section: ModuloNavSection;
  idOrSlug: string;
  dense?: boolean;
  compact?: boolean;
}) {
  const theme = useTheme();
  const tight = dense || compact;
  const featured = Boolean(section.featured);

  return (
    <Card
      sx={{
        height: "100%",
        border: `1px solid ${alpha(section.color, featured ? 0.42 : dense ? 0.2 : 0.25)}`,
        borderRadius: dense ? 1.5 : 2,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        bgcolor: featured
          ? alpha(section.color, theme.palette.mode === "dark" ? 0.12 : 0.06)
          : theme.palette.background.paper,
        boxShadow: featured ? `0 4px 14px ${alpha(section.color, 0.14)}` : undefined,
        "&:hover": {
          transform: dense ? "none" : "translateY(-2px)",
          boxShadow: dense ? 1 : 3,
          borderColor: alpha(section.color, 0.45),
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/programas/${idOrSlug}/${section.path}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            p: dense ? 1 : tight ? 1.5 : 2,
            "&:last-child": { pb: dense ? 1 : tight ? 1.5 : 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: dense ? "center" : "flex-start",
              gap: dense ? 1 : 1.5,
            }}
          >
            <Box
              sx={{
                width: dense ? 32 : 44,
                height: dense ? 32 : 44,
                flexShrink: 0,
                borderRadius: dense ? 1 : 1.5,
                background: section.gradient,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiSvgIcon-root": { fontSize: dense ? 18 : 24 },
              }}
            >
              {section.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  lineHeight: 1.25,
                  fontSize: dense ? "0.78rem" : undefined,
                  display: "-webkit-box",
                  WebkitLineClamp: dense ? 2 : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {section.title}
              </Typography>
              {section.badge && (
                <Chip
                  size="small"
                  label={section.badge}
                  sx={{
                    mt: 0.4,
                    height: dense ? 18 : 22,
                    fontSize: dense ? "0.62rem" : "0.68rem",
                    fontWeight: 700,
                    bgcolor: alpha(section.color, 0.14),
                    color: section.color,
                  }}
                />
              )}
              {!tight && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {section.description}
                </Typography>
              )}
            </Box>
            {!dense && (
              <ArrowForwardIcon
                sx={{ fontSize: 18, color: alpha(theme.palette.text.primary, 0.4), mt: 0.5 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ModuloNavGrid({ sections, idOrSlug, compact, dense }: Props) {
  if (dense) {
    return (
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(5, 1fr)",
          },
        }}
      >
        {sections.map((section) => (
          <ModuloTile key={section.key} section={section} idOrSlug={idOrSlug} dense />
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={compact ? 1.5 : 2}>
      {sections.map((section) => (
        <Grid item xs={12} sm={6} md={4} key={section.key}>
          <ModuloTile section={section} idOrSlug={idOrSlug} compact={compact} />
        </Grid>
      ))}
    </Grid>
  );
}
