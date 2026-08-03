"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Category as CategoryIcon } from "@mui/icons-material";
import { PageHeroHeader } from "@/components/common/PageHeroHeader";
import { AdminConfirmDialog, AdminPageAlert } from "@/components/admin/AdminDialogs";
import { adminDataGridLocaleText, adminDataGridSx } from "@/components/admin/adminDataGrid";
import { useAdminCrudMessages, adminFetchJson } from "@/components/admin/useAdminCrud";

interface Diagnostico {
  id: number;
  descricao: string | null;
  cor: string | null;
  indice: string | null;
  maturidade: number | null;
}

const emptyForm = { descricao: "", cor: "#2196F3", indice: "", maturidade: "" };

export default function AdminDiagnosticosPage() {
  const [rows, setRows] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Diagnostico | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { error, success, setError, setSuccess, clearMessages, handleApiError } = useAdminCrudMessages();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetchJson<Diagnostico[]>("/api/admin/diagnosticos");
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    clearMessages();
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (row: Diagnostico) => {
    clearMessages();
    setEditing(row);
    setForm({
      descricao: row.descricao ?? "",
      cor: row.cor ?? "#2196F3",
      indice: row.indice ?? "",
      maturidade: row.maturidade != null ? String(row.maturidade) : "",
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.descricao.trim()) {
      setError("Descrição é obrigatória.");
      return;
    }
    setSaving(true);
    clearMessages();
    const payload = {
      descricao: form.descricao.trim(),
      cor: form.cor.trim() || null,
      indice: form.indice.trim() || null,
      maturidade: form.maturidade ? Number(form.maturidade) : null,
    };
    try {
      if (editing) {
        await adminFetchJson(`/api/admin/diagnosticos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Diagnóstico atualizado.");
      } else {
        await adminFetchJson("/api/admin/diagnosticos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setSuccess("Diagnóstico criado.");
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
      const res = await fetch(`/api/admin/diagnosticos/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        await handleApiError(res, "Erro ao excluir — verifique se há controles vinculados.");
        return;
      }
      setSuccess("Diagnóstico excluído.");
      setDeleteId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "descricao", headerName: "Descrição", flex: 1, minWidth: 220 },
    {
      field: "cor",
      headerName: "Cor",
      width: 120,
      renderCell: ({ value }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {value && <Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: String(value) }} />}
          {value ?? "—"}
        </Box>
      ),
    },
    { field: "indice", headerName: "Índice", width: 100 },
    { field: "maturidade", headerName: "Maturidade", width: 110 },
    {
      field: "actions",
      type: "actions",
      headerName: "Ações",
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem key="edit" icon={<Edit />} label="Editar" onClick={() => openEdit(row as Diagnostico)} />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="Excluir" onClick={() => setDeleteId(row.id as number)} />,
      ],
    },
  ];

  return (
    <Container maxWidth="lg">
      <PageHeroHeader
        title="Diagnósticos"
        icon={<CategoryIcon sx={{ fontSize: 30 }} aria-hidden />}
        description="Domínios do framework (estruturação, segurança, privacidade, governança IA)."
        trailing={
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Novo
          </Button>
        }
      />

      <AdminPageAlert error={error} success={success} onClearError={() => setError(null)} onClearSuccess={() => setSuccess(null)} />

      <Box sx={{ height: 420, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          localeText={adminDataGridLocaleText}
          sx={adminDataGridSx}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Editar diagnóstico" : "Novo diagnóstico"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Descrição" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} fullWidth autoFocus />
            <TextField label="Cor (hex)" value={form.cor} onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value }))} fullWidth />
            <TextField label="Índice" value={form.indice} onChange={(e) => setForm((f) => ({ ...f, indice: e.target.value }))} fullWidth />
            <TextField label="Maturidade" type="number" value={form.maturidade} onChange={(e) => setForm((f) => ({ ...f, maturidade: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={() => void save()} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogActions>
      </Dialog>

      <AdminConfirmDialog
        open={deleteId != null}
        title="Excluir diagnóstico?"
        message="Controles vinculados impedirão a exclusão. Esta ação não pode ser desfeita."
        loading={saving}
        onClose={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Container>
  );
}
