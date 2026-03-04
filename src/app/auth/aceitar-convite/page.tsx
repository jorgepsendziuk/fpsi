"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import Image from "next/image";
import { supabaseBrowserClient } from "@utils/supabase/client";

export default function AceitarConvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<{
    email: string;
    programaNome: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginUrl = token ? `/login?redirect=${encodeURIComponent(`/auth/aceitar-convite?token=${token}`)}` : "/login";

  const redirectToPrograma = (data: { programaSlug?: string; programaId?: number }) => {
    router.push(
      data.programaSlug ? `/programas/${data.programaSlug}` : data.programaId ? `/programas/${data.programaId}` : "/dashboard"
    );
  };

  const acceptInvite = async (onForm = false): Promise<boolean> => {
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (res.ok) {
      redirectToPrograma(data);
      return true;
    }
    const msg = data.error || "Erro ao aceitar convite";
    if (onForm) setFormError(msg);
    else setError(msg);
    return false;
  };

  useEffect(() => {
    if (!token) {
      setError("Link inválido");
      setLoading(false);
      return;
    }

    const run = async () => {
      try {
        const res = await fetch(`/api/invites/validate?token=${token}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Convite inválido ou expirado");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setInvite({
          email: data.email,
          programaNome: data.programaNome,
          role: data.role,
        });

        const { data: { user } } = await supabaseBrowserClient.auth.getUser();
        if (user) {
          const userEmail = (user.email || "").trim().toLowerCase();
          const inviteEmail = (data.email || "").trim().toLowerCase();
          if (userEmail === inviteEmail) {
            setAccepting(true);
            const ok = await acceptInvite(false);
            if (!ok) setAccepting(false);
            return;
          }
          setError("O e-mail da sua conta não corresponde ao convite. Faça login com o e-mail correto.");
        }
      } catch (err) {
        setError("Erro ao validar convite");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!password || !confirmPassword) {
      setFormError("Preencha a senha e confirmação.");
      return;
    }
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    setAccepting(true);
    try {
      const { data: signUpData, error: signUpError } = await supabaseBrowserClient.auth.signUp({
        email: invite!.email,
        password,
      });

      if (signUpError) {
        setFormError(signUpError.message || "Erro ao criar conta");
        setAccepting(false);
        return;
      }

      if (signUpData?.session) {
        await supabaseBrowserClient.auth.setSession(signUpData.session);
      }

      const ok = await acceptInvite(true);
      if (!ok) setAccepting(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar conta");
      setAccepting(false);
    }
  };

  if (loading || accepting) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !invite) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Image src="/logo_p.png" alt="FPSI" width={80} height={80} style={{ marginBottom: 16 }} />
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || "Convite inválido"}
          </Alert>
          <Button href={loginUrl} variant="contained">
            Ir para o Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Image src="/logo_p.png" alt="FPSI" width={80} height={80} style={{ marginBottom: 16 }} />
          <Typography variant="h5" fontWeight="bold">
            Aceitar convite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Você foi convidado para <strong>{invite.programaNome}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            E-mail: {invite.email}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Defina sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              error={!!formError}
              helperText={formError}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={accepting}
              fullWidth
            >
              {accepting ? <CircularProgress size={24} /> : "Criar conta e aceitar"}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
          Já tem conta?{" "}
          <Box component="a" href={loginUrl} sx={{ color: "primary.main", textDecoration: "none" }}>
            Fazer login
          </Box>
        </Typography>
      </Paper>
    </Container>
  );
}
