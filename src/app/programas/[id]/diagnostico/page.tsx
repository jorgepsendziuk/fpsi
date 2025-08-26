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
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import * as dataService from "../../../../lib/services/dataService";
import { Diagnostico, Controle, Medida, Responsavel, ProgramaMedida } from "../../../../lib/types/types";
import MedidaContainer from "../../../../components/diagnostico/containers/MedidaContainer";
import ControleContainer from "../../../../components/diagnostico/containers/ControleContainer";
import { useMaturityCache } from "../../../../components/diagnostico/hooks/useMaturityCache";
import MaturityChip from "../../../../components/diagnostico/MaturityChip";
import Dashboard from "../../../../components/diagnostico/Dashboard";

const DRAWER_WIDTH = 380;

interface TreeNode {
  id: string;
  type: 'dashboard' | 'diagnostico' | 'controle' | 'medida';
  label: string;
  description?: string;
  icon: React.ReactNode;
  data: any;
  children?: TreeNode[];
  expanded?: boolean;
  maturityScore?: number;
  maturityLabel?: string;
}

export default function DiagnosticoPage() {
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
  const [programa, setPrograma] = useState<any>(null);
  
  // Estado da interface
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingControles, setLoadingControles] = useState<Set<number>>(new Set());
  const [loadingMedidas, setLoadingMedidas] = useState<Set<number>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [autoLoadingMedidas, setAutoLoadingMedidas] = useState<Set<number>>(new Set());
  const [autoLoadingControles, setAutoLoadingControles] = useState<Set<number>>(new Set());

  // Hook de maturidade inteligente
  const {
    getControleMaturity,
    getDiagnosticoMaturity,
    invalidateCache,
    preloadMaturity,
    clearOldCache,
  } = useMaturityCache(programaId);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log("Loading initial data for programa:", programaId);
        
        const [diagnosticosData, responsaveisData, programaData] = await Promise.all([
          dataService.fetchDiagnosticos(),
          dataService.fetchResponsaveis(programaId),
          dataService.fetchProgramaById(programaId)
        ]);
        
        console.log("Loaded diagnosticos:", diagnosticosData);
        console.log("Loaded responsaveis:", responsaveisData);
        console.log("Loaded programa:", programaData);
        
        setDiagnosticos(diagnosticosData || []);
        setResponsaveis(responsaveisData || []);
        setPrograma(programaData);
        
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

  // Selecionar dashboard por padrão quando não há nada selecionado
  useEffect(() => {
    if (!selectedNode && !loading) {
      setSelectedNode({
        id: 'dashboard',
        type: 'dashboard',
        label: 'Dashboard',
        description: 'Visão geral consolidada dos diagnósticos',
        icon: <DashboardIcon sx={{ color: theme.palette.primary.main }} />,
        data: { type: 'dashboard' },
      });
    }
  }, [selectedNode, loading, theme.palette.primary.main]);

  // Carregar controles de um diagnóstico
  const loadControles = useCallback(async (diagnosticoId: number) => {
    if (controles[diagnosticoId] !== undefined) return; // Já carregado (mesmo que seja array vazio)
    
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
    if (medidas[controleId] !== undefined) return; // Já carregado (mesmo que seja array vazio)
    
    console.log("Loading medidas for controle:", controleId);
    setLoadingMedidas(prev => new Set(prev).add(controleId));
    
    try {
      const medidasData = await dataService.fetchMedidas(controleId, programaId);
      console.log("Loaded medidas for controle", controleId, ":", medidasData);
      setMedidas(prev => ({ ...prev, [controleId]: medidasData || [] }));
      
      // Carregar programaMedidas para estas medidas
      const programaMedidasPromises = (medidasData || []).map(async (medida) => {
        const key = `${medida.id}-${controleId}-${programaId}`;
        if (!programaMedidas[key]) {
          try {
            const programaMedida = await dataService.fetchProgramaMedida(medida.id, controleId, programaId);
            return { key, data: programaMedida };
          } catch (error) {
            console.error(`Erro ao carregar programa_medida para medida ${medida.id}:`, error);
            return null;
          }
        }
        return null;
      });
      
      const programaMedidasResults = await Promise.all(programaMedidasPromises);
      const newProgramaMedidas: { [key: string]: ProgramaMedida } = {};
      
      programaMedidasResults.forEach(result => {
        if (result && result.data) {
          newProgramaMedidas[result.key] = result.data;
        }
      });
      
      if (Object.keys(newProgramaMedidas).length > 0) {
        setProgramaMedidas(prev => ({ ...prev, ...newProgramaMedidas }));
      }
      
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
  }, [medidas, programaMedidas, programaId]);

  // Carregar dados automaticamente para o dashboard quando necessário
  useEffect(() => {
    const loadDataForDashboard = async () => {
      // Só carregar se dashboard estiver selecionado e não estivermos carregando dados iniciais
      if (selectedNode?.type === 'dashboard' && !loading) {
        console.log("🎯 Dashboard selecionado: iniciando carregamento otimizado de dados");
        
        // Carregar controles apenas para os primeiros 3 diagnósticos inicialmente
        const diagnosticosParaCarregar = diagnosticos.slice(0, 3);
        
        for (const diagnostico of diagnosticosParaCarregar) {
          if (!controles[diagnostico.id] && !loadingControles.has(diagnostico.id)) {
            try {
              await loadControles(diagnostico.id);
            } catch (error) {
              console.error(`Erro ao carregar controles do diagnóstico ${diagnostico.id}:`, error);
            }
          }
        }
        
        // Após carregar controles, carregar medidas e programaMedidas para cálculos precisos
        console.log("🎯 Dashboard: Iniciando carregamento de medidas para cálculos");
        // Chamar loadMedidasForDashboard separadamente para evitar dependência circular
      }
    };

    // Usar setTimeout para evitar execução imediata e permitir que o estado se estabilize
    const timer = setTimeout(loadDataForDashboard, 100);
    return () => clearTimeout(timer);
  }, [diagnosticos, loading, selectedNode?.type, controles, loadControles, loadingControles]);

  // Função para carregar dados completos para dashboard de forma otimizada
  const loadMedidasForDashboard = useCallback(async () => {
    console.log("📊 Dashboard: Carregando dados completos de forma otimizada");
    
    try {
      // 1. Carregar todos os programaMedidas de uma vez (mais eficiente)
      console.log("📊 Dashboard: Carregando todos os programaMedidas...");
      const allProgramaMedidas = await dataService.fetchAllProgramaMedidas(programaId);
      setProgramaMedidas(prev => ({ ...prev, ...allProgramaMedidas }));
      console.log(`✅ Dashboard: Carregados ${Object.keys(allProgramaMedidas).length} programaMedidas`);
      
      // 2. Carregar medidas apenas para controles que ainda não têm dados
      for (const diagnostico of diagnosticos) {
        const diagnosticoControles = controles[diagnostico.id] || [];
        
        for (const controle of diagnosticoControles) {
          // Carregar medidas apenas se não estão carregadas e não estão sendo carregadas
          if (!medidas[controle.id] && !loadingMedidas.has(controle.id)) {
            try {
              console.log(`📊 Dashboard: Carregando medidas para controle ${controle.id}`);
              await loadMedidas(controle.id);
            } catch (error) {
              console.error(`Erro ao carregar medidas do controle ${controle.id}:`, error);
            }
          }
        }
      }
      
      console.log("✅ Dashboard: Carregamento de dados completo concluído");
      
    } catch (error) {
      console.error("❌ Erro no carregamento otimizado para dashboard:", error);
    }
  }, [diagnosticos, controles, medidas, loadingMedidas, loadMedidas, programaId]);

  // Trigger do carregamento de medidas para dashboard
  useEffect(() => {
    if (selectedNode?.type === 'dashboard' && !loading && Object.keys(controles).length > 0) {
      const timer = setTimeout(() => {
        loadMedidasForDashboard();
      }, 500); // Pequeno delay para evitar execução excessiva
      
      return () => clearTimeout(timer);
    }
  }, [selectedNode?.type, loading, controles, loadMedidasForDashboard]);

  // Manipular expansão de nós
  const handleNodeToggle = useCallback(async (nodeId: string, node: TreeNode) => {
    const newExpanded = new Set(expandedNodes);
    
    if (expandedNodes.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      
      // Carregar dados necessários quando expandir
      if (node.type === 'diagnostico') {
        await loadControles(node.data.id);
      } else if (node.type === 'controle') {
        await loadMedidas(node.data.id);
      }
    }
    
    setExpandedNodes(newExpanded);
  }, [expandedNodes, loadControles, loadMedidas]);

  // Manipular seleção de nó
  const handleNodeSelect = useCallback(async (node: TreeNode) => {
    console.log('handleNodeSelect - Selecionando nó:', node.type, node.id);
    if (node.type === 'controle') {
      console.log('handleNodeSelect - Dados do controle:', node.data);
      console.log('handleNodeSelect - Maturidade do nó:', node.maturityScore, node.maturityLabel);
    }
    
    setSelectedNode(node);
    
    // No mobile, fechar drawer apenas quando selecionar medida
    if (isMobile && node.type === 'medida') {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // Construir árvore de navegação
  const treeData = useMemo((): TreeNode[] => {
    if (loading) return [];

    const tree: TreeNode[] = [
      {
        id: 'dashboard',
        type: 'dashboard',
        label: 'Dashboard',
        description: 'Visão geral consolidada dos diagnósticos',
        icon: <DashboardIcon sx={{ color: theme.palette.primary.main }} />,
        data: { type: 'dashboard' },
      }
    ];

    diagnosticos.forEach(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      const diagnosticoMaturity = getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidas);

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: 'diagnostico',
        label: diagnostico.descricao,
        description: `Diagnóstico ${diagnostico.id}`,
        icon: <AssessmentIcon sx={{ color: diagnosticoMaturity.color }} />,
        data: diagnostico,
        maturityScore: diagnosticoMaturity.score,
        maturityLabel: diagnosticoMaturity.label,
        children: []
      };

      diagnosticoControles.forEach(controle => {
        const controleMedidas = medidas[controle.id] || [];
        const controleMaturity = getControleMaturity(controle, controleMedidas, controle, programaMedidas);

        const controleNode: TreeNode = {
          id: `controle-${controle.id}`,
          type: 'controle',
          label: `${controle.numero} - ${controle.nome}`,
          description: `Controle ${controle.numero}`,
          icon: <SecurityIcon sx={{ color: controleMaturity.color }} />,
          data: controle,
          maturityScore: controleMaturity.score,
          maturityLabel: controleMaturity.label,
          children: []
        };

        controleMedidas.forEach(medida => {
          const medidaNode: TreeNode = {
            id: `medida-${medida.id}`,
            type: 'medida',
            label: `${medida.id_medida} - ${medida.medida?.substring(0, 50)}...`,
            description: `Medida ${medida.id_medida}`,
            icon: <PolicyIcon sx={{ color: theme.palette.text.secondary }} />,
            data: medida
          };

          controleNode.children!.push(medidaNode);
        });

        diagnosticoNode.children!.push(controleNode);
      });

      tree.push(diagnosticoNode);
    });

    return tree;
  }, [
    loading,
    diagnosticos,
    controles,
    medidas,
    programaMedidas,
    theme,
    getDiagnosticoMaturity,
    getControleMaturity
  ]);

  // Funções de navegação
  const findNextPrevItems = useCallback((currentNode: TreeNode, itemType: 'diagnostico' | 'controle' | 'medida') => {
    let allItems: TreeNode[] = [];
    
    if (itemType === 'diagnostico') {
      allItems = treeData.filter(node => node.type === 'diagnostico');
    } else if (itemType === 'controle') {
      // Encontrar todos os controles do diagnóstico atual
      const currentDiagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === currentNode.data.id);
      });
      if (currentDiagnostico) {
        const diagnosticoControles = controles[currentDiagnostico.id] || [];
        allItems = diagnosticoControles.map(controle => ({
          id: `controle-${controle.id}`,
          type: 'controle' as const,
          label: `${controle.numero} - ${controle.nome}`,
          icon: <SecurityIcon />,
          data: controle,
        }));
      }
    } else if (itemType === 'medida') {
      // Encontrar todas as medidas do controle atual
      const controleMedidas = medidas[currentNode.data.id_controle] || [];
      allItems = controleMedidas.map(medida => ({
        id: `medida-${medida.id}`,
        type: 'medida' as const,
        label: `${medida.id_medida} - ${medida.medida?.substring(0, 50)}...`,
        icon: <PolicyIcon />,
        data: medida,
      }));
    }

    const currentIndex = allItems.findIndex(item => item.id === currentNode.id);
    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;

    return { nextItem, prevItem };
  }, [treeData, diagnosticos, controles, medidas]);

  // Função para lidar com mudanças nas medidas (callback para MedidaContainer)
  const handleMedidaChange = useCallback(async (
    medidaId: number, 
    controleId: number, 
    programaId: number, 
    field: string, 
    value: any
  ) => {
    console.log(`handleMedidaChange: medida ${medidaId}, controle ${controleId}, field ${field}, value ${value}`);
    
    try {
      await dataService.updateProgramaMedida(medidaId, controleId, programaId, { [field]: value });
      
      // Invalidar cache de maturidade
      invalidateCache('controle', controleId);
      
      // Atualizar programaMedidas local
      const key = `${medidaId}-${controleId}-${programaId}`;
      setProgramaMedidas(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value
        }
      }));

      // Sincronizar selectedNode se for o controle atual
      if (selectedNode?.type === 'controle' && selectedNode.data.id === controleId) {
        // Recarregar dados do controle para refletir mudanças
        const diagnosticoId = selectedNode.data.diagnostico;
        await loadControles(diagnosticoId);
      }
    } catch (error) {
      console.error('Erro ao atualizar medida:', error);
    }
  }, [invalidateCache, loadControles, selectedNode, programaId]);

  // Função para buscar medidas (necessária para o ControleContainer)
  const handleMedidaFetch = useCallback(async (controleId: number, programaId: number) => {
    await loadMedidas(controleId);
  }, [loadMedidas]);

  // Renderizar item da árvore com linhas conectoras
  const renderTreeItem = useCallback((node: TreeNode, level: number = 0, isLast: boolean = false, parentPath: boolean[] = []) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const isLoading = (node.type === 'diagnostico' && loadingControles.has(node.data.id)) ||
                     (node.type === 'controle' && loadingMedidas.has(node.data.id));

    // Determinar se deve mostrar botão de expansão
    const showExpandButton = node.type === 'diagnostico' || node.type === 'controle';

    // Função para lidar com o clique no item (apenas seleção)
    const handleItemClick = async () => {
      // Apenas selecionar o nó, sem expandir
      await handleNodeSelect(node);
    };

    // Função para lidar com o clique no botão de expansão
    const handleExpandClick = async (event: React.MouseEvent) => {
      // Prevenir que o clique propague para o item pai
      event.stopPropagation();
      
      // Expandir/contrair
      await handleNodeToggle(node.id, node);
    };

    return (
      <Box key={node.id}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isSelected}
            onClick={handleItemClick}
            sx={{
              pl: 2 + level * 2,
              minHeight: 48,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16),
                },
              },
            }}
          >
            {showExpandButton && (
              <IconButton
                size="small"
                onClick={handleExpandClick}
                sx={{ mr: 1 }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: '2px solid',
                        borderColor: `${theme.palette.primary.main} transparent ${theme.palette.primary.main} transparent`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' },
                        },
                      }}
                    />
                  </Box>
                ) : isExpanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </IconButton>
            )}
            
            <ListItemIcon sx={{ minWidth: 36 }}>
              {node.icon}
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 400,
                      fontSize: '0.875rem',
                      flex: 1,
                      wordBreak: 'break-word'
                    }}
                  >
                    {node.label}
                  </Typography>
                  {node.maturityScore !== undefined && (
                    <MaturityChip
                      score={node.maturityScore}
                      label={node.maturityLabel || ''}
                      size="small"
                      animated={false}
                    />
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
        
        {showExpandButton && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children?.map((child, index) => 
                renderTreeItem(child, level + 1, index === (node.children?.length || 0) - 1, [...parentPath, !isLast])
              )}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }, [
    expandedNodes,
    selectedNode,
    loadingControles,
    loadingMedidas,
    theme,
    handleNodeSelect,
    handleNodeToggle
  ]);

  // Conteúdo da área principal
  const renderMainContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      );
    }

    if (!selectedNode) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Selecione um item na navegação
          </Typography>
        </Box>
      );
    }

    if (selectedNode.type === 'dashboard') {
      return (
        <Dashboard
          diagnosticos={diagnosticos}
          controles={controles}
          medidas={medidas}
          programaMedidas={programaMedidas}
          getControleMaturity={getControleMaturity}
          getDiagnosticoMaturity={(id) => {
            const diagnostico = diagnosticos.find(d => d.id === id);
            if (!diagnostico) return { score: 0, label: 'Sem dados', color: '#9E9E9E', level: 'inicial' as const };
            const diagnosticoControles = controles[id] || [];
            return getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidas);
          }}
          programaId={programaId}
        />
      );
    }

    if (selectedNode.type === 'medida') {
      const medida = selectedNode.data as Medida;
      const controle = diagnosticos
        .flatMap(d => controles[d.id] || [])
        .find(c => c.id === medida.id_controle);

      if (!controle) {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="error">
              Controle não encontrado para esta medida
            </Typography>
          </Box>
        );
      }

      const { nextItem, prevItem } = findNextPrevItems(selectedNode, 'medida');

      const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];

      return (
        <MedidaContainer
          medida={medida}
          programaMedida={programaMedida}
          controle={controle}
          programaId={programaId}
          handleMedidaChange={handleMedidaChange}
          responsaveis={responsaveis}
        />
      );
    }

    if (selectedNode.type === 'controle') {
      const controle = selectedNode.data as Controle;
      const controleMedidas = medidas[controle.id] || [];
      
      // Encontrar o diagnóstico pai
      const diagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === controle.id);
      });

      if (!diagnostico) {
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="error">
              Diagnóstico não encontrado para este controle
            </Typography>
          </Box>
        );
      }

      // Preparar estado para o ControleContainer
      const controleState = {
        medidas: { [controle.id]: controleMedidas },
        responsaveis: responsaveis
      };

      // Função para lidar com mudança de INCC
      const handleINCCChange = async (controleId: number, novoNivel: number) => {
        try {
          const programaControleId = controle.programa_controle_id;
          if (programaControleId) {
            await dataService.updateControleNivel(programaControleId, novoNivel);
            
            // Invalidar cache e recarregar dados
            invalidateCache('controle', controleId);
            await loadControles(diagnostico.id);
          }
        } catch (error) {
          console.error('Erro ao atualizar INCC:', error);
        }
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

    return (
      <Card sx={{ m: 3 }}>
        <CardHeader
          title={selectedNode.label}
          subheader={selectedNode.description}
        />
        <CardContent>
          <Typography variant="body1">
            Conteúdo para {selectedNode.type} será implementado aqui.
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Container maxWidth={false} disableGutters>
        {/* Header */}
        <Paper elevation={1} sx={{ borderRadius: 0, mb: 0 }}>
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IconButton onClick={() => router.back()} color="primary">
                <ArrowBackIcon />
              </IconButton>
              
              <Box sx={{ flex: 1 }}>
                <Breadcrumbs>
                  <Link underline="hover" color="inherit" href="/programas">
                    Programas
                  </Link>
                  <Link underline="hover" color="inherit" href={`/programas/${programaId}`}>
                    {programa?.nome || `Programa ${programaId}`}
                  </Link>
                  <Typography color="text.primary">Diagnósticos</Typography>
                </Breadcrumbs>
              </Box>

              {isMobile && (
                <IconButton
                  color="primary"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>

            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Diagnósticos de Maturidade
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Avaliação da maturidade organizacional em segurança da informação e privacidade
            </Typography>
          </Box>
        </Paper>

        {/* Layout principal */}
        <Box sx={{ display: 'flex', height: 'calc(100vh - 140px)' }}>
          {/* Drawer de navegação */}
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                position: 'relative',
                height: '100%',
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            {/* Header do drawer */}
            <Box sx={{ 
              p: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Navegação
              </Typography>
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
                  <ChevronLeftIcon />
                </IconButton>
              )}
            </Box>

            {/* Lista de navegação */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                  ))}
                </Box>
              ) : (
                <List sx={{ py: 1 }}>
                  {treeData.map(node => renderTreeItem(node))}
                </List>
              )}
            </Box>
          </Drawer>

          {/* Conteúdo principal */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            backgroundColor: theme.palette.background.default
          }}>
            {renderMainContent()}
          </Box>
        </Box>

        {/* FAB para mobile */}
        {isMobile && !drawerOpen && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: theme.zIndex.speedDial,
            }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </Fab>
        )}
      </Container>
    </LocalizationProvider>
  );
}