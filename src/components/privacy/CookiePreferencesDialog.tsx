"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Switch,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { readCookieConsent, writeCookieConsent } from "@/lib/privacy/cookieConsentStorage";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CookiePreferencesDialog({ open, onClose }: Props) {
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!open) return;
    const c = readCookieConsent();
    setAnalytics(c?.analytics ?? false);
  }, [open]);

  const handleSave = () => {
    writeCookieConsent({ analytics });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="cookie-prefs-title">
      <DialogTitle id="cookie-prefs-title">Preferências de cookies</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Usamos cookies e tecnologias similares para manter sua sessão (necessários) e, apenas com seu consentimento,
          para entender o uso da plataforma. Detalhes em{" "}
          <Link component={NextLink} href="/privacidade#cookies" onClick={onClose}>
            Cookies e tecnologias
          </Link>
          .
        </Typography>
        <FormControlLabel
          disabled
          control={<Switch checked />}
          label="Estritamente necessários (sessão, segurança, preferências)"
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
          Sempre ativos. Sem eles o login e a navegação autenticada não funcionam de forma segura.
        </Typography>
        <FormControlLabel
          control={<Switch checked={analytics} onChange={(_, v) => setAnalytics(v)} />}
          label="Medição e melhoria do produto (analytics)"
        />
        <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4 }}>
          Ajuda a entender páginas visitadas e erros, de forma agregada. Você pode desativar a qualquer momento.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained">
          Salvar preferências
        </Button>
      </DialogActions>
    </Dialog>
  );
}
