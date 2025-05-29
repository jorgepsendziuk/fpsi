import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ControleContainer from '../ControleContainer';
import { Controle, Diagnostico, Medida } from '../../types';
import { calculateMaturityIndexForControle } from '../../utils';

// Mock dos hooks e funções
jest.mock('../../utils');

describe('ControleContainer', () => {
  const mockControle: Controle = {
    id: 1,
    diagnostico: 1,
    numero: 1,
    nome: 'Controle Teste',
    texto: 'Descrição do controle',
  };

  const mockDiagnostico: Diagnostico = {
    id: 1,
    descricao: 'Diagnóstico Teste',
    cor: '#000000',
    indice: 1,
    maturidade: 1,
  };

  const mockMedidas: Medida[] = [
    {
      id: 1,
      id_medida: '1',
      id_controle: 1,
      id_cisv8: '1',
      status_medida: 1,
      grupo_imple: 'Grupo Teste',
      funcao_nist_csf: 'Função Teste',
      medida: 'Medida Teste',
      descricao: 'Descrição da medida',
    },
  ];

  const mockProps = {
    controle: mockControle,
    diagnostico: mockDiagnostico,
    programaId: 1,
    state: {
      medidas: {
        1: mockMedidas,
      },
    },
    handleINCCChange: jest.fn(),
    handleMedidaFetch: jest.fn(),
    handleMedidaChange: jest.fn(),
    responsaveis: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateMaturityIndexForControle as jest.Mock).mockReturnValue(50);
  });

  it('should render correctly', () => {
    render(<ControleContainer {...mockProps} />);

    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do controle')).toBeInTheDocument();
    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
  });

  it('should handle INCC change', () => {
    render(<ControleContainer {...mockProps} />);
    
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    expect(mockProps.handleINCCChange).toHaveBeenCalledWith(1, 1, 75);
  });

  it('should handle medida fetch', async () => {
    render(<ControleContainer {...mockProps} />);
    
    await waitFor(() => {
      expect(mockProps.handleMedidaFetch).toHaveBeenCalledWith(1, 1);
    });
  });

  it('should handle medida change', () => {
    render(<ControleContainer {...mockProps} />);
    
    const medidaInput = screen.getByLabelText('Medida');
    fireEvent.change(medidaInput, { target: { value: 'Nova Medida' } });
    
    expect(mockProps.handleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'nome', 'Nova Medida');
  });

  it('should calculate maturity index correctly', () => {
    render(<ControleContainer {...mockProps} />);
    
    expect(calculateMaturityIndexForControle).toHaveBeenCalledWith(mockControle, mockProps.state);
  });

  it('should handle empty medidas', () => {
    const propsWithEmptyMedidas = {
      ...mockProps,
      state: {
        medidas: {},
      },
    };

    render(<ControleContainer {...propsWithEmptyMedidas} />);

    expect(screen.getByText('Nenhuma medida cadastrada')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    const propsWithLoading = {
      ...mockProps,
      state: {
        medidas: {
          1: [],
        },
        loading: true,
      },
    };

    render(<ControleContainer {...propsWithLoading} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const propsWithError = {
      ...mockProps,
      state: {
        medidas: {
          1: [],
        },
        error: 'Erro ao carregar medidas',
      },
    };

    render(<ControleContainer {...propsWithError} />);

    expect(screen.getByText('Erro ao carregar medidas')).toBeInTheDocument();
  });
}); 