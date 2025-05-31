"use client";

import React, { useReducer, useEffect, useState } from "react";
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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("=== INÍCIO DO CARREGAMENTO ===");
        console.log("Carregando dados iniciais para programa ID:", programaId);
        
        // 1. Carregar dados básicos em paralelo
        const [programasData, diagnosticosData, orgaosData] = await Promise.all([
          dataService.fetchProgramas(),
          dataService.fetchDiagnosticos(),
          dataService.fetchOrgaos()
        ]);

        console.log("Dados básicos carregados:", { 
          programas: programasData.length, 
          diagnosticos: diagnosticosData.length, 
          orgaos: orgaosData.length 
        });

        // 2. Encontrar o programa específico
        const programaAtual = programasData.find(p => p.id === programaId);
        if (!programaAtual) {
          setToastMessage("Programa não encontrado");
          setToastSeverity("error");
          router.push('/programas');
          return;
        }

        console.log("Programa encontrado:", programaAtual);

        // 3. Atualizar estado com dados básicos
        setPrograma(programaAtual);
        dispatch({ type: "SET_PROGRAMAS", payload: programasData });
        dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });
        setOrgaos(orgaosData);

        // 4. Carregar responsáveis
        console.log("Carregando responsáveis...");
        const responsaveis = await dataService.fetchResponsaveis(programaId);
        console.log("Responsáveis carregados:", responsaveis.length);
        dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

        // 5. Aguardar um momento para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100));

        // 6. Carregar controles e medidas sequencialmente para cada diagnóstico
        console.log("Iniciando carregamento de controles e medidas...");
        for (const diagnostico of diagnosticosData) {
          console.log(`--- Processando diagnóstico ${diagnostico.id}: ${diagnostico.descricao} ---`);
          
          // Carregar controles para este diagnóstico
          const controles = await dataService.fetchControles(diagnostico.id, programaId);
          console.log(`Controles encontrados para diagnóstico ${diagnostico.id}:`, controles.length);
          
          // Atualizar estado com controles
          dispatch({ type: "SET_CONTROLES", diagnosticoId: diagnostico.id, payload: controles });
          
          // Carregar medidas para cada controle
          for (const controle of controles) {
            console.log(`  -> Carregando medidas para controle ${controle.id}: ${controle.nome}`);
            const medidas = await dataService.fetchMedidas(controle.id, programaId);
            console.log(`  -> Medidas encontradas:`, medidas.length);
            
            // Atualizar estado com medidas
            dispatch({ type: "SET_MEDIDAS", controleId: controle.id, payload: medidas });
            
            // Pequena pausa para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        console.log("=== CARREGAMENTO CONCLUÍDO ===");
        setDataLoaded(true);
        
      } catch (error) {
        console.error("=== ERRO NO CARREGAMENTO ===", error);
        setToastMessage("Erro ao carregar dados do programa");
        setToastSeverity("error");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [programaId, router]);

  // Função para recarregar dados quando necessário
  const reloadDiagnosticData = async () => {
    console.log("Recarregando dados dos diagnósticos...");
    
    for (const diagnostico of state.diagnosticos) {
      const controles = await dataService.fetchControles(diagnostico.id, programaId);
      dispatch({ type: "SET_CONTROLES", diagnosticoId: diagnostico.id, payload: controles });
      
      for (const controle of controles) {
        const medidas = await dataService.fetchMedidas(controle.id, programaId);
        dispatch({ type: "SET_MEDIDAS", controleId: controle.id, payload: medidas });
      }
    }
  };

  const fetchControlesAndMedidas = async (programaId: number, diagnosticos?: any[]) => {
    // Esta função agora é chamada apenas quando necessário para recarregamentos
    const diagnosticosToUse = diagnosticos || state.diagnosticos;
    console.log("Recarregando controles e medidas para:", diagnosticosToUse.length, "diagnósticos");
    
    for (const diagnostico of diagnosticosToUse) {
      await handleControleFetch(diagnostico.id, programaId);
      
      const controles = await dataService.fetchControles(diagnostico.id, programaId);
      for (const controle of controles) {
        await handleMedidaFetch(controle.id, programaId);
      }
    }
  };

  const handleControleFetch = async (diagnosticoId: number, programaId: number): Promise<void> => {
    console.log(`Fetching controles for diagnostico ${diagnosticoId}, programa ${programaId}`);
    const data = await dataService.fetchControles(diagnosticoId, programaId);
    console.log(`Controles fetched:`, data);
    dispatch({ type: "SET_CONTROLES", diagnosticoId, payload: data });
  };

  const handleMedidaFetch = async (controleId: number, programaId: number): Promise<void> => {
    console.log(`Fetching medidas for controle ${controleId}, programa ${programaId}`);
    const data = await dataService.fetchMedidas(controleId, programaId);
    console.log(`Medidas fetched:`, data);
    dispatch({ type: "SET_MEDIDAS", controleId, payload: data });
  };

  const handleINCCChange = async (programaControleId: number, diagnosticoId: number, newValue: number): Promise<void> => {
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
  };

  const handleMedidaChange = async (medidaId: number, controleId: number, programaId: number, field: string, value: any) => {
    const { error } = await dataService.updateMedida(medidaId, programaId, field, value);

    if (!error) {
      dispatch({
        type: "UPDATE_MEDIDA",
        medidaId,
        controleId,
        field,
        value,
      });

      await handleMedidaFetch(controleId, programaId);

      const diagnosticoId = state.controles[Object.keys(state.controles).find(key => 
        state.controles[key].some((c: any) => c.id === controleId)
      ) || '']?.find((c: any) => c.id === controleId)?.diagnostico;

      if (diagnosticoId) {
        await handleControleFetch(diagnosticoId, programaId);
      }

      setToastMessage("Resposta atualizada com sucesso");
      setToastSeverity("success");
    } else {
      setToastMessage(`Erro ao atualizar: ${error.message}`);
      setToastSeverity("error");
    }
  };

  const handleSaveCompanyDetails = async (programaId: number) => {
    if (!editedValues[programaId]) return;
    
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
      setToastMessage("Erro ao salvar dados da empresa");
      setToastSeverity("error");
    }
  };

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
      {/* Breadcrumbs e Header melhorados */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link 
            color="inherit" 
            href="/programas" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={(e) => {
              e.preventDefault();
              router.push('/programas');
            }}
          >
            Programas
          </Link>
          <Typography color="text.primary">
            Programa #{programa.id}
          </Typography>
          <Typography color="primary.main" sx={{ fontWeight: 'bold' }}>
            Diagnóstico
          </Typography>
        </Breadcrumbs>

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
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Diagnóstico de Segurança
                </Typography>
                <Chip
                  icon={getSetorIcon(programa.setor)}
                  label={getSetorLabel(programa.setor)}
                  color={programa.setor === 1 ? "primary" : "secondary"}
                  sx={{ borderRadius: 2 }}
                />
              </Box>
              <Typography variant="h6" color="text.secondary">
                {programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`}
              </Typography>
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
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <Stack spacing={3}>
          {/* Seção de Dados da Instituição - APENAS OS CAMPOS, SEM ACCORDION DUPLICADO */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  DADOS DA INSTITUIÇÃO
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Campos diretos sem accordion interno */}
              <Grid container spacing={3}>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <TextField
                    fullWidth
                    label="Telefone de Atendimento"
                    value={programa?.atendimento_fone || ""}
                    disabled
                  />
                </Grid>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <TextField
                    fullWidth
                    label="Email de Atendimento"
                    value={programa?.atendimento_email || ""}
                    disabled
                  />
                </Grid>
                <Grid size={{ md: 4, sm: 6, xs: 12}}>
                  <TextField
                    fullWidth
                    label="Site de Atendimento"
                    value={programa?.atendimento_site || ""}
                    disabled
                  />
                </Grid>
                <Grid size={{ md: 6, sm: 6, xs: 12}}>
                  <TextField
                    fullWidth
                    label="Início da Vigência da Política"
                    value={programa?.politica_inicio_vigencia || ""}
                    disabled
                  />
                </Grid>
                <Grid size={{ md: 6, sm: 6, xs: 12}}>
                  <TextField
                    fullWidth
                    label="Prazo de Revisão da Política"
                    value={programa?.politica_prazo_revisao || ""}
                    disabled
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Seção de Responsabilidades - EXTRAÍDA PARA O NÍVEL PRINCIPAL */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: `linear-gradient(45deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    borderRadius: '12px 12px 0 0',
                    minHeight: 64,
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <GroupIcon color="success" sx={{ fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                      RESPONSABILIDADES
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ md: 3, xs: 12}}>
                      <FormControl fullWidth disabled>
                        <InputLabel>Responsável Controle Interno</InputLabel>
                        <Select value={programa?.responsavel_controle_interno || ""}>
                          <MenuItem value="">Não definido</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth disabled>
                        <InputLabel>Responsável SI</InputLabel>
                        <Select value={programa?.responsavel_si || ""}>
                          <MenuItem value="">Não definido</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth disabled>
                        <InputLabel>Responsável Privacidade</InputLabel>
                        <Select value={programa?.responsavel_privacidade || ""}>
                          <MenuItem value="">Não definido</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ md: 3, sm: 6, xs: 12}}>
                      <FormControl fullWidth disabled>
                        <InputLabel>Responsável TI</InputLabel>
                        <Select value={programa?.responsavel_ti || ""}>
                          <MenuItem value="">Não definido</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Seção de Políticas */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Accordion 
                sx={{ 
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  '& .MuiAccordionSummary-root': {
                    background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    borderRadius: '12px 12px 0 0',
                    minHeight: 64,
                  }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PolicyIcon color="secondary" sx={{ fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                      POLÍTICAS DE SEGURANÇA
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<SecurityIcon />}
                    onClick={() => router.push(`/politica/protecao_dados_pessoais?programaId=${programa.id}`)}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    Política de Proteção de Dados Pessoais
                  </Button>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* Seção de Diagnósticos - SEM accordion externo */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}
                >
                  DIAGNÓSTICOS DE SEGURANÇA
                </Typography>
                {!dataLoaded && (
                  <Chip 
                    label="Carregando dados..." 
                    color="warning" 
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
                {dataLoaded && (
                  <Chip 
                    label={`${state.diagnosticos.length} diagnóstico(s)`}
                    color="success" 
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Renderizar diagnósticos diretamente sem accordion externo */}
              <Stack spacing={3}>
                {state.diagnosticos.map((diagnostico: any, index: number) => {
                  const calculatedMaturityScore = calculateSumOfResponsesForDiagnostico(diagnostico.id, state);
                  const calculatedMaturityLabel = getMaturityLabel(Number(calculatedMaturityScore));
                  const controles = state.controles && state.controles[diagnostico.id] ? 
                    state.controles[diagnostico.id].filter((controle: any) => controle.programa === programa.id) : 
                    [];

                  console.log(`Rendering diagnostico ${diagnostico.id} with ${controles.length} controles, maturity: ${calculatedMaturityScore}`);
                  
                  return (
                    <Box key={`${diagnostico.id}-${index}`}>
                      <DiagnosticoComponent
                        programa={programa}
                        diagnostico={diagnostico}
                        handleControleFetch={handleControleFetch}
                        state={state}
                        controles={controles}
                        maturityScore={calculatedMaturityScore}
                        maturityLabel={calculatedMaturityLabel}
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