import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ControleContainer } from '../ControleContainer';
import { useControleMedidas } from '../../hooks/useControleMedidas';
import { calculateMaturityIndex } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';
import { ControleComponent } from '@app/diagnostico/components/ControleComponent';

// Mock dos componentes e hooks
jest.mock('../../components/ControleComponent');
jest.mock('../../hooks/useControleMedidas');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('ControleContainer Integration', () => {
  const mockDiagnostico = {
    id: 1,
    descricao: 'Diagnóstico Teste',
    cor: '#000000',
    indice: 0,
    maturidade: 0,
  };

  const mockProps = {
    controle: {
      id: 1,
      nome: 'Controle Teste',
      programa: 1,
      diagnostico: 1,
      numero: 1,
      incc: 0,
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    programa: {
      id: 1,
      nome: 'Programa Teste',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    state: {
      medidas: {
        1: [
          {
            id: 1,
            id_medida: 'M001',
            id_controle: 1,
            id_cisv8: 'CISV8-001',
            status_medida: 1,
            grupo_imple: 'Grupo Teste',
            funcao_nist_csf: 'Função Teste',
            medida: 'Medida Teste',
            descricao: 'Descrição da medida teste',
            resposta: 75,
            justificativa: 'Justificativa teste',
            encaminhamento_interno: 'Encaminhamento teste',
            observacao_orgao: 'Observação teste',
            nova_resposta: 'Nova resposta teste',
            responsavel: 1,
            previsao_inicio: '2024-01-01',
            previsao_fim: '2024-12-31',
            status_plano_acao: 1,
          },
        ],
      },
    },
    handleMedidaFetch: jest.fn(),
    handleMedidaChange: jest.fn(),
    handleINCCChange: jest.fn(),
    responsaveis: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useControleMedidas as jest.Mock).mockReturnValue(mockProps.state.medidas[1]);
    (calculateMaturityIndex as jest.Mock).mockReturnValue(50);
    (getMaturityLabel as jest.Mock).mockReturnValue('Intermediário');
    (ControleComponent as jest.Mock).mockImplementation(({ children, ...props }) => (
      <div data-testid="controle-component" {...props}>
        {children}
      </div>
    ));
  });
  it('should integrate with ControleComponent', () => {
    render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    const component = screen.getByTestId('controle-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('data-controle-id', '1');
    expect(component).toHaveAttribute('data-programa-id', '1');
  });

  it('should handle state updates', async () => {
    const { rerender } = render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    // Simula atualização de estado
    const newState = {
      ...mockProps.state,
      medidas: {
        1: [
          {
            ...mockProps.state.medidas[1][0],
            medida: 'Nova Medida',
          },
        ],
      },
    };
    
    rerender(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} state={newState} />);
    
    await waitFor(() => {
      expect(calculateMaturityIndex).toHaveBeenCalledWith(1, newState);
    });
  });

  it('should handle medida and INCC integration', async () => {
    render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    // Simula interação com medida
    const medida = screen.getByText('Medida Teste');
    fireEvent.click(medida);
    
    await waitFor(() => {
      expect(mockProps.handleMedidaFetch).toHaveBeenCalledWith(1, 1);
    });
    
    // Simula interação com INCC
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    expect(mockProps.handleINCCChange).toHaveBeenCalledWith(1, 1, 75);
  });

  it('should handle maturity calculation integration', () => {
    render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    // Verifica se o cálculo de maturidade é atualizado
    expect(calculateMaturityIndex).toHaveBeenCalledWith(1, mockProps.state);
    expect(getMaturityLabel).toHaveBeenCalledWith(50);
    
    // Simula mudança de INCC
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    // Verifica se o cálculo é atualizado
    expect(calculateMaturityIndex).toHaveBeenCalledTimes(2);
  });

  it('should handle error propagation', async () => {
    (useControleMedidas as jest.Mock).mockImplementation(() => {
      throw new Error('Erro de integração');
    });
    
    render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro de integração')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    (useControleMedidas as jest.Mock).mockReturnValue([]);
    
    render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    
    // Simula carregamento completo
    (useControleMedidas as jest.Mock).mockReturnValue(mockProps.state.medidas[1]);
    
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
  });

  it('should handle prop changes', async () => {
    const { rerender } = render(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...mockProps} />);
    
    // Simula mudança de props
    const newProps = {
      ...mockProps,
      controle: {
        ...mockProps.controle,
        nome: 'Novo Controle',
      },
    };
    
    rerender(<ControleContainer diagnostico={mockDiagnostico} programaId={0} {...newProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Controle')).toBeInTheDocument();
    });
  });
}); 