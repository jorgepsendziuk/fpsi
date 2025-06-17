import { render, screen, fireEvent } from '@testing-library/react';
import ProgramaComponent from '../ProgramaComponent';

describe('ProgramaComponent', () => {
  const mockProps = {
    programa: {
      id: 1,
      nome: 'Programa Teste',
      descricao: 'Descrição do programa',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    onEditPrograma: jest.fn(),
    onDeletePrograma: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ProgramaComponent {...mockProps} />);

    expect(screen.getByText('Programa Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do programa')).toBeInTheDocument();
  });

  it('should handle edit programa', () => {
    render(<ProgramaComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockProps.onEditPrograma).toHaveBeenCalledWith(mockProps.programa);
  });

  it('should handle delete programa', () => {
    render(<ProgramaComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockProps.onDeletePrograma).toHaveBeenCalledWith(1);
  });

  it('should handle inactive status', () => {
    const propsWithInactiveStatus = {
      ...mockProps,
      programa: {
        ...mockProps.programa,
        status: 'inativo',
      },
    };

    render(<ProgramaComponent {...propsWithInactiveStatus} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<ProgramaComponent {...mockProps} loading={true} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ProgramaComponent {...mockProps} error="Erro ao carregar programa" />);

    expect(screen.getByText('Erro ao carregar programa')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const propsWithLongText = {
      ...mockProps,
      programa: {
        ...mockProps.programa,
        nome: 'a'.repeat(100),
        descricao: 'a'.repeat(1000),
      },
    };

    render(<ProgramaComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
}); 