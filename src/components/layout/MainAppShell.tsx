"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ColorModeContext } from "@contexts/color-mode";
import { useGetIdentity, useLogout } from "@refinedev/core";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import * as dataService from "@/lib/services/dataService";
import type { Programa } from "@/lib/types/types";
import { resolveProgramaEscopo } from "@/lib/programa/perfilEscopo";
import { getProgramaTituloOrganizacao, getProgramaTituloPrincipal } from "@/lib/utils/programaDisplay";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import type { AppNavItem } from "@/lib/navigation/appNavigation";
import {
  getBestMatchingNavPath,
  getGlobalNavSections,
  getAdminNavSections,
  buildProgramaNavSections,
  isNavGroupDiagnosticoPath,
  isNavGroupPortalPath,
  isNavGroupTratamentoPath,
  parseProgramaNavItems,
} from "@/lib/navigation/appNavigation";
import type { EmpresaRow } from "@/lib/services/dataService";
import { CookiePreferencesDialog } from "@/components/privacy/CookiePreferencesDialog";
import { CreditosDialog } from "@/components/credits/CreditosDialog";
import { FPSI_GITHUB_URL } from "@/lib/credits/fpsiCredits";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { landing } from "@/components/landing/landingTokens";
import { AppAtmosphere } from "@/components/layout/AppAtmosphere";
import { SkipToMainLink } from "@/components/a11y/SkipToMainLink";

type IUser = { id: number; name: string; email: string; avatar: string };

const DRAWER_WIDTH_DEFAULT = 248;
const DRAWER_WIDTH_COLLAPSED = 68;
const DRAWER_WIDTH_MIN = 200;
const DRAWER_WIDTH_MAX = 380;
const LS_WIDTH = "fpsi-sidebar-width";
const LS_COLLAPSED = "fpsi-sidebar-collapsed";

