"use client";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridActionsCellItem } from "@mui/x-data-grid";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { Save, Cancel, Edit, Delete, Add } from "@mui/icons-material";
import { Button, Box } from "@mui/material";
import type { Responsavel } from "./types";

const Responsavel = ({ programa, onUpdate }: { programa: number, onUpdate?: () => void }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const fetchResponsaveis = async () => {
    const { data } = await supabaseBrowserClient
      .from("responsavel")
      .select("*")
      .eq("programa", programa)
      .order("id", { ascending: true });
    setRows(data || []);
    if (onUpdate) onUpdate();
  };

  useEffect(() => {
    fetchResponsaveis();
  }, [programa]);

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
    if (onUpdate) onUpdate();
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
    if (onUpdate) onUpdate();
  };

  const handleAddClick = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const newRow = { id: newId, nome: "", departamento: "", email: "", programa, isNew: true };
    setRows((prevRows) => [...prevRows, newRow]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newId]: { mode: GridRowModes.Edit }
    }));
  };

  const handleProcessRowUpdate = async (newRow: any) => {
    const updatedRow = { ...newRow };
    delete updatedRow.isNew;  // Remove the isNew flag before database operations
    
    if (newRow.isNew) {
      // This is a new row, perform insert
      const { data, error } = await supabaseBrowserClient
        .from("responsavel")
        .insert([updatedRow])
        .select()
        .single();
        
      if (error) {
        console.error("Insert error:", error);
        return newRow;
      }
      
      // Update the row with the actual database ID
      const finalRow = { ...data };
      setRows(rows.map((row) => (row.id === newRow.id ? finalRow : row)));
      if (onUpdate) onUpdate();
      return finalRow;
    } else {
      // This is an existing row, perform update
      const { error } = await supabaseBrowserClient
        .from("responsavel")
        .update(updatedRow)
        .eq("id", newRow.id);
        
      if (error) {
        console.error("Update error:", error);
        return newRow;
      }
      
      setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
      if (onUpdate) onUpdate();
      return updatedRow;
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 0.1, editable: false },
    { field: "nome", headerName: "Nome", flex: 0.3, editable: true },
    { field: "departamento", headerName: "Departamento", flex: 0.3, editable: true },
    { field: "email", headerName: "Email", flex: 0.3, editable: true },
    { field: "actions", headerName: "Ações", flex: 0.2, minWidth: 30, type: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem key={`save-${id}`} icon={<Save />} label="Salvar" onClick={handleSaveClick(id)} />,
            <GridActionsCellItem key={`cancel-${id}`} icon={<Cancel />} label="Cancelar" onClick={handleCancelClick(id)} />,
          ];
        }

        return [
          <GridActionsCellItem key={`edit-${id}`} icon={<Edit />} label="Editar" onClick={handleEditClick(id)} />,
          <GridActionsCellItem key={`delete-${id}`} icon={<Delete />} label="Deletar" onClick={handleDeleteClick(id)} />,
        ];
      },
    },
  ];

  return (
    <Box>
      <Button id="add-responsavel"
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
