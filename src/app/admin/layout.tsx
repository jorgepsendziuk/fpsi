"use client";

import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, Skeleton, IconButton } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Policy as PolicyIcon,
  Security as SecurityIcon,
  Checklist as ChecklistIcon,
  Category as CategoryIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminPanelIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { Header } from "@components/header";

const DRAWER_WIDTH = 260;

const ADMIN_MENU_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: <DashboardIcon /> },
  { label: "Modelos de Políticas", path: "/admin/modelos-politicas", icon: <PolicyIcon /> },
  { label: "Controles", path: "/admin/controles", icon: <SecurityIcon /> },
  { label: "Medidas", path: "/admin/medidas", icon: <ChecklistIcon /> },
  { label: "Diagnósticos", path: "/admin/diagnosticos", icon: <CategoryIcon /> },
  { label: "Cargos", path: "/admin/cargos", icon: <BadgeIcon /> },
  { label: "Departamentos", path: "/admin/departamentos", icon: <BusinessIcon /> },
  { label: "Configurações", path: "/admin/config", icon: <SettingsIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useGetIdentity();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (!user || userLoading) return;
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setIsAdmin(data?.isAdmin === true);
        if (!data?.isAdmin) {
          router.replace("/dashboard");
        }
      } catch {
        setIsAdmin(false);
        router.replace("/dashboard");
      }
    };
    checkAdmin();
  }, [user, userLoading, router]);

  if (userLoading || isAdmin === false) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Skeleton variant="rectangular" width={300} height={100} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const drawerContent = (
    <Box sx={{ py: 2, px: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, mb: 2 }}>
        <AdminPanelIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="primary">
          Administração
        </Typography>
      </Box>
      <List>
        {ADMIN_MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              selected={isActive}
              onClick={() => isMobile && setMobileDrawerOpen(false)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? "primary.main" : "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header sticky />
      <Box sx={{ display: "flex" }}>
        {isMobile && (
          <IconButton
            onClick={() => setMobileDrawerOpen(true)}
            sx={{ position: "fixed", top: 70, left: 8, zIndex: 1300, bgcolor: "background.paper", boxShadow: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileDrawerOpen : true}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              mt: { xs: 7, md: 8 },
              borderRight: 1,
              borderColor: "divider",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
