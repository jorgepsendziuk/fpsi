// React and hooks
import React from 'react';

// Material UI components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  ListItemText,
  Box,
  Button,
  InputLabel,
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';

// Components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Utils
import dayjs from 'dayjs';
import { respostas, respostasimnao, status_medida, status_plano_acao } from '../../utils';

// Types
import { Medida as MedidaType, Controle, Responsavel, TextFieldsState, MedidaTextField } from '../../types';

// Styles
import { medidaStyles } from './styles';
import { useThemeColors } from '../../hooks/useThemeColors';

/**
 * Props for the Medida component
 */
export interface MedidaProps {
  /** The measure data */
  medida: MedidaType;
  /** The parent control */
  controle: Controle;
  /** The program ID */
  programaId: number;
  /** Function to handle changes to the measure */
  handleMedidaChange: (medidaId: number, controleId: number, programaId: number, field: string, value: any) => void;
  /** List of available responsibles */
  responsaveis: Responsavel[];
  /** Current values for text fields */
  localValues: TextFieldsState;
  /** Function to handle text field changes */
  handleTextChange: (field: MedidaTextField, value: string) => void;
  /** Function to save a field value */
  handleSaveField: (field: MedidaTextField) => void;
}

/**
 * Medida component displays details of a measure with editable fields
 */
