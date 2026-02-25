"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  TextField,
  Button,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useGetIdentity, useUpdatePassword } from "@refinedev/core";
import { SelectWithAdd } from "@/components/common/SelectWithAdd";

type IUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
};

type Profile = {
  user_id: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  cargo_id?: number | null;
  departamento_id?: number | null;
  verified?: boolean;
};

export default function PerfilPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data: user, isLoading } = useGetIdentity<IUser>();
  const { mutate: updatePassword, isPending: isUpdating } = useUpdatePassword();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargoId, setCargoId] = useState<number | "">("");
  const [departamentoId, setDepartamentoId] = useState<number | "">("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await fetch("/api/profiles");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data) {
            setNome(data.nome || user.name || "");
            setTelefone(data.telefone || "");
            setCargoId(data.cargo_id ?? "");
            setDepartamentoId(data.departamento_id ?? "");
          } else {
            setNome(user.name || "");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome || null,
          telefone: telefone || null,
          cargo_id: cargoId || null,
          departamento_id: departamentoId || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        const err = await res.json();
        setProfileError(err.error || "Erro ao salvar");
      }
    } catch (err) {
      setProfileError("Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    updatePassword(
      { password },
      {
        onSuccess: () => {
          setPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  const displayName = nome || user?.name || user?.email || "";
  const displayEmail = user?.email || profile?.email || "";

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: "bold",
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          mb: 3,
        }}
      >
        Perfil e Configurações
      </Typography>

      <Stack spacing={3}>
        {/* Dados pessoais */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {displayName}
              </Typography>
              {displayEmail && (
                <Typography variant="body2" color="text.secondary">
                  {displayEmail}
                </Typography>
              )}
              {profile?.verified !== undefined && (
                <Chip
                  label={profile.verified ? "Verificado" : "Não verificado"}
                  size="small"
                  color={profile.verified ? "success" : "default"}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>
          </Box>

          <form onSubmit={handleSaveProfile}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Editar dados
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={profileLoading}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                disabled={profileLoading}
                placeholder="(00) 00000-0000"
              />
              <SelectWithAdd
                label="Cargo"
                value={cargoId}
                onChange={(id) => setCargoId(typeof id === "number" ? id : id === "" ? "" : Number(id) || "")}
                fetchUrl="/api/cargos"
                createUrl="/api/cargos"
                addDialogTitle="Novo cargo"
                addFieldLabel="Nome do cargo"
              />
              <SelectWithAdd
                label="Departamento"
                value={departamentoId}
                onChange={(id) => setDepartamentoId(typeof id === "number" ? id : id === "" ? "" : Number(id) || "")}
                fetchUrl="/api/departamentos"
                createUrl="/api/departamentos"
                addDialogTitle="Novo departamento"
                addFieldLabel="Nome do departamento"
              />
              {profileError && (
                <Typography color="error" variant="body2">
                  {profileError}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={savingProfile || profileLoading}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {savingProfile ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Salvar dados"
                )}
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Alterar senha */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            background: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <LockIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Alterar senha
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                error={!!error}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label="Confirmar nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                error={!!error}
                helperText={error}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isUpdating}
                sx={{
                  mt: 1,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {isUpdating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Salvar nova senha"
                )}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Esqueceu sua senha?{" "}
          <Box
            component="a"
            href="/forgot-password"
            sx={{
              color: "primary.main",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Recuperar acesso
          </Box>
        </Typography>
      </Stack>
    </Container>
  );
}
