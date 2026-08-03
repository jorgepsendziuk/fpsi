"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { AdminStatusChip } from "@/components/admin/AdminStatusChip";
import type { SetupStatus } from "@/lib/setup/setupStatus";

type AdminStats = {
  counts: {
    diagnosticos: number | null;
    controles: number | null;
    medidas: number | null;
    cargos: number | null;
    departamentos: number | null;
    politicaModelos: number | null;
    programas: number | null;
    profiles: number | null;
    systemAdmins: number;
  };
  setup: SetupStatus;
};

const STAT_CARDS = [
  { key: "diagnosticos", label: "Diagnósticos", path: "/admin/diagnosticos", color: "#9C27B0" },
  { key: "controles", label: "Controles", path: "/admin/controles", color: "#4CAF50" },
  { key: "medidas", label: "Medidas", path: "/admin/medidas", color: "#FF9800" },
  { key: "politicaModelos", label: "Modelos de políticas", path: "/admin/modelos-politicas", color: "#2196F3" },
  { key: "cargos", label: "Cargos", path: "/admin/cargos", color: "#607D8B" },
  { key: "departamentos", label: "Departamentos", path: "/admin/departamentos", color: "#00BCD4" },
  { key: "programas", label: "Programas", path: "/dashboard", color: "#673AB7" },
  { key: "profiles", label: "Usuários", path: null, color: "#795548" },
] as const;

export function AdminStatsPanel() {
  const theme = useTheme();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} sm={4} md={3} key={i}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Saúde do sistema
        </Typography>
        <AdminStatusChip status={stats.setup.ready ? "complete" : stats.setup.database.connected ? "warning" : "pending"} />
        {stats.setup.database.message && (
          <Typography variant="body2" color="text.secondary">
            {stats.setup.database.message}
          </Typography>
        )}
      </Box>

      <Grid container spacing={2}>
        {STAT_CARDS.map((card) => {
          const value = stats.counts[card.key as keyof typeof stats.counts];
          const content = (
            <Card
              sx={{
                height: "100%",
                border: `1px solid ${alpha(card.color, 0.25)}`,
                transition: "transform 0.2s",
                ...(card.path ? { "&:hover": { transform: "translateY(-2px)" } } : {}),
              }}
            >
              <CardContent>
                <Typography variant="h4" fontWeight={800} sx={{ color: card.color }}>
                  {value ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </CardContent>
            </Card>
          );

          return (
            <Grid item xs={6} sm={4} md={3} key={card.key}>
              {card.path ? (
                <Box component={Link} href={card.path} sx={{ textDecoration: "none", color: "inherit" }}>
                  {content}
                </Box>
              ) : (
                content
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
