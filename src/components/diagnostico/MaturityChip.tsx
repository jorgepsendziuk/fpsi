import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface MaturityChipProps {
  score: number;
  label?: string;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  animated?: boolean;
  variant?: 'filled' | 'outlined';
}

/**
 * Mapping de scores para cores de maturidade
 */
const getMaturityColor = (score: number): { main: string; light: string; dark: string } => {
  if (score >= 0.9) return { main: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' }; // Verde Escuro - Aprimorado
  if (score >= 0.7) return { main: '#4CAF50', light: '#8BC34A', dark: '#2E7D32' }; // Verde - Em Aprimoramento  
  if (score >= 0.5) return { main: '#FFC107', light: '#FFEB3B', dark: '#F57C00' }; // Amarelo - Intermediário
  if (score >= 0.3) return { main: '#FF9800', light: '#FFB74D', dark: '#F57C00' }; // Laranja - Básico
  return { main: '#FF5252', light: '#FF8A80', dark: '#D32F2F' }; // Vermelho - Inicial
};

/**
 * Mapping de scores para labels de maturidade
 */
const getMaturityLabel = (score: number): string => {
  if (score >= 0.9) return 'Aprimorado';
  if (score >= 0.7) return 'Em Aprimoramento';
  if (score >= 0.5) return 'Intermediário';
  if (score >= 0.3) return 'Básico';
  return 'Inicial';
};

/**
 * Componente MaturityChip para exibir índices de maturidade
 */
const MaturityChip: React.FC<MaturityChipProps> = ({
  score,
  label,
  size = 'medium',
  showLabel = true,
  animated = false,
  variant = 'filled'
}) => {
  const maturityColor = getMaturityColor(score);
  const maturityLabel = label || getMaturityLabel(score);
  const scoreFormatted = score.toFixed(2);

  const chipStyle = {
    backgroundColor: variant === 'filled' ? alpha(maturityColor.main, 0.1) : 'transparent',
    color: maturityColor.dark,
    border: `1px solid ${alpha(maturityColor.main, 0.3)}`,
    fontWeight: 600,
    fontSize: size === 'small' ? '0.75rem' : '0.875rem',
    transition: animated ? 'all 0.3s ease-in-out' : undefined,
    '&:hover': {
      backgroundColor: alpha(maturityColor.main, 0.2),
      borderColor: maturityColor.main,
      transform: animated ? 'scale(1.05)' : undefined,
    }
  };

  // Para chips pequenos (menu árvore), só mostrar o score
  const displayLabel = (size === 'small' || !showLabel) ? scoreFormatted : `${scoreFormatted} - ${maturityLabel}`;

  const chipElement = (
    <Chip
      label={displayLabel}
      size={size}
      variant={variant}
      sx={chipStyle}
    />
  );

  // Se tem tooltip informativo, envolver com Tooltip
  const tooltipContent = (
    <Box>
      <Box component="div" sx={{ fontWeight: 600 }}>
        {maturityLabel}
      </Box>
      <Box component="div" sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
        Score: {scoreFormatted}
      </Box>
      <Box component="div" sx={{ fontSize: '0.75rem', opacity: 0.6, mt: 1 }}>
        Clique para ver detalhes
      </Box>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      {chipElement}
    </Tooltip>
  );
};

export default MaturityChip;