"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Skeleton,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Policy as PrivacyIcon } from "@mui/icons-material";
import type { PortalPublicData } from "@/lib/portal/portalPublicTypes";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";

type Props = {
  documentTitle: string;
  children: React.ReactNode | ((data: PortalPublicData) => React.ReactNode);
};

export function PortalLegalDocShell({ documentTitle, children }: Props) {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const slug = params.slug as string;
  const [data, setData] = useState<PortalPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Slug não informado");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/portal/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("Programa não encontrado");
          throw new Error("Erro ao carregar");
        }
        return res.json();
      })
      .then((json: PortalPublicData) => setData(json))
      .catch((err) => setError(err.message ?? "Erro"))
      .finally(() => setLoading(false));
  }, [slug]);

  const nomeExibicao = data?.nome_fantasia || data?.razao_social || data?.nome || "Portal";
  const logoUrl = data ? getProgramaLogoDisplayUrl(data) : null;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width="50%" height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error ?? "Não encontrado"}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/")}>
          Início
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push(`/${encodeURIComponent(slug)}`)}
        sx={{ mb: 2 }}
      >
        Voltar ao portal
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt=""
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: "contain",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              p: 0.5,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
            }}
          >
            <PrivacyIcon />
          </Box>
        )}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {nomeExibicao}
          </Typography>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {documentTitle}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        {typeof children === "function" ? children(data) : children}
      </Paper>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
        Texto-padrão para transparência no portal. A organização deve revisar e adequar aos seus tratamentos de dados e
        políticas internas. Não substitui assessoria jurídica.
      </Typography>
    </Container>
  );
}
