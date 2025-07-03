'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Paper,
  Alert,
  AlertTitle,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Policy as PolicyIcon,
  Group as GroupIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { DEMO_PROGRAMA } from '../../lib/data/demoData';

export default function DemoPage() {
  const router = useRouter();
  const theme = useTheme();

  // Redirecionar automaticamente para o programa demo após alguns segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-redirect após 10 segundos para uma melhor UX
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnterDemo = () => {
    router.push(`/programas/${DEMO_PROGRAMA.id}`);
  };

  const handleViewPolicies = () => {
    router.push(`/programas/${DEMO_PROGRAMA.id}/politicas`);
  };

  const featuresDemo = [
    {
      icon: <DashboardIcon color="primary" />,
      title: "Dashboard Interativo",
      description: "Visualize métricas de maturidade em tempo real"
    },
    {
      icon: <AssessmentIcon color="primary" />,
      title: "Diagnósticos Completos", 
      description: "5 diagnósticos com controles e medidas implementados"
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: "Controles de Segurança",
      description: "Navegação aprimorada entre controles com scores de maturidade"
    },
    {
      icon: <PolicyIcon color="primary" />,
      title: "Políticas de Segurança",
      description: "10 políticas pré-configuradas com editor moderno"
    },
    {
      icon: <GroupIcon color="primary" />,
      title: "Gestão de Responsáveis",
      description: "Equipe pré-configurada com diferentes perfis"
    },
    {
      icon: <SpeedIcon color="primary" />,
      title: "Performance Otimizada",
      description: "Cache inteligente e carregamento rápido"
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
      py: 4
    }}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Header */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
              🚀 Demonstração FPSI
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 2 }}>
              Explore o sistema completo sem necessidade de cadastro
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
              Acesse um programa pré-configurado com dados reais de demonstração, 
              incluindo diagnósticos, controles, medidas e políticas de segurança.
            </Typography>
          </Paper>

          {/* Empresa Demo Info */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {DEMO_PROGRAMA.nome_fantasia}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CNPJ: {DEMO_PROGRAMA.cnpj} • Setor: Empresa Privada
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto' }}>
                    <Chip 
                      label="DEMONSTRAÇÃO" 
                      color="warning" 
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                </Box>

                <Divider />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleEnterDemo}
                    sx={{ 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow: 3
                    }}
                  >
                    Entrar na Demonstração
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<VisibilityIcon />}
                    onClick={handleViewPolicies}
                    sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                  >
                    Ver Políticas de Segurança
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Funcionalidades */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
              ✨ Funcionalidades Disponíveis
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <List>
                {featuresDemo.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="h6" fontWeight="600">
                          {feature.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>

          {/* Dados Demo */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
              📊 Dados Pré-configurados
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 2 }}>
              <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="primary">5</Typography>
                <Typography variant="body1">Diagnósticos</Typography>
              </Card>
              
              <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="secondary">8</Typography>
                <Typography variant="body1">Controles</Typography>
              </Card>
              
              <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="success.main">15</Typography>
                <Typography variant="body1">Medidas</Typography>
              </Card>
              
              <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">10</Typography>
                <Typography variant="body1">Políticas</Typography>
              </Card>
            </Stack>
          </Paper>

          {/* Avisos */}
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 'bold' }}>💡 Modo Demonstração</AlertTitle>
            <Stack spacing={1}>
              <Typography variant="body2">
                • <strong>Dados sintéticos:</strong> Todas as informações são fictícias e para demonstração
              </Typography>
              <Typography variant="body2">
                • <strong>Não persiste:</strong> Alterações não são salvas permanentemente
              </Typography>
              <Typography variant="body2">
                • <strong>Funcionalidade completa:</strong> Todas as funcionalidades estão disponíveis
              </Typography>
              <Typography variant="body2">
                • <strong>Performance real:</strong> Simula delays de rede para experiência realista
              </Typography>
            </Stack>
          </Alert>

          {/* Call to Action */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.primary.main}15 100%)`,
              border: `2px solid ${theme.palette.primary.main}30`
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🎯 Pronto para começar?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Explore o sistema completo e veja como o FPSI pode transformar 
              a gestão de segurança da informação na sua organização.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleEnterDemo}
              sx={{ 
                py: 2,
                px: 4,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: 3,
                boxShadow: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Iniciar Demonstração Agora
            </Button>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}