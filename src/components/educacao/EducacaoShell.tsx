"use client";

import { Box, Container, IconButton, Toolbar, Tooltip, Typography, AppBar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import LinkNext from "next/link";
import { useContext, type ReactNode } from "react";
import { ColorModeContext } from "@contexts/color-mode";

export function EducacaoShell({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { mode, setMode } = useContext(ColorModeContext);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor: "background.paper", color: "text.primary" }}>
        <Toolbar>
          <IconButton component={LinkNext} href="/" aria-label="Voltar" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            {titulo}
          </Typography>
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton color="inherit" onClick={() => setMode()} aria-label="Alternar tema">
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
        {children}
      </Container>
    </Box>
  );
}
