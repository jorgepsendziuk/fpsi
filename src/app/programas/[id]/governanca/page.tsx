"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import TimelineIcon from "@mui/icons-material/Timeline";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";

export default function GovernancaExtrasPage() {
  const params = useParams();
  const idOrSlug = String(params?.id || "");
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const [tab, setTab] = useState(0);
  const [decisoes, setDecisoes] = useState<Array<Record<string, unknown>>>([]);
  const [eventos, setEventos] = useState<Array<Record<string, unknown>>>([]);
  const [auditores, setAuditores] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDec, setOpenDec] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [decisao, setDecisao] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [emailAuditor, setEmailAuditor] = useState("");
  const [linkCriado, setLinkCriado] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [d, t, a] = await Promise.all([
        fetch(`/api/programas/${programaId}/decisoes`).then((r) => r.json()),
        fetch(`/api/programas/${programaId}/governanca?tipo=timeline`).then((r) => r.json()),
        fetch(`/api/programas/${programaId}/governanca?tipo=auditores`).then((r) => r.json()),
      ]);
      if (d.error) throw new Error(d.error);
      setDecisoes(d.decisoes || []);
      setEventos(t.eventos || []);
      setAuditores(a.auditores || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const salvarDecisao = async () => {
    if (!programaId || !titulo.trim()) return;
    const res = await fetch(`/api/programas/${programaId}/decisoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        decisao,
        justificativa,
        status: "aprovado",
        data_decisao: new Date().toISOString().slice(0, 10),
      }),
    });
    if (res.ok) {
      setOpenDec(false);
      setTitulo("");
      setDecisao("");
      setJustificativa("");
      await load();
    }
  };

  const criarAuditor = async () => {
    if (!programaId || !emailAuditor.trim()) return;
    const res = await fetch(`/api/programas/${programaId}/governanca`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "auditor", email: emailAuditor, dias: 14 }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro");
      return;
    }
    const token = json.auditor?.token;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setLinkCriado(`${origin}/auditor/${token}`);
    setEmailAuditor("");
    await load();
  };

  if (idLoading || !programaId) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeroHeader
        icon={<GavelIcon />}
        title="Governança avançada"
        description="Decisões, timeline e acesso temporário de auditor (somente leitura)."
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<GavelIcon />} iconPosition="start" label="Decisões" />
        <Tab icon={<TimelineIcon />} iconPosition="start" label="Timeline" />
        <Tab icon={<PersonSearchIcon />} iconPosition="start" label="Portal do auditor" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <CircularProgress />
      ) : tab === 0 ? (
        <Box>
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenDec(true)}>
            Registrar decisão
          </Button>
          <Stack spacing={1.5}>
            {decisoes.length === 0 && (
              <Typography color="text.secondary">Nenhuma decisão registrada.</Typography>
            )}
            {decisoes.map((d) => (
              <Box
                key={String(d.id)}
                sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography fontWeight={700}>{String(d.titulo)}</Typography>
                  <Chip size="small" label={String(d.status)} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {String(d.decisao || d.justificativa || "").slice(0, 240)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : tab === 1 ? (
        <Stack spacing={1}>
          {eventos.length === 0 && (
            <Typography color="text.secondary">
              Timeline vazia — eventos aparecem ao aprovar decisões, mudar workflow ou registrar ciência.
            </Typography>
          )}
          {eventos.map((ev) => (
            <Box
              key={String(ev.id)}
              sx={{ p: 1.25, borderLeft: "3px solid", borderColor: "primary.main", pl: 1.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                {ev.ocorrido_em ? new Date(String(ev.ocorrido_em)).toLocaleString("pt-BR") : "—"} ·{" "}
                {String(ev.origem)} / {String(ev.tipo)}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {String(ev.titulo)}
              </Typography>
              {ev.detalhe ? (
                <Typography variant="caption" color="text.secondary">
                  {String(ev.detalhe)}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Stack>
      ) : (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Gere um link temporário (14 dias). O auditor acessa só leitura via URL — sem alterar dados.
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="E-mail do auditor"
              value={emailAuditor}
              onChange={(e) => setEmailAuditor(e.target.value)}
            />
            <Button variant="contained" onClick={() => void criarAuditor()}>
              Gerar link
            </Button>
          </Stack>
          {linkCriado && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Link criado:{" "}
              <Typography component="span" sx={{ wordBreak: "break-all", fontSize: 13 }}>
                {linkCriado}
              </Typography>
            </Alert>
          )}
          <Stack spacing={1}>
            {auditores.map((a) => (
              <Box
                key={String(a.id)}
                sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
              >
                <Typography fontWeight={600}>{String(a.email)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Expira: {a.expires_at ? new Date(String(a.expires_at)).toLocaleString("pt-BR") : "—"}
                  {a.revoked_at ? " · revogado" : ""}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Dialog open={openDec} onClose={() => setOpenDec(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registro de decisão</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} fullWidth />
            <TextField
              label="Decisão"
              value={decisao}
              onChange={(e) => setDecisao(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDec(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void salvarDecisao()} disabled={!titulo.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
