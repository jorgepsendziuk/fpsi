"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
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
import {
  extractLgpdArtigoNumbers,
  isLgpdNormaSegment,
  LGPD_PLANALTO_COMPILADO_URL,
  splitNormasSegments,
} from "@/lib/normas/lgpdRefs";
import { getLgpdArtigoTexto } from "@/lib/normas/lgpdArtigosData";
import { LgpdArtigoViewer, LgpdMultiArtigoViewer } from "./LgpdArtigoViewer";

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

  const openSegment = (segment: string) => {
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
          Clique para ver o texto no sistema (LGPD) ou a citação completa (demais normas).
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {segments.map((seg, i) => {
            const lgpd = isLgpdNormaSegment(seg);
            return (
              <Chip
                key={i}
                icon={lgpd ? <MenuBookIcon sx={{ fontSize: 18 }} /> : <GavelIcon sx={{ fontSize: 18 }} />}
                label={chipLabel(seg)}
                onClick={() => openSegment(seg)}
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
                Fonte interna (LGPD) ou citação do guia; sempre confira o diploma oficial.
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
              <Button sx={{ mt: 2 }} variant="outlined" href={LGPD_PLANALTO_COMPILADO_URL} target="_blank" rel="noopener noreferrer">
                Planalto — LGPD (compilado)
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
