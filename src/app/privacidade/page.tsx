"use client";

import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import NextLink from "next/link";
import { useContext, useState } from "react";
import { ColorModeContext } from "@contexts/color-mode";
import { PrivacyNoticeContent } from "@/components/privacy/PrivacyNoticeContent";
import { CookiePreferencesDialog } from "@/components/privacy/CookiePreferencesDialog";

export default function PrivacidadePage() {
  const { mode, setMode } = useContext(ColorModeContext);
  const [cookieOpen, setCookieOpen] = useState(false);

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <IconButton component={NextLink} href="/" aria-label="Voltar" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Aviso de privacidade
          </Typography>
          <Button size="small" color="inherit" onClick={() => setCookieOpen(true)} sx={{ mr: 1, textTransform: "none" }}>
            Preferências de cookies
          </Button>
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4, pb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Aviso de privacidade — plataforma FPSI
        </Typography>
        <PrivacyNoticeContent />
      </Container>

      <CookiePreferencesDialog open={cookieOpen} onClose={() => setCookieOpen(false)} />
    </Box>
  );
}