export function MainAppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity<IUser>();
  const { mutate: logout } = useLogout();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [programasMenuAnchor, setProgramasMenuAnchor] = useState<null | HTMLElement>(null);
  const [empresasMenuAnchor, setEmpresasMenuAnchor] = useState<null | HTMLElement>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [empresas, setEmpresas] = useState<EmpresaRow[]>([]);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_WIDTH_DEFAULT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedGroupMenu, setCollapsedGroupMenu] = useState<{
    anchor: HTMLElement;
    hub: AppNavItem;
    subs: AppNavItem[];
    groupId: string;
  } | null>(null);
  const [navGroupOpen, setNavGroupOpen] = useState<Record<string, boolean>>({});
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  const [creditosOpen, setCreditosOpen] = useState(false);
  const [accessMode, setAccessMode] = useState<"full" | "scoped" | "minimal" | null>(null);
  const prevProgramaForNavRef = useRef<string | null>(null);

  const programaMatch = pathname.match(/^\/programas\/([\w-]+)(\/|$)/);
  const programaId = programaMatch ? programaMatch[1] : null;
  const programaBase = programaId ? `/programas/${programaId}` : "";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  const defaultNavGroups = useMemo(() => {
    if (!programaBase) return { tratamento: false, diagnostico: false, portal: false };
    return {
      tratamento: isNavGroupTratamentoPath(pathname, programaBase),
      diagnostico: isNavGroupDiagnosticoPath(pathname, programaBase),
      portal: isNavGroupPortalPath(pathname, programaBase),
    };
  }, [pathname, programaBase]);

  const activePrograma = useMemo(() => {
    if (!programaId || programas.length === 0) return null;
    return (
      programas.find((p) => p.slug === programaId || String(p.id) === programaId) ?? null
    );
  }, [programaId, programas]);

  const navSections = useMemo(() => {
    const global = getGlobalNavSections();
    if (isAdminArea) return [...global, ...getAdminNavSections()];
    if (!programaId) return global;
    const escopo = activePrograma ? resolveProgramaEscopo(activePrograma).escopo : null;
    return [...global, ...buildProgramaNavSections(programaId, escopo, accessMode)];
  }, [programaId, isAdminArea, activePrograma, accessMode]);

  const flatPaths = useMemo(
    () =>
      navSections.flatMap((s) =>
        s.items.filter((i) => i.action !== "logout").map((i) => i.path)
      ),
    [navSections]
  );
  const activePath = getBestMatchingNavPath(pathname, flatPaths);

  const programaContextLabel = useMemo(() => {
    if (isAdminArea) return "Administração do sistema";
    if (!programaId) return null;
    if (activePrograma) {
      const main = getProgramaTituloPrincipal(activePrograma);
      const org = getProgramaTituloOrganizacao(activePrograma);
      return org ? `${main} · ${org}` : main;
    }
    return "Programa";
  }, [isAdminArea, programaId, activePrograma]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dataService.fetchProgramasForCurrentUser(false),
      dataService.fetchEmpresasForCurrentUser(),
    ])
      .then(([pl, el]) => {
        setProgramas(pl || []);
        setEmpresas(el || []);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const numericId = activePrograma?.id;
    if (!user || !numericId) {
      setAccessMode(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/programas/${numericId}/access`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setAccessMode(d?.mode ?? "full");
      })
      .catch(() => {
        if (!cancelled) setAccessMode("full");
      });
    return () => {
      cancelled = true;
    };
  }, [user, activePrograma?.id]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsSystemAdmin(d?.isAdmin === true))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    try {
      const w = localStorage.getItem(LS_WIDTH);
      if (w) {
        const n = parseInt(w, 10);
        if (!Number.isNaN(n)) {
          setDrawerWidth(Math.min(DRAWER_WIDTH_MAX, Math.max(DRAWER_WIDTH_MIN, n)));
        }
      }
      if (localStorage.getItem(LS_COLLAPSED) === "1") setSidebarCollapsed(true);
      // migra preferência antiga de ocultar total → recolhido
      if (localStorage.getItem("fpsi-sidebar-hidden") === "1") {
        setSidebarCollapsed(true);
        localStorage.removeItem("fpsi-sidebar-hidden");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_WIDTH, String(drawerWidth));
    } catch {
      /* ignore */
    }
  }, [drawerWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_COLLAPSED, sidebarCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!programaId) {
      setNavGroupOpen({});
      prevProgramaForNavRef.current = null;
      return;
    }
    const base = `/programas/${programaId}`;
    if (prevProgramaForNavRef.current !== programaId) {
      prevProgramaForNavRef.current = programaId;
      setNavGroupOpen({
        tratamento: isNavGroupTratamentoPath(pathname, base),
        diagnostico: isNavGroupDiagnosticoPath(pathname, base),
        portal: isNavGroupPortalPath(pathname, base),
      });
      return;
    }
    setNavGroupOpen((prev) => ({
      ...prev,
      ...(isNavGroupTratamentoPath(pathname, base) ? { tratamento: true } : {}),
      ...(isNavGroupDiagnosticoPath(pathname, base) ? { diagnostico: true } : {}),
      ...(isNavGroupPortalPath(pathname, base) ? { portal: true } : {}),
    }));
  }, [pathname, programaId]);

  const isNavGroupExpanded = (gid: string) => {
    if (Object.prototype.hasOwnProperty.call(navGroupOpen, gid)) {
      return navGroupOpen[gid]!;
    }
    return defaultNavGroups[gid as keyof typeof defaultNavGroups];
  };

  const toggleNavGroup = (gid: string) => {
    setNavGroupOpen((prev) => {
      const def = defaultNavGroups[gid as keyof typeof defaultNavGroups];
      const current = Object.prototype.hasOwnProperty.call(prev, gid) ? prev[gid]! : def;
      return { ...prev, [gid]: !current };
    });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = drawerWidth;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setDrawerWidth((w) => Math.min(DRAWER_WIDTH_MAX, Math.max(DRAWER_WIDTH_MIN, startW + delta)));
    };
    const onUp = () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setMobileOpen(false);
    setUserMenuAnchor(null);
    setProgramasMenuAnchor(null);
    setEmpresasMenuAnchor(null);
  };

  const handleProgramaClick = (p: Programa) => {
    const path = p.slug ? `/programas/${p.slug}` : `/programas/${p.id}`;
    handleNavigate(path);
  };

  const isDark = theme.palette.mode === "dark";
  const rail = sidebarCollapsed && !isMobile;
  const effectiveDrawerWidth = rail ? DRAWER_WIDTH_COLLAPSED : drawerWidth;

  /** Sidebar sempre navy (eco da landing); área de conteúdo segue o tema. */
  const side = {
    text: landing.heroText,
    muted: landing.heroMuted,
    faint: landing.heroMuted,
    line: alpha("#fff", 0.1),
    hover: alpha("#fff", 0.07),
    selectedBg: alpha(landing.blueBright, 0.2),
    selectedHover: alpha(landing.blueBright, 0.28),
    accent: "#90CAF9",
    accentBar: landing.blueBright,
  } as const;

  const renderNavLeafRow = (
    item: AppNavItem,
    opts?: { subConnector?: { isLast: boolean } }
  ) => {
    const wrapRail = (node: React.ReactElement) =>
      rail ? (
        <Tooltip key={item.id} title={item.label} placement="right">
          {node}
        </Tooltip>
      ) : (
        node
      );

    if (item.action === "logout") {
      const isSub = Boolean(item.isSubItem || item.indent === 1);
      const logoutColor = "#EF5350";
      return wrapRail(
        <ListItemButton
          key={item.id}
          onClick={() => {
            setMobileOpen(false);
            logout();
          }}
          sx={{
            borderRadius: 1,
            mb: 0.1,
            py: 0.55,
            minHeight: 36,
            pl: rail ? 0 : isSub ? 1.25 : 1.25,
            pr: rail ? 0 : 1,
            ml: rail ? 0 : isSub ? 1 : 0,
            justifyContent: rail ? "center" : "flex-start",
            color: logoutColor,
            "&:hover": {
              bgcolor: alpha("#EF5350", 0.18),
              color: "#FF5252",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: rail ? 0 : isSub ? 30 : 32, color: "inherit", justifyContent: "center" }}>
            {item.icon}
          </ListItemIcon>
          {!rail && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: "body2", fontWeight: 700, fontSize: "0.875rem", color: "inherit" }}
            />
          )}
        </ListItemButton>
      );
    }

    const selected = activePath === item.path;
    const isSub = Boolean(item.isSubItem || item.indent === 1);
    const conn = rail ? undefined : opts?.subConnector;
    const lineColor = side.line;
    const spineX = 14;
    const primaryLabel = (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
        <span>{item.label}</span>
      </Box>
    );
    return wrapRail(
      <ListItemButton
        key={item.id}
        component={Link}
        href={item.path}
        selected={selected}
        onClick={() => setMobileOpen(false)}
        sx={{
          position: "relative",
          borderRadius: 1,
          mb: 0.1,
          py: 0.55,
          minHeight: 36,
          pl: rail ? 0 : conn ? 3.25 : isSub ? 1.25 : 1.25,
          pr: rail ? 0 : 1,
          ml: rail ? 0 : conn ? 0 : isSub ? 1 : 0,
          overflow: "hidden",
          justifyContent: rail ? "center" : "flex-start",
          color: selected ? side.accent : side.muted,
          "&:hover": {
            bgcolor: side.hover,
          },
          ...(selected &&
            !rail && {
              pl: conn ? 3.25 : isSub ? 1.25 : 1.35,
              boxShadow: `inset 3px 0 0 ${side.accentBar}`,
            }),
          ...(selected &&
            rail && {
              bgcolor: side.selectedBg,
            }),
          "&.Mui-selected": {
            bgcolor: side.selectedBg,
            "&:hover": {
              bgcolor: side.selectedHover,
            },
          },
        }}
      >
        {conn ? (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: spineX + 18,
              pointerEvents: "none",
              zIndex: 0,
            }}
            aria-hidden
          >
            <Box
              sx={{
                position: "absolute",
                left: spineX,
                top: 0,
                bottom: conn.isLast ? "50%" : 0,
                width: 0,
                borderLeft: `1px solid ${lineColor}`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: spineX,
                top: "50%",
                width: 12,
                height: 0,
                borderTop: `1px solid ${lineColor}`,
                transform: "translateY(-50%)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: spineX + 10,
                top: "50%",
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: alpha(side.accentBar, 0.65),
                transform: "translate(-50%, -50%)",
              }}
            />
          </Box>
        ) : null}
        <ListItemIcon
          sx={{
            minWidth: rail ? 0 : isSub ? 30 : 32,
            color: selected ? side.accent : side.muted,
            position: "relative",
            zIndex: 1,
            justifyContent: "center",
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!rail && (
          <ListItemText
            primary={primaryLabel}
            primaryTypographyProps={{
              component: "div",
              variant: "body2",
              fontWeight: selected ? 700 : isSub ? 500 : 600,
              fontSize: "0.875rem",
              color: selected ? side.accent : side.text,
            }}
            sx={{ position: "relative", zIndex: 1 }}
          />
        )}
      </ListItemButton>
    );
  };

  /** Link real `/{slug}` do portal de privacidade (mesmo item que no hub), no grupo do menu. */
  const renderNavPortalPublicLeaf = () => {
    if (!programaId || !activePrograma) return null;
    const slug = activePrograma.slug?.trim();
    const lineColor = side.line;
    const spineX = 14;
    const conn = { isLast: true as const };
    const rowSx = {
      position: "relative" as const,
      borderRadius: 1.5,
      mb: 0.1,
      py: 0.45,
      minHeight: 34,
      pl: 3.25,
      pr: 1,
      ml: 0,
      overflow: "hidden" as const,
      color: side.muted,
      "&:hover": { bgcolor: side.hover },
    };
    const connector = (
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: spineX + 18,
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden
      >
        <Box
          sx={{
            position: "absolute",
            left: spineX,
            top: 0,
            bottom: conn.isLast ? "50%" : 0,
            width: 0,
            borderLeft: `1px solid ${lineColor}`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: spineX,
            top: "50%",
            width: 12,
            height: 0,
            borderTop: `1px solid ${lineColor}`,
            transform: "translateY(-50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: spineX + 10,
            top: "50%",
            width: 4,
            height: 4,
            borderRadius: "50%",
            bgcolor: alpha(side.accentBar, 0.65),
            transform: "translate(-50%, -50%)",
          }}
        />
      </Box>
    );
    const primaryLabel = (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
        <span>Portal público (site)</span>
      </Box>
    );

    if (!slug) {
      return (
        <Tooltip
          key="nav-portal-public"
          title="Defina o slug do programa na lista de programas do painel para publicar o site."
        >
          <span style={{ display: "block" }}>
            <ListItemButton disabled sx={{ ...rowSx, opacity: 0.55 }}>
              {connector}
              <ListItemIcon
                sx={{ minWidth: 36, color: side.faint, position: "relative", zIndex: 1 }}
              >
                <OpenInNewIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={primaryLabel}
                secondary="Defina o slug do programa"
                primaryTypographyProps={{ component: "div", variant: "body2", fontWeight: 500, color: side.muted }}
                secondaryTypographyProps={{ variant: "caption", sx: { color: side.faint } }}
                sx={{ position: "relative", zIndex: 1 }}
              />
            </ListItemButton>
          </span>
        </Tooltip>
      );
    }

    const href = `/${encodeURIComponent(slug)}`;

    return (
      <ListItemButton
        key="nav-portal-public"
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setMobileOpen(false)}
        sx={rowSx}
      >
        {connector}
        <ListItemIcon sx={{ minWidth: 36, color: side.muted, position: "relative", zIndex: 1 }}>
          <OpenInNewIcon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText
          primary={primaryLabel}
          secondary={href}
          primaryTypographyProps={{ component: "div", variant: "body2", fontWeight: 500, color: side.text }}
          secondaryTypographyProps={{
            variant: "caption",
            sx: { fontFamily: "monospace", wordBreak: "break-all", color: side.faint },
          }}
          sx={{ position: "relative", zIndex: 1 }}
        />
      </ListItemButton>
    );
  };

  const drawer = (
    <Box
      sx={{
        minHeight: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: side.text,
        background: `
          radial-gradient(ellipse 90% 55% at 0% 0%, ${alpha(landing.blueBright, 0.22)} 0%, transparent 52%),
          radial-gradient(ellipse 70% 40% at 100% 100%, ${alpha(landing.shield, 0.12)} 0%, transparent 48%),
          linear-gradient(180deg, ${landing.navy} 0%, ${landing.ink} 62%, #040E18 100%)
        `,
      }}
    >
      {/* Brand — mesmo plano escuro, com acento azul */}
      <Box
        sx={{
          px: rail ? 0.75 : 1.5,
          py: 1.25,
          flexShrink: 0,
          borderBottom: `1px solid ${side.line}`,
          background: `
            radial-gradient(ellipse 80% 120% at 100% 0%, ${alpha(landing.blueBright, 0.28)} 0%, transparent 55%),
            linear-gradient(145deg, ${alpha("#0C3A66", 0.55)} 0%, transparent 70%)
          `,
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }} onClick={() => setMobileOpen(false)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: rail ? "center" : "flex-start" }}>
            <Box
              sx={{
                borderRadius: 1,
                p: 0.45,
                background: alpha("#fff", 0.1),
                border: `1px solid ${alpha("#fff", 0.12)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 0,
              }}
            >
              <Image src="/logo_p.png" alt="FPSI" width={26} height={26} />
            </Box>
            {!rail && (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight={900}
                  letterSpacing="-0.02em"
                  sx={{ lineHeight: 1.05, color: landing.heroText }}
                >
                  FPSI
                </Typography>
                {programaContextLabel ? (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      display: "block",
                      maxWidth: 170,
                      color: landing.heroMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {programaContextLabel}
                  </Typography>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: landing.heroMuted,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Privacidade & SI
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Link>
      </Box>

      {/* Controles: recolher, tema e conta — abaixo do logo */}
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: `1px solid ${side.line}`,
          px: rail ? 0.5 : 0.75,
          py: 0.65,
          bgcolor: alpha(landing.ink, 0.45),
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: rail ? "column" : "row",
            alignItems: "stretch",
            gap: 0.5,
            width: "100%",
            p: 0.45,
            borderRadius: 1.5,
            bgcolor: alpha("#fff", 0.04),
            border: `1px solid ${alpha("#fff", 0.08)}`,
          }}
        >
          {!isMobile && (
            <Tooltip title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"} placement={rail ? "right" : "bottom"}>
              <IconButton
                size="small"
                onClick={() => setSidebarCollapsed((c) => !c)}
                aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                aria-expanded={!sidebarCollapsed}
                sx={{
                  flex: 1,
                  minHeight: rail ? 36 : 38,
                  borderRadius: 1.25,
                  color: side.muted,
                  bgcolor: alpha("#fff", 0.03),
                  "&:hover": { color: side.text, bgcolor: side.hover },
                }}
              >
                {sidebarCollapsed ? <MenuOpenIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"} placement={rail ? "right" : "bottom"}>
            <IconButton
              size="small"
              onClick={() => setMode()}
              aria-label={mode === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              sx={{
                flex: 1,
                minHeight: rail ? 36 : 38,
                borderRadius: 1.25,
                color: side.muted,
                bgcolor: alpha("#fff", 0.03),
                "&:hover": { color: side.text, bgcolor: side.hover },
              }}
            >
              {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
          {user && (
            <Tooltip title={user.name || user.email || "Conta"} placement={rail ? "right" : "bottom"}>
              <IconButton
                size="small"
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                aria-label="Conta e menu do usuário"
                sx={{
                  flex: 1,
                  minHeight: rail ? 36 : 38,
                  borderRadius: 1.25,
                  p: 0.35,
                  bgcolor: alpha("#fff", 0.03),
                  "&:hover": { bgcolor: side.hover },
                }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: rail ? 26 : 28,
                    height: rail ? 26 : 28,
                    fontSize: 12,
                    bgcolor: alpha(landing.blueBright, 0.28),
                    color: side.accent,
                    border: `1px solid ${alpha("#fff", 0.14)}`,
                  }}
                >
                  {(user.name || user.email || "").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: "1 1 auto", py: 0.5, px: 0.75, minHeight: 0, overflowY: "auto" }}>
        {navSections.map((section, sectionIdx) => (
          <Box
            key={section.id}
            sx={{
              mb: 1.25,
              ...(rail
                ? {
                    ...(sectionIdx > 0
                      ? { pt: 0.75, mt: 0.25, borderTop: `1px solid ${side.line}` }
                      : {}),
                  }
                : {
                    mx: 0.15,
                    borderRadius: 1.5,
                    bgcolor: alpha("#fff", section.id === "programa" ? 0.05 : 0.035),
                    border: `1px solid ${alpha("#fff", 0.09)}`,
                    boxShadow: `inset 0 1px 0 ${alpha("#fff", 0.04)}`,
                    overflow: "hidden",
                  }),
            }}
          >
            {!rail && (
              <Box
                sx={{
                  px: 1.25,
                  py: 0.65,
                  bgcolor:
                    section.id === "programa"
                      ? alpha(landing.blueBright, 0.14)
                      : alpha("#fff", 0.06),
                  borderBottom: `1px solid ${alpha("#fff", 0.07)}`,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    color: section.id === "programa" ? side.accent : landing.heroText,
                    letterSpacing: 1.1,
                    fontWeight: 800,
                    fontSize: "0.6875rem",
                    lineHeight: 1.2,
                    opacity: 0.95,
                  }}
                >
                  {section.title}
                </Typography>
              </Box>
            )}
            <List dense disablePadding component="nav" sx={{ py: rail ? 0.2 : 0.45, px: rail ? 0 : 0.35 }}>
              {section.id === "programa" && programaId
                ? parseProgramaNavItems(section.items).map((block) => {
                    if (block.kind === "single") {
                      return renderNavLeafRow(block.item);
                    }
                    const open = isNavGroupExpanded(block.groupId);
                    const hubSelected = activePath === block.hub.path;
                    const hubPrimary = (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                        <span>{block.hub.label}</span>
                      </Box>
                    );
                    if (rail) {
                      return (
                        <Tooltip key={block.groupId} title={block.hub.label} placement="right">
                          <ListItemButton
                            selected={hubSelected}
                            onClick={(e) => {
                              setCollapsedGroupMenu({
                                anchor: e.currentTarget,
                                hub: block.hub,
                                subs: block.subs,
                                groupId: block.groupId,
                              });
                            }}
                            sx={{
                              borderRadius: 1,
                              mb: 0.1,
                              py: 0.55,
                              minHeight: 36,
                              justifyContent: "center",
                              color: hubSelected ? side.accent : side.muted,
                              "&:hover": { bgcolor: side.hover },
                              "&.Mui-selected": {
                                bgcolor: side.selectedBg,
                                "&:hover": { bgcolor: side.selectedHover },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 0, color: hubSelected ? side.accent : side.muted, justifyContent: "center" }}>
                              {block.hub.icon}
                            </ListItemIcon>
                          </ListItemButton>
                        </Tooltip>
                      );
                    }
                    return (
                      <React.Fragment key={block.groupId}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "stretch",
                            mb: 0.1,
                            gap: 0,
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            href={block.hub.path}
                            selected={hubSelected}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              position: "relative",
                              borderRadius: 1,
                              py: 0.55,
                              minHeight: 36,
                              pl: 1.25,
                              pr: 0.25,
                              color: hubSelected ? side.accent : side.muted,
                              "&:hover": { bgcolor: side.hover },
                              "&.Mui-selected": {
                                bgcolor: side.selectedBg,
                                boxShadow: `inset 3px 0 0 ${side.accentBar}`,
                                "&:hover": {
                                  bgcolor: side.selectedHover,
                                },
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 32,
                                color: hubSelected ? side.accent : side.muted,
                              }}
                            >
                              {block.hub.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={hubPrimary}
                              primaryTypographyProps={{
                                component: "div",
                                variant: "body2",
                                fontWeight: hubSelected ? 700 : 600,
                                fontSize: "0.875rem",
                                color: hubSelected ? side.accent : side.text,
                              }}
                            />
                          </ListItemButton>
                          <IconButton
                            size="small"
                            aria-label={open ? "Recolher subitens" : "Expandir subitens"}
                            aria-expanded={open}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleNavGroup(block.groupId);
                            }}
                            sx={{
                              alignSelf: "center",
                              flexShrink: 0,
                              mr: 0.15,
                              p: 0.35,
                              color: side.muted,
                              "&:hover": { bgcolor: side.hover, color: side.text },
                            }}
                          >
                            <ExpandMoreIcon
                              sx={{
                                fontSize: 18,
                                transition: theme.transitions.create("transform"),
                                transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                              }}
                            />
                          </IconButton>
                        </Box>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                          <List component="div" dense disablePadding>
                            {block.subs.map((sub, idx) =>
                              renderNavLeafRow(sub, {
                                subConnector: {
                                  isLast:
                                    idx === block.subs.length - 1 && block.groupId !== "portal",
                                },
                              })
                            )}
                            {block.groupId === "portal" ? renderNavPortalPublicLeaf() : null}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    );
                  })
                : section.items.map((item) => renderNavLeafRow(item))}
            </List>
          </Box>
        ))}

        <Divider sx={{ my: 0.75, borderColor: side.line }} />

        {!rail && (
          <Typography
            variant="overline"
            sx={{
              px: 1.25,
              py: 0.35,
              display: "block",
              color: side.faint,
              letterSpacing: 0.9,
              fontWeight: 700,
              fontSize: "0.75rem",
              lineHeight: 1.2,
            }}
          >
            Programas
          </Typography>
        )}
        <List dense disablePadding>
          <Tooltip title="Novo programa" placement="right" disableHoverListener={!rail}>
            <ListItemButton
              component={Link}
              href="/dashboard?novoPrograma=1"
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 1.5,
                mb: 0.35,
                py: 0.45,
                minHeight: 34,
                justifyContent: rail ? "center" : "flex-start",
                border: rail ? "none" : `1px dashed ${alpha(landing.blueBright, 0.45)}`,
                bgcolor: alpha(landing.blueBright, 0.08),
                color: side.accent,
                "&:hover": {
                  bgcolor: alpha(landing.blueBright, 0.16),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: rail ? 0 : 32, justifyContent: "center" }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 26,
                    height: 26,
                    bgcolor: alpha(landing.blueBright, 0.22),
                    color: side.accent,
                  }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </ListItemIcon>
              {!rail && (
                <ListItemText
                  primary="Novo programa"
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    color: side.accent,
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
          {programas.map((p) => {
            const href = p.slug ? `/programas/${p.slug}` : `/programas/${p.id}`;
            const selected =
              Boolean(programaId) && (p.slug === programaId || String(p.id) === programaId);
            const thumb = p.logo_programa || p.logo_orgao_empresa || undefined;
            const titulo = getProgramaTituloPrincipal(p);
            return (
              <Tooltip key={p.id} title={titulo} placement="right" disableHoverListener={!rail}>
                <ListItemButton
                  component={Link}
                  href={href}
                  selected={selected}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.1,
                    py: 0.4,
                    minHeight: 34,
                    alignItems: "center",
                    justifyContent: rail ? "center" : "flex-start",
                    color: selected ? side.accent : side.muted,
                    "&:hover": { bgcolor: side.hover },
                    "&.Mui-selected": {
                      bgcolor: side.selectedBg,
                      boxShadow: rail ? "none" : `inset 3px 0 0 ${side.accentBar}`,
                      "&:hover": {
                        bgcolor: side.selectedHover,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: rail ? 0 : 32, justifyContent: "center" }}>
                    <Avatar
                      variant="rounded"
                      src={thumb}
                      alt=""
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: 12,
                        bgcolor: alpha(landing.blueBright, 0.18),
                        color: side.accent,
                      }}
                    >
                      <FolderIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemIcon>
                  {!rail && (
                    <ListItemText
                      primary={titulo}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: selected ? 700 : 500,
                        fontSize: "0.8125rem",
                        noWrap: true,
                        color: selected ? side.accent : side.text,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  const userMenus = (
    <>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => {
          setUserMenuAnchor(null);
          setProgramasMenuAnchor(null);
          setEmpresasMenuAnchor(null);
        }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1, maxWidth: 280 }}>
            <Typography variant="caption" color="text.secondary">
              Logado como
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {user.name || user.email}
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={() => handleNavigate("/dashboard")}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          Início
        </MenuItem>
        <MenuItem onClick={() => handleNavigate("/perfil")}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Perfil
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setProgramasMenuAnchor(programasMenuAnchor ? null : e.currentTarget);
            setEmpresasMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <FolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Programas" />
          <ExpandMoreIcon sx={{ fontSize: 18, transform: programasMenuAnchor ? "rotate(180deg)" : undefined }} />
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setEmpresasMenuAnchor(empresasMenuAnchor ? null : e.currentTarget);
            setProgramasMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Empresas" />
          <ExpandMoreIcon sx={{ fontSize: 18, transform: empresasMenuAnchor ? "rotate(180deg)" : undefined }} />
        </MenuItem>
        {isSystemAdmin && (
          <MenuItem onClick={() => handleNavigate("/admin")}>
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            Administração
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setCookiePrefsOpen(true);
            setUserMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <PrivacyTipIcon fontSize="small" />
          </ListItemIcon>
          Privacidade e cookies
        </MenuItem>
        <MenuItem
          onClick={() => {
            setCreditosOpen(true);
            setUserMenuAnchor(null);
          }}
        >
          <ListItemIcon>
            <MenuBookOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Créditos e fontes
        </MenuItem>
        <MenuItem
          component="a"
          href={FPSI_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setUserMenuAnchor(null)}
        >
          <ListItemIcon>
            <GitHubIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="GitHub" secondary="código aberto" />
          <OpenInNewIcon sx={{ fontSize: 14, ml: 1, opacity: 0.55 }} />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            logout();
            setUserMenuAnchor(null);
          }}
          sx={{
            color: "error.main",
            fontWeight: 600,
            "& .MuiListItemIcon-root": { color: "error.main" },
            "&:hover": { bgcolor: (t) => alpha(t.palette.error.main, 0.08) },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={programasMenuAnchor}
        open={Boolean(programasMenuAnchor)}
        onClose={() => setProgramasMenuAnchor(null)}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        PaperProps={{ sx: { maxHeight: 400, minWidth: 260 } }}
      >
        {programas.map((p) => (
          <MenuItem
            key={p.id}
            onClick={() => {
              handleProgramaClick(p);
              setUserMenuAnchor(null);
            }}
          >
            <ListItemText
              primary={getProgramaTituloPrincipal(p)}
              secondary={getProgramaTituloOrganizacao(p) || undefined}
            />
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={empresasMenuAnchor}
        open={Boolean(empresasMenuAnchor)}
        onClose={() => setEmpresasMenuAnchor(null)}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
      >
        {empresas.map((e) => (
          <MenuItem
            key={e.id}
            onClick={() => {
              handleNavigate("/dashboard");
              setUserMenuAnchor(null);
            }}
          >
            <ListItemText primary={e.razao_social || e.nome_fantasia || `Empresa ${e.id}`} />
          </MenuItem>
        ))}
      </Menu>
      <CookiePreferencesDialog open={cookiePrefsOpen} onClose={() => setCookiePrefsOpen(false)} />
      <CreditosDialog open={creditosOpen} onClose={() => setCreditosOpen(false)} />
      <Menu
        anchorEl={collapsedGroupMenu?.anchor ?? null}
        open={Boolean(collapsedGroupMenu)}
        onClose={() => setCollapsedGroupMenu(null)}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        {collapsedGroupMenu && (
          <>
            <MenuItem
              component={Link}
              href={collapsedGroupMenu.hub.path}
              selected={activePath === collapsedGroupMenu.hub.path}
              onClick={() => {
                setMobileOpen(false);
                setCollapsedGroupMenu(null);
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{collapsedGroupMenu.hub.icon}</ListItemIcon>
              <ListItemText primary={collapsedGroupMenu.hub.label} primaryTypographyProps={{ fontWeight: 700 }} />
            </MenuItem>
            <Divider />
            {collapsedGroupMenu.subs.map((sub) => (
              <MenuItem
                key={sub.id}
                component={Link}
                href={sub.path}
                selected={activePath === sub.path}
                onClick={() => {
                  setMobileOpen(false);
                  setCollapsedGroupMenu(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{sub.icon}</ListItemIcon>
                <ListItemText primary={sub.label} />
              </MenuItem>
            ))}
            {collapsedGroupMenu.groupId === "portal" ? (
              <>
                <Divider />
                {activePrograma?.slug?.trim() ? (
                  <MenuItem
                    component="a"
                    href={`/${encodeURIComponent(activePrograma.slug.trim())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setCollapsedGroupMenu(null)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <OpenInNewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Portal público (site)"
                      secondary={`/${activePrograma.slug.trim()}`}
                    />
                  </MenuItem>
                ) : (
                  <MenuItem disabled>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <OpenInNewIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Portal público (site)"
                      secondary="Defina o slug do programa"
                    />
                  </MenuItem>
                )}
              </>
            ) : null}
          </>
        )}
      </Menu>
    </>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", minHeight: "100vh", bgcolor: "transparent", position: "relative" }}>
      <SkipToMainLink />
      <AppAtmosphere />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: Math.min(drawerWidth, 320),
            maxWidth: "90vw",
            boxSizing: "border-box",
            backgroundImage: "none",
            bgcolor: landing.ink,
            borderRight: `1px solid ${alpha("#fff", 0.08)}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>{drawer}</Box>
      </Drawer>

      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          display: { xs: "none", md: "flex" },
          width: effectiveDrawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          overflow: "hidden",
          position: "relative",
          zIndex: 2,
          borderRight: `1px solid ${alpha(landing.ink, 0.55)}`,
          boxShadow: `4px 0 28px ${alpha(landing.ink, 0.35)}`,
        }}
      >
        <Box
          sx={{
            width: effectiveDrawerWidth,
            minHeight: "100vh",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {drawer}
          {!rail && (
            <Box
              onMouseDown={startResize}
              role="separator"
              aria-orientation="vertical"
              aria-label="Redimensionar menu"
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 10,
                height: "100%",
                cursor: "col-resize",
                zIndex: 2,
                "&:hover": {
                  bgcolor: alpha(landing.blueBright, 0.18),
                },
              }}
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Mobile only: barra compacta (não branca) */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: "flex", md: "none" },
            top: 0,
            bgcolor: isDark ? alpha(landing.navy, 0.94) : alpha(landing.navy, 0.96),
            color: landing.heroText,
            borderBottom: `1px solid ${alpha("#fff", 0.08)}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <Toolbar sx={{ minHeight: 44, px: 1, gap: 0.5 }}>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" size="small">
              <MenuIcon fontSize="small" />
            </IconButton>
            <Box
              component={Link}
              href="/dashboard"
              sx={{ display: "flex", alignItems: "center", gap: 0.75, textDecoration: "none", color: "inherit", minWidth: 0, flex: 1 }}
            >
              <Image src="/logo_p.png" alt="FPSI" width={22} height={22} />
              <Typography variant="subtitle2" fontWeight={800} noWrap letterSpacing="-0.02em">
                {programaContextLabel || "FPSI"}
              </Typography>
            </Box>
            <IconButton color="inherit" size="small" onClick={() => setMode()} aria-label="Alternar tema">
              {mode === "dark" ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
            {user && (
              <IconButton color="inherit" size="small" onClick={(e) => setUserMenuAnchor(e.currentTarget)} sx={{ p: 0.25 }}>
                <Avatar src={user.avatar} sx={{ width: 28, height: 28, fontSize: 12 }}>
                  {(user.name || user.email || "").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {children}
        </Box>
        {userMenus}
      </Box>
    </Box>
  );
}
