"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type PlanoRow = {
  id: number;
  titulo: string;
  descricao?: string;
  prioridade: string;
  status: string;
  data_fim_prevista?: string | null;
  responsavel?: string;
  programa_medida_id?: number | null;
  workflow_estado?: string;
};

const STATUS_OPTS = [
  "rascunho",
  "nao_iniciado",
  "em_andamento",
  "concluido",
  "atrasado",
  "cancelado",
];

type Props = { programaId: number };

export function PlanosAcaoEntidadePanel({ programaId }: Props) {
  const [planos, setPlanos] = useState<PlanoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [prazo, setPrazo] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/programas/${programaId}/planos`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setPlanos(json.planos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/programas/${programaId}/planos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descricao,
          prioridade,
          data_fim_prevista: prazo || null,
          status: "nao_iniciado",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erro");
      setOpen(false);
      setTitulo("");
      setDescricao("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const patchStatus = async (id: number, status: string) => {
    await fetch(`/api/programas/${programaId}/planos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
          Ações do plano (entidade)
        </Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nova ação
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Inclui ações nascidas do diagnóstico e ações avulsas (comitê, incidente, etc.). Medida permanece
        opcional.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Prazo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Origem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma ação na entidade ainda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {planos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {p.titulo}
                  </Typography>
                  {p.descricao ? (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {p.descricao.slice(0, 120)}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={p.prioridade} />
                </TableCell>
                <TableCell>{p.data_fim_prevista || "—"}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={p.status}
                    onChange={(e) => void patchStatus(p.id, String(e.target.value))}
                    sx={{ minWidth: 140 }}
                  >
                    {STATUS_OPTS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  {p.programa_medida_id ? (
                    <Chip size="small" color="primary" variant="outlined" label="Medida" />
                  ) : (
                    <Chip size="small" variant="outlined" label="Avulsa" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova ação</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                label="Prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(String(e.target.value))}
              >
                {["baixa", "media", "alta", "critica"].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Prazo"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={saving || !titulo.trim()} onClick={() => void create()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
