"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { RiscoHeatmap } from "@/components/riscos/RiscoHeatmap";
import * as dataService from "@/lib/services/dataService";
import type { ProgramaRiscoRow } from "@/lib/services/dataService";

const CATEGORIAS = [
  { value: "privacidade", label: "Privacidade" },
  { value: "seguranca", label: "Segurança" },
  { value: "conformidade", label: "Conformidade" },
  { value: "operacional", label: "Operacional" },
  { value: "reputacional", label: "Reputacional" },
  { value: "direitos_titulares", label: "Direitos dos titulares" },
];

const NIVEIS = [
  { value: "muito_baixo", label: "Muito baixo" },
  { value: "baixo", label: "Baixo" },
  { value: "medio", label: "Médio" },
  { value: "alto", label: "Alto" },
  { value: "muito_alto", label: "Muito alto" },
];

const STATUS_OPTS = [
  { value: "identificado", label: "Identificado" },
  { value: "em_tratamento", label: "Em tratamento" },
  { value: "mitigado", label: "Mitigado" },
  { value: "aceito", label: "Aceito" },
  { value: "materializado", label: "Materializado" },
  { value: "encerrado", label: "Encerrado" },
];

function scoreColor(score: number | null): "default" | "success" | "warning" | "error" {
  if (score == null) return "default";
  if (score >= 20) return "error";
  if (score >= 12) return "warning";
  return "success";
}

const EMPTY_FORM = {
  titulo: "",
  descricao: "",
  categoria: "privacidade",
  probabilidade: "medio",
  impacto: "medio",
  status: "identificado",
  estrategia_mitigacao: "",
  responsavel: "",
};

export default function RiscosPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [riscos, setRiscos] = useState<ProgramaRiscoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(() => {
    if (programaId == null) return;
    setLoading(true);
    dataService
      .fetchProgramaRiscos(programaId)
      .then(setRiscos)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [programaId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!programaId || !form.titulo.trim()) return;
    setSaving(true);
    try {
      await dataService.createProgramaRisco(programaId, form);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setToast("Risco registrado");
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (risco: ProgramaRiscoRow, status: string) => {
    if (!programaId) return;
    try {
      await dataService.updateProgramaRisco(programaId, risco.id, { status });
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  };

  const handleDelete = async (riscoId: number) => {
    if (!programaId || !confirm("Excluir este risco?")) return;
    try {
      await dataService.deleteProgramaRisco(programaId, riscoId);
      load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Erro ao excluir");
    }
  };

  if (idLoading || (programaId == null && !loading)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (programaId == null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Programa não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Gestão de riscos"
        icon={<WarningIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Registro centralizado de riscos de privacidade e segurança com matriz 5×5"
        trailing={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Novo risco
          </Button>
        }
      />
      <ProgramaLastActivityLine programaId={programaId} programaPathSegment={idOrSlug} sx={{ mb: 2 }} />

      <Paper sx={{ p: 2, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <RiscoHeatmap riscos={riscos} />
      </Paper>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Categoria</strong></TableCell>
              <TableCell><strong>Prob. × Impacto</strong></TableCell>
              <TableCell><strong>Score</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Revisão</strong></TableCell>
              <TableCell width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  Carregando…
                </TableCell>
              </TableRow>
            ) : riscos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  Nenhum risco registrado. Use &quot;Novo risco&quot; para começar.
                </TableCell>
              </TableRow>
            ) : (
              riscos.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {r.titulo}
                    </Typography>
                    {r.descricao && (
                      <Typography variant="caption" color="text.secondary">
                        {r.descricao.slice(0, 120)}
                        {r.descricao.length > 120 ? "…" : ""}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{CATEGORIAS.find((c) => c.value === r.categoria)?.label ?? r.categoria}</TableCell>
                  <TableCell>
                    {NIVEIS.find((n) => n.value === r.probabilidade)?.label} ×{" "}
                    {NIVEIS.find((n) => n.value === r.impacto)?.label}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.score_residual ?? r.score_inerente ?? "—"}
                      color={scoreColor(r.score_residual ?? r.score_inerente)}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={r.status}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      variant="standard"
                      disableUnderline
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {STATUS_OPTS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {r.data_revisao ? dayjs(r.data_revisao).format("DD/MM/YYYY") : "—"}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => handleDelete(r.id)} aria-label="Excluir">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(`/programas/${idOrSlug}`)}>
          Voltar ao programa
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar risco</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                required
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Descrição"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  label="Categoria"
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                >
                  {CATEGORIAS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Probabilidade</InputLabel>
                <Select
                  label="Probabilidade"
                  value={form.probabilidade}
                  onChange={(e) => setForm((f) => ({ ...f, probabilidade: e.target.value }))}
                >
                  {NIVEIS.map((n) => (
                    <MenuItem key={n.value} value={n.value}>
                      {n.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Impacto</InputLabel>
                <Select
                  label="Impacto"
                  value={form.impacto}
                  onChange={(e) => setForm((f) => ({ ...f, impacto: e.target.value }))}
                >
                  {NIVEIS.map((n) => (
                    <MenuItem key={n.value} value={n.value}>
                      {n.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Estratégia de mitigação"
                value={form.estrategia_mitigacao}
                onChange={(e) => setForm((f) => ({ ...f, estrategia_mitigacao: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Responsável"
                value={form.responsavel}
                onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !form.titulo.trim()}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)} message={toast} />
    </Container>
  );
}
