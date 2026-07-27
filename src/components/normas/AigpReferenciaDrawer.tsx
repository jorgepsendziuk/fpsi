"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AigpReferenciaPanel } from "./AigpReferenciaPanel";

export type AigpReferenciaDrawerProps = {
  open: boolean;
  onClose: () => void;
  initialId?: string | null;
};

export function AigpReferenciaDrawer({ open, onClose, initialId = null }: AigpReferenciaDrawerProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [hasOpened, setHasOpened] = useState(false);
  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      keepMounted={false}
      PaperProps={{
        sx: {
          width: fullScreen ? "100vw" : "min(1100px, 96vw)",
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        },
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          gap: 1,
          minHeight: { xs: 56, sm: 48 },
        }}
      >
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700 }} noWrap>
          Referência · Governança de IA
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Abrir em página própria">
          <span>
            <Button
              component={NextLink}
              href={initialId ? `/referencias/aigp?f=${encodeURIComponent(initialId)}` : "/referencias/aigp"}
              size="small"
              color="inherit"
              startIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
              sx={{ textTransform: "none", display: { xs: "none", sm: "inline-flex" } }}
            >
              Página completa
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Fechar">
          <IconButton edge="end" onClick={onClose} aria-label="Fechar referência AIGP">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {hasOpened ? <AigpReferenciaPanel embedded initialId={initialId} /> : null}
      </Box>
    </Drawer>
  );
}
