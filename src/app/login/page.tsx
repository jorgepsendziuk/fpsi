"use client";

import { AuthPage } from "@refinedev/mui";
import {
  Box,
  useTheme,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Link,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import NextLink from "next/link";
import { DarkModeOutlined, LightModeOutlined, Google } from "@mui/icons-material";
import { ColorModeContext } from "@contexts/color-mode";
import { useContext, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import { useAuthTranslation } from "../../hooks/useAuthTranslation";

type IUser = {
  id: string;
  email: string;
  name?: string;
};

export default function Login() {
  const theme = useTheme();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user, isLoading } = useGetIdentity<IUser>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Hook para traduzir textos automaticamente
  useAuthTranslation();

  useEffect(() => {
    if (user && !isLoading) {
      const redirect = searchParams.get("redirect");
      router.push(redirect && redirect.startsWith("/") ? redirect : "/dashboard");
    }
  }, [user, isLoading, router, searchParams]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Se usuário já está autenticado, não mostrar nada (redirect acontecerá)
  if (user) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* Theme Toggle Button */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
          <IconButton
            onClick={() => setMode()}
            sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4
              }
            }}
          >
            {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {searchParams.get("error") === "oauth" && (
          <Alert severity="error" sx={{ maxWidth: 420, mb: 2, mx: "auto" }}>
            {searchParams.get("error_description")?.slice(0, 500) ||
              "Não foi possível concluir o login com Google. Verifique a configuração do projeto no Supabase e no Google Cloud."}
          </Alert>
        )}
        {searchParams.get("error") === "auth" && (
          <Alert severity="error" sx={{ maxWidth: 420, mb: 2, mx: "auto" }}>
            Sessão não pôde ser criada. Tente de novo ou use e-mail e senha.
          </Alert>
        )}
        <AuthPage 
          type="login"
          providers={[
            {
              name: "google",
              label: "Entrar com Google",
              icon: <Google />,
            },
          ]}
          title={
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Image 
                src="/logo_p.png" 
                alt="FPSI Logo" 
                width={80} 
                height={80} 
                style={{ 
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                }}
              />
            </Box>
          }
          wrapperProps={{
            sx: {
              background: 'transparent',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }}
          contentProps={{
            sx: {
              backgroundColor: 'background.paper',
              padding: '2.5rem',
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark' ? 8 : 4,
              maxWidth: '420px',
              width: '100%',
              border: `1px solid ${theme.palette.divider}`,
              backdropFilter: 'blur(10px)'
            }
          }}
          formProps={{
            defaultValues: {
              email: "",
              password: "",
            },
          }}
          forgotPasswordLink={
            <Box 
              component="a" 
              href="/forgot-password" 
              sx={{ 
                color: 'primary.main', 
                textDecoration: 'none', 
                fontSize: '0.875rem',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Esqueceu a senha?
            </Box>
          }
          registerLink={
            <Box sx={{ width: "100%", mt: 0.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  my: 2,
                }}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  Novo por aqui?
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>
              <Button
                component={NextLink}
                href="/register"
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  fontWeight: 700,
                  py: 1.25,
                  boxShadow: 2,
                  "&:hover": { boxShadow: 4 },
                }}
              >
                Criar conta
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", textAlign: "center", mt: 1.25, lineHeight: 1.4 }}
              >
                Cadastro gratuito com e-mail ou Google
              </Typography>
            </Box>
          }
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2, maxWidth: 420, px: 2 }}>
          Ao entrar, você confirma que leu o{' '}
          <Link href="/privacidade" underline="hover">
            aviso de privacidade
          </Link>{' '}
          e as{' '}
          <Link href="/privacidade#cookies" underline="hover">
            preferências de cookies
          </Link>
          . No primeiro acesso após o login, pediremos confirmação registrada em sua conta.
        </Typography>
      </Box>
    </Box>
  );
}
