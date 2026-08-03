"use client";

import { useState, useEffect, useCallback } from "react";
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
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminConfirmDialog, AdminPageAlert } from "@/components/admin/AdminDialogs";
import { adminDataGridLocaleText, adminDataGridSx } from "@/components/admin/adminDataGrid";
import { useAdminCrudMessages, adminFetchJson } from "@/components/admin/useAdminCrud";

type SimpleEntity = { id: number; nome: string; ativo: boolean | null };

export default function AdminSimpleEntityPage({
  title,
  description,
  icon,
  apiPath,
  entityLabel,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  apiPath: "cargos" | "departamentos";
  entityLabel: string;
}) {
  const [rows, setRows] = useState<SimpleEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SimpleEntity | null>(null);
  const [form, setForm] = useState({ nome: "", ativo: true });
  const { error, success, setError, setSuccess, clearMessages, handleApiError } = useAdminCrudMessages();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchJson<SimpleEntity[]>(`/api/admin/${apiPath}`);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [apiPath, setError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm({ nome: "", ativo: true });
    setDialogOpen(true);
  };

  const openEdit = (row: SimpleEntity) => {
    clearMessages();
    setEditing(row);
    setForm({ nome: row.nome, ativo: row.ativo !== false });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.nome.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    setSaving(true);
    clearMessages();
    try {
      if (editing) {
        await adminFetchJson(`/api/admin/${apiPath}/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setSuccess(`${entityLabel} atualizado.`);
      } else {
        await adminFetchJson(`/api/admin/${apiPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setSuccess(`${entityLabel} criado.`);
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
      const res = await fetch(`/api/admin/${apiPath}/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        await handleApiError(res, "Erro ao excluir");
        return;
      }
      setSuccess(`${entityLabel} excluído.`);
      setDeleteId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "nome", headerName: "Nome", flex: 1, minWidth: 200 },
    {
      field: "ativo",
      headerName: "Ativo",
      width: 100,
      valueGetter: (_v, row) => (row.ativo !== false ? "Sim" : "Não"),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<Edit />} label="Editar" onClick={() => openEdit(row as SimpleEntity)} />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="Excluir" onClick={() => setDeleteId(row.id as number)} />,
      ],
    },
  ];

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title={title}
        icon={icon}
        description={description}
        trailing={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo
          </Button>
        }
      />

      <AdminPageAlert error={error} success={success} onClearError={() => setError(null)} onClearSuccess={() => setSuccess(null)} />

      <Box sx={{ height: 520, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          localeText={adminDataGridLocaleText}
          sx={adminDataGridSx}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? `Editar ${entityLabel.toLowerCase()}` : `Novo ${entityLabel.toLowerCase()}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              fullWidth
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel>Ativo</InputLabel>
              <Select
                label="Ativo"
                value={form.ativo ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.value === "true" }))}
              >
                <MenuItem value="true">Sim</MenuItem>
                <MenuItem value="false">Não</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId != null}
        title={`Excluir ${entityLabel.toLowerCase()}?`}
        message="Esta ação não pode ser desfeita. Perfis vinculados podem impedir a exclusão."
        loading={saving}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Container>
  );
}
