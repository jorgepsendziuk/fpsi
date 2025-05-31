import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiagnosticoContainer } from '../DiagnosticoContainer';
import { DiagnosticoComponent } from   '../../components/DiagnosticoComponent';
import { useDiagnosticoControles } from '../../hooks/useDiagnosticoControles';
import { calculateSumOfResponsesForDiagnostico }  from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

// Mock dos componentes e hooks
jest.mock('../../components/DiagnosticoComponent');
jest.mock('../../hooks/useDiagnosticoControles');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('DiagnosticoContainer Integration', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      descricao: 'Diagnóstico Teste',
      cor: '#000000',
      indice: 0,
      maturidade: 0,
    },
    programa: {
      id: 1,
      orgao: 1,
      sgd_versao_diagnostico_enviado: '1.0',
      sgd_versao_diagnostico: '1.0',
      responsavel_controle_interno: 1,
      responsavel_si: 1,
      responsavel_privacidade: 1,
      responsavel_ti: 1,
      sgd_numero_documento_nota_tecnica: 'NT001',
      sgd_data_limite_retorno: new Date('2024-12-31'),
      sgd_retorno_data: new Date('2024-01-01'),
      setor: 1,
      cnpj: 12345678901234,
      razao_social: 'Empresa Teste',
      nome_fantasia: 'Teste',
      atendimento_fone: '(11) 1234-5678',
      atendimento_email: 'teste@exemplo.com',
      atendimento_site: 'www.teste.com',
      politica_inicio_vigencia: new Date('2024-01-01'),
      politica_prazo_revisao: new Date('2024-12-31'),
    },
    state: {
      controles: {
        1: [
          {
            id: 1,
            diagnostico: 1,
            numero: 1,
            nome: 'Controle Teste',
            texto: 'Texto do controle',
          },
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

  beforeEach(() => {
    jest.clearAllMocks();
    (useDiagnosticoControles as jest.Mock).mockReturnValue(mockProps.state.controles[1]);
    (calculateSumOfResponsesForDiagnostico as jest.Mock).mockReturnValue(50);
    (getMaturityLabel as jest.Mock).mockReturnValue('Intermediário');
    (DiagnosticoComponent as jest.Mock).mockImplementation(({ children, ...props }) => (
      <div data-testid="diagnostico-component" {...props}>
        {children}
      </div>
    ));
  });
  it('should integrate with DiagnosticoComponent', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    const component = screen.getByTestId('diagnostico-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('data-diagnostico-id', '1');
    expect(component).toHaveAttribute('data-programa-id', '1');
  });

  it('should handle state updates', async () => {
    const { rerender } = render(<DiagnosticoContainer {...mockProps} />);
    
    // Simula atualização de estado
    const newState = {
      ...mockProps.state,
      controles: {
        1: [
          {
            ...mockProps.state.controles[1][0],
            incc: 75,
          },
        ],
      },
    };
    
    rerender(<DiagnosticoContainer {...mockProps} state={newState} />);
    
    await waitFor(() => {
      expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledWith(1, newState);
    });
  });

  it('should handle controle and medida integration', async () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    // Simula interação com controle
    const controle = screen.getByText('Controle Teste');
    fireEvent.click(controle);
    
    await waitFor(() => {
      expect(mockProps.handleMedidaFetch).toHaveBeenCalledWith(1, 1);
    });
    
    // Simula interação com medida
    const medida = screen.getByText('Medida Teste');
    fireEvent.click(medida);
    
    expect(mockProps.handleMedidaChange).toHaveBeenCalled();
  });

  it('should handle maturity calculation integration', () => {
    render(<DiagnosticoContainer {...mockProps} />);
    
    // Verifica se o cálculo de maturidade é atualizado
    expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledWith(1, mockProps.state);
    expect(getMaturityLabel).toHaveBeenCalledWith(50);
    
    // Simula mudança de INCC
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    // Verifica se o cálculo é atualizado
    expect(calculateSumOfResponsesForDiagnostico).toHaveBeenCalledTimes(2);
  });

  it('should handle error propagation', async () => {
    (useDiagnosticoControles as jest.Mock).mockImplementation(() => {
      throw new Error('Erro de integração');
    });
    
    render(<DiagnosticoContainer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro de integração')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    (useDiagnosticoControles as jest.Mock).mockReturnValue([]);
    
    render(<DiagnosticoContainer {...mockProps} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    
    // Simula carregamento completo
    (useDiagnosticoControles as jest.Mock).mockReturnValue(mockProps.state.controles[1]);
    
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
  });

  it('should handle prop changes', async () => {
    const { rerender } = render(<DiagnosticoContainer {...mockProps} />);
    
    // Simula mudança de props
    const newProps = {
      ...mockProps,
      diagnostico: {
        ...mockProps.diagnostico,
        nome: 'Novo Diagnóstico',
      },
    };
    
    rerender(<DiagnosticoContainer {...newProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Diagnóstico')).toBeInTheDocument();
    });
  });
}); 