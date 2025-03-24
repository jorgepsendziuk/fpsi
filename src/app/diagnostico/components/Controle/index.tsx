// React and hooks
import React from 'react';

// Material UI components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Types
import { Controle, Medida, Diagnostico } from '../../types';

// Components
import MedidaContainer from '../../containers/MedidaContainer';

// Utils
import { incc } from '../../utils';

// Styles
import { controleStyles } from './styles';
import { useThemeColors } from '../../hooks/useThemeColors';

/**
 * Props for the Controle component
 */
export interface ControleProps {
  /** The control data */
  controle: Controle;
  /** The diagnostic this control belongs to */
  diagnostico: Diagnostico;
  /** List of measures for this control */
  medidas: Medida[];
  /** List of available responsibles */
  responsaveis: any[];
  /** Function to handle changes to the NCC level */
  handleINCCChange: (controleId: number, diagnosticoId: number, value: number) => void;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, field: string, value: any) => void;
  /** Function to calculate the maturity index */
  calculateMaturityIndex: (controle: Controle) => string | number;
}

/**
 * Controle component displays a control with its measures
 */
const ControleComponent: React.FC<ControleProps> = ({
  controle,
  diagnostico,
  medidas,
  responsaveis,
  handleINCCChange,
  handleMedidaChange,
  calculateMaturityIndex,
}) => {
  const { accordionStyles } = useThemeColors();

  return (
    <Accordion
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        ...accordionStyles,
        width: '100%',
        mb: 2,
        '& .MuiAccordionDetails-root': {
          padding: 2
        }
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon />}
        sx={controleStyles.accordionSummary}
      >
        <Grid container spacing={2}>
          <Grid size={{ md: 4 }} alignItems="center">
            <Typography variant="caption" sx={controleStyles.titleCaption}>
              CONTROLE
            </Typography>
            <Typography sx={controleStyles.titleSection}>
              ID {controle.numero} - {controle.nome}
            </Typography>
          </Grid>
          <Grid size={{ md: 6 }}>
            <Typography variant="caption" sx={controleStyles.titleCaption}>
              NCC - NÍVEIS DE CAPACIDADE DO CONTROLE
            </Typography>
            <Select
              sx={controleStyles.niveisList}
              value={controle.nivel || ""}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                handleINCCChange(controle.id, diagnostico.id, parseInt(event.target.value.toString(), 10))
              }
            >
              {incc.map((incc) => (
                <MenuItem key={incc.id} value={incc.id}>
                  <Typography sx={controleStyles.niveisListItem}>
                    <b>{incc.nivel}</b> - {incc.label}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ md: 2 }} alignItems="center" sx={controleStyles.indiceSection}>
            <Typography variant="caption" align="center" sx={controleStyles.indiceCaption}>
              ÍNDICE DE MATURIDADE DO CONTROLE
            </Typography>
            <Typography variant="h6" align="center" sx={controleStyles.indiceValue}>
              {calculateMaturityIndex(controle)}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <div style={controleStyles.medidasContainer}>
          {medidas.map((medida) => (
            <MedidaContainer
              key={medida.id}
              medida={medida}
              controle={controle}
              handleMedidaChange={handleMedidaChange}
              responsaveis={responsaveis}
            />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default ControleComponent; 