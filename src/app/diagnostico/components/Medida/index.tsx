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
import AssignmentIcon from '@mui/icons-material/Assignment';

// Components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// Utils
import dayjs from 'dayjs';
import { respostas, respostasimnao, status_medida, status_plano_acao } from '../../utils';

// Types
import { Medida as MedidaType, Controle, Responsavel, TextFieldsState, MedidaTextField, ProgramaMedida } from '../../types';

// Styles
import { medidaStyles } from './styles';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTheme } from '@mui/material/styles';

/**
 * Props for the Medida component
 */
export interface MedidaProps {
  /** The measure data */
  medida: MedidaType;
  /** The programa medida data containing junction table data */
  programaMedida?: ProgramaMedida;
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
  programaMedida,
  controle,
  programaId,
  handleMedidaChange,
  responsaveis,
  localValues,
  handleTextChange,
  handleSaveField,
}) => {
  const { accordionStyles, getContrastTextColor } = useThemeColors();
  const theme = useTheme();

  // Buscar a cor do status do plano de ação do sistema existente
  const statusInfo = status_plano_acao.find(status => status.id === programaMedida?.status_plano_acao);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Box sx={medidaStyles.container(theme)}>
        {/* Header da Medida */}
        <Box sx={medidaStyles.header(theme)}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 12 }}>
              <Box sx={medidaStyles.headerTitle(theme)}>
                <AssignmentIcon />
                <Typography variant="h6" component="span" sx={{ color: 'white', fontWeight: 700 }}>
                  {medida.id_medida} - {medida.medida}
                </Typography>
              </Box>
            </Grid>
            
          </Grid>
        </Box>


        {/* Cards de Resposta e Plano de Ação */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Card de Resposta */}
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Box sx={medidaStyles.responseCard(theme, false)}>
              <Typography sx={medidaStyles.responseTitle(theme, false)}>
                RESPOSTA
              </Typography>
              <Box sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
                <Select
                  sx={{ 
                    width: '100%',
                  }}
                  value={programaMedida?.resposta || ""}
                  displayEmpty
                  onChange={(event) =>
                    handleMedidaChange(medida.id, controle.id, programaId, "resposta", event.target.value)
                  }
                >
                  <MenuItem value="">
                    <em>Selecionar resposta...</em>
                  </MenuItem>
                  {(controle.diagnostico === 1 ? respostasimnao : respostas).map((resposta) => (
                    <MenuItem key={resposta.id} value={resposta.id}>
                      <ListItemText primary={resposta.label} />
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>
          </Grid>

          {/* Card do Plano de Ação */}
          <Grid size={{ xs: 12, sm: 12, md: 6 }}>
            <Box sx={medidaStyles.actionPlanCard(theme, statusInfo?.color)}>
              <Typography sx={medidaStyles.actionPlanTitle(theme)}>
                PLANO DE AÇÃO
              </Typography>
              <Box sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
                <Chip
                  sx={{
                    width: '100%',
                    height: 'auto',
                    py: 1,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    border: '1px solid #ccc',
                    backgroundColor: statusInfo?.color || '#e9ecef',
                    color: '#000000',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }
                  }}
                  label={statusInfo?.label || "Não definido"}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Seção de Descrição */}
        <Box sx={medidaStyles.descriptionSection(theme)}>
                      <Typography sx={medidaStyles.descriptionText(theme)} align="justify">
              &ldquo;{medida.descricao}&rdquo;
            </Typography>
        </Box>

        {/* Formulário */}
        <Box sx={medidaStyles.formSection(theme)}>
          <Grid container spacing={3}>
            {/* Responsável */}
            <Grid size={{ md: 4, sm: 12, xs: 12 }}>
              <FormControl fullWidth sx={medidaStyles.selectContainer}>
                <InputLabel id={`responsavel-label-${medida.id}`}>Responsável</InputLabel>
                <Select
                  labelId={`responsavel-label-${medida.id}`}
                  id={`responsavel-${medida.id}`}
                  value={programaMedida?.responsavel || ""}
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
                value={programaMedida?.previsao_inicio ? dayjs(programaMedida.previsao_inicio) : null}
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
                value={programaMedida?.previsao_fim ? dayjs(programaMedida.previsao_fim) : null}
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
                  value={programaMedida?.status_medida || ""}
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
                {localValues.justificativa !== programaMedida?.justificativa && (
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
                {localValues.encaminhamento_interno !== programaMedida?.encaminhamento_interno && (
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
                {localValues.observacao_orgao !== programaMedida?.observacao_orgao && (
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
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default MedidaComponent;