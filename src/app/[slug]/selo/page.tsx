"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Paper,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Link from "next/link";
import { PortalPublicHeaderSync } from "@/components/portal/PortalPublicHeaderContext";
import { portalPanelSx } from "@/lib/portal/portalPublicUi";
import { SeloLgpdBadge } from "@/components/programa/SeloLgpdBadge";
import { getSeloMetal } from "@/lib/programa/seloLgpd";
import type { SeloMetalId, SeloPlanoId } from "@/lib/programa/seloLgpd";

type SeloJson = {
  slug: string;
  nome: string;
  plano: SeloPlanoId;
  planoLabel: string;
  metal: SeloMetalId;
  metalLabel: string;
  greyed: boolean;
  score: number | null;
  pageUrl: string;
  svgUrl: string;
};

export default function PortalSeloPage() {
  const params = useParams();
  const theme = useTheme();
  const slug = String(params.slug ?? "");
  const [data, setData] = useState<SeloJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal/${encodeURIComponent(slug)}/selo?format=json`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Programa não encontrado" : "Erro ao carregar selo");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message ?? "Erro"));
  }, [slug]);

  const embed = data
    ? `<a href="${data.pageUrl}" target="_blank" rel="noopener noreferrer"><img src="${data.svgUrl}" alt="Selo LGPD ${data.nome}" width="114" height="128" /></a>`
    : "";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2.5, md: 3.5 } }}>
      {data ? <PortalPublicHeaderSync slug={slug} orgName={data.nome} logoUrl={null} /> : null}
      <Button
        component={Link}
        href={`/${encodeURIComponent(slug)}`}
        size="small"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 1.5, fontWeight: 700, textTransform: "none" }}
      >
        Voltar ao portal
      </Button>

      <Typography variant="h4" fontWeight={800} gutterBottom>
        Selo LGPD
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Reconhecimento público do programa de privacidade no FPSI. Use o endereço desta página ou o
        SVG para exibir o selo no site da organização.
      </Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : !data ? (
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      ) : (
        <Paper elevation={0} sx={{ ...portalPanelSx(theme, { accentTop: true }), p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center" }}>
            <SeloLgpdBadge
              plano={data.plano}
              palette={getSeloMetal(data.metal)}
              greyed={data.greyed}
              size={160}
              uid="portal-selo"
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" fontWeight={800}>
                {data.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Plano {data.planoLabel}
                {data.greyed
                  ? " · ainda sem pontuação nos diagnósticos (nível inicial)"
                  : ` · ${data.metalLabel}${data.score != null ? ` (média ${data.score.toFixed(2)})` : ""}`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5 }} component="div">
                Página:{" "}
                <Box component="code" sx={{ fontSize: "0.85em" }}>
                  {data.pageUrl}
                </Box>
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }} component="div">
                Imagem (SVG):{" "}
                <Box component="code" sx={{ fontSize: "0.85em" }}>
                  {data.svgUrl}
                </Box>
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}
                onClick={() => {
                  void navigator.clipboard.writeText(embed);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "HTML copiado" : "Copiar HTML para o site"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
