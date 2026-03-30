"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Language as LanguageIcon,
  OpenInNew as OpenInNewIcon,
  QrCode2 as QrCodeIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import * as dataService from "@/lib/services/dataService";

type Props = {
  /** Segmento da URL do programa (id numérico ou slug), como em `programas/[id]`. */
  idOrSlug: string;
  /** Rota para onde o botão de ajuda leva quando não há slug (ex.: painel ou página do programa). */
  configurarHref?: string;
};

export function PortalPrivacidadePublicLinkCard({ idOrSlug, configurarHref = "/dashboard" }: Props) {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const [programa, setPrograma] = useState<{ nome?: string; slug?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copyOpen, setCopyOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchProgramaByIdOrSlug(idOrSlug)
      .then((p) => {
        if (!cancelled) setPrograma(p ?? null);
      })
      .catch(() => {
        if (!cancelled) setPrograma(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  const publicUrl = useMemo(() => {
    if (!programa?.slug) return "";
    if (typeof window !== "undefined") return `${window.location.origin}/${programa.slug}`;
    return `https://[seu-dominio]/${programa.slug}`;
  }, [programa?.slug]);

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => setCopyOpen(true));
  };

  const downloadQrPng = () => {
    if (!publicUrl || !qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `QR-Portal-${programa?.slug ?? "privacidade"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(primary, 0.03),
        }}
      >
        <CircularProgress size={22} />
        <Typography variant="body2" color="text.secondary">
          Carregando link do portal…
        </Typography>
      </Paper>
    );
  }

  if (!programa?.slug) {
    return (
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Portal público sem URL fixa
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Para titulares acessarem pedidos, reportes e contato na web, o programa precisa de um{" "}
          <strong>slug</strong> (endereço curto, ex.: <code>meu-orgao</code>). No painel, em{" "}
          <strong>Programas</strong>, use a opção para definir ou ajustar o slug.
        </Typography>
        <Button component={Link} href={configurarHref} size="small" variant="outlined">
          Ir ao painel (programas)
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          border: "1px solid",
          borderColor: alpha(primary, 0.2),
          background: `linear-gradient(145deg, ${alpha(primary, 0.09)} 0%, ${alpha(primary, 0.02)} 42%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${primary} 0%, ${theme.palette.secondary.main} 100%)`,
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "stretch", md: "flex-start" }}
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(primary, 0.12),
                    color: primary,
                  }}
                >
                  <LanguageIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
                    Link do portal de privacidade
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    URL pública para titulares — pedidos (art. 18 LGPD), reportes e contato
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 640 }}>
                Compartilhe este endereço em avisos de privacidade, sites e materiais oficiais. O mesmo portal
                concentra os formulários abertos ao público.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} sx={{ mb: 0 }}>
                <TextField
                  size="small"
                  fullWidth
                  value={publicUrl}
                  InputProps={{ readOnly: true }}
                  sx={{
                    maxWidth: { sm: 480 },
                    "& .MuiOutlinedInput-root": {
                      fontFamily: "ui-monospace, monospace",
                      fontSize: "0.85rem",
                      bgcolor: alpha(theme.palette.background.paper, 0.85),
                    },
                  }}
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button startIcon={<CopyIcon />} variant="contained" onClick={copyLink} disabled={!publicUrl} sx={{ textTransform: "none" }}>
                    Copiar
                  </Button>
                  <Button
                    component="a"
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                    variant="outlined"
                    sx={{ textTransform: "none" }}
                  >
                    Abrir
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                alignSelf: { xs: "center", md: "flex-start" },
                textAlign: "center",
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                QR Code
              </Typography>
              <Box ref={qrRef} sx={{ display: "inline-flex", p: 0.5, bgcolor: "white", borderRadius: 1 }}>
                <QRCodeSVG value={publicUrl || " "} size={104} level="M" />
              </Box>
              <Button
                size="small"
                fullWidth
                sx={{ mt: 1.5, textTransform: "none" }}
                variant="text"
                startIcon={<QrCodeIcon />}
                onClick={downloadQrPng}
                disabled={!publicUrl}
              >
                Baixar PNG
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={copyOpen}
        autoHideDuration={2500}
        onClose={() => setCopyOpen(false)}
        message="Link copiado para a área de transferência"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
