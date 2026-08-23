"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import HandshakeIcon from "@mui/icons-material/Handshake";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  DUE_DILIGENCE_ITENS,
  FORNECEDOR_AVALIACAO,
  FORNECEDOR_CRITICIDADE,
  FORNECEDOR_TIPOS,
  dueDiligenceProgresso,
  proximaRevisaoAnual,
} from "@/lib/fornecedores/fornecedorCiclo";

type Forn = Record<string, unknown> & {
  id: number;
  nome: string;
  revisao_vencida?: boolean;
  sistemas?: { id: number; nome: string }[];
  mapeamentos?: { id: number; nome: string }[];
  riscos?: { id: number; titulo?: string; nome?: string }[];
};

const emptyForm = {
  nome: "",
  cnpj: "",
  tipo_fornecedor: "operador",
  contato: "",
  avaliacao_status: "pendente",
  criticidade: "media",
  possui_clausulas_lgpd: false,
  observacoes: "",
  data_ultima_avaliacao: "",
  data_proxima_revisao: "",
};

export default function FornecedoresPage() {
  const params = useParams();
  const { programaId, loading: idLoading, error: idError } = useProgramaIdFromParam(String(params?.id || ""));
  const [items, setItems] = useState<Forn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Forn | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [ddOpen, setDdOpen] = useState<Forn | null>(null);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/fornecedores`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setItems(json.fornecedores || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const salvar = async () => {
    if (!programaId || !form.nome.trim()) return;
    const proxima =
      form.data_proxima_revisao ||
      proximaRevisaoAnual(form.data_ultima_avaliacao || null);
    const body = {
      tipo: "fornecedores",
      ...form,
      data_proxima_revisao: proxima,
      ...(editing ? { id: editing.id } : {}),
    };
    const res = await fetch(`/api/programas/${programaId}/ativos`, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json();
      setError(j.error || "Erro ao salvar");
      return;
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    await load();
  };

  const toggleDd = async (f: Forn, itemId: string) => {
    if (!programaId) return;
    const current = Array.isArray(f.due_diligence) ? [...(f.due_diligence as string[])] : [];
    const next = current.includes(itemId) ? current.filter((x) => x !== itemId) : [...current, itemId];
    await fetch(`/api/programas/${programaId}/ativos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "fornecedores", id: f.id, due_diligence: next }),
    });
    await load();
    setDdOpen((prev) => (prev && prev.id === f.id ? { ...prev, due_diligence: next } : prev));
  };

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
        icon={<HandshakeIcon />}
        title="Mapa de fornecedores"
        description="Inventário, classificação de criticidade, cláusulas contratuais e revisão periódica — PPSI Controle 15, ISO 27002 5.19–5.23 e LGPD art. 39."
      />
      <Alert severity="info" sx={{ mb: 2 }}>
        Cadastre operadores e SaaS que tratam dados ou sustentam processos críticos. A revisão deve ser
        no máximo anual. Encerramento exige cortar contas, fluxos e descarte (ISO 5.23).
      </Alert>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setEditing(null);
          setForm(emptyForm);
          setOpen(true);
        }}
      >
        Novo fornecedor
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={1.5}>
          {items.length === 0 && (
            <Typography color="text.secondary">Nenhum fornecedor no mapa.</Typography>
          )}
          {items.map((f) => {
            const prog = dueDiligenceProgresso(f.due_diligence as string[] | undefined);
            return (
              <Box key={f.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={700}>{f.nome}</Typography>
                  {f.tipo ? <Chip size="small" label={String(f.tipo)} /> : null}
                  {f.criticidade ? <Chip size="small" color="warning" label={`criticidade ${f.criticidade}`} /> : null}
                  {f.possui_clausulas_lgpd ? (
                    <Chip size="small" color="success" label="cláusulas LGPD" />
                  ) : (
                    <Chip size="small" color="default" label="sem cláusulas" />
                  )}
                  {f.revisao_vencida ? <Chip size="small" color="error" label="revisão vencida" /> : null}
                  {f.encerrado_em ? <Chip size="small" label="encerrado" /> : null}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block">
                  Avaliação: {String(f.avaliacao_status || "—")} · próxima revisão:{" "}
                  {String(f.data_proxima_revisao || "não agendada")} · due diligence {prog.feitos}/{prog.total}
                </Typography>
                <Typography variant="caption" display="block">
                  Sistemas: {(f.sistemas || []).map((s) => s.nome).join(", ") || "—"} · Mapeamentos:{" "}
                  {(f.mapeamentos || []).length} · Riscos: {(f.riscos || []).length}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditing(f);
                      setForm({
                        nome: f.nome,
                        cnpj: String(f.cnpj || ""),
                        tipo_fornecedor: String(f.tipo || "operador"),
                        contato: String(f.contato || ""),
                        avaliacao_status: String(f.avaliacao_status || "pendente"),
                        criticidade: String(f.criticidade || "media"),
                        possui_clausulas_lgpd: Boolean(f.possui_clausulas_lgpd),
                        observacoes: String(f.observacoes || ""),
                        data_ultima_avaliacao: String(f.data_ultima_avaliacao || ""),
                        data_proxima_revisao: String(f.data_proxima_revisao || ""),
                      });
                      setOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="small" onClick={() => setDdOpen(f)}>
                    Due diligence
                  </Button>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Editar fornecedor" : "Novo fornecedor"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm((x) => ({ ...x, nome: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="CNPJ"
              value={form.cnpj}
              onChange={(e) => setForm((x) => ({ ...x, cnpj: e.target.value }))}
              fullWidth
            />
            <FormControl size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                label="Tipo"
                value={form.tipo_fornecedor}
                onChange={(e) => setForm((x) => ({ ...x, tipo_fornecedor: String(e.target.value) }))}
              >
                {FORNECEDOR_TIPOS.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Criticidade</InputLabel>
              <Select
                label="Criticidade"
                value={form.criticidade}
                onChange={(e) => setForm((x) => ({ ...x, criticidade: String(e.target.value) }))}
              >
                {FORNECEDOR_CRITICIDADE.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Avaliação</InputLabel>
              <Select
                label="Avaliação"
                value={form.avaliacao_status}
                onChange={(e) => setForm((x) => ({ ...x, avaliacao_status: String(e.target.value) }))}
              >
                {FORNECEDOR_AVALIACAO.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Contato"
              value={form.contato}
              onChange={(e) => setForm((x) => ({ ...x, contato: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Última avaliação"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.data_ultima_avaliacao}
              onChange={(e) => setForm((x) => ({ ...x, data_ultima_avaliacao: e.target.value }))}
            />
            <TextField
              label="Próxima revisão"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.data_proxima_revisao}
              onChange={(e) => setForm((x) => ({ ...x, data_proxima_revisao: e.target.value }))}
              helperText="Se vazio, agenda 12 meses após a última avaliação."
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.possui_clausulas_lgpd}
                  onChange={(e) => setForm((x) => ({ ...x, possui_clausulas_lgpd: e.target.checked }))}
                />
              }
              label="Contrato com cláusulas LGPD / SI"
            />
            <TextField
              label="Observações"
              value={form.observacoes}
              onChange={(e) => setForm((x) => ({ ...x, observacoes: e.target.value }))}
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void salvar()} disabled={!form.nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!ddOpen} onClose={() => setDdOpen(null)} fullWidth>
        <DialogTitle>Due diligence — {ddOpen?.nome}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Marque o que já foi evidenciado. Medidas PPSI 15.x / 22.x e art. 39 da LGPD.
          </Typography>
          <Stack>
            {DUE_DILIGENCE_ITENS.map((it) => {
              const done = Array.isArray(ddOpen?.due_diligence) && (ddOpen!.due_diligence as string[]).includes(it.id);
              return (
                <FormControlLabel
                  key={it.id}
                  control={
                    <Checkbox
                      checked={!!done}
                      onChange={() => ddOpen && void toggleDd(ddOpen, it.id)}
                    />
                  }
                  label={`${it.medida} — ${it.texto}`}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDdOpen(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
