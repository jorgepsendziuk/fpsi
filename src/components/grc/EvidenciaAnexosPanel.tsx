"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SaveIcon from "@mui/icons-material/Save";
import type { EvidenciaAlvoTipo, EvidenciaRow } from "@/lib/grc/evidenciaLimits";

type Props = {
  programaId: string | number;
  alvoTipo: EvidenciaAlvoTipo;
  alvoId: string;
  compact?: boolean;
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenciaAnexosPanel({ programaId, alvoTipo, alvoId, compact }: Props) {
  const theme = useTheme();
  const [items, setItems] = useState<EvidenciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tituloDirty, setTituloDirty] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        alvo_tipo: alvoTipo,
        alvo_id: alvoId,
      });
      const res = await fetch(`/api/programas/${programaId}/evidencias?${q}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro ao listar");
      setItems(json.evidencias || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId, alvoTipo, alvoId]);

  useEffect(() => {
    if (alvoId) void load();
  }, [load, alvoId]);

  const upload = async (opts: { file?: File | null; link?: string; titleOverride?: string }) => {
    const file = opts.file ?? pendingFile;
    const link = (opts.link ?? url).trim();
    const title = (opts.titleOverride ?? titulo).trim();
    if (!file && !link) {
      setError("Escolha um arquivo ou informe um link.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (file) fd.set("file", file);
      if (link) fd.set("url_externa", link);
      fd.set("titulo", title || file?.name || link || "Evidência");
      fd.set("alvo_tipo", alvoTipo);
      fd.set("alvo_id", alvoId);
      const res = await fetch(`/api/programas/${programaId}/evidencias`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no upload");
      setTitulo("");
      setTituloDirty(false);
      setUrl("");
      setPendingFile(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Arquivar esta evidência?")) return;
    const res = await fetch(`/api/programas/${programaId}/evidencias/${id}`, {
      method: "DELETE",
    });
    if (res.ok) await load();
  };

  const canSave =
    tituloDirty || pendingFile != null || Boolean(url.trim());

  return (
    <Box
      sx={{
        mt: compact ? 1 : 1.5,
        p: compact ? 1 : 1.25,
        borderRadius: 1.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
        bgcolor: alpha(theme.palette.background.paper, 0.5),
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
        Evidências anexadas
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.3 }}>
        PDF / imagem (~A4) / planilha / link · máx. 5&nbsp;MB
      </Typography>

      {loading ? (
        <CircularProgress size={18} />
      ) : (
        <Stack spacing={0.5} sx={{ mb: 0.75 }}>
          {items.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              Nenhum anexo.
            </Typography>
          )}
          {items.map((ev) => (
            <Stack
              key={ev.id}
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                py: 0.25,
                px: 0.75,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.action.hover, 0.35),
              }}
            >
              <Chip size="small" label={ev.categoria} sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontSize: 11 } }} />
              <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                {ev.titulo}
                {ev.tamanho_bytes > 0 ? ` · ${formatBytes(ev.tamanho_bytes)}` : ""}
              </Typography>
              <Link
                href={
                  ev.url_externa ||
                  `/api/programas/${programaId}/evidencias/${ev.id}`
                }
                target="_blank"
                rel="noopener"
              >
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </Link>
              <IconButton size="small" onClick={() => void onDelete(ev.id)} aria-label="Arquivar" sx={{ p: 0.25 }}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      <Stack spacing={0.75}>
        <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
          <TextField
            size="small"
            label="Título"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              setTituloDirty(true);
            }}
            fullWidth
            sx={{ "& .MuiInputBase-root": { fontSize: 13 } }}
          />
          {canSave && (
            <Button
              variant="contained"
              color="primary"
              disabled={uploading || !alvoId}
              onClick={() => void upload({})}
              sx={{ minWidth: 40, px: 1, alignSelf: "stretch" }}
              aria-label="Salvar evidência"
            >
              {uploading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon fontSize="small" />}
            </Button>
          )}
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            component="label"
            variant="outlined"
            size="small"
            startIcon={<AttachFileIcon sx={{ fontSize: 16 }} />}
            disabled={uploading || !alvoId}
            sx={{ textTransform: "none", fontSize: 12 }}
          >
            {pendingFile ? pendingFile.name.slice(0, 22) : "Arquivo"}
            <input
              type="file"
              hidden
              accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setPendingFile(f);
                if (f && !titulo.trim()) {
                  setTitulo(f.name);
                  setTituloDirty(true);
                }
              }}
            />
          </Button>
          <TextField
            size="small"
            label="Link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            sx={{ flex: 1, minWidth: 120, "& .MuiInputBase-root": { fontSize: 13 } }}
          />
        </Stack>
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
