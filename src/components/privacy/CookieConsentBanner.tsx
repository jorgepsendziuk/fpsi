"use client";

import { Box, Button, Link, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import NextLink from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hasCookieDecision, writeCookieConsent } from "@/lib/privacy/cookieConsentStorage";
import { CookiePreferencesDialog } from "./CookiePreferencesDialog";

export function CookieConsentBanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const sync = useCallback(() => {
    setVisible(typeof window !== "undefined" && !hasCookieDecision());
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const acceptAll = () => {
    writeCookieConsent({ analytics: true });
    setVisible(false);
  };

  const necessaryOnly = () => {
    writeCookieConsent({ analytics: false });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <Paper
        elevation={8}
        role="dialog"
        aria-label="Uso de cookies"
        sx={{
          position: "fixed",
          zIndex: (t) => t.zIndex.modal - 1,
          left: { xs: 12, sm: 24 },
          right: { xs: 12, sm: 24 },
          bottom: { xs: 12, sm: 24 },
          p: 2.5,
          maxWidth: 560,
          ml: "auto",
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Cookies e privacidade
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
          Utilizamos cookies necessários para autenticação e segurança. Com sua permissão, também usamos cookies para
          métricas agregadas de uso. Consulte o{" "}
          <Link component={NextLink} href="/privacidade" underline="hover">
            aviso de privacidade
          </Link>
          .
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained" size="small" onClick={acceptAll}>
            Aceitar todos
          </Button>
          <Button variant="outlined" size="small" onClick={necessaryOnly}>
            Apenas necessários
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={() => setPrefsOpen(true)} color="inherit">
            Personalizar
          </Button>
        </Stack>
      </Paper>
      <CookiePreferencesDialog open={prefsOpen} onClose={() => { setPrefsOpen(false); sync(); }} />
    </>
  );
}
