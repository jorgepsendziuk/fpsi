"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

type Payload = {
  ok?: boolean;
  error?: string;
  programa?: { nome?: string; slug?: string };
  expires_at?: string;
  resumo?: {
    maturidadeMedia?: number | null;
    riscosCriticos?: number;
    incidentesAbertos?: number;
    evidencias?: number;
    decisoes?: number;
  };
};

export default function AuditorPortalPage() {
  const params = useParams();
  const token = String(params?.token || "");
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auditor/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "Falha ao carregar" }))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data?.ok) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{data?.error || "Acesso inválido ou expirado."}</Alert>
      </Container>
    );
  }

  const r = data.resumo || {};

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <LockOutlinedIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Portal do auditor
        </Typography>
        <Chip size="small" label="Somente leitura" color="info" />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {data.programa?.nome || "Programa"} · acesso até{" "}
        {data.expires_at ? new Date(data.expires_at).toLocaleString("pt-BR") : "—"}
      </Typography>
      <Stack spacing={1.5}>
        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="overline">Maturidade média</Typography>
          <Typography variant="h4">
            {r.maturidadeMedia != null ? Number(r.maturidadeMedia).toFixed(1) : "—"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="caption">Riscos críticos</Typography>
            <Typography variant="h5">{r.riscosCriticos ?? 0}</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="caption">Incidentes</Typography>
            <Typography variant="h5">{r.incidentesAbertos ?? 0}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Box sx={{ flex: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="caption">Evidências</Typography>
            <Typography variant="h5">{r.evidencias ?? 0}</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
            <Typography variant="caption">Decisões</Typography>
            <Typography variant="h5">{r.decisoes ?? 0}</Typography>
          </Box>
        </Stack>
      </Stack>
      <Alert severity="warning" sx={{ mt: 3 }}>
        Este portal não permite alterações. Solicite evidências adicionais ao responsável do programa.
      </Alert>
    </Container>
  );
}
