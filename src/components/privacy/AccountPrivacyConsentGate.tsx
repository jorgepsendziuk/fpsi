"use client";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useGetIdentity } from "@refinedev/core";
import { useCallback, useEffect, useState } from "react";
import { FPSI_PRIVACY_NOTICE_VERSION } from "@/lib/privacy/constants";

type Identity = { id: string; email?: string };

type ProfileRow = {
  privacy_notice_version_accepted?: string | null;
  privacy_notice_accepted_at?: string | null;
};

export function AccountPrivacyConsentGate() {
  const { data: user } = useGetIdentity<Identity>();
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profiles", { credentials: "include" });
      if (res.status === 401) {
        setOpen(false);
        return;
      }
      const raw = (await res.json().catch(() => null)) as ProfileRow | Record<string, unknown> | null;
      if (!res.ok) {
        const msg =
          raw && typeof raw === "object" && "error" in raw && typeof (raw as { error?: string }).error === "string"
            ? (raw as { error: string }).error
            : "Não foi possível carregar o perfil.";
        setOpen(true);
        setError(msg);
        setChecked(false);
        return;
      }
      const data = raw as ProfileRow | null;
      const accepted = data?.privacy_notice_version_accepted === FPSI_PRIVACY_NOTICE_VERSION;
      setOpen(!accepted);
      setChecked(false);
    } catch {
      setOpen(true);
      setError("Não foi possível verificar o aceite. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  const handleAccept = async () => {
    if (!checked) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profiles/privacy-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ version: FPSI_PRIVACY_NOTICE_VERSION }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof body.error === "string" ? body.error : "Falha ao registrar aceite.");
        return;
      }
      setOpen(false);
    } catch {
      setError("Falha ao registrar aceite. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.id || loading || !open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      aria-labelledby="privacy-gate-title"
      slotProps={{
        backdrop: { sx: { backdropFilter: "blur(4px)" } },
      }}
    >
      <DialogTitle id="privacy-gate-title">Aviso de privacidade da plataforma</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Para continuar usando o FPSI, confirme que leu e concorda com o tratamento dos seus dados pessoais conforme o
          aviso vigente. Este aceite fica registrado com data e versão do texto.
        </Typography>
        <Typography variant="body2" paragraph>
          <Link component={NextLink} href="/privacidade" target="_blank" rel="noopener noreferrer">
            Abrir aviso de privacidade completo
          </Link>
          {" · "}
          <Link href="/privacidade#cookies" component={NextLink} target="_blank" rel="noopener noreferrer">
            Cookies
          </Link>
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(_, v) => setChecked(v)} color="primary" />}
          label="Li e aceito o aviso de privacidade da plataforma (versão atual)."
        />
        {error ? (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => evaluate()} color="inherit" disabled={submitting}>
          Verificar de novo
        </Button>
        <Button
          variant="contained"
          onClick={handleAccept}
          disabled={!checked || submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
