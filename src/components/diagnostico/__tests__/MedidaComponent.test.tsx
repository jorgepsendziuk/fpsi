import { render, screen, fireEvent } from '@testing-library/react';
import { MedidaComponent } from '../MedidaComponent';

describe('MedidaComponent', () => {
  const mockProps = {
    medida: {
      id: 1,
      nome: 'Medida Teste',
      controle: 1,
      programa: 1,
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    onEditMedida: jest.fn(),
    onDeleteMedida: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MedidaComponent {...mockProps} />);

    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
  });

  it('should handle edit medida', () => {
    render(<MedidaComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockProps.onEditMedida).toHaveBeenCalledWith(mockProps.medida);
  });

  it('should handle delete medida', () => {
    render(<MedidaComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockProps.onDeleteMedida).toHaveBeenCalledWith(1);
  });

  it('should handle inactive status', () => {
    const propsWithInactiveStatus = {
      ...mockProps,
      medida: {
        ...mockProps.medida,
        status: 'inativo',
      },
    };

    render(<MedidaComponent {...propsWithInactiveStatus} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<MedidaComponent {...mockProps} loading={true} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<MedidaComponent {...mockProps} error="Erro ao carregar medida" />);

    expect(screen.getByText('Erro ao carregar medida')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const propsWithLongText = {
      ...mockProps,
      medida: {
        ...mockProps.medida,
        nome: 'a'.repeat(100),
      },
    };

    render(<MedidaComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
  });
}); 