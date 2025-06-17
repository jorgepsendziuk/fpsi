import { render, screen, fireEvent } from '@testing-library/react';
import { ControleComponent } from '../ControleComponent';

describe('ControleComponent', () => {
  const mockProps = {
    controle: {
      id: 1,
      nome: 'Controle Teste',
      descricao: 'Descrição do controle',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    medidas: [
      {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
    ],
    onMedidaClick: jest.fn(),
    onAddMedida: jest.fn(),
    onEditControle: jest.fn(),
    onDeleteControle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ControleComponent {...mockProps} />);

    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do controle')).toBeInTheDocument();
    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
  });

  it('should handle medida click', () => {
    render(<ControleComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Medida Teste'));

    expect(mockProps.onMedidaClick).toHaveBeenCalledWith(1);
  });

  it('should handle add medida', () => {
    render(<ControleComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Adicionar Medida'));

    expect(mockProps.onAddMedida).toHaveBeenCalled();
  });

  it('should handle edit controle', () => {
    render(<ControleComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockProps.onEditControle).toHaveBeenCalledWith(mockProps.controle);
  });

  it('should handle delete controle', () => {
    render(<ControleComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockProps.onDeleteControle).toHaveBeenCalledWith(1);
  });

  it('should handle empty medidas', () => {
    render(<ControleComponent {...mockProps} medidas={[]} />);

    expect(screen.getByText('Nenhuma medida cadastrada')).toBeInTheDocument();
  });

  it('should handle inactive status', () => {
    const propsWithInactiveStatus = {
      ...mockProps,
      controle: {
        ...mockProps.controle,
        status: 'inativo',
      },
    };

    render(<ControleComponent {...propsWithInactiveStatus} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<ControleComponent {...mockProps} loading={true} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<ControleComponent {...mockProps} error="Erro ao carregar controle" />);

    expect(screen.getByText('Erro ao carregar controle')).toBeInTheDocument();
  });

  it('should handle multiple medidas', () => {
    const propsWithMultipleMedidas = {
      ...mockProps,
      medidas: [
        ...mockProps.medidas,
        {
          id: 2,
          nome: 'Medida Teste 2',
          controle: 1,
          programa: 1,
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
      ],
    };

    render(<ControleComponent {...propsWithMultipleMedidas} />);

    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
    expect(screen.getByText('Medida Teste 2')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const propsWithLongText = {
      ...mockProps,
      controle: {
        ...mockProps.controle,
        nome: 'a'.repeat(100),
        descricao: 'a'.repeat(1000),
      },
    };

    render(<ControleComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
}); 