"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Tooltip,
  useTheme,
  alpha,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  GetApp as GetAppIcon,
  Assignment as AssignmentIcon,
  ContentCopy as CopyIcon,
  QrCode2 as QrCodeIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";
import * as dataService from "@/lib/services/dataService";
import type { PedidoTitularRow } from "@/lib/services/dataService";
import { QRCodeSVG } from "qrcode.react";

const PDF_MARGIN = 14;
const PDF_PAGE_HEIGHT = 297;
const PDF_LINE = 5;
const PDF_MAX_W = 180;

function addPedidoToPdf(
  doc: jsPDF,
  pedido: PedidoTitularRow,
  programaNome: string,
  startY: number,
  isFirst: boolean
): number {
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
    doc.text(`Pedido: ${pedido.protocolo ?? pedido.id}`, PDF_MARGIN, y);
    y += 8;
  }
  push("Programa", programaNome);
  push("Protocolo", pedido.protocolo);
  push("Tipo", dataService.PEDIDO_TITULAR_TIPOS.find((t) => t.value === pedido.tipo)?.label ?? pedido.tipo);
  push("Nome do titular", pedido.nome_titular);
  push("E-mail", pedido.email_titular);
  push("Documento", pedido.documento_titular);
  push("Descrição do pedido", pedido.descricao_pedido);
  push("Status", dataService.PEDIDO_TITULAR_STATUS.find((s) => s.value === pedido.status)?.label ?? pedido.status);
  push("Data prazo resposta", pedido.data_prazo_resposta ?? null);
  push("Data resposta", pedido.data_resposta ? dayjs(pedido.data_resposta).format("DD/MM/YYYY HH:mm") : null);
  push("Data de registro", pedido.created_at ? dayjs(pedido.created_at).format("DD/MM/YYYY HH:mm") : null);
  return y;
}

