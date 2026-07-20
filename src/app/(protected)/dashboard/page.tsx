"use client";

import React, { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
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
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AssignmentIcon,
  WbTwilight as SunriseIcon,
  WbSunny as SunIcon,
  DarkMode as MoonIcon,
  Star as StarIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  CloudUpload as CloudUploadIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { useGetIdentity } from "@refinedev/core";
import * as dataService from "@/lib/services/dataService";
import { Programa } from "@/lib/types/types";
import { ProgramasSection } from "@/components/dashboard/ProgramasSection";
import { DashboardOperacionalSection } from "@/components/dashboard/DashboardOperacionalSection";
import { PerfilContent } from "@/components/perfil/PerfilContent";

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
  const [profile, setProfile] = useState<{
    nome?: string | null;
    email?: string | null;
    telefone?: string | null;
    avatar_url?: string | null;
    cargo?: { nome: string } | null;
    departamento?: { nome: string } | null;
  } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [empresas, setEmpresas] = useState<dataService.EmpresaRow[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    if (!user) return;
    fetch("/api/profiles", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data))
      .catch(() => {});
  }, [user]);

  const userName = useMemo(() => {
    if (profile?.nome) {
      const primeiro = profile.nome.trim().split(/\s+/)[0];
      return primeiro || profile.nome;
    }
    const n = (user?.name ?? user?.email ?? "").trim();
    if (!n) return "";
    if (n.includes("@")) return n.slice(0, n.indexOf("@"));
    const primeiroNome = n.split(/\s+/)[0];
    return primeiroNome || n;
  }, [profile?.nome, user?.name, user?.email]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/profiles/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.avatar_url) {
        setProfile((p) => (p ? { ...p, avatar_url: data.avatar_url } : { avatar_url: data.avatar_url }));
        setToastMessage("Foto atualizada");
        setToastSeverity("success");
      } else {
        setToastMessage(data?.error || "Erro ao enviar foto");
        setToastSeverity("error");
      }
    } catch {
      setToastMessage("Erro ao enviar foto");
      setToastSeverity("error");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const greetingIcon = useMemo(() => {
    switch (greeting.kind) {
      case "manha":
        return <SunriseIcon sx={{ fontSize: "clamp(72px, 12vw, 120px)" }} />;
      case "tarde":
        return <SunIcon sx={{ fontSize: "clamp(72px, 12vw, 120px)" }} />;
      case "noite":
        return (
          <Box sx={{ position: "relative", display: "inline-flex", fontSize: "clamp(72px, 12vw, 120px)" }}>
            <MoonIcon sx={{ fontSize: "1em" }} />
            <StarIcon sx={{ position: "absolute", top: "8%", right: "12%", fontSize: "0.22em", opacity: 0.9 }} />
          </Box>
        );
    }
  }, [greeting.kind]);

  const greetingBg = useMemo(() => {
    const dark = theme.palette.mode === "dark";
    switch (greeting.kind) {
      case "manha":
        return {
          bgcolor: dark ? alpha("#0A2744", 0.55) : alpha("#E8F1F8", 0.95),
          borderColor: alpha("#1565C0", dark ? 0.28 : 0.14),
          backgroundImage: dark
            ? "linear-gradient(125deg, rgba(33,150,243,0.14) 0%, transparent 60%)"
            : "linear-gradient(125deg, #E8F1F8 0%, rgba(255,255,255,0.75) 60%)",
        };
      case "tarde":
        return {
          bgcolor: dark ? alpha("#0A2744", 0.55) : alpha("#FFF8E1", 0.9),
          borderColor: alpha("#F9A825", dark ? 0.28 : 0.2),
          backgroundImage: dark
            ? "linear-gradient(125deg, rgba(249,168,37,0.12) 0%, transparent 60%)"
            : "linear-gradient(125deg, #FFF8E1 0%, rgba(255,255,255,0.8) 60%)",
        };
      case "noite":
        return {
          bgcolor: dark ? alpha("#061525", 0.75) : alpha("#0A2744", 0.06),
          borderColor: alpha("#1565C0", dark ? 0.32 : 0.14),
          backgroundImage: dark
            ? "linear-gradient(125deg, rgba(10,39,68,0.95) 0%, rgba(6,21,37,0.45) 70%)"
            : "linear-gradient(125deg, rgba(10,39,68,0.07) 0%, #E8F1F8 65%)",
        };
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
  const [openPerfilDialog, setOpenPerfilDialog] = useState(false);

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
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          mb: 2,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          borderRadius: 2,
          px: 2,
          py: 1.25,
          border: "1px solid",
          ...greetingBg,
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.palette.text.primary,
              opacity: theme.palette.mode === "dark" ? 0.08 : 0.1,
              pointerEvents: "none",
              lineHeight: 0,
            }}
            aria-hidden
          >
            {greetingIcon}
          </Box>
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "text.primary",
              lineHeight: 1.2,
            }}
          >
            {greeting.label}
            {userName ? `, ${userName}` : ""}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.35 }}>
            {(profile?.email || user?.email) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <EmailIcon sx={{ fontSize: 13 }} />
                {profile?.email || user?.email}
              </Typography>
            )}
            {profile?.cargo?.nome && (
              <Chip label={profile.cargo.nome} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />
            )}
            {profile?.departamento?.nome && (
              <Chip label={profile.departamento.nome} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.68rem" }} />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box
            component="label"
            sx={{
              position: "relative",
              cursor: avatarUploading ? "wait" : "pointer",
              display: "block",
            }}
          >
            <Avatar
              src={profile?.avatar_url ?? undefined}
              sx={{
                width: 44,
                height: 44,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.28)}`,
              }}
            >
              {userName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <IconButton
              component="span"
              size="small"
              sx={{
                position: "absolute",
                bottom: -3,
                right: -3,
                width: 22,
                height: 22,
                bgcolor: theme.palette.background.paper,
                boxShadow: 1,
                "&:hover": { bgcolor: theme.palette.background.paper },
              }}
              disabled={avatarUploading}
            >
              {avatarUploading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <CloudUploadIcon sx={{ fontSize: 12 }} />
              )}
            </IconButton>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
              disabled={avatarUploading}
            />
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenPerfilDialog(true)}
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          >
            Perfil
          </Button>
          <Button
            component={NextLink}
            href="/referencias/lgpd"
            size="small"
            variant="text"
            startIcon={<MenuBookIcon />}
            sx={{ borderRadius: 1.5, fontWeight: 600, display: { xs: "none", sm: "inline-flex" } }}
          >
            LGPD
          </Button>
        </Box>
      </Box>

      <DashboardOperacionalSection />

      {/* Programas — Suspense: useSearchParams em ProgramasSection (abrir criação via ?novoPrograma=1) */}
      <Suspense fallback={<Box sx={{ minHeight: 160 }} />}>
        <ProgramasSection />
      </Suspense>
      {/* Empresas */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1.25 }}>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.015em" }}>
            Empresas
          </Typography>
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateEmpresa} sx={{ borderRadius: 1.5 }}>
            Nova empresa
          </Button>
        </Box>
        {loading ? (
          <Grid container spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ p: 1.5 }}>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={18} sx={{ mt: 0.5 }} />
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : empresas.length === 0 ? (
          <Card
            sx={{
              p: 2.5,
              textAlign: "center",
              border: "1px dashed",
              borderColor: alpha(theme.palette.primary.main, 0.35),
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
              Nenhuma empresa ainda.
            </Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleOpenCreateEmpresa} sx={{ borderRadius: 1.5 }}>
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
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      "&:hover": { boxShadow: 1 },
                    }}
                  >
                    <CardContent sx={{ flex: 1, py: 1.25, px: 1.5, "&:last-child": { pb: 1.25 } }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, lineHeight: 1.25 }}>
                          {empresa.nome_fantasia || empresa.razao_social || `Empresa #${empresa.id}`}
                        </Typography>
                        <IconButton size="small" aria-label="Menu empresa" onClick={(e) => handleEmpresaMenuOpen(e, empresa)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatCnpj(empresa.cnpj)}
                      </Typography>
                      <Chip
                        icon={<AssignmentIcon sx={{ fontSize: 14 }} />}
                        label={`${programasVinculados.length} prog.`}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.75, height: 22, fontSize: "0.68rem" }}
                      />
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

      {/* Dialog Perfil e Configurações */}
      <Dialog
        open={openPerfilDialog}
        onClose={() => {
          setOpenPerfilDialog(false);
          if (user) {
            fetch("/api/profiles", { credentials: "include" })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => setProfile(data))
              .catch(() => {});
          }
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            Perfil e Configurações
          </Typography>
          <IconButton size="small" onClick={() => setOpenPerfilDialog(false)} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <PerfilContent compact />
        </DialogContent>
      </Dialog>

      <Snackbar open={!!toastMessage} autoHideDuration={6000} onClose={() => setToastMessage(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setToastMessage(null)} severity={toastSeverity} sx={{ borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>


    </Container>
  );
}
