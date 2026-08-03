"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Drawer,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Skeleton,
  Divider,
  useTheme,
  alpha,
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
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';

import * as dataService from "../../../../lib/services/dataService";
import { useProgramaIdFromParam } from "../../../../hooks/useProgramaIdFromParam";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { shouldUseDemoData } from "@/lib/services/demoDataService";
import { Diagnostico, Controle, Medida, Responsavel, ProgramaMedida } from "../../../../lib/types/types";
import MedidaContainer from "../../../../components/diagnostico/containers/MedidaContainer";
import ControleContainer from "../../../../components/diagnostico/containers/ControleContainer";
import { useMaturityCache } from "../../../../components/diagnostico/hooks/useMaturityCache";
import MaturityChip from "../../../../components/diagnostico/MaturityChip";
import Dashboard from "../../../../components/diagnostico/Dashboard";
import { GrupoImplementacaoFilter } from "../../../../components/diagnostico/GrupoImplementacaoFilter";
import ReportButton from "../../../../components/diagnostico/ReportButton";
import { DiagnosticoNavBar } from "../../../../components/diagnostico/DiagnosticoNavBar";
import {
  DiagnosticoTreeNav,
  type DiagnosticoTreeNode,
} from "../../../../components/diagnostico/DiagnosticoTreeNav";
import {
  getControleTreeLabel,
  getDiagnosticoIndiceLabel,
  getDiagnosticoTreeLabel,
  getMedidaTreeLabel,
} from "../../../../lib/utils/diagnosticoTreeLabels";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { getDiagnosticoTheme } from "../../../../lib/utils/diagnosticoThemes";
import {
  GrupoImpleFilter,
  isDiagnosticoSeguranca,
  matchesGrupoFilter,
} from "../../../../lib/utils/grupoImplementacao";
import {
  isDiagnosticoAtivo,
  isControleAtivo,
  resolveProgramaEscopo,
  ativarDiagnostico,
  detectPresetFromEscopo,
} from "@/lib/programa/perfilEscopo";
import { sortMedidasByIdMedida } from "../../../../lib/utils/medidaSort";

const DRAWER_WIDTH = 380;

type TreeNode = DiagnosticoTreeNode;

