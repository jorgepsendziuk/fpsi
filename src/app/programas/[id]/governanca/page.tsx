"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import NextLink from "next/link";
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
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import TimelineIcon from "@mui/icons-material/Timeline";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BlockIcon from "@mui/icons-material/Block";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  ABA_AUDITOR,
  ABA_DECISOES,
  ABA_TIMELINE,
  GOVERNANCA_AVANCADA_INTRO,
} from "@/content/governancaAvancadaOrientacao";

type Decisao = {
  id: number;
  titulo: string;
  contexto?: string;
  problema?: string;
  alternativas?: string;
  decisao?: string;
  justificativa?: string;
  responsaveis?: string;
  data_decisao?: string | null;
  status?: string;
};

type Evento = {
  id: string;
  ocorrido_em?: string;
  origem?: string;
  tipo?: string;
  titulo?: string;
  detalhe?: string;
};

type Auditor = {
  id: number;
  email: string;
  expires_at?: string;
  revoked_at?: string | null;
  token?: string;
  last_access_at?: string | null;
};

const emptyForm = {
  titulo: "",
  contexto: "",
  problema: "",
  alternativas: "",
  decisao: "",
  justificativa: "",
  responsaveis: "",
  status: "aprovado",
};

export default function GovernancaAvancadaPage() {
  const params = useParams();
  const idOrSlug = String(params?.id || "");
  const { programaId, loading: idLoading, error: idError } = useProgramaIdFromParam(idOrSlug);
  const [tab, setTab] = useState(0);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [auditores, setAuditores] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDec, setOpenDec] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [emailAuditor, setEmailAuditor] = useState("");
  const [diasAuditor, setDiasAuditor] = useState(14);
  const [linkCriado, setLinkCriado] = useState<string | null>(null);
  const [filtroOrigem, setFiltroOrigem] = useState("todas");

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
    if (!programaId || !form.titulo.trim()) return;
    const res = await fetch(`/api/programas/${programaId}/decisoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        data_decisao: new Date().toISOString().slice(0, 10),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao salvar decisão");
      return;
    }
    setOpenDec(false);
    setForm(emptyForm);
    await load();
  };

  const arquivarDecisao = async (id: number) => {
    if (!programaId) return;
    await fetch(`/api/programas/${programaId}/decisoes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "arquivado" }),
    });
    await load();
  };

  const criarAuditor = async () => {
    if (!programaId || !emailAuditor.trim()) return;
    const res = await fetch(`/api/programas/${programaId}/governanca`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "auditor", email: emailAuditor, dias: diasAuditor }),
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

  const revogarAuditor = async (id: number) => {
    if (!programaId) return;
    await fetch(`/api/programas/${programaId}/governanca`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, acao: "revogar" }),
    });
    await load();
  };

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      setError("Não foi possível copiar");
    }
  };

  const eventosFiltrados = useMemo(() => {
    if (filtroOrigem === "todas") return eventos;
    return eventos.filter((e) => String(e.origem) === filtroOrigem);
  }, [eventos, filtroOrigem]);

  if (idLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (!programaId) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{idError || "Programa não encontrado."}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <PageHeroHeader
        icon={<GavelIcon />}
        title="Governança avançada"
        description={GOVERNANCA_AVANCADA_INTRO.lead}
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {GOVERNANCA_AVANCADA_INTRO.normas.join(" · ")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Não confundir com{" "}
          {GOVERNANCA_AVANCADA_INTRO.naoConfundir.map((n, i) => (
            <React.Fragment key={n.rota}>
              {i > 0 ? " e " : ""}
              <Link component={NextLink} href={`/programas/${idOrSlug}/${n.rota}`}>
                {n.nome}
              </Link>
              {` (${n.texto})`}
            </React.Fragment>
          ))}
        </Typography>
      </Alert>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab icon={<GavelIcon />} iconPosition="start" label="Decisões" />
        <Tab icon={<TimelineIcon />} iconPosition="start" label="Timeline" />
        <Tab icon={<PersonSearchIcon />} iconPosition="start" label="Portal do auditor" />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : tab === 0 ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>{ABA_DECISOES.titulo}.</strong> {ABA_DECISOES.oQueE}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              {ABA_DECISOES.normas}
            </Typography>
          </Alert>
          <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpenDec(true)}>
            Registrar decisão
          </Button>
          <Stack spacing={1.5}>
            {decisoes.length === 0 && (
              <Typography color="text.secondary">Nenhuma decisão registrada.</Typography>
            )}
            {decisoes.map((d) => (
              <Box
                key={d.id}
                sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap">
                  <Typography fontWeight={700}>{d.titulo}</Typography>
                  <Chip size="small" label={d.status || "—"} />
                  {d.data_decisao ? (
                    <Typography variant="caption" color="text.secondary">
                      {d.data_decisao}
                    </Typography>
                  ) : null}
                  {d.status !== "arquivado" ? (
                    <Button size="small" onClick={() => void arquivarDecisao(d.id)}>
                      Arquivar
                    </Button>
                  ) : null}
                </Stack>
                {d.problema ? (
                  <Typography variant="body2" color="text.secondary">
                    Problema: {d.problema}
                  </Typography>
                ) : null}
                <Typography variant="body2">{(d.decisao || d.justificativa || "").slice(0, 400)}</Typography>
                {d.responsaveis ? (
                  <Typography variant="caption" color="text.secondary">
                    Responsáveis: {d.responsaveis}
                  </Typography>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Box>
      ) : tab === 1 ? (
        <Stack spacing={1}>
          <Alert severity="info">
            <strong>{ABA_TIMELINE.titulo}.</strong> {ABA_TIMELINE.oQueE}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              {ABA_TIMELINE.normas}
            </Typography>
          </Alert>
          <FormControl size="small" sx={{ maxWidth: 240 }}>
            <InputLabel>Origem</InputLabel>
            <Select
              label="Origem"
              value={filtroOrigem}
              onChange={(e) => setFiltroOrigem(String(e.target.value))}
            >
              <MenuItem value="todas">Todas</MenuItem>
              <MenuItem value="decisao">Decisões</MenuItem>
              <MenuItem value="workflow">Workflow</MenuItem>
              <MenuItem value="ciencia">Ciência</MenuItem>
            </Select>
          </FormControl>
          {eventosFiltrados.length === 0 && (
            <Typography color="text.secondary">
              Timeline vazia — eventos aparecem ao aprovar decisões, mudar workflow ou registrar ciência.
            </Typography>
          )}
          {eventosFiltrados.map((ev) => (
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
            <strong>{ABA_AUDITOR.titulo}.</strong> {ABA_AUDITOR.oQueE}{" "}
            <Typography component="span" variant="caption" color="text.secondary">
              {ABA_AUDITOR.normas}
            </Typography>
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              label="E-mail do auditor"
              value={emailAuditor}
              onChange={(e) => setEmailAuditor(e.target.value)}
            />
            <TextField
              size="small"
              type="number"
              label="Dias"
              value={diasAuditor}
              onChange={(e) => setDiasAuditor(Math.min(90, Math.max(1, Number(e.target.value) || 14)))}
              sx={{ width: 100 }}
              inputProps={{ min: 1, max: 90 }}
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
              <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => void copiar(linkCriado)}>
                Copiar
              </Button>
            </Alert>
          )}
          <Stack spacing={1}>
            {auditores.map((a) => {
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const url = a.token ? `${origin}/auditor/${a.token}` : "";
              return (
                <Box
                  key={a.id}
                  sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                >
                  <Typography fontWeight={600}>{a.email}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Expira: {a.expires_at ? new Date(a.expires_at).toLocaleString("pt-BR") : "—"}
                    {a.revoked_at ? " · revogado" : ""}
                    {a.last_access_at
                      ? ` · último acesso ${new Date(a.last_access_at).toLocaleString("pt-BR")}`
                      : ""}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {url && !a.revoked_at ? (
                      <Button size="small" startIcon={<ContentCopyIcon />} onClick={() => void copiar(url)}>
                        Copiar link
                      </Button>
                    ) : null}
                    {!a.revoked_at ? (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<BlockIcon />}
                        onClick={() => void revogarAuditor(a.id)}
                      >
                        Revogar
                      </Button>
                    ) : null}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}

      <Dialog open={openDec} onClose={() => setOpenDec(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registro de decisão</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Contexto"
              value={form.contexto}
              onChange={(e) => setForm((f) => ({ ...f, contexto: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Problema"
              value={form.problema}
              onChange={(e) => setForm((f) => ({ ...f, problema: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Alternativas consideradas"
              value={form.alternativas}
              onChange={(e) => setForm((f) => ({ ...f, alternativas: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Decisão"
              value={form.decisao}
              onChange={(e) => setForm((f) => ({ ...f, decisao: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Justificativa"
              value={form.justificativa}
              onChange={(e) => setForm((f) => ({ ...f, justificativa: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Responsáveis"
              value={form.responsaveis}
              onChange={(e) => setForm((f) => ({ ...f, responsaveis: e.target.value }))}
              fullWidth
            />
            <FormControl size="small">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: String(e.target.value) }))}
              >
                <MenuItem value="rascunho">Rascunho</MenuItem>
                <MenuItem value="aprovado">Aprovado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDec(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void salvarDecisao()} disabled={!form.titulo.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
