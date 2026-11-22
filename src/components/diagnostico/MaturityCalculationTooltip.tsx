import React from 'react';
import {
  Tooltip,
  Box,
  Typography,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { alpha } from '@mui/material/styles';

interface MaturityCalculationData {
  medidas: {
    total: number;
    respondidas: number;
    naoSeAplica: number;
    somaRespostas: number;
  };
  nac?: {
    valor: number;
    nivelAdocao: string;
  };
  /** @deprecated legado PPSI 1.0 — ignorado se `nac` estiver presente */
  incc?: {
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
}

interface MaturityCalculationTooltipProps {
  children: React.ReactElement;
  calculationData: MaturityCalculationData;
  controleId?: number;
  controleNome?: string;
}

const MaturityCalculationTooltip: React.FC<MaturityCalculationTooltipProps> = ({
  children,
  calculationData,
  controleId,
  controleNome
}) => {
  const tooltipContent = (
    <Box sx={{ p: 1, maxWidth: 400 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Cálculo NAC (PPSI 2.0)
        {controleId != null ? ` · Controle ${controleId}` : ''}
      </Typography>

      {controleNome ? (
        <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
          {controleNome}
        </Typography>
      ) : null}

      <Divider sx={{ mb: 1 }} />

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          Medidas:
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip label={`Aplicáveis: ${calculationData.medidas.total}`} size="small" variant="outlined" />
          <Chip label={`Respondidas: ${calculationData.medidas.respondidas}`} size="small" color="primary" variant="outlined" />
          {calculationData.medidas.naoSeAplica > 0 ? (
            <Chip label={`N/A: ${calculationData.medidas.naoSeAplica}`} size="small" sx={{ bgcolor: alpha('#9E9E9E', 0.1) }} />
          ) : null}
        </Stack>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          ∑ NIM: <strong>{calculationData.medidas.somaRespostas.toFixed(2)}</strong>
        </Typography>
      </Box>

      {calculationData.nac ? (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
            Nível de adoção (NAC):
          </Typography>
          <Typography variant="caption">
            {calculationData.nac.nivelAdocao} — índice {calculationData.nac.valor.toFixed(2)}
          </Typography>
        </Box>
      ) : null}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          Fórmula:
        </Typography>
        <Box
          sx={{
            bgcolor: alpha('#1976d2', 0.05),
            p: 0.5,
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
          }}
        >
          <Typography variant="caption" component="div">
            {calculationData.calculo.formula}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            bgcolor: alpha('#4CAF50', 0.05),
            p: 0.5,
            borderRadius: 1,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
          }}
        >
          <Typography variant="caption" component="div">
            {calculationData.medidas.somaRespostas.toFixed(2)} ÷ {calculationData.medidas.total} ={' '}
            <strong>{calculationData.calculo.finalScore.toFixed(4)}</strong>
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ textAlign: 'center' }}>
        <Chip
          label={`${calculationData.resultado.label} (${(calculationData.resultado.score * 100).toFixed(1)}%)`}
          sx={{
            bgcolor: alpha(calculationData.resultado.color, 0.1),
            color: calculationData.resultado.color,
            fontWeight: 600,
            border: `1px solid ${alpha(calculationData.resultado.color, 0.3)}`,
          }}
        />
      </Box>

      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, opacity: 0.6, fontSize: '0.65rem' }}>
        IN SGD/MGI 4/2026 · PPSI 2.0
      </Typography>
    </Box>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement="top"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 3,
            maxWidth: 'none',
          },
        },
        arrow: {
          sx: {
            color: 'background.paper',
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
};

export default MaturityCalculationTooltip;