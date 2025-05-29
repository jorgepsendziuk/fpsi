// React and hooks
import React, { useState } from 'react';
import { useMediaQuery } from '@mui/material';

// Material UI components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

// Types
import { Controle, Medida, Diagnostico, Responsavel } from '../../types';

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

const tabColors: Record<InfoType, string> = {
  texto: '#E3F2FD', // azul claro
  por_que_implementar: '#D8E6C3', // verde claro da imagem
  fique_atento: '#E6E0ED', // roxo claro da imagem
  aplicabilidade_privacidade: '#FFF3E0' // laranja claro
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
  diagnostico,
  medidas,
  programaId,
  responsaveis,
  handleINCCChange,
  handleMedidaChange,
  calculateMaturityIndex,
}) => {
  const { accordionStyles } = useThemeColors();
  const [selectedTab, setSelectedTab] = useState<InfoType>('texto');
  const isMobile = useMediaQuery('(max-width:900px)');

  const handleTabChange = (event: React.SyntheticEvent, newValue: InfoType) => {
    setSelectedTab(newValue);
  };

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
              onChange={(event) => {
                if (controle.programa_controle_id) {
                  handleINCCChange(controle.programa_controle_id, diagnostico.id, parseInt(event.target.value.toString(), 10));
                }
              }}
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
          <Paper 
            elevation={1}
            sx={{ 
              mb: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              backgroundColor: 'background.default',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                orientation={isMobile ? 'horizontal' : 'vertical'}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderRight: { xs: 'none', md: 1 },
                  borderBottom: { xs: 1, md: 'none' },
                  borderColor: 'divider',
                  minWidth: { xs: '100%', md: '250px' },
                  maxWidth: { xs: '100%', md: '250px' },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: '4px', md: 0 },
                    '& .MuiTab-root': {
                      borderBottom: { xs: 'none', md: '1px solid' },
                      borderRight: { xs: '1px solid', md: 'none' },
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none',
                        borderRight: 'none'
                      }
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  },
                  '& .MuiTab-root': {
                    textTransform: 'uppercase',
                    minHeight: '48px',
                    padding: '8px 24px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#1F2937',
                    alignItems: 'center',
                    textAlign: 'left',
                    minWidth: { xs: 'auto', md: '100%' },
                    flex: { xs: 1, md: 'none' },
                    flexDirection: 'row',
                    justifyContent: 'flex-start'
                  }
                }}
              >
                {(Object.keys(infoLabels) as InfoType[]).map((info) => (
                  <Tab 
                    key={info}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {tabIcons[info]}
                        {infoLabels[info]}
                      </Box>
                    }
                    value={info}
                    sx={{
                      backgroundColor: getBackgroundColor(info),
                      '&.Mui-selected': {
                        backgroundColor: getBackgroundColor(info),
                        fontWeight: 600,
                        color: '#1F2937',
                      },
                      '&:hover': {
                        opacity: 0.9
                      }
                    }}
                  />
                ))}
              </Tabs>
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                flex: 1, 
                bgcolor: getBackgroundColor(selectedTab),
                transition: 'background-color 0.3s ease',
                minHeight: { xs: '200px', md: 'auto' }
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    lineHeight: 1.6,
                    color: '#000000 !important',
                    display: 'block',
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  {controle[selectedTab] || 'Nenhuma informação registrada para este tópico'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {medidas.map((medida) => (
            <MedidaContainer
              key={medida.id}
              medida={medida}
              controle={controle}
              programaId={programaId}
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