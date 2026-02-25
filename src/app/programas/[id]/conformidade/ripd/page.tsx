"use client";

import React, { useEffect, useState } from "react";
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
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  aprovado: "Aprovado",
};

const STATUS_COLOR: Record<string, "default" | "warning" | "success"> = {
  rascunho: "default",
  em_analise: "warning",
  aprovado: "success",
};

export interface RipdFormState {
  id: string;
  titulo: string;
  ropaId: string;
  descricaoDados: string;
  metodologiaColetaSeguranca: string;
  medidasSalvaguardasMitigacao: string;
  conclusao: string;
  status: string;
}

function emptyForm(): RipdFormState {
  return {
    id: "",
    titulo: "",
    ropaId: "",
    descricaoDados: "",
    metodologiaColetaSeguranca: "",
    medidasSalvaguardasMitigacao: "",
    conclusao: "",
    status: "rascunho",
  };
}

function rowToForm(r: dataService.RipdRow): RipdFormState {
  return {
    id: String(r.id),
    titulo: r.titulo ?? "",
    ropaId: r.ropa_id != null ? String(r.ropa_id) : "",
    descricaoDados: r.descricao_dados ?? "",
    metodologiaColetaSeguranca: r.metodologia_coleta_seguranca ?? "",
    medidasSalvaguardasMitigacao: r.medidas_salvaguardas_mitigacao ?? "",
    conclusao: r.conclusao ?? "",
    status: r.status ?? "rascunho",
  };
}

export default function RIPDPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId: programaIdNum, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [list, setList] = useState<dataService.RipdRow[]>([]);
  const [ropaList, setRopaList] = useState<dataService.RopaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RipdFormState>(emptyForm());

  const loadList = () => {
    if (programaIdNum == null) return;
    setLoading(true);
    dataService
      .fetchRipdByPrograma(programaIdNum)
      .then(setList)
      .catch((err) => console.error("Erro ao carregar RIPD:", err))
      .finally(() => setLoading(false));
  };

  const loadRopa = () => {
    if (programaIdNum == null) return;
    dataService
      .fetchRopaByPrograma(programaIdNum)
      .then(setRopaList)
      .catch((err) => console.error("Erro ao carregar ROPA:", err));
  };

  useEffect(() => {
    if (programaIdNum == null) return;
    loadList();
    loadRopa();
  }, [programaIdNum]);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const handleOpenEdit = (row: dataService.RipdRow) => {
    setEditingId(String(row.id));
    setForm(rowToForm(row));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        ropa_id: form.ropaId ? Number(form.ropaId) : null,
        descricao_dados: form.descricaoDados || null,
        metodologia_coleta_seguranca: form.metodologiaColetaSeguranca || null,
        medidas_salvaguardas_mitigacao: form.medidasSalvaguardasMitigacao || null,
        conclusao: form.conclusao || null,
        status: form.status,
      };
      if (editingId) {
        await dataService.updateRipd(Number(editingId), payload);
      } else {
        await dataService.createRipd(programaIdNum!, payload);
      }
      loadList();
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar RIPD:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window === "undefined" || !window.confirm("Excluir este relatório de impacto?")) return;
    try {
      await dataService.deleteRipd(id);
      loadList();
    } catch (err) {
      console.error("Erro ao excluir RIPD:", err);
    }
  };

  const getRopaNome = (ropaId: number | null) => {
    if (ropaId == null) return "—";
    const r = ropaList.find((x) => x.id === ropaId);
    return r ? r.nome : `#${ropaId}`;
  };

  if (idLoading || programaIdNum == null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
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
        <Typography color="text.primary">RIPD / AIPD</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <DescriptionIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">RIPD / AIPD</Typography>
            <Typography variant="body2" color="text.secondary">
              Relatório de Impacto à Proteção de Dados Pessoais (Art. 38 LGPD)
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Novo relatório
        </Button>
      </Box>

      <Paper elevation={1} sx={{ overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell><strong>Título</strong></TableCell>
                <TableCell><strong>Operação (ROPA)</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Carregando…</Typography>
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Nenhum relatório de impacto. Clique em &quot;Novo relatório&quot; para criar um RIPD para tratamento de alto risco.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                list.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.titulo}</TableCell>
                    <TableCell>{getRopaNome(row.ropa_id)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABELS[row.status] ?? row.status}
                        color={STATUS_COLOR[row.status] ?? "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenEdit(row)} aria-label="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(row.id)} aria-label="Excluir" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Editar RIPD" : "Novo relatório de impacto (RIPD)"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              label="Título do relatório"
              value={form.titulo}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Operação de tratamento (ROPA)</InputLabel>
              <Select
                value={form.ropaId}
                label="Operação de tratamento (ROPA)"
                onChange={(e) => setForm((f) => ({ ...f, ropaId: e.target.value }))}
              >
                <MenuItem value="">Nenhuma (relatório geral)</MenuItem>
                {ropaList.map((r) => (
                  <MenuItem key={r.id} value={String(r.id)}>{r.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descrição dos tipos de dados coletados"
              value={form.descricaoDados}
              onChange={(e) => setForm((f) => ({ ...f, descricaoDados: e.target.value }))}
              placeholder="Art. 38 - descrição dos dados tratados"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Metodologia de coleta e segurança das informações"
              value={form.metodologiaColetaSeguranca}
              onChange={(e) => setForm((f) => ({ ...f, metodologiaColetaSeguranca: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Medidas, salvaguardas e mecanismos de mitigação de risco"
              value={form.medidasSalvaguardasMitigacao}
              onChange={(e) => setForm((f) => ({ ...f, medidasSalvaguardasMitigacao: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Conclusão do controlador"
              value={form.conclusao}
              onChange={(e) => setForm((f) => ({ ...f, conclusao: e.target.value }))}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.status}
                label="Status"
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="rascunho">Rascunho</MenuItem>
                <MenuItem value="em_analise">Em análise</MenuItem>
                <MenuItem value="aprovado">Aprovado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.titulo.trim() || saving}>
            {saving ? "Salvando…" : editingId ? "Salvar" : "Criar"}
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
