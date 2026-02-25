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
  Skeleton,
  Stack,
  Divider,
  useTheme,
  alpha,
  Badge,
  Tooltip,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  Collapse,
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
  DeleteSweep as DeleteSweepIcon,
  Restore as RestoreIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
} from "@mui/icons-material";
import Image from 'next/image';
import * as dataService from "../../lib/services/dataService";
import { Programa } from "../../lib/types/types";
import { initialState, reducer } from "../../lib/state/state";
import { getMaturityLabel } from "../../lib/utils/maturity";
import { supabaseBrowserClient } from "@utils/supabase/client";

const TIPOS_PROGRAMA = [
  { value: "empresa_organizacao", label: "Empresa/Organização" },
  { value: "cliente", label: "Cliente (consultoria)" },
  { value: "projeto_produto", label: "Projeto/Produto" },
  { value: "unidade_departamento", label: "Unidade/Departamento" },
] as const;

const DEFAULT_CREATE_FORM = {
  nome: "",
  tipo_programa: "empresa_organizacao" as string,
  setor: 2 as number,
  orgao_id: "" as number | "",
  descricao_escopo: "",
  empresa_modo: "nova" as "nova" | "existente",
  empresa_id: "" as number | "",
  empresa_cnpj: "",
  empresa_razao_social: "",
  empresa_nome_fantasia: "",
  empresa_endereco: "",
  empresa_atividade_principal: "",
  empresa_gestor_responsavel: "",
  empresa_email: "",
  empresa_telefone: "",
};

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
  const [createForm, setCreateForm] = useState(DEFAULT_CREATE_FORM);
  const [orgaos, setOrgaos] = useState<{ id: number; nome: string | null; sigla?: string }[]>([]);
  const [empresas, setEmpresas] = useState<dataService.EmpresaRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [maturityRows, setMaturityRows] = useState<dataService.ProgramDiagnosticoMaturityRow[]>([]);
  const [viewExcluidos, setViewExcluidos] = useState(false);

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewExcluidos]);

  useEffect(() => {
    if (openDialog) {
      setCreateForm(DEFAULT_CREATE_FORM);
      loadOrgaos();
      loadEmpresas();
    }
  }, [openDialog]);

  const loadEmpresas = async () => {
    try {
      const list = await dataService.fetchEmpresasForCurrentUser();
      setEmpresas(list || []);
    } catch {
      setEmpresas([]);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Dados básicos + view de maturidade (uma query) para os cards
      const [programasData, diagnosticosData, maturityData] = await Promise.all([
        dataService.fetchProgramasForCurrentUser(viewExcluidos),
        dataService.fetchDiagnosticos(),
        dataService.fetchProgramaDiagnosticoMaturity()
      ]);
      
      setProgramas(programasData);
      setMaturityRows(maturityData);
      dispatch({ type: "SET_PROGRAMAS", payload: programasData });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });
      
      // Para a página de listagem, não precisamos carregar todos os detalhes
      // Os dados detalhados serão carregados quando o usuário acessar um programa específico
      
      setDataLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setToastMessage("Erro ao carregar dados");
      setToastSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  const loadProgramaData = async (programaId: number, diagnosticos: any[] = []) => {
    try {
      // Carregar responsáveis
      const responsaveis = await dataService.fetchResponsaveis(programaId);
      dispatch({ type: "SET_RESPONSAVEIS", payload: responsaveis });

      // Carregar controles e medidas para cada diagnóstico
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

  // Maturidade por programa: média (para a barra) + um por diagnóstico (para os 3 no card)
  type MaturityEntry = { score: number; label: string; byDiagnostico: { diagnostico_id: number; score: number; label: string }[] };
  const programaMaturityData = useMemo(() => {
    if (!dataLoaded) return new Map<number, MaturityEntry>();
    const maturityMap = new Map<number, MaturityEntry>();
    programas.forEach(programa => {
      const rows = maturityRows.filter(r => r.programa_id === programa.id);
      const byDiagnostico = rows.map(r => ({
        diagnostico_id: r.diagnostico_id,
        score: Math.min(1, Math.max(0, Number(r.score))),
        label: r.label || getMaturityLabel(Number(r.score)),
      }));
      if (rows.length === 0) {
        maturityMap.set(programa.id, { score: 0, label: "Inicial", byDiagnostico: [] });
        return;
      }
      const avgScore = rows.reduce((s, r) => s + Number(r.score), 0) / rows.length;
      const score = Math.min(1, Math.max(0, avgScore));
      maturityMap.set(programa.id, { score, label: getMaturityLabel(score), byDiagnostico });
    });
    return maturityMap;
  }, [programas, dataLoaded, maturityRows]);

  const loadOrgaos = async () => {
    try {
      const list = await dataService.fetchOrgaos();
      setOrgaos(list || []);
    } catch {
      setOrgaos([]);
    }
  };

  const handleCreatePrograma = async () => {
    const nome = createForm.nome?.trim() || "";
    if (!nome) {
      setToastMessage("Informe o nome do programa");
      setToastSeverity("error");
      return;
    }
    if (createForm.setor === 1 && !createForm.orgao_id) {
      setToastMessage("Selecione o órgão público");
      setToastSeverity("error");
      return;
    }
    setCreating(true);
    try {
      const payload: dataService.CreateProgramaPayload = {
        nome,
        setor: createForm.setor,
        orgao: createForm.setor === 1 ? Number(createForm.orgao_id) || null : null,
        tipo_programa: createForm.tipo_programa || null,
        descricao_escopo: createForm.descricao_escopo?.trim() || null,
      };
      if (createForm.setor === 2) {
        if (createForm.empresa_modo === "existente" && createForm.empresa_id !== "" && createForm.empresa_id != null) {
          payload.empresa_id = Number(createForm.empresa_id);
        } else if (
          createForm.empresa_cnpj ||
          createForm.empresa_razao_social ||
          createForm.empresa_nome_fantasia ||
          createForm.empresa_endereco ||
          createForm.empresa_email ||
          createForm.empresa_telefone
        ) {
          payload.empresa = {
            cnpj: createForm.empresa_cnpj || undefined,
            razao_social: createForm.empresa_razao_social || undefined,
            nome_fantasia: createForm.empresa_nome_fantasia || undefined,
            endereco: createForm.empresa_endereco || undefined,
            atividade_principal: createForm.empresa_atividade_principal || undefined,
            gestor_responsavel: createForm.empresa_gestor_responsavel || undefined,
            email: createForm.empresa_email || undefined,
            telefone: createForm.empresa_telefone || undefined,
          };
        }
      }
      const { data, error } = await dataService.createPrograma(payload);
      if (error || !data) {
        setToastMessage("Erro ao criar programa");
        setToastSeverity("error");
        setCreating(false);
        return;
      }
      await dataService.createProgramaControlesForProgram(data.id);
      const { data: { user } } = await supabaseBrowserClient.auth.getUser();
      if (user) {
        let nomeUser = (user.user_metadata?.nome as string) || user.email || "";
        try {
          const res = await fetch("/api/profiles");
          if (res.ok) {
            const profile = await res.json();
            if (profile?.nome) nomeUser = profile.nome;
          }
        } catch {
          /* use nomeUser from above */
        }
        await dataService.setCreatorAsDPO(data.id, user.id, user.email || "", nomeUser);
      }
      const slugBase = nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      const slug = await dataService.getNextAvailableSlug(slugBase || "programa");
      await dataService.updateProgramaField(data.id, "slug", slug);
      setProgramas([...programas, { ...data, slug }]);
      setToastMessage("Programa criado com sucesso");
      setToastSeverity("success");
      setOpenDialog(false);
      setCreateForm(DEFAULT_CREATE_FORM);
    } catch (err) {
      setToastMessage("Erro ao criar programa");
      setToastSeverity("error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePrograma = async (programaId: number) => {
    if (!window.confirm("Mover este programa para a lixeira? Você poderá restaurá-lo depois.")) {
      handleCloseMenu();
      return;
    }
    try {
      const res = await fetch(`/api/programas/${programaId}`, { method: "DELETE", credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setProgramas(programas.filter((p) => p.id !== programaId));
        setToastMessage("Programa movido para a lixeira");
        setToastSeverity("success");
      } else {
        const msg = body?.details ? `${body.error || "Erro"}: ${body.details}` : (body?.error || "Erro ao excluir programa");
        setToastMessage(msg);
        setToastSeverity("error");
      }
    } catch {
      setToastMessage("Erro ao excluir programa");
      setToastSeverity("error");
    }
    handleCloseMenu();
  };

  const handleRestorePrograma = async (programaId: number) => {
    handleCloseMenu();
    try {
      const res = await fetch(`/api/programas/${programaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restore: true }),
        credentials: "include",
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setProgramas(programas.filter((p) => p.id !== programaId));
        setToastMessage("Programa restaurado");
        setToastSeverity("success");
        setViewExcluidos(false);
        loadAllData();
      } else {
        setToastMessage(body?.details ? `${body.error || "Erro"}: ${body.details}` : (body?.error || "Erro ao restaurar"));
        setToastSeverity("error");
      }
    } catch {
      setToastMessage("Erro ao restaurar programa");
      setToastSeverity("error");
    }
  };

  const handleDeletePermanent = async (programaId: number) => {
    if (!window.confirm("Excluir definitivamente? Todos os dados do programa serão perdidos e não será possível recuperar.")) {
      handleCloseMenu();
      return;
    }
    try {
      const res = await fetch(`/api/programas/${programaId}?permanent=1`, { method: "DELETE", credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setProgramas(programas.filter((p) => p.id !== programaId));
        setToastMessage("Programa excluído definitivamente");
        setToastSeverity("success");
      } else {
        const msg = body?.details ? `${body.error || "Erro"}: ${body.details}` : (body?.error || "Erro ao excluir");
        setToastMessage(msg);
        setToastSeverity("error");
      }
    } catch {
      setToastMessage("Erro ao excluir programa");
      setToastSeverity("error");
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
    if (programa.slug) router.push(`/programas/${programa.slug}`);
    else router.push("/programas");
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

  const getMaturityColor = (score: number): string => {
    if (score >= 0.9) return '#2E7D32';
    if (score >= 0.7) return '#388E3C';
    if (score >= 0.5) return '#F9A825';
    if (score >= 0.3) return '#EF6C00';
    return '#C62828';
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
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
                {viewExcluidos ? "Lixeira" : "Programas"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {viewExcluidos ? "Programas excluídos. Restaure ou exclua definitivamente." : "Programas ativos de diagnóstico."}
              </Typography>
            </Box>
          </Box>
          <Button
            variant={viewExcluidos ? "contained" : "outlined"}
            size="small"
            startIcon={viewExcluidos ? <RestoreFromTrashIcon /> : <DeleteSweepIcon />}
            onClick={() => setViewExcluidos(!viewExcluidos)}
          >
            {viewExcluidos ? "Voltar aos ativos" : "Ver excluídos"}
          </Button>
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
          {viewExcluidos ? (
            <>
              <DeleteSweepIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Nenhum programa na lixeira
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Programas que você excluir aparecerão aqui. Você pode restaurá-los ou excluí-los definitivamente.
              </Typography>
              <Button variant="outlined" startIcon={<RestoreFromTrashIcon />} onClick={() => setViewExcluidos(false)}>
                Voltar aos ativos
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </Box>
      ) : (
        <Grid container spacing={4}>
          {programas.map((programa) => {
            const maturityData = programaMaturityData.get(programa.id) || { score: 0, label: 'Inicial', byDiagnostico: [] };
            const diagnosticos = (state.diagnosticos || []).slice(0, 3);
            const getMaturityEntry = (diagId: number) =>
              maturityData.byDiagnostico.find(d => d.diagnostico_id === diagId) ?? { score: 0, label: 'Inicial' };
            
            return (
              <Grid item xs={12} sm={6} lg={4} key={programa.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s ease',
                    boxShadow: hoveredCard === programa.id ? 4 : 1,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: programa.setor === 1 ? theme.palette.primary.main : theme.palette.secondary.main,
                    }
                  }}
                  onMouseEnter={() => setHoveredCard(programa.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    {/* Cabeçalho: título + menu (Editar / Excluir) */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" component="h2" color="primary" sx={{ fontWeight: 600, flex: 1 }}>
                        {programa.nome || programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="Abrir menu do programa"
                        onClick={(e) => { e.stopPropagation(); handleOpenMenu(e, programa); }}
                        sx={{ mt: -0.5, mr: -0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {viewExcluidos && programa.deleted_at && (
                      <Chip size="small" label={`Excluído em ${new Date(programa.deleted_at).toLocaleDateString("pt-BR")}`} color="default" variant="outlined" sx={{ mb: 1 }} />
                    )}

                    {/* Subtítulos: nome fantasia e razão social (quando existirem e diferentes do título) */}
                    <Stack spacing={0.25} sx={{ mb: 1.5 }}>
                      {programa.nome_fantasia && programa.nome_fantasia !== (programa.nome || '') && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {programa.nome_fantasia}
                        </Typography>
                      )}
                      {programa.razao_social && programa.razao_social !== (programa.nome || programa.nome_fantasia || '') && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {programa.razao_social}
                        </Typography>
                      )}
                    </Stack>

                    {/* Vigência do programa */}
                    {(() => {
                      const inicio = programa.politica_inicio_vigencia;
                      const revisao = programa.politica_prazo_revisao;
                      const fmt = (d: Date | string | null | undefined) => {
                        if (d == null) return null;
                        const date = typeof d === 'string' ? new Date(d) : d;
                        if (Number.isNaN(date.getTime())) return null;
                        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      };
                      const inicioStr = fmt(inicio);
                      const revisaoStr = typeof revisao === 'string' || revisao instanceof Date ? fmt(revisao) : null;
                      if (!inicioStr && !revisaoStr) return null;
                      return (
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 2 }}>
                          <ScheduleIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {inicioStr && (revisaoStr ? `Vigência: ${inicioStr} - ${revisaoStr}` : `Vigência: ${inicioStr}`)}
                            {!inicioStr && revisaoStr && `Revisão: ${revisaoStr}`}
                          </Typography>
                        </Stack>
                      );
                    })()}

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Maturidade por diagnóstico
                    </Typography>
                    <Stack spacing={1}>
                      {diagnosticos.map((diag) => {
                        const entry = getMaturityEntry(diag.id);
                        const scorePct = Math.round(entry.score * 100);
                        const color = getMaturityColor(entry.score);
                        return (
                          <Box
                            key={diag.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              py: 0.75,
                              px: 1.25,
                              borderRadius: 1,
                              backgroundColor: alpha(color, 0.08),
                              borderLeft: `3px solid ${color}`,
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }} color="text.primary">
                              {diag.descricao ?? `Diagnóstico ${diag.id}`}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: '2.5rem', textAlign: 'right', color }}>
                              {scorePct}%
                            </Typography>
                            <Chip
                              size="small"
                              label={entry.label}
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor: alpha(color, 0.2),
                                color,
                                border: `1px solid ${alpha(color, 0.5)}`,
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
                    {viewExcluidos ? (
                      <Typography variant="caption" color="text.secondary">
                        Use o menu ⋮ para restaurar ou excluir definitivamente.
                      </Typography>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        size="medium"
                        startIcon={<AssessmentIcon />}
                        onClick={() => handleAccessDiagnostico(programa)}
                        sx={{ py: 1.25 }}
                      >
                        Acessar Programa
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* FAB melhorado */}
      {programas.length > 0 && !viewExcluidos && (
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
            minWidth: 200,
            boxShadow: 4,
          }
        }}
      >
        {[
          ...(!viewExcluidos
            ? [
                <MenuItem key="edit" onClick={() => console.log('Editar - TODO')} sx={{ py: 1.5 }}>
                  <EditIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  Editar Programa
                </MenuItem>,
                <MenuItem
                  key="trash"
                  onClick={() => selectedPrograma && handleDeletePrograma(selectedPrograma.id)}
                  sx={{ py: 1.5, color: 'warning.main' }}
                >
                  <DeleteSweepIcon sx={{ mr: 2 }} />
                  Mover para lixeira
                </MenuItem>,
              ]
            : []),
          ...(viewExcluidos && selectedPrograma
            ? [
                <MenuItem
                  key="restore"
                  onClick={() => handleRestorePrograma(selectedPrograma.id)}
                  sx={{ py: 1.5, color: 'success.main' }}
                >
                  <RestoreIcon sx={{ mr: 2 }} />
                  Restaurar
                </MenuItem>,
                <MenuItem
                  key="permanent"
                  onClick={() => handleDeletePermanent(selectedPrograma.id)}
                  sx={{ py: 1.5, color: 'error.main' }}
                >
                  <DeleteIcon sx={{ mr: 2 }} />
                  Excluir definitivamente
                </MenuItem>,
              ]
            : []),
        ]}
      </Menu>

      {/* Dialog Criar Novo Programa */}
      <Dialog
        open={openDialog}
        onClose={() => !creating && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: 8 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Image src="/logo_p.png" alt="FPSI Logo" width={24} height={24} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Criar Novo Programa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: alpha(theme.palette.info.main, 0.08), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <Typography variant="subtitle2" color="info.dark" sx={{ fontWeight: "bold", mb: 0.5 }}>
              O que é um Programa?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Um Programa de Privacidade é o conjunto de processos, responsáveis, riscos, controles e evidências que cobrem um escopo. Na maioria dos casos, crie 1 programa por empresa/organização e cadastre cada software como um Sistema/Produto dentro dele. Crie programas separados apenas quando a governança for diferente (ex.: outro cliente, outra empresa do grupo, unidade independente).
            </Typography>
          </Box>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              label="Nome do programa"
              value={createForm.nome}
              onChange={(e) => setCreateForm((f) => ({ ...f, nome: e.target.value }))}
              helperText="Dê um nome para o escopo de governança. Pode ser uma empresa, órgão, unidade, cliente ou um projeto/produto com gestão própria."
              placeholder="Ex.: Secretaria X, E-commerce Brasil, Cliente ABC"
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de programa</InputLabel>
              <Select
                value={createForm.tipo_programa}
                label="Tipo de programa"
                onChange={(e) => setCreateForm((f) => ({ ...f, tipo_programa: e.target.value }))}
              >
                {TIPOS_PROGRAMA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Setor</Typography>
              <RadioGroup
                row
                value={String(createForm.setor)}
                onChange={(e) => setCreateForm((f) => ({ ...f, setor: Number(e.target.value), orgao_id: "" }))}
              >
                <FormControlLabel value="1" control={<Radio />} label="Órgão público" />
                <FormControlLabel value="2" control={<Radio />} label="Empresa" />
              </RadioGroup>
            </FormControl>
            <Collapse in={createForm.setor === 1}>
              <FormControl fullWidth required={createForm.setor === 1}>
                <InputLabel>Órgão</InputLabel>
                <Select
                  value={createForm.orgao_id === "" ? "" : createForm.orgao_id}
                  label="Órgão"
                  onChange={(e) => setCreateForm((f) => ({ ...f, orgao_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                >
                  <MenuItem value="">Selecione o órgão</MenuItem>
                  {orgaos.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.nome || ""} {o.sigla ? `(${o.sigla})` : ""}</MenuItem>
                  ))}
                </Select>
                {createForm.setor === 1 && <FormHelperText>Selecione o órgão da tabela de órgãos</FormHelperText>}
              </FormControl>
            </Collapse>
            <Collapse in={createForm.setor === 2}>
              <Box sx={{ pl: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Opcional: use uma empresa já cadastrada (em outros programas) ou cadastre os dados agora. Os dados serão usados no ROPA e em outros registros.
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 1.5 }}>
                  <RadioGroup
                    row
                    value={createForm.empresa_modo}
                    onChange={(e) => setCreateForm((f) => ({ ...f, empresa_modo: e.target.value as "nova" | "existente", empresa_id: "" }))}
                  >
                    <FormControlLabel value="existente" control={<Radio />} label="Usar empresa já cadastrada" />
                    <FormControlLabel value="nova" control={<Radio />} label="Cadastrar nova empresa" />
                  </RadioGroup>
                </FormControl>
                {createForm.empresa_modo === "existente" && (
                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      value={createForm.empresa_id === "" ? "" : createForm.empresa_id}
                      label="Empresa"
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                    >
                      <MenuItem value="">Selecione a empresa</MenuItem>
                      {empresas.map((e) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.nome_fantasia || e.razao_social || `Empresa #${e.id}`}
                          {e.razao_social && e.nome_fantasia && e.razao_social !== e.nome_fantasia ? ` (${e.razao_social})` : ""}
                        </MenuItem>
                      ))}
                    </Select>
                    {empresas.length === 0 && (
                      <FormHelperText>Nenhuma empresa cadastrada nos seus programas. Use &quot;Cadastrar nova empresa&quot;.</FormHelperText>
                    )}
                  </FormControl>
                )}
                {createForm.empresa_modo === "nova" && (
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="CNPJ"
                      value={createForm.empresa_cnpj}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_cnpj: e.target.value }))}
                      placeholder="00.000.000/0001-00"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Razão social"
                      value={createForm.empresa_razao_social}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_razao_social: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Nome fantasia"
                      value={createForm.empresa_nome_fantasia}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_nome_fantasia: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Endereço"
                      value={createForm.empresa_endereco}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_endereco: e.target.value }))}
                      placeholder="Para ROPA e documentos"
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Principal atividade"
                      value={createForm.empresa_atividade_principal}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_atividade_principal: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Gestor responsável"
                      value={createForm.empresa_gestor_responsavel}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_gestor_responsavel: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="E-mail"
                      type="email"
                      value={createForm.empresa_email}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_email: e.target.value }))}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Telefone"
                      value={createForm.empresa_telefone}
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_telefone: e.target.value }))}
                    />
                  </Stack>
                )}
              </Box>
            </Collapse>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={3}
              label="Descrição curta do escopo"
              value={createForm.descricao_escopo}
              onChange={(e) => setCreateForm((f) => ({ ...f, descricao_escopo: e.target.value }))}
              helperText="Ex.: Operações do e-commerce + app mobile no Brasil. Ou: Governança de dados do portal e sistemas internos da Secretaria X."
              placeholder="Ex.: Operações do e-commerce + app mobile no Brasil."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={creating} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreatePrograma}
            variant="contained"
            disabled={creating}
            sx={{
              borderRadius: 2,
              px: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {creating ? "Criando…" : "Criar Programa"}
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