import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridRowModes } from '@mui/x-data-grid';
import ResponsavelComponent from '../ResponsavelComponent';

describe('ResponsavelComponent', () => {
  const mockProps = {
    rows: [
      {
        id: 1,
        programa: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        departamento: 'TI',
      },
    ],
    rowModesModel: {},
    handleRowEditStart: jest.fn(),
    handleRowEditStop: jest.fn(),
    handleEditClick: jest.fn(),
    handleSaveClick: jest.fn(),
    handleCancelClick: jest.fn(),
    handleDeleteClick: jest.fn(),
    handleAddClick: jest.fn(),
    handleProcessRowUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render DataGrid with responsaveis', () => {
    render(<ResponsavelComponent {...mockProps} />);
    
    expect(screen.getByText('Responsável Teste')).toBeInTheDocument();
    expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('TI')).toBeInTheDocument();
  });

  it('should handle add responsavel', () => {
    render(<ResponsavelComponent {...mockProps} />);
    
    const addButton = screen.getByText('Adicionar Responsável');
    fireEvent.click(addButton);
    
    expect(mockProps.handleAddClick).toHaveBeenCalled();
  });

  it('should handle edit mode', () => {
    const editModeProps = {
      ...mockProps,
      rowModesModel: { 1: { mode: GridRowModes.Edit } },
    };
    
    render(<ResponsavelComponent {...editModeProps} />);
    
    // Should show save/cancel buttons in edit mode
    expect(screen.getByLabelText('Salvar')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancelar')).toBeInTheDocument();
  });

  it('should handle view mode', () => {
    render(<ResponsavelComponent {...mockProps} />);
    
    // Should show edit/delete buttons in view mode
    expect(screen.getByLabelText('Editar')).toBeInTheDocument();
    expect(screen.getByLabelText('Excluir')).toBeInTheDocument();
  });

  it('should handle empty rows', () => {
    const emptyProps = {
      ...mockProps,
      rows: [],
    };
    
    render(<ResponsavelComponent {...emptyProps} />);
    
    // DataGrid should still render with add button
    expect(screen.getByText('Adicionar Responsável')).toBeInTheDocument();
  });
}); 