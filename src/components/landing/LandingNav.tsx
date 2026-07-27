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
  Menu as MenuIcon,
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";
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
  onOpenAigp?: () => void;
  onOpenFeatures?: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  onLogout: () => void;
  demoCtaLabel?: string;
  demoCtaShort?: string;
};

const linkSx = (fontFamily: string) => ({
  fontFamily,
  color: "rgba(244,248,252,0.72)",
  textTransform: "none" as const,
  fontWeight: 600,
  fontSize: "0.875rem",
  letterSpacing: "0.01em",
  px: 1.25,
  py: 0.65,
  minWidth: 0,
  borderRadius: 1,
  position: "relative" as const,
  transition: "color 0.2s ease, background 0.2s ease",
  "&:hover": {
    color: landing.heroText,
    bgcolor: "transparent",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 4,
    height: 1.5,
    borderRadius: 1,
    bgcolor: landing.lock,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 0.22s ease",
  },
  "&:hover::after": {
    transform: "scaleX(1)",
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
  onOpenAigp,
  onOpenFeatures,
  onLogin,
  onDashboard,
  onLogout,
  demoCtaLabel = "Ver na prática",
  demoCtaShort = "Demo",
}: LandingNavProps) {
  return (
    <Box
      component="nav"
      sx={{
        position: "relative",
        zIndex: 3,
        px: { xs: 2, md: 3.5 },
        pt: { xs: 1.25, md: 1.5 },
        pb: { xs: 0.75, md: 1 },
        animation: ready ? "lpFade 0.8s ease both" : "none",
        borderBottom: "1px solid rgba(244,248,252,0.08)",
        background: "linear-gradient(180deg, rgba(6,21,37,0.35) 0%, transparent 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          minHeight: { xs: 44, md: 48 },
        }}
      >
        {/* Âncora discreta — marca forte fica no hero com a logo */}
        <Box
          component="button"
          type="button"
          onClick={() => onNavigate("/")}
          aria-label="FPSI — início"
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 0.75,
            flexShrink: 0,
            border: 0,
            bgcolor: "transparent",
            color: landing.heroText,
            cursor: "pointer",
            p: 0,
            mr: { md: 1 },
            "&:hover .navBrandMark": { color: landing.lock },
          }}
        >
          <Typography
            className="navBrandMark"
            component="span"
            sx={{
              fontFamily,
              fontWeight: 800,
              fontSize: "0.95rem",
              letterSpacing: "-0.03em",
              color: "rgba(244,248,252,0.88)",
              transition: "color 0.2s ease",
            }}
          >
            FPSI
          </Typography>
        </Box>

        {!isMobile && (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.15,
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
            <Button sx={linkSx(fontFamily)} onClick={onOpenLgpd}>
              LGPD
            </Button>
            {onOpenAigp && (
              <Button sx={linkSx(fontFamily)} onClick={onOpenAigp}>
                Governança de IA
              </Button>
            )}
            <Button sx={linkSx(fontFamily)} onClick={() => onNavigate("/sobre")}>
              Sobre
            </Button>
          </Box>
        )}

        {isMobile && <Box sx={{ flex: 1 }} />}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.85, flexShrink: 0 }}>
          {isMobile && (
            <>
              <IconButton
                aria-label="Abrir menu"
                onClick={(e) => onOpenNavMenu(e.currentTarget)}
                sx={{
                  color: landing.heroText,
                  width: 38,
                  height: 38,
                  borderRadius: 1.25,
                  border: "1px solid rgba(255,255,255,0.14)",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
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
                    minWidth: 220,
                    borderRadius: 1.5,
                    fontFamily,
                    border: "1px solid rgba(15,36,56,0.08)",
                  },
                }}
              >
                {[
                  {
                    label: demoCtaLabel,
                    action: () => onNavigate("/demo/login"),
                    highlight: true,
                  },
                  ...(onOpenFeatures ? [{ label: "Módulos", action: onOpenFeatures }] : []),
                  { label: "Artigo", action: () => onNavigate("/artigo") },
                  { label: "Referência LGPD", action: onOpenLgpd },
                  ...(onOpenAigp ? [{ label: "Governança de IA", action: onOpenAigp }] : []),
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
                      borderRadius: 1,
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
                color: "rgba(244,248,252,0.8)",
                width: 38,
                height: 38,
                borderRadius: 1.25,
                border: "1px solid rgba(255,255,255,0.12)",
                bgcolor: "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>

          {!user && (
            <Button
              variant="contained"
              onClick={() => onNavigate("/demo/login")}
              startIcon={<PlayArrowIcon sx={{ fontSize: "1.05rem !important" }} />}
              sx={{
                fontFamily,
                textTransform: "none",
                fontWeight: 800,
                fontSize: { xs: "0.82rem", md: "0.88rem" },
                px: { xs: 1.4, md: 1.85 },
                py: 0.95,
                borderRadius: 1.25,
                bgcolor: landing.blue,
                color: "#fff",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#0D47A1",
                  color: "#fff",
                  boxShadow: "none",
                },
              }}
            >
              {isMobile ? demoCtaShort : demoCtaLabel}
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
                    borderRadius: 1.25,
                    px: 1.75,
                    "&:hover": { borderColor: landing.heroText, bgcolor: "rgba(255,255,255,0.06)" },
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
                    width: 34,
                    height: 34,
                    fontFamily,
                    fontWeight: 800,
                    bgcolor: landing.blue,
                    border: "1px solid rgba(255,255,255,0.28)",
                    borderRadius: 1.25,
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
                PaperProps={{ sx: { mt: 1, borderRadius: 1.5, minWidth: 220, fontFamily } }}
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
              variant="text"
              onClick={onLogin}
              endIcon={<ArrowForwardIcon sx={{ fontSize: "1rem !important" }} />}
              sx={{
                fontFamily,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                px: 1.25,
                py: 0.9,
                borderRadius: 1.25,
                color: "rgba(244,248,252,0.85)",
                display: { xs: "none", sm: "inline-flex" },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                  color: landing.heroText,
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
