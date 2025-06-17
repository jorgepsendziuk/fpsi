import React from 'react';
import { DataGrid, GridColDef, GridRowModesModel, GridActionsCellItem } from '@mui/x-data-grid';
import { Save, Cancel, Edit, Delete, Add } from '@mui/icons-material';
import { Button, Box } from '@mui/material';
import type { Responsavel } from '../../app/diagnostico/types';

interface ResponsavelComponentProps {
  rows: Responsavel[];
  rowModesModel: GridRowModesModel;
  handleRowEditStart: (params: any, event: any) => void;
  handleRowEditStop: (params: any, event: any) => void;
  handleEditClick: (id: any) => () => void;
  handleSaveClick: (id: any) => () => void;
  handleCancelClick: (id: any) => () => void;
  handleDeleteClick: (id: any) => () => void;
  handleAddClick: () => void;
  handleProcessRowUpdate: (newRow: Responsavel) => Promise<Responsavel>;
}

const ResponsavelComponent: React.FC<ResponsavelComponentProps> = ({
  rows,
  rowModesModel,
  handleRowEditStart,
  handleRowEditStop,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleDeleteClick,
  handleAddClick,
  handleProcessRowUpdate,
}) => {
  const columns: GridColDef[] = [
    {
      field: 'nome',
      headerName: 'Nome',
      width: 200,
      editable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      editable: true,
    },
    {
      field: 'departamento',
      headerName: 'Departamento',
      width: 200,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === 'edit';

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<Save />}
              label="Salvar"
              sx={{ color: 'primary.main' }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<Cancel />}
              label="Cancelar"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label="Editar"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label="Excluir"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
        >
          Adicionar Responsável
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={handleProcessRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </Box>
  );
};

// Named export for tests
export { ResponsavelComponent };

export default ResponsavelComponent; 