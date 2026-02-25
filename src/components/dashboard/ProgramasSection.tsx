"use client";

import React, { useEffect, useState, useReducer, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Divider,
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

export function ProgramasSection() {
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

  const getMaturityColor = (score: number): string => {
    if (score >= 0.9) return "#2E7D32";
    if (score >= 0.7) return "#388E3C";
    if (score >= 0.5) return "#F9A825";
    if (score >= 0.3) return "#EF6C00";
    return "#C62828";
  };

  type MaturityEntry = { score: number; label: string; byDiagnostico: { diagnostico_id: number; score: number; label: string }[] };
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

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={300} height={48} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 280 }}>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={30} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const diagnosticos = (state.diagnosticos || []).slice(0, 3);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {viewExcluidos ? "Lixeira de programas" : "Programas"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {viewExcluidos ? "Restaurar ou excluir definitivamente." : "Programas de diagnóstico ativos."}
          </Typography>
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
      <Divider sx={{ mb: 3 }} />

      {programas.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderRadius: 4,
            border: "2px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.3),
          }}
        >
          {viewExcluidos ? (
            <>
              <DeleteSweepIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Nenhum programa na lixeira
              </Typography>
              <Button variant="outlined" startIcon={<RestoreFromTrashIcon />} onClick={() => setViewExcluidos(false)}>
                Voltar aos ativos
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Nenhum programa ainda
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Crie seu primeiro programa para começar o diagnóstico.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                Criar programa
              </Button>
            </>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {programas.map((programa) => {
            const maturityData = programaMaturityData.get(programa.id) || { score: 0, label: "Inicial", byDiagnostico: [] };
            const getMaturityEntry = (diagId: number) =>
              maturityData.byDiagnostico.find((d) => d.diagnostico_id === diagId) ?? { score: 0, label: "Inicial" };

            return (
              <Grid item xs={12} sm={6} lg={4} key={programa.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: hoveredCard === programa.id ? 4 : 1,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: programa.setor === 1 ? theme.palette.primary.main : theme.palette.secondary.main,
                    },
                  }}
                  onMouseEnter={() => setHoveredCard(programa.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent sx={{ flex: 1, p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" component="h2" color="primary" sx={{ fontWeight: 600, flex: 1 }}>
                        {programa.nome || programa.nome_fantasia || programa.razao_social || `Programa #${programa.id}`}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="Menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(e, programa);
                        }}
                        sx={{ mt: -0.5, mr: -0.5 }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    {viewExcluidos && programa.deleted_at && (
                      <Chip
                        size="small"
                        label={`Excluído em ${new Date(programa.deleted_at).toLocaleDateString("pt-BR")}`}
                        color="default"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Stack spacing={0.25} sx={{ mb: 1.5 }}>
                      {programa.nome_fantasia && programa.nome_fantasia !== (programa.nome || "") && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {programa.nome_fantasia}
                        </Typography>
                      )}
                      {programa.razao_social && programa.razao_social !== (programa.nome || programa.nome_fantasia || "") && (
                        <Typography variant="subtitle2" color="text.secondary">
                          {programa.razao_social}
                        </Typography>
                      )}
                    </Stack>
                    <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Maturidade
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
                              display: "flex",
                              alignItems: "center",
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
                            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: "2.5rem", textAlign: "right", color }}>
                              {scorePct}%
                            </Typography>
                            <Chip size="small" label={entry.label} sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600, backgroundColor: alpha(color, 0.2), color, border: `1px solid ${alpha(color, 0.5)}` }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ px: 2.5, pb: 2, pt: 0 }}>
                    {!viewExcluidos && (
                      <Button variant="contained" fullWidth size="medium" startIcon={<AssessmentIcon />} onClick={() => handleAccessDiagnostico(programa)} sx={{ py: 1.25 }}>
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

      {programas.length > 0 && !viewExcluidos && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            width: 56,
            height: 56,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: 4,
            "&:hover": { boxShadow: 8 },
          }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}>
        {!viewExcluidos && [
          <MenuItem key="edit" onClick={() => {}} sx={{ py: 1.5 }}>
            <EditIcon sx={{ mr: 2, color: "text.secondary" }} fontSize="small" />
            Editar (em breve)
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

      <Dialog open={openDialog} onClose={() => !creating && setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Image src="/logo_p.png" alt="FPSI" width={24} height={24} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Criar Novo Programa
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              required
              label="Nome do programa"
              value={createForm.nome}
              onChange={(e) => setCreateForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex.: Secretaria X, E-commerce Brasil"
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de programa</InputLabel>
              <Select value={createForm.tipo_programa} label="Tipo" onChange={(e) => setCreateForm((f) => ({ ...f, tipo_programa: e.target.value }))}>
                {TIPOS_PROGRAMA.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Setor
              </Typography>
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
                  <MenuItem value="">Selecione</MenuItem>
                  {orgaos.map((o) => (
                    <MenuItem key={o.id} value={o.id}>
                      {o.nome || ""} {o.sigla ? `(${o.sigla})` : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Collapse>
            <Collapse in={createForm.setor === 2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Opcional: empresa existente ou nova.
                </Typography>
                <FormControl component="fieldset" sx={{ mb: 1 }}>
                  <RadioGroup
                    row
                    value={createForm.empresa_modo}
                    onChange={(e) => setCreateForm((f) => ({ ...f, empresa_modo: e.target.value as "nova" | "existente", empresa_id: "" }))}
                  >
                    <FormControlLabel value="existente" control={<Radio />} label="Empresa cadastrada" />
                    <FormControlLabel value="nova" control={<Radio />} label="Nova empresa" />
                  </RadioGroup>
                </FormControl>
                {createForm.empresa_modo === "existente" && (
                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                    <InputLabel>Empresa</InputLabel>
                    <Select
                      value={createForm.empresa_id === "" ? "" : createForm.empresa_id}
                      label="Empresa"
                      onChange={(e) => setCreateForm((f) => ({ ...f, empresa_id: e.target.value === "" ? "" : Number(e.target.value) }))}
                    >
                      <MenuItem value="">Selecione</MenuItem>
                      {empresas.map((e) => (
                        <MenuItem key={e.id} value={e.id}>
                          {e.nome_fantasia || e.razao_social || `Empresa #${e.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {createForm.empresa_modo === "nova" && (
                  <Stack spacing={1}>
                    <TextField fullWidth size="small" label="CNPJ" value={createForm.empresa_cnpj} onChange={(e) => setCreateForm((f) => ({ ...f, empresa_cnpj: e.target.value }))} />
                    <TextField fullWidth size="small" label="Razão social" value={createForm.empresa_razao_social} onChange={(e) => setCreateForm((f) => ({ ...f, empresa_razao_social: e.target.value }))} />
                    <TextField fullWidth size="small" label="Nome fantasia" value={createForm.empresa_nome_fantasia} onChange={(e) => setCreateForm((f) => ({ ...f, empresa_nome_fantasia: e.target.value }))} />
                    <TextField fullWidth size="small" label="E-mail" type="email" value={createForm.empresa_email} onChange={(e) => setCreateForm((f) => ({ ...f, empresa_email: e.target.value }))} />
                    <TextField fullWidth size="small" label="Telefone" value={createForm.empresa_telefone} onChange={(e) => setCreateForm((f) => ({ ...f, empresa_telefone: e.target.value }))} />
                  </Stack>
                )}
              </Box>
            </Collapse>
            <TextField fullWidth multiline minRows={2} label="Descrição do escopo" value={createForm.descricao_escopo} onChange={(e) => setCreateForm((f) => ({ ...f, descricao_escopo: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenDialog(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button onClick={handleCreatePrograma} variant="contained" disabled={creating} sx={{ borderRadius: 2, px: 3 }}>
            {creating ? "Criando…" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toastMessage} autoHideDuration={6000} onClose={() => setToastMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
