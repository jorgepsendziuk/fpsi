"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PORTAL_AUDITOR_INTRO } from "@/content/governancaAvancadaOrientacao";
import type { AuditorListaItem, AuditorPortalPayload } from "@/lib/auditor/auditorPortal";

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, minWidth: 120, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
      <Typography variant="caption">{label}</Typography>
      <Typography variant="h5">{value}</Typography>
    </Box>
  );
}

function Lista({ items }: { items: AuditorListaItem[] }) {
  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nenhum registro.
      </Typography>
    );
  }
  return (
    <Stack spacing={1}>
      {items.map((it) => (
        <Box key={String(it.id)} sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 0.75 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" fontWeight={600}>
              {it.titulo}
            </Typography>
            {it.status ? <Chip size="small" label={it.status} /> : null}
          </Stack>
          {it.detalhe ? (
            <Typography variant="caption" color="text.secondary">
              {it.detalhe}
            </Typography>
          ) : null}
        </Box>
      ))}
    </Stack>
  );
}

export default function AuditorPortalPage() {
  const params = useParams();
  const token = String(params?.token || "");
  const [data, setData] = useState<(AuditorPortalPayload & { error?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auditor/${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "Falha ao carregar" } as never))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !("ok" in data) || !data.ok) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{(data as { error?: string })?.error || "Acesso inválido ou expirado."}</Alert>
      </Container>
    );
  }

  const r = data.resumo;
  const sections: Array<{ title: string; norma: string; items: AuditorListaItem[] }> = [
    { title: "Evidências", norma: "ISO 27001 9.2", items: data.evidencias },
    { title: "Políticas publicadas", norma: "PPSI 0.9–0.12", items: data.politicas },
    { title: "ROPA / mapeamento", norma: "LGPD art. 37", items: data.ropa },
    { title: "RIPD", norma: "LGPD art. 38", items: data.ripds },
    { title: "Riscos críticos", norma: "ISO 27001 9.3", items: data.riscos },
    { title: "Incidentes abertos", norma: "ANPD / ISO 27001", items: data.incidentes },
    { title: "Decisões", norma: "Accountability", items: data.decisoes },
    { title: "Timeline", norma: "Rastreabilidade", items: data.timeline },
    { title: "Planos de ação", norma: "PPSI plano de trabalho", items: data.planos },
    { title: "Ciência em documentos", norma: "Demonstração de conformidade", items: data.ciencias },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap">
        <LockOutlinedIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          {PORTAL_AUDITOR_INTRO.titulo}
        </Typography>
        <Chip size="small" label="Somente leitura" color="info" />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {data.programa.nome} · acesso até{" "}
        {data.expires_at ? new Date(data.expires_at).toLocaleString("pt-BR") : "—"}
      </Typography>
      {(data.programa.dpoNome || data.programa.dpoEmail) && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Encarregado (art. 41 LGPD): {data.programa.dpoNome || "—"}
          {data.programa.dpoEmail ? ` · ${data.programa.dpoEmail}` : ""}
        </Typography>
      )}
      <Alert severity="info" sx={{ mb: 2 }}>
        {PORTAL_AUDITOR_INTRO.lead}
      </Alert>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
        <Kpi
          label="Maturidade média"
          value={r.maturidadeMedia != null ? Number(r.maturidadeMedia).toFixed(1) : "—"}
        />
        <Kpi label="Riscos críticos" value={r.riscosCriticos} />
        <Kpi label="Incidentes" value={r.incidentesAbertos} />
        <Kpi label="Evidências" value={r.evidencias} />
        <Kpi label="Decisões" value={r.decisoes} />
        <Kpi label="Políticas" value={r.politicasPublicadas} />
        <Kpi label="ROPA / map." value={r.ropaOperacoes || r.mapeamentos} />
        <Kpi label="Planos abertos" value={r.planosAbertos} />
        <Kpi label="Pedidos de titulares (qtde)" value={r.pedidosTitularesAbertos} />
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Pedidos de titulares aparecem só como quantidade — o conteúdo e a identidade do titular não são
        expostos neste link.
      </Typography>

      {sections.map((s) => (
        <Accordion key={s.title} disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography fontWeight={700}>
                {s.title} ({s.items.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {s.norma}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Lista items={s.items} />
          </AccordionDetails>
        </Accordion>
      ))}

      <Alert severity="warning" sx={{ mt: 3 }}>
        Este portal não permite alterações. Solicite evidências adicionais ao responsável do programa.
      </Alert>
    </Container>
  );
}
