import React from 'react';
import { Button, ButtonProps, Fab, FabProps, useTheme, alpha } from '@mui/material';

interface StandardButtonProps extends ButtonProps {
  /**
   * Variante do botão
   * - 'primary': Botão principal com gradiente
   * - 'secondary': Botão secundário
   * - 'outlined': Botão com borda
   * - 'text': Botão de texto
   */
  buttonVariant?: 'primary' | 'secondary' | 'outlined' | 'text';
}

interface StandardFabProps extends FabProps {
  /**
   * Variante do FAB
   * - 'primary': FAB principal com gradiente
   * - 'secondary': FAB secundário
   */
  fabVariant?: 'primary' | 'secondary';
}

/**
 * Botão padronizado seguindo o design system FPSI
 */
export const StandardButton: React.FC<StandardButtonProps> = ({
  buttonVariant = 'primary',
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 2,
      textTransform: 'none' as const,
      fontWeight: 600,
      px: 3,
      py: 1.5,
    };

    switch (buttonVariant) {
      case 'primary':
        return {
          ...baseStyles,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          },
        };
      
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
        };
      
      case 'outlined':
        return {
          ...baseStyles,
          border: `2px solid ${theme.palette.primary.main}`,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        };
      
      case 'text':
        return {
          ...baseStyles,
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        };
      
      default:
        return baseStyles;
    }
  };
  
  return (
    <Button
      {...props}
      sx={{
        ...getButtonStyles(),
        ...sx
      }}
    >
      {children}
    </Button>
  );
};

/**
 * FAB padronizado seguindo o design system FPSI
 */
export const StandardFab: React.FC<StandardFabProps> = ({
  fabVariant = 'primary',
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  const getFabStyles = () => {
    switch (fabVariant) {
      case 'primary':
        return {
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
          },
        };
      
      case 'secondary':
        return {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
        };
      
      default:
        return {};
    }
  };
  
  return (
    <Fab
      {...props}
      sx={{
        ...getFabStyles(),
        ...sx
      }}
    >
      {children}
    </Fab>
  );
};

export default StandardButton;