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
      {/* Header */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        📊 Cálculo de Maturidade
        {controleId && ` - Controle ${controleId}`}
      </Typography>
      
      {controleNome && (
        <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
          {controleNome}
        </Typography>
      )}
      
      <Divider sx={{ mb: 1 }} />
      
      {/* Dados das Medidas */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          📋 Medidas:
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip 
            label={`Total: ${calculationData.medidas.total}`}
            size="small"
            variant="outlined"
          />
          <Chip 
            label={`Respondidas: ${calculationData.medidas.respondidas}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {calculationData.medidas.naoSeAplica > 0 && (
            <Chip 
              label={`N/A: ${calculationData.medidas.naoSeAplica}`}
              size="small"
              sx={{ bgcolor: alpha('#9E9E9E', 0.1) }}
            />
          )}
        </Stack>
      </Box>
      
      {/* Soma das Respostas */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          ∑ Respostas: <strong>{calculationData.medidas.somaRespostas.toFixed(2)}</strong>
        </Typography>
      </Box>
      
      {/* INCC */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
          🎯 INCC:
        </Typography>
        <Typography variant="caption">
          Nível {calculationData.incc.nivel} → Multiplicador {calculationData.incc.multiplicador.toFixed(2)}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Fórmula e Cálculo */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          🧮 Fórmula Oficial:
        </Typography>
        <Box sx={{ 
          bgcolor: alpha('#1976d2', 0.05), 
          p: 0.5, 
          borderRadius: 1, 
          fontFamily: 'monospace',
          fontSize: '0.7rem'
        }}>
          <Typography variant="caption" component="div">
            iMC = (∑PMC / (QMC - QMNAC)) / 2 × (1 + iNCC/100)
          </Typography>
        </Box>
      </Box>
      
      {/* Cálculo Detalhado */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          📐 Cálculo:
        </Typography>
        <Box sx={{ 
          bgcolor: alpha('#4CAF50', 0.05), 
          p: 0.5, 
          borderRadius: 1, 
          fontFamily: 'monospace',
          fontSize: '0.7rem'
        }}>
          <Typography variant="caption" component="div">
            Base: {calculationData.medidas.somaRespostas.toFixed(2)} / {calculationData.medidas.total} = {calculationData.calculo.baseIndex.toFixed(4)}
          </Typography>
          <Typography variant="caption" component="div">
            Final: ({calculationData.calculo.baseIndex.toFixed(4)} / 2) × {calculationData.incc.multiplicador.toFixed(2)} = <strong>{calculationData.calculo.finalScore.toFixed(4)}</strong>
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      {/* Resultado */}
      <Box sx={{ textAlign: 'center' }}>
        <Chip
          label={`${calculationData.resultado.label} (${(calculationData.resultado.score * 100).toFixed(1)}%)`}
          sx={{
            bgcolor: alpha(calculationData.resultado.color, 0.1),
            color: calculationData.resultado.color,
            fontWeight: 600,
            border: `1px solid ${alpha(calculationData.resultado.color, 0.3)}`
          }}
        />
      </Box>
      
      {/* Framework Reference */}
      <Typography 
        variant="caption" 
        sx={{ 
          display: 'block', 
          textAlign: 'center', 
          mt: 1, 
          opacity: 0.6,
          fontSize: '0.65rem'
        }}
      >
        Conforme Framework Oficial PNSI/LGPD
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
            maxWidth: 'none'
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
