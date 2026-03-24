"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  Alert,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { ProgramaLastActivityLine } from "@/components/common/ProgramaLastActivityLine";
import { buildRipdPdfDocument } from "@/lib/utils/ripdPdf";
import {
  RIPD_BASE_LEGAL,
  RIPD_CATEGORIAS_DADOS,
  RIPD_DECISAO_CONTROLADOR,
  RIPD_NIVEL_RISCO,
  RIPD_PARECER_DPO_STATUS,
  RIPD_STATUS_LABELS,
  RIPD_TIPOS_RISCO,
} from "@/lib/utils/ripdOptions";

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
  riscosTratamento: string;
  nivelRisco: string;
  tiposRisco: string[];
  categoriasDadosChaves: string[];
  baseLegalPredominante: string;
  parecerDpo: string;
  parecerDpoStatus: string;
  decisaoControlador: string;
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
    riscosTratamento: "",
    nivelRisco: "",
    tiposRisco: [],
    categoriasDadosChaves: [],
    baseLegalPredominante: "",
    parecerDpo: "",
    parecerDpoStatus: "",
    decisaoControlador: "",
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
    riscosTratamento: r.riscos_tratamento ?? "",
    nivelRisco: r.nivel_risco ?? "",
    tiposRisco: Array.isArray(r.tipos_risco) ? [...r.tipos_risco] : [],
    categoriasDadosChaves: Array.isArray(r.categorias_dados_chaves) ? [...r.categorias_dados_chaves] : [],
    baseLegalPredominante: r.base_legal_predominante ?? "",
    parecerDpo: r.parecer_dpo ?? "",
    parecerDpoStatus: r.parecer_dpo_status ?? "",
    decisaoControlador: r.decisao_controlador ?? "",
  };
}

function formToPayload(f: RipdFormState): Omit<dataService.RipdRow, "id" | "programa_id" | "created_at" | "updated_at"> {
  return {
    titulo: f.titulo.trim(),
    ropa_id: f.ropaId ? Number(f.ropaId) : null,
    descricao_dados: f.descricaoDados.trim() || null,
    metodologia_coleta_seguranca: f.metodologiaColetaSeguranca.trim() || null,
    medidas_salvaguardas_mitigacao: f.medidasSalvaguardasMitigacao.trim() || null,
    conclusao: f.conclusao.trim() || null,
    status: f.status,
    riscos_tratamento: f.riscosTratamento.trim() || null,
    nivel_risco: f.nivelRisco.trim() || null,
    tipos_risco: f.tiposRisco,
    categorias_dados_chaves: f.categoriasDadosChaves,
    base_legal_predominante: f.baseLegalPredominante.trim() || null,
    parecer_dpo: f.parecerDpo.trim() || null,
    parecer_dpo_status: f.parecerDpoStatus.trim() || null,
    decisao_controlador: f.decisaoControlador.trim() || null,
  };
}

