import { Theme, alpha } from '@mui/material/styles';
import { SxProps } from '@mui/material';

/**
 * Design System Utilities
 * Utilitários para aplicação consistente do design system FPSI
 */

// Tipos para variantes de títulos
export type TitleVariant = 'primary' | 'secondary' | 'page-header' | 'section-header';

/**
 * Gera estilos para títulos com gradiente
 */
export const getTitleStyles = (
  theme: Theme, 
  variant: TitleVariant = 'primary',
  isMobile: boolean = false
): SxProps<Theme> => {
  const baseStyles = {
    fontWeight: 'bold',
    mb: 1,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      };
    
    case 'secondary':
      return {
        ...baseStyles,
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      };
    
    case 'page-header':
      return {
        ...baseStyles,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      };
    
    case 'section-header':
      return {
        ...baseStyles,
        color: theme.palette.text.primary,
      };
    
    default:
      return baseStyles;
  }
};

/**
 * Gera estilos para botões padronizados
 */
export const getButtonStyles = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'outlined' | 'text' = 'primary'
): SxProps<Theme> => {
  const baseStyles = {
    borderRadius: 2,
    textTransform: 'none' as const,
    fontWeight: 600,
    px: 3,
    py: 1.5,
  };

  switch (variant) {
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

/**
 * Gera estilos para FABs padronizados
 */
export const getFabStyles = (
  theme: Theme,
  variant: 'primary' | 'secondary' = 'primary'
): SxProps<Theme> => {
  switch (variant) {
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

/**
 * Gera estilos para gradientes de fundo
 */
export const getGradientBackground = (
  theme: Theme, 
  intensity: 'light' | 'medium' | 'strong' = 'medium'
) => {
  switch (intensity) {
    case 'light':
      return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`;
    
    case 'medium':
      return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`;
    
    case 'strong':
      return `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`;
    
    default:
      return `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`;
  }
};

/**
 * Estilos padrão para cards
 */
export const getCardStyles = (
  theme: Theme,
  variant: 'default' | 'elevated' | 'gradient' = 'default'
): SxProps<Theme> => {
  const baseStyles = {
    height: '100%',
    borderRadius: 4,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: 6,
    }
  };

  switch (variant) {
    case 'elevated':
      return {
        ...baseStyles,
        boxShadow: 4,
        '&:hover': {
          ...baseStyles['&:hover'],
          boxShadow: 8,
        }
      };
    
    case 'gradient':
      return {
        ...baseStyles,
        background: getGradientBackground(theme, 'light'),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      };
    
    default:
      return baseStyles;
  }
};





/**
 * Estilos para dialogs/modals
 */
export const getDialogStyles = (): SxProps<Theme> => ({
  borderRadius: 3,
  boxShadow: 8,
});

/**
 * Estilos para containers de página
 */
export const getPageContainerStyles = (): SxProps<Theme> => ({
  py: 4,
});

/**
 * Estilos para headers de página
 */
export const getPageHeaderStyles = (): SxProps<Theme> => ({
  mb: 6,
});

/**
 * Estilos para seções de conteúdo
 */
export const getContentSectionStyles = (): SxProps<Theme> => ({
  mb: 4,
});

/**
 * Estilos para hero sections
 */
export const getHeroSectionStyles = (theme: Theme): SxProps<Theme> => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  py: { xs: 8, md: 12 },
  textAlign: 'center',
});

/**
 * Estilos para loading states
 */
export const getLoadingStyles = (): SxProps<Theme> => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
});

/**
 * Estilos para empty states
 */
export const getEmptyStateStyles = (theme: Theme): SxProps<Theme> => ({
  textAlign: 'center',
  py: 6,
  background: getGradientBackground(theme, 'light'),
  borderRadius: 4,
  border: '2px dashed',
  borderColor: alpha(theme.palette.primary.main, 0.3),
});

/**
 * Breakpoints para responsividade
 */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

/**
 * Espaçamentos padrão
 */
export const spacing = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
};

/**
 * Border radius padrão
 */
export const borderRadius = {
  small: 2,
  medium: 3,
  large: 4,
};

/**
 * Box shadows padrão
 */
export const boxShadows = {
  light: 2,
  medium: 4,
  strong: 6,
  lifted: 8,
};
