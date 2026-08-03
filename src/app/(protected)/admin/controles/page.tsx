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
import { Security as SecurityIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminConfirmDialog, AdminPageAlert } from "@/components/admin/AdminDialogs";
import { adminDataGridLocaleText, adminDataGridSx } from "@/components/admin/adminDataGrid";
import { useAdminCrudMessages, adminFetchJson } from "@/components/admin/useAdminCrud";

interface Controle {
  id: number;
  numero: number | null;
  nome: string | null;
  diagnostico: number | null;
}

interface Diagnostico {
  id: number;
  descricao: string | null;
}

const emptyForm = { numero: "", nome: "", diagnostico: "" };

export default function AdminControlesPage() {
  const [rows, setRows] = useState<Controle[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [diagnosticoFilter, setDiagnosticoFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Controle | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { error, success, setError, setSuccess, clearMessages, handleApiError } = useAdminCrudMessages();

  const diagnosticoMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const d of diagnosticos) map.set(d.id, d.descricao || `Diagnóstico ${d.id}`);
    return map;
  }, [diagnosticos]);

  const loadDiagnosticos = useCallback(async () => {
    try {
      const data = await adminFetchJson<Diagnostico[]>("/api/admin/diagnosticos");
      setDiagnosticos(data);
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (diagnosticoFilter) params.set("diagnostico_id", diagnosticoFilter);
      if (search.trim()) params.set("q", search.trim());
      const data = await adminFetchJson<Controle[]>(`/api/admin/controles?${params.toString()}`);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [diagnosticoFilter, search, setError]);

  useEffect(() => {
    void loadDiagnosticos();
  }, [loadDiagnosticos]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ ...emptyForm, diagnostico: diagnosticoFilter || "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Controle) => {
    clearMessages();
    setEditing(row);
    setForm({
      numero: row.numero != null ? String(row.numero) : "",
      nome: row.nome ?? "",
      diagnostico: row.diagnostico != null ? String(row.diagnostico) : "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    clearMessages();
    const payload = {
      numero: form.numero ? Number(form.numero) : null,
      nome: form.nome.trim(),
      diagnostico: form.diagnostico ? Number(form.diagnostico) : null,
    };
    try {
      if (editing) {
        await adminFetchJson(`/api/admin/controles/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Controle atualizado.");
      } else {
        await adminFetchJson("/api/admin/controles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Controle criado.");
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
      const res = await fetch(`/api/admin/controles/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        await handleApiError(res, "Erro ao excluir — verifique se há medidas vinculadas.");
        return;
      }
      setSuccess("Controle excluído.");
      setDeleteId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "numero", headerName: "Nº", width: 70 },
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 260 },
    {
      field: "diagnostico",
      headerName: "Diagnóstico",
      width: 220,
      valueGetter: (_v, row) => (row.diagnostico != null ? diagnosticoMap.get(row.diagnostico) ?? row.diagnostico : "—"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<Edit />} label="Editar" onClick={() => openEdit(row as Controle)} />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="Excluir" onClick={() => setDeleteId(row.id as number)} />,
      ],
    },
  ];

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Controles"
        icon={<SecurityIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Catálogo global de controles do framework PPSI/AIGP."
        trailing={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo controle
          </Button>
        }
      />

      <AdminPageAlert error={error} success={success} onClearError={() => setError(null)} onClearSuccess={() => setSuccess(null)} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Diagnóstico</InputLabel>
          <Select value={diagnosticoFilter} label="Diagnóstico" onChange={(e) => setDiagnosticoFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {diagnosticos.map((d) => (
              <MenuItem key={d.id} value={String(d.id)}>
                {d.descricao || `Diagnóstico ${d.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField size="small" label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }} />
      </Stack>

      <Box sx={{ height: 560, width: "100%" }}>
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

      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar controle" : "Novo controle"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Número" type="number" value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} fullWidth />
            <TextField label="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} fullWidth autoFocus />
            <FormControl fullWidth>
              <InputLabel>Diagnóstico</InputLabel>
              <Select label="Diagnóstico" value={form.diagnostico} onChange={(e) => setForm((f) => ({ ...f, diagnostico: e.target.value }))}>
                <MenuItem value="">—</MenuItem>
                {diagnosticos.map((d) => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.descricao || `Diagnóstico ${d.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogActions>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId != null}
        title="Excluir controle?"
        message="Medidas e vínculos com programas podem impedir a exclusão."
        loading={saving}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Container>
  );
}
