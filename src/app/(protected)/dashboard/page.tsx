"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  useTheme,
  alpha,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  DeleteSweep as DeleteSweepIcon,
  RestoreFromTrash as RestoreFromTrashIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { Programa } from "@/lib/types/types";
import { ProgramasSection } from "@/components/dashboard/ProgramasSection";
import { DashboardOperacionalSection } from "@/components/dashboard/DashboardOperacionalSection";
import { landing } from "@/components/landing/landingTokens";

const EMPRESA_FORM_INITIAL = {
  cnpj: "",
  razao_social: "",
  nome_fantasia: "",
  endereco: "",
  atividade_principal: "",
  gestor_responsavel: "",
  email: "",
  telefone: "",
};

function formatCnpjForInput(cnpj: number | string | null): string {
  if (cnpj == null) return "";
  const s = String(cnpj).replace(/\D/g, "");
  if (s.length !== 14) return String(cnpj);
  return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export default function DashboardPage() {
  const theme = useTheme();
  const [empresas, setEmpresas] = useState<dataService.EmpresaRow[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [programasBoardCount, setProgramasBoardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [empresaMenuAnchor, setEmpresaMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<dataService.EmpresaRow | null>(null);
  const [openCreateEmpresa, setOpenCreateEmpresa] = useState(false);
  const [openEditEmpresa, setOpenEditEmpresa] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<dataService.EmpresaRow | null>(null);
  const [empresaForm, setEmpresaForm] = useState(EMPRESA_FORM_INITIAL);
  const [savingEmpresa, setSavingEmpresa] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<dataService.EmpresaRow | null>(null);
  const [deletingEmpresa, setDeletingEmpresa] = useState(false);
  const [createProgramaRequest, setCreateProgramaRequest] = useState(0);
  const [viewExcluidos, setViewExcluidos] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empresasList, programasList] = await Promise.all([
        dataService.fetchEmpresasForCurrentUser(),
        dataService.fetchProgramasForCurrentUser(false),
      ]);
      setEmpresas(empresasList || []);
      setProgramas(programasList || []);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramasCount = useCallback((n: number) => {
    setProgramasBoardCount(n);
  }, []);

  /** Coluna 50%: um card por linha, largura inteira. */
  const itemSize = useMemo(() => ({ xs: 12, sm: 12, md: 12 }), []);

  const programasPorEmpresa = programas.reduce(
    (acc, p) => {
      const eid = p.empresa_id ?? "sem_empresa";
      if (!acc[eid]) acc[eid] = [];
      acc[eid].push(p);
      return acc;
    },
    {} as Record<string | number, Programa[]>
  );

  const handleEmpresaMenuOpen = (event: React.MouseEvent<HTMLElement>, empresa: dataService.EmpresaRow) => {
    event.stopPropagation();
    setEmpresaMenuAnchor(event.currentTarget);
    setSelectedEmpresa(empresa);
  };

  const handleEmpresaMenuClose = () => {
    setEmpresaMenuAnchor(null);
    setSelectedEmpresa(null);
  };

  const handleOpenCreateEmpresa = () => {
    setEmpresaForm(EMPRESA_FORM_INITIAL);
    setOpenCreateEmpresa(true);
  };

  const openEditEmpresaDialog = (empresa: dataService.EmpresaRow) => {
    setEditingEmpresa(empresa);
    setEmpresaForm({
      cnpj: formatCnpjForInput(empresa.cnpj),
      razao_social: empresa.razao_social || "",
      nome_fantasia: empresa.nome_fantasia || "",
      endereco: empresa.endereco || "",
      atividade_principal: empresa.atividade_principal || "",
      gestor_responsavel: empresa.gestor_responsavel || "",
      email: empresa.email || "",
      telefone: empresa.telefone || "",
    });
    setOpenEditEmpresa(true);
  };

  const handleOpenEditEmpresa = () => {
    if (selectedEmpresa) {
      openEditEmpresaDialog(selectedEmpresa);
      handleEmpresaMenuClose();
    }
  };

  const openDeleteEmpresaConfirm = (empresa: dataService.EmpresaRow) => {
    setEmpresaToDelete(empresa);
    setDeleteConfirmOpen(true);
  };

  const handleSaveCreateEmpresa = async () => {
    setSavingEmpresa(true);
    const { error } = await dataService.createEmpresaViaApi({
      cnpj: empresaForm.cnpj.trim() || null,
      razao_social: empresaForm.razao_social.trim() || null,
      nome_fantasia: empresaForm.nome_fantasia.trim() || null,
      endereco: empresaForm.endereco.trim() || null,
      atividade_principal: empresaForm.atividade_principal.trim() || null,
      gestor_responsavel: empresaForm.gestor_responsavel.trim() || null,
      email: empresaForm.email.trim() || null,
      telefone: empresaForm.telefone.trim() || null,
    });
    setSavingEmpresa(false);
    if (error) {
      setToastMessage(error);
      setToastSeverity("error");
      return;
    }
    setToastMessage("Empresa criada com sucesso.");
    setToastSeverity("success");
    setOpenCreateEmpresa(false);
    loadData();
  };

  const handleSaveEditEmpresa = async () => {
    if (!editingEmpresa) return;
    setSavingEmpresa(true);
    const { error } = await dataService.updateEmpresaViaApi(editingEmpresa.id, {
      cnpj: empresaForm.cnpj.trim() || null,
      razao_social: empresaForm.razao_social.trim() || null,
      nome_fantasia: empresaForm.nome_fantasia.trim() || null,
      endereco: empresaForm.endereco.trim() || null,
      atividade_principal: empresaForm.atividade_principal.trim() || null,
      gestor_responsavel: empresaForm.gestor_responsavel.trim() || null,
      email: empresaForm.email.trim() || null,
      telefone: empresaForm.telefone.trim() || null,
    });
    setSavingEmpresa(false);
    if (error) {
      setToastMessage(error);
      setToastSeverity("error");
      return;
    }
    setToastMessage("Empresa atualizada.");
    setToastSeverity("success");
    setOpenEditEmpresa(false);
    setEditingEmpresa(null);
    loadData();
  };

  const handleRequestDeleteEmpresa = () => {
    if (selectedEmpresa) openDeleteEmpresaConfirm(selectedEmpresa);
    handleEmpresaMenuClose();
  };

  const handleConfirmDeleteEmpresa = async () => {
    if (!empresaToDelete) return;
    setDeletingEmpresa(true);
    const { success, error } = await dataService.deleteEmpresaViaApi(empresaToDelete.id);
    setDeletingEmpresa(false);
    setDeleteConfirmOpen(false);
    setEmpresaToDelete(null);
    if (!success) {
      setToastMessage(error || "Erro ao excluir");
      setToastSeverity("error");
      return;
    }
    setToastMessage("Empresa excluída.");
    setToastSeverity("success");
    loadData();
  };

  const formatCnpj = (cnpj: number | string | null) => {
    if (cnpj == null) return "—";
    const s = String(cnpj).replace(/\D/g, "");
    if (s.length !== 14) return String(cnpj);
    return s.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%",
        maxWidth: "100%",
        py: { xs: 1.25, md: 1.5 },
        px: { xs: 1.25, sm: 1.5, md: 2, lg: 2.5, xl: 3 },
      }}
    >
      <DashboardOperacionalSection
        left={({ programasOps }) => (
          <Card
            elevation={0}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 1,
              overflow: "hidden",
              "&::before": {
                content: '""',
                display: "block",
                height: 2,
                background: `linear-gradient(90deg, ${landing.navy} 0%, ${landing.blue} 55%, ${landing.blueBright} 100%)`,
              },
            }}
          >
            <CardContent sx={{ py: 1.25, px: 1.35, "&:last-child": { pb: 1.35 } }}>
              <Box
                data-hint-anchor="dash-programas"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 0.75,
                  mb: 1.15,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.015em" sx={{ fontSize: "0.95rem" }}>
                    {viewExcluidos ? "Lixeira de programas" : "Programas e empresas"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", lineHeight: 1.35 }}>
                    {viewExcluidos
                      ? "Restaure ou exclua definitivamente."
                      : `${programasBoardCount} programa(s) · ${empresas.length} empresa(s)`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {!viewExcluidos && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateProgramaRequest((n) => n + 1)}
                        sx={{ fontWeight: 700, borderRadius: 1, fontSize: "0.8125rem" }}
                      >
                        Programa
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<BusinessIcon />}
                        onClick={handleOpenCreateEmpresa}
                        sx={{ fontWeight: 700, borderRadius: 1, fontSize: "0.8125rem" }}
                      >
                        Empresa
                      </Button>
                    </>
                  )}
                  <Button
                    variant={viewExcluidos ? "contained" : "text"}
                    size="small"
                    startIcon={viewExcluidos ? <RestoreFromTrashIcon /> : <DeleteSweepIcon />}
                    onClick={() => setViewExcluidos((v) => !v)}
                    sx={{ fontWeight: 700, borderRadius: 1, fontSize: "0.8125rem" }}
                  >
                    {viewExcluidos ? "Ativos" : "Lixeira"}
                  </Button>
                </Stack>
              </Box>

              <Grid container spacing={1.25}>
                <Suspense
                  fallback={
                    <>
                      {[1, 2].map((i) => (
                        <Grid item {...itemSize} key={i}>
                          <Card sx={{ height: 220, borderRadius: 1 }}>
                            <CardContent>
                              <Skeleton variant="text" width="70%" height={28} />
                              <Skeleton variant="rectangular" height={72} sx={{ mt: 1, borderRadius: 1 }} />
                              <Skeleton variant="text" width="50%" sx={{ mt: 1 }} />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </>
                  }
                >
                  <ProgramasSection
                    boardMode
                    boardItemSize={itemSize}
                    onCountChange={handleProgramasCount}
                    createOpenRequest={createProgramaRequest}
                    viewExcluidos={viewExcluidos}
                    onViewExcluidosChange={setViewExcluidos}
                    opsByPrograma={programasOps}
                  />
                </Suspense>

                {!viewExcluidos &&
                  (loading ? (
                    [1, 2].map((i) => (
                      <Grid item {...itemSize} key={`emp-sk-${i}`}>
                        <Card sx={{ height: 140, borderRadius: 1 }}>
                          <CardContent>
                            <Skeleton variant="text" width="70%" height={24} />
                            <Skeleton variant="text" width="45%" />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    empresas.map((empresa) => {
                      const programasVinculados = programasPorEmpresa[empresa.id] || [];
                      const empTitle = empresa.nome_fantasia || empresa.razao_social || `Empresa #${empresa.id}`;
                      return (
                        <Grid item {...itemSize} key={`emp-${empresa.id}`}>
                          <Card
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 1,
                              border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                              position: "relative",
                              overflow: "hidden",
                              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                              "&:hover": {
                                borderColor: alpha(theme.palette.secondary.main, 0.4),
                                boxShadow: `0 8px 22px ${alpha(theme.palette.secondary.main, 0.1)}`,
                              },
                              "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 3,
                                bgcolor: "secondary.main",
                              },
                            }}
                          >
                            <CardContent sx={{ py: 1.5, px: 1.75, pl: 2.1, "&:last-child": { pb: 1.25 } }}>
                              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1 }}>
                                <Box
                                  sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 1,
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: alpha(theme.palette.secondary.main, 0.12),
                                    color: "secondary.main",
                                  }}
                                >
                                  <BusinessIcon />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Chip
                                    label="Empresa"
                                    size="small"
                                    sx={{
                                      height: 22,
                                      mb: 0.25,
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      bgcolor: alpha(theme.palette.secondary.main, 0.12),
                                      color: "secondary.main",
                                    }}
                                  />
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.02em", fontSize: "1.05rem" }}>
                                    {empTitle}
                                  </Typography>
                                  {empresa.razao_social && empresa.razao_social !== empTitle && (
                                    <Typography variant="body2" color="text.secondary">
                                      {empresa.razao_social}
                                    </Typography>
                                  )}
                                </Box>
                                <IconButton size="small" aria-label="Menu empresa" onClick={(e) => handleEmpresaMenuOpen(e, empresa)}>
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Box>

                              <Grid container spacing={0.75} sx={{ mb: 1 }}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ py: 0.7, px: 1, borderRadius: 1, bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                                      CNPJ
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                      {formatCnpj(empresa.cnpj)}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ py: 0.7, px: 1, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.divider, 0.8)}` }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                                      Programas vinculados
                                    </Typography>
                                    <Typography variant="body2" fontWeight={700}>
                                      {programasVinculados.length}
                                    </Typography>
                                  </Box>
                                </Grid>
                                {(empresa.email || empresa.telefone) && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                                      {[empresa.email, empresa.telefone].filter(Boolean).join(" · ")}
                                    </Typography>
                                  </Grid>
                                )}
                                {empresa.atividade_principal && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                                      Atividade: {empresa.atividade_principal}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </CardContent>
                            <CardActions sx={{ px: 1.75, pb: 1.35, pt: 0, gap: 0.5 }}>
                              <Button size="small" startIcon={<EditIcon />} onClick={() => openEditEmpresaDialog(empresa)} sx={{ fontWeight: 700 }}>
                                Editar
                              </Button>
                              <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => openDeleteEmpresaConfirm(empresa)} sx={{ fontWeight: 700 }}>
                                Excluir
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })
                  ))}
              </Grid>

              <Menu
                anchorEl={empresaMenuAnchor}
                open={Boolean(empresaMenuAnchor)}
                onClose={handleEmpresaMenuClose}
                PaperProps={{ sx: { borderRadius: 1, minWidth: 180 } }}
              >
                <MenuItem onClick={handleOpenEditEmpresa}>
                  <EditIcon sx={{ mr: 1.5 }} fontSize="small" />
                  Editar
                </MenuItem>
                <MenuItem onClick={handleRequestDeleteEmpresa} sx={{ color: "error.main" }}>
                  <DeleteIcon sx={{ mr: 1.5 }} fontSize="small" />
                  Excluir
                </MenuItem>
              </Menu>
            </CardContent>
          </Card>
        )}
      />

      <Dialog open={openCreateEmpresa} onClose={() => !savingEmpresa && setOpenCreateEmpresa(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Criar empresa</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField fullWidth label="CNPJ" value={empresaForm.cnpj} onChange={(e) => setEmpresaForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            <TextField fullWidth label="Razão social" value={empresaForm.razao_social} onChange={(e) => setEmpresaForm((f) => ({ ...f, razao_social: e.target.value }))} />
            <TextField fullWidth label="Nome fantasia" value={empresaForm.nome_fantasia} onChange={(e) => setEmpresaForm((f) => ({ ...f, nome_fantasia: e.target.value }))} />
            <TextField fullWidth label="Endereço" value={empresaForm.endereco} onChange={(e) => setEmpresaForm((f) => ({ ...f, endereco: e.target.value }))} placeholder="Para ROPA e documentos" />
            <TextField fullWidth label="Atividade principal" value={empresaForm.atividade_principal} onChange={(e) => setEmpresaForm((f) => ({ ...f, atividade_principal: e.target.value }))} />
            <TextField fullWidth label="Gestor responsável" value={empresaForm.gestor_responsavel} onChange={(e) => setEmpresaForm((f) => ({ ...f, gestor_responsavel: e.target.value }))} />
            <TextField fullWidth label="E-mail" type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField fullWidth label="Telefone" value={empresaForm.telefone} onChange={(e) => setEmpresaForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenCreateEmpresa(false)} disabled={savingEmpresa}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveCreateEmpresa} disabled={savingEmpresa}>
            {savingEmpresa ? "Salvando…" : "Criar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditEmpresa} onClose={() => !savingEmpresa && setOpenEditEmpresa(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar empresa</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField fullWidth label="CNPJ" value={empresaForm.cnpj} onChange={(e) => setEmpresaForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            <TextField fullWidth label="Razão social" value={empresaForm.razao_social} onChange={(e) => setEmpresaForm((f) => ({ ...f, razao_social: e.target.value }))} />
            <TextField fullWidth label="Nome fantasia" value={empresaForm.nome_fantasia} onChange={(e) => setEmpresaForm((f) => ({ ...f, nome_fantasia: e.target.value }))} />
            <TextField fullWidth label="Endereço" value={empresaForm.endereco} onChange={(e) => setEmpresaForm((f) => ({ ...f, endereco: e.target.value }))} />
            <TextField fullWidth label="Atividade principal" value={empresaForm.atividade_principal} onChange={(e) => setEmpresaForm((f) => ({ ...f, atividade_principal: e.target.value }))} />
            <TextField fullWidth label="Gestor responsável" value={empresaForm.gestor_responsavel} onChange={(e) => setEmpresaForm((f) => ({ ...f, gestor_responsavel: e.target.value }))} />
            <TextField fullWidth label="E-mail" type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm((f) => ({ ...f, email: e.target.value }))} />
            <TextField fullWidth label="Telefone" value={empresaForm.telefone} onChange={(e) => setEmpresaForm((f) => ({ ...f, telefone: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenEditEmpresa(false)} disabled={savingEmpresa}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveEditEmpresa} disabled={savingEmpresa}>
            {savingEmpresa ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => !deletingEmpresa && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Excluir empresa?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {empresaToDelete
              ? `A empresa "${empresaToDelete.nome_fantasia || empresaToDelete.razao_social || `#${empresaToDelete.id}`}" será excluída. Só é possível excluir se não houver programas vinculados a ela.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deletingEmpresa}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteEmpresa} disabled={deletingEmpresa}>
            {deletingEmpresa ? "Excluindo…" : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={5000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 1 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
