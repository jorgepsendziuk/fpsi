"use client";

import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Typography,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  DarkModeOutlined,
  LightModeOutlined,
  MenuBook as MenuBookIcon,
  Menu as MenuIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { landing } from "./landingTokens";

type User = {
  email: string;
  name?: string;
  avatar?: string;
};

type LandingNavProps = {
  fontFamily: string;
  isMobile: boolean;
  mode: string;
  user?: User | null;
  navMenuEl: HTMLElement | null;
  userMenuEl: HTMLElement | null;
  ready?: boolean;
  onToggleMode: () => void;
  onOpenNavMenu: (el: HTMLElement) => void;
  onCloseNavMenu: () => void;
  onOpenUserMenu: (el: HTMLElement) => void;
  onCloseUserMenu: () => void;
  onNavigate: (href: string) => void;
  onOpenLgpd: () => void;
  onOpenFeatures?: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  onLogout: () => void;
};

const linkSx = (fontFamily: string) => ({
  fontFamily,
  color: "rgba(244,248,252,0.78)",
  textTransform: "none" as const,
  fontWeight: 600,
  fontSize: "0.875rem",
  letterSpacing: "0.01em",
  px: 1.5,
  py: 0.85,
  minWidth: 0,
  borderRadius: 999,
  position: "relative" as const,
  transition: "color 0.2s ease, background 0.2s ease",
  "&:hover": {
    color: landing.heroText,
    bgcolor: "rgba(255,255,255,0.08)",
  },
});

