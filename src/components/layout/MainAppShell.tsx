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
import { getProgramaTituloOrganizacao, getProgramaTituloPrincipal } from "@/lib/utils/programaDisplay";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import type { AppNavItem } from "@/lib/navigation/appNavigation";
import {
  getBestMatchingNavPath,
  getGlobalNavSections,
  getProgramaNavSections,
  isNavGroupDiagnosticoPath,
  isNavGroupPortalPath,
  isNavGroupTratamentoPath,
  parseProgramaNavItems,
} from "@/lib/navigation/appNavigation";
import type { EmpresaRow } from "@/lib/services/dataService";
import { CookiePreferencesDialog } from "@/components/privacy/CookiePreferencesDialog";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

type IUser = { id: number; name: string; email: string; avatar: string };

const DRAWER_WIDTH_DEFAULT = 288;
const DRAWER_WIDTH_MIN = 220;
const DRAWER_WIDTH_MAX = 440;
const LS_WIDTH = "fpsi-sidebar-width";
const LS_HIDDEN = "fpsi-sidebar-hidden";

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
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [navGroupOpen, setNavGroupOpen] = useState<Record<string, boolean>>({});
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  const prevProgramaForNavRef = useRef<string | null>(null);

  const programaMatch = pathname.match(/^\/programas\/([\w-]+)(\/|$)/);
  const programaId = programaMatch ? programaMatch[1] : null;
  const programaBase = programaId ? `/programas/${programaId}` : "";

  const defaultNavGroups = useMemo(() => {
    if (!programaBase) return { tratamento: false, diagnostico: false, portal: false };
    return {
      tratamento: isNavGroupTratamentoPath(pathname, programaBase),
      diagnostico: isNavGroupDiagnosticoPath(pathname, programaBase),
      portal: isNavGroupPortalPath(pathname, programaBase),
    };
  }, [pathname, programaBase]);

  const navSections = useMemo(() => {
    const global = getGlobalNavSections();
    if (!programaId) return global;
    return [...global, ...getProgramaNavSections(programaId)];
  }, [programaId]);

  const flatPaths = useMemo(
    () => navSections.flatMap((s) => s.items.map((i) => i.path)),
    [navSections]
  );
  const activePath = getBestMatchingNavPath(pathname, flatPaths);

  const activePrograma = useMemo(() => {
    if (!programaId || programas.length === 0) return null;
    return (
      programas.find((p) => p.slug === programaId || String(p.id) === programaId) ?? null
    );
  }, [programaId, programas]);

  const programaContextLabel = useMemo(() => {
    if (!programaId) return null;
    if (activePrograma) {
      const main = getProgramaTituloPrincipal(activePrograma);
      const org = getProgramaTituloOrganizacao(activePrograma);
      return org ? `${main} · ${org}` : main;
    }
    return "Programa";
  }, [programaId, activePrograma]);

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
      if (localStorage.getItem(LS_HIDDEN) === "1") setSidebarHidden(true);
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
      localStorage.setItem(LS_HIDDEN, sidebarHidden ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarHidden]);

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

  const renderNavLeafRow = (
    item: AppNavItem,
    opts?: { subConnector?: { isLast: boolean } }
  ) => {
    const selected = activePath === item.path;
    const isSub = Boolean(item.isSubItem || item.indent === 1);
    const conn = opts?.subConnector;
    const lineColor = alpha(theme.palette.divider, 0.4);
    const spineX = 14;
    const primaryLabel = (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
        <span>{item.label}</span>
      </Box>
    );
    return (
      <ListItemButton
        key={item.id}
        component={Link}
        href={item.path}
        selected={selected}
        onClick={() => setMobileOpen(false)}
        sx={{
          position: "relative",
          borderRadius: 2,
          mb: 0.25,
          py: 1,
          pl: conn ? 3.5 : isSub ? 1.25 : 1.5,
          pr: 1.5,
          ml: conn ? 0 : isSub ? 1.25 : 0,
          overflow: "hidden",
          "&.Mui-selected": {
            bgcolor: alpha(theme.palette.primary.main, 0.14),
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.2),
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
                bgcolor: alpha(theme.palette.primary.main, 0.45),
                transform: "translate(-50%, -50%)",
              }}
            />
          </Box>
        ) : null}
        <ListItemIcon
          sx={{
            minWidth: isSub ? 36 : 40,
            color: selected ? "primary.main" : "text.secondary",
            position: "relative",
            zIndex: 1,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={primaryLabel}
          primaryTypographyProps={{
            component: "div",
            variant: "body2",
            fontWeight: selected ? 700 : isSub ? 500 : 600,
            color: selected ? "primary.main" : "text.primary",
          }}
          sx={{ position: "relative", zIndex: 1 }}
        />
      </ListItemButton>
    );
  };

  /** Link real `/{slug}` do portal de privacidade (mesmo item que no hub), no grupo do menu. */
  const renderNavPortalPublicLeaf = () => {
    if (!programaId || !activePrograma) return null;
    const slug = activePrograma.slug?.trim();
    const lineColor = alpha(theme.palette.divider, 0.4);
    const spineX = 14;
    const conn = { isLast: true as const };
    const rowSx = {
      position: "relative" as const,
      borderRadius: 2,
      mb: 0.25,
      py: 1,
      pl: 3.5,
      pr: 1.5,
      ml: 0,
      overflow: "hidden" as const,
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
            bgcolor: alpha(theme.palette.primary.main, 0.45),
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
            <ListItemButton disabled sx={rowSx}>
              {connector}
              <ListItemIcon
                sx={{ minWidth: 36, color: "text.disabled", position: "relative", zIndex: 1 }}
              >
                <OpenInNewIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={primaryLabel}
                secondary="Defina o slug do programa"
                primaryTypographyProps={{ component: "div", variant: "body2", fontWeight: 500 }}
                secondaryTypographyProps={{ variant: "caption" }}
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
        <ListItemIcon sx={{ minWidth: 36, color: "text.secondary", position: "relative", zIndex: 1 }}>
          <OpenInNewIcon sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText
          primary={primaryLabel}
          secondary={href}
          primaryTypographyProps={{ component: "div", variant: "body2", fontWeight: 500 }}
          secondaryTypographyProps={{ variant: "caption", sx: { fontFamily: "monospace", wordBreak: "break-all" } }}
          sx={{ position: "relative", zIndex: 1 }}
        />
      </ListItemButton>
    );
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.dark, 0.35)} 0%, ${theme.palette.background.paper} 38%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${theme.palette.background.paper} 40%)`,
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }} onClick={() => setMobileOpen(false)}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                borderRadius: 2,
                p: 0.75,
                background: alpha(theme.palette.primary.main, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image src="/logo_p.png" alt="FPSI" width={36} height={36} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} letterSpacing={0.4}>
                FPSI
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.25, whiteSpace: "normal" }}
              >
                Privacidade e segurança da informação
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", py: 1, px: 1 }}>
        {navSections.map((section) => (
          <Box key={section.id} sx={{ mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                px: 1.5,
                py: 1,
                display: "block",
                color: "text.secondary",
                letterSpacing: 1.2,
                fontWeight: 700,
              }}
            >
              {section.title}
            </Typography>
            <List dense disablePadding component="nav">
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
                    return (
                      <React.Fragment key={block.groupId}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "stretch",
                            mb: 0.25,
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
                              borderRadius: 2,
                              py: 1,
                              pl: 1.5,
                              pr: 0.5,
                              "&.Mui-selected": {
                                bgcolor: alpha(theme.palette.primary.main, 0.14),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                },
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 40,
                                color: hubSelected ? "primary.main" : "text.secondary",
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
                                color: hubSelected ? "primary.main" : "text.primary",
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
                              mr: 0.25,
                              color: "text.secondary",
                            }}
                          >
                            <ExpandMoreIcon
                              sx={{
                                fontSize: 22,
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

        <Divider sx={{ my: 1 }} />

        <Typography
          variant="overline"
          sx={{
            px: 1.5,
            py: 1,
            display: "block",
            color: "text.secondary",
            letterSpacing: 1.2,
            fontWeight: 700,
          }}
        >
          Programas
        </Typography>
        <List dense disablePadding>
          <ListItemButton
            component={Link}
            href="/dashboard?novoPrograma=1"
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.75,
              py: 1,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 44, mt: 0.25 }}>
              <Avatar
                variant="rounded"
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 18,
                  bgcolor: alpha(theme.palette.primary.main, 0.18),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <AddIcon sx={{ fontSize: 22 }} />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Novo programa"
              primaryTypographyProps={{ variant: "body2", fontWeight: 700, color: "primary.main" }}
            />
          </ListItemButton>
          {programas.map((p) => {
            const href = p.slug ? `/programas/${p.slug}` : `/programas/${p.id}`;
            const selected =
              Boolean(programaId) && (p.slug === programaId || String(p.id) === programaId);
            const thumb = p.logo_programa || p.logo_orgao_empresa || undefined;
            return (
              <ListItemButton
                key={p.id}
                component={Link}
                href={href}
                selected={selected}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.25,
                  py: 1,
                  alignItems: "flex-start",
                  "&.Mui-selected": {
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, mt: 0.25 }}>
                  <Avatar
                    variant="rounded"
                    src={thumb}
                    alt=""
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 18,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 22 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={getProgramaTituloPrincipal(p)}
                  secondary={getProgramaTituloOrganizacao(p) || undefined}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: selected ? 700 : 500,
                    noWrap: true,
                    color: selected ? "primary.main" : "text.primary",
                  }}
                  secondaryTypographyProps={{ variant: "caption", noWrap: true }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  const appBar = (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        top: 0,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, 0.92),
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, md: 64 },
          alignItems: "center",
        }}
      >
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(true)}
          sx={{ mr: 1, display: { md: "none" } }}
          aria-label="Abrir menu"
        >
          <MenuIcon />
        </IconButton>
        {!isMobile && (
          <Tooltip title={sidebarHidden ? "Mostrar menu lateral" : "Ocultar menu lateral"}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setSidebarHidden((h) => !h)}
              sx={{ mr: 1 }}
              aria-label={sidebarHidden ? "Mostrar menu" : "Ocultar menu"}
            >
              {sidebarHidden ? <MenuOpenIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          {programaContextLabel ? (
            <Box
              component={Link}
              href={programaBase}
              aria-label="Programa ativo — ir para visão geral"
              onClick={() => setMobileOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                textDecoration: "none",
                color: "inherit",
                "&:hover .programa-ativo-label": { color: "primary.main" },
              }}
            >
              <Avatar
                variant="rounded"
                src={activePrograma ? getProgramaLogoDisplayUrl(activePrograma) ?? undefined : undefined}
                alt=""
                sx={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  fontSize: 12,
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  color: "primary.main",
                }}
              >
                <FolderIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography
                className="programa-ativo-label"
                variant="subtitle2"
                component="span"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: 0.15,
                  color: "text.primary",
                  minWidth: 0,
                }}
              >
                {programaContextLabel}
              </Typography>
            </Box>
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
          {user && (
            <>
              <Tooltip title="Conta">
                <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
                  <Avatar src={user.avatar} sx={{ width: 34, height: 34 }}>
                    {(user.name || user.email || "").charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => {
                  setUserMenuAnchor(null);
                  setProgramasMenuAnchor(null);
                  setEmpresasMenuAnchor(null);
                }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1, maxWidth: 280 }}>
                  <Typography variant="caption" color="text.secondary">
                    Logado como
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user.name || user.email}
                  </Typography>
                </Box>
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
                <Divider />
                <MenuItem
                  onClick={() => {
                    logout();
                    setUserMenuAnchor(null);
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
                  <MenuItem key={p.id} onClick={() => { handleProgramaClick(p); setUserMenuAnchor(null); }}>
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
                  <MenuItem key={e.id} onClick={() => { handleNavigate("/dashboard"); setUserMenuAnchor(null); }}>
                    <ListItemText primary={e.razao_social || e.nome_fantasia || `Empresa ${e.id}`} />
                  </MenuItem>
                ))}
              </Menu>
              <CookiePreferencesDialog open={cookiePrefsOpen} onClose={() => setCookiePrefsOpen(false)} />
            </>
          )}
        </Box>
        </Toolbar>
      </AppBar>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Mobile: drawer cobre o conteúdo; desktop: coluna só do menu (altura total, não fica sob a barra) */}
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
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="nav"
        aria-label="Navegação principal"
        sx={{
          display: { xs: "none", md: "flex" },
          width: sidebarHidden ? 0 : drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create("width", { duration: theme.transitions.duration.shorter }),
          overflow: "hidden",
          position: "relative",
          borderRight: sidebarHidden ? 0 : 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            width: drawerWidth,
            height: "100vh",
            position: "sticky",
            top: 0,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {drawer}
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
              display: sidebarHidden ? "none" : "block",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {appBar}
        <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
