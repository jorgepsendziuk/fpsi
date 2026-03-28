// React and hooks
import React, { useMemo } from 'react';

// Material UI components
import {
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
  Divider,
  Tooltip,
  Alert,
  alpha,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

// Material UI icons
import SaveIcon from '@mui/icons-material/Save';
import AssignmentIcon from '@mui/icons-material/Assignment';
import InfoIcon from '@mui/icons-material/Info';
import CircleIcon from '@mui/icons-material/Circle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// Components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

// Utils
import dayjs from 'dayjs';
import { respostas, respostasimnao, status_medida, status_plano_acao } from '../../../lib/utils/utils';

// Types
import { Medida as MedidaType, Controle, Responsavel, TextFieldsState, MedidaTextField, ProgramaMedida } from '../../../lib/types/types';
import type { EvidenciaSugestao as EvidenciaSugestaoTipo } from '../../../lib/medidas/evidenciaRules';
import { respostaAtualIgualSugestao } from '../../../lib/medidas/evidenciaRules';
import {
  GRUPO_IMPLEMENTACAO_HINT,
  GRUPO_FILTRO_CUMULATIVO_RESUMO,
  GRUPO_GI_PALETTE,
  labelGrupoGi,
  normalizeGrupoImpleCode,
} from '../../../lib/utils/grupoImplementacao';

// Styles
import { medidaStyles } from './styles';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '@mui/material/styles';
import { splitMedidaDescricao } from '@/lib/normas/medidaDescricao';
import { NormasReferenciaSection } from '@/components/normas/NormasReferenciaSection';

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
  /** Sugestão derivada de dados do programa (Controle 0 / diag. 1) */
  evidenciaSugestao?: EvidenciaSugestaoTipo | null;
  evidenciaLoading?: boolean;
  onAplicarSugestao?: () => void | Promise<void>;
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
  evidenciaSugestao = null,
  evidenciaLoading = false,
  onAplicarSugestao,
}) => {
  const { getContrastTextColor } = useThemeColors();
  const theme = useTheme();

  const { textoOrientativo, normasReferencia } = useMemo(
    () => splitMedidaDescricao(medida.descricao ?? ''),
    [medida.descricao]
  );

  // Buscar a cor do status do plano de trabalho do sistema existente
  const statusInfo = status_plano_acao.find(status => status.id === programaMedida?.status_plano_acao);

  // Obter descrição da resposta selecionada
  const getRespostaDescricao = (respostaId: number | string) => {
    const respostasArray = controle.diagnostico === 1 ? respostasimnao : respostas;
    const id = typeof respostaId === 'string' ? parseInt(respostaId, 10) : respostaId;
    const resposta = respostasArray.find(r => r.id === id);
    return (resposta as any)?.descricao;
  };

  // Obter cor baseada na resposta
  const getRespostaColor = (respostaId: number) => {
    // Para diagnóstico 1 (sim/não) - usando respostasimnao
    if (controle.diagnostico === 1) {
      // respostasimnao: { id: 1, label: "Sim" }, { id: 2, label: "Não" }
      return respostaId === 1 ? '#4CAF50' : respostaId === 2 ? '#FF5252' : '#9E9E9E';
    }
    
    // Para outros diagnósticos (escala 1-6) - usando respostas
    switch (respostaId) {
      case 1: return '#4CAF50'; // Verde - Adota totalmente
      case 2: return '#8BC34A'; // Verde claro - Adota em menor parte
      case 3: return '#FFC107'; // Amarelo - Adota parcialmente  
      case 4: return '#FF9800'; // Laranja - Há plano aprovado
      case 5: return '#FF5722'; // Vermelho claro - Não adota
      case 6: return '#9E9E9E'; // Cinza - Não se aplica
      default: return '#9E9E9E';
    }
  };

  // Preparar array de respostas
  const respostasArray = controle.diagnostico === 1 ? respostasimnao : respostas;

  const giCode = normalizeGrupoImpleCode(medida.grupo_imple) as 'G1' | 'G2' | 'G3' | null;
  const giPalette = giCode ? GRUPO_GI_PALETTE[giCode] : null;

  const grupoGiTooltip = `${GRUPO_IMPLEMENTACAO_HINT}\n\n${GRUPO_FILTRO_CUMULATIVO_RESUMO}`;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <Box
            sx={{
              ...medidaStyles.container(theme),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {giCode && giPalette && (
              <Tooltip
                title={
                  <Box component="div" sx={{ maxWidth: 440, py: 0.25 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                      {grupoGiTooltip}
                    </Typography>
                  </Box>
                }
                arrow
                placement="left"
                enterDelay={250}
                slotProps={{ tooltip: { sx: { maxWidth: 480 } } }}
              >
                <Box
                  component="span"
                  aria-label={`Grupo de implementação ${labelGrupoGi(giCode)}`}
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 2,
                    px: 2.35,
                    py: 0.85,
                    borderRadius: 2.5,
                    fontWeight: 800,
                    fontSize: '1.0625rem',
                    letterSpacing: '0.1em',
                    textTransform: 'none',
                    color: giPalette.main,
                    background: `linear-gradient(135deg, ${alpha(giPalette.main, 0.22)} 0%, ${alpha(giPalette.main, 0.1)} 100%)`,
                    border: `1px solid ${alpha(giPalette.main, 0.42)}`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: `0 4px 20px ${alpha(giPalette.main, 0.18)}, inset 0 1px 0 ${alpha('#fff', 0.35)}`,
                    cursor: 'help',
                    userSelect: 'none',
                  }}
                >
                  {labelGrupoGi(giCode)}
                </Box>
              </Tooltip>
            )}

            {controle.diagnostico === 1 && evidenciaLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CircularProgress size={18} />
                <Typography variant="body2" color="text.secondary">
                  Carregando sugestão do sistema…
                </Typography>
              </Box>
            )}

            {controle.diagnostico === 1 &&
              !evidenciaLoading &&
              evidenciaSugestao?.regraDefinida &&
              evidenciaSugestao.respostaSugerida != null && (
                <Alert
                  severity="info"
                  icon={<AutoAwesomeIcon fontSize="inherit" />}
                  sx={{ mb: 2, alignItems: 'flex-start' }}
                  action={
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={respostaAtualIgualSugestao(
                        programaMedida?.resposta,
                        evidenciaSugestao.respostaSugerida
                      )}
                      onClick={() => void onAplicarSugestao?.()}
                    >
                      Aplicar
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    <strong>{evidenciaSugestao.respostaSugerida === 1 ? 'Sim' : 'Não'}</strong>
                    {' — '}
                    {evidenciaSugestao.motivo}
                  </Typography>
                </Alert>
              )}

            {controle.diagnostico === 1 &&
              !evidenciaLoading &&
              evidenciaSugestao &&
              !evidenciaSugestao.regraDefinida &&
              (medida.id_medida === '0.4' || medida.id_medida === '0.5') && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {evidenciaSugestao.motivo}
                </Alert>
              )}

            {/* Cards de Resposta e Plano de Trabalho */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {/* Card de Resposta */}
              <Grid size={{ xs: 12, md: 6 }}>
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
                      renderValue={(selected) => {
                        console.log('renderValue chamado com:', selected, 'tipo:', typeof selected);
                        if (!selected) {
                          return <em>Selecionar resposta...</em>;
                        }
                        
                        // Converter para number para comparação
                        const selectedId = typeof selected === 'string' ? parseInt(selected, 10) : selected;
                        console.log('renderValue - selectedId convertido:', selectedId);
                        console.log('renderValue - respostasArray:', respostasArray);
                        
                        const resposta = respostasArray.find(r => {
                          console.log('Comparando:', r.id, '===', selectedId, '?', r.id === selectedId);
                          return r.id === selectedId;
                        });
                        
                        console.log('renderValue - resposta encontrada:', resposta);
                        
                        if (!resposta) {
                          return `Resposta inválida (ID: ${selectedId})`;
                        }
                        
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircleIcon sx={{ fontSize: 16, color: getRespostaColor(selectedId) }} />
                            <Typography>{resposta.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      <MenuItem value="">
                        <em>Selecionar resposta...</em>
                      </MenuItem>
                      {respostasArray.map((resposta) => {
                        console.log('Renderizando MenuItem:', resposta);
                        return (
                          <MenuItem key={resposta.id} value={resposta.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircleIcon sx={{ fontSize: 16, color: getRespostaColor(resposta.id) }} />
                              <Typography>{resposta.label}</Typography>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                </Box>
              </Grid>

              {/* Card do Plano de Trabalho */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={medidaStyles.actionPlanCard(theme, statusInfo?.color)}>
                  <Typography sx={medidaStyles.actionPlanTitle(theme)}>
                    PLANO DE TRABALHO
                  </Typography>
                  <Box sx={{ flex: '1 1 auto', display: 'flex', alignItems: 'center' }}>
                    <Chip
                      sx={{
                        width: '100%',
                        height: 'auto',
                        py: 1,
                        fontWeight: 600,
                        fontSize: '0.9rem',
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

            {/* Descrição da Resposta Selecionada */}
            {programaMedida?.resposta && controle.diagnostico !== 1 && getRespostaDescricao(programaMedida.resposta) && (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Descrição da resposta selecionada:</strong><br />
                  {getRespostaDescricao(programaMedida.resposta)}
                </Typography>
              </Alert>
            )}

            {/* Seção de Descrição (sem bloco &quot;Normas de referência&quot;, exibido à parte) */}
            <Box sx={medidaStyles.descriptionSection(theme)}>
              <Typography sx={medidaStyles.descriptionText(theme)} align="justify">
                &ldquo;{textoOrientativo || medida.descricao}&rdquo;
              </Typography>
            </Box>

            {normasReferencia && (
              <NormasReferenciaSection normasReferencia={normasReferencia} />
            )}

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
                          <ListItemText primary={`${responsavel.nome} (${responsavel.departamento || 'Sem setor'})`} />
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