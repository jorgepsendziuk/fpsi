import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';
import { ResponsavelComponent } from '@app/diagnostico/components/ResponsavelComponent';
import { useResponsavelGrid } from '@app/diagnostico/hooks/useResponsavelGrid';
import { validateResponsavel } from '@app/diagnostico/utils/validations';

jest.mock('../../components/ResponsavelComponent');
jest.mock('../../hooks/useResponsavelGrid');
jest.mock('../../utils/validations');

describe('ResponsavelContainer Integration', () => {
  const mockProps = {
    programa: 1,
    responsaveis: [
      {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
    ],
    handleResponsavelAdd: jest.fn(),
    handleResponsavelEdit: jest.fn(),
    handleResponsavelDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: mockProps.responsaveis,
      loading: false,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    (validateResponsavel as jest.Mock).mockReturnValue({ isValid: true, errors: [] });
    (ResponsavelComponent as jest.Mock).mockImplementation(({ children, ...props }) => (
      <div data-testid="responsavel-component" {...props}>
        {children}
      </div>
    ));
  });

  it('should integrate with ResponsavelComponent', () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    const component = screen.getByTestId('responsavel-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('data-grid-data', JSON.stringify(mockProps.responsaveis));
  });

  it('should handle grid data updates', async () => {
    const { rerender } = render(<ResponsavelContainer {...mockProps} />);
    
    // Simula atualização de dados
    const newResponsaveis = [
      ...mockProps.responsaveis,
      {
        id: 2,
        nome: 'Novo Responsável',
        email: 'novo@exemplo.com',
        cargo: 'Novo Cargo',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
    ];
    
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: newResponsaveis,
      loading: false,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    rerender(<ResponsavelContainer {...mockProps} />);
    
    await waitFor(() => {
      const component = screen.getByTestId('responsavel-component');
      expect(component).toHaveAttribute('data-grid-data', JSON.stringify(newResponsaveis));
    });
  });

  it('should handle grid actions integration', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    // Simula ação de adicionar
    const addButton = screen.getByText('Adicionar Responsável');
    fireEvent.click(addButton);
    
    const nomeInput = screen.getByLabelText('Nome');
    const emailInput = screen.getByLabelText('Email');
    const cargoInput = screen.getByLabelText('Cargo');
    
    fireEvent.change(nomeInput, { target: { value: 'Novo Responsável' } });
    fireEvent.change(emailInput, { target: { value: 'novo@exemplo.com' } });
    fireEvent.change(cargoInput, { target: { value: 'Novo Cargo' } });
    
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(validateResponsavel).toHaveBeenCalledWith({
        nome: 'Novo Responsável',
        email: 'novo@exemplo.com',
        cargo: 'Novo Cargo',
      });
      expect(mockProps.handleResponsavelAdd).toHaveBeenCalledWith({
        nome: 'Novo Responsável',
        email: 'novo@exemplo.com',
        cargo: 'Novo Cargo',
      });
    });
    
    // Simula ação de editar
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);
    
    fireEvent.change(nomeInput, { target: { value: 'Responsável Editado' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(validateResponsavel).toHaveBeenCalledWith({
        id: 1,
        nome: 'Responsável Editado',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
      });
      expect(mockProps.handleResponsavelEdit).toHaveBeenCalledWith(1, {
        nome: 'Responsável Editado',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
      });
    });
    
    // Simula ação de excluir
    const deleteButton = screen.getByText('Excluir');
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockProps.handleResponsavelDelete).toHaveBeenCalledWith(1);
    });
  });

  it('should handle validation integration', async () => {
    (validateResponsavel as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Nome é obrigatório', 'Email inválido'],
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    const addButton = screen.getByText('Adicionar Responsável');
    fireEvent.click(addButton);
    
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(mockProps.handleResponsavelAdd).not.toHaveBeenCalled();
    });
  });

  it('should handle error propagation', async () => {
    (useResponsavelGrid as jest.Mock).mockImplementation(() => {
      throw new Error('Erro de integração');
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro de integração')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: [],
      loading: true,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    
    // Simula carregamento completo
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: mockProps.responsaveis,
      loading: false,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
  });

  it('should handle prop changes', async () => {
    const { rerender } = render(<ResponsavelContainer {...mockProps} />);
    
    // Simula mudança de props
    const newProps = {
      ...mockProps,
      responsaveis: [
        {
          ...mockProps.responsaveis[0],
          nome: 'Responsável Atualizado',
        },
      ],
    };
    
    rerender(<ResponsavelContainer {...newProps} />);
    
    await waitFor(() => {
      const component = screen.getByTestId('responsavel-component');
      expect(component).toHaveAttribute('data-grid-data', JSON.stringify(newProps.responsaveis));
    });
  });
}); 