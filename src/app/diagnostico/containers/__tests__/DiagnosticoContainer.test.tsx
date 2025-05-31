import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiagnosticoContainer from '../DiagnosticoContainer';
import { Diagnostico, Controle, Programa } from '../../types';
import { calculateSumOfResponsesForDiagnostico } from '@app/diagnostico/utils/calculations';
import { getMaturityLabel } from  '@app/diagnostico/utils/maturity';
import { useDiagnosticoGrid } from '@app/diagnostico/hooks/useDiagnosticoGrid';

// Mock dos hooks e funções
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');
jest.mock('../../hooks/useDiagnosticoGrid');

describe('DiagnosticoContainer', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      descricao: 'Diagnóstico Teste',
      cor: '#000000',
      indice: 1,
      maturidade: 1,
    } as Diagnostico,
    programa: {
      id: 1,
      orgao: 1,
      sgd_versao_diagnostico_enviado: '1.0',
      sgd_versao_diagnostico: '1.0',
      responsavel_controle_interno: 1,
      responsavel_si: 1,
      responsavel_privacidade: 1,
      responsavel_ti: 1,
      sgd_numero_documento_nota_tecnica: '1',
      sgd_data_limite_retorno: new Date(),
      sgd_retorno_data: new Date(),
      setor: 1,
      cnpj: 1,
      razao_social: 'Programa Teste',
      nome_fantasia: 'Programa Teste',
      atendimento_fone: '123456789',
      atendimento_email: 'teste@teste.com',
      atendimento_site: 'www.teste.com',
      politica_inicio_vigencia: new Date(),
      politica_prazo_revisao: new Date(),
    } as Programa,
    state: {
      controles: {
        1: [
          {
            id: 1,
            diagnostico: 1,
            numero: 1,
            nome: 'Controle Teste',
            texto: 'Descrição do controle',
          } as Controle,
        ],
      },
      medidas: {},
      responsaveis: [],
      programas: [],
      diagnosticos: [],
      medidas_programas: [],
      respostas: [],
    },
    handleControleFetch: jest.fn(),
    handleINCCChange: jest.fn(),
    handleMedidaFetch: jest.fn(),
    handleMedidaChange: jest.fn(),
    responsaveis: [],
  };

  const mockGridData = {
    diagnosticos: [
      {
        id: 1,
        nome: 'Diagnóstico Teste',
        descricao: 'Descrição do diagnóstico',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
    ],
    loading: false,
    error: null,
  };

  const mockHandlers = {
    onAdd: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (calculateSumOfResponsesForDiagnostico as jest.Mock).mockReturnValue(50);
    (getMaturityLabel as jest.Mock).mockReturnValue('Intermediário');
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: mockGridData,
      handlers: mockHandlers,
    });
  });

  it('should render correctly with props', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    expect(screen.getByText('Diagnóstico Teste')).toBeInTheDocument();
    expect(screen.getByText('Programa Teste')).toBeInTheDocument();
    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
  });

  it('should calculate maturity score correctly', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledWith(1, mockProps.state);
    expect(getMaturityLabel).toHaveBeenCalledWith(50);
  });

  it('should handle controle fetch', async () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    await waitFor(() => {
      expect(mockProps.handleControleFetch).toHaveBeenCalledWith(1, 1);
    });
  });

  it('should handle INCC change', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    expect(mockProps.handleINCCChange).toHaveBeenCalledWith(1, 1, 75);
  });

  it('should handle medida fetch', async () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    const controle = screen.getByText('Controle Teste');
    fireEvent.click(controle);
    
    await waitFor(() => {
      expect(mockProps.handleMedidaFetch).toHaveBeenCalledWith(1, 1);
    });
  });

  it('should handle medida change', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    const medidaInput = screen.getByLabelText('Medida');
    fireEvent.change(medidaInput, { target: { value: 'Nova Medida' } });
    
    expect(mockProps.handleMedidaChange).toHaveBeenCalledWith(1, 1, 'nome', 'Nova Medida');
  });

  it('should memoize maturity calculations', () => {
    const { rerender } = render(<DiagnosticoContainer {...mockProps} />);
    
    // Primeira renderização
    expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledTimes(1);
    expect(getMaturityLabel).toHaveBeenCalledTimes(1);
    
    // Re-renderização com mesmas props
    rerender(<DiagnosticoContainer {...mockProps} />);
    
    // Não deve recalcular
    expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledTimes(1);
    expect(getMaturityLabel).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', () => {
    const propsWithLoading = {
      ...mockProps,
      state: {
        ...mockProps.state,
        loading: true,
      },
    };
    
    render(<DiagnosticoContainer {...propsWithLoading} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const propsWithError = {
      ...mockProps,
      state: {
        ...mockProps.state,
        error: 'Erro ao carregar controles',
      },
    };
    
    render(<DiagnosticoContainer {...propsWithError} />);
    
    expect(screen.getByText('Erro ao carregar controles')).toBeInTheDocument();
  });

  it('should handle empty controles', () => {
    const propsWithEmptyControles = {
      ...mockProps,
      state: {
        ...mockProps.state,
        controles: {},
      },
    };

    render(<DiagnosticoContainer {...propsWithEmptyControles} />);

    expect(screen.getByText('Nenhum controle cadastrado')).toBeInTheDocument();
  });

  it('should handle multiple controles', () => {
    const propsWithMultipleControles = {
      ...mockProps,
      state: {
        ...mockProps.state,
        controles: {
          1: [
            ...mockProps.state.controles[1],
            {
              id: 2,
              diagnostico: 1,
              numero: 2,
              nome: 'Controle Teste 2',
              texto: 'Descrição do controle 2',
            } as Controle,
          ],
        },
      },
    };

    render(<DiagnosticoContainer {...propsWithMultipleControles} />);

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

    render(<DiagnosticoContainer {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });

  it('should handle add diagnostico', () => {
    render(<DiagnosticoContainer {...mockProps} />);

    fireEvent.click(screen.getByText('Adicionar Diagnóstico'));

    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  it('should handle edit diagnostico', () => {
    render(<DiagnosticoContainer {...mockProps} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockGridData.diagnosticos[0]);
  });

  it('should handle delete diagnostico', () => {
    render(<DiagnosticoContainer {...mockProps} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  it('should handle empty diagnosticos', () => {
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        diagnosticos: [],
      },
      handlers: mockHandlers,
    });

    render(<DiagnosticoContainer {...mockProps} />);

    expect(screen.getByText('Nenhum diagnóstico cadastrado')).toBeInTheDocument();
  });

  it('should handle multiple diagnosticos', () => {
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        diagnosticos: [
          ...mockGridData.diagnosticos,
          {
            id: 2,
            nome: 'Diagnóstico Teste 2',
            descricao: 'Descrição do diagnóstico 2',
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
      handlers: mockHandlers,
    });

    render(<DiagnosticoContainer {...mockProps} />);

    expect(screen.getByText('Diagnóstico Teste')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico Teste 2')).toBeInTheDocument();
  });
}); 