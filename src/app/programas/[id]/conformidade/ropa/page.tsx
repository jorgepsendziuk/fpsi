"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import {
  Container,
  Typography,
  Box,
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
  Autocomplete,
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
  Sync as SyncIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import { getPoliticaNomeProgramaRotulo } from "@/lib/utils/politicaPlaceholders";
import { buildRopaPdfDocument } from "@/lib/utils/ropaPdf";
import { ResourceLastUpdateLine } from "@/components/common/ResourceLastUpdateLine";
import { formatDateTimePtBr } from "@/components/common/LastUpdateInfo";
type ProgramaMembroUsuario = {
  user_id: string;
  nome: string | null;
  email: string | null;
  role: string;
};

function labelMembroGestor(u: ProgramaMembroUsuario): string {
  const n = u.nome?.trim() || "Sem nome";
  const e = u.email || u.user_id;
  return `${n} (${e})`;
}

// —— Operação (Processo, Finalidade, Hipótese Legal) ——
export interface OperacaoTratamento {
  id: string;
  nome: string;
  finalidade: string;
  baseLegal: string;
  createdAt: string;
  /** FK opcional para levantamento em `mapeamento_dados` */
  mapeamentoId: string;
  mapeamentoNome?: string | null;
  /** ISO da última alteração da linha `ropa` */
  updatedAtIso?: string | null;
  /** Campos opcionais da linha `ropa` (quando preenchidos no banco) */
  responsavel?: string | null;
  retencao?: string | null;
  categoriasDados?: string | null;
  categoriasTitulares?: string | null;
  compartilhamento?: string | null;
  medidasSeguranca?: string | null;
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

// Textos de apoio do cabeçalho ROPA (instruções de preenchimento)
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
  mapeamentoId: "",
  mapeamentoNome: null,
});

function rowToOperacao(r: dataService.RopaRow, mapeamentoNome?: string | null): OperacaoTratamento {
  return {
    id: String(r.id),
    nome: r.nome ?? "",
    finalidade: r.finalidade ?? "",
    baseLegal: r.base_legal ?? "",
    createdAt: r.created_at ? r.created_at.slice(0, 10) : "",
    updatedAtIso: r.updated_at ?? null,
    mapeamentoId: r.mapeamento_id != null ? String(r.mapeamento_id) : "",
    mapeamentoNome: mapeamentoNome ?? null,
    responsavel: r.responsavel ?? null,
    retencao: r.retencao ?? null,
    categoriasDados: r.categorias_dados ?? null,
    categoriasTitulares: r.categorias_titulares ?? null,
    compartilhamento: r.compartilhamento ?? null,
    medidasSeguranca: r.medidas_seguranca ?? null,
  };
}

/** Reidrata cabeçalho a partir do JSON gravado na versão. */
function snapshotRegistroToRow(s: Record<string, unknown>): dataService.RegistroRopaRow | null {
  if (!s || Object.keys(s).length === 0) return null;
  const cats = s.categorias_titulares;
  const tips = s.tipos_dados_pessoais;
  return {
    id: Number(s.id) || 0,
    programa_id: Number(s.programa_id) || 0,
    organizacao: (s.organizacao as string) ?? null,
    cnpj: (s.cnpj as string) ?? null,
    endereco: (s.endereco as string) ?? null,
    atividade_principal: (s.atividade_principal as string) ?? null,
    gestor_responsavel_user_id: (s.gestor_responsavel_user_id as string) ?? null,
    gestor_responsavel: (s.gestor_responsavel as string) ?? null,
    email: (s.email as string) ?? null,
    telefone: (s.telefone as string) ?? null,
    data_registro: (s.data_registro as string) ?? null,
    categorias_titulares: Array.isArray(cats) ? (cats as string[]) : [],
    medidas_seguranca: (s.medidas_seguranca as string) ?? null,
    tipos_dados_pessoais: Array.isArray(tips) ? (tips as string[]) : [],
    outros_dados_pessoais: (s.outros_dados_pessoais as string) ?? null,
    compartilhamento: (s.compartilhamento as string) ?? null,
    periodo_armazenamento: (s.periodo_armazenamento as string) ?? null,
    observacoes: (s.observacoes as string) ?? null,
    created_at: (s.created_at as string) || "",
    updated_at: (s.updated_at as string) || "",
  };
}

