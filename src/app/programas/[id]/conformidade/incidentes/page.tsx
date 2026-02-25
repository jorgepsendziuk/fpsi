"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useTheme,
  alpha,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Warning as WarningIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import type { IncidenteRow } from "@/lib/services/dataService";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const PDF_MARGIN = 14;
const PDF_PAGE_HEIGHT = 297;
const PDF_LINE = 5;
const PDF_MAX_W = 180;

function addIncidenteToPdf(doc: jsPDF, inc: IncidenteRow, programaLabel: string, startY: number, isFirst: boolean): number {
  let y = startY;
  const push = (label: string, value: string | null) => {
    if (y > PDF_PAGE_HEIGHT - 25) {
      doc.addPage();
      y = PDF_MARGIN + 5;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, PDF_MARGIN, y);
    y += PDF_LINE;
    doc.setFont("helvetica", "normal");
    const text = (value ?? "—").toString();
    const lines = doc.splitTextToSize(text, PDF_MAX_W);
    lines.forEach((line: string) => {
      if (y > PDF_PAGE_HEIGHT - 20) {
        doc.addPage();
        y = PDF_MARGIN + 5;
      }
      doc.text(line, PDF_MARGIN, y);
      y += PDF_LINE;
    });
    y += 3;
  };
  if (isFirst) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Incidente: ${inc.titulo || "Sem título"}`, PDF_MARGIN, y);
    y += 8;
  }
  push("Programa", programaLabel);
  push("Título", inc.titulo);
  push("Data ocorrência", inc.data_ocorrencia ? dayjs(inc.data_ocorrencia).format("DD/MM/YYYY") : null);
  push("Data detecção", inc.data_detecao ? dayjs(inc.data_detecao).format("DD/MM/YYYY") : null);
  push("Tipo", inc.tipo);
  push("Descrição", inc.descricao);
  push("Dados afetados", inc.dados_afetados);
  push("Comunicação ANPD", inc.comunicacao_anpd ? "Sim" : "Não");
  push("Data comunicação ANPD", inc.data_comunicacao_anpd ? dayjs(inc.data_comunicacao_anpd).format("DD/MM/YYYY") : null);
  push("Comunicação titulares", inc.comunicacao_titulares ? "Sim" : "Não");
  push("Data comunicação titulares", inc.data_comunicacao_titulares ? dayjs(inc.data_comunicacao_titulares).format("DD/MM/YYYY") : null);
  push("Medidas adotadas", inc.medidas_adotadas);
  push("Status", dataService.INCIDENTE_STATUS.find((s) => s.value === inc.status)?.label ?? inc.status);
  push("Data registro", inc.created_at ? dayjs(inc.created_at).format("DD/MM/YYYY HH:mm") : null);
  return y;
}

export default function IncidentesPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [programa, setPrograma] = useState<{ nome?: string } | null>(null);
  const [incidentes, setIncidentes] = useState<IncidenteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({
    data_ocorrencia: "",
    data_detecao: "",
    titulo: "",
    descricao: "",
    tipo: "",
    dados_afetados: "",
    comunicacao_anpd: false,
    data_comunicacao_anpd: "",
    comunicacao_titulares: false,
    data_comunicacao_titulares: "",
    medidas_adotadas: "",
    status: "em_analise",
  });

  React.useEffect(() => {
    if (!idOrSlug) return;
    dataService.fetchProgramaByIdOrSlug(idOrSlug).then((p) => setPrograma(p ?? null)).catch(() => setPrograma(null));
  }, [idOrSlug]);

  React.useEffect(() => {
    if (programaId == null) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchIncidentesByPrograma(programaId)
      .then((rows) => {
        if (!cancelled) setIncidentes(rows);
      })
      .catch((err) => {
        if (!cancelled) console.error("Erro ao carregar incidentes:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const programaLabel = programa?.nome ?? idOrSlug;

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      data_ocorrencia: "",
      data_detecao: "",
      titulo: "",
      descricao: "",
      tipo: "",
      dados_afetados: "",
      comunicacao_anpd: false,
      data_comunicacao_anpd: "",
      comunicacao_titulares: false,
      data_comunicacao_titulares: "",
      medidas_adotadas: "",
      status: "em_analise",
    });
    setOpen(true);
  };

  const handleOpenEdit = (inc: IncidenteRow) => {
    setEditingId(inc.id);
    setForm({
      data_ocorrencia: inc.data_ocorrencia ? inc.data_ocorrencia.slice(0, 10) : "",
      data_detecao: inc.data_detecao ? inc.data_detecao.slice(0, 10) : "",
      titulo: inc.titulo ?? "",
      descricao: inc.descricao ?? "",
      tipo: inc.tipo ?? "",
      dados_afetados: inc.dados_afetados ?? "",
      comunicacao_anpd: inc.comunicacao_anpd ?? false,
      data_comunicacao_anpd: inc.data_comunicacao_anpd ? inc.data_comunicacao_anpd.slice(0, 10) : "",
      comunicacao_titulares: inc.comunicacao_titulares ?? false,
      data_comunicacao_titulares: inc.data_comunicacao_titulares ? inc.data_comunicacao_titulares.slice(0, 10) : "",
      medidas_adotadas: inc.medidas_adotadas ?? "",
      status: inc.status ?? "em_analise",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || programaId == null) return;
    setSaving(true);
    try {
      const payload = {
        data_ocorrencia: form.data_ocorrencia || null,
        data_detecao: form.data_detecao || null,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        tipo: form.tipo.trim() || null,
        dados_afetados: form.dados_afetados.trim() || null,
        comunicacao_anpd: form.comunicacao_anpd,
        data_comunicacao_anpd: form.data_comunicacao_anpd || null,
        comunicacao_titulares: form.comunicacao_titulares,
        data_comunicacao_titulares: form.data_comunicacao_titulares || null,
        medidas_adotadas: form.medidas_adotadas.trim() || null,
        status: form.status,
      };
      if (editingId != null) {
        const updated = await dataService.updateIncidente(editingId, payload);
        setIncidentes((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      } else {
        const created = await dataService.createIncidente(programaId, payload);
        setIncidentes((prev) => [created, ...prev]);
      }
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar incidente:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window === "undefined" || !window.confirm("Excluir este registro de incidente?")) return;
    try {
      await dataService.deleteIncidente(id);
      setIncidentes((prev) => prev.filter((i) => i.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Erro ao excluir incidente:", err);
    }
  };

  const exportExcel = useCallback(() => {
    const headers = [
      "Título",
      "Data ocorrência",
      "Data detecção",
      "Tipo",
      "Status",
      "Comunicação ANPD",
      "Data com. ANPD",
      "Comunicação titulares",
      "Data com. titulares",
      "Descrição",
      "Dados afetados",
      "Medidas adotadas",
      "Data registro",
    ];
    const rows = incidentes.map((i) => [
      i.titulo,
      i.data_ocorrencia ? dayjs(i.data_ocorrencia).format("DD/MM/YYYY") : "",
      i.data_detecao ? dayjs(i.data_detecao).format("DD/MM/YYYY") : "",
      i.tipo ?? "",
      dataService.INCIDENTE_STATUS.find((s) => s.value === i.status)?.label ?? i.status,
      i.comunicacao_anpd ? "Sim" : "Não",
      i.data_comunicacao_anpd ? dayjs(i.data_comunicacao_anpd).format("DD/MM/YYYY") : "",
      i.comunicacao_titulares ? "Sim" : "Não",
      i.data_comunicacao_titulares ? dayjs(i.data_comunicacao_titulares).format("DD/MM/YYYY") : "",
      i.descricao ?? "",
      i.dados_afetados ?? "",
      i.medidas_adotadas ?? "",
      i.created_at ? dayjs(i.created_at).format("DD/MM/YYYY HH:mm") : "",
    ]);
    const csvContent = [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Incidentes-Programa-${idOrSlug}-${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [incidentes, idOrSlug]);

  const exportPdfSingle = useCallback(
    (inc: IncidenteRow) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(14);
      doc.text("Registro de Incidentes de Segurança (dados pessoais)", PDF_MARGIN, 18);
      doc.setFontSize(9);
      doc.text(`Programa: ${programaLabel} | Data: ${dayjs().format("DD/MM/YYYY")}`, PDF_MARGIN, 24);
      addIncidenteToPdf(doc, inc, programaLabel, 30, true);
      const safe = (inc.titulo || String(inc.id)).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);
      doc.save(`Incidente-${safe}-${dayjs().format("YYYY-MM-DD")}.pdf`);
    },
    [programaLabel]
  );

  const exportPdfBatch = useCallback(
    (list: IncidenteRow[]) => {
      if (list.length === 0) return;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(14);
      doc.text("Registro de Incidentes de Segurança (dados pessoais)", PDF_MARGIN, 18);
      doc.setFontSize(9);
      doc.text(`Programa: ${programaLabel} | ${list.length} incidente(s) | ${dayjs().format("DD/MM/YYYY")}`, PDF_MARGIN, 24);
      list.forEach((inc, idx) => {
        if (idx > 0) doc.addPage();
        addIncidenteToPdf(doc, inc, programaLabel, PDF_MARGIN + 5, true);
      });
      doc.save(`Incidentes-Programa-${idOrSlug}-${dayjs().format("YYYY-MM-DD")}.pdf`);
    },
    [programaLabel, idOrSlug]
  );

  const exportPdfSelected = () => exportPdfBatch(incidentes.filter((i) => selectedIds.has(i.id)));
  const exportPdfAll = () => exportPdfBatch(incidentes);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === incidentes.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(incidentes.map((i) => i.id)));
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
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push("/programas")} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Programas
        </Link>
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push(`/programas/${idOrSlug}`)} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Programa
        </Link>
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push(`/programas/${idOrSlug}/conformidade`)} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Conformidade LGPD
        </Link>
        <Typography color="text.primary">Incidentes</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <WarningIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">Incidentes</Typography>
            <Typography variant="body2" color="text.secondary">
              Registro de incidentes de segurança que afetam dados pessoais; comunicação ANPD e titulares.
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" startIcon={<ExcelIcon />} onClick={exportExcel} disabled={incidentes.length === 0}>
            Exportar Excel (CSV)
          </Button>
          <Tooltip title="Gerar PDF com todos os incidentes">
            <span>
              <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportPdfAll} disabled={incidentes.length === 0}>
                Exportar todos em PDF
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Gerar PDF apenas dos incidentes marcados">
            <span>
              <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportPdfSelected} disabled={selectedIds.size === 0}>
                Exportar selecionados em PDF ({selectedIds.size})
              </Button>
            </span>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
            Novo incidente
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < incidentes.length}
                  checked={incidentes.length > 0 && selectedIds.size === incidentes.length}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableCell>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Data ocorrência</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>ANPD</strong></TableCell>
              <TableCell><strong>Titulares</strong></TableCell>
              <TableCell align="right"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Carregando…</Typography>
                </TableCell>
              </TableRow>
            ) : incidentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhum incidente cadastrado. Clique em &quot;Novo incidente&quot; para começar.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              incidentes.map((inc) => (
                <TableRow key={inc.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedIds.has(inc.id)} onChange={() => toggleSelect(inc.id)} aria-label={`Selecionar ${inc.titulo}`} />
                  </TableCell>
                  <TableCell>{inc.titulo}</TableCell>
                  <TableCell>{inc.data_ocorrencia ? dayjs(inc.data_ocorrencia).format("DD/MM/YYYY") : "—"}</TableCell>
                  <TableCell>{dataService.INCIDENTE_STATUS.find((s) => s.value === inc.status)?.label ?? inc.status}</TableCell>
                  <TableCell>{inc.comunicacao_anpd ? "Sim" : "Não"}</TableCell>
                  <TableCell>{inc.comunicacao_titulares ? "Sim" : "Não"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Exportar PDF">
                      <IconButton size="small" onClick={() => exportPdfSingle(inc)} aria-label="Exportar PDF">
                        <GetAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleOpenEdit(inc)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(inc.id)} aria-label="Excluir" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId != null ? "Editar incidente" : "Novo incidente"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Título" value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Data da ocorrência" value={form.data_ocorrencia} onChange={(e) => setForm((f) => ({ ...f, data_ocorrencia: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="date" label="Data da detecção" value={form.data_detecao} onChange={(e) => setForm((f) => ({ ...f, data_detecao: e.target.value }))} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tipo" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} placeholder="Ex.: vazamento, acesso indevido" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status} label="Status" onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  {dataService.INCIDENTE_STATUS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Dados afetados" value={form.dados_afetados} onChange={(e) => setForm((f) => ({ ...f, dados_afetados: e.target.value }))} placeholder="Categorias de dados pessoais afetados" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Checkbox checked={form.comunicacao_anpd} onChange={(e) => setForm((f) => ({ ...f, comunicacao_anpd: e.target.checked }))} />}
                label="Comunicação à ANPD"
              />
              <TextField fullWidth type="date" size="small" label="Data comunicação ANPD" value={form.data_comunicacao_anpd} onChange={(e) => setForm((f) => ({ ...f, data_comunicacao_anpd: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Checkbox checked={form.comunicacao_titulares} onChange={(e) => setForm((f) => ({ ...f, comunicacao_titulares: e.target.checked }))} />}
                label="Comunicação aos titulares"
              />
              <TextField fullWidth type="date" size="small" label="Data comunicação titulares" value={form.data_comunicacao_titulares} onChange={(e) => setForm((f) => ({ ...f, data_comunicacao_titulares: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Medidas adotadas" value={form.medidas_adotadas} onChange={(e) => setForm((f) => ({ ...f, medidas_adotadas: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.titulo.trim() || saving}>
            {saving ? "Salvando…" : editingId != null ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push(`/programas/${idOrSlug}/conformidade`)}>
          Voltar ao Conformidade LGPD
        </Button>
      </Box>
    </Container>
  );
}
