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
    cacheStats,
    MATURITY_COLORS
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

  // Calcular maturidade inteligente com cache para diagnósticos
  const calculateMaturity = useCallback((diagnostico: Diagnostico) => {
    const diagnosticoControles = controles[diagnostico.id] || [];
    
    // Se não há controles carregados, carregar automaticamente
    if (diagnosticoControles.length === 0) {
      // Carregar controles assincronamente apenas se não estiver já carregando
      if (!autoLoadingControles.has(diagnostico.id) && !loadingControles.has(diagnostico.id)) {
        setAutoLoadingControles(prev => new Set(prev).add(diagnostico.id));
        
        loadControles(diagnostico.id).then(() => {
          setAutoLoadingControles(prev => {
            const newSet = new Set(prev);
            newSet.delete(diagnostico.id);
            return newSet;
          });
          invalidateCache('diagnostico', diagnostico.id);
        }).catch(error => {
          console.error(`Erro ao carregar controles para diagnóstico ${diagnostico.id}:`, error);
          setAutoLoadingControles(prev => {
            const newSet = new Set(prev);
            newSet.delete(diagnostico.id);
            return newSet;
          });
        });
      }
      
      // Por enquanto, retornar estimativa básica
      const isLoading = autoLoadingControles.has(diagnostico.id) || loadingControles.has(diagnostico.id);
      
      if (isLoading) {
        return {
          score: 0,
          label: 'Carregando...',
          rawScore: 0
        };
      } else {
        // Estimativa muito básica (inicial)
        return {
          score: 0.0,
          label: 'Inicial',
          rawScore: 0.0
        };
      }
    }
    
    // Se há controles mas poucos têm medidas carregadas, fazer estimativa baseada nos INCs
    const controlComMedidas = diagnosticoControles.filter(controle => {
      const controleMedidas = medidas[controle.id] || [];
      return controleMedidas.length > 0;
    });
    
    const percentualComMedidas = controlComMedidas.length / diagnosticoControles.length;
    
    // Se menos de 50% dos controles têm medidas carregadas, usar estimativa baseada em INCs
    if (percentualComMedidas < 0.5) {
      // Calcular maturidade estimada baseada nos níveis INCC dos controles
      const mediaINCC = diagnosticoControles.reduce((sum, controle) => {
        return sum + (controle.nivel || 1);
      }, 0) / diagnosticoControles.length;
      
      // Converter nível INCC médio para score estimado (conservador)
      const estimatedScore = Math.min(((mediaINCC - 1) * 0.15), 0.6); // Máximo 0.6 para estimativas
      
      let label = 'Inicial';
      if (estimatedScore >= 0.5) label = 'Intermediário';
      else if (estimatedScore >= 0.3) label = 'Básico';
      
      return {
        score: estimatedScore,
        label: `${label} (Estimativa)`,
        rawScore: estimatedScore
      };
    }
    
    // Caso contrário, usar cálculo real
    const maturityData = getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidas);
    
    return { 
      score: maturityData.score, // Usar valor decimal em vez de porcentagem
      label: maturityData.label,
      rawScore: maturityData.score
    };
  }, [controles, medidas, getDiagnosticoMaturity, autoLoadingControles, loadingControles, loadControles, invalidateCache]);

  // Limpar cache antigo periodicamente
  useEffect(() => {
    const interval = setInterval(clearOldCache, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, [clearOldCache]);

  // Construir árvore de navegação
  const treeData = useMemo((): TreeNode[] => {
    // Dashboard como primeiro item
    const dashboardNode: TreeNode = {
      id: 'dashboard',
      type: 'dashboard',
      label: 'Dashboard',
      description: 'Visão geral consolidada dos diagnósticos',
      icon: <DashboardIcon sx={{ color: theme.palette.primary.main }} />,
      data: { type: 'dashboard' },
    };

    const diagnosticoNodes = diagnosticos.map(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      const maturityData = calculateMaturity(diagnostico);



      // Função para determinar cor baseada no score de maturidade
      const getMaturityColor = (score: number) => {
        if (score < 0.3) return '#FF5252'; // Vermelho
        if (score < 0.5) return '#FF9800'; // Laranja
        if (score < 0.7) return '#FFC107'; // Amarelo
        if (score < 0.9) return '#4CAF50'; // Verde
        return '#2E7D32'; // Verde escuro
      };

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: 'diagnostico',
        label: `${diagnostico.descricao}`,
        icon: (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: getMaturityColor(maturityData.score),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            {diagnostico.id}
          </Box>
        ),
        data: diagnostico,
        maturityScore: maturityData.score,
        maturityLabel: maturityData.label,
        expanded: expandedNodes.has(`diagnostico-${diagnostico.id}`),
        children: diagnosticoControles.map(controle => {
          const controleMedidas = medidas[controle.id] || [];

                      // Calcular maturidade do controle para definir cor do ícone
            // Construir programaControle a partir dos dados do controle
            const programaControle = {
              id: controle.programa_controle_id || 0,
              programa: programaId,
              controle: controle.id,
              nivel: controle.nivel || 1
            };

            // Se não há medidas carregadas, carregar automaticamente para avaliação
            let controleMaturity;
            if (controleMedidas.length === 0) {
              // Carregar medidas assincronamente apenas se não estiver já carregando
              if (!autoLoadingMedidas.has(controle.id) && !loadingMedidas.has(controle.id)) {
                setAutoLoadingMedidas(prev => new Set(prev).add(controle.id));
                
                loadMedidas(controle.id).then(() => {
                  setAutoLoadingMedidas(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(controle.id);
                    return newSet;
                  });
                  invalidateCache('controle', controle.id);
                }).catch(error => {
                  console.error(`Erro ao carregar medidas para controle ${controle.id}:`, error);
                  setAutoLoadingMedidas(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(controle.id);
                    return newSet;
                  });
                });
              }
              
              // Por enquanto, usar maturidade baseada no INCC disponível
              const isLoading = autoLoadingMedidas.has(controle.id) || loadingMedidas.has(controle.id);
              
              if (isLoading) {
                controleMaturity = {
                  score: 0,
                  label: 'Carregando...',
                  color: '#9E9E9E',
                  level: 'inicial' as const
                };
              } else {
                // Estimativa básica baseada no nível INCC
                const inccLevel = controle.nivel || 1;
                const estimatedScore = (inccLevel - 1) * 0.15; // Estimativa conservadora
                const maturityLabel = estimatedScore >= 0.3 ? 'Básico' : 'Inicial';
                
                controleMaturity = {
                  score: estimatedScore,
                  label: maturityLabel,
                  color: estimatedScore >= 0.3 ? '#FF9800' : '#FF5252',
                  level: estimatedScore >= 0.3 ? 'basico' as const : 'inicial' as const
                };
              }
            } else {
              controleMaturity = getControleMaturity(controle, controleMedidas, programaControle);
            }

            return {
              id: `controle-${controle.id}`,
              type: 'controle',
              label: `${controle.numero} - ${controle.nome}`,
              icon: <SecurityIcon sx={{ color: controleMaturity.color }} />,
              data: controle,
              maturityScore: controleMaturity.score, // Usar valor decimal
              maturityLabel: controleMaturity.label,
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



      return diagnosticoNode;
    });

    return [dashboardNode, ...diagnosticoNodes];
  }, [diagnosticos, controles, medidas, programaMedidas, expandedNodes, programaId, calculateMaturity, getControleMaturity, autoLoadingMedidas, loadingMedidas, loadMedidas, invalidateCache, theme.palette.primary.main]);

  // Manipular expansão de nós
  const handleNodeToggle = useCallback(async (nodeId: string, node: TreeNode) => {
    const newExpanded = new Set(expandedNodes);
    
    if (expandedNodes.has(nodeId)) {
      // Colapsando
      newExpanded.delete(nodeId);
    } else {
      // Expandindo
      newExpanded.add(nodeId);
      
      // Carregar dados sob demanda
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
    setSelectedNode(node);
    
    // No mobile, fechar drawer para itens de último nível (medidas e dashboard)
    if (isMobile && (node.type === 'medida' || node.type === 'dashboard')) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

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
        const diagnosticoNode = treeData.find(node => node.type === 'diagnostico' && node.data.id === currentDiagnostico.id);
        allItems = diagnosticoNode?.children?.filter(child => child.type === 'controle') || [];
      }
    } else if (itemType === 'medida') {
      // Encontrar todas as medidas do controle atual
      const controleId = currentNode.data.controle?.id || currentNode.data.id;
      const diagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === controleId);
      });
      if (diagnostico) {
        const diagnosticoNode = treeData.find(node => node.type === 'diagnostico' && node.data.id === diagnostico.id);
        const controleNode = diagnosticoNode?.children?.find(child => child.type === 'controle' && child.data.id === controleId);
        allItems = controleNode?.children?.filter(child => child.type === 'medida') || [];
      }
    }
    
    const currentIndex = allItems.findIndex(item => {
      if (itemType === 'medida') {
        return item.data.medida?.id === currentNode.data.medida?.id;
      }
      return item.data.id === currentNode.data.id;
    });
    
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
    
    return { prevItem, nextItem, currentIndex: currentIndex + 1, total: allItems.length };
  }, [treeData, diagnosticos, controles]);

  const navigateToItem = useCallback((targetNode: TreeNode) => {
    setSelectedNode(targetNode);
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // Função para navegar para uma medida específica
  const handleMedidaNavigate = useCallback(async (medidaId: number, controleId: number) => {
    console.log("Navigating to medida:", medidaId, "from controle:", controleId);
    
    // Primeiro, garantir que as medidas estão carregadas
    if (!medidas[controleId]) {
      await loadMedidas(controleId);
    }
    
    // Encontrar a medida na árvore
    const medidaNode = treeData
      .flatMap(diagnostic => diagnostic.children || [])
      .flatMap(controle => controle.children || [])
      .find(medida => 
        medida.type === 'medida' && 
        medida.data.medida.id === medidaId &&
        medida.data.controle.id === controleId
      );

    if (medidaNode) {
      setSelectedNode(medidaNode);
      
      // No mobile, fechar drawer
      if (isMobile) {
        setDrawerOpen(false);
      }
    } else {
      console.error("Medida não encontrada na árvore:", medidaId, controleId);
    }
  }, [medidas, loadMedidas, treeData, isMobile]);

  // Manipular mudanças em medidas
  const handleMedidaChange = useCallback(async (
    medidaId: number, 
    controleId: number, 
    programaId: number, 
    field: string, 
    value: any
  ) => {
    try {
      await dataService.updateProgramaMedida(medidaId, controleId, programaId, { [field]: value });
      
      // Atualizar estado local
      const key = `${medidaId}-${controleId}-${programaId}`;
      setProgramaMedidas(prev => ({
        ...prev,
        [key]: { ...prev[key], [field]: value }
      }));
      
      // Sincronizar selectedNode se for uma medida atualizada (para todos os campos)
      if (selectedNode?.type === 'medida' && selectedNode.data.medida.id === medidaId) {
        setSelectedNode(prev => ({
          ...prev!,
          data: {
            ...prev!.data,
            programaMedida: { ...prev!.data.programaMedida, [field]: value }
          }
        }));
      }
      
      // Para mudanças na resposta, recarregar dados completos para sincronizar maturidade
      if (field === 'resposta') {
        // Forçar recarga completa das medidas e programaMedidas
        setMedidas(prev => {
          const newMedidas = { ...prev };
          delete newMedidas[controleId]; // Remove do cache para forçar reload
          return newMedidas;
        });
        
        // Recarregar usando loadMedidas que sincroniza tudo
        await loadMedidas(controleId);
        
        // Invalidar cache de maturidade do controle e diagnóstico afetados
        invalidateCache('controle', controleId);
        
        // Encontrar e invalidar o diagnóstico correspondente
        const diagnostico = diagnosticos.find(d => {
          const diagnosticoControles = controles[d.id] || [];
          return diagnosticoControles.some(c => c.id === controleId);
        });
        if (diagnostico) {
          invalidateCache('diagnostico', diagnostico.id);
        }
      }
      // Para outros campos (responsavel, datas, status, justificativa, etc), 
      // apenas atualizar interface - sem afetar score/maturidade
      
    } catch (error) {
      console.error("Erro ao atualizar medida:", error);
    }
  }, [invalidateCache, diagnosticos, controles, loadMedidas, selectedNode]);

  // Manipular mudanças no INCC
  const handleINCCChange = useCallback(async (
    programaControleId: number, 
    diagnosticoId: number, 
    value: number
  ) => {
    try {
      // Atualizar INCC no backend
      await dataService.updateControleNivel(programaControleId, value);
      
      let controleId: number | null = null;
      
      // Atualizar estado local
      setControles(prev => {
        const newControles = { ...prev };
        if (newControles[diagnosticoId]) {
          newControles[diagnosticoId] = newControles[diagnosticoId].map(controle => {
            if (controle.programa_controle_id === programaControleId) {
              controleId = controle.id;
              return { ...controle, nivel: value };
            }
            return controle;
          });
        }
        return newControles;
      });
      
      // Invalidar cache do controle e diagnóstico afetados
      if (controleId) {
        invalidateCache('controle', controleId);
        invalidateCache('diagnostico', diagnosticoId);
        
        // Sincronizar selectedNode se for um controle atualizado
        if (selectedNode?.type === 'controle' && selectedNode.data.id === controleId) {
          setSelectedNode(prev => ({
            ...prev!,
            data: { ...prev!.data, nivel: value }
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar INCC:", error);
      // Em caso de erro, recarregar os controles para sincronizar
      await loadControles(diagnosticoId);
    }
  }, [invalidateCache, loadControles, selectedNode]);

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

    // Calcular o padding considerando as linhas conectoras
    const paddingLeft = level * 24 + 8; // 24px por nível + 8px base

    return (
      <React.Fragment key={node.id}>
        <ListItem 
          disablePadding 
          sx={{ 
            position: 'relative',
            pl: 0,
          }}
        >
          {/* Linhas conectoras */}
          {level > 0 && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: paddingLeft,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              {/* Linhas verticais dos níveis pais */}
              {parentPath.map((hasMore, index) => (
                hasMore && (
                  <Box
                    key={`vertical-${index}`}
                    sx={{
                      position: 'absolute',
                      left: index * 24 + 20,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: alpha(theme.palette.divider, 0.4),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-0.5px',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        zIndex: -1,
                      }
                    }}
                  />
                )
              ))}
              
              {/* Linha horizontal para este item */}
              <Box
                sx={{
                  position: 'absolute',
                  left: (level - 1) * 24 + 20,
                  top: '50%',
                  width: '20px',
                  height: '1px',
                  backgroundColor: alpha(theme.palette.divider, 0.4),
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: '-2px',
                    top: '-1px',
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.6),
                  }
                }}
              />
              
              {/* Linha vertical para este item */}
              <Box
                sx={{
                  position: 'absolute',
                  left: (level - 1) * 24 + 20,
                  top: 0,
                  bottom: isLast ? '50%' : 0,
                  width: '1px',
                  backgroundColor: alpha(theme.palette.divider, 0.4),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '-0.5px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    zIndex: -1,
                  }
                }}
              />
            </Box>
          )}

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
              ml: `${paddingLeft}px`,
              position: 'relative',
              zIndex: 2,
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
                    <MaturityChip
                      score={node.maturityScore}
                      label={node.maturityLabel || ''}
                      size="small"
                      animated={true}
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
            {/* Botão de expansão/contração */}
            {showExpandButton && (
              <IconButton
                size="small"
                onClick={handleExpandClick}
                disabled={isLoading}
                sx={{ 
                  ml: 1,
                  width: 28,
                  height: 28,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                  '&.Mui-disabled': {
                    backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                  }
                }}
              >
                {isLoading ? (
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
                ) : isExpanded ? (
                  <RemoveIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                ) : (
                  <AddIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                )}
              </IconButton>
            )}
          </ListItemButton>
        </ListItem>
        {/* Mostrar filhos quando expandido */}
        {isExpanded && node.children && node.children.length > 0 && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children.map((child, index) => {
                const isLastChild = index === node.children!.length - 1;
                const newParentPath = [...parentPath, !isLast];
                return renderTreeItem(child, level + 1, isLastChild, newParentPath);
              })}
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

    if (selectedNode.type === 'dashboard') {
      // Função wrapper para calculateMaturity
      const getDiagnosticoMaturityWrapper = (diagnosticoId: number) => {
        const diagnostico = diagnosticos.find(d => d.id === diagnosticoId);
        if (!diagnostico) {
          return { score: 0, label: 'N/A' };
        }
        return calculateMaturity(diagnostico);
      };

      return (
        <Dashboard
          diagnosticos={diagnosticos}
          controles={controles}
          medidas={medidas}
          programaMedidas={programaMedidas}
          getControleMaturity={getControleMaturity}
          getDiagnosticoMaturity={getDiagnosticoMaturityWrapper}
          programaId={programaId}
        />
      );
    }

    if (selectedNode.type === 'diagnostico') {
      const diagnosticoControles = controles[selectedNode.data.id] || [];
      const { prevItem, nextItem, currentIndex, total } = findNextPrevItems(selectedNode, 'diagnostico');
      
      // Função para determinar cor baseada no score de maturidade
      const getMaturityColorForDiagnostico = (score: number) => {
        if (score < 0.3) return '#FF5252'; // Vermelho
        if (score < 0.5) return '#FF9800'; // Laranja
        if (score < 0.7) return '#FFC107'; // Amarelo
        if (score < 0.9) return '#4CAF50'; // Verde
        return '#2E7D32'; // Verde escuro
      };

      return (
        <Box>
          {/* Navegação entre diagnósticos */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={() => prevItem && navigateToItem(prevItem)}
              disabled={!prevItem}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Diagnóstico {currentIndex} de {total}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {selectedNode.data.descricao}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => nextItem && navigateToItem(nextItem)}
              disabled={!nextItem}
              color="primary"
            >
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Paper>

          <Card>
            <CardHeader
              avatar={
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: getMaturityColorForDiagnostico(selectedNode.maturityScore ?? 0),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.25rem'
                  }}
                >
                  {selectedNode.data.id}
                </Box>
              }
              title={
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {selectedNode.data.descricao}
                </Typography>
              }
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <MaturityChip
                    score={selectedNode.maturityScore ?? 0}
                    label={selectedNode.maturityLabel ?? 'N/A'}
                    size="medium"
                    showLabel={true}
                    animated={true}
                  />
                  <Chip label={`${diagnosticoControles.length} controles`} variant="outlined" size="small" />
                </Box>
              }
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                {selectedNode.data.descricao}
              </Typography>
              
              {/* Lista de Controles */}
              {diagnosticoControles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Expanda este diagnóstico na árvore lateral para carregar os controles.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    Controles deste Diagnóstico
                  </Typography>
                  <Grid container spacing={2}>
                    {diagnosticoControles.map((controle) => {
                      const controleMedidas = medidas[controle.id] || [];
                      const programaControle = {
                        id: controle.programa_controle_id || 0,
                        programa: programaId,
                        controle: controle.id,
                        nivel: controle.nivel || 1
                      };
                      const controleMaturity = getControleMaturity(controle, controleMedidas, programaControle);
                      
                      return (
                        <Grid size={{ xs: 12, md: 6 }} key={controle.id}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 3
                              }
                            }}
                            onClick={() => {
                              const controleNode = treeData
                                .find(node => node.type === 'diagnostico' && node.data.id === selectedNode.data.id)
                                ?.children?.find(child => child.type === 'controle' && child.data.id === controle.id);
                              if (controleNode) navigateToItem(controleNode);
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                <SecurityIcon sx={{ color: controleMaturity.color, mt: 0.5 }} />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    {controle.numero} - {controle.nome}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {controle.texto?.substring(0, 100)}...
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <MaturityChip
                                      score={controleMaturity.score}
                                      label={controleMaturity.label}
                                      size="small"
                                    />
                                    <Chip 
                                      label={`${controleMedidas.length} medidas`} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    if (selectedNode.type === 'controle') {
      const controle = selectedNode.data;
      const controleMedidas = medidas[controle.id] || [];
      const { prevItem, nextItem, currentIndex, total } = findNextPrevItems(selectedNode, 'controle');
      
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

      const programaControle = {
        id: controle.programa_controle_id || 0,
        programa: programaId,
        controle: controle.id,
        nivel: controle.nivel || 1
      };
      const controleMaturity = getControleMaturity(controle, controleMedidas, programaControle);

      return (
        <Box>
          {/* Navegação entre controles */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={() => prevItem && navigateToItem(prevItem)}
              disabled={!prevItem}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Controle {currentIndex} de {total} • {diagnostico.descricao}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {controle.numero} - {controle.nome}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => nextItem && navigateToItem(nextItem)}
              disabled={!nextItem}
              color="primary"
            >
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Paper>

          {/* Lista de medidas do controle */}
          {controleMedidas.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography variant="h6" color="primary" fontWeight="600">
                    Medidas deste Controle
                  </Typography>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <MaturityChip
                      score={controleMaturity.score}
                      label={controleMaturity.label}
                      size="small"
                    />
                    <Chip label={`${controleMedidas.length} medidas`} variant="outlined" size="small" />
                  </Box>
                }
              />
              <CardContent>
                                 <Grid container spacing={2}>
                   {controleMedidas.map((medida) => {
                     const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
                     
                     return (
                       <Grid size={{ xs: 12, md: 6 }} key={medida.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 3
                            }
                          }}
                          onClick={() => {
                            const medidaNode = treeData
                              .find(node => node.type === 'diagnostico' && node.data.id === diagnostico.id)
                              ?.children?.find(child => child.type === 'controle' && child.data.id === controle.id)
                              ?.children?.find(child => child.type === 'medida' && child.data.medida.id === medida.id);
                            if (medidaNode) navigateToItem(medidaNode);
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                              <PolicyIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                  {medida.id_medida || medida.id} - {medida.medida}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {medida.descricao?.substring(0, 100)}...
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  {programaMedida?.resposta && (
                                    <Chip 
                                      label={String(programaMedida.resposta) === 'S' ? 'Sim' : String(programaMedida.resposta) === 'N' ? 'Não' : 'Parcial'} 
                                      size="small"
                                      color={String(programaMedida.resposta) === 'S' ? 'success' : String(programaMedida.resposta) === 'N' ? 'error' : 'warning'}
                                    />
                                  )}
                                  {programaMedida?.status_plano_acao && (
                                    <Chip 
                                      label={programaMedida.status_plano_acao} 
                                      size="small" 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Componente original do controle */}
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
              onMedidaNavigate={handleMedidaNavigate}
            />
          </LocalizationProvider>
        </Box>
      );
    }

    if (selectedNode.type === 'medida') {
      const { medida, controle, programaMedida } = selectedNode.data;
      const { prevItem, nextItem, currentIndex, total } = findNextPrevItems(selectedNode, 'medida');
      
      // Encontrar o diagnóstico pai
      const diagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === controle.id);
      });
      
      return (
        <Box>
          {/* Navegação entre medidas */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={() => prevItem && navigateToItem(prevItem)}
              disabled={!prevItem}
              color="primary"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Medida {currentIndex} de {total} • {controle.numero} - {controle.nome}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {medida.id_medida || medida.id} - {medida.medida}
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => nextItem && navigateToItem(nextItem)}
              disabled={!nextItem}
              color="primary"
            >
              <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Paper>



          {/* Componente original da medida */}
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
        </Box>
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
                {treeData.map((node, index) => {
                  const isLastNode = index === treeData.length - 1;
                  return renderTreeItem(node, 0, isLastNode, []);
                })}
              </List>
              

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
                  {programa?.nome_fantasia || programa?.razao_social || `Programa #${programaId}`}
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