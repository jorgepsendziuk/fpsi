"use client";

import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useOfficeExperience } from "./OfficeExperienceContext";

/** Acima do botão “voltar” do escritório (zIndex 1400). */
const MODAL_Z = 2000;

export function OfficeIframeModal() {
  const { modal, closeModal } = useOfficeExperience();

  const open = modal?.kind === "iframe";
  const href = open ? modal.href : "";
  const title = open ? modal.title : "";

  return (
    <Dialog
      open={open}
      onClose={closeModal}
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
          <IconButton edge="start" onClick={closeModal} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ flex: 1, minWidth: 0 }} noWrap fontWeight={700}>
            {title}
          </Typography>
          <Tooltip title="Abrir em página completa (nova aba)">
            <IconButton
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir em nova aba"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      {open && (
        <Box
          component="iframe"
          title={title}
          src={href}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads"
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
