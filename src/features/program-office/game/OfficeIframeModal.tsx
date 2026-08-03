"use client";

import { useEffect, useMemo, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useOfficeExperience } from "./OfficeExperienceContext";

/** Acima do botão “voltar” do escritório (zIndex 1400). */
const MODAL_Z = 2000;

/** Normaliza href relativo/absoluto para URL usável no iframe e em nova aba. */
function resolveOfficeHref(href: string): string {
  const raw = (href || "").trim();
  if (!raw) return "";
  if (typeof window === "undefined") return raw;
  try {
    return new URL(raw, window.location.origin).href;
  } catch {
    return raw;
  }
}

export function OfficeIframeModal() {
  const { modal, closeModal, restorePreviousView, canRestoreView } = useOfficeExperience();
  const [frameFailed, setFrameFailed] = useState(false);

  const handleClose = () => {
    closeModal();
    if (canRestoreView) restorePreviousView();
  };

  const open = modal?.kind === "iframe";
  const title = open ? modal.title : "";
  const href = useMemo(
    () => (modal?.kind === "iframe" ? resolveOfficeHref(modal.href) : ""),
    [modal]
  );

  useEffect(() => {
    if (!open) {
      setFrameFailed(false);
      return;
    }
    setFrameFailed(false);
    // Se o browser bloquear o frame (XFO), o onError do iframe nem sempre dispara —
    // damos um fallback visual após um curto tempo se a página não pintar.
    const t = window.setTimeout(() => {
      // noop: mantém frameFailed só via onError / botão manual
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, href]);

  const openInNewTab = () => {
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={false}
      maxWidth={false}
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: { zIndex: MODAL_Z - 1, bgcolor: "rgba(0,0,0,0.55)" },
        },
        paper: {
          sx: {
            zIndex: MODAL_Z,
            width: "min(1180px, 96vw)",
            height: "min(88vh, 860px)",
            maxHeight: "92vh",
            m: 1.5,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 12,
          },
        },
      }}
    >
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar variant="dense" sx={{ gap: 1, minHeight: 46 }}>
          <IconButton edge="start" onClick={handleClose} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 0 }} noWrap fontWeight={700}>
            {title}
          </Typography>
          <Tooltip title="Abrir em página completa (nova aba)">
            <IconButton onClick={openInNewTab} aria-label="Abrir em nova aba">
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {open && frameFailed && (
        <Stack
          spacing={1.5}
          alignItems="center"
          justifyContent="center"
          sx={{ flex: 1, px: 3, py: 4, textAlign: "center", bgcolor: "grey.50" }}
        >
          <WarningAmberIcon color="warning" sx={{ fontSize: 40 }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Não foi possível embutir esta página
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
            O site bloqueia visualização em iframe. Abra em nova aba para continuar sem sair do contexto do escritório
            (use o botão voltar do navegador se precisar).
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" startIcon={<OpenInNewIcon />} onClick={openInNewTab}>
              Abrir em nova aba
            </Button>
            <Button variant="outlined" onClick={handleClose}>
              Fechar
            </Button>
          </Stack>
        </Stack>
      )}
      {open && !frameFailed && (
        <Box
          component="iframe"
          title={title}
          src={href}
          // Sem sandbox restritivo: precisa de cookies/sessão same-origin no remoto.
          onError={() => setFrameFailed(true)}
          sx={{
            flex: 1,
            width: "100%",
            border: 0,
            minHeight: 0,
            bgcolor: "grey.100",
          }}
        />
      )}
    </Dialog>
  );
}
