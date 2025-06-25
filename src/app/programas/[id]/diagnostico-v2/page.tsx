"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Fab,
  useMediaQuery,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as ArrowBackIcon,
  ExpandLess,
  ExpandMore,
  Security as SecurityIcon,
  Policy as PolicyIcon,
  Assessment as AssessmentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import * as dataService from "../../../diagnostico/services/dataService";
import { Diagnostico, Controle, Medida, Responsavel, ProgramaMedida } from "../../../diagnostico/types";
import MedidaContainer from "../../../diagnostico/containers/MedidaContainer";
import ControleContainer from "../../../diagnostico/containers/ControleContainer";

const DRAWER_WIDTH = 380;

interface TreeNode {
  id: string;
  type: 'diagnostico' | 'controle' | 'medida';
  label: string;
  description?: string;
  icon: React.ReactNode;
  data: any;
  children?: TreeNode[];
  expanded?: boolean;
  maturityScore?: number;
  maturityLabel?: string;
}

export default function DiagnosticoV2Page() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const programaId = parseInt(params.id as string);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estado principal
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [controles, setControles] = useState<{ [key: number]: Controle[] }>({});
  const [medidas, setMedidas] = useState<{ [key: number]: Medida[] }>({});
  const [programaMedidas, setProgramaMedidas] = useState<{ [key: string]: ProgramaMedida }>({});
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  
  // Estado da interface
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingControles, setLoadingControles] = useState<Set<number>>(new Set());
  const [loadingMedidas, setLoadingMedidas] = useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log("Loading initial data for programa:", programaId);
        
        const [diagnosticosData, responsaveisData] = await Promise.all([
          dataService.fetchDiagnosticos(),
          dataService.fetchResponsaveis(programaId)
        ]);
        
        console.log("Loaded diagnosticos:", diagnosticosData);
        console.log("Loaded responsaveis:", responsaveisData);
        
        setDiagnosticos(diagnosticosData || []);
        setResponsaveis(responsaveisData || []);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [programaId]);

  // Controlar drawer baseado no tamanho da tela
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Carregar controles de um diagnóstico
  const loadControles = useCallback(async (diagnosticoId: number) => {
    if (controles[diagnosticoId]) return; // Já carregado
    
    console.log("Loading controles for diagnostico:", diagnosticoId);
    setLoadingControles(prev => new Set(prev).add(diagnosticoId));
    
    try {
      const controlesData = await dataService.fetchControles(diagnosticoId, programaId);
      console.log("Loaded controles for diagnostico", diagnosticoId, ":", controlesData);
      setControles(prev => ({ ...prev, [diagnosticoId]: controlesData || [] }));
    } catch (error) {
      console.error(`Erro ao carregar controles do diagnóstico ${diagnosticoId}:`, error);
      setControles(prev => ({ ...prev, [diagnosticoId]: [] }));
    } finally {
      setLoadingControles(prev => {
        const newSet = new Set(prev);
        newSet.delete(diagnosticoId);
        return newSet;
      });
    }
  }, [controles, programaId]);

  // Carregar medidas de um controle
  const loadMedidas = useCallback(async (controleId: number) => {
    if (medidas[controleId]) return; // Já carregado
    
    console.log("Loading medidas for controle:", controleId);
    setLoadingMedidas(prev => new Set(prev).add(controleId));
    
    try {
      const medidasData = await dataService.fetchMedidas(controleId, programaId);
      console.log("Loaded medidas for controle", controleId, ":", medidasData);
      setMedidas(prev => ({ ...prev, [controleId]: medidasData || [] }));
      
      // Carregar programa_medidas para cada medida
      const programaMedidasData: { [key: string]: ProgramaMedida } = {};
      for (const medida of medidasData || []) {
        const key = `${medida.id}-${controleId}-${programaId}`;
        try {
          const programaMedida = await dataService.fetchProgramaMedida(medida.id, controleId, programaId);
          if (programaMedida) {
            programaMedidasData[key] = programaMedida;
          }
        } catch (error) {
          console.error(`Erro ao carregar programa_medida para medida ${medida.id}:`, error);
        }
      }
      setProgramaMedidas(prev => ({ ...prev, ...programaMedidasData }));
    } catch (error) {
      console.error(`Erro ao carregar medidas do controle ${controleId}:`, error);
      setMedidas(prev => ({ ...prev, [controleId]: [] }));
    } finally {
      setLoadingMedidas(prev => {
        const newSet = new Set(prev);
        newSet.delete(controleId);
        return newSet;
      });
    }
  }, [medidas, programaId]);

  // Calcular maturidade simples
  const calculateSimpleMaturity = useCallback((diagnosticoId: number) => {
    const diagnosticoControles = controles[diagnosticoId] || [];
    if (diagnosticoControles.length === 0) return { score: 0, label: "Inicial" };

    let totalScore = 0;
    let totalMedidas = 0;

    diagnosticoControles.forEach(controle => {
      const controleMedidas = medidas[controle.id] || [];
      controleMedidas.forEach(medida => {
        const programaMedida = medida.programa_medida || programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
        if (programaMedida && programaMedida.resposta !== null && programaMedida.resposta !== undefined && typeof programaMedida.resposta === 'number') {
          totalScore += programaMedida.resposta;
          totalMedidas++;
        }
      });
    });

    const averageScore = totalMedidas > 0 ? totalScore / totalMedidas : 0;
    const normalizedScore = Math.round(averageScore);
    
    let label = "Inicial";
    if (normalizedScore >= 90) label = "Aprimorado";
    else if (normalizedScore >= 70) label = "Em Aprimoramento";
    else if (normalizedScore >= 50) label = "Intermediário";
    else if (normalizedScore >= 30) label = "Básico";
    
    return { score: normalizedScore, label };
  }, [controles, medidas, programaMedidas, programaId]);

  // Construir árvore de navegação
  const treeData = useMemo((): TreeNode[] => {
    console.log("Building tree data...");
    console.log("Diagnosticos:", diagnosticos.length);
    console.log("Controles keys:", Object.keys(controles));
    console.log("Medidas keys:", Object.keys(medidas));

    return diagnosticos.map(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      const maturityData = calculateSimpleMaturity(diagnostico.id);

      console.log(`Building tree for diagnostico ${diagnostico.id}: ${diagnosticoControles.length} controles`);

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: 'diagnostico',
        label: `${diagnostico.descricao}`,
        icon: <AssessmentIcon />,
        data: diagnostico,
        maturityScore: maturityData.score,
        maturityLabel: maturityData.label,
        expanded: expandedNodes.has(`diagnostico-${diagnostico.id}`),
        children: diagnosticoControles.map(controle => {
          const controleMedidas = medidas[controle.id] || [];
          console.log(`Building tree for controle ${controle.id}: ${controleMedidas.length} medidas`);

          return {
            id: `controle-${controle.id}`,
            type: 'controle',
            label: `${controle.numero} - ${controle.nome}`,
            icon: <SecurityIcon />,
            data: controle,
            expanded: expandedNodes.has(`controle-${controle.id}`),
            children: controleMedidas.map(medida => ({
              id: `medida-${medida.id}-${controle.id}`,
              type: 'medida',
              label: `${medida.id_medida || medida.id} - ${medida.medida}`,
              icon: <PolicyIcon />,
              data: { 
                medida, 
                controle, 
                programaMedida: programaMedidas[`${medida.id}-${controle.id}-${programaId}`] 
              },
            }))
          };
        })
      };

      console.log(`Diagnostico ${diagnostico.id} node:`, {
        id: diagnosticoNode.id,
        type: diagnosticoNode.type,
        label: diagnosticoNode.label,
        hasChildren: diagnosticoNode.children?.length || 0,
        expanded: diagnosticoNode.expanded
      });

      return diagnosticoNode;
    });
  }, [diagnosticos, controles, medidas, programaMedidas, expandedNodes, programaId, calculateSimpleMaturity]);

  // Manipular expansão de nós
  const handleNodeToggle = useCallback(async (nodeId: string, node: TreeNode) => {
    console.log("Toggling node:", nodeId, node.type, "Current expanded:", expandedNodes.has(nodeId));
    const newExpanded = new Set(expandedNodes);
    
    if (expandedNodes.has(nodeId)) {
      // Colapsando
      newExpanded.delete(nodeId);
      console.log("Collapsing node:", nodeId);
    } else {
      // Expandindo
      newExpanded.add(nodeId);
      console.log("Expanding node:", nodeId);
      
      // Carregar dados sob demanda
      if (node.type === 'diagnostico') {
        console.log("Loading controles for diagnostico:", node.data.id);
        await loadControles(node.data.id);
      } else if (node.type === 'controle') {
        console.log("Loading medidas for controle:", node.data.id);
        await loadMedidas(node.data.id);
      }
    }
    
    console.log("New expanded set:", Array.from(newExpanded));
    setExpandedNodes(newExpanded);
  }, [expandedNodes, loadControles, loadMedidas]);

  // Manipular seleção de nó
  const handleNodeSelect = useCallback((node: TreeNode) => {
    console.log("Selected node:", node.id, node.type);
    setSelectedNode(node);
    
    // Fechar drawer em telas pequenas após seleção
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // Manipular mudanças em medidas
  const handleMedidaChange = useCallback(async (
    medidaId: number, 
    controleId: number, 
    programaId: number, 
    field: string, 
    value: any
  ) => {
    try {
      console.log("Updating medida:", { medidaId, controleId, programaId, field, value });
      await dataService.updateProgramaMedida(medidaId, controleId, programaId, { [field]: value });
      
      // Atualizar estado local
      const key = `${medidaId}-${controleId}-${programaId}`;
      setProgramaMedidas(prev => ({
        ...prev,
        [key]: { ...prev[key], [field]: value }
      }));
      
      // Recarregar as medidas para atualizar os dados
      if (field === 'resposta') {
        const medidasData = await dataService.fetchMedidas(controleId, programaId);
        setMedidas(prev => ({ ...prev, [controleId]: medidasData || [] }));
      }
    } catch (error) {
      console.error("Erro ao atualizar medida:", error);
    }
  }, []);

  // Manipular mudanças no INCC
  const handleINCCChange = useCallback(async (
    programaControleId: number, 
    diagnosticoId: number, 
    value: number
  ) => {
    try {
      console.log("Updating INCC:", { programaControleId, diagnosticoId, value });
      // TODO: Implementar atualização do INCC no backend
      // await dataService.updateProgramaControle(programaControleId, { nivel: value });
      
      // Atualizar estado local
      setControles(prev => {
        const newControles = { ...prev };
        if (newControles[diagnosticoId]) {
          newControles[diagnosticoId] = newControles[diagnosticoId].map(controle => 
            controle.programa_controle_id === programaControleId 
              ? { ...controle, nivel: value }
              : controle
          );
        }
        return newControles;
      });
    } catch (error) {
      console.error("Erro ao atualizar INCC:", error);
    }
  }, []);

  // Função para buscar medidas (necessária para o ControleContainer)
  const handleMedidaFetch = useCallback(async (controleId: number, programaId: number) => {
    await loadMedidas(controleId);
  }, [loadMedidas]);

  // Renderizar item da árvore
  const renderTreeItem = useCallback((node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const isLoading = (node.type === 'diagnostico' && loadingControles.has(node.data.id)) ||
                     (node.type === 'controle' && loadingMedidas.has(node.data.id));

    // Determinar se deve mostrar botão de expansão
    const showExpandButton = node.type === 'diagnostico' || 
                           (node.type === 'controle' && (node.children && node.children.length > 0));

    console.log(`Rendering ${node.type} ${node.id}:`, {
      isExpanded,
      showExpandButton,
      hasChildren: node.children?.length || 0,
      isLoading
    });

    // Função para lidar com o clique no item
    const handleItemClick = async () => {
      // Sempre selecionar o nó
      handleNodeSelect(node);
      
      // Se pode ser expandido, expandir/contrair
      if (showExpandButton) {
        await handleNodeToggle(node.id, node);
      }
    };

    return (
      <React.Fragment key={node.id}>
        <ListItem disablePadding sx={{ pl: level * 2 }}>
          <ListItemButton
            selected={isSelected}
            onClick={handleItemClick}
            disabled={isLoading}
            sx={{
              borderRadius: 1,
              mx: 1,
              py: 1.5,
              minHeight: 60,
              width: '100%',
              '&.Mui-selected': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                }
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {node.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      flexGrow: 1, 
                      fontSize: level === 0 ? '1rem' : level === 1 ? '0.95rem' : '0.9rem',
                      fontWeight: level === 0 ? 600 : level === 1 ? 500 : 400,
                      lineHeight: 1.3,
                      wordBreak: 'break-word'
                    }}
                  >
                    {node.label}
                  </Typography>
                  {node.maturityScore !== undefined && (
                    <Chip 
                      size="small" 
                      label={`${node.maturityScore}%`}
                      color={node.maturityScore >= 80 ? 'success' : node.maturityScore >= 60 ? 'warning' : 'error'}
                      sx={{ fontSize: '0.75rem', height: 22 }}
                    />
                  )}
                </Box>
              }
              secondary={
                node.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: '0.8rem',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 0.5
                    }}
                  >
                    {node.description}
                  </Typography>
                )
              }
            />
            {/* Mostrar indicador de expansão */}
            {showExpandButton && (
              <Box 
                sx={{ 
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                }}
              >
                {isLoading ? (
                  <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                  </Box>
                ) : isExpanded ? <ExpandLess /> : <ExpandMore />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        {/* Mostrar filhos quando expandido */}
        {isExpanded && node.children && node.children.length > 0 && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map(child => renderTreeItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  }, [expandedNodes, selectedNode, loadingControles, loadingMedidas, handleNodeSelect, handleNodeToggle, theme]);

  // Renderizar conteúdo da área de trabalho
  const renderWorkArea = () => {
    if (!selectedNode) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            Selecione um item na árvore para visualizar
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            {isMobile ? 'Toque no menu para navegar pelos' : 'Clique em um'} diagnóstico, controle ou medida no menu lateral para ver os detalhes
          </Typography>
        </Box>
      );
    }

    if (selectedNode.type === 'diagnostico') {
      const diagnosticoControles = controles[selectedNode.data.id] || [];
      
      return (
        <Card>
          <CardHeader
            avatar={<AssessmentIcon color="primary" />}
            title={
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {selectedNode.data.descricao}
              </Typography>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip 
                  label={`Maturidade: ${selectedNode.maturityScore ?? 0}%`}
                  color={selectedNode.maturityScore && selectedNode.maturityScore >= 80 ? 'success' : selectedNode.maturityScore && selectedNode.maturityScore >= 60 ? 'warning' : 'error'}
                />
                <Chip label={selectedNode.maturityLabel ?? 'N/A'} variant="outlined" />
                <Chip label={`${diagnosticoControles.length} controles`} variant="outlined" size="small" />
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body1" paragraph>
              {selectedNode.data.descricao}
            </Typography>
            {diagnosticoControles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Expanda este diagnóstico na árvore lateral para carregar os controles.
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Este diagnóstico possui {diagnosticoControles.length} controles. 
                Clique em um controle na árvore lateral para visualizar suas medidas.
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    }

    if (selectedNode.type === 'controle') {
      const controle = selectedNode.data;
      const controleMedidas = medidas[controle.id] || [];
      
      // Encontrar o diagnóstico pai
      const diagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === controle.id);
      });

      if (!diagnostico) {
        return (
          <Card>
            <CardContent>
              <Typography variant="body1" color="error">
                Erro: Não foi possível encontrar o diagnóstico pai deste controle.
              </Typography>
            </CardContent>
          </Card>
        );
      }

      // Preparar estado para o ControleContainer
      const controleState = {
        medidas: { [controle.id]: controleMedidas },
        responsaveis: responsaveis
      };

      return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <ControleContainer
            controle={controle}
            diagnostico={diagnostico}
            programaId={programaId}
            state={controleState}
            handleINCCChange={handleINCCChange}
            handleMedidaFetch={handleMedidaFetch}
            handleMedidaChange={handleMedidaChange}
            responsaveis={responsaveis}
          />
        </LocalizationProvider>
      );
    }

    if (selectedNode.type === 'medida') {
      const { medida, controle, programaMedida } = selectedNode.data;
      
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <MedidaContainer
            medida={medida}
            programaMedida={programaMedida}
            controle={controle}
            programaId={programaId}
            handleMedidaChange={handleMedidaChange}
            responsaveis={responsaveis}
          />
        </LocalizationProvider>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Stack>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar com árvore de navegação */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            position: isMobile ? 'fixed' : 'relative',
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header fixo do drawer */}
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Diagnósticos
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          )}
        </Box>
        
        {/* Área de scroll independente do menu */}
        <Box sx={{ 
          overflow: 'auto', 
          flexGrow: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        }}>
          {diagnosticos.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum diagnóstico encontrado
              </Typography>
            </Box>
          ) : (
            <>
              <List>
                {treeData.map(node => renderTreeItem(node))}
              </List>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug: {diagnosticos.length} diagnósticos, {Object.keys(controles).length} controles carregados
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Expandidos: {Array.from(expandedNodes).join(', ') || 'nenhum'}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>

      {/* Área de trabalho principal */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Header fixo com breadcrumbs */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          flexShrink: 0,
        }}>
          <Container maxWidth="xl">
            <Stack spacing={2}>
              <Breadcrumbs>
                <Link 
                  color="inherit" 
                  href="/programas" 
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  Programas
                </Link>
                <Link 
                  color="inherit" 
                  href={`/programas/${programaId}`}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  {programaId}
                </Link>
                <Typography color="text.primary">Diagnóstico</Typography>
              </Breadcrumbs>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isMobile && (
                    <IconButton 
                      color="primary" 
                      onClick={() => setDrawerOpen(true)}
                      sx={{ mr: 1 }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Diagnóstico
                  </Typography>
                </Box>
                
                <Tooltip title="Voltar">
                  <Fab 
                    color="primary" 
                    size="medium"
                    onClick={() => router.back()}
                  >
                    <ArrowBackIcon />
                  </Fab>
                </Tooltip>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Conteúdo principal com scroll independente */}
        <Box sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        }}>
          <Box sx={{ p: 3 }}>
            <Container maxWidth="xl">
              {renderWorkArea()}
            </Container>
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 