export default function PedidosTitularesPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [programa, setPrograma] = useState<{ nome?: string; slug?: string } | null>(null);
  const [pedidos, setPedidos] = useState<PedidoTitularRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [form, setForm] = useState({
    tipo: "acesso",
    nome_titular: "",
    email_titular: "",
    documento_titular: "",
    descricao_pedido: "",
    status: "recebido",
    data_prazo_resposta: "",
    observacoes_internas: "",
  });

  useEffect(() => {
    if (!idOrSlug) return;
    dataService.fetchProgramaByIdOrSlug(idOrSlug).then((p) => setPrograma(p ?? null)).catch(() => setPrograma(null));
  }, [idOrSlug]);

  useEffect(() => {
    if (programaId == null) return;
    let cancelled = false;
    setLoading(true);
    dataService
      .fetchPedidosTitulares(programaId)
      .then((rows) => {
        if (!cancelled) setPedidos(rows);
      })
      .catch((err) => {
        if (!cancelled) console.error("Erro ao carregar pedidos:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaId]);

  const filteredPedidos = pedidos.filter((p) => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterTipo && p.tipo !== filterTipo) return false;
    return true;
  });

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      tipo: "acesso",
      nome_titular: "",
      email_titular: "",
      documento_titular: "",
      descricao_pedido: "",
      status: "recebido",
      data_prazo_resposta: "",
      observacoes_internas: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (p: PedidoTitularRow) => {
    setEditingId(p.id);
    setForm({
      tipo: p.tipo,
      nome_titular: p.nome_titular ?? "",
      email_titular: p.email_titular ?? "",
      documento_titular: p.documento_titular ?? "",
      descricao_pedido: p.descricao_pedido ?? "",
      status: p.status,
      data_prazo_resposta: p.data_prazo_resposta ?? "",
      observacoes_internas: p.observacoes_internas ?? "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.nome_titular.trim() || !form.email_titular.trim() || programaId == null) return;
    setSaving(true);
    try {
      const basePayload = {
        tipo: form.tipo,
        nome_titular: form.nome_titular.trim(),
        email_titular: form.email_titular.trim(),
        documento_titular: form.documento_titular.trim() || null,
        descricao_pedido: form.descricao_pedido.trim() || null,
        status: form.status,
        data_prazo_resposta: form.data_prazo_resposta.trim() || null,
        observacoes_internas: form.observacoes_internas.trim() || null,
        origem: "manual" as const,
      };
      if (editingId != null) {
        const updated = await dataService.updatePedidoTitular(editingId, basePayload);
        setPedidos((prev) => prev.map((q) => (q.id === editingId ? updated : q)));
      } else {
        const created = await dataService.createPedidoTitular(programaId, { ...basePayload, data_resposta: null });
        setPedidos((prev) => [created, ...prev]);
      }
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar pedido:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window === "undefined" || !window.confirm("Excluir este pedido do registro?")) return;
    try {
      await dataService.deletePedidoTitular(id);
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
    }
  };

  const exportPdfSingle = useCallback(
    (p: PedidoTitularRow) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(14);
      doc.text("Pedidos dos Titulares (art. 18 LGPD)", PDF_MARGIN, 18);
      doc.setFontSize(9);
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, PDF_MARGIN, 24);
      addPedidoToPdf(doc, p, programa?.nome ?? "Programa", 30, true);
      const safe = (p.protocolo || String(p.id)).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 30);
      doc.save(`Pedido-Titular-${safe}-${dayjs().format("YYYY-MM-DD")}.pdf`);
    },
    [programa?.nome]
  );

  const exportPdfBatch = useCallback(
    (list: PedidoTitularRow[]) => {
      if (list.length === 0) return;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(14);
      doc.text("Pedidos dos Titulares (art. 18 LGPD)", PDF_MARGIN, 18);
      doc.setFontSize(9);
      doc.text(`Programa: ${programa?.nome ?? idOrSlug} | ${list.length} pedido(s) | ${new Date().toLocaleDateString("pt-BR")}`, PDF_MARGIN, 24);
      list.forEach((p, idx) => {
        if (idx > 0) {
          doc.addPage();
        }
        addPedidoToPdf(doc, p, programa?.nome ?? "Programa", PDF_MARGIN + 5, true);
      });
      doc.save(`Pedidos-Titulares-${idOrSlug}-${dayjs().format("YYYY-MM-DD")}.pdf`);
    },
    [programa?.nome, idOrSlug]
  );

  const exportPdfSelected = () => {
    const list = filteredPedidos.filter((p) => selectedIds.has(p.id));
    exportPdfBatch(list);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPedidos.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredPedidos.map((p) => p.id)));
  };

  const publicUrl =
    typeof window !== "undefined" && programa?.slug
      ? `${window.location.origin}/${programa.slug}`
      : programa?.slug
        ? `https://[seu-dominio]/${programa.slug}`
        : "";

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {});
  };

  const qrRef = React.useRef<HTMLDivElement>(null);
  const downloadQrPng = () => {
    if (!publicUrl || !qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `QR-Portal-${programa?.slug ?? "privacidade"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
        <Typography color="text.primary">Pedidos dos titulares</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">Pedidos dos titulares</Typography>
            <Typography variant="body2" color="text.secondary">
              Registro de pedidos de acesso, correção, exclusão, portabilidade e revogação de consentimento (art. 18 LGPD)
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip title="Gerar PDF dos pedidos selecionados">
            <span>
              <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportPdfSelected} disabled={selectedIds.size === 0}>
                Imprimir selecionados ({selectedIds.size})
              </Button>
            </span>
          </Tooltip>
          <Button variant="outlined" startIcon={<PdfIcon />} onClick={() => exportPdfBatch(filteredPedidos)} disabled={filteredPedidos.length === 0}>
            Imprimir todos
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
            Novo pedido
          </Button>
        </Stack>
      </Box>

      {programa?.slug && (
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Link do portal de privacidade (para titulares)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Distribua este link para titulares solicitarem acesso, correção, exclusão, portabilidade ou revogação de consentimento.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <TextField
                size="small"
                fullWidth
                sx={{ maxWidth: 420 }}
                value={publicUrl}
                InputProps={{ readOnly: true }}
              />
              <Button startIcon={<CopyIcon />} variant="outlined" onClick={copyLink} disabled={!publicUrl}>
                Copiar link
              </Button>
              <Box ref={qrRef} sx={{ p: 1, bgcolor: "white", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                <QRCodeSVG value={publicUrl || " "} size={80} level="M" />
              </Box>
              <Button size="small" variant="outlined" startIcon={<QrCodeIcon />} onClick={downloadQrPng} disabled={!publicUrl}>
                Baixar QR (PNG)
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {dataService.PEDIDO_TITULAR_STATUS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={filterTipo} label="Tipo" onChange={(e) => setFilterTipo(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {dataService.PEDIDO_TITULAR_TIPOS.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < filteredPedidos.length}
                  checked={filteredPedidos.length > 0 && selectedIds.size === filteredPedidos.length}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableCell>
              <TableCell><strong>Protocolo</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Prazo</strong></TableCell>
              <TableCell><strong>Registro</strong></TableCell>
              <TableCell align="right"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Carregando…</Typography>
                </TableCell>
              </TableRow>
            ) : filteredPedidos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhum pedido encontrado.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPedidos.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      aria-label={`Selecionar ${p.protocolo}`}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace" }}>{p.protocolo ?? "—"}</TableCell>
                  <TableCell>{dataService.PEDIDO_TITULAR_TIPOS.find((t) => t.value === p.tipo)?.label ?? p.tipo}</TableCell>
                  <TableCell>{p.nome_titular}</TableCell>
                  <TableCell>{p.email_titular}</TableCell>
                  <TableCell>{dataService.PEDIDO_TITULAR_STATUS.find((s) => s.value === p.status)?.label ?? p.status}</TableCell>
                  <TableCell>{p.data_prazo_resposta ? dayjs(p.data_prazo_resposta).format("DD/MM/YYYY") : "—"}</TableCell>
                  <TableCell>{p.created_at ? dayjs(p.created_at).format("DD/MM/YYYY") : "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Imprimir (PDF)">
                      <IconButton size="small" onClick={() => exportPdfSingle(p)} aria-label="Imprimir">
                        <GetAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleOpenEdit(p)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(p.id)} aria-label="Excluir" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId != null ? "Editar pedido" : "Novo pedido do titular"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={form.tipo}
                  label="Tipo"
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                >
                  {dataService.PEDIDO_TITULAR_TIPOS.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={form.status}
                  label="Status"
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {dataService.PEDIDO_TITULAR_STATUS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Nome do titular"
                value={form.nome_titular}
                onChange={(e) => setForm((f) => ({ ...f, nome_titular: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="email"
                label="E-mail do titular"
                value={form.email_titular}
                onChange={(e) => setForm((f) => ({ ...f, email_titular: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Documento (CPF etc.)"
                value={form.documento_titular}
                onChange={(e) => setForm((f) => ({ ...f, documento_titular: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descrição do pedido"
                value={form.descricao_pedido}
                onChange={(e) => setForm((f) => ({ ...f, descricao_pedido: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Prazo para resposta"
                value={form.data_prazo_resposta}
                onChange={(e) => setForm((f) => ({ ...f, data_prazo_resposta: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observações internas (não expostas ao titular)"
                value={form.observacoes_internas}
                onChange={(e) => setForm((f) => ({ ...f, observacoes_internas: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.nome_titular.trim() || !form.email_titular.trim() || saving}>
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