function snapshotOpsToOperacoes(raw: unknown): OperacaoTratamento[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((op: dataService.RopaRow) => rowToOperacao(op));
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function operacaoToPdfPayload(o: OperacaoTratamento) {
  return {
    id: o.id,
    nome: o.nome,
    finalidade: o.finalidade,
    baseLegal: o.baseLegal,
    createdAt: o.createdAt,
    mapeamentoId: o.mapeamentoId || null,
    mapeamentoNome: o.mapeamentoNome ?? null,
    responsavel: o.responsavel,
    retencao: o.retencao,
    categoriasDados: o.categoriasDados,
    categoriasTitulares: o.categoriasTitulares,
    compartilhamento: o.compartilhamento,
    medidasSeguranca: o.medidasSeguranca,
  };
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
  gestor_responsavel_user_id: "",
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
      gestor_responsavel_user_id: "",
      gestor_responsavel: "",
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
    gestor_responsavel_user_id: r.gestor_responsavel_user_id ?? "",
    gestor_responsavel: r.gestor_responsavel ?? "",
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
  const [versoes, setVersoes] = useState<dataService.RegistroRopaVersaoRow[]>([]);
  const [versaoDialogOpen, setVersaoDialogOpen] = useState(false);
  const [versaoNota, setVersaoNota] = useState("");
  const [syncingCadastro, setSyncingCadastro] = useState(false);
  const [savingVersao, setSavingVersao] = useState(false);
  const [membrosPrograma, setMembrosPrograma] = useState<ProgramaMembroUsuario[]>([]);
  const [mapeamentos, setMapeamentos] = useState<dataService.MapeamentoDadosRow[]>([]);
  /** Cadastro do programa — logo, CNPJ e portal no cabeçalho do PDF (como nas políticas) */
  const [programa, setPrograma] = useState<Record<string, unknown> | null>(null);

  const loadVersoes = useCallback(async () => {
    if (programaIdNum == null) return;
    try {
      const rows = await dataService.fetchRegistroRopaVersoes(programaIdNum);
      setVersoes(rows);
    } catch (e) {
      console.error("Erro ao carregar versões do ROPA:", e);
    }
  }, [programaIdNum]);

  // Carregar registro, operações e dados da empresa (para preencher informações de contato do ROPA).
  // Mapeamentos são carregados à parte: falha na tabela/RLS de mapeamento não pode derrubar o ROPA inteiro.
  useEffect(() => {
    if (programaIdNum == null) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dataService.fetchRegistroRopaByPrograma(programaIdNum),
      dataService.fetchRopaByPrograma(programaIdNum),
      dataService.getEmpresaForRegistroRopa(programaIdNum),
    ])
      .then(async ([reg, rows, empresaDefaults]) => {
        let maps: dataService.MapeamentoDadosRow[] = [];
        try {
          maps = await dataService.fetchMapeamentosByPrograma(programaIdNum);
        } catch (e) {
          console.error("Erro ao carregar mapeamentos (ROPA continua disponível):", e);
        }
        if (!cancelled) {
          setRegistro(reg);
          setEmpresaRopaDefaults(empresaDefaults || null);
          setRegistroForm(registroRowToForm(reg, empresaDefaults || undefined));
          setMapeamentos(maps);
          const nomePorId = new Map(maps.map((m) => [m.id, m.nome]));
          setOperacoes(
            rows.map((r) =>
              rowToOperacao(
                r,
                r.mapeamento_id != null ? nomePorId.get(r.mapeamento_id) ?? null : null
              )
            )
          );
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

  useEffect(() => {
    loadVersoes();
  }, [loadVersoes]);

  useEffect(() => {
    if (programaIdNum == null) return;
    let cancelled = false;
    dataService
      .fetchProgramaById(programaIdNum)
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

  useEffect(() => {
    if (programaIdNum == null) return;
    let cancelled = false;
    fetch(`/api/users?programaId=${programaIdNum}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) setMembrosPrograma(data as ProgramaMembroUsuario[]);
        else setMembrosPrograma([]);
      })
      .catch(() => {
        if (!cancelled) setMembrosPrograma([]);
      });
    return () => {
      cancelled = true;
    };
  }, [programaIdNum]);

  const handleSyncCadastro = async () => {
    if (programaIdNum == null) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Atualizar organização, CNPJ, endereço, atividade, gestor, e-mail e telefone do ROPA com os dados do cadastro do programa (e da empresa, se houver)? Os demais campos do cabeçalho (categorias, medidas, etc.) são mantidos."
      )
    ) {
      return;
    }
    setSyncingCadastro(true);
    try {
      const saved = await dataService.syncRegistroRopaFromCadastro(programaIdNum);
      setRegistro(saved);
      setRegistroForm(registroRowToForm(saved, empresaRopaDefaults || undefined));
    } catch (err) {
      console.error(err);
      alert("Não foi possível sincronizar com o cadastro. Verifique os dados do programa na página inicial.");
    } finally {
      setSyncingCadastro(false);
    }
  };

  const handleRegistrarVersao = async () => {
    if (programaIdNum == null) return;
    setSavingVersao(true);
    try {
      await dataService.createRegistroRopaVersao(programaIdNum, versaoNota);
      await loadVersoes();
      setVersaoDialogOpen(false);
      setVersaoNota("");
    } catch (err) {
      console.error(err);
      alert("Não foi possível registrar a versão.");
    } finally {
      setSavingVersao(false);
    }
  };

  const exportPdfVersao = useCallback(
    async (v: dataService.RegistroRopaVersaoRow) => {
      try {
        const regSnap = snapshotRegistroToRow(v.registro_snapshot);
        const ops = snapshotOpsToOperacoes(v.operacoes_snapshot);
        const doc = await buildRopaPdfDocument({
          programa: programa ?? undefined,
          idOrSlug,
          registro: regSnap,
          operacoes: ops.map(operacaoToPdfPayload),
          metaLine: `Programa: ${getPoliticaNomeProgramaRotulo(programa, idOrSlug)} | Versão ${v.numero} | ${new Date(v.created_at).toLocaleString("pt-BR")}`,
        });
        doc.save(`ROPA-${idOrSlug}-v${v.numero}-${new Date(v.created_at).toISOString().slice(0, 10)}.pdf`);
      } catch (e) {
        console.error("Erro ao gerar PDF da versão:", e);
      }
    },
    [idOrSlug, programa]
  );

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
    if (!registroForm.gestor_responsavel_user_id?.trim()) {
      alert(
        "Selecione o gestor responsável entre os usuários do programa. Se a pessoa ainda não aparece na lista, use \"Cadastrar ou convidar usuário\"."
      );
      return;
    }
    setSaving(true);
    try {
      const savedRegistro = await dataService.upsertRegistroRopa(programaIdNum, {
        organizacao: registroForm.organizacao || null,
        cnpj: registroForm.cnpj || null,
        endereco: registroForm.endereco || null,
        atividade_principal: registroForm.atividade_principal || null,
        gestor_responsavel_user_id: registroForm.gestor_responsavel_user_id.trim(),
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

      const nomePorId = new Map(mapeamentos.map((m) => [m.id, m.nome]));
      const mid = form.mapeamentoId.trim() ? Number(form.mapeamentoId) : null;
      const nomeMap = mid != null ? nomePorId.get(mid) ?? null : null;

      const payload = {
        nome: form.nome.trim(),
        finalidade: form.finalidade || null,
        base_legal: form.baseLegal || null,
        mapeamento_id: mid,
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
          prev.map((o) => (o.id === editingId ? rowToOperacao(updated, nomeMap) : o))
        );
      } else {
        const created = await dataService.createRopa(programaIdNum, payload, savedRegistro.id);
        setOperacoes((prev) => [...prev, rowToOperacao(created, nomeMap)]);
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
      await dataService.deleteRopa(Number(id), programaIdNum ?? undefined);
      setOperacoes((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erro ao excluir ROPA:", err);
    }
  };

  const exportExcel = useCallback(() => {
    const headers = ["Processo", "Finalidade", "Hipótese legal", "Mapeamento", "Data registro"];
    const rows = operacoes.map((o) => [
      o.nome,
      o.finalidade,
      o.baseLegal,
      o.mapeamentoNome?.trim() || "—",
      o.createdAt,
    ]);
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
    async (list: OperacaoTratamento[]) => {
      try {
        const doc = await buildRopaPdfDocument({
          programa: programa ?? undefined,
          idOrSlug,
          registro,
          operacoes: list.map(operacaoToPdfPayload),
          metaLine: `Programa: ${getPoliticaNomeProgramaRotulo(programa, idOrSlug)} | Exportado em ${new Date().toLocaleString("pt-BR")}`,
        });
        doc.save(`ROPA-Programa-${idOrSlug}-${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (e) {
        console.error("Erro ao gerar PDF do ROPA:", e);
      }
    },
    [idOrSlug, programa, registro]
  );

  const exportPdfSelected = useCallback(() => {
    const list = operacoes.filter((o) => selectedIds.has(o.id));
    void exportPdfBatch(list.length > 0 ? list : operacoes);
  }, [operacoes, selectedIds, exportPdfBatch]);

  const exportPdfAll = useCallback(() => {
    void exportPdfBatch(operacoes);
  }, [operacoes, exportPdfBatch]);

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
      <PageHeroHeader
        title="ROPA"
        icon={<StorageIcon sx={{ fontSize: 30 }} aria-hidden />}
        description={
          <>
            <Typography variant="body2" component="span" display="block">
              Registro das operações de tratamento (art. 37 LGPD)
            </Typography>
            <ResourceLastUpdateLine
              programaId={programaIdNum}
              programaPathSegment={idOrSlug}
              resourceType="registro_ropa"
              resourceId={registro?.id ?? null}
              dbUpdatedAt={registro?.updated_at ?? null}
              compact
              sx={{ mt: 0.5 }}
            />
          </>
        }
      />

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

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, alignItems: "center" }}>
        <Tooltip title="Copiar para o cabeçalho do ROPA os dados de identificação e contato do cadastro do programa (e empresa, se existir). Mantém categorias, medidas e demais campos já preenchidos.">
          <span>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<SyncIcon />}
              onClick={handleSyncCadastro}
              disabled={syncingCadastro}
            >
              {syncingCadastro ? "Sincronizando…" : "Sincronizar com cadastro do programa"}
            </Button>
          </span>
        </Tooltip>
        <Tooltip title="Grava uma cópia imutável do ROPA atual (cabeçalho + operações) para auditoria e PDF histórico.">
          <span>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setVersaoDialogOpen(true)}
            >
              Registrar versão
            </Button>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ flex: "1 1 200px" }}>
          Híbrido: cadastro mestre na página do programa; ROPA pode sincronizar e ainda editar texto. Versões congelam o estado na data.
        </Typography>
      </Box>

      {versoes.length > 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon fontSize="small" />
            Versões registradas ({versoes.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Versão</strong></TableCell>
                  <TableCell><strong>Data</strong></TableCell>
                  <TableCell><strong>Nota</strong></TableCell>
                  <TableCell align="right"><strong>Ações</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versoes.map((v) => (
                  <TableRow key={v.id} hover>
                    <TableCell>{v.numero}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>{v.nota || "—"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="PDF desta versão (conteúdo congelado)">
                        <Button size="small" startIcon={<PdfIcon />} onClick={() => void exportPdfVersao(v)}>
                          PDF
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

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
              <TableCell><strong>Mapeamento</strong></TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, whiteSpace: "nowrap" }}>
                <strong>Atualizado</strong>
              </TableCell>
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
            ) : operacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                  <TableCell sx={{ maxWidth: 200 }}>{op.mapeamentoNome?.trim() || "—"}</TableCell>
                  <TableCell
                    sx={{
                      display: { xs: "none", sm: "table-cell" },
                      fontSize: "0.75rem",
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {op.updatedAtIso ? formatDateTimePtBr(op.updatedAtIso) : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Exportar PDF">
                      <IconButton size="small" onClick={() => void exportPdfBatch([op])} aria-label="Exportar PDF">
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
        <DialogTitle>{editingId ? "Editar processo" : "Adicionar processo — Registro das Operações de Tratamento (ROPA)"}</DialogTitle>
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
            <Grid item xs={12}>
              <Autocomplete
                options={membrosPrograma}
                getOptionLabel={(o) => labelMembroGestor(o)}
                isOptionEqualToValue={(a, b) => a.user_id === b.user_id}
                value={
                  membrosPrograma.find((m) => m.user_id === registroForm.gestor_responsavel_user_id) ?? null
                }
                onChange={(_, v) =>
                  setRegistroForm((f) => ({
                    ...f,
                    gestor_responsavel_user_id: v?.user_id ?? "",
                    gestor_responsavel: v ? labelMembroGestor(v) : "",
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Gestor responsável"
                    helperText="Usuário com acesso aceito a este programa. O papel no sistema (admin, coordenador, etc.) continua o mesmo de Usuários e permissões — aqui você só indica quem responde pelo registro ROPA."
                  />
                )}
              />
              <Button
                component={NextLink}
                href={`/programas/${idOrSlug}/usuarios`}
                size="small"
                startIcon={<PersonAddIcon />}
                sx={{ mt: 1 }}
                variant="text"
              >
                Cadastrar ou convidar usuário
              </Button>
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
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel id="ropa-mapeamento-select-label">Levantamento de mapeamento (opcional)</InputLabel>
                <Select
                  labelId="ropa-mapeamento-select-label"
                  value={form.mapeamentoId || ""}
                  label="Levantamento de mapeamento (opcional)"
                  onChange={(e) => setForm((f) => ({ ...f, mapeamentoId: e.target.value }))}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {mapeamentos.map((m) => (
                    <MenuItem key={m.id} value={String(m.id)}>
                      {m.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5 }}>
                Cadastre ou edite itens em{" "}
                <Link component={NextLink} href={`/programas/${idOrSlug}/conformidade/mapeamento`} underline="hover">
                  Mapeamento de dados
                </Link>
                .
              </Typography>
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

      <Dialog open={versaoDialogOpen} onClose={() => !savingVersao && setVersaoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar versão do ROPA</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Será gravado um snapshot imutável do cabeçalho do registro e de todas as operações de tratamento, como estão agora.
            Use uma nota opcional (ex.: revisão anual, auditoria).
          </Typography>
          <TextField
            fullWidth
            label="Nota (opcional)"
            value={versaoNota}
            onChange={(e) => setVersaoNota(e.target.value)}
            multiline
            minRows={2}
            placeholder="Ex.: Versão para relatório de conformidade 2026"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersaoDialogOpen(false)} disabled={savingVersao}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleRegistrarVersao} disabled={savingVersao}>
            {savingVersao ? "Salvando…" : "Registrar versão"}
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
