"use client";

import { AuthPage } from "@refinedev/mui";
import { Box, useTheme, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { DarkModeOutlined, LightModeOutlined, Google } from "@mui/icons-material";
import { ColorModeContext } from "@contexts/color-mode";
import { useContext, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { useRouter } from "next/navigation";
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
  
  // Hook para traduzir textos automaticamente
  useAuthTranslation();

  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

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
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', textAlign: 'center' }}>
              Não tem uma conta?{' '}
              <Box 
                component="a" 
                href="/register" 
                sx={{ 
                  color: 'primary.main', 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Criar conta
              </Box>
            </Box>
          }
        />
      </Box>
    </Box>
  );
}
