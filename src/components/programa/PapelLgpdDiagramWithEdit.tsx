"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Skeleton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import * as dataService from "@/lib/services/dataService";
import type { PapelLgpdInstituicao, PapelLgpdVinculo } from "@/lib/services/dataService";
import { PapelLgpdDiagram } from "./PapelLgpdDiagram";

const PAPEIS = [
  { key: "controlador" as const, label: "Controlador" },
  { key: "contratante" as const, label: "Contratante" },
  { key: "operador" as const, label: "Operador" },
] as const;

interface PapelLgpdDiagramWithEditProps {
  programaId: number;
  idOrSlug: string;
  isDemoMode?: boolean;
}

export function PapelLgpdDiagramWithEdit({ programaId, idOrSlug, isDemoMode }: PapelLgpdDiagramWithEditProps) {
  const [data, setData] = useState<dataService.PapelLgpdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [instDialogOpen, setInstDialogOpen] = useState(false);
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<PapelLgpdInstituicao | null>(null);
  const [editingVinculo, setEditingVinculo] = useState<PapelLgpdVinculo | null>(null);
  const [instForm, setInstForm] = useState({ nome: "", descricao: "", contato: "", email: "", site: "" });
  const [vinculoForm, setVinculoForm] = useState({
    instituicao_origem_id: "" as number | "",
    instituicao_destino_id: "" as number | "",
    destino_tipo_papel: "" as string | "",
    tipo_vinculo: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (isDemoMode) return;
    setLoading(true);
    try {
      const d = await dataService.fetchPapelLgpd(programaId);
      setData(d);
    } catch (e) {
      setData({ instituicoes: [], vinculos: [] });
    } finally {
      setLoading(false);
    }
  }, [programaId, isDemoMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenEditInst = useCallback((inst: PapelLgpdInstituicao) => {
    setEditingInst(inst);
    setInstForm({
      nome: inst.nome,
      descricao: inst.descricao || "",
      contato: inst.contato || "",
      email: inst.email || "",
      site: inst.site || "",
    });
    setInstDialogOpen(true);
  }, []);

  const handleOpenEditVinculo = useCallback((v: PapelLgpdVinculo) => {
    setEditingVinculo(v);
    setVinculoForm({
      instituicao_origem_id: v.instituicao_origem_id,
      instituicao_destino_id: v.instituicao_destino_id ?? ("" as ""),
      destino_tipo_papel: (v.destino_tipo_papel ?? "") as "" | "controlador" | "contratante" | "operador",
      tipo_vinculo: v.tipo_vinculo,
    });
    setVinculoDialogOpen(true);
  }, []);

  const handleSaveInst = async () => {
    if (!editingInst || !instForm.nome.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.updatePapelLgpdInstituicao(programaId, editingInst.id, {
        nome: instForm.nome.trim(),
        descricao: instForm.descricao.trim() || null,
        contato: instForm.contato.trim() || null,
        email: instForm.email.trim() || null,
        site: instForm.site.trim() || null,
      });
      await fetchData();
      setInstDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInst = async () => {
    if (!editingInst || !confirm(`Excluir "${editingInst.nome}"?`)) return;
    setSaving(true);
    try {
      await dataService.deletePapelLgpdInstituicao(programaId, editingInst.id);
      await fetchData();
      setInstDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVinculo = async () => {
    if (!editingVinculo || !vinculoForm.tipo_vinculo.trim()) return;
    const destId = vinculoForm.instituicao_destino_id;
    const destPapel = vinculoForm.destino_tipo_papel;
    if (!destId && !destPapel) return;
    if (destId && destPapel) return;
    setSaving(true);
    setError(null);
    try {
      await dataService.updatePapelLgpdVinculo(programaId, editingVinculo.id, {
        instituicao_origem_id: Number(vinculoForm.instituicao_origem_id),
        instituicao_destino_id: destId ? Number(destId) : null,
        destino_tipo_papel: destPapel || null,
        tipo_vinculo: vinculoForm.tipo_vinculo.trim(),
      });
      await fetchData();
      setVinculoDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVinculo = async () => {
    if (!editingVinculo || !confirm("Excluir este vínculo?")) return;
    setSaving(true);
    try {
      await dataService.deletePapelLgpdVinculo(programaId, editingVinculo.id);
      await fetchData();
      setVinculoDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir");
    } finally {
      setSaving(false);
    }
  };

  const instituicoes = data?.instituicoes || [];

  if (isDemoMode) {
    return <PapelLgpdDiagram programaId={programaId} idOrSlug={idOrSlug} isDemoMode />;
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
        <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <>
      <PapelLgpdDiagram
        programaId={programaId}
        idOrSlug={idOrSlug}
        data={data}
        onNodeClick={handleOpenEditInst}
        onEdgeClick={handleOpenEditVinculo}
      />

      {/* Dialog Editar Instituição */}
      <Dialog open={instDialogOpen} onClose={() => setInstDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Editar instituição</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={instForm.nome} onChange={(e) => setInstForm((f) => ({ ...f, nome: e.target.value }))} fullWidth required />
            <TextField label="Descrição" value={instForm.descricao} onChange={(e) => setInstForm((f) => ({ ...f, descricao: e.target.value }))} fullWidth multiline rows={2} />
            <TextField label="Contato" value={instForm.contato} onChange={(e) => setInstForm((f) => ({ ...f, contato: e.target.value }))} fullWidth />
            <TextField label="Email" type="email" value={instForm.email} onChange={(e) => setInstForm((f) => ({ ...f, email: e.target.value }))} fullWidth />
            <TextField label="Site" value={instForm.site} onChange={(e) => setInstForm((f) => ({ ...f, site: e.target.value }))} fullWidth />
            <Button color="error" startIcon={<DeleteIcon />} onClick={handleDeleteInst} disabled={saving} sx={{ alignSelf: "flex-start" }}>
              Excluir instituição
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInstDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveInst} disabled={saving || !instForm.nome.trim()}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar Vínculo */}
      <Dialog open={vinculoDialogOpen} onClose={() => setVinculoDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Editar conexão</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
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
            <Button color="error" startIcon={<DeleteIcon />} onClick={handleDeleteVinculo} disabled={saving} sx={{ alignSelf: "flex-start" }}>
              Excluir conexão
            </Button>
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
    </>
  );
}
