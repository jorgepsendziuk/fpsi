"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Checklist as ChecklistIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminConfirmDialog, AdminPageAlert } from "@/components/admin/AdminDialogs";
import { adminDataGridLocaleText, adminDataGridSx } from "@/components/admin/adminDataGrid";
import { useAdminCrudMessages, adminFetchJson } from "@/components/admin/useAdminCrud";

interface Medida {
  id: number;
  id_medida: string | null;
  id_controle: number | null;
  id_cisv8: string | null;
  grupo_imple: string | null;
  funcao_nist_csf: string | null;
  medida: string | null;
  descricao: string | null;
}

interface Controle {
  id: number;
  nome: string | null;
  numero: number | null;
}

const emptyForm = {
  id_medida: "",
  id_controle: "",
  id_cisv8: "",
  grupo_imple: "",
  funcao_nist_csf: "",
  medida: "",
  descricao: "",
};

export default function AdminMedidasPage() {
  const [rows, setRows] = useState<Medida[]>([]);
  const [controles, setControles] = useState<Controle[]>([]);
  const [controleFilter, setControleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Medida | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { error, success, setError, setSuccess, clearMessages, handleApiError } = useAdminCrudMessages();

  const controleMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of controles) {
      map.set(c.id, c.numero != null ? `${c.numero} — ${c.nome ?? ""}` : c.nome ?? `Controle ${c.id}`);
    }
    return map;
  }, [controles]);

  const loadControles = useCallback(async () => {
    try {
      const data = await adminFetchJson<Controle[]>("/api/admin/controles");
      setControles(data);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (controleFilter) params.set("controle_id", controleFilter);
      if (search.trim()) params.set("q", search.trim());
      const data = await adminFetchJson<Medida[]>(`/api/admin/medidas?${params.toString()}`);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [controleFilter, search, setError]);

  useEffect(() => {
    void loadControles();
  }, [loadControles]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ ...emptyForm, id_controle: controleFilter || "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Medida) => {
    clearMessages();
    setEditing(row);
    setForm({
      id_medida: row.id_medida ?? "",
      id_controle: row.id_controle != null ? String(row.id_controle) : "",
      id_cisv8: row.id_cisv8 ?? "",
      grupo_imple: row.grupo_imple ?? "",
      funcao_nist_csf: row.funcao_nist_csf ?? "",
      medida: row.medida ?? "",
      descricao: row.descricao ?? "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.medida.trim()) {
      setError("Texto da medida é obrigatório.");
      return;
    }
    setSaving(true);
    clearMessages();
    const payload = {
      id_medida: form.id_medida.trim() || null,
      id_controle: form.id_controle ? Number(form.id_controle) : null,
      id_cisv8: form.id_cisv8.trim() || null,
      grupo_imple: form.grupo_imple.trim() || null,
      funcao_nist_csf: form.funcao_nist_csf.trim() || null,
      medida: form.medida.trim(),
      descricao: form.descricao.trim() || null,
    };
    try {
      if (editing) {
        await adminFetchJson(`/api/admin/medidas/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Medida atualizada.");
      } else {
        await adminFetchJson("/api/admin/medidas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Medida criada.");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setSaving(true);
    clearMessages();
    try {
      const res = await fetch(`/api/admin/medidas/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        await handleApiError(res, "Erro ao excluir — verifique respostas de programas vinculadas.");
        return;
      }
      setSuccess("Medida excluída.");
      setDeleteId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "id_medida", headerName: "ID Medida", width: 110 },
    {
      field: "id_controle",
      headerName: "Controle",
      width: 200,
      valueGetter: (_v, row) => (row.id_controle != null ? controleMap.get(row.id_controle) ?? row.id_controle : "—"),
    },
    { field: "grupo_imple", headerName: "GI", width: 70 },
    { field: "id_cisv8", headerName: "CIS v8", width: 90 },
    { field: "medida", headerName: "Medida", flex: 1, minWidth: 280 },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<Edit />} label="Editar" onClick={() => openEdit(row as Medida)} />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="Excluir" onClick={() => setDeleteId(row.id as number)} />,
      ],
    },
  ];

  return (
    <Container maxWidth="xl">
      <PageHeroHeader
        title="Medidas"
        icon={<ChecklistIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Perguntas e critérios do framework, vinculadas a controles."
        trailing={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Nova medida
          </Button>
        }
      />

      <AdminPageAlert error={error} success={success} onClearError={() => setError(null)} onClearSuccess={() => setSuccess(null)} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 280 }}>
          <InputLabel>Controle</InputLabel>
          <Select value={controleFilter} label="Controle" onChange={(e) => setControleFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {controles.map((c) => (
              <MenuItem key={c.id} value={String(c.id)}>
                {controleMap.get(c.id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField size="small" label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
      </Stack>

      <Box sx={{ height: 620, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          localeText={adminDataGridLocaleText}
          sx={adminDataGridSx}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "Editar medida" : "Nova medida"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="ID Medida" value={form.id_medida} onChange={(e) => setForm((f) => ({ ...f, id_medida: e.target.value }))} fullWidth />
              <FormControl fullWidth>
                <InputLabel>Controle</InputLabel>
                <Select label="Controle" value={form.id_controle} onChange={(e) => setForm((f) => ({ ...f, id_controle: e.target.value }))}>
                  <MenuItem value="">—</MenuItem>
                  {controles.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {controleMap.get(c.id)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="CIS v8" value={form.id_cisv8} onChange={(e) => setForm((f) => ({ ...f, id_cisv8: e.target.value }))} fullWidth />
              <TextField label="Grupo impl." value={form.grupo_imple} onChange={(e) => setForm((f) => ({ ...f, grupo_imple: e.target.value }))} fullWidth />
              <TextField label="Função NIST CSF" value={form.funcao_nist_csf} onChange={(e) => setForm((f) => ({ ...f, funcao_nist_csf: e.target.value }))} fullWidth />
            </Stack>
            <TextField label="Medida (pergunta)" value={form.medida} onChange={(e) => setForm((f) => ({ ...f, medida: e.target.value }))} fullWidth multiline minRows={2} autoFocus />
            <TextField label="Descrição / orientação" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogActions>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId != null}
        title="Excluir medida?"
        message="Respostas de programas podem impedir a exclusão."
        loading={saving}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Container>
  );
}
