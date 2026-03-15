"use client";

import React, { useState, useEffect, useContext } from "react";
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
  CheckCircleOutline as CheckCircleOutlineIcon,
  Assignment as AssignmentIcon,
  Gavel as GavelIcon,
  Policy as PolicyIcon,
  Group as GroupIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  DarkModeOutlined,
  LightModeOutlined,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { ColorModeContext } from "@contexts/color-mode";
import { FeatureBanner } from "@/components/landing/FeatureBanners";
import { StatsBanner } from "@/components/landing/StatsBanner";

const features = [
  { key: "diagnostico", icon: <CheckCircleOutlineIcon fontSize="large" color="primary" />, title: "Diagnóstico", description: "Avalie a maturidade e realize diagnósticos completos" },
  { key: "planos-acao", icon: <AssignmentIcon fontSize="large" color="primary" />, title: "Plano de Trabalho", description: "Gerencie o plano de trabalho e acompanhe o progresso" },
  { key: "conformidade", icon: <GavelIcon fontSize="large" color="primary" />, title: "Conformidade LGPD", description: "ROPA, direitos dos titulares, RIPD e incidentes" },
  { key: "politicas", icon: <PolicyIcon fontSize="large" color="primary" />, title: "Políticas", description: "Crie e gerencie políticas institucionais" },
  { key: "responsabilidades", icon: <GroupIcon fontSize="large" color="primary" />, title: "Responsabilidades", description: "Defina responsáveis e suas atribuições" },
  { key: "auditoria", icon: <SecurityIcon fontSize="large" color="primary" />, title: "Histórico de Atividades", description: "Trilha de auditoria (LGPD art. 37, Framework FPSI Controle 8)" },
];

const BANNER_DATA: Record<
  string,
  { title: string; tagline: string; points: string[]; gradient: string; icon: React.ReactNode }
> = {
  diagnostico: {
    title: "Diagnóstico",
    tagline: "Avalie a maturidade em privacidade e segurança da informação da sua organização com base em controles e medidas.",
    points: [
      "Diagnósticos por domínio (Segurança, Privacidade, Governança)",
      "Controles e medidas com níveis de maturidade (1 a 5)",
      "Dashboard com visão consolidada e indicadores",
      "Alinhado ao Framework PPSI e boas práticas",
    ],
    gradient: "linear-gradient(135deg, #2e7d32 0%, #43a047 50%, #66bb6a 100%)",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  "planos-acao": {
    title: "Plano de Trabalho",
    tagline: "Transforme lacunas identificadas no diagnóstico em ações concretas com prazos e responsáveis.",
    points: [
      "Plano de ação vinculado a cada medida",
      "Status: Concluído, Em andamento, Não iniciado",
      "Datas de início e fim, responsáveis e descrição",
      "Acompanhamento visual do progresso",
    ],
    gradient: "linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)",
    icon: <AssignmentIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  conformidade: {
    title: "Conformidade LGPD",
    tagline: "Atenda aos requisitos da LGPD com ROPA, RIPD, direitos dos titulares e gestão de incidentes.",
    points: [
      "ROPA – Registro das Operações de Tratamento",
      "RIPD – Relatório de Impacto à Proteção de Dados",
      "Direitos dos titulares e pedidos de acesso",
      "Registro e tratamento de incidentes de segurança",
    ],
    gradient: "linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)",
    icon: <GavelIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  politicas: {
    title: "Políticas",
    tagline: "Centralize e gerencie políticas institucionais de segurança, privacidade e proteção de dados.",
    points: [
      "Políticas de Segurança da Informação",
      "Política de Privacidade e Proteção de Dados",
      "Editor rico com versionamento",
      "Controle de vigência e revisão",
    ],
    gradient: "linear-gradient(135deg, #6a1b9a 0%, #7b1fa2 50%, #9c27b0 100%)",
    icon: <PolicyIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  responsabilidades: {
    title: "Responsabilidades",
    tagline: "Defina a estrutura de tratamento com controladores, contratantes e operadores (LGPD art. 5º).",
    points: [
      "Diagrama de papéis (controlador, contratante, operador)",
      "Vínculos entre instituições e fluxo de dados",
      "Responsáveis por programa e atribuições",
      "Visão clara da cadeia de tratamento",
    ],
    gradient: "linear-gradient(135deg, #455a64 0%, #546e7a 50%, #78909c 100%)",
    icon: <GroupIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
  auditoria: {
    title: "Histórico de Atividades",
    tagline: "Trilha de auditoria completa: quem fez o quê, quando. Atende LGPD art. 37 e Framework FPSI.",
    points: [
      "Registro automático de alterações em diagnósticos, medidas e planos",
      "Filtros por usuário, data e tipo de atividade",
      "Rastreabilidade para conformidade e auditorias",
      "Framework FPSI Controle 8 – Evidências de auditoria",
    ],
    gradient: "linear-gradient(135deg, #37474f 0%, #455a64 50%, #607d8b 100%)",
    icon: <SecurityIcon sx={{ fontSize: 32, opacity: 0.9 }} />,
  },
};

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
            onClick={() => router.push('/artigo')}
            sx={{ mr: 1, textTransform: 'none' }}
          >
            Artigo
          </Button>
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
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: "bold" }}>
            Principais Funcionalidades
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Ferramentas completas para gestão de privacidade e segurança da informação
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={feature.key}>
                  <Grow in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        height: "100%",
                        transition: "all 0.3s ease-in-out",
                        transform: hoveredCard === index ? "translateY(-8px)" : "translateY(0)",
                        boxShadow: hoveredCard === index ? 6 : 2,
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <CardContent sx={{ p: 3, textAlign: "center" }}>
                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: "bold" }}>
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
          </Grid>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                minHeight: 560,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {hoveredCard !== null && features[hoveredCard] ? (
                <Fade in key={`banner-${features[hoveredCard].key}`} timeout={250}>
                  <Box sx={{ height: "100%", minHeight: 560, p: 0 }}>
                    <FeatureBanner {...BANNER_DATA[features[hoveredCard].key]} />
                  </Box>
                </Fade>
              ) : (
                <Fade in key="stats" timeout={300}>
                  <Box sx={{ height: "100%", minHeight: 560, p: 0 }}>
                    <StatsBanner />
                  </Box>
                </Fade>
              )}
            </Box>
          </Grid>
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
              onClick={() => router.push('/artigo')}
              sx={{ textTransform: 'none', mb: 1, mr: 1 }}
            >
              Artigo
            </Button>
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
