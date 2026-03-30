import React from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";

const iconBoxSx: SxProps<Theme> = {
  width: 56,
  height: 56,
  flexShrink: 0,
  borderRadius: 2,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: (t) =>
    `0 2px 8px ${t.palette.mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(25, 118, 210, 0.28)"}`,
};

const titleSx: SxProps<Theme> = {
  fontWeight: 800,
  mb: 0.5,
  color: "text.primary",
  lineHeight: 1.25,
  letterSpacing: "-0.02em",
};

export type PageHeroHeaderProps = {
  title: React.ReactNode;
  /** Texto simples ou bloco (links, várias linhas). */
  description?: React.ReactNode;
  /** Ícone dentro do quadrado 56×56 (tamanho ~30). Ignorado se `iconSlot` for definido. */
  icon?: React.ReactNode;
  /** Substitui o quadrado padrão (ex.: logo do programa maior). */
  iconSlot?: React.ReactNode;
  titleComponent?: "h1" | "h2";
  /** Conteúdo à direita no desktop (ex.: botões de ação). */
  trailing?: React.ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
};

/**
 * Cabeçalho de página alinhado à referência LGPD: quadrado primário + título h4 forte + descrição opcional.
 */
export function PageHeroHeader({
  title,
  description,
  icon,
  iconSlot,
  titleComponent = "h2",
  trailing,
  sx,
  className,
}: PageHeroHeaderProps) {
  const hasDesc = description != null && description !== false;
  const defaultIcon = icon ?? <ArticleOutlinedIcon sx={{ fontSize: 30 }} aria-hidden />;

  return (
    <Box
      className={className}
      sx={{
        mb: 3,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2.5,
          flexWrap: "wrap",
          flex: "1 1 320px",
          minWidth: 0,
        }}
      >
        {iconSlot ?? <Box sx={iconBoxSx}>{defaultIcon}</Box>}
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <Typography variant="h4" component={titleComponent} sx={{ ...titleSx, mb: hasDesc ? 0.5 : 0 }}>
            {title}
          </Typography>
          {hasDesc ? (
            <Box
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                "& .MuiTypography-root": { color: "inherit" },
              }}
            >
              {typeof description === "string" ? (
                <Typography variant="body2" component="span" color="inherit">
                  {description}
                </Typography>
              ) : (
                description
              )}
            </Box>
          ) : null}
        </Box>
      </Box>
      {trailing ? (
        <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" }, display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" } }}>
          {trailing}
        </Box>
      ) : null}
    </Box>
  );
}
