"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  extractLgpdArtigoNumbers,
  isLgpdNormaSegment,
  LGPD_PLANALTO_COMPILADO_URL,
  splitNormasSegments,
} from "@/lib/normas/lgpdRefs";
import { resolveNormaReferenciaUrl } from "@/lib/normas/normaExternaRefs";
import { getLgpdArtigoTexto } from "@/lib/normas/lgpdArtigosData";
import { LgpdMultiArtigoViewer } from "./LgpdArtigoViewer";

function chipLabel(segment: string, max = 52): string {
  const t = segment.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type DialogState =
  | { kind: "closed" }
  | { kind: "lgpd"; segment: string; artigos: number[] }
  | { kind: "generico"; segment: string };

export function NormasReferenciaSection({ normasReferencia }: { normasReferencia: string }) {
  const theme = useTheme();
  const segments = useMemo(() => splitNormasSegments(normasReferencia), [normasReferencia]);
  const [dlg, setDlg] = useState<DialogState>({ kind: "closed" });

  if (segments.length === 0) return null;

  /** Só diálogo: LGPD com artigos no app, ou norma sem URL mapeada. */
  const openDialogForSegment = (segment: string) => {
    if (isLgpdNormaSegment(segment)) {
      const artigos = extractLgpdArtigoNumbers(segment);
      const comTexto = artigos.filter((n) => getLgpdArtigoTexto(n));
      if (comTexto.length > 0) {
        setDlg({ kind: "lgpd", segment, artigos: comTexto });
        return;
      }
    }
    setDlg({ kind: "generico", segment });
  };

  function externaParaSegmento(segment: string): { url: string; siteLabel: string } | null {
    const lgpd = isLgpdNormaSegment(segment);
    const artigos = lgpd ? extractLgpdArtigoNumbers(segment) : [];
    const comTexto = lgpd ? artigos.filter((n) => getLgpdArtigoTexto(n)) : [];
    if (lgpd && comTexto.length > 0) return null;
    if (lgpd) return { url: LGPD_PLANALTO_COMPILADO_URL, siteLabel: "Planalto" };
    return resolveNormaReferenciaUrl(segment);
  }

  return (
    <>
      <Box
        sx={{
          mt: 2.5,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(145deg, rgba(99,102,241,0.08), rgba(15,23,42,0.5))"
              : "linear-gradient(145deg, rgba(99,102,241,0.06), rgba(248,250,252,0.95))",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <GavelIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
            Normas de referência
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          LGPD com artigos no sistema abre o texto aqui; demais referências mapeadas abrem o site oficial em nova aba;
          sem mapeamento, abre só a citação do guia.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {segments.map((seg, i) => {
            const lgpd = isLgpdNormaSegment(seg);
            const artigos = lgpd ? extractLgpdArtigoNumbers(seg) : [];
            const comTexto = lgpd ? artigos.filter((n) => getLgpdArtigoTexto(n)) : [];
            const lgpdInterno = lgpd && comTexto.length > 0;
            const externa = externaParaSegmento(seg);
            const icon = lgpdInterno ? (
              <MenuBookIcon sx={{ fontSize: 18 }} aria-hidden />
            ) : externa ? (
              <OpenInNewIcon sx={{ fontSize: 18 }} aria-hidden />
            ) : (
              <GavelIcon sx={{ fontSize: 18 }} aria-hidden />
            );
            const tip = externa
              ? `Abrir ${externa.siteLabel} em nova aba (texto oficial)`
              : lgpdInterno
                ? "Ver artigos no sistema"
                : "Ver citação completa";

            if (externa) {
              return (
                <Chip
                  key={i}
                  component="a"
                  href={externa.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  clickable
                  icon={icon}
                  label={chipLabel(seg)}
                  title={tip}
                  color={lgpd ? "primary" : "default"}
                  variant={lgpd ? "filled" : "outlined"}
                  sx={{
                    height: "auto",
                    py: 0.5,
                    "& .MuiChip-label": { whiteSpace: "normal", textAlign: "left", lineHeight: 1.35 },
                  }}
                />
              );
            }

            return (
              <Chip
                key={i}
                icon={icon}
                label={chipLabel(seg)}
                title={tip}
                onClick={() => openDialogForSegment(seg)}
                color={lgpd ? "primary" : "default"}
                variant={lgpd ? "filled" : "outlined"}
                sx={{
                  height: "auto",
                  py: 0.5,
                  "& .MuiChip-label": { whiteSpace: "normal", textAlign: "left", lineHeight: 1.35 },
                }}
              />
            );
          })}
        </Box>
      </Box>

      <Dialog
        open={dlg.kind !== "closed"}
        onClose={() => setDlg({ kind: "closed" })}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, pr: 1 }}>
          <Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              {dlg.kind === "lgpd" ? "LGPD" : "Norma de referência"}
            </Typography>
            {dlg.kind !== "closed" && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                {dlg.kind === "lgpd"
                  ? "Texto dos artigos integrado ao FPSI; link ao final para o Planalto."
                  : "Citação conforme o catálogo do PPSI 2.0 — confira sempre a fonte oficial."}
              </Typography>
            )}
          </Box>
          <IconButton aria-label="Fechar" onClick={() => setDlg({ kind: "closed" })} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2 }}>
          {dlg.kind === "lgpd" && (
            <LgpdMultiArtigoViewer
              artigos={dlg.artigos}
              textos={
                new Map(
                  dlg.artigos
                    .map((n) => [n, getLgpdArtigoTexto(n) ?? ""] as const)
                    .filter(([, t]) => t.length > 0)
                )
              }
              citacao={dlg.segment}
            />
          )}
          {dlg.kind === "generico" && (
            <Box>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.75 }}>
                {dlg.segment}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
