"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SaveIcon from "@mui/icons-material/Save";
import { PROGRAMA_SLUG_EXPLICACAO, normalizeProgramaSlug } from "@/lib/programa/programaSlug";

type Props = {
  programaId: number;
  slugAtual: string | null | undefined;
  canEdit: boolean;
  compact?: boolean;
  onSaved?: (slug: string) => void;
};

type CheckState =
  | "idle"
  | "checking"
  | "disponivel"
  | "indisponivel"
  | "invalido"
  | "igual";

export function ProgramaSlugEditor({ programaId, slugAtual, canEdit, compact, onSaved }: Props) {
  const theme = useTheme();
  const [valor, setValor] = useState(slugAtual?.trim() || "");
  const [check, setCheck] = useState<CheckState>("idle");
  const [motivo, setMotivo] = useState<string | null>(null);
  const [slugNormalizado, setSlugNormalizado] = useState("");
  const [saving, setSaving] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  useEffect(() => {
    setValor(slugAtual?.trim() || "");
    setCheck(slugAtual?.trim() ? "igual" : "idle");
    setMotivo(null);
  }, [slugAtual]);

  const previewUrl = useMemo(() => {
    const s = slugNormalizado || normalizeProgramaSlug(valor);
    if (!s) return "";
    if (typeof window !== "undefined") return `${window.location.origin}/${s}`;
    return `https://[domínio]/${s}`;
  }, [valor, slugNormalizado]);

  const verificar = useCallback(
    async (raw: string) => {
      const norm = normalizeProgramaSlug(raw);
      setSlugNormalizado(norm);
      if (!raw.trim()) {
        setCheck("idle");
        setMotivo(null);
        return;
      }
      if (norm === (slugAtual?.trim() || "")) {
        setCheck("igual");
        setMotivo(null);
        return;
      }
      setCheck("checking");
      setMotivo(null);
      try {
        const q = new URLSearchParams({
          slug: raw.trim(),
          excludeProgramaId: String(programaId),
        });
        const res = await fetch(`/api/programas/slug-disponivel?${q}`, { credentials: "include" });
        const data = await res.json();
        if (data.disponivel) {
          setCheck("disponivel");
          setSlugNormalizado(data.slug || norm);
          setMotivo(null);
        } else {
          setCheck(data.slug === norm && data.motivo?.includes("caracteres") ? "invalido" : "indisponivel");
          setMotivo(data.motivo || data.error || "Indisponível");
          if (data.slug) setSlugNormalizado(data.slug);
        }
      } catch {
        setCheck("invalido");
        setMotivo("Não foi possível verificar agora. Tente de novo.");
      }
    },
    [programaId, slugAtual]
  );

  useEffect(() => {
    if (!canEdit) return;
    const t = window.setTimeout(() => {
      void verificar(valor);
    }, 450);
    return () => window.clearTimeout(t);
  }, [valor, canEdit, verificar]);

  const handleSave = async () => {
    if (check !== "disponivel" || saving) return;
    setSaving(true);
    setErroSalvar(null);
    try {
      const res = await fetch(`/api/programas/${programaId}/slug`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ slug: valor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      const novo = data.slug as string;
      setValor(novo);
      setCheck("igual");
      onSaved?.(novo);
    } catch (e) {
      setErroSalvar(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const statusAdornment = () => {
    if (check === "checking") return <CircularProgress size={18} />;
    if (check === "disponivel") return <CheckCircleIcon color="success" fontSize="small" />;
    if (check === "indisponivel" || check === "invalido") return <ErrorOutlineIcon color="error" fontSize="small" />;
    return null;
  };

  return (
    <Box>
      {!compact && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 720, lineHeight: 1.55 }}>
          {PROGRAMA_SLUG_EXPLICACAO}
        </Typography>
      )}

      {canEdit ? (
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Slug do portal público"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="ex.: pco-diagnostico"
            helperText={
              motivo ||
              (check === "disponivel"
                ? "Disponível nesta instalação. Salve para aplicar."
                : check === "igual"
                  ? "Este é o slug atual."
                  : slugNormalizado
                    ? `Prévia normalizada: ${slugNormalizado}`
                    : "Será normalizado em minúsculas e hífens.")
            }
            error={check === "indisponivel" || check === "invalido"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: <InputAdornment position="end">{statusAdornment()}</InputAdornment>,
              sx: { fontFamily: "ui-monospace, monospace", fontSize: "0.9rem" },
            }}
            fullWidth
            sx={{ maxWidth: 480 }}
          />

          {previewUrl && (
            <Typography variant="caption" color="text.secondary" component="div">
              Portal:{" "}
              <Box component="span" sx={{ fontFamily: "ui-monospace, monospace" }}>
                {previewUrl}
              </Box>
            </Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={check !== "disponivel" || saving}
              onClick={() => void handleSave()}
            >
              Salvar slug
            </Button>
            {check === "disponivel" && (
              <Typography variant="caption" color="success.main" fontWeight={600}>
                Disponível
              </Typography>
            )}
          </Stack>
          {erroSalvar && (
            <Alert severity="error" sx={{ maxWidth: 520 }}>
              {erroSalvar}
            </Alert>
          )}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            maxWidth: 480,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Slug atual
          </Typography>
          <Typography variant="body1" fontFamily="ui-monospace, monospace" fontWeight={600}>
            {slugAtual || "—"}
          </Typography>
        </Box>
      )}
    </Box>
  );
}