export default function DiagnosticoPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId: resolvedProgramaId, loading: resolvingId } = useProgramaIdFromParam(idOrSlug);
  const programaId = resolvedProgramaId ?? 0;
  const isDemoMode = shouldUseDemoData(programaId);
  const { hasPermission } = useUserPermissions(isDemoMode ? undefined : programaId);
  const canEditEscopo = isDemoMode || hasPermission("can_edit_programa");
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
  const [grupoImpleFilter, setGrupoImpleFilter] = useState<GrupoImpleFilter>("all");

  const programaEscopo = useMemo(
    () => (programa ? resolveProgramaEscopo(programa).escopo : null),
    [programa]
  );

  const diagnosticosAtivos = useMemo(
    () =>
      programaEscopo
        ? diagnosticos.filter((d) => isDiagnosticoAtivo(programaEscopo, d.id))
        : diagnosticos,
    [diagnosticos, programaEscopo]
  );

  const diagnosticosCortados = useMemo(
    () =>
      programaEscopo
        ? diagnosticos.filter((d) => !isDiagnosticoAtivo(programaEscopo, d.id))
        : [],
    [diagnosticos, programaEscopo]
  );

  useEffect(() => {
    if (!programa) return;
    const { giAlvo } = resolveProgramaEscopo(programa);
    if (giAlvo) {
      setGrupoImpleFilter((prev) => (prev === "all" ? (giAlvo as GrupoImpleFilter) : prev));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- aplica GI alvo só na carga do programa
  }, [programa?.id]);

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
        id: "dashboard",
        type: "dashboard",
        label: "Visão geral",
        badge: "Resumo",
        data: { type: "dashboard" },
      });
    }
  }, [selectedNode, loading]);

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
        
        // Carregar controles de todos os diagnósticos (incl. Governança de IA / AIGP)
        for (const diagnostico of diagnosticos) {
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

  // Carrega estrutura de medidas (id + grupo_imple) para dashboard e filtro GI em Segurança.
  const precisaEstruturaMedidas =
    selectedNode?.type === "dashboard" ||
    (selectedNode?.type === "diagnostico" && isDiagnosticoSeguranca(selectedNode.data?.id));

  useEffect(() => {
    if (precisaEstruturaMedidas && !loading && Object.keys(controles).length > 0) {
      const timer = setTimeout(() => {
        loadMedidasForDashboardRef.current?.();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [precisaEstruturaMedidas, loading, controles]);

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

    if (node.type === "diagnostico") {
      await loadControles(node.data.id);
    }

    if (isMobile && node.type === "medida") {
      setDrawerOpen(false);
    }
  }, [isMobile, loadControles]);

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

  /** Visão geral: filtro GI só afeta medidas do diagnóstico Segurança (CIS). */
  const controleDiagnosticoMap = useMemo(() => {
    const map: Record<number, number> = {};
    Object.entries(controles).forEach(([diagId, ctrls]) => {
      (ctrls || []).forEach((c) => {
        map[c.id] = Number(diagId);
      });
    });
    return map;
  }, [controles]);

  const medidasParaDashboard = useMemo(() => {
    if (grupoImpleFilter === "all") return medidasParaCalculo;
    const out: { [key: number]: Array<Medida | dataService.MedidaStructureItem> } = {};
    Object.keys(medidasParaCalculo).forEach((k) => {
      const cid = Number(k);
      const arr = medidasParaCalculo[cid] || [];
      if (isDiagnosticoSeguranca(controleDiagnosticoMap[cid])) {
        out[cid] = arr.filter((m) =>
          matchesGrupoFilter((m as Medida).grupo_imple, grupoImpleFilter)
        );
      } else {
        out[cid] = arr;
      }
    });
    return out;
  }, [medidasParaCalculo, grupoImpleFilter, controleDiagnosticoMap]);

  // Construir árvore de navegação
  const treeData = useMemo((): TreeNode[] => {
    if (loading) return [];

    const tree: TreeNode[] = [
      {
        id: "dashboard",
        type: "dashboard",
        label: "Visão geral",
        badge: "Resumo",
        data: { type: "dashboard" },
      },
    ];

    diagnosticos.forEach((diagnostico) => {
      if (programaEscopo && !isDiagnosticoAtivo(programaEscopo, diagnostico.id)) return;
      const diagnosticoControles = controles[diagnostico.id] || [];
      const diagnosticoMaturity = getDiagnosticoMaturity(
        diagnostico,
        diagnosticoControles,
        medidasParaCalculo as { [key: number]: Medida[] }
      );

      const diagnosticoNode: TreeNode = {
        id: `diagnostico-${diagnostico.id}`,
        type: "diagnostico",
        label: diagnostico.descricao?.trim() || getDiagnosticoTreeLabel(diagnostico.id, diagnostico.descricao),
        indiceLabel: getDiagnosticoIndiceLabel(diagnostico.id),
        data: diagnostico,
        diagnosticoId: diagnostico.id,
        maturityScore: diagnosticoMaturity.score,
        maturityLabel: diagnosticoMaturity.label,
        children: [],
      };

      for (const controle of diagnosticoControles) {
        if (programaEscopo && !isControleAtivo(programaEscopo, controle.id, diagnostico.id)) continue;
        const medidasControle = medidasParaCalculo[controle.id] || [];
        const controleMedidas = medidas[controle.id] || [];
        if (grupoImpleFilter !== "all" && medidasControle.length > 0 && isDiagnosticoSeguranca(diagnostico.id)) {
          const hasAny = medidasControle.some((m) =>
            matchesGrupoFilter((m as Medida).grupo_imple, grupoImpleFilter)
          );
          if (!hasAny) continue;
        }
        const controleMaturity = getControleMaturity(
          controle,
          medidasControle as Medida[],
          controle,
          programaMedidas
        );

        const controleNode: TreeNode = {
          id: `controle-${controle.id}`,
          type: "controle",
          label: getControleTreeLabel(controle.numero, controle.nome),
          badge: undefined,
          data: {
            ...controle,
            calculationData: controleMaturity.calculationData,
          },
          diagnosticoId: diagnostico.id,
          maturityScore: controleMaturity.score,
          maturityLabel: controleMaturity.label,
          children: [],
        };

        sortMedidasByIdMedida(controleMedidas).forEach((medida) => {
          const hasFullMedida = typeof (medida as Medida).medida === "string";
          if (!hasFullMedida) return;
          if (isDiagnosticoSeguranca(diagnostico.id) && !matchesGrupoFilter(medida.grupo_imple, grupoImpleFilter)) {
            return;
          }

          const programaMedidaRow = programaMedidas[`${medida.id}-${controle.id}-${programaId}`];
          const getMedidaResponseColor = () => {
            if (!programaMedidaRow?.resposta) return "#9E9E9E";
            const respostaNum =
              typeof programaMedidaRow.resposta === "string"
                ? parseInt(programaMedidaRow.resposta, 10)
                : programaMedidaRow.resposta;
            if (isNaN(respostaNum)) return "#9E9E9E";
            if (controle.diagnostico === 1) {
              return respostaNum === 1 ? "#4CAF50" : respostaNum === 2 ? "#FF5252" : "#9E9E9E";
            }
            switch (respostaNum) {
              case 1:
                return "#4CAF50";
              case 2:
                return "#8BC34A";
              case 3:
                return "#FFC107";
              case 4:
                return "#FF9800";
              case 5:
                return "#FF5252";
              case 6:
                return "#9E9E9E";
              default:
                return "#9E9E9E";
            }
          };

          const medidaNode: TreeNode = {
            id: `medida-${medida.id}`,
            type: "medida",
            label: getMedidaTreeLabel((medida as Medida).medida),
            badge: (medida as Medida).id_medida,
            data: { medida, controle, programaMedida: programaMedidaRow },
            diagnosticoId: diagnostico.id,
            responseColor: getMedidaResponseColor(),
          };
          controleNode.children!.push(medidaNode);
        });

        diagnosticoNode.children!.push(controleNode);
      }

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
    getDiagnosticoMaturity,
    getControleMaturity,
    grupoImpleFilter,
  ]);

  // Funções de navegação
  const findNextPrevItems = useCallback((currentNode: TreeNode, itemType: 'diagnostico' | 'controle' | 'medida') => {
    let allItems: TreeNode[] = [];
    
    if (itemType === 'diagnostico') {
      allItems = treeData.filter(node => node.type === 'diagnostico');
    } else if (itemType === 'controle') {
      const currentDiagnostico = diagnosticos.find(d => {
        const diagnosticoControles = controles[d.id] || [];
        return diagnosticoControles.some(c => c.id === currentNode.data.id);
      });
      if (currentDiagnostico) {
        const diagnosticoControles = controles[currentDiagnostico.id] || [];
        const filtrados =
          grupoImpleFilter === "all" || !isDiagnosticoSeguranca(currentDiagnostico.id)
            ? diagnosticoControles
            : diagnosticoControles.filter((controle) => {
                const cm = medidasParaCalculo[controle.id] || [];
                if (cm.length === 0) return true;
                return cm.some((m) => matchesGrupoFilter((m as Medida).grupo_imple, grupoImpleFilter));
              });
        allItems = filtrados.map(controle => ({
          id: `controle-${controle.id}`,
          type: 'controle' as const,
          label: `${controle.numero} - ${controle.nome}`,
          icon: <SecurityIcon />,
          data: controle,
        }));
      }
    } else if (itemType === 'medida') {
      // Encontrar todas as medidas do controle atual (filtro cumulativo GI1/GI2/GI3)
      const controle = currentNode.data.controle;
      const controleMedidas = medidas[controle.id] || [];
      const filtradas =
        grupoImpleFilter === "all" || !isDiagnosticoSeguranca(controle.diagnostico)
          ? controleMedidas
          : controleMedidas.filter((m) => matchesGrupoFilter(m.grupo_imple, grupoImpleFilter));
      allItems = sortMedidasByIdMedida(filtradas).map((medida) => ({
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
  }, [treeData, diagnosticos, controles, medidas, medidasParaCalculo, programaMedidas, programaId, grupoImpleFilter]);

  useEffect(() => {
    if (grupoImpleFilter === "all") return;
    setSelectedNode((cur) => {
      if (!cur || cur.type !== "medida") return cur;
      if (!isDiagnosticoSeguranca(cur.data.controle?.diagnostico)) return cur;
      if (matchesGrupoFilter(cur.data.medida.grupo_imple, grupoImpleFilter)) return cur;
      const c = cur.data.controle;
      const controleNode = treeData
        .flatMap((n) => n.children || [])
        .find((n) => n.type === "controle" && n.data.id === c.id);
      const dashboardNode = treeData.find((n) => n.type === "dashboard");
      return controleNode ?? dashboardNode ?? cur;
    });
  }, [grupoImpleFilter, treeData]);

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
      const updatedRow = await dataService.updateProgramaMedida(medidaId, controleId, programaId, {
        [field]: value,
      });

      // Invalidar cache de maturidade
      invalidateCache('controle', controleId);

      // Atualizar programaMedidas local (inclui updated_at do banco)
      const key = `${medidaId}-${controleId}-${programaId}`;
      setProgramaMedidas(prev => {
        const base = prev[key] || {};
        const newProgramaMedidas = {
          ...prev,
          [key]: updatedRow ? { ...base, ...updatedRow } : { ...base, [field]: value },
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
          diagnosticosOutOfScopeIds={diagnosticosCortados.map((d) => d.id)}
          onAtivarDiagnostico={
            programa?.id && canEditEscopo && !isDemoMode
              ? async (diagnosticoId) => {
                  if (!programaEscopo) return;
                  try {
                    const next = ativarDiagnostico(programaEscopo, diagnosticoId as 1 | 2 | 3 | 4);
                    await dataService.updateProgramaEscopo(programa.id, {
                      escopo: next,
                      perfil_escopo: detectPresetFromEscopo(next),
                    });
                    const refreshed = await dataService.fetchProgramaById(programa.id);
                    setPrograma(refreshed);
                  } catch (err) {
                    console.error(err);
                    alert(err instanceof Error ? err.message : "Erro ao atualizar escopo");
                  }
                }
              : undefined
          }
          controles={controles}
          medidas={medidasParaDashboard as { [key: number]: Medida[] }}
          programaMedidas={programaMedidas}
          getControleMaturity={getControleMaturity}
          grupoImpleFilter={grupoImpleFilter}
          onGrupoImpleFilterChange={setGrupoImpleFilter}
          dataLoading={isBackgroundLoading}
          getDiagnosticoMaturity={(id) => {
            const diagnostico = diagnosticos.find(d => d.id === id);
            if (!diagnostico) return { score: 0, label: 'Sem dados', color: '#9E9E9E', level: 'inicial' as const };
            const diagnosticoControles = controles[id] || [];
            return getDiagnosticoMaturity(diagnostico, diagnosticoControles, medidasParaDashboard as { [key: number]: Medida[] });
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
      const giEstruturaPronta =
        grupoImpleFilter === "all" ||
        !isDiagnosticoSeguranca(selectedNode.data.id) ||
        diagnosticoControles.some((c) => (medidasParaCalculo[c.id]?.length ?? 0) > 0);

      const diagnosticoControlesVisiveis =
        grupoImpleFilter === "all" || !isDiagnosticoSeguranca(selectedNode.data.id)
          ? diagnosticoControles
          : diagnosticoControles.filter((controle) => {
              const cm = medidasParaCalculo[controle.id] || [];
              if (cm.length === 0) return false;
              return cm.some((m) => matchesGrupoFilter((m as Medida).grupo_imple, grupoImpleFilter));
            });
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
          <DiagnosticoNavBar
            currentIndex={currentIndex}
            total={total}
            title={`${getDiagnosticoIndiceLabel(selectedNode.data.id)} · ${selectedNode.data.descricao?.trim() || getDiagnosticoTreeLabel(selectedNode.data.id, selectedNode.data.descricao)}`}
            accentColor={getDiagnosticoTheme(selectedNode.data.id).color}
            onPrev={prevItem ? () => navigateToItem(prevItem) : undefined}
            onNext={nextItem ? () => navigateToItem(nextItem) : undefined}
          />

          {isDiagnosticoSeguranca(selectedNode.data.id) && (
            <Box sx={{ mb: 2 }}>
              <GrupoImplementacaoFilter value={grupoImpleFilter} onChange={setGrupoImpleFilter} />
              {grupoImpleFilter !== "all" && !giEstruturaPronta && isBackgroundLoading && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, px: 0.5 }}>
                  Carregando classificação GI das medidas…
                </Typography>
              )}
            </Box>
          )}

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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
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
                  <Chip
                    label={`${diagnosticoControlesVisiveis.length}${
                      grupoImpleFilter !== "all" && diagnosticoControlesVisiveis.length !== diagnosticoControles.length
                        ? ` / ${diagnosticoControles.length}`
                        : ""
                    } controles`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              }
            />
            <CardContent>
              {/* Lista de Controles */}
              {diagnosticoControles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Expanda este diagnóstico na árvore lateral para carregar os controles.
                </Typography>
              ) : diagnosticoControlesVisiveis.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum controle com medidas no grupo selecionado. Escolha &quot;Todos&quot; ou outro grupo no filtro de Segurança.
                </Typography>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                    Controles deste Diagnóstico
                  </Typography>
                  <Grid container spacing={2}>
                    {diagnosticoControlesVisiveis.map((controle) => {
                      const controleMedidasAll = medidasParaCalculo[controle.id] || [];
                      const controleMedidasVisiveis =
                        grupoImpleFilter === "all" || !isDiagnosticoSeguranca(selectedNode.data.id)
                          ? controleMedidasAll
                          : controleMedidasAll.filter((m) =>
                              matchesGrupoFilter((m as Medida).grupo_imple, grupoImpleFilter)
                            );
                      const programaControle = {
                        id: controle.programa_controle_id || 0,
                        programa: programaId,
                        controle: controle.id,
                        nivel: controle.nivel || 1
                      };
                      const controleMaturity = getControleMaturity(
                        controle,
                        controleMedidasAll as Medida[],
                        programaControle,
                        programaMedidas
                      );
                      
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
                                      label={`${controleMedidasVisiveis.length} medida${
                                        controleMedidasVisiveis.length === 1 ? "" : "s"
                                      }`}
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
          <DiagnosticoNavBar
            currentIndex={currentIndex}
            total={total}
            subtitle={`${controle.numero} — ${controle.nome}`}
            title={`${medida.id_medida || medida.id} · ${medida.medida}`}
            accentColor={getDiagnosticoTheme(diagnostico?.id ?? 4).color}
            onPrev={prevItem ? () => navigateToItem(prevItem) : undefined}
            onNext={nextItem ? () => navigateToItem(nextItem) : undefined}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <MedidaContainer
              medida={medida}
              programaMedida={programaMedida}
              controle={controle}
              programaId={programaId}
              programaPathSegment={idOrSlug}
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
            const pcRow = await dataService.updateControleNivel(programaControleId, novoNivel, programaId);

            // Atualizar estado local imediatamente
            setControles(prev => {
              const newControles = { ...prev };
              if (newControles[diagnostico.id]) {
                newControles[diagnostico.id] = newControles[diagnostico.id].map((c) =>
                  c.id === controleId
                    ? {
                        ...c,
                        nivel: novoNivel,
                        programa_controle_updated_at: pcRow?.updated_at ?? c.programa_controle_updated_at,
                      }
                    : c
                );
              }
              return newControles;
            });
            
            // Atualizar selectedNode se for o controle atual
            if (selectedNode?.type === 'controle' && selectedNode.data.id === controleId) {
              setSelectedNode((prev) => ({
                ...prev!,
                data: {
                  ...prev!.data,
                  nivel: novoNivel,
                  programa_controle_updated_at:
                    pcRow?.updated_at ?? (prev!.data as Controle).programa_controle_updated_at,
                },
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

      const { prevItem, nextItem, currentIndex, total } = findNextPrevItems(selectedNode, 'controle');
      const navigateToControle = (item: { id: string }) => {
        const node = treeData
          .flatMap((d) => d.children || [])
          .find((n) => n.id === item.id);
        if (node) handleNodeSelect(node);
      };

      return (
        <Box>
          <DiagnosticoNavBar
            currentIndex={currentIndex}
            total={total}
            subtitle={diagnostico.descricao}
            title={`${controle.numero} · ${controle.nome}`}
            accentColor={getDiagnosticoTheme(diagnostico.id).color}
            onPrev={prevItem ? () => navigateToControle(prevItem) : undefined}
            onNext={nextItem ? () => navigateToControle(nextItem) : undefined}
          />

          {isDiagnosticoSeguranca(diagnostico.id) && (
            <Box sx={{ mb: 2 }}>
              <GrupoImplementacaoFilter value={grupoImpleFilter} onChange={setGrupoImpleFilter} />
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <ControleContainer
              controle={controle}
              diagnostico={diagnostico}
              programaId={programaId}
              programaPathSegment={idOrSlug}
              state={controleState}
              handleINCCChange={handleINCCChange}
              handleMedidaFetch={handleMedidaFetch}
              handleMedidaChange={handleMedidaChange}
              responsaveis={responsaveis}
              onMedidaNavigate={handleMedidaNavigate}
              programaMedidas={programaMedidas}
              getControleMaturity={getControleMaturity}
              grupoImpleFilter={grupoImpleFilter}
            />
          </LocalizationProvider>
        </Box>
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
            <PageHeroHeader
              title="Diagnóstico"
              icon={<AssessmentIcon sx={{ fontSize: 30 }} aria-hidden />}
              description="Controles e medidas por diagnóstico (CIS · PPSI 2.0 · Governança de IA)."
              trailing={
                <>
                  {isMobile && (
                    <IconButton color="primary" onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Menu">
                      <MenuIcon />
                    </IconButton>
                  )}
                  <ReportButton programaPathSegment={idOrSlug} iconOnly />
                </>
              }
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
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.96),
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
              <DiagnosticoTreeNav
                nodes={treeData}
                selectedNodeId={selectedNode?.id ?? null}
                expandedNodes={expandedNodes}
                loadingControles={loadingControles}
                loadingMedidas={loadingMedidas}
                loading={loading}
                onSelect={handleNodeSelect}
                onToggle={handleNodeToggle}
              />
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