"use client";

import React, { useEffect, useState, useReducer, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
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
  useTheme,
  alpha,
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
  MoreVert as MoreVertIcon,
  Assessment as AssessmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  DeleteSweep as DeleteSweepIcon,
  Restore as RestoreIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
} from "@mui/icons-material";
import Image from "next/image";
import * as dataService from "@/lib/services/dataService";
import { Programa } from "@/lib/types/types";
import { initialState, reducer } from "@/lib/state/state";
import { getMaturityLabel } from "@/lib/utils/maturity";
import { MaturityDiagnosticoSummary } from "@/components/dashboard/MaturityDiagnosticoSummary";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import { supabaseBrowserClient } from "@utils/supabase/client";
import type { BoardItemSize } from "@/lib/dashboard/smartBoardGrid";
import type { DashboardProgramaResumo } from "@/lib/types/pendencias";
import { CriarProgramaWizard } from "@/components/programa/CriarProgramaWizard";

export type ProgramasSectionProps = {
  /** Integra cards no board compartilhado com empresas. */
  boardMode?: boolean;
  boardItemSize?: BoardItemSize;
  onCountChange?: (count: number) => void;
  /** Incrementar para abrir o diálogo de criação (board compartilhado). */
  createOpenRequest?: number;
  viewExcluidos?: boolean;
  onViewExcluidosChange?: (value: boolean) => void;
  /** Alertas/KPIs operacionais por programa (central operacional). */
  opsByPrograma?: DashboardProgramaResumo[];
};

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
  atividade_principal_organizacao: "",
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

