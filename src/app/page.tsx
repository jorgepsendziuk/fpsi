"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  DarkModeOutlined,
  LightModeOutlined,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import GppGoodTwoToneIcon from '@mui/icons-material/GppGoodTwoTone';
import Image from 'next/image';
import { ColorModeContext } from "@contexts/color-mode";

const features = [
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: "Diagnóstico de Segurança",
    description: "Avalie o nível de maturidade em segurança da informação da sua organização."
  },
  {
    icon: <AssessmentIcon fontSize="large" color="primary" />,
    title: "Relatórios Detalhados", 
    description: "Gere relatórios completos com análises e recomendações personalizadas."
  },
  {
    icon: <SpeedIcon fontSize="large" color="primary" />,
    title: "Processo Ágil",
    description: "Interface intuitiva que agiliza o processo de avaliação e implementação."
  },
  {
    icon: <VerifiedUserIcon fontSize="large" color="primary" />,
    title: "Conformidade",
    description: "Garanta conformidade com normas e frameworks de segurança."
  },
  {
    icon: <TrendingUpIcon fontSize="large" color="primary" />,
    title: "Evolução Contínua",
    description: "Acompanhe a evolução da maturidade ao longo do tempo."
  },
  {
    icon: <ShieldIcon fontSize="large" color="primary" />,
    title: "Proteção Robusta",
    description: "Implemente medidas de proteção eficazes baseadas nas avaliações."
  }
];

type IUser = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, setMode } = useContext(ColorModeContext);
  
  const { data: user, isLoading: userLoading } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
    handleMenuClose();
  };

  // Usuário logado: redirecionar para a dashboard
  useEffect(() => {
    if (!userLoading && user) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  // Se estiver carregando dados do usuário, mostrar loading
  if (userLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            FPSI
          </Typography>
          <Button
            color="inherit"
            onClick={() => router.push('/sobre')}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Sobre o projeto
          </Button>
          {/* Theme toggle button */}
          <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
            <IconButton
              color="inherit"
              onClick={() => setMode()}
              sx={{ mr: 1 }}
            >
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
          
          {user ? (
            // Usuário logado - mostrar menu do usuário
            <>
              <Button
                color="primary"
                variant="outlined"
                onClick={handleGoToDashboard}
                startIcon={<DashboardIcon />}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
              <IconButton onClick={handleMenuOpen} sx={{ ml: 1 }}>
                <Avatar 
                  src={user.avatar} 
                  alt={user.name || user.email}
                  sx={{ width: 32, height: 32 }}
                >
                  {(user.name || user.email || '').charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Logado como
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {user.name || user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleGoToDashboard}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sair
                </MenuItem>
              </Menu>
            </>
          ) : (
            // Usuário não logado - mostrar botão de login
            <Button 
              color="primary" 
              variant="contained" 
              onClick={handleLogin}
              sx={{ ml: 2 }}
            >
              Acessar Sistema
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box>
              {/* Add logo to hero section */}
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Image 
                  src="/logo_p.png" 
                  alt="FPSI Logo" 
                  width={120} 
                  height={120} 
                  style={{ 
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                  }}
                />
              </Box>
              
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold', mb: 3 }}
              >
                Framework de Privacidade e
                <Box component="span" sx={{ color: 'primary.main', display: 'block' }}>
                  Segurança da Informação
                </Box>
              </Typography>
              
              {user ? (
                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
                >
                  Bem-vindo de volta! Continue avaliando e monitorando o nível de maturidade em privacidade e segurança da informação da sua organização.
                </Typography>
              ) : (
                <Box sx={{ mb: 4, maxWidth: '720px', mx: 'auto' }}>
                  <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                    Avalie, monitore e melhore o nível de maturidade em privacidade e segurança da informação da sua organização.
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1.5,
                      listStyle: 'none',
                      m: 0,
                      p: 0,
                      '& li': {
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                        fontSize: '1rem',
                        '&:not(:last-child)::after': {
                          content: '"·"',
                          ml: 1.5,
                          color: 'text.disabled',
                          fontWeight: 'bold'
                        }
                      }
                    }}
                  >
                    <Box component="li">Código aberto</Box>
                    <Box component="li">Multi-usuário</Box>
                    <Box component="li">Sem planilha nem software proprietário</Box>
                  </Box>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {user ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleGoToDashboard}
                      startIcon={<DashboardIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        boxShadow: 3
                      }}
                    >
                      Ir para Dashboard
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push('/demo/login')}
                      startIcon={<PlayArrowIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      Ver Demonstração
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleLogin}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        boxShadow: 3
                      }}
                    >
                      Começar Diagnóstico
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push('/demo/login')}
                      startIcon={<PlayArrowIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.5, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2
                        }
                      }}
                    >
                      Ver Demonstração
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Principais Funcionalidades
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Ferramentas completas para gestão de privacidade e segurança da informação
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    transform: hoveredCard === index ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: hoveredCard === index ? 6 : 2,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Para quem é + Open source */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Para quem é
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                DPOs (Encarregados de Dados), Gestores de TI e de Segurança da Informação, órgãos públicos, 
                pequenas empresas e consultores que conduzem programas de privacidade e segurança. 
                Roteiro alinhado ao Framework PPSI e à LGPD, com avaliação de maturidade e plano de trabalho em um só lugar.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Software livre
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Código aberto e gratuito. Sem dependência de Excel ou software proprietário. 
                Trabalho colaborativo e multi-usuário, com dados centralizados. Adaptável para sua organização 
                ou para oferta como PaaS (Privacy as a Service).
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push('/sobre')}
                size="small"
              >
                Conheça a pesquisa de origem
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText', 
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            {user ? 'Continue sua Jornada' : 'Pronto para Começar?'}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {user 
              ? 'Acesse seus programas e continue melhorando a segurança da sua organização'
              : 'Inicie agora a avaliação de segurança da sua organização'
            }
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={user ? handleGoToDashboard : handleLogin}
            startIcon={user ? <DashboardIcon /> : undefined}
            sx={{
              bgcolor: 'background.paper',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            {user ? 'Ir para Dashboard' : 'Acessar Sistema'}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, mt: 'auto' }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Button
              color="inherit"
              onClick={() => router.push('/sobre')}
              sx={{ textTransform: 'none', mb: 1 }}
            >
              Sobre o projeto
            </Button>
            <Typography variant="body2" color="text.secondary">
              © 2024 FPSI - Framework de Privacidade e Segurança da Informação. Código aberto.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
