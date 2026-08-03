import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MaturityCalculationTooltip from './MaturityCalculationTooltip';
import { formatMaturityIndex, getMaturityColorHex } from '@/lib/utils/maturity';

interface MaturityChipProps {
  score: number;
  label?: string;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  animated?: boolean;
  variant?: 'filled' | 'outlined';
  calculationData?: {
    medidas: {
      total: number;
      respondidas: number;
      naoSeAplica: number;
      somaRespostas: number;
    };
    incc: {
      nivel: number;
      multiplicador: number;
    };
    calculo: {
      baseIndex: number;
      finalScore: number;
      formula: string;
    };
    resultado: {
      score: number;
      label: string;
      color: string;
    };
  };
  controleId?: number;
  controleNome?: string;
}

/**
 * Componente MaturityChip para exibir índices de maturidade
 */
const MaturityChip: React.FC<MaturityChipProps> = ({
  score,
  label,
  size = 'medium',
  showLabel = true,
  animated = false,
  variant = 'filled',
  calculationData,
  controleId,
  controleNome
}) => {
  const formatted = formatMaturityIndex(score);
  const maturityColor = formatted?.color ?? getMaturityColorHex(score);
  const maturityLabel = label || formatted?.label || 'Inicial';
  const scoreFormatted = formatted?.indexText ?? score.toFixed(2);

  const chipStyle = {
    backgroundColor: variant === 'filled' ? alpha(maturityColor, 0.1) : alpha(maturityColor, 0.04),
    color: maturityColor,
    border: `1px solid ${alpha(maturityColor, 0.35)}`,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums' as const,
    fontSize: size === 'small' ? '0.72rem' : '0.875rem',
    height: size === 'small' ? 22 : undefined,
    transition: animated ? 'all 0.2s ease-in-out' : undefined,
    '& .MuiChip-label': {
      px: size === 'small' ? 0.75 : 1,
    },
    '&:hover': {
      backgroundColor: alpha(maturityColor, 0.12),
      borderColor: alpha(maturityColor, 0.55),
      transform: animated ? 'scale(1.03)' : undefined,
    }
  };

  const displayLabel = (size === 'small' || !showLabel) ? scoreFormatted : `${scoreFormatted} · ${maturityLabel}`;

  const chipElement = (
    <Chip
      label={displayLabel}
      size={size}
      variant={variant}
      sx={chipStyle}
    />
  );

  // Se tem dados de cálculo, usar tooltip detalhado
  if (calculationData) {
    return (
      <MaturityCalculationTooltip
        calculationData={calculationData}
        controleId={controleId}
        controleNome={controleNome}
      >
        {chipElement}
      </MaturityCalculationTooltip>
    );
  }

  // Senão, usar tooltip simples
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