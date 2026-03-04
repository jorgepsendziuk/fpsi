"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  Divider,
  Grid,
  Skeleton,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {
  AccountTree as AccountTreeIcon,
  Policy as PolicyIcon,
  Business as BusinessIcon,
  Build as BuildIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import type { PapelLgpdInstituicao, PapelLgpdVinculo } from "@/lib/services/dataService";
import { PapelLgpdDiagram } from "./PapelLgpdDiagram";

const PAPEIS = [
  { key: "controlador" as const, label: "Controlador", sublabel: "Determina finalidades e meios", color: "#1976d2", icon: <PolicyIcon /> },
  { key: "contratante" as const, label: "Contratante", sublabel: "Contratante administrativa", color: "#2e7d32", icon: <BusinessIcon /> },
  { key: "operador" as const, label: "Operador", sublabel: "Executa conforme instruções", color: "#ed6c02", icon: <BuildIcon /> },
] as const;

interface PapelLgpdManagerProps {
  programaId: number;
  idOrSlug: string;
}

export function PapelLgpdManager({ programaId, idOrSlug }: PapelLgpdManagerProps) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [data, setData] = useState<dataService.PapelLgpdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instDialogOpen, setInstDialogOpen] = useState(false);
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<PapelLgpdInstituicao | null>(null);
  const [editingVinculo, setEditingVinculo] = useState<PapelLgpdVinculo | null>(null);
  const [addingPapel, setAddingPapel] = useState<"controlador" | "contratante" | "operador" | null>(null);
  const [instForm, setInstForm] = useState({ nome: "", descricao: "", contato: "", email: "", site: "" });
  const [vinculoForm, setVinculoForm] = useState({
    instituicao_origem_id: "" as number | "",
    instituicao_destino_id: "" as number | "",
    destino_tipo_papel: "" as string | "",
    tipo_vinculo: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await dataService.fetchPapelLgpd(programaId);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
      setData({ instituicoes: [], vinculos: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [programaId]);

  const getInstituicoesByPapel = (tipo: "controlador" | "contratante" | "operador") =>
    (data?.instituicoes || []).filter((i) => i.tipo_papel === tipo).sort((a, b) => a.ordem - b.ordem);

  const handleOpenAddInst = (papel: "controlador" | "contratante" | "operador") => {
    setAddingPapel(papel);
    setEditingInst(null);
    setInstForm({ nome: "", descricao: "", contato: "", email: "", site: "" });
    setInstDialogOpen(true);
  };

  const handleOpenEditInst = (inst: PapelLgpdInstituicao) => {
    setEditingInst(inst);
    setAddingPapel(null);
    setInstForm({
      nome: inst.nome,
      descricao: inst.descricao || "",
      contato: inst.contato || "",
      email: inst.email || "",
      site: inst.site || "",
    });
    setInstDialogOpen(true);
  };

  const handleSaveInst = async () => {
    if (!instForm.nome.trim()) return;
    setSaving(true);
    try {
      if (editingInst) {
        await dataService.updatePapelLgpdInstituicao(programaId, editingInst.id, {
          nome: instForm.nome.trim(),
          descricao: instForm.descricao.trim() || null,
          contato: instForm.contato.trim() || null,
          email: instForm.email.trim() || null,
          site: instForm.site.trim() || null,
        });
      } else if (addingPapel) {
        await dataService.createPapelLgpdInstituicao(programaId, {
          tipo_papel: addingPapel,
          nome: instForm.nome.trim(),
          descricao: instForm.descricao.trim() || null,
          contato: instForm.contato.trim() || null,
          email: instForm.email.trim() || null,
          site: instForm.site.trim() || null,
          ordem: getInstituicoesByPapel(addingPapel).length,
        });
      }
      await fetchData();
      setInstDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInst = async (inst: PapelLgpdInstituicao) => {
    if (!confirm(`Excluir "${inst.nome}"?`)) return;
    setSaving(true);
    try {
      await dataService.deletePapelLgpdInstituicao(programaId, inst.id);
      await fetchData();
      setInstDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddVinculo = () => {
    setEditingVinculo(null);
    setVinculoForm({
      instituicao_origem_id: "",
      instituicao_destino_id: "",
      destino_tipo_papel: "",
      tipo_vinculo: "",
    });
    setVinculoDialogOpen(true);
  };

  const handleOpenEditVinculo = (v: PapelLgpdVinculo) => {
    setEditingVinculo(v);
    setVinculoForm({
      instituicao_origem_id: v.instituicao_origem_id,
      instituicao_destino_id: v.instituicao_destino_id ?? ("" as ""),
      destino_tipo_papel: (v.destino_tipo_papel ?? "") as "" | "controlador" | "contratante" | "operador",
      tipo_vinculo: v.tipo_vinculo,
    });
    setVinculoDialogOpen(true);
  };

  const handleSaveVinculo = async () => {
    if (!vinculoForm.tipo_vinculo.trim()) return;
    const destId = vinculoForm.instituicao_destino_id;
    const destPapel = vinculoForm.destino_tipo_papel;
    if (!destId && !destPapel) {
      setError("Informe o destino (instituição ou papel)");
      return;
    }
    if (destId && destPapel) {
      setError("Use apenas instituição ou papel como destino");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingVinculo) {
        await dataService.updatePapelLgpdVinculo(programaId, editingVinculo.id, {
          instituicao_origem_id: Number(vinculoForm.instituicao_origem_id),
          instituicao_destino_id: destId ? Number(destId) : null,
          destino_tipo_papel: destPapel || null,
          tipo_vinculo: vinculoForm.tipo_vinculo.trim(),
        });
      } else {
        await dataService.createPapelLgpdVinculo(programaId, {
          instituicao_origem_id: Number(vinculoForm.instituicao_origem_id),
          instituicao_destino_id: destId ? Number(destId) : null,
          destino_tipo_papel: destPapel || null,
          tipo_vinculo: vinculoForm.tipo_vinculo.trim(),
          ordem: (data?.vinculos?.length || 0),
        });
      }
      await fetchData();
      setVinculoDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVinculo = async (v: PapelLgpdVinculo) => {
    if (!confirm("Excluir este vínculo?")) return;
    setSaving(true);
    try {
      await dataService.deletePapelLgpdVinculo(programaId, v.id);
      await fetchData();
      setVinculoDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  };

  const instituicoes = data?.instituicoes || [];
  const vinculos = data?.vinculos || [];

  const getInstLabel = (id: number) => instituicoes.find((i) => i.id === id)?.nome || `#${id}`;

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        mb: 4,
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(46, 125, 50, 0.08) 100%)"
          : "linear-gradient(135deg, rgba(25, 118, 210, 0.04) 0%, rgba(46, 125, 50, 0.04) 100%)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountTreeIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Estrutura de Tratamento
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<LinkIcon />}
          onClick={() => router.push(`/programas/${idOrSlug}`)}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Ver diagrama
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cadastre instituições nos papéis LGPD (Controlador, Contratante, Operador) e defina as conexões entre elas. 
        Pode ser sua empresa, órgão, prestadores ou operadores.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Diagrama: 50% */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: "100%", minHeight: 200, borderRadius: 2, overflow: "hidden" }}>
            {loading ? (
              <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 2, minHeight: 200 }} />
            ) : (
              <Box sx={{ height: "100%", width: "100%" }}>
              <PapelLgpdDiagram
                programaId={programaId}
                idOrSlug={idOrSlug}
                data={data}
                embedded
                onNodeClick={handleOpenEditInst}
                onEdgeClick={handleOpenEditVinculo}
              />
              </Box>
            )}
          </Box>
        </Grid>

        {/* Cadastro: 50% */}
        <Grid item xs={12} md={6}>
          <Box sx={{ pl: isMobile ? 0 : 1 }}>
      {/* Instituições por papel */}
      {PAPEIS.map((papel) => {
        const items = getInstituicoesByPapel(papel.key);
        return (
          <Box key={papel.key} sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: papel.color }}>
                {papel.icon}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {papel.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {papel.sublabel}
                  </Typography>
                </Box>
              </Box>
              <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenAddInst(papel.key)} sx={{ borderRadius: 2 }}>
                Adicionar
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {items.length === 0 ? (
                <Chip label="Nenhuma instituição" size="small" variant="outlined" sx={{ opacity: 0.7 }} />
              ) : (
                items.map((inst) => (
                  <Chip
                    key={inst.id}
                    label={inst.nome}
                    size="small"
                    onDelete={() => handleOpenEditInst(inst)}
                    deleteIcon={<EditIcon fontSize="small" />}
                    onClick={() => handleOpenEditInst(inst)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: alpha(papel.color, 0.12),
                      border: `1px solid ${alpha(papel.color, 0.3)}`,
                    }}
                  />
                ))
              )}
            </Box>
          </Box>
        );
      })}

      <Divider sx={{ my: 3 }} />

      {/* Vínculos */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinkIcon fontSize="small" />
            Conexões (vínculos)
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAddVinculo}
            disabled={instituicoes.length < 1}
            sx={{ borderRadius: 2 }}
          >
            Nova conexão
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Ex.: INCRA → UFBA (TED 50/2023), LGRDC → Controlador (Processa dados em nome de)
        </Typography>
        {vinculos.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Nenhuma conexão. Adicione instituições primeiro, depois crie as conexões.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {vinculos.map((v) => (
              <Box
                key={v.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2">
                  {getInstLabel(v.instituicao_origem_id)} → {v.instituicao_destino_id ? getInstLabel(v.instituicao_destino_id) : v.destino_tipo_papel}{" "}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    ({v.tipo_vinculo})
                  </Typography>
                </Typography>
                <Box>
                  <IconButton size="small" onClick={() => handleOpenEditVinculo(v)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteVinculo(v)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog Instituição */}
      <Dialog open={instDialogOpen} onClose={() => setInstDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editingInst ? "Editar instituição" : `Nova instituição em ${addingPapel ? PAPEIS.find((p) => p.key === addingPapel)?.label : ""}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={instForm.nome} onChange={(e) => setInstForm((f) => ({ ...f, nome: e.target.value }))} fullWidth required />
            <TextField label="Descrição" value={instForm.descricao} onChange={(e) => setInstForm((f) => ({ ...f, descricao: e.target.value }))} fullWidth multiline rows={2} />
            <TextField label="Contato" value={instForm.contato} onChange={(e) => setInstForm((f) => ({ ...f, contato: e.target.value }))} fullWidth />
            <TextField label="Email" type="email" value={instForm.email} onChange={(e) => setInstForm((f) => ({ ...f, email: e.target.value }))} fullWidth />
            <TextField label="Site" value={instForm.site} onChange={(e) => setInstForm((f) => ({ ...f, site: e.target.value }))} fullWidth />
            {editingInst && (
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteInst(editingInst)} disabled={saving} sx={{ alignSelf: "flex-start" }}>
                Excluir instituição
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInstDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveInst} disabled={saving || !instForm.nome.trim()}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Vínculo */}
      <Dialog open={vinculoDialogOpen} onClose={() => setVinculoDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editingVinculo ? "Editar conexão" : "Nova conexão"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Origem (instituição)</InputLabel>
              <Select
                value={vinculoForm.instituicao_origem_id}
                label="Origem (instituição)"
                onChange={(e) => setVinculoForm((f) => ({ ...f, instituicao_origem_id: e.target.value as number }))}
              >
                <MenuItem value="">Selecione</MenuItem>
                {instituicoes.map((i) => (
                  <MenuItem key={i.id} value={i.id}>
                    {i.nome} ({PAPEIS.find((p) => p.key === i.tipo_papel)?.label})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Destino (instituição)</InputLabel>
              <Select
                value={vinculoForm.instituicao_destino_id}
                label="Destino (instituição)"
                onChange={(e) => {
                  const v = e.target.value as number | "";
                  setVinculoForm((f) => ({ ...f, instituicao_destino_id: v, destino_tipo_papel: v ? "" : f.destino_tipo_papel }));
                }}
              >
                <MenuItem value="">— ou use papel abaixo —</MenuItem>
                {instituicoes
                  .filter((i) => i.id !== vinculoForm.instituicao_origem_id)
                  .map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.nome}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Destino (papel/grupo)</InputLabel>
              <Select
                value={vinculoForm.destino_tipo_papel}
                label="Destino (papel/grupo)"
                onChange={(e) => {
                  const v = e.target.value as string;
                  setVinculoForm((f) => ({ ...f, destino_tipo_papel: v, instituicao_destino_id: v ? "" : f.instituicao_destino_id }));
                }}
              >
                <MenuItem value="">— ou use instituição acima —</MenuItem>
                {PAPEIS.map((p) => (
                  <MenuItem key={p.key} value={p.key}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Tipo do vínculo"
              value={vinculoForm.tipo_vinculo}
              onChange={(e) => setVinculoForm((f) => ({ ...f, tipo_vinculo: e.target.value }))}
              fullWidth
              required
              placeholder="Ex.: TED 50/2023, Contrato, Processa dados em nome de"
            />
            {editingVinculo && (
              <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteVinculo(editingVinculo)} disabled={saving} sx={{ alignSelf: "flex-start" }}>
                Excluir conexão
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setVinculoDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveVinculo}
            disabled={
              saving ||
              !vinculoForm.tipo_vinculo.trim() ||
              !vinculoForm.instituicao_origem_id ||
              (!vinculoForm.instituicao_destino_id && !vinculoForm.destino_tipo_papel)
            }
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
