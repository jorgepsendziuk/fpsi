import { SxProps, Theme } from '@mui/material';

interface ResponsavelStyles {
  container: SxProps<Theme>;
  header: SxProps<Theme>;
  addButton: SxProps<Theme>;
  dataGrid: SxProps<Theme>;
}

export const responsavelStyles: ResponsavelStyles = {
  container: {
    width: '100%',
    mb: 2,
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    mb: 1,
  },
  addButton: {
    backgroundColor: '#1976d2',
    color: 'white',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
  dataGrid: {
    '& .MuiDataGrid-cell--editing': {
      backgroundColor: 'rgb(255,215,115, 0.19)',
      color: '#1a3e72',
    },
    '& .Mui-error': {
      backgroundColor: `rgb(126,10,15, 0.1)`,
    },
    '& .MuiDataGrid-footerContainer': {
      display: 'none',
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
      fontWeight: 'bold',
    },
    '& .MuiDataGrid-cell': {
      padding: '8px',
    },
    borderRadius: 2,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    width: '100%',
    height: 'auto',
    minHeight: '200px',
    maxHeight: '400px',
    overflow: 'auto',
    '& .MuiDataGrid-row:last-child': {
      borderBottom: 'none',
    },
  },
}; 