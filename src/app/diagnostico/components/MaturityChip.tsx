import React from 'react';
import { Chip, Tooltip, Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface MaturityChipProps {
  score: number;
  label: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showLabel?: boolean;
  showTooltip?: boolean;
  animated?: boolean;
}

// Função para obter cor baseada no score (0-1)
const getMaturityColorData = (score: number) => {
  if (score >= 0.9) return { 
    color: '#2E7D32', 
    bgColor: '#E8F5E8', 
    level: 'Aprimorado',
    textColor: '#1B5E20'
  };
  if (score >= 0.7) return { 
    color: '#4CAF50', 
    bgColor: '#F1F8E9', 
    level: 'Em Aprimoramento',
    textColor: '#2E7D32'
  };
  if (score >= 0.5) return { 
    color: '#FFC107', 
    bgColor: '#FFFDE7', 
    level: 'Intermediário',
    textColor: '#F57F17'
  };
  if (score >= 0.3) return { 
    color: '#FF9800', 
    bgColor: '#FFF3E0', 
    level: 'Básico',
    textColor: '#E65100'
  };
  return { 
    color: '#FF5252', 
    bgColor: '#FFEBEE', 
    level: 'Inicial',
    textColor: '#C62828'
  };
};

export const MaturityChip: React.FC<MaturityChipProps> = ({
  score,
  label,
  size = 'small',
  variant = 'filled',
  showLabel = false,
  showTooltip = true,
  animated = false
}) => {
  const theme = useTheme();
  const colorData = getMaturityColorData(score);
  const displayScore = score.toFixed(2);
  
  const chipContent = (
    <Chip
      label={showLabel ? `${displayScore} - ${label}` : displayScore}
      size={size}
      variant={variant}
      sx={{
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        height: size === 'small' ? 22 : 28,
        backgroundColor: variant === 'filled' ? colorData.bgColor : 'transparent',
        color: colorData.textColor,
        border: variant === 'outlined' ? `1px solid ${colorData.color}` : 'none',
        '& .MuiChip-label': {
          paddingX: size === 'small' ? 1 : 1.5,
        },
        ...(animated && {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: alpha(colorData.color, 0.1),
          }
        })
      }}
    />
  );

  if (!showTooltip) {
    return chipContent;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Nível de Maturidade
          </Typography>
          <br />
          <Typography variant="body2" sx={{ color: colorData.color }}>
            {colorData.level}
          </Typography>
          <br />
          <Typography variant="caption">
            Índice: {displayScore}
          </Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      {chipContent}
    </Tooltip>
  );
};

export default MaturityChip; 