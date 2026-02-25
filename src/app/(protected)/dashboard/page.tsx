"use client";

import React, { useEffect, useState, useMemo } from "react";
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
  Divider,
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
  Person as PersonIcon,
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  WbTwilight as SunriseIcon,
  WbSunny as SunIcon,
  DarkMode as MoonIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useGetIdentity } from "@refinedev/core";
import * as dataService from "@/lib/services/dataService";
import { Programa } from "@/lib/types/types";
import { ProgramasSection } from "@/components/dashboard/ProgramasSection";

type GreetingKind = "manha" | "tarde" | "noite";

function getGreeting(): { label: string; kind: GreetingKind } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { label: "Bom dia", kind: "manha" };
  if (h >= 12 && h < 18) return { label: "Boa tarde", kind: "tarde" };
  return { label: "Boa noite", kind: "noite" };
}

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
  const { data: user } = useGetIdentity<{ name?: string; email?: string }>();
  const [profileNome, setProfileNome] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<dataService.EmpresaRow[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    if (!user) return;
    fetch("/api/profiles", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.nome) setProfileNome(data.nome.trim());
      })
      .catch(() => {});
  }, [user]);

  const userName = useMemo(() => {
    if (profileNome) {
      const primeiro = profileNome.split(/\s+/)[0];
      return primeiro || profileNome;
    }
    const n = (user?.name ?? user?.email ?? "").trim();
    if (!n) return "";
    if (n.includes("@")) return n.slice(0, n.indexOf("@"));
    const primeiroNome = n.split(/\s+/)[0];
    return primeiroNome || n;
  }, [profileNome, user?.name, user?.email]);

  const greetingIcon = useMemo(() => {
    switch (greeting.kind) {
      case "manha":
        return <SunriseIcon sx={{ fontSize: "clamp(180px, 28vw, 320px)" }} />;
      case "tarde":
        return <SunIcon sx={{ fontSize: "clamp(180px, 28vw, 320px)" }} />;
      case "noite":
        return (
          <Box sx={{ position: "relative", display: "inline-flex", fontSize: "clamp(180px, 28vw, 320px)" }}>
            <MoonIcon sx={{ fontSize: "1em" }} />
            <StarIcon sx={{ position: "absolute", top: "8%", right: "12%", fontSize: "0.22em", opacity: 0.9 }} />
            <StarIcon sx={{ position: "absolute", bottom: "15%", left: "8%", fontSize: "0.14em", opacity: 0.7 }} />
          </Box>
        );
    }
  }, [greeting.kind]);

  const greetingBg = useMemo(() => {
    const soft = theme.palette.mode === "dark" ? 0.08 : 0.12;
    switch (greeting.kind) {
      case "manha":
        return { bgcolor: alpha("#E65100", soft), borderColor: alpha("#FF9800", 0.15) };
      case "tarde":
        return { bgcolor: alpha("#F9A825", soft), borderColor: alpha("#FFC107", 0.2) };
      case "noite":
        return { bgcolor: alpha("#283593", soft), borderColor: alpha("#5C6BC0", 0.2) };
    }
  }, [greeting.kind, theme.palette.mode]);
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

  useEffect(() => {
    const t = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(t);
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

  const programasPorEmpresa = programas.reduce((acc, p) => {
    const eid = p.empresa_id ?? "sem_empresa";
    if (!acc[eid]) acc[eid] = [];
    acc[eid].push(p);
    return acc;
  }, {} as Record<string | number, Programa[]>);

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
    const { data, error } = await dataService.createEmpresaViaApi({
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
    const { data, error } = await dataService.updateEmpresaViaApi(editingEmpresa.id, {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 5,
          position: "relative",
          overflow: "hidden",
          minHeight: 120,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRadius: 3,
          px: 3,
          py: 2.5,
          border: "1px solid",
          ...greetingBg,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: "50%",
            transform: "translateY(-50%)",
            color: theme.palette.text.primary,
            opacity: theme.palette.mode === "dark" ? 0.06 : 0.09,
            pointerEvents: "none",
            lineHeight: 0,
          }}
          aria-hidden
        >
          {greetingIcon}
        </Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            position: "relative",
            zIndex: 1,
            fontWeight: "bold",
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 0.5,
          }}
        >
          {greeting.label}
          {userName ? `, ${userName}` : ""}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ position: "relative", zIndex: 1 }}>
          Gerencie seu perfil, empresas e programas de diagnóstico.
        </Typography>
      </Box>

      {/* Perfil e Configurações */}
      <Box sx={{ mb: 5 }}>
        <Card
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PersonIcon sx={{ fontSize: 32, color: "primary.main" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Perfil e Configurações
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Edite nome, telefone, cargo, departamento e altere sua senha.
                </Typography>
              </Box>
            </Box>
            <CardActions sx={{ p: 0 }}>
              <Button
                variant="contained"
                startIcon={<SettingsIcon />}
                onClick={() => router.push("/perfil")}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Abrir Perfil
              </Button>
            </CardActions>
          </CardContent>
        </Card>
      </Box>

      {/* Programas */}
      <ProgramasSection />
      {/* Empresas */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
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
              Empresas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie e edite empresas para vincular aos programas.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateEmpresa} sx={{ borderRadius: 2, textTransform: "none" }}>
            Criar empresa
          </Button>
        </Box>
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ p: 2 }}>
                  <Skeleton variant="text" width="70%" height={28} />
                  <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 1 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : empresas.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: "center",
              border: "2px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.3),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <BusinessIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Nenhuma empresa cadastrada. Crie uma empresa para vincular a um programa ou use &quot;empresa existente&quot; ao criar um programa.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateEmpresa} sx={{ borderRadius: 2, textTransform: "none" }}>
              Criar primeira empresa
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {empresas.map((empresa) => {
              const programasVinculados = programasPorEmpresa[empresa.id] || [];
              return (
                <Grid item xs={12} sm={6} md={4} key={empresa.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": { boxShadow: 2 },
                    }}
                  >
                    <CardContent sx={{ flex: 1, pb: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {empresa.nome_fantasia || empresa.razao_social || `Empresa #${empresa.id}`}
                        </Typography>
                        <IconButton size="small" aria-label="Menu empresa" onClick={(e) => handleEmpresaMenuOpen(e, empresa)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {empresa.razao_social && empresa.razao_social !== (empresa.nome_fantasia || "") && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {empresa.razao_social}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        CNPJ: {formatCnpj(empresa.cnpj)}
                      </Typography>
                      {empresa.email && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {empresa.email}
                        </Typography>
                      )}
                      <Box sx={{ mt: 1.5 }}>
                        <Chip
                          icon={<AssignmentIcon sx={{ fontSize: 16 }} />}
                          label={`${programasVinculados.length} programa(s) vinculado(s)`}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                        {programasVinculados.length > 0 && (
                          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                            {programasVinculados.slice(0, 3).map((p: Programa) => (
                              <Chip
                                key={p.id}
                                label={p.nome || p.nome_fantasia || `Programa #${p.id}`}
                                size="small"
                                onClick={() => p.slug && router.push(`/programas/${p.slug}`)}
                                sx={{ cursor: "pointer", maxWidth: "100%" }}
                              />
                            ))}
                            {programasVinculados.length > 3 && (
                              <Chip label={`+${programasVinculados.length - 3}`} size="small" variant="outlined" />
                            )}
                          </Stack>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
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

        <Menu anchorEl={empresaMenuAnchor} open={Boolean(empresaMenuAnchor)} onClose={handleEmpresaMenuClose} PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}>
          <MenuItem onClick={handleOpenEditEmpresa}>
            <EditIcon sx={{ mr: 2 }} fontSize="small" />
            Editar
          </MenuItem>
          <MenuItem onClick={handleRequestDeleteEmpresa} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 2 }} fontSize="small" />
            Excluir
          </MenuItem>
        </Menu>
      </Box>

      {/* Dialog Criar Empresa */}
      <Dialog open={openCreateEmpresa} onClose={() => !savingEmpresa && setOpenCreateEmpresa(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenCreateEmpresa(false)} disabled={savingEmpresa}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveCreateEmpresa} disabled={savingEmpresa}>{savingEmpresa ? "Salvando…" : "Criar"}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar Empresa */}
      <Dialog open={openEditEmpresa} onClose={() => !savingEmpresa && setOpenEditEmpresa(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
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
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpenEditEmpresa(false)} disabled={savingEmpresa}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveEditEmpresa} disabled={savingEmpresa}>{savingEmpresa ? "Salvando…" : "Salvar"}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirmar exclusão */}
      <Dialog open={deleteConfirmOpen} onClose={() => !deletingEmpresa && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Excluir empresa?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {empresaToDelete
              ? `A empresa "${empresaToDelete.nome_fantasia || empresaToDelete.razao_social || `#${empresaToDelete.id}`}" será excluída. Só é possível excluir se não houver programas vinculados a ela.`
              : ""}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deletingEmpresa}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDeleteEmpresa} disabled={deletingEmpresa}>{deletingEmpresa ? "Excluindo…" : "Excluir"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toastMessage} autoHideDuration={6000} onClose={() => setToastMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>


    </Container>
  );
}
