"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import { useProgramaIdFromParam } from "@/hooks/useProgramaIdFromParam";
import {
  Container,
  Typography,
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Map as MapIcon,
} from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import * as dataService from "@/lib/services/dataService";
import { formatDateTimePtBr } from "@/components/common/LastUpdateInfo";
import {
  SETOR_AREA_OPCOES,
  FINALIDADE_OPCOES,
  MEIOS_ARMAZENAMENTO_OPCOES,
  TIPOS_DADOS_OPCOES,
  FLUXO_COMPARTILHAMENTO_OPCOES,
  CATEGORIA_TITULAR_OPCOES,
  TRANSFERENCIA_INTERNACIONAL_OPCOES,
  labelSetorArea,
  labelFinalidade,
  labelTitular,
  labelTransferencia,
} from "@/lib/utils/mapeamentoDadosOptions";

type MapeamentoFormState = {
  id: string;
  nome: string;
  descricao: string;
  sistemasOuFontes: string;
  setorArea: string;
  setorOutro: string;
  finalidadeCategoria: string;
  finalidadeDetalhe: string;
  meios: string[];
  meiosOutro: string;
  tipos: string[];
  tiposOutro: string;
  fluxoCompartilhamento: string;
  compartilhamentoDetalhe: string;
  categoriaTitular: string;
  titularOutro: string;
  transferenciaInternacional: string;
};

function emptyForm(): MapeamentoFormState {
  return {
    id: "",
    nome: "",
    descricao: "",
    sistemasOuFontes: "",
    setorArea: "",
    setorOutro: "",
    finalidadeCategoria: "",
    finalidadeDetalhe: "",
    meios: [],
    meiosOutro: "",
    tipos: [],
    tiposOutro: "",
    fluxoCompartilhamento: "",
    compartilhamentoDetalhe: "",
    categoriaTitular: "",
    titularOutro: "",
    transferenciaInternacional: "",
  };
}

function rowToForm(r: dataService.MapeamentoDadosRow): MapeamentoFormState {
  return {
    id: String(r.id),
    nome: r.nome ?? "",
    descricao: r.descricao ?? "",
    sistemasOuFontes: r.sistemas_ou_fontes ?? "",
    setorArea: r.setor_area ?? "",
    setorOutro: r.setor_outro ?? "",
    finalidadeCategoria: r.finalidade_categoria ?? "",
    finalidadeDetalhe: r.finalidade_detalhe ?? "",
    meios: Array.isArray(r.meios_armazenamento) ? [...r.meios_armazenamento] : [],
    meiosOutro: r.meios_outro ?? "",
    tipos: Array.isArray(r.tipos_dados) ? [...r.tipos_dados] : [],
    tiposOutro: r.tipos_outro ?? "",
    fluxoCompartilhamento: r.fluxo_compartilhamento ?? "",
    compartilhamentoDetalhe: r.compartilhamento_detalhe ?? "",
    categoriaTitular: r.categoria_titular ?? "",
    titularOutro: r.titular_outro ?? "",
    transferenciaInternacional: r.transferencia_internacional ?? "",
  };
}

function formToPayload(f: MapeamentoFormState): Omit<dataService.MapeamentoDadosRow, "id" | "programa_id" | "created_at" | "updated_at"> {
  return {
    nome: f.nome.trim(),
    descricao: f.descricao.trim() || null,
    sistemas_ou_fontes: f.sistemasOuFontes.trim() || null,
    setor_area: f.setorArea || null,
    setor_outro: f.setorArea === "outro" ? f.setorOutro.trim() || null : null,
    finalidade_categoria: f.finalidadeCategoria || null,
    finalidade_detalhe: f.finalidadeDetalhe.trim() || null,
    meios_armazenamento: f.meios,
    meios_outro: f.meios.includes("outro") ? f.meiosOutro.trim() || null : null,
    tipos_dados: f.tipos,
    tipos_outro: f.tipos.includes("outros_tipos") ? f.tiposOutro.trim() || null : null,
    fluxo_compartilhamento: f.fluxoCompartilhamento || null,
    compartilhamento_detalhe: f.compartilhamentoDetalhe.trim() || null,
    categoria_titular: f.categoriaTitular || null,
    titular_outro: f.categoriaTitular === "outros" ? f.titularOutro.trim() || null : null,
    transferencia_internacional: f.transferenciaInternacional || null,
  };
}

