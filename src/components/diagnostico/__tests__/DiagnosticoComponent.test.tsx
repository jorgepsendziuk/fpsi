import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagnosticoComponent } from '../DiagnosticoComponent';
import { Diagnostico, Controle } from '../../types';

describe('DiagnosticoComponent', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      descricao: 'Diagnóstico Teste',
      cor: '#000000',
      indice: 1,
      maturidade: 1,
    } as Diagnostico,
    controles: [
      {
        id: 1,
        diagnostico: 1,
        numero: 1,
        nome: 'Controle Teste',
        texto: 'Descrição do controle',
      } as Controle,
    ],
    onControleClick: jest.fn(),
    onAddControle: jest.fn(),
    onEditDiagnostico: jest.fn(),
    onDeleteDiagnostico: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<DiagnosticoComponent {...mockProps} />);

    expect(screen.getByText('Diagnóstico Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do controle')).toBeInTheDocument();
    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
  });

  it('should handle controle click', () => {
    render(<DiagnosticoComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Controle Teste'));

    expect(mockProps.onControleClick).toHaveBeenCalledWith(1);
  });

  it('should handle add controle', () => {
    render(<DiagnosticoComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Adicionar Controle'));

    expect(mockProps.onAddControle).toHaveBeenCalled();
  });

  it('should handle edit diagnostico', () => {
    render(<DiagnosticoComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockProps.onEditDiagnostico).toHaveBeenCalledWith(mockProps.diagnostico);
  });

  it('should handle delete diagnostico', () => {
    render(<DiagnosticoComponent {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockProps.onDeleteDiagnostico).toHaveBeenCalledWith(1);
  });

  it('should handle empty controles', () => {
    render(<DiagnosticoComponent {...mockProps} controles={[]} />);

    expect(screen.getByText('Nenhum controle cadastrado')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    render(<DiagnosticoComponent {...mockProps} loading={true} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    render(<DiagnosticoComponent {...mockProps} error="Erro ao carregar diagnóstico" />);

    expect(screen.getByText('Erro ao carregar diagnóstico')).toBeInTheDocument();
  });

  it('should handle multiple controles', () => {
    const propsWithMultipleControles = {
      ...mockProps,
      controles: [
        ...mockProps.controles,
        {
          id: 2,
          diagnostico: 1,
          numero: 2,
          nome: 'Controle Teste 2',
          texto: 'Descrição do controle 2',
        } as Controle,
      ],
    };

    render(<DiagnosticoComponent {...propsWithMultipleControles} />);

    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Controle Teste 2')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const propsWithLongText = {
      ...mockProps,
      diagnostico: {
        ...mockProps.diagnostico,
        descricao: 'a'.repeat(1000),
      },
    };

    render(<DiagnosticoComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
}); 