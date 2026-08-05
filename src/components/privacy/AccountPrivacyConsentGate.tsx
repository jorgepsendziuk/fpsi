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
  Divider,
  FormControlLabel,
  Link,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useGetIdentity } from "@refinedev/core";
import { useCallback, useEffect, useState } from "react";
import { FPSI_PRIVACY_NOTICE_VERSION } from "@/lib/privacy/constants";
import { PrivacyNoticeContent } from "@/components/privacy/PrivacyNoticeContent";

type Identity = { id: string; email?: string };

type ProfileRow = {
  privacy_notice_version_accepted?: string | null;
  privacy_notice_accepted_at?: string | null;
};

/** Rotas onde o usuário precisa conseguir ler o aviso sem o modal por cima. */
function isPrivacyReadablePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/privacidade" || pathname.startsWith("/privacidade/");
}

export function AccountPrivacyConsentGate() {
  const pathname = usePathname();
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
    // Conta de demonstração: não bloquear o fluxo com o gate de privacidade.
    if (user.email === "demo@fpsi.com.br") {
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
      setError("Não foi possível verificar o aviso. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  const handleAcknowledge = async () => {
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
        setError(typeof body.error === "string" ? body.error : "Falha ao registrar a ciência.");
        return;
      }
      setOpen(false);
    } catch {
      setError("Falha ao registrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Página do aviso: nunca sobrepor o texto com o modal de ciência.
  if (isPrivacyReadablePath(pathname)) {
    return null;
  }

  if (!user?.id || loading || !open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      maxWidth="md"
      fullWidth
      aria-labelledby="privacy-gate-title"
      slotProps={{
        backdrop: { sx: { backdropFilter: "blur(4px)" } },
        paper: { sx: { maxHeight: "min(92vh, 880px)" } },
      }}
    >
      <DialogTitle id="privacy-gate-title" sx={{ pb: 1 }}>
        Aviso de privacidade da plataforma
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 1.5 }}>
          Antes de usar o painel, pedimos que você <strong>leia</strong> o aviso abaixo. O tratamento da conta
          apoia-se principalmente em execução do serviço e legítimo interesse (segurança/operação); cookies não
          essenciais continuam opcionais. Registramos data e versão do texto para fins de transparência e auditoria —
          não é um “consentimento genérico” para tudo.
        </Typography>

        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            px: { xs: 1.5, sm: 2.5 },
            py: 2,
            mb: 2,
            maxHeight: { xs: "42vh", sm: "48vh" },
            overflow: "auto",
            bgcolor: (t) => (t.palette.mode === "dark" ? "grey.900" : "grey.50"),
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
            Texto vigente (versão {FPSI_PRIVACY_NOTICE_VERSION})
          </Typography>
          <PrivacyNoticeContent />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
          Prefere tela cheia?{" "}
          <Link component={NextLink} href="/privacidade" target="_blank" rel="noopener noreferrer">
            Abrir aviso em nova aba
          </Link>
          {" · "}
          <Link href="/privacidade#cookies" component={NextLink} target="_blank" rel="noopener noreferrer">
            Cookies
          </Link>
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(_, v) => setChecked(v)} color="primary" />}
          label="Li e compreendi o aviso de privacidade da plataforma (versão atual)."
        />
        {error ? (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.75, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => evaluate()} color="inherit" disabled={submitting}>
          Verificar de novo
        </Button>
        <Button
          variant="contained"
          onClick={handleAcknowledge}
          disabled={!checked || submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