export default function MapeamentoDadosPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const idOrSlug = params.id as string;
  const { programaId: programaIdNum, loading: idLoading, error: programaResolveError } = useProgramaIdFromParam(idOrSlug);

  const [list, setList] = useState<dataService.MapeamentoDadosRow[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MapeamentoFormState>(emptyForm());

  const loadList = () => {
    if (programaIdNum == null) return;
    setLoading(true);
    setListError(null);
    dataService
      .fetchMapeamentosByPrograma(programaIdNum)
      .then((rows) => {
        setList(rows);
      })
      .catch((err) => {
        console.error("Erro ao carregar mapeamentos:", err);
        const msg =
          err && typeof err === "object" && "message" in err && typeof (err as Error).message === "string"
            ? (err as Error).message
            : "Não foi possível carregar os levantamentos.";
        setListError(msg);
        setList([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (programaIdNum == null) return;
    loadList();
  }, [programaIdNum]);

  const toggleMeio = (key: string) => {
    setForm((f) => ({
      ...f,
      meios: f.meios.includes(key) ? f.meios.filter((k) => k !== key) : [...f.meios, key],
    }));
  };

  const toggleTipo = (key: string) => {
    setForm((f) => ({
      ...f,
      tipos: f.tipos.includes(key) ? f.tipos.filter((k) => k !== key) : [...f.tipos, key],
    }));
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const handleOpenEdit = (row: dataService.MapeamentoDadosRow) => {
    setEditingId(String(row.id));
    setForm(rowToForm(row));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const validateForm = (): string | null => {
    if (!form.nome.trim()) return "Informe o nome do levantamento.";
    if (!form.setorArea) return "Selecione o setor ou área.";
    if (form.setorArea === "outro" && !form.setorOutro.trim()) return "Especifique o setor em \"Outro\".";
    if (!form.finalidadeCategoria) return "Selecione a finalidade.";
    if (form.finalidadeCategoria === "outro" && !form.finalidadeDetalhe.trim()) return "Descreva a finalidade em \"Outro\".";
    if (!form.categoriaTitular) return "Selecione quem são os titulares dos dados.";
    if (form.categoriaTitular === "outros" && !form.titularOutro.trim()) return "Especifique os titulares em \"Outros\".";
    if (!form.transferenciaInternacional) return "Indique se há transferência internacional de dados.";
    return null;
  };

  const handleSave = async () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }
    if (programaIdNum == null) return;
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await dataService.updateMapeamentoDados(Number(editingId), payload);
      } else {
        await dataService.createMapeamentoDados(programaIdNum, payload);
      }
      loadList();
      handleClose();
    } catch (e) {
      console.error("Erro ao salvar mapeamento:", e);
      alert("Não foi possível salvar. Se o erro citar coluna inexistente, aplique a migration mais recente no Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (typeof window === "undefined" || !window.confirm("Excluir este levantamento de mapeamento? Operações no ROPA que o referenciam ficarão sem vínculo.")) return;
    try {
      await dataService.deleteMapeamentoDados(id, programaIdNum ?? undefined);
      loadList();
    } catch (err) {
      console.error("Erro ao excluir mapeamento:", err);
    }
  };

  if (idLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="text.secondary">Carregando…</Typography>
      </Container>
    );
  }
  if (programaResolveError || programaIdNum == null) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">Programa não encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeroHeader
        title="Mapeamento de dados"
        icon={<MapIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Levantamento com listas de escolha para primeira linha; vincule ao ROPA ao cadastrar cada operação."
        trailing={
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
            Novo levantamento
          </Button>
        }
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        A coluna «Atualizado» reflete a última gravação de cada levantamento.{" "}
        <Link component={NextLink} href={`/programas/${idOrSlug}/auditoria`} underline="hover" color="primary">
          Histórico completo
        </Link>
      </Typography>

      {listError && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 2, borderColor: "error.main" }}>
          <Typography color="error" variant="body2">
            {listError}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Se a mensagem citar coluna ou permissão, confira se a migration do mapeamento foi aplicada no projeto Supabase e se você está logado como membro do programa.
          </Typography>
        </Paper>
      )}

      <Paper elevation={1} sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxWidth: "100%" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}><strong>Setor</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}><strong>Titulares</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", lg: "table-cell" } }}><strong>Finalidade</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}><strong>Transf. int.</strong></TableCell>
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
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" component="span">
                      Nenhum levantamento cadastrado. Use &quot;Novo levantamento&quot; e depois associe no{" "}
                      <NextLink
                        href={`/programas/${idOrSlug}/conformidade/ropa`}
                        style={{ color: theme.palette.primary.main, fontWeight: 600 }}
                      >
                        ROPA
                      </NextLink>
                      .
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                list.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography variant="body2" fontWeight={600}>{row.nome}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: { md: "none" } }}>
                        {labelSetorArea(row.setor_area)} · {labelTitular(row.categoria_titular)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" }, maxWidth: 160 }}>
                      {row.setor_area === "outro" && row.setor_outro?.trim()
                        ? row.setor_outro
                        : labelSetorArea(row.setor_area)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" }, maxWidth: 180 }}>
                      {row.categoria_titular === "outros" && row.titular_outro?.trim()
                        ? row.titular_outro
                        : labelTitular(row.categoria_titular)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", lg: "table-cell" }, maxWidth: 200 }}>
                      {row.finalidade_categoria === "outro" && row.finalidade_detalhe?.trim()
                        ? row.finalidade_detalhe
                        : labelFinalidade(row.finalidade_categoria)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                      {labelTransferencia(row.transferencia_internacional)}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "none", sm: "table-cell" },
                        fontSize: "0.75rem",
                        color: "text.secondary",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.updated_at ? formatDateTimePtBr(row.updated_at) : "—"}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>{editingId ? "Editar levantamento" : "Novo levantamento de mapeamento"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Campos com lista são mais rápidos de preencher; use texto só quando aparecer &quot;Outro&quot; ou observações.
            </Typography>

            <TextField
              fullWidth
              required
              label="1. Nome do levantamento"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              placeholder="Ex.: Atendimento — formulário do site"
            />

            <FormControl fullWidth required size="small">
              <InputLabel id="setor-label">2. Setor ou área</InputLabel>
              <Select
                labelId="setor-label"
                label="2. Setor ou área"
                value={form.setorArea}
                onChange={(e) => setForm((f) => ({ ...f, setorArea: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Selecione…</em>
                </MenuItem>
                {SETOR_AREA_OPCOES.map((o) => (
                  <MenuItem key={o.key} value={o.key}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.setorArea === "outro" && (
              <TextField
                fullWidth
                size="small"
                label="Especifique o setor"
                value={form.setorOutro}
                onChange={(e) => setForm((f) => ({ ...f, setorOutro: e.target.value }))}
              />
            )}

            <FormControl fullWidth required size="small">
              <InputLabel id="finalidade-label">3. Finalidade (negócio)</InputLabel>
              <Select
                labelId="finalidade-label"
                label="3. Finalidade (negócio)"
                value={form.finalidadeCategoria}
                onChange={(e) => setForm((f) => ({ ...f, finalidadeCategoria: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Selecione…</em>
                </MenuItem>
                {FINALIDADE_OPCOES.map((o) => (
                  <MenuItem key={o.key} value={o.key}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.finalidadeCategoria && (
              <TextField
                fullWidth
                size="small"
                required={form.finalidadeCategoria === "outro"}
                label={form.finalidadeCategoria === "outro" ? "Descreva a finalidade" : "Detalhe opcional da finalidade"}
                value={form.finalidadeDetalhe}
                onChange={(e) => setForm((f) => ({ ...f, finalidadeDetalhe: e.target.value }))}
                multiline
                minRows={form.finalidadeCategoria === "outro" ? 2 : 1}
              />
            )}

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              4. Onde os dados aparecem (marque todos que se aplicam)
            </Typography>
            <FormGroup sx={{ pl: 0.5 }}>
              {MEIOS_ARMAZENAMENTO_OPCOES.map((o) => (
                <FormControlLabel
                  key={o.key}
                  control={<Checkbox checked={form.meios.includes(o.key)} onChange={() => toggleMeio(o.key)} size="small" />}
                  label={o.label}
                />
              ))}
            </FormGroup>
            {form.meios.includes("outro") && (
              <TextField
                fullWidth
                size="small"
                label="Especifique o meio (outro)"
                value={form.meiosOutro}
                onChange={(e) => setForm((f) => ({ ...f, meiosOutro: e.target.value }))}
              />
            )}

            <Divider />
            <Typography variant="subtitle2" color="text.secondary">
              5. Tipos de dados (marque os principais)
            </Typography>
            <FormGroup sx={{ pl: 0.5 }}>
              {TIPOS_DADOS_OPCOES.map((o) => (
                <FormControlLabel
                  key={o.key}
                  control={<Checkbox checked={form.tipos.includes(o.key)} onChange={() => toggleTipo(o.key)} size="small" />}
                  label={o.label}
                />
              ))}
            </FormGroup>
            {form.tipos.includes("outros_tipos") && (
              <TextField
                fullWidth
                size="small"
                label="Especifique outros tipos de dados"
                value={form.tiposOutro}
                onChange={(e) => setForm((f) => ({ ...f, tiposOutro: e.target.value }))}
              />
            )}

            <Divider />
            <FormControl fullWidth size="small">
              <InputLabel id="fluxo-label">6. Quem mais recebe ou usa estes dados?</InputLabel>
              <Select
                labelId="fluxo-label"
                label="6. Quem mais recebe ou usa estes dados?"
                value={form.fluxoCompartilhamento}
                onChange={(e) => setForm((f) => ({ ...f, fluxoCompartilhamento: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Opcional — selecione…</em>
                </MenuItem>
                {FLUXO_COMPARTILHAMENTO_OPCOES.map((o) => (
                  <MenuItem key={o.key} value={o.key}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(form.fluxoCompartilhamento === "outro_departamento" || form.fluxoCompartilhamento === "empresa_externa") && (
              <TextField
                fullWidth
                size="small"
                label="Nome do departamento ou da empresa (se souber)"
                value={form.compartilhamentoDetalhe}
                onChange={(e) => setForm((f) => ({ ...f, compartilhamentoDetalhe: e.target.value }))}
              />
            )}

            <FormControl fullWidth required size="small">
              <InputLabel id="titular-label">7. Titulares dos dados</InputLabel>
              <Select
                labelId="titular-label"
                label="7. Titulares dos dados"
                value={form.categoriaTitular}
                onChange={(e) => setForm((f) => ({ ...f, categoriaTitular: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Selecione…</em>
                </MenuItem>
                {CATEGORIA_TITULAR_OPCOES.map((o) => (
                  <MenuItem key={o.key} value={o.key}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.categoriaTitular === "outros" && (
              <TextField
                fullWidth
                size="small"
                label="Especifique os titulares"
                value={form.titularOutro}
                onChange={(e) => setForm((f) => ({ ...f, titularOutro: e.target.value }))}
              />
            )}

            <FormControl fullWidth required size="small">
              <InputLabel id="transf-label">8. Dados saem do Brasil?</InputLabel>
              <Select
                labelId="transf-label"
                label="8. Dados saem do Brasil?"
                value={form.transferenciaInternacional}
                onChange={(e) => setForm((f) => ({ ...f, transferenciaInternacional: e.target.value }))}
              >
                <MenuItem value="">
                  <em>Selecione…</em>
                </MenuItem>
                {TRANSFERENCIA_INTERNACIONAL_OPCOES.map((o) => (
                  <MenuItem key={o.key} value={o.key}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Observações (opcional)"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Complemento: sistemas ou fontes (texto livre, opcional)"
              value={form.sistemasOuFontes}
              onChange={(e) => setForm((f) => ({ ...f, sistemasOuFontes: e.target.value }))}
              placeholder="Ex.: nome do sistema interno, link, pasta de rede"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando…" : editingId ? "Salvar" : "Cadastrar"}
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