export function LandingNav({
  fontFamily,
  isMobile,
  mode,
  user,
  navMenuEl,
  userMenuEl,
  ready,
  onToggleMode,
  onOpenNavMenu,
  onCloseNavMenu,
  onOpenUserMenu,
  onCloseUserMenu,
  onNavigate,
  onOpenLgpd,
  onOpenFeatures,
  onLogin,
  onDashboard,
  onLogout,
}: LandingNavProps) {
  return (
    <Box
      component="nav"
      sx={{
        position: "relative",
        zIndex: 3,
        px: { xs: 1.5, md: 3 },
        pt: { xs: 1.5, md: 2 },
        animation: ready ? "lpFade 0.8s ease both" : "none",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 1.5 },
          px: { xs: 1.25, md: 1.75 },
          py: { xs: 0.85, md: 1 },
          borderRadius: 999,
          bgcolor: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(22px) saturate(1.45)",
          WebkitBackdropFilter: "blur(22px) saturate(1.45)",
          boxShadow: `
            0 12px 40px rgba(0,0,0,0.28),
            inset 0 1px 0 rgba(255,255,255,0.16),
            inset 0 -1px 0 rgba(0,0,0,0.15)
          `,
        }}
      >
        {/* Marca */}
        <Box
          component="button"
          type="button"
          onClick={() => onNavigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            flexShrink: 0,
            border: 0,
            bgcolor: "transparent",
            color: landing.heroText,
            cursor: "pointer",
            p: 0.25,
            pr: 0.75,
            borderRadius: 999,
            transition: "opacity 0.2s ease",
            "&:hover": { opacity: 0.9 },
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              overflow: "hidden",
              boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              flexShrink: 0,
            }}
          >
            <Image src="/logo_p.png" alt="FPSI" width={38} height={38} style={{ display: "block" }} />
          </Box>
          <Box sx={{ textAlign: "left", lineHeight: 1.05 }}>
            <Typography
              component="span"
              sx={{
                display: "block",
                fontFamily,
                fontWeight: 900,
                fontSize: "1.05rem",
                letterSpacing: "0.08em",
                color: landing.heroText,
              }}
            >
              FPSI
            </Typography>
            <Typography
              component="span"
              sx={{
                display: { xs: "none", sm: "block" },
                fontFamily,
                fontWeight: 500,
                fontSize: "0.62rem",
                letterSpacing: "0.04em",
                color: "rgba(244,248,252,0.55)",
                textTransform: "uppercase",
              }}
              title="Framework de Privacidade e Segurança da Informação"
            >
              Privacidade & SI
            </Typography>
          </Box>
        </Box>

        {/* Links centrais */}
        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.35,
              px: 1,
            }}
          >
            {onOpenFeatures && (
              <Button sx={linkSx(fontFamily)} onClick={onOpenFeatures}>
                Módulos
              </Button>
            )}
            <Button sx={linkSx(fontFamily)} onClick={() => onNavigate("/artigo")}>
              Artigo
            </Button>
            <Button
              sx={linkSx(fontFamily)}
              onClick={onOpenLgpd}
              startIcon={<MenuBookIcon sx={{ fontSize: "1rem !important" }} />}
            >
              LGPD
            </Button>
            <Button sx={linkSx(fontFamily)} onClick={() => onNavigate("/sobre")}>
              Sobre
            </Button>
          </Box>
        )}

        {isMobile && <Box sx={{ flex: 1 }} />}

        {/* Ações */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          {isMobile && (
            <>
              <IconButton
                aria-label="Abrir menu"
                onClick={(e) => onOpenNavMenu(e.currentTarget)}
                sx={{
                  color: landing.heroText,
                  width: 40,
                  height: 40,
                  bgcolor: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={navMenuEl}
                open={Boolean(navMenuEl)}
                onClose={onCloseNavMenu}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    borderRadius: 2.5,
                    fontFamily,
                    border: "1px solid rgba(15,36,56,0.08)",
                  },
                }}
              >
                {[
                  {
                    label: "Ver demonstração",
                    action: () => onNavigate("/demo/login"),
                    highlight: true,
                  },
                  ...(onOpenFeatures ? [{ label: "Módulos", action: onOpenFeatures }] : []),
                  { label: "Artigo", action: () => onNavigate("/artigo") },
                  { label: "Referência LGPD", action: onOpenLgpd },
                  { label: "Sobre", action: () => onNavigate("/sobre") },
                ].map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      onCloseNavMenu();
                      item.action();
                    }}
                    sx={{
                      fontFamily,
                      fontWeight: "highlight" in item && item.highlight ? 800 : 600,
                      py: 1.25,
                      color: "highlight" in item && item.highlight ? landing.lock : undefined,
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton
              onClick={onToggleMode}
              sx={{
                color: "rgba(244,248,252,0.85)",
                width: 40,
                height: 40,
                bgcolor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "background 0.2s ease, transform 0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.12)",
                  transform: "rotate(-12deg)",
                },
              }}
            >
              {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>

          {!user && (
            <Button
              variant="contained"
              onClick={() => onNavigate("/demo/login")}
              startIcon={<PlayArrowIcon sx={{ fontSize: "1.1rem !important" }} />}
              sx={{
                fontFamily,
                textTransform: "none",
                fontWeight: 800,
                fontSize: { xs: "0.82rem", md: "0.9rem" },
                px: { xs: 1.5, md: 2 },
                py: 1,
                borderRadius: 999,
                bgcolor: landing.lock,
                color: landing.ink,
                boxShadow: "0 6px 20px rgba(249,168,37,0.4)",
                "&:hover": {
                  bgcolor: "#FFB300",
                  boxShadow: "0 8px 24px rgba(249,168,37,0.5)",
                },
              }}
            >
              {isMobile ? "Demo" : "Ver demo"}
            </Button>
          )}

          {user ? (
            <>
              {!isMobile && (
                <Button
                  variant="outlined"
                  onClick={onDashboard}
                  startIcon={<DashboardIcon />}
                  sx={{
                    fontFamily,
                    color: landing.heroText,
                    borderColor: "rgba(255,255,255,0.28)",
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 2,
                    "&:hover": { borderColor: landing.heroText, bgcolor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  Dashboard
                </Button>
              )}
              <IconButton onClick={(e) => onOpenUserMenu(e.currentTarget)} size="small" sx={{ p: 0.25 }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name || user.email}
                  sx={{
                    width: 36,
                    height: 36,
                    fontFamily,
                    fontWeight: 800,
                    bgcolor: landing.blue,
                    border: "2px solid rgba(255,255,255,0.35)",
                  }}
                >
                  {(user.name || user.email || "").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={userMenuEl}
                open={Boolean(userMenuEl)}
                onClose={onCloseUserMenu}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                PaperProps={{ sx: { mt: 1, borderRadius: 2.5, minWidth: 220, fontFamily } }}
              >
                <Box sx={{ px: 2, py: 1.25 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily, fontWeight: 500 }}>
                    Logado como
                  </Typography>
                  <Typography sx={{ fontFamily, fontWeight: 800 }}>{user.name || user.email}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={onDashboard} sx={{ fontFamily, fontWeight: 600 }}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={onLogout} sx={{ fontFamily, fontWeight: 600 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sair
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              onClick={onLogin}
              endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
              sx={{
                fontFamily,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                px: { xs: 1.25, md: 1.75 },
                py: 1,
                borderRadius: 999,
                color: landing.heroText,
                borderColor: "rgba(255,255,255,0.35)",
                borderWidth: 1.5,
                display: { xs: "none", sm: "inline-flex" },
                "&:hover": {
                  borderWidth: 1.5,
                  borderColor: landing.heroText,
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Acessar
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
