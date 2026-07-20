"use client";

import React, { Suspense, useEffect, useState } from "react";
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
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { Programa } from "@/lib/types/types";
import { ProgramasSection } from "@/components/dashboard/ProgramasSection";
import { DashboardOperacionalSection } from "@/components/dashboard/DashboardOperacionalSection";

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
  const router = useRouter();
  const theme = useTheme();
  const [empresas, setEmpresas] = useState<dataService.EmpresaRow[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
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
    <Container maxWidth="lg" sx={{ py: { xs: 1.5, md: 2 }, px: { xs: 1.5, sm: 2.5 } }}>
      <DashboardOperacionalSection />

      <Suspense fallback={<Box sx={{ minHeight: 140 }} />}>
        <ProgramasSection />
      </Suspense>

      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 1.25,
          }}
        >
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
            Empresas
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateEmpresa}
            sx={{ borderRadius: 1.5 }}
          >
            Nova empresa
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card elevation={0} sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}` }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={18} sx={{ mt: 0.5 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : empresas.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: "center",
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <BusinessIcon sx={{ fontSize: 36, color: "text.disabled", mb: 0.75 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Nenhuma empresa cadastrada. Crie uma para vincular aos programas.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateEmpresa}
              sx={{ borderRadius: 1.5 }}
            >
              Criar empresa
            </Button>
          </Card>
        ) : (
          <Grid container spacing={1.5}>
            {empresas.map((empresa) => {
              const programasVinculados = programasPorEmpresa[empresa.id] || [];
              return (
                <Grid item xs={12} sm={6} md={4} key={empresa.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.35) },
                    }}
                  >
                    <CardContent sx={{ flex: 1, pb: 0.5, pt: 1.5, px: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, lineHeight: 1.3 }}>
                          {empresa.nome_fantasia || empresa.razao_social || `Empresa #${empresa.id}`}
                        </Typography>
                        <IconButton size="small" aria-label="Menu empresa" onClick={(e) => handleEmpresaMenuOpen(e, empresa)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {empresa.razao_social && empresa.razao_social !== (empresa.nome_fantasia || "") && (
                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                          {empresa.razao_social}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        CNPJ: {formatCnpj(empresa.cnpj)}
                      </Typography>
                      <Chip
                        icon={<AssignmentIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${programasVinculados.length} programa(s)`}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1, height: 22, fontSize: "0.7rem" }}
                      />
                      {programasVinculados.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={0.4} sx={{ mt: 0.75 }}>
                          {programasVinculados.slice(0, 2).map((p: Programa) => (
                            <Chip
                              key={p.id}
                              label={p.nome || p.nome_fantasia || `Programa #${p.id}`}
                              size="small"
                              onClick={() => p.slug && router.push(`/programas/${p.slug}`)}
                              sx={{ cursor: "pointer", maxWidth: "100%", height: 22, fontSize: "0.68rem" }}
                            />
                          ))}
                          {programasVinculados.length > 2 && (
                            <Chip label={`+${programasVinculados.length - 2}`} size="small" variant="outlined" sx={{ height: 22 }} />
                          )}
                        </Stack>
                      )}
                    </CardContent>
                    <CardActions sx={{ px: 1.25, pb: 1, pt: 0 }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEditEmpresaDialog(empresa)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => openDeleteEmpresaConfirm(empresa)}>
                        Excluir
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Menu
          anchorEl={empresaMenuAnchor}
          open={Boolean(empresaMenuAnchor)}
          onClose={handleEmpresaMenuClose}
          PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
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
      </Box>

      <Dialog
        open={openCreateEmpresa}
        onClose={() => !savingEmpresa && setOpenCreateEmpresa(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
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

      <Dialog
        open={openEditEmpresa}
        onClose={() => !savingEmpresa && setOpenEditEmpresa(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
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

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deletingEmpresa && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
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
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
