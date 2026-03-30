import React from "react";
import { Typography, TypographyProps } from "@mui/material";

/** Estilo base para títulos de tela: neutro, formal, tipografia do tema. */
export const appScreenTitleSx = {
  fontWeight: 600,
  color: "text.primary",
  letterSpacing: "0.02em",
  lineHeight: 1.35,
} as const;

export type AppScreenTitleProps = TypographyProps & {
  /** Padrão h2: o AppBar do shell usa h1 com o nome da rota. */
  component?: React.ElementType;
};

/**
 * Título de página/seção alinhado à tipografia MUI (subtitle1), sem gradiente.
 */
export function AppScreenTitle({
  children,
  component = "h2",
  variant = "subtitle1",
  sx,
  ...rest
}: AppScreenTitleProps) {
  return (
    <Typography component={component} variant={variant} sx={{ ...appScreenTitleSx, ...sx }} {...rest}>
      {children}
    </Typography>
  );
}
