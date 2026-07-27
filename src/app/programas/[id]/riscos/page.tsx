"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
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
  Stack,
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
  FilterAltOff as FilterOffIcon,
  WarningAmber as WarningIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { RiscoHeatmap, type RiscoHeatmapFilter } from "@/components/riscos/RiscoHeatmap";
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
  { value: "muito_baixo", label: "1 · Muito baixo" },
  { value: "baixo", label: "2 · Baixo" },
  { value: "medio", label: "3 · Médio" },
  { value: "alto", label: "4 · Alto" },
  { value: "muito_alto", label: "5 · Muito alto" },
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

function scoreOf(r: ProgramaRiscoRow): number | null {
  return r.score_residual ?? r.score_inerente ?? null;
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
  const [filter, setFilter] = useState<RiscoHeatmapFilter>(null);

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

  const kpis = useMemo(() => {
    const ativos = riscos.filter((r) => r.status !== "encerrado" && r.status !== "mitigado");
    const criticos = ativos.filter((r) => (scoreOf(r) ?? 0) >= 12).length;
    const emTratamento = riscos.filter((r) => r.status === "em_tratamento").length;
    const mitigados = riscos.filter((r) => r.status === "mitigado" || r.status === "encerrado").length;
    return {
      total: riscos.length,
      ativos: ativos.length,
      criticos,
      emTratamento,
      mitigados,
    };
  }, [riscos]);

  const filtered = useMemo(() => {
    if (!filter) return riscos;
    return riscos.filter(
      (r) =>
        r.probabilidade === filter.probabilidade &&
        r.impacto === filter.impacto &&
        r.status !== "encerrado" &&
        r.status !== "mitigado",
    );
  }, [riscos, filter]);

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
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (programaId == null) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Typography color="error">Programa não encontrado.</Typography>
      </Container>
    );
  }

  const kpiItems = [
    { label: "Registrados", value: kpis.total, color: theme.palette.text.primary },
    { label: "Ativos", value: kpis.ativos, color: theme.palette.info.main },
    { label: "Prioritários", value: kpis.criticos, color: theme.palette.error.main },
    { label: "Em tratamento", value: kpis.emTratamento, color: theme.palette.warning.main },
  ];

  return (
    <Box
      sx={{
        height: { md: "calc(100dvh - 64px)" },
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, sm: 3 },
        py: { xs: 1.5, md: 2 },
        maxWidth: 1200,
        mx: "auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <PageHeroHeader
        title="Gestão de riscos"
        icon={<WarningIcon sx={{ fontSize: 26 }} aria-hidden />}
        description="Registre riscos, veja onde concentrar esforço e atualize o status de tratamento."
        sx={{ mb: 1.25 }}
        trailing={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push(`/programas/${idOrSlug}`)}
              sx={{ textTransform: "none", display: { xs: "none", sm: "inline-flex" } }}
            >
              Programa
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Novo risco
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={1} sx={{ mb: 1.25 }}>
        {kpiItems.map((k) => (
          <Grid item xs={6} sm={3} key={k.label}>
            <Paper
              variant="outlined"
              sx={{
                px: 1.25,
                py: 0.75,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                borderTop: `2px solid ${k.color}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {k.label}
              </Typography>
              <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1, color: k.color }}>
                {loading ? "…" : k.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={12} sx={{ display: "flex" }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 1.25, md: 1.75 },
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.015em">
                Matriz P×I
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clique para filtrar
              </Typography>
            </Box>

            <Box
              sx={{
                px: { xs: 0.5, md: 1 },
                py: { xs: 0.5, md: 0.75 },
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.35 : 0.4),
              }}
            >
              <RiscoHeatmap
                riscos={riscos}
                embedded
                relaxed
                selected={filter}
                onSelect={setFilter}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Escala 1–5 · só riscos ativos (não mitigados/encerrados)
            </Typography>

            {riscos.length === 0 && !loading && (
              <Box
                sx={{
                  mt: "auto",
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.28)}`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.5 }}>
                  Como começar
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  1. Clique em <strong>Novo risco</strong>
                  <br />
                  2. Informe probabilidade e impacto (1–5)
                  <br />
                  3. Acompanhe no mapa e mude o status na lista
                </Typography>
              </Box>
            )}

            {filter && (
              <Button
                size="small"
                startIcon={<FilterOffIcon />}
                onClick={() => setFilter(null)}
                sx={{ textTransform: "none", alignSelf: "flex-start" }}
              >
                Limpar filtro do mapa
              </Button>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ display: "flex", minHeight: 0, flex: 1 }}>
          <Paper
            variant="outlined"
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 320, md: 0 },
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  Lista de riscos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filter
                    ? `${filtered.length} no filtro · altere o status para tratar`
                    : `${filtered.length} item(ns) · priorize os de score ≥ 12`}
                </Typography>
              </Box>
              {filter && (
                <Chip
                  size="small"
                  color="warning"
                  label="Filtro ativo"
                  onDelete={() => setFilter(null)}
                />
              )}
            </Box>

            <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper" }}>Risco</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper", width: 88 }}>
                      Score
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper", width: 150 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "background.paper", width: 100 }}>
                      Revisão
                    </TableCell>
                    <TableCell sx={{ bgcolor: "background.paper", width: 40 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        Carregando…
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {riscos.length === 0
                            ? "Nenhum risco ainda. Registre o primeiro para popular o mapa."
                            : "Nenhum risco neste filtro."}
                        </Typography>
                        {riscos.length === 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                            sx={{ textTransform: "none" }}
                          >
                            Registrar primeiro risco
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((r) => {
                      const sc = scoreOf(r);
                      return (
                        <TableRow key={r.id} hover>
                          <TableCell sx={{ py: 0.85 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.25 }}>
                              {r.titulo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {CATEGORIAS.find((c) => c.value === r.categoria)?.label ?? r.categoria}
                              {" · "}
                              P{NIVEIS.findIndex((n) => n.value === r.probabilidade) + 1 || "?"}
                              ×I{NIVEIS.findIndex((n) => n.value === r.impacto) + 1 || "?"}
                              {r.responsavel ? ` · ${r.responsavel}` : ""}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={sc ?? "—"} color={scoreColor(sc)} sx={{ fontWeight: 700 }} />
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={r.status}
                              onChange={(e) => handleStatusChange(r, e.target.value)}
                              variant="standard"
                              disableUnderline
                              sx={{ fontSize: "0.8125rem", minWidth: 120 }}
                            >
                              {STATUS_OPTS.map((s) => (
                                <MenuItem key={s.value} value={s.value}>
                                  {s.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {r.data_revisao ? dayjs(r.data_revisao).format("DD/MM/YY") : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(r.id)}
                              aria-label="Excluir"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar risco</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, mt: 0.5 }}>
            Probabilidade e impacto (1–5) posicionam o risco no mapa e definem o score de prioridade.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                required
                autoFocus
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
              <FormControl fullWidth size="small">
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
              <FormControl fullWidth size="small">
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
              <FormControl fullWidth size="small">
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
                label="Como mitigar"
                value={form.estrategia_mitigacao}
                onChange={(e) => setForm((f) => ({ ...f, estrategia_mitigacao: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
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
    </Box>
  );
}
