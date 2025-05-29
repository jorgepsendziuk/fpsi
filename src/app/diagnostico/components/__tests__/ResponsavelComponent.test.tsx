import { render, screen, fireEvent } from '@testing-library/react';
import ResponsavelComponent from '../ResponsavelComponent';

describe('ResponsavelComponent', () => {
  const mockProps = {
    responsavel: {
      id: 1,
      nome: 'Responsável Teste',
      email: 'responsavel@teste.com',
      cargo: 'Cargo Teste',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    onEditResponsavel: jest.fn(),
    onDeleteResponsavel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ResponsavelComponent {...mockProps} />);

    expect(screen.getByText('Responsável Teste')).toBeInTheDocument();
    expect(screen.getByText('responsavel@teste.com')).toBeInTheDocument();
    expect(screen.getByText('Cargo Teste')).toBeInTheDocument();
  });

  it('should handle edit responsavel', () => {
    render(<ResponsavelComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockProps.onEditResponsavel).toHaveBeenCalledWith(mockProps.responsavel);
  });

  it('should handle delete responsavel', () => {
    render(<ResponsavelComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockProps.onDeleteResponsavel).toHaveBeenCalledWith(1);
  });

  it('should handle inactive status', () => {
    const propsWithInactiveStatus = {
      ...mockProps,
      responsavel: {
        ...mockProps.responsavel,
        status: 'inativo',
      },
    };

    render(<ResponsavelComponent {...propsWithInactiveStatus} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<ResponsavelComponent {...mockProps} loading={true} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ResponsavelComponent {...mockProps} error="Erro ao carregar responsável" />);

    expect(screen.getByText('Erro ao carregar responsável')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const propsWithLongText = {
      ...mockProps,
      responsavel: {
        ...mockProps.responsavel,
        nome: 'a'.repeat(100),
        email: 'a'.repeat(100) + '@teste.com',
        cargo: 'a'.repeat(100),
      },
    };

    render(<ResponsavelComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(100) + '@teste.com')).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
  });
}); 