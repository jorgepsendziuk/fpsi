import React from 'react';
import { Typography, TypographyProps, useTheme, useMediaQuery, Box } from '@mui/material';

interface PageTitleProps extends Omit<TypographyProps, 'variant'> {
  /**
   * Variante do título
   * - 'primary': Gradiente primário (usado em páginas como "Programas")
   * - 'secondary': Gradiente alternativo (usado em páginas como "Responsáveis")
   * - 'page-header': Para headers de página
   * - 'section-header': Para títulos de seção
   */
  variant?: 'primary' | 'secondary' | 'page-header' | 'section-header';
  
  /**
   * Ícone para exibir junto ao título
   */
  icon?: React.ReactNode;
  
  /**
   * Se verdadeiro, força o uso de tipografia mobile
   */
  forceMobile?: boolean;
  
  children: React.ReactNode;
}

/**
 * Componente para títulos padronizados seguindo o design system FPSI
 * 
 * @example
 * // Título principal da página
 * <PageTitle variant="secondary" icon={<SecurityIcon />}>
 *   Diagnóstico
 * </PageTitle>
 * 
 * @example
 * // Título de seção
 * <PageTitle variant="section-header">
 *   Configurações
 * </PageTitle>
 */
export const PageTitle: React.FC<PageTitleProps> = ({
  variant = 'secondary',
  icon,
  forceMobile = false,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')) || forceMobile;
  
  // Para variantes com gradiente, precisamos de estrutura especial
  const hasGradient = variant === 'primary' || variant === 'secondary' || variant === 'page-header';
  
  if (hasGradient) {
    return (
      <Typography
        {...props}
        variant={variant === 'secondary' ? (isMobile ? 'h5' : 'h4') : 'h4'}
        sx={{
          fontWeight: 'bold',
          mb: 1,
          background: variant === 'secondary' 
            ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
            : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: icon ? 'flex' : 'block',
          alignItems: icon ? 'center' : 'flex-start',
          ...sx
        }}
      >
        {icon && (
          <Box
            component="span"
            sx={{
              mr: 1,
              color: variant === 'secondary' ? '#667eea' : theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
        )}
        {children}
      </Typography>
    );
  }

  // Para variantes sem gradiente
  return (
    <Typography
      {...props}
      variant="h5"
      sx={{
        fontWeight: 600,
        mb: 1,
        color: theme.palette.text.primary,
        display: icon ? 'flex' : 'block',
        alignItems: icon ? 'center' : 'flex-start',
        ...sx
      }}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            mr: 1,
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {icon}
        </Box>
      )}
      {children}
    </Typography>
  );
};

export default PageTitle;