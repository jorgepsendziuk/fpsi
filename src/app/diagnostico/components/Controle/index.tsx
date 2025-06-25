// React and hooks
import React from 'react';

// Material UI components
import {
  Typography,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

// Types
import { Controle, Medida, Diagnostico, Responsavel, ProgramaControle } from '../../types';


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
  /** The programa controle data containing nivel and other junction table data */
  programaControle?: ProgramaControle;
  /** The diagnostic this control belongs to */
  diagnostico: Diagnostico;
  /** The measures for this control */
  medidas: Medida[];
  /** The program ID */
  programaId: number;
  /** List of available responsibles */
  responsaveis: Responsavel[];
  /** Function to handle changes to the NCC level */
  handleINCCChange: (programaControleId: number, diagnosticoId: number, value: number) => void;
  /** Function to handle changes to a measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** Function to calculate the maturity index */
  calculateMaturityIndex: (controle: Controle) => number;
}

type InfoType = 'texto' | 'por_que_implementar' | 'fique_atento' | 'aplicabilidade_privacidade';

const infoLabels: Record<InfoType, string> = {
  texto: 'Descrição',
  por_que_implementar: 'Por que implementar',
  fique_atento: 'Fique atento',
  aplicabilidade_privacidade: 'Aplicabilidade em privacidade'
};



const tabIcons: Record<InfoType, React.ReactElement> = {
  texto: <DescriptionOutlinedIcon sx={{ mr: 1 }} />,
  por_que_implementar: <HelpOutlineOutlinedIcon sx={{ mr: 1 }} />,
  fique_atento: <ErrorOutlineOutlinedIcon sx={{ mr: 1 }} />,
  aplicabilidade_privacidade: <SecurityOutlinedIcon sx={{ mr: 1 }} />
};

const getBackgroundColor = (info: InfoType) => {
  switch(info) {
    case 'texto':
      return '#F5F5F5'; // cinza claro
    case 'por_que_implementar':
      return '#D8E6C3';
    case 'fique_atento':
      return '#E6E0ED';
    case 'aplicabilidade_privacidade':
      return '#FFF3E0';
    default:
      return 'background.paper';
  }
};

/**
 * Controle component displays a control with its measures
 */
const ControleComponent: React.FC<ControleProps> = ({
  controle,
  programaControle,
  diagnostico,
  medidas,
  programaId,
  responsaveis,
  handleINCCChange,
  handleMedidaChange,
  calculateMaturityIndex,
}) => {
  const { accordionStyles } = useThemeColors();

  return (
        <><Grid container spacing={2} sx={{ mb: 3 }}>
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
          value={programaControle?.nivel || ""}
          onChange={(event) => {
            if (programaControle?.id && programaControle.id > 0) {
              handleINCCChange(programaControle.id, diagnostico.id, parseInt(event.target.value.toString(), 10));
            } else {
              console.warn('Cannot update INCC: programaControle.id is not valid', programaControle);
            }
          } }
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
    </Grid><div style={controleStyles.medidasContainer}>
        <Box sx={{ mb: 3 }}>
          {(Object.keys(infoLabels) as InfoType[]).map((info) => {
            const content = controle[info];
            if (!content || content.trim() === '') return null;

            return (
              <Box
                key={info}
                sx={{
                  backgroundColor: getBackgroundColor(info),
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: getBackgroundColor(info),
                    padding: '12px 24px',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tabIcons[info]}
                    <Typography
                      sx={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#1F2937',
                      }}
                    >
                      {infoLabels[info]}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: getBackgroundColor(info),
                    padding: { xs: '16px', md: '24px' },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      color: '#000000 !important',
                      display: 'block',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    {content}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>


      </div></>
  );
};

export default ControleComponent; 