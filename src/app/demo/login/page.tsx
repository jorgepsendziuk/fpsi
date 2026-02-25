'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Science as DemoIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { supabaseBrowserClient } from '@utils/supabase/client';

export default function DemoLoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('demo@fpsi.com.br');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');

  // Auto-preencher campos demo
  useEffect(() => {
    setEmail('demo@fpsi.com.br');
    setPassword('demo');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email !== 'demo@fpsi.com.br' || password !== 'demo') {
      setError('Use as credenciais demo: demo@fpsi.com.br / demo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabaseBrowserClient.auth.signInWithPassword({
        email: 'demo@fpsi.com.br',
        password: 'demo',
      });

      if (authError) {
        setError(authError.message || 'Erro ao fazer login. Verifique as credenciais demo.');
        setLoading(false);
        return;
      }

      if (data?.session) {
        await supabaseBrowserClient.auth.setSession(data.session);
        fetch('/api/profiles/verify', { method: 'POST' }).catch(() => {});
        router.push('/dashboard');
        return;
      }

      setError('Erro ao fazer login no modo demonstração');
    } catch (err) {
      setError('Erro ao fazer login no modo demonstração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <DemoIcon 
              sx={{ 
                fontSize: 64, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              FPSI Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema de Gestão de Programas de Segurança da Informação
            </Typography>
          </Box>

          {/* Card de Instruções */}
          <Card sx={{ mb: 3, backgroundColor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🚀 Modo Demonstração
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Explore todas as funcionalidades do FPSI com dados fictícios.
                Os campos já estão preenchidos para sua conveniência.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" fontWeight="bold">
                    E-mail:
                  </Typography>
                  <Typography variant="body2">
                    demo@fpsi.com.br
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight="bold">
                    Senha:
                  </Typography>
                  <Typography variant="body2">
                    demo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Formulário */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                }
              }}
            >
              {loading ? 'Entrando...' : 'Entrar na Demonstração'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ou
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => router.push('/login')}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              Ir para Login Real
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Sistema FPSI • Versão Demo
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}