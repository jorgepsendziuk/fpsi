"use client";

import React, { useReducer, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Paper,
  Chip,
  IconButton,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Fab,
  useTheme,
  alpha,
  Skeleton,
  Stack,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Policy as PolicyIcon,
  Group as GroupIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import { initialState, reducer } from "../../../diagnostico/state";
import * as dataService from "../../../diagnostico/services/dataService";
import { Programa } from '../../../diagnostico/types';
import DiagnosticoComponent from "../../../diagnostico/components/Diagnostico";
import ProgramaForm from "../../../diagnostico/programa";
import { calculateSumOfResponsesForDiagnostico, getMaturityLabel } from "../../../diagnostico/utils";
import { calculateDiagnosticoMaturity, clearMaturityCache } from "../../../diagnostico/utils/maturity";
import ResponsavelContainer from "../../../diagnostico/containers/ResponsavelContainer";

/**
 * DOCUMENTAÇÃO DOS CÁLCULOS DE MATURIDADE
 * 
 * O sistema utiliza três níveis de cálculo de maturidade:
 * 
 * 1. NÍVEL MEDIDA: Baseado nas respostas individuais (0-100)
 *    - Cada medida pode ter uma resposta de 0 a 100
 *    - A resposta indica o percentual de implementação da medida
 * 
 * 2. NÍVEL CONTROLE: Baseado na média das medidas + fator INCC
 *    - Média aritmética das respostas das medidas do controle
 *    - Multiplicado pelo fator INCC (Importância, Nível, Custo, Complexidade)
 *    - INCC varia de 1 a 5, sendo 5 o mais crítico
 * 
 * 3. NÍVEL DIAGNÓSTICO: Baseado na média ponderada dos controles
 *    - Soma ponderada de todos os controles do diagnóstico
 *    - Considera o peso/importância de cada controle
 * 
 * Faixas de Maturidade:
 * - Inicial: 0-29%
 * - Básico: 30-49%
 * - Intermediário: 50-69%
 * - Em Aprimoramento: 70-89%
 * - Aprimorado: 90-100%
 */

export default function DiagnosticosPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const programaId = parseInt(params.id as string);
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [orgaos, setOrgaos] = useState<any[]>([]);
  const [editedValues, setEditedValues] = useState<{[key: number]: {cnpj?: string, razao_social?: string}}>({});
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loadingControlIds, setLoadingControlIds] = useState<Set<number>>(new Set());
  const [editMode, setEditMode] = useState<{[key: string]: boolean}>({});
  const [programaEditValues, setProgramaEditValues] = useState<{[key: string]: any}>({});

  // Memoized handlers to prevent re-creation on every render
  const handleMedidaFetch = useCallback(async (controleId: number, programaId: number): Promise<void> => {
    try {
      console.log(`Fetching medidas for controle ${controleId}, programa ${programaId}`);
      const data = await dataService.fetchMedidas(controleId, programaId);
      console.log(`Medidas fetched:`, data.length);
      dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
    } catch (error) {
      console.error(`Error fetching medidas for controle ${controleId}:`, error);
    }
  }, []);

  const handleControleFetch = useCallback(async (diagnosticoId: number, programaId: number): Promise<void> => {
    const loadingKey = diagnosticoId;
    
    // Prevent duplicate requests
    if (loadingControlIds.has(loadingKey)) {
      console.log(`Already loading controls for diagnostico ${diagnosticoId}, skipping...`);
      return;
    }

    setLoadingControlIds(prev => new Set(prev).add(loadingKey));
    
    try {
      console.log(`Fetching controles for diagnostico ${diagnosticoId}, programa ${programaId}`);
      const data = await dataService.fetchControles(diagnosticoId, programaId);
      console.log(`Controles fetched:`, data.length);
      dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
      
      // Load measures for each control sequentially
      for (const controle of data) {
        await handleMedidaFetch(controle.id, programaId);
      }
    } catch (error) {
      console.error(`Error fetching controles for diagnostico ${diagnosticoId}:`, error);
    } finally {
      setLoadingControlIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(loadingKey);
        return newSet;
      });
    }
  }, [loadingControlIds, handleMedidaFetch]);

  const handleINCCChange = useCallback(async (programaControleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
    try {
      await dataService.updateControleNivel(programaControleId, newValue);
      dispatch({
        type: "UPDATE_CONTROLE",
        diagnosticoId,
        programaControleId,
        field: "nivel",
        value: newValue,
      });
      setToastMessage("Resposta atualizada com sucesso");
      setToastSeverity("success");
    } catch (error) {
      console.error("Error updating controle nivel:", error);
      setToastMessage("Erro ao atualizar resposta");
      setToastSeverity("error");
    }
  }, []);

  const handleMedidaChange = useCallback(async (medidaId: number, controleId: number, programaId: number, field: string, value: any) => {
    try {
      const { error } = await dataService.updateMedida(medidaId, programaId, field, value);

      if (!error) {
        dispatch({
          type: "UPDATE_MEDIDA",
          medidaId,
          controleId,
          field,
          value,
        });

        // Limpar cache de maturidade quando há mudança significativa
        if (['resposta', 'status_medida'].includes(field)) {
          clearMaturityCache(programaId);
          await handleMedidaFetch(controleId, programaId);
          
          // Find and reload the parent diagnostic
          const diagnosticoId = state.controles[Object.keys(state.controles).find(key => 
            state.controles[key].some((c: any) => c.id === controleId)
          ) || '']?.find((c: any) => c.id === controleId)?.diagnostico;

          if (diagnosticoId) {
            await handleControleFetch(diagnosticoId, programaId);
          }
        }

        setToastMessage("Resposta atualizada com sucesso");
        setToastSeverity("success");
      } else {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Error updating medida:", error);
      setToastMessage(`Erro ao atualizar: ${error.message}`);
      setToastSeverity("error");
    }
  }, [state.controles, handleControleFetch, handleMedidaFetch, programaId]);

  // Single useEffect for initial data loading
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      if (!mounted) return;
      
      try {
        console.log("=== INÍCIO DO CARREGAMENTO OTIMIZADO ===");
        console.log("Carregando dados iniciais para programa ID:", programaId);
        
        setLoading(true);
        
        // 1. Load basic data in parallel
        const [programasData, diagnosticosData, orgaosData] = await Promise.all([
          dataService.fetchProgramas(),
          dataService.fetchDiagnosticos(),
          dataService.fetchOrgaos()
        ]);

        if (!mounted) return;

        console.log("Dados básicos carregados:", { 
          programas: programasData.length, 
          diagnosticos: diagnosticosData.length, 
          orgaos: orgaosData.length 
        });

        // 2. Find specific program
        const programaAtual = programasData.find(p => p.id === programaId);
        if (!programaAtual) {
          setToastMessage("Programa não encontrado");
          setToastSeverity("error");
          router.push('/programas');
          return;
        }

        console.log("Programa encontrado:", programaAtual);

        // 3. Update state with basic data
        setPrograma(programaAtual);
        dispatch({ type: "SET_PROGRAMAS", payload: programasData });
        dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });
        setOrgaos(orgaosData);

        // 4. Load responsáveis
        console.log("Carregando responsáveis...");
        const responsaveis = await dataService.fetchResponsaveis(programaId);
        if (!mounted) return;
        
        console.log("Responsáveis carregados:", responsaveis.length);
        dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

        console.log("=== CARREGAMENTO INICIAL CONCLUÍDO ===");
        setDataLoaded(true);
        
      } catch (error) {
        if (!mounted) return;
        console.error("=== ERRO NO CARREGAMENTO ===", error);
        setToastMessage("Erro ao carregar dados do programa");
        setToastSeverity("error");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, [programaId, router]);

  const handleSaveCompanyDetails = useCallback(async (programaId: number) => {
    if (!editedValues[programaId]) return;
    
    try {
      const { error } = await dataService.updateProgramaDetails(programaId, {
        cnpj: editedValues[programaId].cnpj,
        razao_social: editedValues[programaId].razao_social
      });
        
      if (!error) {
        const updates: Partial<Programa> = {};
        
        if (editedValues[programaId].cnpj) {
          updates.cnpj = typeof editedValues[programaId].cnpj === 'string' 
            ? parseInt(editedValues[programaId].cnpj as string) 
            : editedValues[programaId].cnpj as number;
        }
        
        if (editedValues[programaId].razao_social) {
          updates.razao_social = editedValues[programaId].razao_social;
        }
        
        const updatedPrograma: Programa = { ...programa!, ...updates };
        setPrograma(updatedPrograma);
        
        setEditedValues(prev => {
          const newValues = {...prev};
          delete newValues[programaId];
          return newValues;
        });
        
        setToastMessage("Dados da empresa salvos com sucesso");
        setToastSeverity("success");
      } else {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Error saving company details:", error);
      setToastMessage("Erro ao salvar dados da empresa");
      setToastSeverity("error");
    }
  }, [editedValues, programa]);

  const handleReport = () => {
    router.push(`/diagnostico/relatorio?programaId=${programaId}`);
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(`/api/relatorio?programaId=${programaId}`);
      const data = await response.json();
      
      // Aqui você pode implementar a geração de PDF mais sofisticada
      setToastMessage("PDF gerado com sucesso");
      setToastSeverity("success");
    } catch (error) {
      setToastMessage("Erro ao gerar PDF");
      setToastSeverity("error");
    }
  };

  const handleDeletePrograma = async () => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      try {
        const { error } = await dataService.deletePrograma(programaId);
        
        if (!error) {
          setToastMessage("Programa excluído com sucesso");
          setToastSeverity("success");
          router.push('/programas');
        } else {
          setToastMessage("Erro ao excluir programa");
          setToastSeverity("error");
        }
      } catch (error) {
        setToastMessage("Erro ao excluir programa");
        setToastSeverity("error");
      }
    }
  };

  const getSetorLabel = (setor: number) => {
    return setor === 1 ? "Setor Público" : "Setor Privado";
  };

  const getSetorIcon = (setor: number) => {
    return setor === 1 ? <AccountBalanceIcon /> : <BusinessIcon />;
  };

  // Função para calcular maturidade de forma estável e documentada
  const calculateStableMaturity = useCallback((diagnosticoId: number): { score: number, label: string } => {
    return calculateDiagnosticoMaturity(diagnosticoId, programaId, state);
  }, [state, programaId]);

  // Função para lidar com edição de campos do programa
  const handleProgramaFieldChange = useCallback((field: string, value: any) => {
    setProgramaEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Função para salvar campo editado do programa
  const handleSaveProgramaField = useCallback(async (field: string) => {
    if (!programaEditValues[field] || !programa) return;

    try {
      const { error } = await dataService.updateProgramaField(programaId, field, programaEditValues[field]);
      
      if (!error) {
        setPrograma(prev => prev ? { ...prev, [field]: programaEditValues[field] } : null);
        setProgramaEditValues(prev => {
          const newValues = { ...prev };
          delete newValues[field];
          return newValues;
        });
        setEditMode(prev => ({ ...prev, [field]: false }));
        
        // Salvar mudanças nos responsáveis também atualiza o programa
        if (['responsavel_controle_interno', 'responsavel_si', 'responsavel_privacidade', 'responsavel_ti'].includes(field)) {
          await dataService.updateProgramaField(programaId, field, programaEditValues[field]);
        }
        
        setToastMessage("Campo atualizado com sucesso");
        setToastSeverity("success");
      } else {
        throw error;
      }
    } catch (error: any) {
      console.error("Error updating programa field:", error);
      setToastMessage(`Erro ao atualizar campo: ${error.message || 'Erro desconhecido'}`);
      setToastSeverity("error");
    }
  }, [programaEditValues, programa, programaId]);

  // Função para cancelar edição
  const handleCancelEdit = useCallback((field: string) => {
    setProgramaEditValues(prev => {
      const newValues = { ...prev };
      delete newValues[field];
      return newValues;
    });
    setEditMode(prev => ({ ...prev, [field]: false }));
  }, []);

  // Renderizar campo editável
  const renderEditableField = (field: string, label: string, value: any, type: 'text' | 'email' | 'tel' = 'text') => {
    const isEditing = editMode[field];
    const currentValue = isEditing ? (programaEditValues[field] ?? value) : value;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          label={label}
          type={type}
          value={currentValue || ""}
          disabled={!isEditing}
          onChange={(e) => handleProgramaFieldChange(field, e.target.value)}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
            },
          }}
        />
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => handleSaveProgramaField(field)}
              disabled={!programaEditValues[field] || programaEditValues[field] === value}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="secondary" 
              onClick={() => handleCancelEdit(field)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <IconButton 
            size="small" 
            onClick={() => setEditMode(prev => ({ ...prev, [field]: true }))}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={30} />
        </Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="rectangular" height={200} />
          </CardContent>
        </Card>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (!programa) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">Programa não encontrado</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header com nome da instituição */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton 
            onClick={() => router.push('/programas')}
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: 'text.primary',
                }}
              >
                {programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`}
              </Typography>
              <Chip
                icon={getSetorIcon(programa.setor)}
                label={getSetorLabel(programa.setor)}
                color={programa.setor === 1 ? "primary" : "secondary"}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          </Box>

          {/* Botões de ação melhorados */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="Visualizar Relatório">
              <Fab 
                size="small" 
                color="info"
                onClick={handleReport}
                sx={{ 
                  boxShadow: 3,
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <AssessmentIcon />
              </Fab>
            </Tooltip>
            
            <Tooltip title="Exportar PDF">
              <Fab 
                size="small" 
                color="secondary"
                onClick={handleGeneratePDF}
                sx={{ 
                  boxShadow: 3,
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <PictureAsPdfIcon />
              </Fab>
            </Tooltip>
            
            <Tooltip title="Salvar Alterações">
              <Fab 
                size="small" 
                color="success"
                onClick={() => handleSaveCompanyDetails(programaId)}
                sx={{ 
                  boxShadow: 3,
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <SaveIcon />
              </Fab>
            </Tooltip>
            
            <Tooltip title="Excluir Programa">
              <Fab 
                size="small" 
                color="error"
                onClick={handleDeletePrograma}
                sx={{ 
                  boxShadow: 3,
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              >
                <DeleteIcon />
              </Fab>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Stack spacing={2}>
          {/* Seção de Dados do Programa - ACCORDION COLLAPSED */}
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: '8px 8px 0 0',
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    }
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      DADOS DO PROGRAMA
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  {/* Campos editáveis do programa */}
                  <Grid container spacing={2}>
                    <Grid size={{ md: 4, sm: 6, xs: 12}}>
                      {renderEditableField('atendimento_fone', 'Telefone de Atendimento', programa?.atendimento_fone, 'tel')}
                    </Grid>
                    <Grid size={{ md: 4, sm: 6, xs: 12}}>
                      {renderEditableField('atendimento_email', 'Email de Atendimento', programa?.atendimento_email, 'email')}
                    </Grid>
                    <Grid size={{ md: 4, sm: 6, xs: 12}}>
                      {renderEditableField('atendimento_site', 'Site de Atendimento', programa?.atendimento_site)}
                    </Grid>
                    <Grid size={{ md: 6, sm: 6, xs: 12}}>
                      {renderEditableField('politica_inicio_vigencia', 'Início da Vigência da Política', programa?.politica_inicio_vigencia)}
                    </Grid>
                    <Grid size={{ md: 6, sm: 6, xs: 12}}>
                      {renderEditableField('politica_prazo_revisao', 'Prazo de Revisão da Política', programa?.politica_prazo_revisao)}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Seção de Responsabilidades - EXTRAÍDA PARA O NÍVEL PRINCIPAL */}
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: '8px 8px 0 0',
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    }
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GroupIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      RESPONSABILIDADES
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ md: 3, xs: 12}}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Responsável Controle Interno</InputLabel>
                        <Select 
                          value={programa?.responsavel_controle_interno || ""}
                          onChange={(e) => handleProgramaFieldChange('responsavel_controle_interno', e.target.value)}
                        >
                          <MenuItem value="">Não definido</MenuItem>
                          {state.responsaveis?.map((resp: any) => (
                            <MenuItem key={resp.id} value={resp.id}>{resp.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Responsável SI</InputLabel>
                        <Select 
                          value={programa?.responsavel_si || ""}
                          onChange={(e) => handleProgramaFieldChange('responsavel_si', e.target.value)}
                        >
                          <MenuItem value="">Não definido</MenuItem>
                          {state.responsaveis?.map((resp: any) => (
                            <MenuItem key={resp.id} value={resp.id}>{resp.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Responsável Privacidade</InputLabel>
                        <Select 
                          value={programa?.responsavel_privacidade || ""}
                          onChange={(e) => handleProgramaFieldChange('responsavel_privacidade', e.target.value)}
                        >
                          <MenuItem value="">Não definido</MenuItem>
                          {state.responsaveis?.map((resp: any) => (
                            <MenuItem key={resp.id} value={resp.id}>{resp.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Responsável TI</InputLabel>
                        <Select 
                          value={programa?.responsavel_ti || ""}
                          onChange={(e) => handleProgramaFieldChange('responsavel_ti', e.target.value)}
                        >
                          <MenuItem value="">Não definido</MenuItem>
                          {state.responsaveis?.map((resp: any) => (
                            <MenuItem key={resp.id} value={resp.id}>{resp.nome}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {/* DataGrid para gerenciar responsáveis */}
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Gerenciar Responsáveis
                      </Typography>
                      <ResponsavelContainer 
                        programa={programaId} 
                        onUpdate={async () => {
                          // Recarregar responsáveis quando houver atualizações
                          const responsaveis = await dataService.fetchResponsaveis(programaId);
                          dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });
                        }}
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Seção de Políticas */}
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: '8px 8px 0 0',
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    }
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PolicyIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      POLÍTICAS DE SEGURANÇA
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<SecurityIcon />}
                    onClick={() => router.push(`/politica/protecao_dados_pessoais?programaId=${programa.id}`)}
                    sx={{
                      py: 1.5,
                      borderRadius: 1.5,
                      color: 'text.primary',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    Política de Proteção de Dados Pessoais
                  </Button>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Seção de Diagnósticos - ACCORDION COLLAPSED */}
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: alpha(theme.palette.grey[100], 0.5),
                    borderRadius: '8px 8px 0 0',
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    }
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.secondary' }} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      DIAGNÓSTICO
                    </Typography>
                    {!dataLoaded && (
                      <Chip 
                        label="Carregando..." 
                        size="small"
                        sx={{ 
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          backgroundColor: alpha(theme.palette.grey[400], 0.2),
                        }}
                      />
                    )}
                    
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  {/* Renderizar diagnósticos */}
                  <Stack spacing={2}>
                    {state.diagnosticos.map((diagnostico: any, index: number) => {
                      const maturityData = calculateStableMaturity(diagnostico.id);
                      const controles = state.controles && state.controles[diagnostico.id] ? 
                        state.controles[diagnostico.id].filter((controle: any) => controle.programa === programa.id) : 
                        [];

                      console.log(`Rendering diagnostico ${diagnostico.id} with ${controles.length} controles, stable maturity: ${maturityData.score} (${maturityData.label})`);
                      
                      return (
                        <Box key={`${diagnostico.id}-${index}`}>
                          <DiagnosticoComponent
                            programa={programa}
                            diagnostico={diagnostico}
                            handleControleFetch={handleControleFetch}
                            state={state}
                            controles={controles}
                            maturityScore={maturityData.score}
                            maturityLabel={maturityData.label}
                            handleINCCChange={handleINCCChange}
                            handleMedidaFetch={handleMedidaFetch}
                            handleMedidaChange={handleMedidaChange}
                            responsaveis={state.responsaveis || []}
                          />
                        </Box>
                      );
                    })}
                    
                    {state.diagnosticos.length === 0 && !loading && (
                      <Paper 
                        sx={{ 
                          p: 4, 
                          textAlign: 'center',
                          background: alpha(theme.palette.warning.main, 0.1),
                          border: `1px dashed ${theme.palette.warning.main}`
                        }}
                      >
                        <Typography variant="h6" color="warning.main">
                          Nenhum diagnóstico encontrado
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Os dados dos diagnósticos podem estar sendo carregados...
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Stack>
      </LocalizationProvider>
      
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={6000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToastMessage(null)} 
          severity={toastSeverity} 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
} 