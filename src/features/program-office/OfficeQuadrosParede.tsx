"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Card, CardActionArea, Grid, Stack, Typography } from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import type { ModulosResumoApi } from "@/lib/services/dataService";

type Props = {
  idOrSlug: string;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
};

export function OfficeQuadrosParede({ idOrSlug, resumo, resumoLoading }: Props) {
  const theme = useTheme();
  const base = `/programas/${idOrSlug}`;
  const c = resumo?.conformidade;
  const mat = resumo?.maturidade?.length ?? 0;

  const boards = [
    {
      key: "gov",
      titulo: "Estrutura de tratamento",
      subtitulo: "Diagrama e governança LGPD",
      href: `${base}/responsabilidades`,
      icon: <AccountTreeOutlinedIcon sx={{ fontSize: 36 }} />,
      stats: resumoLoading ? "…" : resumo ? `${resumo.responsabilidades.papeisInstituicoes} instituições · ${resumo.responsabilidades.conexoes} vínculos` : "—",
    },
    {
      key: "mat",
      titulo: "Níveis de maturidade",
      subtitulo: "Diagnósticos do programa",
      href: `${base}/diagnostico`,
      icon: <AssessmentOutlinedIcon sx={{ fontSize: 36 }} />,
      stats: resumoLoading ? "…" : `${mat} diagnóstico(s) com índice`,
    },
    {
      key: "risk",
      titulo: "Tratamento de dados e riscos",
      subtitulo: "ROPA · RIPD · Incidentes",
      href: `${base}/conformidade`,
      icon: <ShieldOutlinedIcon sx={{ fontSize: 36 }} />,
      stats: resumoLoading
        ? "…"
        : c
          ? `${c.ropaOperacoes} ROPA · ${c.ripd} RIPD · ${c.incidentes} incidentes`
          : "—",
    },
  ];

  return (
    <Box>
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.12, mb: 1 }}>
        Quadros na parede
      </Typography>
      <Grid container spacing={2}>
        {boards.map((b) => (
          <Grid item xs={12} md={4} key={b.key}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                },
              }}
            >
              <CardActionArea component={NextLink} href={b.href} sx={{ height: "100%", alignItems: "stretch", p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ color: "primary.main", opacity: 0.9 }}>{b.icon}</Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {b.titulo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.subtitulo}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                    {b.stats}
                  </Typography>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
