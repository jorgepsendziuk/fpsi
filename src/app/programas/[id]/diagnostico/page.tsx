"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
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
  LinearProgress,
  Alert,
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
  // Ícones específicos para diagnósticos
  AccountBalance as AccountBalanceIcon, // Estrutura/Governança
  Lock as LockIcon, // Segurança
  Person as PersonIcon, // Privacidade
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import * as dataService from "../../../../lib/services/dataService";
import { useProgramaIdFromParam } from "../../../../hooks/useProgramaIdFromParam";
import { LastUpdateInfo } from "@/components/common/LastUpdateInfo";
import { useLastActivity } from "@/hooks/useLastActivity";
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
  const idOrSlug = params.id as string;
  const { programaId: resolvedProgramaId, loading: resolvingId } = useProgramaIdFromParam(idOrSlug);
  const programaId = resolvedProgramaId ?? 0;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { lastActivity } = useLastActivity(programaId || undefined, undefined, undefined);

  // Estado principal
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [controles, setControles] = useState<{ [key: number]: Controle[] }>({});
  const [medidas, setMedidas] = useState<{ [key: number]: Medida[] }>({});
  /** Estrutura (id, id_controle) por controle para cálculos do dashboard; não substitui medidas completas. */
  const [medidasStructure, setMedidasStructure] = useState<{ [key: number]: dataService.MedidaStructureItem[] }>({});
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
  const [showLoadedFeedback, setShowLoadedFeedback] = useState(false);
  const wasLoadingRef = useRef(false);
  const loadMedidasForDashboardRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // Carregamento em segundo plano (controles, medidas, índices) — não bloqueia a tela
  const isBackgroundLoading = loading || loadingControles.size > 0 || loadingMedidas.size > 0;

  // Ao terminar todo o carregamento, mostrar "Carregado" por alguns segundos
  useEffect(() => {
    if (wasLoadingRef.current && !isBackgroundLoading) {
      setShowLoadedFeedback(true);
      const t = setTimeout(() => setShowLoadedFeedback(false), 2500);
      return () => clearTimeout(t);
    }
    wasLoadingRef.current = isBackgroundLoading;
  }, [isBackgroundLoading]);

  // Hook de maturidade inteligente
  const {
    getControleMaturity,
    getDiagnosticoMaturity,
    invalidateCache,
    preloadMaturity,
    clearOldCache,
  } = useMaturityCache(programaId, programaMedidas);

  // Carregar dados iniciais (só quando programaId já foi resolvido a partir do slug/id)
  useEffect(() => {
    if (!programaId) return;
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [diagnosticosData, responsaveisData, programaData] = await Promise.all([
          dataService.fetchDiagnosticos(),
          dataService.fetchResponsaveis(programaId),
          dataService.fetchProgramaById(programaId),
        ]);
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
        label: 'Visão Geral',
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

  // Carregar medidas de um controle (completas: texto, programa_medida, etc.)
  // Só considera "já carregado" quando tem dados completos; estrutura só (id, id_controle) do dashboard não bloqueia.
  const loadMedidas = useCallback(async (controleId: number) => {
    const existing = medidas[controleId];
    const hasFullData = existing?.length && typeof (existing[0] as any)?.medida === 'string';
    if (hasFullData) return;

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

  // Carrega só o necessário para o dashboard: programaMedidas (resposta) + estrutura de medidas (id, id_controle).
  // Medidas completas (texto, etc.) são carregadas sob demanda ao expandir um controle.
  const loadMedidasForDashboard = useCallback(async () => {
    try {
      const controleIds = diagnosticos.flatMap(d => (controles[d.id] || []).map((c: any) => c.id));
      if (controleIds.length === 0) return;

      const [allProgramaMedidas, structure] = await Promise.all([
        dataService.fetchAllProgramaMedidas(programaId),
        dataService.fetchMedidasStructure(controleIds),
      ]);

      setProgramaMedidas(prev => ({ ...prev, ...allProgramaMedidas }));
      setMedidasStructure(prev => ({ ...prev, ...structure }));
    } catch (error) {
      console.error("❌ Erro no carregamento do dashboard:", error);
    }
  }, [diagnosticos, controles, programaId]);

  loadMedidasForDashboardRef.current = loadMedidasForDashboard;

  // Trigger do carregamento de medidas para dashboard. Usa ref para não depender de
  // loadMedidasForDashboard (evita loop quando medidas/programaMedidas atualizam).
  // Reexecuta quando controles aumentam; o último timeout (após controles estáveis) dispara o load.
  useEffect(() => {
    if (
      selectedNode?.type === 'dashboard' &&
      !loading &&
      Object.keys(controles).length > 0
    ) {
      const timer = setTimeout(() => {
        loadMedidasForDashboardRef.current?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedNode?.type, loading, controles]);

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

  // Manipular seleção de nó (expande os pais para que o item fique visível no menu)
  const handleNodeSelect = useCallback(async (node: TreeNode) => {
    setSelectedNode(node);

    // Expandir nós pais para que a seleção fique visível na árvore
    const parentIds: string[] = [];
    if (node.type === "medida" && node.data?.controle) {
      parentIds.push(`diagnostico-${node.data.controle.diagnostico}`, `controle-${node.data.controle.id}`);
    } else if (node.type === "controle" && node.data?.diagnostico != null) {
      parentIds.push(`diagnostico-${node.data.diagnostico}`);
    }
    if (parentIds.length > 0) {
      setExpandedNodes((prev) => new Set([...Array.from(prev), ...parentIds]));
    }

    if (isMobile && node.type === "medida") {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  // Para maturidade/dashboard: usar medidas completas quando existirem, senão estrutura (id, id_controle).
  const medidasParaCalculo = useMemo(() => {
    const out: { [key: number]: Array<Medida | dataService.MedidaStructureItem> } = {};
    const allIds = new Set([...Object.keys(medidas).map(Number), ...Object.keys(medidasStructure).map(Number)]);
    allIds.forEach((id) => {
      const full = medidas[id];
      const hasFull = full?.length && typeof (full[0] as any)?.medida === 'string';
      out[id] = hasFull ? full : (medidasStructure[id] || []);
    });
    return out;
  }, [medidas, medidasStructure]);

  // Construir árvore de navegação
  const treeData = useMemo((): TreeNode[] => {
    if (loading) return [];

    const tree: TreeNode[] = [
      {
      id: 'dashboard',
      type: 'dashboard',
      label: 'Visão Geral',
      description: 'Visão geral consolidada dos diagnósticos',
      icon: <DashboardIcon sx={{ color: theme.palette.primary.main }} />,
      data: { type: 'dashboard' },
      }
    ];

    diagnosticos.forEach(diagnostico => {
      const diagnosticoControles = controles[diagnostico.id] || [];
      const diagnosticoMaturity = getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidasParaCalculo as { [key: number]: Medida[] });

      // Escolher ícone específico baseado no diagnóstico
      const getDiagnosticoIcon = (diagnosticoId: number) => {
        switch (diagnosticoId) {
          case 1: // Estrutura Básica de Gestão
            return <AccountBalanceIcon sx={{ color: diagnosticoMaturity.color }} />;
          case 2: // Segurança da Informação
            return <LockIcon sx={{ color: diagnosticoMaturity.color }} />;
          case 3: // Privacidade
            return <PersonIcon sx={{ color: diagnosticoMaturity.color }} />;
          default:
            return <AssessmentIcon sx={{ color: diagnosticoMaturity.color }} />;
        }
      };

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: 'diagnostico',
        label: diagnostico.descricao,
        description: `Diagnóstico ${diagnostico.id}`,
        icon: getDiagnosticoIcon(diagnostico.id),
        data: diagnostico,
        maturityScore: diagnosticoMaturity.score,
        maturityLabel: diagnosticoMaturity.label,
        children: []
      };

            diagnosticoControles.forEach(controle => {
        const medidasControle = medidasParaCalculo[controle.id] || [];
        const controleMedidas = medidas[controle.id] || [];
        const controleMaturity = getControleMaturity(controle, medidasControle as Medida[], controle, programaMedidas);

        const controleNode: TreeNode = {
              id: `controle-${controle.id}`,
              type: 'controle',
              label: `${controle.numero} - ${controle.nome}`,
          description: `Controle ${controle.numero}`,
              icon: <SecurityIcon sx={{ color: controleMaturity.color }} />,
          data: { 
            ...controle,
            calculationData: controleMaturity.calculationData
          },
          maturityScore: controleMaturity.score,
              maturityLabel: controleMaturity.label,
          children: []
        };

                controleMedidas.forEach(medida => {
              // Só mostrar nó de medida na árvore quando tiver dados completos (carregados ao expandir)
              const hasFullMedida = typeof (medida as any).medida === 'string';
              if (!hasFullMedida) return;

              const programaMedida = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
              const getMedidaColor = () => {
                if (!programaMedida?.resposta) return '#9E9E9E';
                const respostaNum = typeof programaMedida.resposta === 'string'
                  ? parseInt(programaMedida.resposta, 10) : programaMedida.resposta;
                if (isNaN(respostaNum)) return '#9E9E9E';
                if (controle.diagnostico === 1) {
                  return respostaNum === 1 ? '#4CAF50' : respostaNum === 2 ? '#FF5252' : '#9E9E9E';
                }
                switch (respostaNum) {
                  case 1: return '#4CAF50';
                  case 2: return '#8BC34A';
                  case 3: return '#FFC107';
                  case 4: return '#FF9800';
                  case 5: return '#FF5252';
                  case 6: return '#9E9E9E';
                  default: return '#9E9E9E';
                }
              };

              const medidaNode: TreeNode = {
                id: `medida-${medida.id}`,
                type: 'medida',
                label: `${medida.id_medida} - ${(medida as any).medida?.substring(0, 50)}...`,
                description: `Medida ${(medida as any).id_medida}`,
                icon: <PolicyIcon sx={{ color: getMedidaColor() }} />,
                data: { medida, controle, programaMedida },
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
    medidasParaCalculo,
    programaMedidas,
    programaId,
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
      const controle = currentNode.data.controle;
      const controleMedidas = medidas[controle.id] || [];
      allItems = controleMedidas.map(medida => ({
        id: `medida-${medida.id}`,
        type: 'medida' as const,
        label: `${medida.id_medida} - ${medida.medida?.substring(0, 50)}...`,
        icon: <PolicyIcon />,
        data: { medida, controle, programaMedida: programaMedidas[`${medida.id}-${controle.id}-${programaId}`] },
      }));
    }

    const currentIndex = allItems.findIndex(item => item.id === currentNode.id);
    const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;
    const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;

    return { 
      nextItem, 
      prevItem, 
      currentIndex: currentIndex + 1, // 1-based index for display
      total: allItems.length 
    };
  }, [treeData, diagnosticos, controles, medidas, programaMedidas, programaId]);

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
      setProgramaMedidas(prev => {
        const newProgramaMedidas = {
        ...prev,
          [key]: {
            ...prev[key],
            [field]: value
          }
        };
        
        // Atualizar selectedNode se for uma medida
      if (selectedNode?.type === 'medida' && selectedNode.data.medida.id === medidaId) {
          setSelectedNode(prevNode => ({
            ...prevNode!,
          data: {
              ...prevNode!.data,
              programaMedida: newProgramaMedidas[key]
          }
        }));
      }
      
        return newProgramaMedidas;
      });

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
              py: node.type === 'dashboard' ? 2 : 1.5,
              minHeight: node.type === 'dashboard' ? 70 : 60,
              width: '100%',
              ml: `${paddingLeft}px`,
              ...(node.type === 'dashboard' && {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.12)} 100%)`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
              }),
              '&.Mui-selected': {
                backgroundColor: node.type === 'dashboard' 
                  ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.secondary.main, 0.16)} 100%)`
                  : alpha(theme.palette.primary.main, 0.12),
              '&:hover': {
                  backgroundColor: node.type === 'dashboard' 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`
                    : alpha(theme.palette.primary.main, 0.16),
                },
              },
            }}
          >
            {/* Ícone circular de expand/collapse */}
            {showExpandButton && (
              <IconButton
                size="small"
                onClick={handleExpandClick}
                disabled={isLoading}
                sx={{ 
                  mr: 1.5,
                  width: 24,
                  height: 24,
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: '50%',
                  backgroundColor: isExpanded ? theme.palette.primary.main : 'transparent',
                  color: isExpanded ? 'white' : theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: isExpanded ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
                  },
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
                  <RemoveIcon sx={{ fontSize: 16, color: 'inherit' }} />
                ) : (
                  <AddIcon sx={{ fontSize: 16, color: 'inherit' }} />
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
                      fontWeight: node.type === 'dashboard' ? 700 : (isSelected ? 600 : 400),
                      fontSize: node.type === 'dashboard' ? '1rem' : '0.875rem',
                      flex: 1,
                      wordBreak: 'break-word',
                      ...(node.type === 'dashboard' && {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }),
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
                      calculationData={node.data?.calculationData}
                      controleId={node.type === 'controle' ? node.data.id : undefined}
                      controleNome={node.type === 'controle' ? node.data.nome : undefined}
                    />
                  )}
                </Box>
              }
            />
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
    if (loading || resolvingId) {
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
          medidas={medidasParaCalculo as { [key: number]: Medida[] }}
          programaMedidas={programaMedidas}
          getControleMaturity={getControleMaturity}
          getDiagnosticoMaturity={(id) => {
            const diagnostico = diagnosticos.find(d => d.id === id);
            if (!diagnostico) return { score: 0, label: 'Sem dados', color: '#9E9E9E', level: 'inicial' as const };
            const diagnosticoControles = controles[id] || [];
            return getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidasParaCalculo as { [key: number]: Medida[] });
          }}
          programaId={programaId}
          onDiagnosticoClick={(diagnosticoId) => {
            // Encontrar o nó do diagnóstico no treeData
            const diagnosticoNode = treeData.find(node => 
              node.type === 'diagnostico' && node.data.id === diagnosticoId
            );
            if (diagnosticoNode) {
              handleNodeSelect(diagnosticoNode);
            }
          }}
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

      // Função para navegar para um item
      const navigateToItem = (item: any) => {
        const itemNode = treeData.find(node => node.id === item.id);
        if (itemNode) handleNodeSelect(itemNode);
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
                    calculationData={selectedNode.data?.calculationData}
                    controleId={selectedNode.data?.id}
                    controleNome={selectedNode.data?.nome}
                  />
                  <Chip label={`${diagnosticoControles.length} controles`} variant="outlined" size="small" />
                </Box>
              }
            />
            <CardContent>
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
                      const controleMedidas = medidasParaCalculo[controle.id] || [];
                      const programaControle = {
                        id: controle.programa_controle_id || 0,
                        programa: programaId,
                        controle: controle.id,
                        nivel: controle.nivel || 1
                      };
                      const controleMaturity = getControleMaturity(controle, controleMedidas as Medida[], programaControle, programaMedidas);
                      
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
                              if (controleNode) handleNodeSelect(controleNode);
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
                                      calculationData={controleMaturity.calculationData}
                                      controleId={controle.id}
                                      controleNome={controle.nome}
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

        if (selectedNode.type === 'medida') {
      const { medida, controle, programaMedida } = selectedNode.data;
      const { prevItem, nextItem, currentIndex, total } = findNextPrevItems(selectedNode, 'medida');
      
      // Encontrar o diagnóstico pai
      const diagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === controle.id);
      });

      // Função para navegar para um item
      const navigateToItem = (item: any) => {
        const medidaNode = treeData
          .flatMap(d => d.children || [])
          .flatMap(c => c.children || [])
          .find(m => m.data.medida.id === item.data.medida.id);
        if (medidaNode) handleNodeSelect(medidaNode);
      };

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
            
            // Atualizar estado local imediatamente
            setControles(prev => {
              const newControles = { ...prev };
              if (newControles[diagnostico.id]) {
                newControles[diagnostico.id] = newControles[diagnostico.id].map(c => 
                  c.id === controleId ? { ...c, nivel: novoNivel } : c
                );
              }
              return newControles;
            });
            
            // Atualizar selectedNode se for o controle atual
            if (selectedNode?.type === 'controle' && selectedNode.data.id === controleId) {
              setSelectedNode(prev => ({
                ...prev!,
                data: { ...prev!.data, nivel: novoNivel }
              }));
            }
            
            // Invalidar cache e recarregar dados
            invalidateCache('controle', controleId);
            invalidateCache('diagnostico', diagnostico.id);
          }
        } catch (error) {
          console.error('Erro ao atualizar INCC:', error);
        }
      };

      // Função para navegar para uma medida
      const handleMedidaNavigate = (medidaId: number, controleId: number) => {
        const medidaNode = treeData
          .flatMap(d => d.children || [])
          .flatMap(c => c.children || [])
          .find(m => m.data.medida.id === medidaId && m.data.controle.id === controleId);
        if (medidaNode) {
          handleNodeSelect(medidaNode);
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
              onMedidaNavigate={handleMedidaNavigate}
              programaMedidas={programaMedidas}
              getControleMaturity={getControleMaturity}
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

  if (!resolvingId && !programaId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Programa não encontrado.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/dashboard")}>
          Voltar ao dashboard
        </Button>
      </Container>
    );
  }

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
                  <Link underline="hover" color="inherit" href="/dashboard">
                    Programas
                  </Link>
                  <Link underline="hover" color="inherit" href={`/programas/${idOrSlug}`}>
                    {programa?.nome || programa?.nome_fantasia || programa?.razao_social || `Programa ${programaId}`}
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

            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Diagnóstico
            </Typography>
            <LastUpdateInfo
              updatedAt={lastActivity?.created_at}
              userName={lastActivity?.user_name}
              compact
            />
        </Box>
        </Paper>

        {/* Indicador de carregamento em segundo plano — não bloqueia uso */}
        {(isBackgroundLoading || showLoadedFeedback) && (
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: 0,
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: showLoadedFeedback
                ? alpha(theme.palette.success.main, 0.08)
                : alpha(theme.palette.primary.main, 0.06),
              transition: 'background-color 0.2s ease',
            }}
          >
            {isBackgroundLoading ? (
              <>
                <HourglassEmptyIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Carregando índices, respostas e medidas…
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }} />
                <LinearProgress sx={{ flex: 1, maxWidth: 280, borderRadius: 1 }} />
              </>
            ) : (
              <>
                <CheckCircleOutlineIcon sx={{ fontSize: 20, color: 'success.main' }} />
                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 500 }}>
                  Carregado
                </Typography>
              </>
            )}
          </Paper>
        )}

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
            {/* Lista de navegação */}
            {isMobile && (
        <Box sx={{ 
                p: 1, 
          display: 'flex',
                justifyContent: 'flex-end',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <ChevronLeftIcon />
            </IconButton>
        </Box>
            )}
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