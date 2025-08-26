import React from 'react';
import { Card, CardProps, useTheme, alpha } from '@mui/material';

interface StandardCardProps extends Omit<CardProps, 'variant'> {
  /**
   * Variante do card
   * - 'default': Card padrão com hover
   * - 'elevated': Card com sombra mais forte
   * - 'gradient': Card com fundo gradiente
   */
  cardVariant?: 'default' | 'elevated' | 'gradient';
  
  /**
   * Se verdadeiro, desabilita o efeito hover
   */
  noHover?: boolean;
}

/**
 * Card padronizado seguindo o design system FPSI
 * 
 * @example
 * <StandardCard cardVariant="gradient">
 *   <CardContent>Conteúdo do card</CardContent>
 * </StandardCard>
 */
export const StandardCard: React.FC<StandardCardProps> = ({
  cardVariant = 'default',
  noHover = false,
  sx,
  children,
  ...props
}) => {
  const theme = useTheme();
  
  const getCardStyles = () => {
    const baseStyles = {
      height: '100%',
      borderRadius: 4,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': noHover ? {} : {
        transform: 'translateY(-8px)',
        boxShadow: 6,
      }
    };

    switch (cardVariant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: 4,
          '&:hover': noHover ? {} : {
            ...baseStyles['&:hover'],
            boxShadow: 8,
          },
        };
      
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        };
      
      case 'default':
      default:
        return baseStyles;
    }
  };
  
  return (
    <Card
      {...props}
      sx={{
        ...getCardStyles(),
        ...sx
      }}
    >
      {children}
    </Card>
  );
};

export default StandardCard;