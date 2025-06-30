// React and hooks
import React from 'react';

// Material UI components
import {
  Typography,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PolicyIcon from '@mui/icons-material/Policy';

// Types
import { Controle, Medida, Diagnostico, Responsavel, ProgramaControle } from '../../../lib/types/types';

// Components
import MedidaContainer from '../containers/MedidaContainer';
import MaturityChip from '../MaturityChip';

// Utils
import { incc } from '../../../lib/utils/utils';

// Styles
import { controleStyles } from './styles';
import { useThemeColors } from '../../../app/diagnostico/hooks/useThemeColors';

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
  
  const maturityScore = calculateMaturityIndex(controle);
  
  // Função para obter cor baseada no score
  const getMaturityColor = (score: number): string => {
    if (score >= 0.9) return '#2E7D32';      // Verde escuro
    if (score >= 0.7) return '#4CAF50';      // Verde
    if (score >= 0.5) return '#FFC107';      // Amarelo
    if (score >= 0.3) return '#FF9800';      // Laranja
    return '#FF5252';                        // Vermelho
  };

  const getMaturityLevel = (score: number): string => {
    if (score >= 0.9) return 'Aprimorado';
    if (score >= 0.7) return 'Em Aprimoramento';
    if (score >= 0.5) return 'Intermediário';
    if (score >= 0.3) return 'Básico';
    return 'Inicial';
  };

  return (
    <Card sx={{ width: '100%', mb: 2 }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header do Controle */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 0,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityOutlinedIcon 
                sx={{ 
                  fontSize: 32, 
                  color: 'primary.main',
                  p: 0.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(25, 118, 210, 0.1)'
                }} 
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main',
                    mb: 0.5 
                  }}
                >
                  Controle {controle.numero}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500, 
                    color: 'text.primary',
                    lineHeight: 1.2 
                  }}
                >
                  {controle.nome}
                </Typography>
              </Box>
            </Box>
            
            {/* Card do Índice de Maturidade */}
            <Card 
              elevation={3}
              sx={{ 
                minWidth: 200,
                background: `linear-gradient(135deg, ${getMaturityColor(maturityScore)}15 0%, ${getMaturityColor(maturityScore)}25 100%)`,
                border: `2px solid ${getMaturityColor(maturityScore)}`,
                borderRadius: 2
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    letterSpacing: 0.5
                  }}
                >
                  Índice de Maturidade
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    color: getMaturityColor(maturityScore),
                    my: 1 
                  }}
                >
                  {maturityScore.toFixed(2)}
                </Typography>
                <Chip 
                  label={getMaturityLevel(maturityScore)}
                  size="small"
                  sx={{ 
                    backgroundColor: getMaturityColor(maturityScore),
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </CardContent>
            </Card>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Seção do INCC */}
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 1.5 
              }}
            >
              Nível de Capacidade do Controle (INCC)
            </Typography>
            <Select
              fullWidth
              value={programaControle?.nivel || ""}
              onChange={(event) => {
                if (programaControle?.id && programaControle.id > 0) {
                  handleINCCChange(programaControle.id, diagnostico.id, parseInt(event.target.value.toString(), 10));
                } else {
                  console.warn('Cannot update INCC: programaControle.id is not valid', programaControle);
                }
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                },
                '& .MuiSelect-select': {
                  py: 1.5
                }
              }}
            >
              {incc.map((incc) => (
                <MenuItem key={incc.id} value={incc.id}>
                  <Box sx={{ py: 0.5 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 0.5 
                      }}
                    >
                      Nível {incc.nivel} - {incc.indice}%
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.875rem',
                        lineHeight: 1.3,
                        whiteSpace: 'normal'
                      }}
                    >
                      {incc.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Paper>

        {/* Conteúdo das Medidas */}
        <Box sx={{ p: 3 }}>
          <div style={controleStyles.medidasContainer}>
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

          {/* Título da seção de medidas */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PolicyIcon color="primary" />
            Medidas ({medidas.length})
          </Typography>

          {/* Medidas em accordions */}
          {medidas.map((medida, index) => {
            // Determinar status da medida
            const resposta = medida.programa_medida?.resposta;
            const hasResponse = resposta !== undefined && resposta !== null;
            const isComplete = hasResponse;
            
            // Determinar cor baseada no status
            const getStatusColor = () => {
              if (!hasResponse) return '#9E9E9E'; // Cinza para não respondida
              if (diagnostico.id === 1) {
                // Diagnóstico 1: Sim/Não
                return resposta === 1 ? '#4CAF50' : '#FF5252'; // Verde para Sim, Vermelho para Não
              } else {
                // Diagnósticos 2-3: Escala de maturidade
                if (resposta === 1) return '#4CAF50';      // Verde - Adota totalmente
                if (resposta === 2) return '#8BC34A';      // Verde claro - Adota em menor parte
                if (resposta === 3) return '#FFC107';      // Amarelo - Adota parcialmente
                if (resposta === 4) return '#FF9800';      // Laranja - Há plano
                if (resposta === 5) return '#FF5252';      // Vermelho - Não adota
                if (resposta === 6) return '#9E9E9E';      // Cinza - Não se aplica
              }
              return '#9E9E9E';
            };

            const getStatusLabel = () => {
              if (!hasResponse) return 'Não Respondida';
              if (diagnostico.id === 1) {
                return resposta === 1 ? 'Sim' : 'Não';
              } else {
                if (resposta === 1) return 'Adota Totalmente';
                if (resposta === 2) return 'Adota em Menor Parte';
                if (resposta === 3) return 'Adota Parcialmente';
                if (resposta === 4) return 'Há Plano Aprovado';
                if (resposta === 5) return 'Não Adota';
                if (resposta === 6) return 'Não se Aplica';
              }
              return 'Não Respondida';
            };

            return (
              <Accordion 
                key={medida.id}
                sx={{
                  mb: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px !important',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 8px 0',
                  },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: hasResponse ? `${getStatusColor()}10` : 'background.paper',
                    borderRadius: '8px',
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                    minHeight: 64,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      py: 1,
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    pr: 1
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: getStatusColor(),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        {medida.id_medida || medida.id}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: 'text.primary'
                          }}
                        >
                          {medida.medida}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Medida {medida.id_medida || medida.id}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={getStatusLabel()}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(),
                          color: 'white',
                          fontWeight: 500,
                          minWidth: 100
                        }}
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <MedidaContainer
                    medida={medida}
                    programaMedida={medida.programa_medida}
                    controle={controle}
                    programaId={programaId}
                    handleMedidaChange={handleMedidaChange}
                    responsaveis={responsaveis}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}
          </div>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ControleComponent; 