const MedidaComponent: React.FC<MedidaProps> = ({
  medida,
  controle,
  programaId,
  handleMedidaChange,
  responsaveis,
  localValues,
  handleTextChange,
  handleSaveField,
}) => {
  const { accordionStyles } = useThemeColors();

  // Apenas log de renderização para depuração
  console.log('Renderizando MedidaComponent para medida', medida);

  return (
    <Accordion 
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{
        ...accordionStyles,
        width: '100%', // Garantir largura total
        mb: 2, // Margem inferior consistente
        '& .MuiAccordionDetails-root': {
          padding: 2 // Ajuste específico para o conteúdo de medidas
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label={medida.id_medida}
        aria-controls={medida.id_medida}
        id={medida.id_medida}
        sx={{
          width: '100%',
          '& .MuiAccordionSummary-content': {
            margin: '8px 0',
            width: '100%',
            justifyContent: 'space-between',
          }
        }}
      >
        <Grid container spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
          <Grid size={{ md: 1, sm: 2, xs: 3 }}>
            <Typography sx={medidaStyles.idSection} variant="h6" align="center">
              {medida.id_medida}
            </Typography>
          </Grid>
          <Grid size={{ md: 5, sm: 5, xs: 9 }}>
            <Typography sx={medidaStyles.titleSection}>{medida.medida}</Typography>
          </Grid>
          <Grid size={{ md: 3, sm: 3, xs: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Select
              sx={{ ...medidaStyles.selectSection, width: '100%' }}
              value={medida.resposta || ""}
              aria-label={medida.id_medida}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) =>
                handleMedidaChange(medida.id, controle.id, programaId, "resposta", event.target.value)
              }
            >
              {(controle.diagnostico === 1 ? respostasimnao : respostas).map((resposta) => (
                <MenuItem key={resposta.id} value={resposta.id}>
                  <ListItemText primary={resposta.label} sx={medidaStyles.selectItem} />
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ md: 3, sm: 4, xs: 6 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: '500', mb: 0 }}>
              PLANO DE AÇÃO
            </Typography>
            <Chip
              sx={{
                ...medidaStyles.statusChip,
                bgcolor: status_plano_acao.find(status => status.id === medida.status_plano_acao)?.color || '#e9ecef',
                color: (medida.status_plano_acao === 3 || medida.status_plano_acao === 4) ? '#333333' : '#000000',
                fontWeight: 600
              }}
              label={
                status_plano_acao.find(status => status.id === medida.status_plano_acao)?.label || "Não definido"
              }
            />
          </Grid>
        </Grid>
      </AccordionSummary>
      
      <AccordionDetails>
        <Typography align="justify" sx={medidaStyles.description}>
          &quot;{medida.descricao}&quot;
        </Typography>
      
        <Grid container spacing={3}>
          {/* Responsável */}
          <Grid size={{ md: 4, sm: 12, xs: 12 }}>
            <FormControl fullWidth sx={medidaStyles.selectContainer}>
              <InputLabel id={`responsavel-label-${medida.id}`}>Responsável</InputLabel>
              <Select
                labelId={`responsavel-label-${medida.id}`}
                id={`responsavel-${medida.id}`}
                value={medida.responsavel || ""}
                label="Responsável"
                onChange={(event) =>
                  handleMedidaChange(medida.id, controle.id, programaId, "responsavel", event.target.value)
                }
              >
                <MenuItem value="">
                  <em>Sem responsável</em>
                </MenuItem>
                {responsaveis.map((responsavel) => (
                  <MenuItem key={responsavel.id} value={responsavel.id}>
                    <ListItemText primary={responsavel.nome} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Datas de previsão */}
          <Grid size={{ md: 4, sm: 6, xs: 12 }}>
            <DatePicker
              sx={medidaStyles.datePicker}
              format="DD/MM/YYYY"
              value={medida.previsao_inicio ? dayjs(medida.previsao_inicio) : null}
              label="Data de início prevista"
              onChange={(date) => 
                handleMedidaChange(medida.id, controle.id, programaId, "previsao_inicio", date ? date.format('YYYY-MM-DD') : null)
              }
            />
          </Grid>
          
          <Grid size={{ md: 4, sm: 6, xs: 12 }}>
            <DatePicker
              sx={medidaStyles.datePicker}
              format="DD/MM/YYYY"
              value={medida.previsao_fim ? dayjs(medida.previsao_fim) : null}
              label="Data de conclusão prevista"
              onChange={(date) => 
                handleMedidaChange(medida.id, controle.id, programaId, "previsao_fim", date ? date.format('YYYY-MM-DD') : null)
              }
            />
          </Grid>
          
          {/* Status da Medida */}
          <Grid size={{ md: 6, sm: 6, xs: 12 }}>
            <FormControl fullWidth sx={medidaStyles.selectContainer}>
              <InputLabel id={`status-medida-label-${medida.id}`}>Status da Medida</InputLabel>
              <Select
                labelId={`status-medida-label-${medida.id}`}
                id={`status-medida-${medida.id}`}
                value={medida.status_medida || ""}
                label="Status da Medida"
                onChange={(event) =>
                  handleMedidaChange(medida.id, controle.id, programaId, "status_medida", event.target.value)
                }
              >
                {status_medida.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    <ListItemText primary={status.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Justificativa */}
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <Box sx={medidaStyles.textFieldContainer}>
              <TextField
                id={`justificativa-${medida.id}`}
                sx={medidaStyles.textField}
                label="Justificativa / Observação"
                value={localValues.justificativa}
                multiline
                onChange={(event) => handleTextChange("justificativa", event.target.value)}
              />
              {localValues.justificativa !== medida.justificativa && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSaveField("justificativa")}
                  sx={medidaStyles.saveButton}
                >
                  <SaveIcon />
                </Button>
              )}
            </Box>
          </Grid>
          
          {/* Encaminhamento Interno */}
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <Box sx={medidaStyles.textFieldContainer}>
              <TextField
                id={`encaminhamento_interno-${medida.id}`}
                sx={medidaStyles.textField}
                value={localValues.encaminhamento_interno}
                multiline
                label="Encaminhamento interno (para uso do órgão)"
                onChange={(event) => handleTextChange("encaminhamento_interno", event.target.value)}
              />
              {localValues.encaminhamento_interno !== medida.encaminhamento_interno && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSaveField("encaminhamento_interno")}
                  sx={medidaStyles.saveButton}
                >
                  <SaveIcon />
                </Button>
              )}
            </Box>
          </Grid>
          
          {/* Observação do Órgão */}
          <Grid size={{ md: 6, sm: 12, xs: 12 }}>
            <Box sx={medidaStyles.textFieldContainer}>
              <TextField
                id={`observacao_orgao-${medida.id}`}
                sx={medidaStyles.textField}
                value={localValues.observacao_orgao}
                multiline
                label="Observação do órgão"
                onChange={(event) => handleTextChange("observacao_orgao", event.target.value)}
              />
              {localValues.observacao_orgao !== medida.observacao_orgao && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSaveField("observacao_orgao")}
                  sx={medidaStyles.saveButton}
                >
                  <SaveIcon />
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default MedidaComponent;