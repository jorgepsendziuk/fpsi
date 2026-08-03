"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { RequisitoIaLabel } from "@/components/aigp/RequisitoIaLabel";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import * as dataService from "@/lib/services/dataService";
import type { Responsavel } from "@/lib/types/types";

type SistemaIaRow = {
  id: number;
  nome: string;
  finalidade: string;
  dono_negocio: string;
  tipo: string;
  nivel_risco: string;
  status_ciclo: string;
  decisao_automatizada: boolean;
};

const EMPTY = {
  nome: "",
  finalidade: "",
  dono_negocio: "",
  responsavel_tecnico_id: "" as number | "",
  tipo: "saas",
  nivel_risco: "moderado",
  status_ciclo: "rascunho",
  decisao_automatizada: false,
  ia_embutida: false,
  observacoes: "",
};

export default function InventarioIaPage() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);
  const [items, setItems] = useState<SistemaIaRow[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    if (!programaId) return;
    setLoading(true);
    setError(null);
    try {
      const [res, resp] = await Promise.all([
        fetch(`/api/programas/${programaId}/sistemas-ia`, { credentials: "include" }),
        dataService.fetchResponsaveis(programaId),
      ]);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao carregar inventário");
      setItems(json.items ?? []);
      setResponsaveis(resp || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [programaId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (!programaId || !form.nome.trim()) return;
    const res = await fetch(`/api/programas/${programaId}/sistemas-ia`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        responsavel_tecnico_id: form.responsavel_tecnico_id === "" ? null : form.responsavel_tecnico_id,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Falha ao salvar");
      return;
    }
    setOpen(false);
    setForm(EMPTY);
    await load();
  };

  if (idLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title={
          <RequisitoIaLabel variant="section" component="span">
            Inventário de sistemas de IA
          </RequisitoIaLabel>
        }
        description="Cadastro central de usos de IA (AIGP controle 27). Alimenta sugestões nas medidas 27.x do diagnóstico."
        trailing={
          <Stack direction="row" spacing={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(`/programas/${idOrSlug}/conformidade`)}>
              Conformidade
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
              Novo sistema
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Risco</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Decisão autom.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>Carregando…</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>Nenhum sistema cadastrado.</TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.nome}</TableCell>
                    <TableCell>{row.tipo}</TableCell>
                    <TableCell>{row.nivel_risco}</TableCell>
                    <TableCell>{row.status_ciclo}</TableCell>
                    <TableCell>{row.decisao_automatizada ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo sistema de IA</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} fullWidth required />
            <TextField label="Finalidade" value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} fullWidth multiline minRows={2} />
            <TextField label="Dono de negócio" value={form.dono_negocio} onChange={(e) => setForm({ ...form, dono_negocio: e.target.value })} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Responsável técnico</InputLabel>
              <Select
                label="Responsável técnico"
                value={form.responsavel_tecnico_id === "" ? "" : String(form.responsavel_tecnico_id)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responsavel_tecnico_id: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              >
                <MenuItem value="">
                  <em>Não definido</em>
                </MenuItem>
                {responsaveis.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>
                    {r.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select label="Tipo" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <MenuItem value="proprio">Próprio</MenuItem>
                <MenuItem value="saas">SaaS</MenuItem>
                <MenuItem value="api_terceiro">API / modelo terceiro</MenuItem>
                <MenuItem value="embedded">IA embutida em produto</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Nível de risco</InputLabel>
              <Select label="Nível de risco" value={form.nivel_risco} onChange={(e) => setForm({ ...form, nivel_risco: e.target.value })}>
                <MenuItem value="baixo">Baixo</MenuItem>
                <MenuItem value="moderado">Moderado</MenuItem>
                <MenuItem value="alto">Alto</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={!form.nome.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
