/**
 * PÁGINA DE DIAGNÓSTICO OTIMIZADA
 * 
 * Nova implementação focada em performance:
 * - Carregamento mínimo inicial
 * - Lazy loading sob demanda
 * - Cache inteligente
 * - Logs reduzidos
 * - Interface responsiva
 */

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
  Alert,
  CircularProgress,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  ArrowBack as ArrowBackIcon,
  ExpandLess,
  ExpandMore,
  Security as SecurityIcon,
  Policy as PolicyIcon,
  Assessment as AssessmentIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

import { useOptimizedDiagnostico } from "../../../../components/diagnostico/hooks/useOptimizedDiagnostico";
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

export default function DiagnosticoPageOptimized() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const programaId = parseInt(params.id as string);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Hook otimizado
  const {
    diagnosticos,
    controlesPorDiagnostico,
    respostasPorChave,
    treeData,
    isLoadingEssential,
    isLoadingDetailed,
    error,
    loadMedidasForControle,
    updateMedidaResposta,
    updateControleINCC,
    getControleMaturidade,
    getDiagnosticoMaturidade,
  } = useOptimizedDiagnostico(programaId);

  // Estados da interface
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [programa, setPrograma] = useState<any>(null);

  // Carregar dados do programa
  useEffect(() => {
    const loadPrograma = async () => {
      try {
        // Implementar carregamento do programa
        setPrograma({ id: programaId, nome: `Programa ${programaId}` });
      } catch (error) {
        console.error('Erro ao carregar programa:', error);
      }
    };
    loadPrograma();
  }, [programaId]);

  // Controlar drawer baseado no tamanho da tela
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // Selecionar dashboard por padrão
  useEffect(() => {
    if (!selectedNode && !isLoadingEssential && treeData.length > 0) {
      setSelectedNode(treeData[0]); // Dashboard
    }
  }, [selectedNode, isLoadingEssential, treeData]);

  // Manipular expansão de nós
  const handleNodeToggle = useCallback((nodeId: string, node: TreeNode) => {
    const newExpanded = new Set(expandedNodes);
    
    if (expandedNodes.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      
      // Carregar medidas se for um controle
      if (node.type === 'controle') {
        loadMedidasForControle(node.data.id);
      }
    }
    
    setExpandedNodes(newExpanded);
  }, [expandedNodes, loadMedidasForControle]);

  // Manipular seleção de nó
  const handleNodeSelect = useCallback((node: TreeNode) => {
    setSelectedNode(node);
    
    // Fechar drawer no mobile quando selecionar medida
    if (isMobile && node.type === 'medida') {
      setDrawerOpen(false);
    }
    
    // Carregar medidas detalhadas se for controle
    if (node.type === 'controle') {
      loadMedidasForControle(node.data.id);
    }
  }, [isMobile, loadMedidasForControle]);

  // Renderizar item da árvore
  const renderTreeItem = useCallback((node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;
    const isLoading = node.type === 'controle' && isLoadingDetailed[node.data.id];

    // Ícones baseados no tipo
    let icon = node.icon;
    if (!icon) {
      switch (node.type) {
        case 'dashboard':
          icon = <DashboardIcon sx={{ color: theme.palette.primary.main }} />;
          break;
        case 'diagnostico':
          icon = <AssessmentIcon sx={{ color: theme.palette.info.main }} />;
          break;
        case 'controle':
          const maturity = getControleMaturidade(node.data);
          icon = <SecurityIcon sx={{ color: maturity.color }} />;
          break;
        default:
          icon = <PolicyIcon />;
      }
    }

    return (
      <Box key={node.id}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isSelected}
            onClick={() => handleNodeSelect(node)}
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
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeToggle(node.id, node);
                }}
                sx={{ mr: 1 }}
              >
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : isExpanded ? (
                  <ExpandLess fontSize="small" />
                ) : (
                  <ExpandMore fontSize="small" />
                )}
              </IconButton>
            )}
            
            <ListItemIcon sx={{ minWidth: 36 }}>
              {icon}
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
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children!.map(child => renderTreeItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }, [
    expandedNodes,
    selectedNode,
    isLoadingDetailed,
    theme,
    getControleMaturidade,
    handleNodeSelect,
    handleNodeToggle
  ]);

  // Conteúdo da área principal
  const renderMainContent = () => {
    if (isLoadingEssential) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Carregando dados essenciais...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Aguarde enquanto carregamos os dados necessários
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          icon={<ErrorIcon />}
          sx={{ m: 3 }}
        >
          <Typography variant="h6">Erro ao carregar dados</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
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
          controles={controlesPorDiagnostico}
          medidas={{}} // Será preenchido conforme necessário
          programaMedidas={respostasPorChave}
          getControleMaturity={getControleMaturidade}
          getDiagnosticoMaturity={(id) => getDiagnosticoMaturidade(id)}
          programaId={programaId}
        />
      );
    }

    // Outros tipos de conteúdo
    return (
      <Card sx={{ m: 3 }}>
        <CardHeader
          title={selectedNode.label}
          subheader={`Tipo: ${selectedNode.type}`}
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
            {isLoadingEssential ? (
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
  );
}
