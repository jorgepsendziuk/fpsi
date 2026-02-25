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
  FormGroup,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Storage as StorageIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import * as dataService from "@/lib/services/dataService";

// —— Operação (Processo, Finalidade, Hipótese Legal) ——
export interface OperacaoTratamento {
  id: string;
  nome: string;
  finalidade: string;
  baseLegal: string;
  createdAt: string;
}

const HIPOTESES_LEGAIS = [
  "Consentimento",
  "Execução de contrato",
  "Cumprimento de obrigação legal ou regulatória (Art. 7º, II)",
  "Proteção da vida",
  "Tutela da saúde",
  "Legítimo interesse",
  "Proteção do crédito",
  "Outra",
];

const CATEGORIAS_TITULARES_OPCOES = [
  { key: "titulares_em_geral", label: "Titulares em geral" },
  { key: "criancas_adolescentes", label: "Crianças e adolescentes" },
  { key: "idosos", label: "Idosos" },
] as const;

const TIPOS_DADOS_PESSOAIS_OPCOES = [
  { key: "nome", label: "Nome" },
  { key: "endereco", label: "Endereço" },
  { key: "rg", label: "RG" },
  { key: "email", label: "E-mail" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
] as const;

// Textos de apoio do modelo ANPD (instruções de preenchimento)
const HELPER_ORGANIZACAO = "Nome da empresa";
const HELPER_ATIVIDADE = "Da empresa";
const HELPER_DATA_REGISTRO = "De preenchimento";
const HELPER_MEDIDAS_SEGURANCA =
  "Listar medidas de segurança utilizadas para proteção dos dados pessoais. Ex: controle de acesso, antivírus atualizado, backups, pseudonimização, firewall, etc. (Vide checklist de medidas do Guia Orientativo sobre Segurança da Informação para ATPP).";
const HELPER_OUTROS_DADOS =
  "Deve-se marcar ou especificar apenas os tipos de dados, e não os valores numéricos (números de CPF, RG, etc) ou sua descrição (a descrição do nome ou do endereço, etc).";
const HELPER_COMPARTILHAMENTO =
  "Descrever o fluxo de compartilhamento para fora da organização e o nome dos terceiros, com quem os dados foram compartilhados. Ex: compartilhamento com empresa Y para fins de marketing.";
const HELPER_PERIODO_ARMAZENAMENTO =
  "Tempo de guarda dos dados na base do agente de tratamento. Ex: Dados de candidatos serão mantidos por 1 ano.";
const HELPER_PROCESSO_FINALIDADE_HIPOTESE =
  "Informar o nome do processo interno ao qual o presente registro se refere (tratamento de dados realizado), a finalidade (motivo do tratamento), e a hipótese legal que justifica o tratamento realizado, conforme os artigos 7º e 11 da LGPD.";
const HELPER_OBSERVACOES =
  "Inserir informações opcionais, se houver, como dados de encarregados e de operadores, e sobre transferências internacionais de dados pessoais, se for o caso, etc.";
const PLACEHOLDER_PROCESSO = "Ex.: Coleta de dados pessoais de candidatos";
const PLACEHOLDER_FINALIDADE = "Ex.: Avaliar e selecionar candidatos";
const PLACEHOLDER_HIPOTESE = "Ex.: Consentimento";

const emptyOperacao = (): OperacaoTratamento => ({
  id: "",
  nome: "",
  finalidade: "",
  baseLegal: "",
  createdAt: new Date().toISOString().slice(0, 10),
});

function rowToOperacao(r: dataService.RopaRow): OperacaoTratamento {
  return {
    id: String(r.id),
    nome: r.nome ?? "",
    finalidade: r.finalidade ?? "",
    baseLegal: r.base_legal ?? "",
    createdAt: r.created_at ? r.created_at.slice(0, 10) : "",
  };
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const PDF_MARGIN = 14;
const PDF_PAGE_HEIGHT = 297;
const PDF_LINE_HEIGHT = 5;
const PDF_MAX_WIDTH = 180;

function addRegistroToPdf(doc: jsPDF, reg: dataService.RegistroRopaRow | null, startY: number): number {
  let y = startY;
  const push = (label: string, value: string) => {
    if (y > PDF_PAGE_HEIGHT - 25) {
      doc.addPage();
      y = PDF_MARGIN + 5;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, PDF_MARGIN, y);
    y += PDF_LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    const text = value || "—";
    const lines = doc.splitTextToSize(text, PDF_MAX_WIDTH);
    lines.forEach((line: string) => {
      if (y > PDF_PAGE_HEIGHT - 20) {
        doc.addPage();
        y = PDF_MARGIN + 5;
      }
      doc.text(line, PDF_MARGIN, y);
      y += PDF_LINE_HEIGHT;
    });
    y += 3;
  };
  if (!reg) return y;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do registro (Modelo ANPD)", PDF_MARGIN, y);
  y += 8;
  push("Organização", reg.organizacao ?? "");
  push("CNPJ", reg.cnpj ?? "");
  push("Endereço", reg.endereco ?? "");
  push("Principal atividade", reg.atividade_principal ?? "");
  push("Gestor responsável", reg.gestor_responsavel ?? "");
  push("E-mail", reg.email ?? "");
  push("Telefone", reg.telefone ?? "");
  push("Data do registro", reg.data_registro ?? "");
  push("Categorias de titulares", (reg.categorias_titulares ?? []).join(", "));
  push("Medidas de segurança", reg.medidas_seguranca ?? "");
  push("Dados pessoais (tipos)", (reg.tipos_dados_pessoais ?? []).join(", "));
  if (reg.outros_dados_pessoais) push("Outros dados pessoais", reg.outros_dados_pessoais);
  push("Compartilhamento", reg.compartilhamento ?? "");
  push("Período de armazenamento", reg.periodo_armazenamento ?? "");
  if (reg.observacoes) push("Observações", reg.observacoes);
  return y;
}

function addOperacaoToPdf(
  doc: jsPDF,
  op: OperacaoTratamento,
  startY: number,
  isFirstPage: boolean
): number {
  let y = startY;
  const push = (label: string, value: string) => {
    if (y > PDF_PAGE_HEIGHT - 25) {
      doc.addPage();
      y = PDF_MARGIN + 5;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, PDF_MARGIN, y);
    y += PDF_LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    const text = value || "—";
    const lines = doc.splitTextToSize(text, PDF_MAX_WIDTH);
    lines.forEach((line: string) => {
      if (y > PDF_PAGE_HEIGHT - 20) {
        doc.addPage();
        y = PDF_MARGIN + 5;
      }
      doc.text(line, PDF_MARGIN, y);
      y += PDF_LINE_HEIGHT;
    });
    y += 3;
  };
  if (isFirstPage) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Processo: ${op.nome || "Sem nome"}`, PDF_MARGIN, y);
    y += 8;
  }
  push("Finalidade", op.finalidade);
  push("Hipótese legal", op.baseLegal);
  push("Data de registro", op.createdAt);
  return y;
}

type RegistroFormState = Partial<dataService.RegistroRopaRow> & {
  categorias_titulares: string[];
  tipos_dados_pessoais: string[];
};

const emptyRegistroForm = (): RegistroFormState => ({
  organizacao: "",
  cnpj: "",
  endereco: "",
  atividade_principal: "",
  gestor_responsavel: "",
  email: "",
  telefone: "",
  data_registro: "",
  categorias_titulares: [],
  medidas_seguranca: "",
  tipos_dados_pessoais: [],
  outros_dados_pessoais: "",
  compartilhamento: "",
  periodo_armazenamento: "",
  observacoes: "",
});

/** Preenche formulário a partir do registro; se registro for null ou campo vazio, usa defaults da empresa (ROPA). */
function registroRowToForm(
  r: dataService.RegistroRopaRow | null,
  empresaDefaults?: Partial<dataService.RegistroRopaRow> | null
): RegistroFormState {
  const empty = emptyRegistroForm();
  const def = empresaDefaults || {};
  if (!r) {
    const hoje = new Date().toISOString().slice(0, 10);
    return {
      ...empty,
      organizacao: def.organizacao ?? "",
      cnpj: def.cnpj ?? "",
      endereco: def.endereco ?? "",
      atividade_principal: def.atividade_principal ?? "",
      gestor_responsavel: def.gestor_responsavel ?? "",
      email: def.email ?? "",
      telefone: def.telefone ?? "",
      data_registro: hoje,
    };
  }
  return {
    organizacao: r.organizacao ?? def.organizacao ?? "",
    cnpj: r.cnpj ?? def.cnpj ?? "",
    endereco: r.endereco ?? def.endereco ?? "",
    atividade_principal: r.atividade_principal ?? def.atividade_principal ?? "",
    gestor_responsavel: r.gestor_responsavel ?? def.gestor_responsavel ?? "",
    email: r.email ?? def.email ?? "",
    telefone: r.telefone ?? def.telefone ?? "",
    data_registro: r.data_registro ?? "",
    categorias_titulares: r.categorias_titulares ?? [],
    medidas_seguranca: r.medidas_seguranca ?? "",
    tipos_dados_pessoais: r.tipos_dados_pessoais ?? [],
    outros_dados_pessoais: r.outros_dados_pessoais ?? "",
    compartilhamento: r.compartilhamento ?? "",
    periodo_armazenamento: r.periodo_armazenamento ?? "",
    observacoes: r.observacoes ?? "",
  };
}

export default function ROPAPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId: programaIdNum, loading: idLoading } = useProgramaIdFromParam(idOrSlug);

  const [registro, setRegistro] = useState<dataService.RegistroRopaRow | null>(null);
  const [registroForm, setRegistroForm] = useState<RegistroFormState>(emptyRegistroForm());
  const [empresaRopaDefaults, setEmpresaRopaDefaults] = useState<Partial<dataService.RegistroRopaRow> | null>(null);

  const [operacoes, setOperacoes] = useState<OperacaoTratamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OperacaoTratamento>(emptyOperacao());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Carregar registro, operações e dados da empresa (para preencher informações de contato do ROPA)
  useEffect(() => {
    if (programaIdNum == null) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dataService.fetchRegistroRopaByPrograma(programaIdNum),
      dataService.fetchRopaByPrograma(programaIdNum),
      dataService.getEmpresaForRegistroRopa(programaIdNum),
    ])
      .then(([reg, rows, empresaDefaults]) => {
        if (!cancelled) {
          setRegistro(reg);
          setEmpresaRopaDefaults(empresaDefaults || null);
          setRegistroForm(registroRowToForm(reg, empresaDefaults || undefined));
          setOperacoes(rows.map(rowToOperacao));
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("Erro ao carregar ROPA:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [programaIdNum]);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyOperacao());
    setRegistroForm(registroRowToForm(registro, empresaRopaDefaults || undefined));
    setOpen(true);
  };

  const handleOpenEdit = (op: OperacaoTratamento) => {
    setEditingId(op.id);
    setForm({ ...op });
    setRegistroForm(registroRowToForm(registro, empresaRopaDefaults || undefined));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyOperacao());
  };

  const handleSave = async () => {
    if (!form.nome.trim() || programaIdNum == null) return;
    setSaving(true);
    try {
      const savedRegistro = await dataService.upsertRegistroRopa(programaIdNum, {
        organizacao: registroForm.organizacao || null,
        cnpj: registroForm.cnpj || null,
        endereco: registroForm.endereco || null,
        atividade_principal: registroForm.atividade_principal || null,
        gestor_responsavel: registroForm.gestor_responsavel || null,
        email: registroForm.email || null,
        telefone: registroForm.telefone || null,
        data_registro: registroForm.data_registro || null,
        categorias_titulares: registroForm.categorias_titulares,
        medidas_seguranca: registroForm.medidas_seguranca || null,
        tipos_dados_pessoais: registroForm.tipos_dados_pessoais,
        outros_dados_pessoais: registroForm.outros_dados_pessoais || null,
        compartilhamento: registroForm.compartilhamento || null,
        periodo_armazenamento: registroForm.periodo_armazenamento || null,
        observacoes: registroForm.observacoes || null,
      });
      setRegistro(savedRegistro);

      const payload = {
        nome: form.nome.trim(),
        finalidade: form.finalidade || null,
        base_legal: form.baseLegal || null,
        categorias_dados: null,
        categorias_titulares: null,
        compartilhamento: null,
        retencao: null,
        medidas_seguranca: null,
        responsavel: null,
      };
      if (editingId) {
        const updated = await dataService.updateRopa(Number(editingId), payload);
        setOperacoes((prev) =>
          prev.map((o) => (o.id === editingId ? rowToOperacao(updated) : o))
        );
      } else {
        const created = await dataService.createRopa(programaIdNum, payload, savedRegistro.id);
        setOperacoes((prev) => [...prev, rowToOperacao(created)]);
      }
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar ROPA:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (typeof window === "undefined" || !window.confirm("Excluir esta operação do registro?")) return;
    try {
      await dataService.deleteRopa(Number(id));
      setOperacoes((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erro ao excluir ROPA:", err);
    }
  };

  const exportExcel = useCallback(() => {
    const headers = ["Processo", "Finalidade", "Hipótese legal", "Data registro"];
    const rows = operacoes.map((o) => [o.nome, o.finalidade, o.baseLegal, o.createdAt]);
    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ROPA-Programa-${idOrSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [operacoes, idOrSlug]);

  const exportPdfBatch = useCallback(
    (list: OperacaoTratamento[]) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFontSize(14);
      doc.text("Registro das Operações de Tratamento (ROPA) - Modelo ANPD", PDF_MARGIN, 18);
      doc.setFontSize(9);
      doc.text(`Programa: ${idOrSlug} | Data: ${new Date().toLocaleDateString("pt-BR")}`, PDF_MARGIN, 24);
      let y = 32;
      y = addRegistroToPdf(doc, registro, y);
      y += 10;
      if (list.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Processo, Finalidade e Hipótese Legal", PDF_MARGIN, y);
        y += 10;
        list.forEach((op, idx) => {
          if (idx > 0) {
            doc.addPage();
            y = PDF_MARGIN + 5;
          }
          y = addOperacaoToPdf(doc, op, y, true);
        });
      }
      doc.save(`ROPA-Programa-${idOrSlug}-${new Date().toISOString().slice(0, 10)}.pdf`);
    },
    [idOrSlug, registro]
  );

  const exportPdfSelected = useCallback(() => {
    const list = operacoes.filter((o) => selectedIds.has(o.id));
    exportPdfBatch(list.length > 0 ? list : operacoes);
  }, [operacoes, selectedIds, exportPdfBatch]);

  const exportPdfAll = useCallback(() => exportPdfBatch(operacoes), [operacoes, exportPdfBatch]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === operacoes.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(operacoes.map((o) => o.id)));
  }, [operacoes, selectedIds.size]);

  const toggleCategoriaTitular = (key: string) => {
    setRegistroForm((f) => ({
      ...f,
      categorias_titulares: f.categorias_titulares.includes(key)
        ? f.categorias_titulares.filter((x) => x !== key)
        : [...f.categorias_titulares, key],
    }));
  };

  const toggleTipoDado = (key: string) => {
    setRegistroForm((f) => ({
      ...f,
      tipos_dados_pessoais: f.tipos_dados_pessoais.includes(key)
        ? f.tipos_dados_pessoais.filter((x) => x !== key)
        : [...f.tipos_dados_pessoais, key],
    }));
  };

  if (idLoading || (programaIdNum == null && !loading)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (programaIdNum == null) {
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
        <Typography color="text.primary">ROPA</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <StorageIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">ROPA</Typography>
            <Typography variant="body2" color="text.secondary">
              Registro das Operações de Tratamento (art. 37 LGPD) — Modelo ANPD ATPP
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<ExcelIcon />} onClick={exportExcel} disabled={operacoes.length === 0}>
          Exportar Excel (CSV)
        </Button>
        <Tooltip title="Gerar PDF com registro e todas as operações">
          <span>
            <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportPdfAll} disabled={operacoes.length === 0 && !registro}>
              Exportar PDF completo
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Gerar PDF com registro e operações marcadas">
          <span>
            <Button variant="outlined" startIcon={<PdfIcon />} onClick={exportPdfSelected} disabled={selectedIds.size === 0}>
              Exportar selecionadas em PDF ({selectedIds.size})
            </Button>
          </span>
        </Tooltip>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          Adicionar processo
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedIds.size > 0 && selectedIds.size < operacoes.length}
                  checked={operacoes.length > 0 && selectedIds.size === operacoes.length}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todas"
                />
              </TableCell>
              <TableCell><strong>Processo</strong></TableCell>
              <TableCell><strong>Finalidade</strong></TableCell>
              <TableCell><strong>Hipótese legal</strong></TableCell>
              <TableCell align="right"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Carregando…</Typography>
                </TableCell>
              </TableRow>
            ) : operacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhum processo cadastrado. Clique em &quot;Adicionar processo&quot; para informar processo, finalidade e hipótese legal (art. 7º e 11 LGPD).</Typography>
                </TableCell>
              </TableRow>
            ) : (
              operacoes.map((op) => (
                <TableRow key={op.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedIds.has(op.id)} onChange={() => toggleSelect(op.id)} aria-label={`Selecionar ${op.nome}`} />
                  </TableCell>
                  <TableCell>{op.nome}</TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>{op.finalidade}</TableCell>
                  <TableCell>{op.baseLegal}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Exportar PDF">
                      <IconButton size="small" onClick={() => exportPdfBatch([op])} aria-label="Exportar PDF">
                        <GetAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => handleOpenEdit(op)} aria-label="Editar">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(op.id)} aria-label="Excluir" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth scroll="paper">
        <DialogTitle>{editingId ? "Editar processo" : "Adicionar processo — Registro das Operações de Tratamento (Modelo ANPD)"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* 1. INFORMAÇÕES DE CONTATO */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">1. Informações de contato</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Organização" value={registroForm.organizacao ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, organizacao: e.target.value }))} placeholder={HELPER_ORGANIZACAO} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="CNPJ" value={registroForm.cnpj ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, cnpj: e.target.value }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" value={registroForm.endereco ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, endereco: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Principal atividade" value={registroForm.atividade_principal ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, atividade_principal: e.target.value }))} placeholder={HELPER_ATIVIDADE} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Gestor responsável" value={registroForm.gestor_responsavel ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, gestor_responsavel: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="E-mail" type="email" value={registroForm.email ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, email: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Telefone" value={registroForm.telefone ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, telefone: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Data do registro" type="date" InputLabelProps={{ shrink: true }} value={registroForm.data_registro ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, data_registro: e.target.value }))} helperText={HELPER_DATA_REGISTRO} />
            </Grid>

            {/* 2. CATEGORIAS DE TITULARES */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">2. Categorias de titulares</Typography>
              <FormGroup row sx={{ mt: 0.5 }}>
                {CATEGORIAS_TITULARES_OPCOES.map(({ key, label }) => (
                  <FormControlLabel
                    key={key}
                    control={<Checkbox checked={registroForm.categorias_titulares?.includes(key) ?? false} onChange={() => toggleCategoriaTitular(key)} />}
                    label={label}
                  />
                ))}
              </FormGroup>
            </Grid>

            {/* 3. MEDIDAS DE SEGURANÇA */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">3. Medidas de segurança</Typography>
              <TextField fullWidth multiline rows={3} value={registroForm.medidas_seguranca ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, medidas_seguranca: e.target.value }))} helperText={HELPER_MEDIDAS_SEGURANCA} sx={{ mt: 0.5 }} />
            </Grid>

            {/* 4. DADOS PESSOAIS */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">4. Dados pessoais</Typography>
              <FormGroup row sx={{ mt: 0.5 }}>
                {TIPOS_DADOS_PESSOAIS_OPCOES.map(({ key, label }) => (
                  <FormControlLabel
                    key={key}
                    control={<Checkbox checked={registroForm.tipos_dados_pessoais?.includes(key) ?? false} onChange={() => toggleTipoDado(key)} />}
                    label={label}
                  />
                ))}
              </FormGroup>
              <TextField fullWidth size="small" label="Outros" value={registroForm.outros_dados_pessoais ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, outros_dados_pessoais: e.target.value }))} helperText={HELPER_OUTROS_DADOS} sx={{ mt: 1 }} />
            </Grid>

            {/* 5. COMPARTILHAMENTO */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">5. Compartilhamento</Typography>
              <TextField fullWidth multiline rows={2} value={registroForm.compartilhamento ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, compartilhamento: e.target.value }))} helperText={HELPER_COMPARTILHAMENTO} sx={{ mt: 0.5 }} />
            </Grid>

            {/* 6. PERÍODO DE ARMAZENAMENTO */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">6. Período de armazenamento</Typography>
              <TextField fullWidth value={registroForm.periodo_armazenamento ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, periodo_armazenamento: e.target.value }))} helperText={HELPER_PERIODO_ARMAZENAMENTO} sx={{ mt: 0.5 }} />
            </Grid>

            {/* 7. PROCESSO, FINALIDADE E HIPÓTESE LEGAL */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">7. Processo, finalidade e hipótese legal</Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>{HELPER_PROCESSO_FINALIDADE_HIPOTESE}</Typography>
              <TextField fullWidth label="Processo" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required placeholder={PLACEHOLDER_PROCESSO} sx={{ mb: 1.5 }} />
              <TextField fullWidth multiline rows={2} label="Finalidade" value={form.finalidade} onChange={(e) => setForm((f) => ({ ...f, finalidade: e.target.value }))} placeholder={PLACEHOLDER_FINALIDADE} sx={{ mb: 1.5 }} />
              <FormControl fullWidth>
                <InputLabel>Hipótese legal</InputLabel>
                <Select value={form.baseLegal} label="Hipótese legal" onChange={(e) => setForm((f) => ({ ...f, baseLegal: e.target.value }))} displayEmpty renderValue={(v) => v || PLACEHOLDER_HIPOTESE}>
                  {HIPOTESES_LEGAIS.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* 8. OBSERVAÇÕES */}
            <Grid item xs={12}>
              <Typography variant="overline" color="text.secondary" fontWeight="bold">8. Observações</Typography>
              <TextField fullWidth multiline rows={2} value={registroForm.observacoes ?? ""} onChange={(e) => setRegistroForm((f) => ({ ...f, observacoes: e.target.value }))} helperText={HELPER_OBSERVACOES} sx={{ mt: 0.5 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.nome.trim() || saving}>
            {saving ? "Salvando…" : editingId ? "Salvar" : "Cadastrar"}
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
