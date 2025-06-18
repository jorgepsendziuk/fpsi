"use client";

import React, { useEffect, useState, useReducer, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
  Skeleton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  MoreVert as MoreVertIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import Image from 'next/image';
import * as dataService from "../diagnostico/services/dataService";
import { Programa } from "../diagnostico/types";
import { initialState, reducer } from "../diagnostico/state";
import { calculateProgramaMaturityCached } from "../diagnostico/utils/maturity";

export default function ProgramasPage() {
  const router = useRouter();
  const theme = useTheme();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadAllData = async () => {
    try {
      setLoading(true);
  // Carregar dados necessários para cálculos de maturidade
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);


      
      // Carregar dados em paralelo
      const [programasData, diagnosticosData] = await Promise.all([
        dataService.fetchProgramas(),
        dataService.fetchDiagnosticos()
      ]);
      
      setProgramas(programasData);
      dispatch({ type: "SET_PROGRAMAS", payload: programasData });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });
      
      // Carregar controles e medidas para cada programa
      for (const programa of programasData) {
        await loadProgramaData(programa.id);
      }
      
      setDataLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setToastMessage("Erro ao carregar dados");
      setToastSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const loadProgramaData = async (programaId: number) => {
    try {
      // Carregar responsáveis
      const responsaveis = await dataService.fetchResponsaveis(programaId);
      dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

      // Carregar controles e medidas para cada diagnóstico
      const diagnosticos = state.diagnosticos || [];
      for (const diagnostico of diagnosticos) {
        try {
          const controles = await dataService.fetchControles(diagnostico.id, programaId);
          dispatch({ type: "SET_CONTROLES", diagnosticoId: diagnostico.id, payload: controles });
          
          // Carregar medidas para cada controle
          for (const controle of controles) {
            try {
              const medidas = await dataService.fetchMedidas(controle.id, programaId);
              dispatch({ type: "SET_MEDIDAS", controleId: controle.id, payload: medidas });
            } catch (error) {
              console.log(`Medidas não encontradas para controle ${controle.id}`);
            }
          }
        } catch (error) {
          console.log(`Controles não encontrados para diagnóstico ${diagnostico.id}`);
        }
      }
    } catch (error) {
      console.log(`Dados não encontrados para programa ${programaId}`);
    }
  };

  const loadProgramas = async () => {
    try {
      const data = await dataService.fetchProgramas();
      setProgramas(data);
    } catch (error) {
      console.error("Erro ao carregar programas:", error);
      setToastMessage("Erro ao carregar programas");
      setToastSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  // Memoizar cálculos de maturidade para evitar recálculos desnecessários
  const programaMaturityData = useMemo(() => {
    if (!dataLoaded) return new Map();
    
    const maturityMap = new Map();
    programas.forEach(programa => {
      const maturity = calculateProgramaMaturityCached(programa.id, state);
      maturityMap.set(programa.id, maturity);
    });
    
    return maturityMap;
  }, [programas, state, dataLoaded]);

  const handleCreatePrograma = async () => {
    try {
      const { data, error } = await dataService.createPrograma();
      
      if (!error && data) {
        await dataService.createProgramaControlesForProgram(data.id);
        setProgramas([...programas, data]);
        setToastMessage("Programa criado com sucesso");
        setToastSeverity("success");
        setOpenDialog(false);
      } else {
        setToastMessage("Erro ao criar programa");
        setToastSeverity("error");
      }
    } catch (error) {
      setToastMessage("Erro ao criar programa");
      setToastSeverity("error");
    }
  };

  const handleDeletePrograma = async (programaId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      try {
        const { error } = await dataService.deletePrograma(programaId);
        
        if (!error) {
          setProgramas(programas.filter(p => p.id !== programaId));
          setToastMessage("Programa excluído com sucesso");
          setToastSeverity("success");
        } else {
          setToastMessage("Erro ao excluir programa");
          setToastSeverity("error");
        }
      } catch (error) {
        setToastMessage("Erro ao excluir programa");
        setToastSeverity("error");
      }
    }
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, programa: Programa) => {
    setAnchorEl(event.currentTarget);
    setSelectedPrograma(programa);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPrograma(null);
  };

  const handleAccessDiagnostico = (programa: Programa) => {
    router.push(`/programas/${programa.id}/diagnosticos`);
  };

  const getSetorLabel = (setor: number) => {
    return setor === 1 ? "Setor Público" : "Setor Privado";
  };

  const getSetorIcon = (setor: number) => {
    return setor === 1 ? <AccountBalanceIcon /> : <BusinessIcon />;
  };

  const getSetorColor = (setor: number) => {
    return setor === 1 ? "primary" : "secondary";
  };

  const getCardGradient = (setor: number) => {
    const color = setor === 1 ? theme.palette.primary.main : theme.palette.secondary.main;
    return `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`;
  };

  const getStatusFromMaturity = (maturityLabel: string) => {
    switch (maturityLabel) {
      case 'Aprimorado': return 'Concluído';
      case 'Em Aprimoramento': return 'Em andamento';
      case 'Intermediário': return 'Em andamento';
      case 'Básico': return 'Pendente';
      default: return 'Pendente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'success';
      case 'Em andamento': return 'info';
      case 'Pendente': return 'warning';
      case 'Revisão': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={500} height={30} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 280 }}>
                <CardContent>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="text" width="80%" height={30} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header melhorado */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 1
                }}
              >
                Meus Programas
              </Typography>
            </Box>
          </Box>
          
          
        </Box>
        
        <Divider sx={{ mb: 4 }} />
      </Box>

      {/* Programas Grid melhorado */}
      {programas.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 12,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderRadius: 4,
            border: '2px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.3)
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Image 
              src="/logo_p.png" 
              alt="FPSI Logo" 
              width={120} 
              height={120} 
              style={{ opacity: 0.7 }}
            />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bem-vindo ao FPSI
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Você ainda não possui programas de diagnóstico. Crie seu primeiro programa para começar a avaliar a segurança da informação da sua organização.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              }
            }}
          >
            Criar Primeiro Programa
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {programas.map((programa) => {
            const maturityData = programaMaturityData.get(programa.id) || { score: 0, label: 'Inicial' };
            const progress = Math.round(maturityData.score * 100);
            const status = getStatusFromMaturity(maturityData.label);
            
            return (
              <Grid item xs={12} sm={6} lg={4} key={programa.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    background: getCardGradient(programa.setor),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCard === programa.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredCard === programa.id 
                      ? `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}` 
                      : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                  onMouseEnter={() => setHoveredCard(programa.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    {/* Header do card com título e mais opções na mesma linha */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            fontWeight: 'bold',
                            mb: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            lineHeight: 1.3
                          }}
                        >
                          {programa.razao_social || programa.nome_fantasia || `Programa #${programa.id}`}
                          <Badge
                            color={getStatusColor(status) as any}
                            variant="dot"
                            sx={{
                              '& .MuiBadge-dot': {
                                width: 6,
                                height: 6,
                              }
                            }}
                          />
                        </Typography>
                        <Chip
                          label={status}
                          size="small"
                          color={getStatusColor(status) as any}
                          sx={{ borderRadius: 1, height: 20, fontSize: '0.75rem' }}
                        />
                      </Box>
                      
                      <Tooltip title="Mais opções">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, programa)}
                          sx={{
                            background: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            width: 32,
                            height: 32,
                            '&:hover': {
                              background: alpha(theme.palette.background.paper, 0.9),
                            }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Informações da empresa */}
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {programa.setor === 2 && programa.cnpj && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          <strong>CNPJ:</strong> {programa.cnpj}
                        </Typography>
                      )}

                      {programa.nome_fantasia && programa.razao_social && programa.nome_fantasia !== programa.razao_social && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          <strong>Nome:</strong> {programa.nome_fantasia}
                        </Typography>
                      )}
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        <strong>Maturidade:</strong> {maturityData.label}
                      </Typography>
                    </Stack>

                    {/* Progresso baseado em dados reais */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                          Progresso do Diagnóstico
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }
                        }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<AssessmentIcon />}
                      onClick={() => handleAccessDiagnostico(programa)}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      Acessar Diagnóstico
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* FAB melhorado */}
      {programas.length > 0 && (
        <Tooltip title="Criar novo programa">
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              width: 64,
              height: 64,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: 4,
              '&:hover': {
                boxShadow: 8,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
            onClick={() => setOpenDialog(true)}
          >
            <AddIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Tooltip>
      )}

      {/* Menu de ações melhorado */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 160,
            boxShadow: 4,
          }
        }}
      >
        <MenuItem onClick={() => console.log('Editar - TODO')} sx={{ py: 1.5 }}>
          <EditIcon sx={{ mr: 2, color: 'text.secondary' }} />
          Editar Programa
        </MenuItem>
        <MenuItem 
          onClick={() => selectedPrograma && handleDeletePrograma(selectedPrograma.id)}
          sx={{ py: 1.5, color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2 }} />
          Excluir Programa
        </MenuItem>
      </Menu>

      {/* Dialog melhorado */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 8,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image 
              src="/logo_p.png" 
              alt="FPSI Logo" 
              width={24} 
              height={24} 
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Criar Novo Programa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Um novo programa de diagnóstico será criado. Você poderá configurar todos os detalhes posteriormente na área de diagnósticos.
          </Typography>
          <Box sx={{
            p: 2,
            borderRadius: 2,
            background: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}>
            <Typography variant="body2" color="info.main" sx={{ fontWeight: 'bold' }}>
              💡 Dica: Após criar o programa, você poderá:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Configurar informações da organização
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Realizar diagnósticos de segurança
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Gerar relatórios detalhados
              </Typography>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreatePrograma} 
            variant="contained" 
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Criar Programa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast melhorado */}
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