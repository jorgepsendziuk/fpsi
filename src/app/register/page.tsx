"use client";

import {
  Box,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Link,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  alpha,
  keyframes,
  LinearProgress,
} from "@mui/material";
import {
  DarkModeOutlined,
  LightModeOutlined,
  CheckCircleOutline,
  AssignmentOutlined,
  PolicyOutlined,
  GroupsOutlined,
  VerifiedUserOutlined,
  Google,
} from "@mui/icons-material";
import { ColorModeContext } from "@contexts/color-mode";
import { useContext, useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NextLink from "next/link";
import { supabaseBrowserClient } from "@utils/supabase/client";

type IUser = {
  id: string;
  email: string;
  name?: string;
};

type Step = "form" | "validating" | "ready";

const BENEFITS = [
  {
    icon: <AssignmentOutlined fontSize="small" />,
    title: "Diagnóstico PPSI 2.0",
    text: "Avalie maturidade em privacidade, segurança e governança — com evidências e plano de trabalho.",
  },
  {
    icon: <PolicyOutlined fontSize="small" />,
    title: "Políticas e conformidade",
    text: "Modelos, ROPA, RIPD, incidentes e portal do titular alinhados à LGPD.",
  },
  {
    icon: <GroupsOutlined fontSize="small" />,
    title: "Equipe e governança",
    text: "Papéis, permissões e responsabilidades do programa em um só lugar.",
  },
  {
    icon: <VerifiedUserOutlined fontSize="small" />,
    title: "Referências oficiais",
    text: "Consulta rápida a LGPD, PPSI e Governança de IA com links confiáveis.",
  },
];

const VALIDATE_STEPS = [
  "Criando sua conta com segurança…",
  "Preparando o espaço do programa…",
  "Validando cadastro…",
  "Tudo pronto!",
];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseDot = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.05); }
`;

export default function Register() {
  const theme = useTheme();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user, isLoading } = useGetIdentity<IUser>();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validateIdx, setValidateIdx] = useState(0);
  const [skipAuthRedirect, setSkipAuthRedirect] = useState(false);

  const [oauthLoading, setOauthLoading] = useState(false);

  // Já logado (navegação normal) → painel. Durante o fluxo de cadastro não redireciona.
  useEffect(() => {
    if (user && !isLoading && !skipAuthRedirect && step === "form") {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router, skipAuthRedirect, step]);

  useEffect(() => {
    if (step !== "validating") return;
    setValidateIdx(0);
    const timers: number[] = [];
    VALIDATE_STEPS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setValidateIdx(i);
          if (i === VALIDATE_STEPS.length - 1) {
            window.setTimeout(() => setStep("ready"), 700);
          }
        }, i * 750)
      );
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [step]);

  const handleGoogleSignUp = async () => {
    setError(null);
    setOauthLoading(true);
    setSkipAuthRedirect(true);
    try {
      sessionStorage.setItem("fpsi-just-registered", "1");
    } catch {
      /* ignore */
    }
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;
      const { data, error: oauthError } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) {
        setError(
          oauthError.message ||
            "Não foi possível iniciar o cadastro com Google. Verifique se o provedor está ativo no Supabase."
        );
        setOauthLoading(false);
        setSkipAuthRedirect(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError("Erro ao iniciar cadastro com Google.");
      setOauthLoading(false);
      setSkipAuthRedirect(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar com Google.";
      setError(msg);
      setOauthLoading(false);
      setSkipAuthRedirect(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    setSkipAuthRedirect(true);

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error: signUpError } = await supabaseBrowserClient.auth.signUp({
        email: email.trim(),
        password,
        options: origin
          ? { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}` }
          : undefined,
      });

      if (signUpError) {
        setError(signUpError.message || "Não foi possível criar a conta.");
        setSubmitting(false);
        setSkipAuthRedirect(false);
        return;
      }

      // Sem sessão (confirmação ainda ligada no provedor): tenta login direto.
      if (!data.session) {
        const { error: loginError } = await supabaseBrowserClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) {
          // Conta criada mas login bloqueado — ainda assim mostra o passo e CTA para login
          console.warn("Cadastro ok, login imediato indisponível:", loginError.message);
        }
      }

      if (data.session) {
        await supabaseBrowserClient.auth.setSession(data.session);
      }

      fetch("/api/profiles/verify", { method: "POST" }).catch(() => {});

      try {
        sessionStorage.setItem("fpsi-just-registered", "1");
      } catch {
        /* ignore */
      }

      setSubmitting(false);
      setStep("validating");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao criar a conta.";
      setError(msg);
      setSubmitting(false);
      setSkipAuthRedirect(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading && step === "form" && !skipAuthRedirect) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user && step === "form" && !skipAuthRedirect) {
    return null;
  }

  const progress = ((validateIdx + 1) / VALIDATE_STEPS.length) * 100;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(
          theme.palette.secondary.main,
          0.1
        )} 45%, ${theme.palette.background.default} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        py: { xs: 3, md: 4 },
        px: 2,
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
          <IconButton
            onClick={() => setMode()}
            sx={{
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "background.paper", boxShadow: 4 },
            }}
          >
            {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: step === "form" ? 920 : 480,
          display: "grid",
          gridTemplateColumns: step === "form" ? { xs: "1fr", md: "1.05fr 0.95fr" } : "1fr",
          gap: { xs: 2.5, md: 3 },
          alignItems: "stretch",
          transition: "max-width 0.35s ease",
        }}
      >
        {step === "form" && (
          <Box
            sx={{
              bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.55 : 0.72),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              p: { xs: 2.5, md: 3.5 },
              backdropFilter: "blur(10px)",
              animation: `${fadeIn} 0.45s ease`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Image
                src="/logo_p.png"
                alt="FPSI"
                width={48}
                height={48}
                style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.12))" }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  FPSI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Programa de Privacidade e Segurança da Informação
                </Typography>
              </Box>
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              Por que criar uma conta?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
              Em poucos minutos você monta o espaço da sua organização: diagnóstico PPSI 2.0, evidências,
              políticas e conformidade LGPD — com referências oficiais à mão.
            </Typography>

            <Stack spacing={1.75}>
              {BENEFITS.map((b) => (
                <Stack key={b.title} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      mt: 0.15,
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    {b.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {b.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {b.text}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        <Box
          sx={{
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            p: { xs: 2.5, md: 3.5 },
            boxShadow: theme.palette.mode === "dark" ? 8 : 4,
            animation: `${fadeIn} 0.45s ease`,
          }}
        >
          {step === "form" && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, textAlign: "center" }}>
                Criar nova conta
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: "center" }}>
                Com Google ou e-mail. Você entra no painel em seguida — sem esperar confirmação nesta fase.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                size="large"
                variant="outlined"
                startIcon={oauthLoading ? <CircularProgress size={18} color="inherit" /> : <Google />}
                onClick={handleGoogleSignUp}
                disabled={submitting || oauthLoading}
                sx={{ fontWeight: 700, py: 1.15, mb: 2, textTransform: "none" }}
              >
                Criar conta com Google
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  ou com e-mail
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    disabled={submitting || oauthLoading}
                  />
                  <TextField
                    label="Senha"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    disabled={submitting || oauthLoading}
                    helperText="Mínimo de 6 caracteres"
                  />
                  <TextField
                    label="Confirmar senha"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    fullWidth
                    required
                    disabled={submitting || oauthLoading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting || oauthLoading}
                    sx={{ fontWeight: 700, py: 1.15, mt: 0.5 }}
                  >
                    {submitting ? <CircularProgress size={22} color="inherit" /> : "Criar conta"}
                  </Button>
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: "center" }}>
                Já tem uma conta?{" "}
                <Link component={NextLink} href="/login" underline="hover">
                  Fazer login
                </Link>
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", mt: 1.5, lineHeight: 1.5 }}
              >
                Ao criar a conta, você confirma que leu o{" "}
                <Link component={NextLink} href="/privacidade" underline="hover">
                  aviso de privacidade
                </Link>
                . No primeiro acesso ao painel, o aceite é registrado na plataforma.
              </Typography>
            </>
          )}

          {step === "validating" && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  animation: `${pulseDot} 1.4s ease-in-out infinite`,
                }}
              >
                <CircularProgress size={32} thickness={4} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Validando cadastro
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 24 }}>
                {VALIDATE_STEPS[validateIdx]}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 6, borderRadius: 3, mb: 2 }}
              />
              <Stack spacing={0.75} sx={{ textAlign: "left", maxWidth: 280, mx: "auto" }}>
                {VALIDATE_STEPS.map((label, i) => (
                  <Stack key={label} direction="row" spacing={1} alignItems="center">
                    <CheckCircleOutline
                      sx={{
                        fontSize: 18,
                        color: i <= validateIdx ? "success.main" : "action.disabled",
                        transition: "color 0.3s",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: i <= validateIdx ? "text.primary" : "text.disabled",
                        fontWeight: i === validateIdx ? 700 : 400,
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {step === "ready" && (
            <Box sx={{ textAlign: "center", py: 1.5, animation: `${fadeIn} 0.4s ease` }}>
              <CheckCircleOutline sx={{ fontSize: 56, color: "success.main", mb: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>
                Conta criada com sucesso
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Seu espaço no FPSI está pronto. Entre no painel para criar o primeiro programa e explorar as
                referências LGPD, PPSI e Governança de IA.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={goToDashboard}
                sx={{ fontWeight: 800, py: 1.25 }}
              >
                Entrar no painel
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                Dicas discretas vão aparecer na primeira visita — você pode dispensá-las a qualquer momento.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
