"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import NextLink from "next/link";
import {
  Box,
  Button,
  CircularProgress,
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

const LgpdReferenciaPageClient = dynamic(
  () => import("@/app/(protected)/referencias/lgpd/LgpdReferenciaPageClient"),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress aria-label="A carregar referência LGPD" />
      </Box>
    ),
  },
);

export type LgpdReferenciaDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function LgpdReferenciaDrawer({ open, onClose }: LgpdReferenciaDrawerProps) {
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
          width: fullScreen ? "100vw" : "min(1200px, 96vw)",
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
          Referência LGPD
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Abrir em página própria (URL para favoritar)">
          <span>
            <IconButton
              component={NextLink}
              href="/referencias/lgpd"
              color="inherit"
              aria-label="Abrir em página completa"
              sx={{ display: { xs: "inline-flex", sm: "none" } }}
              size="small"
            >
              <OpenInNewIcon />
            </IconButton>
            <Button
              component={NextLink}
              href="/referencias/lgpd"
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
          <IconButton edge="end" onClick={onClose} aria-label="Fechar referência LGPD">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {hasOpened ? <LgpdReferenciaPageClient embedded /> : null}
      </Box>
    </Drawer>
  );
}