function toggleInList(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

function safePdfName(titulo: string): string {
  const s = titulo.replace(/[^\wÀ-ÿ\s-]+/g, "").replace(/\s+/g, "-").slice(0, 60);
  return s || "RIPD";
}

export default function RIPDPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId: programaIdNum, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [list, setList] = useState<dataService.RipdRow[]>([]);
  const [ropaList, setRopaList] = useState<dataService.RopaRow[]>([]);
  const [programa, setPrograma] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<number | null>(null);
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

  useEffect(() => {
    if (programaIdNum == null) return;
    let cancelled = false;
    dataService.fetchProgramaById(programaIdNum)
      .then((p) => {
        if (!cancelled) setPrograma(p && typeof p === "object" ? (p as Record<string, unknown>) : null);
      })
      .catch(() => {
        if (!cancelled) setPrograma(null);
      });
    return () => {
      cancelled = true;
    };
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
    if (programaIdNum == null) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await dataService.updateRipd(Number(editingId), payload);
      } else {
        await dataService.createRipd(programaIdNum, payload);
      }
      loadList();
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar RIPD:", err);
      alert(
        "Não foi possível salvar. Se a mensagem citar coluna inexistente, aplique a migration mais recente do RIPD no Supabase."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window === "undefined" || !window.confirm("Excluir este relatório de impacto?")) return;
    try {
      await dataService.deleteRipd(id, programaIdNum ?? undefined);
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

  const exportPdfRow = useCallback(
    async (row: dataService.RipdRow) => {
      const ropaNome = row.ropa_id != null ? (ropaList.find((x) => x.id === row.ropa_id)?.nome ?? null) : null;
      setPdfLoadingId(row.id);
      try {
        const doc = await buildRipdPdfDocument({
          programa: programa ?? undefined,
          idOrSlug,
          row,
          ropaNome,
        });
        const name = safePdfName(row.titulo);
        doc.save(`RIPD-${name}-${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (e) {
        console.error("Erro ao gerar PDF do RIPD:", e);
        alert("Não foi possível gerar o PDF.");
      } finally {
        setPdfLoadingId(null);
      }
    },
    [idOrSlug, programa, ropaList]
  );

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
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push("/dashboard")} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Programas
        </Link>
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push(`/programas/${idOrSlug}`)} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Programa
        </Link>
        <Link component="button" underline="hover" color="inherit" onClick={() => router.push(`/programas/${idOrSlug}/conformidade`)} sx={{ border: 0, background: "none", padding: 0, font: "inherit", cursor: "pointer" }}>
          Tratamento de dados e riscos
        </Link>
        <Typography color="text.primary">RIPD / AIPD</Typography>
      </Breadcrumbs>

      <ProgramaLastActivityLine programaId={programaIdNum} programaPathSegment={idOrSlug} sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <DescriptionIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Relatório de Impacto à Proteção de Dados Pessoais (Art. 38 LGPD)
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Novo relatório
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        O relatório deve conter, no mínimo, os elementos dos incisos I a IV do art. 38 (descrição dos dados, metodologia e segurança,
        medidas e mitigação, e riscos do tratamento). Use os campos abaixo para documentar; o PDF agrupa por seção.
      </Alert>

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
                        label={RIPD_STATUS_LABELS[row.status] ?? row.status}
                        color={STATUS_COLOR[row.status] ?? "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Exportar PDF">
                        <IconButton
                          size="small"
                          onClick={() => void exportPdfRow(row)}
                          disabled={pdfLoadingId === row.id}
                          aria-label="Exportar PDF"
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? "Editar RIPD" : "Novo relatório de impacto (RIPD)"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
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

            <Divider />
            <Typography variant="subtitle2" color="primary">I — Tipos de dados (art. 38, I)</Typography>
            <Typography variant="caption" color="text.secondary">Marque as categorias aplicáveis e complemente na descrição.</Typography>
            <FormGroup row sx={{ flexWrap: "wrap", gap: 0.5 }}>
              {RIPD_CATEGORIAS_DADOS.map((o) => (
                <FormControlLabel
                  key={o.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.categoriasDadosChaves.includes(o.key)}
                      onChange={() => setForm((f) => ({ ...f, categoriasDadosChaves: toggleInList(f.categoriasDadosChaves, o.key) }))}
                    />
                  }
                  label={o.label}
                  sx={{ mr: 1, maxWidth: "100%" }}
                />
              ))}
            </FormGroup>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Descrição dos tipos de dados tratados"
              value={form.descricaoDados}
              onChange={(e) => setForm((f) => ({ ...f, descricaoDados: e.target.value }))}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Base legal predominante (apoio)</InputLabel>
              <Select
                value={form.baseLegalPredominante}
                label="Base legal predominante (apoio)"
                onChange={(e) => setForm((f) => ({ ...f, baseLegalPredominante: e.target.value }))}
              >
                <MenuItem value=""><em>Não especificado</em></MenuItem>
                {RIPD_BASE_LEGAL.map((o) => (
                  <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />
            <Typography variant="subtitle2" color="primary">II — Metodologia e segurança (art. 38, II)</Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Metodologia de coleta e segurança das informações"
              value={form.metodologiaColetaSeguranca}
              onChange={(e) => setForm((f) => ({ ...f, metodologiaColetaSeguranca: e.target.value }))}
            />

            <Divider />
            <Typography variant="subtitle2" color="primary">III — Medidas e mitigação (art. 38, III)</Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Medidas, salvaguardas e mecanismos de mitigação de risco"
              value={form.medidasSalvaguardasMitigacao}
              onChange={(e) => setForm((f) => ({ ...f, medidasSalvaguardasMitigacao: e.target.value }))}
            />

            <Divider />
            <Typography variant="subtitle2" color="primary">IV — Riscos do tratamento (art. 38, IV)</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Nível de risco (apoio)</InputLabel>
              <Select
                value={form.nivelRisco}
                label="Nível de risco (apoio)"
                onChange={(e) => setForm((f) => ({ ...f, nivelRisco: e.target.value }))}
              >
                <MenuItem value=""><em>Não especificado</em></MenuItem>
                {RIPD_NIVEL_RISCO.map((o) => (
                  <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">Tipos de risco identificados</Typography>
            <FormGroup sx={{ pl: 0.5 }}>
              {RIPD_TIPOS_RISCO.map((o) => (
                <FormControlLabel
                  key={o.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.tiposRisco.includes(o.key)}
                      onChange={() => setForm((f) => ({ ...f, tiposRisco: toggleInList(f.tiposRisco, o.key) }))}
                    />
                  }
                  label={o.label}
                />
              ))}
            </FormGroup>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Descrição dos riscos decorrentes do tratamento"
              value={form.riscosTratamento}
              onChange={(e) => setForm((f) => ({ ...f, riscosTratamento: e.target.value }))}
              placeholder="Probabilidade, impacto aos titulares, cenários relevantes…"
            />

            <Divider />
            <Typography variant="subtitle2" color="primary">Parecer do encarregado (DPO)</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Posição do DPO</InputLabel>
              <Select
                value={form.parecerDpoStatus}
                label="Posição do DPO"
                onChange={(e) => setForm((f) => ({ ...f, parecerDpoStatus: e.target.value }))}
              >
                <MenuItem value=""><em>Sem parecer registrado</em></MenuItem>
                {RIPD_PARECER_DPO_STATUS.map((o) => (
                  <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Texto do parecer"
              value={form.parecerDpo}
              onChange={(e) => setForm((f) => ({ ...f, parecerDpo: e.target.value }))}
            />

            <Divider />
            <Typography variant="subtitle2" color="primary">Decisão e conclusão</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Decisão do controlador</InputLabel>
              <Select
                value={form.decisaoControlador}
                label="Decisão do controlador"
                onChange={(e) => setForm((f) => ({ ...f, decisaoControlador: e.target.value }))}
              >
                <MenuItem value=""><em>Não especificada</em></MenuItem>
                {RIPD_DECISAO_CONTROLADOR.map((o) => (
                  <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Conclusão do controlador / próximos passos"
              value={form.conclusao}
              onChange={(e) => setForm((f) => ({ ...f, conclusao: e.target.value }))}
            />

            <FormControl fullWidth>
              <InputLabel>Status do documento</InputLabel>
              <Select
                value={form.status}
                label="Status do documento"
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
          Voltar ao tratamento e riscos
        </Button>
      </Box>
    </Container>
  );
}
