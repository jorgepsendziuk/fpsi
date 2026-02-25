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
import { useRegister } from "@refinedev/core";
import Image from "next/image";

export default function AceitarConvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate: register, isPending: isRegistering } = useRegister();

  const [invite, setInvite] = useState<{
    email: string;
    programaNome: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Link inválido");
      setLoading(false);
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`/api/invites/validate?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setInvite({
            email: data.email,
            programaNome: data.programaNome,
            role: data.role,
          });
        } else {
          const err = await res.json();
          setError(err.error || "Convite inválido ou expirado");
        }
      } catch (err) {
        setError("Erro ao validar convite");
      } finally {
        setLoading(false);
      }
    };

    validate();
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

    register(
      {
        email: invite!.email,
        password,
      },
      {
        onSuccess: async () => {
          const res = await fetch("/api/invites/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          if (res.ok) {
            router.push(data.programaSlug ? `/programas/${data.programaSlug}` : data.programaId ? `/programas/${data.programaId}` : "/programas");
          } else {
            setFormError(data.error || "Erro ao aceitar convite");
          }
        },
        onError: (err: unknown) => {
          setFormError(err instanceof Error ? err.message : "Erro ao criar conta");
        },
      }
    );
  };

  if (loading) {
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
          <Button href="/login" variant="contained">
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
              disabled={isRegistering}
              fullWidth
            >
              {isRegistering ? <CircularProgress size={24} /> : "Criar conta e aceitar"}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
          Já tem conta?{" "}
          <Box component="a" href="/login" sx={{ color: "primary.main", textDecoration: "none" }}>
            Fazer login
          </Box>
        </Typography>
      </Paper>
    </Container>
  );
}
