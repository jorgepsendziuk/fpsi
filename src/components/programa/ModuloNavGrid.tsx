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
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { escopoGreyedSx, ESCOPO_CHIP_LABEL } from "@/lib/programa/escopoVisual";

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
  /** Fora do escopo do programa — cinza, consultável, não conta no score */
  outOfScope?: boolean;
};

type Props = {
  sections: ModuloNavSection[];
  idOrSlug: string;
  compact?: boolean;
  dense?: boolean;
  layout?: "default" | "dense" | "wide";
  onEnableSection?: (key: string) => void;
};

function ModuloTile({
  section,
  idOrSlug,
  dense,
  wide,
  compact,
  onEnableSection,
}: {
  section: ModuloNavSection;
  idOrSlug: string;
  dense?: boolean;
  wide?: boolean;
  compact?: boolean;
  onEnableSection?: (key: string) => void;
}) {
  const theme = useTheme();
  const tight = dense || compact;
  const greyed = Boolean(section.outOfScope);
  const featured = Boolean(section.featured) && !greyed;

  return (
    <Card
      sx={{
        height: "100%",
        border: `1px solid ${alpha(section.color, featured ? 0.42 : dense ? 0.2 : 0.22)}`,
        borderRadius: wide ? 1 : dense ? 1.5 : 2,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, opacity 0.15s ease",
        bgcolor: featured
          ? alpha(section.color, theme.palette.mode === "dark" ? 0.12 : 0.06)
          : theme.palette.background.paper,
        boxShadow: featured ? `0 4px 14px ${alpha(section.color, 0.14)}` : undefined,
        ...(greyed ? escopoGreyedSx(theme) : {}),
        ...(!greyed && {
          "&:hover": {
            transform: dense ? "none" : "translateY(-1px)",
            boxShadow: dense ? 1 : 2,
            borderColor: alpha(section.color, 0.45),
          },
        }),
      }}
    >
      <CardActionArea
        component={Link}
        href={`/programas/${idOrSlug}/${section.path}`}
        sx={{ height: "100%", alignItems: "stretch" }}
      >
        <CardContent
          sx={{
            p: dense ? 1 : wide ? 1.5 : tight ? 1.5 : 2,
            "&:last-child": { pb: dense ? 1 : wide ? 1.5 : tight ? 1.5 : 2 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: wide ? "flex-start" : dense ? "center" : "flex-start",
              gap: wide ? 1.25 : dense ? 1 : 1.5,
            }}
          >
            <Box
              sx={{
                width: dense ? 32 : wide ? 44 : 44,
                height: dense ? 32 : wide ? 44 : 44,
                flexShrink: 0,
                borderRadius: dense ? 1 : 1.5,
                background: greyed ? alpha(theme.palette.text.primary, 0.12) : section.gradient,
                color: greyed ? theme.palette.text.secondary : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "& .MuiSvgIcon-root": { fontSize: dense ? 18 : wide ? 22 : 24 },
              }}
            >
              {section.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  lineHeight: 1.35,
                  fontSize: dense ? "0.8125rem" : wide ? "0.9375rem" : undefined,
                  display: dense ? "-webkit-box" : "block",
                  WebkitLineClamp: dense ? 2 : wide ? 2 : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: dense ? "hidden" : "visible",
                }}
              >
                {section.title}
              </Typography>
              {greyed && (
                <Chip
                  size="small"
                  label={ESCOPO_CHIP_LABEL}
                  sx={{ mt: 0.35, height: 20, fontSize: "0.65rem", maxWidth: "100%" }}
                />
              )}
              {section.badge && !greyed && (
                <Chip
                  size="small"
                  label={section.badge}
                  sx={{
                    mt: 0.35,
                    height: dense ? 20 : 24,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    bgcolor: alpha(section.color, 0.14),
                    color: section.color,
                  }}
                />
              )}
              {(wide || !tight) && section.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    mt: 0.45,
                    WebkitLineClamp: wide ? 2 : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    fontSize: wide ? "0.8125rem" : undefined,
                  }}
                >
                  {section.description}
                </Typography>
              )}
            </Box>
            {!dense && (
              <ArrowForwardIcon
                sx={{ fontSize: 18, color: alpha(theme.palette.text.primary, 0.35), mt: 0.25, flexShrink: 0 }}
              />
            )}
          </Box>
          {greyed && onEnableSection && (
            <Chip
              size="small"
              icon={<AddCircleOutlineIcon sx={{ fontSize: "14px !important" }} />}
              label="Incluir no escopo"
              clickable
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEnableSection(section.key);
              }}
              sx={{
                mt: 1,
                height: 24,
                fontSize: "0.7rem",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
              }}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ModuloNavGrid({ sections, idOrSlug, compact, dense, layout, onEnableSection }: Props) {
  const mode = layout ?? (dense ? "dense" : "default");

  if (mode === "dense") {
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
          <ModuloTile key={section.key} section={section} idOrSlug={idOrSlug} dense onEnableSection={onEnableSection} />
        ))}
      </Box>
    );
  }

  if (mode === "wide") {
    return (
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1, md: 1.25 },
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
        }}
      >
        {sections.map((section) => (
          <ModuloTile key={section.key} section={section} idOrSlug={idOrSlug} wide onEnableSection={onEnableSection} />
        ))}
      </Box>
    );
  }

  return (
    <Grid container spacing={compact ? 1.5 : 2}>
      {sections.map((section) => (
        <Grid item xs={12} sm={6} md={4} key={section.key}>
          <ModuloTile section={section} idOrSlug={idOrSlug} compact={compact} onEnableSection={onEnableSection} />
        </Grid>
      ))}
    </Grid>
  );
}
