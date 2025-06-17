// React
import React from 'react';

// Material UI components
import { Box, Button } from '@mui/material';

// Material UI Data Grid
import { 
  DataGrid, 
  GridColDef, 
  GridRowModesModel,
  GridRowModes,
  GridActionsCellItem
} from '@mui/x-data-grid';

// Material UI icons
import { Save, Cancel, Edit, Delete, Add } from '@mui/icons-material';

// Types
import { Responsavel } from '../../types';

// Styles
import { responsavelStyles } from './styles';

/**
 * Props for the Responsavel component
 */
export interface ResponsavelComponentProps {
  /** The rows data */
  rows: Responsavel[];
  /** Row modes model for editing */
  rowModesModel: GridRowModesModel;
  /** Handle row edit start */
  handleRowEditStart: (params: any, event: any) => void;
  /** Handle row edit stop */
  handleRowEditStop: (params: any, event: any) => void;
  /** Handle edit click */
  handleEditClick: (id: any) => () => void;
  /** Handle save click */
  handleSaveClick: (id: any) => () => Promise<void>;
  /** Handle cancel click */
  handleCancelClick: (id: any) => () => void;
  /** Handle delete click */
  handleDeleteClick: (id: any) => () => Promise<void>;
  /** Handle add click */
  handleAddClick: () => Promise<void>;
  /** Handle process row update */
  handleProcessRowUpdate: (newRow: Responsavel) => Promise<Responsavel>;
}

/**
 * ResponsavelComponent displays a data grid for managing responsibles
 */
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
  // Define columns for the data grid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60, editable: false },
    { field: 'nome', headerName: 'Nome', width: 180, editable: true },
    { field: 'departamento', headerName: 'Departamento', width: 180, editable: true },
    { field: 'email', headerName: 'Email', width: 200, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<Save />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<Cancel />}
              label="Cancel"
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label="Edit"
            onClick={handleEditClick(id)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label="Delete"
            onClick={handleDeleteClick(id)}
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={responsavelStyles.container}>
      <Box sx={responsavelStyles.header}>
        <Button
          sx={responsavelStyles.addButton}
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
        onProcessRowUpdateError={(error) => console.error(error)}
        autoHeight
        disableRowSelectionOnClick
        disableColumnMenu
        density="comfortable"
        hideFooter={true}
        sx={responsavelStyles.dataGrid}
        getRowHeight={() => 'auto'}
        getEstimatedRowHeight={() => 50}
      />
    </Box>
  );
};

export default ResponsavelComponent; 