export function ProgramasSection({
  boardMode = false,
  boardItemSize = { xs: 12, sm: 6, md: 4 },
  onCountChange,
  createOpenRequest = 0,
  viewExcluidos: viewExcluidosControlled,
  onViewExcluidosChange,
  opsByPrograma,
}: ProgramasSectionProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [viewExcluidosInternal, setViewExcluidosInternal] = useState(false);
  const viewExcluidos = viewExcluidosControlled ?? viewExcluidosInternal;
  const setViewExcluidos = (v: boolean) => {
    onViewExcluidosChange?.(v);
    if (viewExcluidosControlled === undefined) setViewExcluidosInternal(v);
  };

  useEffect(() => {
    loadAllData();
  }, [viewExcluidos]);

  useEffect(() => {
    onCountChange?.(viewExcluidos ? 0 : programas.length);
  }, [programas.length, viewExcluidos, onCountChange]);

  useEffect(() => {
    if (searchParams.get("novoPrograma") !== "1") return;
    setOpenDialog(true);
    router.replace("/dashboard", { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    if (createOpenRequest > 0) setOpenDialog(true);
  }, [createOpenRequest]);

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
      const [programasData, diagnosticosData, maturityData] = await Promise.all([
        dataService.fetchProgramasForCurrentUser(viewExcluidos),
        dataService.fetchDiagnosticos(),
        dataService.fetchProgramaDiagnosticoMaturity(),
      ]);
      setProgramas(programasData);
      setMaturityRows(maturityData);
      dispatch({ type: "SET_PROGRAMAS", payload: programasData });
      dispatch({ type: "SET_DIAGNOSTICOS", payload: diagnosticosData });
      setDataLoaded(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setToastMessage("Erro ao carregar dados");
      setToastSeverity("error");
    } finally {
      setLoading(false);
    }
  };

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
        atividade_principal_organizacao: createForm.atividade_principal_organizacao?.trim() || null,
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
    else router.push("/dashboard");
  };

  const diagnosticos = state.diagnosticos || [];
  const itemSize = boardMode ? boardItemSize : { xs: 12, sm: 6, md: 4 };

  type MaturityEntry = { byDiagnostico: { diagnostico_id: number; score: number; label: string }[] };
  const programaMaturityData = useMemo(() => {
    if (!dataLoaded) return new Map<number, MaturityEntry>();
    const maturityMap = new Map<number, MaturityEntry>();
    programas.forEach((programa) => {
      const rows = maturityRows.filter((r) => r.programa_id === programa.id);
      const byDiagnostico = rows.map((r) => ({
        diagnostico_id: r.diagnostico_id,
        score: Math.min(1, Math.max(0, Number(r.score))),
        label: r.label || getMaturityLabel(Number(r.score)),
      }));
      maturityMap.set(programa.id, { byDiagnostico });
    });
    return maturityMap;
  }, [programas, dataLoaded, maturityRows]);

  const opsMap = useMemo(() => {
    const m = new Map<number, DashboardProgramaResumo>();
    for (const o of opsByPrograma ?? []) m.set(o.programaId, o);
    return m;
  }, [opsByPrograma]);

  const programaCards = programas.map((programa) => {
    const maturityData = programaMaturityData.get(programa.id) || { byDiagnostico: [] };
    const maturidadeItems = maturityData.byDiagnostico.map((d) => ({
      diagnostico_id: d.diagnostico_id,
      nome: diagnosticos.find((diag) => diag.id === d.diagnostico_id)?.descricao || `Diagnóstico ${d.diagnostico_id}`,
      score: d.score,
      label: d.label,
    }));
    const logoUrl = getProgramaLogoDisplayUrl(programa);
    const title = programa.nome || programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`;
    const subtitle =
      programa.nome_fantasia && programa.nome && programa.nome_fantasia !== programa.nome
        ? programa.nome_fantasia
        : programa.razao_social && programa.razao_social !== title
          ? programa.razao_social
          : null;
    const ops = opsMap.get(programa.id);

    /** Board empilhado (central operacional): card amplo com maturidade por diagnóstico + alertas. */
    if (boardMode) {
      return (
        <Grid item {...itemSize} key={`prog-${programa.id}`}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              borderRadius: 1,
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              boxShadow: hoveredCard === programa.id ? `0 10px 28px ${alpha(theme.palette.primary.main, 0.12)}` : "none",
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              "&:hover": {
                borderColor: alpha(theme.palette.primary.main, 0.35),
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 3,
                background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              },
            }}
            onMouseEnter={() => setHoveredCard(programa.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardContent sx={{ py: 1.5, px: 1.75, pl: 2.1, "&:last-child": { pb: 1.25 } }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.25 }}>
                {logoUrl ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt=""
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 1,
                      objectFit: "contain",
                      flexShrink: 0,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 1,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    {(title.slice(0, 2) || "PR").toUpperCase()}
                  </Box>
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
                    <Chip
                      label="Programa"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: "primary.main",
                      }}
                    />
                    {viewExcluidos && programa.deleted_at && (
                      <Chip
                        size="small"
                        label={`Excluído ${new Date(programa.deleted_at).toLocaleDateString("pt-BR")}`}
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant="subtitle1"
                    component="h2"
                    sx={{ fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.02em", fontSize: "1.05rem" }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.15 }}>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
                <IconButton
                  size="small"
                  aria-label="Menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenMenu(e, programa);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ mb: 1.1 }}>
                <MaturityDiagnosticoSummary
                  items={maturidadeItems}
                  diagnosticos={diagnosticos}
                  compact
                  layout="panel"
                  href={`/programas/${programa.slug || programa.id}/diagnostico`}
                />
              </Box>

              <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
                  {ops && ops.pendenciasAtrasadas > 0 && (
                    <Chip size="small" color="error" label={`${ops.pendenciasAtrasadas} atrasada(s)`} sx={{ fontWeight: 700, height: 24 }} />
                  )}
                  {ops && ops.pendenciasTotal > 0 && (
                    <Chip size="small" color="warning" variant="outlined" label={`${ops.pendenciasTotal} pendência(s)`} sx={{ fontWeight: 600, height: 24 }} />
                  )}
                  {ops && ops.dsarAbertos > 0 && (
                    <Chip size="small" color="info" variant="outlined" label={`${ops.dsarAbertos} DSAR aberto(s)`} sx={{ fontWeight: 600, height: 24 }} />
                  )}
                  {ops && ops.incidentesAbertos > 0 && (
                    <Chip size="small" color="error" variant="outlined" label={`${ops.incidentesAbertos} incidente(s)`} sx={{ fontWeight: 600, height: 24 }} />
                  )}
                  {ops && ops.riscosCriticos > 0 && (
                    <Chip size="small" color="warning" label={`${ops.riscosCriticos} risco(s) crítico(s)`} sx={{ fontWeight: 700, height: 24 }} />
                  )}
                  {ops &&
                    ops.pendenciasAtrasadas === 0 &&
                    ops.pendenciasTotal === 0 &&
                    ops.dsarAbertos === 0 &&
                    ops.incidentesAbertos === 0 &&
                    ops.riscosCriticos === 0 && (
                      <Chip size="small" color="success" variant="outlined" label="Sem alertas operacionais" sx={{ fontWeight: 600, height: 24 }} />
                    )}
                </Stack>
            </CardContent>
            <CardActions sx={{ px: 1.75, pb: 1.35, pt: 0, gap: 1 }}>
              {!viewExcluidos && (
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<AssessmentIcon />}
                  onClick={() => handleAccessDiagnostico(programa)}
                  sx={{ fontWeight: 700, borderRadius: 1 }}
                >
                  Abrir programa
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      );
    }

    return (
      <Grid item {...itemSize} key={`prog-${programa.id}`}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: hoveredCard === programa.id ? `0 10px 28px ${alpha(theme.palette.primary.main, 0.14)}` : undefined,
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            transform: hoveredCard === programa.id ? "translateY(-1px)" : "none",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            },
          }}
          onMouseEnter={() => setHoveredCard(programa.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent sx={{ flex: 1, p: 2, pl: 2.25, "&:last-child": { pb: 1.5 } }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.75, mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0 }}>
                {logoUrl ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt=""
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      objectFit: "contain",
                      flexShrink: 0,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  />
                ) : null}
                <Box sx={{ minWidth: 0 }}>
                  <Chip
                    label="Programa"
                    size="small"
                    sx={{
                      height: 22,
                      mb: 0.5,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                    }}
                  />
                  <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton
                size="small"
                aria-label="Menu"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenMenu(e, programa);
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            {viewExcluidos && programa.deleted_at && (
              <Chip
                size="small"
                label={`Excluído ${new Date(programa.deleted_at).toLocaleDateString("pt-BR")}`}
                color="default"
                variant="outlined"
                sx={{ mb: 1, height: 22 }}
              />
            )}
            <Box sx={{ mb: 0.75 }}>
              <MaturityDiagnosticoSummary
                items={maturidadeItems}
                diagnosticos={diagnosticos}
                compact
                layout="panel"
                href={`/programas/${programa.slug || programa.id}/diagnostico`}
              />
            </Box>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
            {!viewExcluidos && (
              <Button variant="contained" fullWidth size="medium" startIcon={<AssessmentIcon />} onClick={() => handleAccessDiagnostico(programa)}>
                Abrir
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  });

  if (loading) {
    const skeletons = [1, 2, 3].map((index) => (
      <Grid item {...itemSize} key={index}>
        <Card sx={{ height: 180, borderRadius: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" height={48} sx={{ mt: 1.5 }} />
          </CardContent>
        </Card>
      </Grid>
    ));
    if (boardMode) return <>{skeletons}</>;
    return (
      <Box sx={{ mb: 2.5 }}>
        <Skeleton variant="text" width={180} height={36} sx={{ mb: 1.25 }} />
        <Grid container spacing={1.5}>
          {skeletons}
        </Grid>
      </Box>
    );
  }

  const emptyProgramas = programas.length === 0 && (
    <Grid item {...(boardMode && !viewExcluidos ? itemSize : { xs: 12 })} key="prog-empty">
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          px: 2,
          height: "100%",
          minHeight: boardMode ? 160 : undefined,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          border: "1px dashed",
          borderColor: alpha(theme.palette.primary.main, 0.35),
          bgcolor: alpha(theme.palette.primary.main, 0.03),
        }}
      >
        {viewExcluidos ? (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1.25 }}>
              Lixeira vazia
            </Typography>
            <Button variant="outlined" startIcon={<RestoreFromTrashIcon />} onClick={() => setViewExcluidos(false)}>
              Voltar aos ativos
            </Button>
          </>
        ) : (
          <>
            <Chip
              label="Programa"
              size="small"
              sx={{
                mb: 1,
                height: 22,
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
              }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1.25 }}>
              Nenhum programa ainda
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
              Criar programa
            </Button>
          </>
        )}
      </Box>
    </Grid>
  );

  const overlays = (
    <>
      {programas.length > 0 && !viewExcluidos && !boardMode && (
        <Fab
          color="primary"
          aria-label="add"
          size="medium"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            borderRadius: 1.5,
            background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: 3,
          }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </>
  );

  const modals = (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} PaperProps={{ sx: { borderRadius: 1, minWidth: 200 } }}>
        {!viewExcluidos && [
          <MenuItem
            key="edit"
            onClick={() => {
              if (selectedPrograma) {
                handleCloseMenu();
                const path = selectedPrograma.slug ? `/programas/${selectedPrograma.slug}` : `/programas/${selectedPrograma.id}`;
                router.push(path);
              }
            }}
            sx={{ py: 1.5 }}
          >
            <EditIcon sx={{ mr: 2 }} fontSize="small" />
            Editar
          </MenuItem>,
          <MenuItem key="trash" onClick={() => selectedPrograma && handleDeletePrograma(selectedPrograma.id)} sx={{ py: 1.5, color: "warning.main" }}>
            <DeleteSweepIcon sx={{ mr: 2 }} fontSize="small" />
            Mover para lixeira
          </MenuItem>,
        ]}
        {viewExcluidos &&
          selectedPrograma && [
            <MenuItem key="restore" onClick={() => handleRestorePrograma(selectedPrograma.id)} sx={{ py: 1.5, color: "success.main" }}>
              <RestoreIcon sx={{ mr: 2 }} fontSize="small" />
              Restaurar
            </MenuItem>,
            <MenuItem key="permanent" onClick={() => handleDeletePermanent(selectedPrograma.id)} sx={{ py: 1.5, color: "error.main" }}>
              <DeleteIcon sx={{ mr: 2 }} fontSize="small" />
              Excluir definitivamente
            </MenuItem>,
          ]}
      </Menu>

      <CriarProgramaWizard
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        orgaos={orgaos}
        empresas={empresas}
        onCreated={async (programaId, slug) => {
          try {
            const list = await dataService.fetchProgramasForCurrentUser(false);
            setProgramas(list || []);
          } catch {
            /* ignore */
          }
          setToastMessage("Programa criado com sucesso");
          setToastSeverity("success");
          router.push(`/programas/${slug || programaId}`);
        }}
      />

      <Snackbar open={!!toastMessage} autoHideDuration={6000} onClose={() => setToastMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 1 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );

  if (boardMode) {
    return (
      <>
        {programas.length === 0 ? emptyProgramas : programaCards}
        {overlays}
        {modals}
      </>
    );
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
          {viewExcluidos ? "Lixeira" : "Programas"}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {!viewExcluidos && (
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
              Novo
            </Button>
          )}
          <Button
            variant={viewExcluidos ? "contained" : "outlined"}
            size="small"
            startIcon={viewExcluidos ? <RestoreFromTrashIcon /> : <DeleteSweepIcon />}
            onClick={() => setViewExcluidos(!viewExcluidos)}
          >
            {viewExcluidos ? "Ativos" : "Lixeira"}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={1.5}>
        {programas.length === 0 ? emptyProgramas : programaCards}
      </Grid>

      {overlays}
      {modals}
    </Box>
  );
}
