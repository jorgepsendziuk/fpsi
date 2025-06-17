// React
import React, { useState, useCallback } from 'react';

// Material UI components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Tooltip,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Types
import { Controle, Diagnostico, Programa } from '../../types';

// Components
import ControleContainer from '../../containers/ControleContainer';

// Styles
import { diagnosticoStyles } from './styles';
import { useThemeColors } from '../../hooks/useThemeColors';

/**
 * Retorna a cor para o índice de maturidade com base no valor
 */
const getMaturityColor = (score: string | number): string => {
  const numericScore = typeof score === 'string' ? parseFloat(score) : score;
  
  if (numericScore <= 0.29) return '#FF0000'; // Vermelho - Inicial
  if (numericScore <= 0.49) return '#FF8C00'; // Laranja - Básico
  if (numericScore <= 0.69) return '#FFD700'; // Amarelo - Intermediário
  if (numericScore <= 0.89) return '#7CFC00'; // Verde claro - Em Aprimoramento
  return '#008000'; // Verde - Aprimorado
};

/**
 * Props for the Diagnostico component
 */
export interface DiagnosticoComponentProps {
  /** The diagnostic data */
  diagnostico: Diagnostico;
  /** The program this diagnostic belongs to */
  programa: Programa;
  /** Controls for this diagnostic */
  controles: Controle[];
  /** The calculated maturity score */
  maturityScore: string | number;
  /** The maturity label text */
  maturityLabel: string;
  /** Application state */
  state: any;
  /** Function to fetch controls for this diagnostic */
  handleControleFetch: (diagnosticoId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to the NCC level */
  handleINCCChange: (programaControleId: number, diagnosticoId: number, value: number) => void;
  /** Function to fetch measures for a control */
  handleMedidaFetch: (controleId: number, programaId: number) => Promise<void>;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: any[];
}

/**
 * DiagnosticoComponent displays diagnostic information with its controls
 */
const DiagnosticoComponent: React.FC<DiagnosticoComponentProps> = ({
  diagnostico,
  programa,
  controles,
  maturityScore,
  maturityLabel,
  state,
  handleControleFetch,
  handleINCCChange,
  handleMedidaFetch,
  handleMedidaChange,
  responsaveis,
}) => {
  const { accordionStyles } = useThemeColors();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Memoized handler to prevent unnecessary re-renders
  const handleAccordionChange = useCallback(async (event: React.SyntheticEvent, expanded: boolean) => {
    setIsExpanded(expanded);
    
    // Only fetch data when expanding AND data hasn't been loaded yet
    if (expanded && !dataLoaded && controles.length === 0) {
      console.log(`Fetching controls for diagnostico ${diagnostico.id} - first time`);
      await handleControleFetch(diagnostico.id, programa.id);
      setDataLoaded(true);
    }
  }, [diagnostico.id, programa.id, dataLoaded, controles.length, handleControleFetch]);

  return (
    <Accordion
      expanded={isExpanded}
      onChange={handleAccordionChange}
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        ...accordionStyles,
        width: '100%',
        mb: 2,
        backgroundColor: diagnostico.cor,
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={diagnosticoStyles.accordionSummary}
      >
        <Box sx={diagnosticoStyles.contentBox}>
          <Grid container spacing={0}>
            <Grid size={{ xs: 12, sm: 12, md: 8 }} sx={diagnosticoStyles.titleSection}>
              <Typography variant="h5" sx={diagnosticoStyles.titleLabel}>
                DIAGNÓSTICO DE
              </Typography>
              <Typography variant="h4" sx={diagnosticoStyles.title}>
                {diagnostico.descricao}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }} sx={diagnosticoStyles.maturidadeSection}>
              <Typography sx={diagnosticoStyles.maturidadeLabel}>MATURIDADE</Typography>
              <Typography variant="h5" sx={diagnosticoStyles.maturidadeValue}>
                {diagnostico.indice}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }} sx={{
              ...diagnosticoStyles.scoreSection,
              borderRadius: '12px',
              padding: '8px 4px',
              //border: `2px solid ${getMaturityColor(maturityScore)}20`,
              //boxShadow: `0 0 8px ${getMaturityColor(maturityScore)}25`,
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              //backgroundColor: `${getMaturityColor(maturityScore)}08`,
            }}>
              {/* Indicador visual de maturidade */}
              <Tooltip
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2">Níveis de Maturidade:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF0000', mr: 1 }} />
                      <Typography variant="caption">0.00-0.29: Inicial</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF8C00', mr: 1 }} />
                      <Typography variant="caption">0.30-0.49: Básico</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFD700', mr: 1 }} />
                      <Typography variant="caption">0.50-0.69: Intermediário</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#7CFC00', mr: 1 }} />
                      <Typography variant="caption">0.70-0.89: Em Aprimoramento</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#008000', mr: 1 }} />
                      <Typography variant="caption">0.90-1.00: Aprimorado</Typography>
                    </Box>
                  </Box>
                }
                arrow
              >
                <Box 
                  sx={{
                    width: '85%',
                    height: '6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    margin: '0 auto 10px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'help',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${(typeof maturityScore === 'string' ? parseFloat(maturityScore) : maturityScore) * 100}%`,
                      backgroundColor: `${getMaturityColor(maturityScore)}c0`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease, background-color 0.5s ease',
                    }}
                  />
                </Box>
              </Tooltip>
              
              <Typography
                variant="h4"
                align="center"
                sx={{
                  ...diagnosticoStyles.scoreValue,
                  fontSize: '2.4rem',
                  fontWeight: 'bold',
                  color: getMaturityColor(maturityScore),
                  textShadow: '0px 0px 1px rgba(0,0,0,0.2)',
                  transition: 'color 0.3s ease, text-shadow 0.3s ease',
                }}
              >
                {maturityScore}
              </Typography>
              
              {/* Nível de maturidade destacado */}
              <Typography 
                variant="subtitle1" 
                align="center"
                sx={{
                  backgroundColor: `${getMaturityColor(maturityScore)}90`,
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '2px 10px',
                  margin: '4px auto',
                  display: 'inline-block',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  textShadow: '0px 0px 1px rgba(0,0,0,0.3)',
                  boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  maxWidth: '90%',
                  letterSpacing: '0.5px',
                }}
              >
                {maturityLabel}
              </Typography>
              
              <Typography variant="h6" align="center" sx={diagnosticoStyles.scoreMaturidade}>
                {diagnostico.maturidade}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <div style={diagnosticoStyles.controlesContainer}>
          {Array.isArray(controles) && controles.map((controle) => (
            <ControleContainer
              key={controle.id}
              controle={controle}
              diagnostico={diagnostico}
              programaId={programa.id}
              state={state}
              handleINCCChange={handleINCCChange}
              handleMedidaFetch={handleMedidaFetch}
              handleMedidaChange={handleMedidaChange}
              responsaveis={responsaveis}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default DiagnosticoComponent; 