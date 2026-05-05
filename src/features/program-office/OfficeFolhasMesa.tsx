"use client";

import NextLink from "next/link";
import { alpha, useTheme } from "@mui/material/styles";
import { Box, Card, CardActionArea, Grid, Stack, Typography } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import type { ModulosResumoApi } from "@/lib/services/dataService";

type Props = {
  idOrSlug: string;
  resumo: ModulosResumoApi | null;
  resumoLoading: boolean;
};

/** Folhas sobre a mesa — mesmos atalhos que no conceito do produto. */
export function OfficeFolhasMesa({ idOrSlug, resumo, resumoLoading }: Props) {
  const theme = useTheme();
  const base = `/programas/${idOrSlug}`;

  const folhas: {
    titulo: string;
    detalhe: string;
    href: string;
  }[] = [
    {
      titulo: "Níveis de maturidade",
      detalhe: resumoLoading
        ? "…"
        : resumo
          ? `${resumo.maturidade.length} índice(s) calculado(s)`
          : "—",
      href: `${base}/diagnostico`,
    },
    {
      titulo: "Plano de trabalho",
      detalhe: resumoLoading
        ? "…"
        : resumo
          ? `${resumo.planoAcao.comResposta}/${resumo.planoAcao.total} medidas com resposta`
          : "—",
      href: `${base}/planos-acao`,
    },
    {
      titulo: "Tratamento de dados e riscos",
      detalhe: resumoLoading
        ? "…"
        : resumo && resumo.conformidade
          ? `ROPA ${resumo.conformidade.ropaOperacoes} · RIPD ${resumo.conformidade.ripd} · Incidentes ${resumo.conformidade.incidentes}`
          : "—",
      href: `${base}/conformidade`,
    },
    {
      titulo: "Políticas",
      detalhe: resumoLoading
        ? "…"
        : resumo
          ? `${resumo.politicas.implementadas} implementadas (catálogo ${resumo.politicas.catalogoTipos} tipos)`
          : "—",
      href: `${base}/politicas`,
    },
  ];

  return (
    <Box>
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.12, mb: 1 }}>
        Folhas na mesa
      </Typography>
      <Grid container spacing={1.5}>
        {folhas.map((f) => (
          <Grid item xs={12} sm={6} key={f.href}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderStyle: "dashed",
                bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.06 : 0.04),
              }}
            >
              <CardActionArea component={NextLink} href={f.href} sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <DescriptionOutlinedIcon sx={{ color: "warning.dark", fontSize: 28, mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {f.titulo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                      {f.detalhe}
                    </Typography>
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
