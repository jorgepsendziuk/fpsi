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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Policy as PrivacyIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import type { PortalPublicData } from "@/lib/portal/portalPublicTypes";
import { getProgramaLogoDisplayUrl } from "@/lib/utils/programaDemoLogo";
import { portalPanelSx } from "@/lib/portal/portalPublicUi";
import { PortalPublicHeaderSync } from "@/components/portal/PortalPublicHeaderContext";
import type { PortalLegalDoc } from "@/lib/portal/portalLegalLinks";
import { portalPdfHref } from "@/lib/portal/portalPublicPaths";

type Props = {
  documentTitle: string;
  pdfDoc?: PortalLegalDoc;
  children: React.ReactNode | ((data: PortalPublicData) => React.ReactNode);
};

export function PortalLegalDocShell({ documentTitle, pdfDoc, children }: Props) {
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
      <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Skeleton variant="text" width="50%" height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2, borderRadius: 1.5 }} />
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 3.5 } }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error ?? "Não encontrado"}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/")}>
          Início
        </Button>
      </Container>
    );
  }

  const logoSlot = logoUrl ? (
    <Box
      component="img"
      src={logoUrl}
      alt=""
      sx={{
        width: 88,
        height: 88,
        borderRadius: 1.5,
        objectFit: "contain",
        bgcolor: alpha(theme.palette.primary.main, 0.08),
        p: 0.5,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
      }}
    />
  ) : (
    <Box
      sx={{
        width: 88,
        height: 88,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: (t) =>
          t.palette.mode === "dark"
            ? `linear-gradient(145deg, ${alpha("#fff", 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
            : `linear-gradient(145deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
        color: logoUrl ? "primary.main" : "primary.contrastText",
        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
      }}
    >
      <PrivacyIcon sx={{ fontSize: 48 }} />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 3.5 } }}>
      <PortalPublicHeaderSync slug={slug} orgName={nomeExibicao} logoUrl={logoUrl} />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/${encodeURIComponent(slug)}`)}
          sx={{ fontWeight: 700, textTransform: "none" }}
        >
          Voltar ao portal
        </Button>
        {pdfDoc ? (
          <Button
            size="small"
            component="a"
            href={portalPdfHref(slug, pdfDoc)}
            startIcon={<PictureAsPdfIcon />}
            sx={{ fontWeight: 700, textTransform: "none" }}
          >
            Baixar PDF
          </Button>
        ) : null}
      </Box>

      <PageHeroHeader
        titleComponent="h1"
        title={documentTitle}
        description={nomeExibicao}
        iconSlot={logoSlot}
        sx={{ mb: 2 }}
      />

      <Paper elevation={0} sx={{ ...portalPanelSx(theme, { accentTop: true }), p: { xs: 2, sm: 3 } }}>
        {typeof children === "function" ? children(data) : children}
      </Paper>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2.5 }}>
        Conteúdo do portal: texto publicado no módulo Políticas e documentos do programa, ou modelo padrão quando ainda
        não houver publicação. Adeque aos tratamentos reais. Não substitui assessoria jurídica.
      </Typography>
    </Container>
  );
}
