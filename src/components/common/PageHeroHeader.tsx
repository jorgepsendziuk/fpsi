import React from "react";
import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { landing } from "@/components/landing/landingTokens";

const iconBoxSx: SxProps<Theme> = {
  width: 44,
  height: 44,
  flexShrink: 0,
  borderRadius: 1.5,
  bgcolor: "primary.main",
  color: "primary.contrastText",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: (t) =>
    t.palette.mode === "dark"
      ? `linear-gradient(145deg, ${landing.navy} 0%, ${landing.blue} 100%)`
      : `linear-gradient(145deg, ${landing.blue} 0%, ${landing.blueBright} 100%)`,
  boxShadow: (t) =>
    `0 2px 10px ${t.palette.mode === "dark" ? "rgba(0,0,0,0.35)" : "rgba(21, 101, 192, 0.28)"}`,
};

const titleSx: SxProps<Theme> = {
  fontWeight: 800,
  mb: 0.25,
  color: "text.primary",
  lineHeight: 1.2,
  letterSpacing: "-0.025em",
};

export type PageHeroHeaderProps = {
  title: React.ReactNode;
  /** Texto simples ou bloco (links, várias linhas). */
  description?: React.ReactNode;
  /** Ícone dentro do quadrado (tamanho ~26). Ignorado se `iconSlot` for definido. */
  icon?: React.ReactNode;
  /** Substitui o quadrado padrão (ex.: logo do programa). */
  iconSlot?: React.ReactNode;
  titleComponent?: "h1" | "h2";
  /** Conteúdo à direita no desktop (ex.: botões de ação). */
  trailing?: React.ReactNode;
  sx?: SxProps<Theme>;
  className?: string;
};

/**
 * Cabeçalho compacto alinhado à tipografia da landing FPSI.
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
  const defaultIcon = icon ?? <ArticleOutlinedIcon sx={{ fontSize: 24 }} aria-hidden />;

  return (
    <Box
      className={className}
      sx={{
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.25,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          flex: "1 1 280px",
          minWidth: 0,
        }}
      >
        {iconSlot ?? <Box sx={iconBoxSx}>{defaultIcon}</Box>}
        <Box sx={{ flex: "1 1 180px", minWidth: 0 }}>
          <Typography
            variant="h5"
            component={titleComponent}
            sx={{ ...titleSx, fontSize: { xs: "1.15rem", md: "1.35rem" }, mb: hasDesc ? 0.2 : 0 }}
          >
            {title}
          </Typography>
          {hasDesc ? (
            <Box
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: 1.4,
                "& .MuiTypography-root": { color: "inherit" },
              }}
            >
              {typeof description === "string" ? (
                <Typography variant="body2" component="span" color="inherit" sx={{ fontSize: "inherit" }}>
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
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
            display: "flex",
            justifyContent: { xs: "stretch", sm: "flex-end" },
          }}
        >
          {trailing}
        </Box>
      ) : null}
    </Box>
  );
}
