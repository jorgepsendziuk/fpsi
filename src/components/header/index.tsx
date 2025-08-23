"use client";

import { ColorModeContext } from "@contexts/color-mode";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SecurityIcon from "@mui/icons-material/Security";
import PolicyIcon from "@mui/icons-material/Policy";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { RefineThemedLayoutV2HeaderProps} from "@refinedev/mui";
import React, { useContext, useState } from "react";
import Image from 'next/image';
import { useRouter, usePathname } from "next/navigation";

type IUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
};

const navigationItems = [
  {
    label: "Dashboard",
    icon: <DashboardIcon />,
    path: "/programas",
    description: "Visão geral dos programas"
  },
  {
    label: "Diagnósticos",
    icon: <SecurityIcon />,
    path: "/programas",
    description: "Avaliações de segurança"
  },
  {
    label: "Políticas",
    icon: <PolicyIcon />,
    path: "/programas",
    description: "Políticas de segurança"
  },
  {
    label: "Responsáveis",
    icon: <PeopleIcon />,
    path: "/programas",
    description: "Gestão de responsáveis"
  },
  {
    label: "Plano de Trabalho",
    icon: <AssignmentIcon />,
    path: "/programas",
    description: "Acompanhamento de ações"
  }
];

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  // Detecta se está dentro de um programa: /programas/[algum id] ou subrotas
  const isProgramaContext = /^\/programas\/[\w-]+(\/|$)/.test(pathname);
  // Extrai o programaId da URL se estiver no contexto de programa
  const programaIdMatch = pathname.match(/^\/programas\/([\w-]+)(\/|$)/);
  const programaId = programaIdMatch ? programaIdMatch[1] : null;

  // Itens de menu dinâmicos
  const dynamicNavigationItems = programaId ? [
    {
      label: "Programa",
      icon: <DashboardIcon />,
      path: `/programas/${programaId}`,
      description: "Visão geral do programa"
    },
    {
      label: "Diagnósticos",
      icon: <SecurityIcon />,
      path: `/programas/${programaId}/diagnostico`,
      description: "Avaliações de segurança"
    },
    {
      label: "Políticas",
      icon: <PolicyIcon />,
      path: `/programas/${programaId}/politicas`,
      description: "Políticas de segurança"
    },
    {
      label: "Responsáveis",
      icon: <PeopleIcon />,
      path: `/programas/${programaId}/responsabilidades`,
      description: "Gestão de responsáveis"
    },
    {
      label: "Plano de Trabalho",
      icon: <AssignmentIcon />,
      path: `/programas/${programaId}/planos-acao`,
      description: "Acompanhamento de ações"
    }
  ] : [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
  };

  const handleGoHome = () => {
    router.push('/programas');
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const getCurrentPageTitle = () => {
    if (pathname.includes('/diagnostico')) return 'Diagnóstico';
    if (pathname.includes('/politicas')) return 'Políticas';
    if (pathname.includes('/responsabilidades')) return 'Responsáveis';
    if (pathname.includes('/planos-acao')) return 'Plano de Trabalho';
    if (pathname.includes('/usuarios')) return 'Usuários';
    if (pathname === '/programas') return 'Programas';
    return 'FPSI';
  };

  return (
    <>
      <AppBar position={sticky ? "sticky" : "relative"} elevation={1}>
        <Toolbar>
          <Stack
            direction="row"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* Logo, Menu Mobile e Título */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileMenuOpen(true)}
                  edge="start"
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={handleGoHome}>
                <Image 
                  src="/logo_p.png" 
                  alt="FPSI Logo" 
                  width={32} 
                  height={32} 
                />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                  FPSI
                </Typography>
              </Box>

              {/* Título da página atual */}
              {pathname !== '/programas' && (
                <>
                  <Typography variant="h6" sx={{ color: 'inherit', opacity: 0.7 }}>
                    /
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'inherit' }}>
                    {getCurrentPageTitle()}
                  </Typography>
                </>
              )}
            </Stack>

            {/* Menu de navegação para desktop */}
            {!isMobile && isProgramaContext && (
              <Stack direction="row" spacing={1}>
                {dynamicNavigationItems.map((item) => (
                  <Tooltip key={item.label} title={item.description}>
                    <Button
                      color="inherit"
                      startIcon={item.icon}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
                ))}
              </Stack>
            )}

            {/* Seção do usuário e controles */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Tooltip title={mode === "dark" ? "Modo Claro" : "Modo Escuro"}>
                <IconButton
                  color="inherit"
                  onClick={() => setMode()}
                >
                  {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
                </IconButton>
              </Tooltip>

              {user ? (
                <>
                  <Tooltip title="Menu do usuário">
                    <IconButton
                      color="inherit"
                      onClick={handleUserMenuOpen}
                      sx={{ ml: 1 }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {!isMobile && (
                          <Typography
                            variant="subtitle2"
                            sx={{ color: 'inherit' }}
                          >
                            {user?.name || user?.email}
                          </Typography>
                        )}
                        <Avatar 
                          src={user?.avatar} 
                          alt={user?.name || user?.email} 
                          sx={{ width: 32, height: 32 }}
                        >
                          {(user?.name || user?.email || '').charAt(0).toUpperCase()}
                        </Avatar>
                      </Stack>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Logado como
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {user?.name || user?.email}
                      </Typography>
                      {user?.email && user?.name && (
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleGoHome}>
                      <ListItemIcon>
                        <HomeIcon fontSize="small" />
                      </ListItemIcon>
                      Meus Programas
                    </MenuItem>
                    <MenuItem onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Perfil
                    </MenuItem>
                    <MenuItem onClick={handleUserMenuClose}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      Configurações
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Sair
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => router.push('/login')}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Entrar
                </Button>
              )}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Menu Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Image 
              src="/logo_p.png" 
              alt="FPSI Logo" 
              width={32} 
              height={32} 
            />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              FPSI
            </Typography>
          </Box>
          <Divider />
        </Box>

        {isProgramaContext && (
          <List>
            {dynamicNavigationItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => handleNavigate(item.path)}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    secondary={item.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {user && (
          <>
            <Divider sx={{ mt: 'auto' }} />
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name || user?.email} 
                  sx={{ width: 40, height: 40 }}
                >
                  {(user?.name || user?.email || '').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {user?.name || user?.email}
                  </Typography>
                  {user?.email && user?.name && (
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ textTransform: 'none' }}
              >
                Sair
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
};
