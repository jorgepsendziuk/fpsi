"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridActionsCellItem } from "@mui/x-data-grid";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { Save, Cancel, Edit, Delete, Add } from "@mui/icons-material";
import { Button, Box } from "@mui/material";

const Responsavel = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  useEffect(() => {
    const fetchResponsaveis = async () => {
      const { data } = await supabaseBrowserClient
        .from("responsavel")
        .select("*")
        .order("id", { ascending: true });
      setRows(data || []);
    };

    fetchResponsaveis();
  }, []);

  const handleRowEditStart = (params: any, event: any) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params: any, event: any) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id: any) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: any) => async () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const row = rows.find((row) => row.id === id);
    await supabaseBrowserClient
      .from("responsavel")
      .update(row)
      .eq("id", id);
  };

  const handleCancelClick = (id: any) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View, ignoreModifications: true } });
  };

  const handleDeleteClick = (id: any) => async () => {
    await supabaseBrowserClient
      .from("responsavel")
      .delete()
      .eq("id", id);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleAddClick = () => {
    const newId = Math.max(...rows.map((row) => row.id)) + 1;
    setRows([...rows, { id: newId, nome: "", departamento: "", email: "", isNew: true }]);
    setRowModesModel({ ...rowModesModel, [newId]: { mode: GridRowModes.Edit } });
  };

  const handleProcessRowUpdate = (newRow: any) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "id", width: 150, editable: false },
    { field: "nome", headerName: "Nome", width: 150, editable: true },
    { field: "departamento", headerName: "Departamento", width: 150, editable: true },
    { field: "email", headerName: "Email", width: 200, editable: true },
    {
      field: "actions",
      headerName: "Ações",
      width: 150,
      type: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem icon={<Save />} label="Save" onClick={handleSaveClick(id)} />,
            <GridActionsCellItem icon={<Cancel />} label="Cancel" onClick={handleCancelClick(id)} />,
          ];
        }

        return [
          <GridActionsCellItem icon={<Edit />} label="Edit" onClick={handleEditClick(id)} />,
          <GridActionsCellItem icon={<Delete />} label="Delete" onClick={handleDeleteClick(id)} />,
        ];
      },
    },
  ];

  return (
    <Box>
      <Button
        startIcon={<Add />}
        onClick={handleAddClick}
        variant="contained"
        color="primary"
        sx={{ mb: 2 }}
      >
        Adicionar Responsável
      </Button>
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={handleProcessRowUpdate}
          hideFooter
        />
      </div>
    </Box>
  );
};

export default Responsavel;
