import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
};

jest.mock('@utils/supabase/client', () => ({
  supabaseBrowserClient: mockSupabase,
}));

// Mock ResponsavelComponent to avoid complex UI testing
jest.mock('../../components/ResponsavelComponent', () => {
  return function MockResponsavelComponent(props: any) {
    return (
      <div data-testid="responsavel-component">
        <div data-testid="responsavel-count">{props.rows?.length || 0}</div>
        {props.rows?.map((responsavel: any) => (
          <div key={responsavel.id} data-testid={`responsavel-${responsavel.id}`}>
            <span>{responsavel.nome}</span>
            <span>{responsavel.email}</span>
            <button onClick={() => props.handleDeleteClick(responsavel.id)()}>Delete</button>
          </div>
        ))}
        <button onClick={props.handleAddClick}>Add</button>
      </div>
    );
  };
});

describe('ResponsavelContainer', () => {
  const mockResponsaveis = [
    {
      id: 1,
      programa: 1,
      nome: 'Responsável Teste',
      email: 'teste@exemplo.com',
      departamento: 'TI',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.order.mockResolvedValue({ data: mockResponsaveis });
  });

  it('should render with responsaveis data', async () => {
    render(<ResponsavelContainer programa={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('responsavel-component')).toBeInTheDocument();
      expect(screen.getByTestId('responsavel-count')).toHaveTextContent('1');
      expect(screen.getByText('Responsável Teste')).toBeInTheDocument();
    });
  });

  it('should handle empty data', async () => {
    mockSupabase.order.mockResolvedValue({ data: [] });
    
    render(<ResponsavelContainer programa={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('responsavel-count')).toHaveTextContent('0');
    });
  });

  it('should handle add responsavel', async () => {
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.select.mockResolvedValue({ 
      data: [{ id: 2, programa: 1, nome: '', email: '', departamento: '' }], 
      error: null 
    });
    
    render(<ResponsavelContainer programa={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('responsavel-component')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockSupabase.insert).toHaveBeenCalledWith([{
        programa: 1,
        nome: '',
        email: '',
        departamento: ''
      }]);
    });
  });

  it('should handle delete responsavel', async () => {
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockResolvedValue({ data: null, error: null });
    
    render(<ResponsavelContainer programa={1} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('responsavel-1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1);
    });
  });
}); 