# Exemplos de Teste - FPSI

## Visão Geral

Este documento contém exemplos práticos de testes utilizados no projeto FPSI. Os exemplos são baseados em casos reais e seguem os padrões estabelecidos.

## Componentes

### 1. DiagnosticoContainer

#### 1.1 Teste Unitário
```typescript
// src/app/diagnostico/containers/__tests__/DiagnosticoContainer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiagnosticoContainer } from '../DiagnosticoContainer';
import { useDiagnosticoControles } from '../../hooks/useDiagnosticoControles';
import { calculateSumOfResponsesForDiagnostico } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

jest.mock('../../hooks/useDiagnosticoControles');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('DiagnosticoContainer', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      nome: 'Diagnóstico Teste',
      programa: 1,
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
      controles: {
        1: [
          {
            id: 1,
            nome: 'Controle Teste',
            programa: 1,
            diagnostico: 1,
            incc: 0,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
      medidas: {},
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
});

#### 1.2 Teste de Integração
```typescript
// src/app/diagnostico/containers/__tests__/DiagnosticoContainer.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiagnosticoContainer } from '../DiagnosticoContainer';
import { DiagnosticoComponent } from '../../components/DiagnosticoComponent';
import { useDiagnosticoControles } from '../../hooks/useDiagnosticoControles';
import { calculateSumOfResponsesForDiagnostico } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

jest.mock('../../components/DiagnosticoComponent');
jest.mock('../../hooks/useDiagnosticoControles');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('DiagnosticoContainer Integration', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      nome: 'Diagnóstico Teste',
      programa: 1,
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
      controles: {
        1: [
          {
            id: 1,
            nome: 'Controle Teste',
            programa: 1,
            diagnostico: 1,
            incc: 0,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
      medidas: {
        1: [
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
      },
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
});

### 2. ControleContainer

#### 2.1 Teste Unitário
```typescript
// src/app/diagnostico/containers/__tests__/ControleContainer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ControleContainer } from '../ControleContainer';
import { useControleMedidas } from '../../hooks/useControleMedidas';
import { calculateMaturityIndex } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

jest.mock('../../hooks/useControleMedidas');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('ControleContainer', () => {
  const mockProps = {
    controle: {
      id: 1,
      nome: 'Controle Teste',
      programa: 1,
      diagnostico: 1,
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
            nome: 'Medida Teste',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
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
  });

  it('should render correctly with props', () => {
    render(<ControleContainer {...mockProps} />);
    
    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Programa Teste')).toBeInTheDocument();
    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
  });

  it('should calculate maturity index correctly', () => {
    render(<ControleContainer {...mockProps} />);
    
    expect(calculateMaturityIndex).toHaveBeenCalledWith(1, mockProps.state);
    expect(getMaturityLabel).toHaveBeenCalledWith(50);
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
    
    expect(mockProps.handleMedidaChange).toHaveBeenCalledWith(
      1,
      1,
      1,
      'nome',
      'Nova Medida'
    );
  });

  it('should handle INCC change', () => {
    render(<ControleContainer {...mockProps} />);
    
    const inccInput = screen.getByLabelText('INCC');
    fireEvent.change(inccInput, { target: { value: '75' } });
    
    expect(mockProps.handleINCCChange).toHaveBeenCalledWith(1, 1, 75);
  });

  it('should memoize maturity calculations', () => {
    const { rerender } = render(<ControleContainer {...mockProps} />);
    
    // Primeira renderização
    expect(calculateMaturityIndex).toHaveBeenCalledTimes(1);
    expect(getMaturityLabel).toHaveBeenCalledTimes(1);
    
    // Re-renderização com mesmas props
    rerender(<ControleContainer {...mockProps} />);
    
    // Não deve recalcular
    expect(calculateMaturityIndex).toHaveBeenCalledTimes(1);
    expect(getMaturityLabel).toHaveBeenCalledTimes(1);
  });

  it('should handle loading state', () => {
    (useControleMedidas as jest.Mock).mockReturnValue([]);
    
    render(<ControleContainer {...mockProps} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    (useControleMedidas as jest.Mock).mockImplementation(() => {
      throw new Error('Erro ao carregar medidas');
    });
    
    render(<ControleContainer {...mockProps} />);
    
    expect(screen.getByText('Erro ao carregar medidas')).toBeInTheDocument();
  });
});

#### 2.2 Teste de Integração
```typescript
// src/app/diagnostico/containers/__tests__/ControleContainer.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ControleContainer } from '../ControleContainer';
import { ControleComponent } from '../../components/ControleComponent';
import { useControleMedidas } from '../../hooks/useControleMedidas';
import { calculateMaturityIndex } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

jest.mock('../../components/ControleComponent');
jest.mock('../../hooks/useControleMedidas');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');

describe('ControleContainer Integration', () => {
  const mockProps = {
    controle: {
      id: 1,
      nome: 'Controle Teste',
      programa: 1,
      diagnostico: 1,
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
            nome: 'Medida Teste',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
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
    render(<ControleContainer {...mockProps} />);
    
    const component = screen.getByTestId('controle-component');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('data-controle-id', '1');
    expect(component).toHaveAttribute('data-programa-id', '1');
  });

  it('should handle state updates', async () => {
    const { rerender } = render(<ControleContainer {...mockProps} />);
    
    // Simula atualização de estado
    const newState = {
      ...mockProps.state,
      medidas: {
        1: [
          {
            ...mockProps.state.medidas[1][0],
            nome: 'Nova Medida',
          },
        ],
      },
    };
    
    rerender(<ControleContainer {...mockProps} state={newState} />);
    
    await waitFor(() => {
      expect(calculateMaturityIndex).toHaveBeenCalledWith(1, newState);
    });
  });

  it('should handle medida and INCC integration', async () => {
    render(<ControleContainer {...mockProps} />);
    
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
    render(<ControleContainer {...mockProps} />);
    
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
    
    render(<ControleContainer {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro de integração')).toBeInTheDocument();
    });
  });

  it('should handle loading states', async () => {
    (useControleMedidas as jest.Mock).mockReturnValue([]);
    
    render(<ControleContainer {...mockProps} />);
    
    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    
    // Simula carregamento completo
    (useControleMedidas as jest.Mock).mockReturnValue(mockProps.state.medidas[1]);
    
    await waitFor(() => {
      expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
    });
  });

  it('should handle prop changes', async () => {
    const { rerender } = render(<ControleContainer {...mockProps} />);
    
    // Simula mudança de props
    const newProps = {
      ...mockProps,
      controle: {
        ...mockProps.controle,
        nome: 'Novo Controle',
      },
    };
    
    rerender(<ControleContainer {...newProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Novo Controle')).toBeInTheDocument();
    });
  });
});

### 3. ResponsavelContainer

#### 3.1 Teste Unitário
```typescript
// src/app/diagnostico/containers/__tests__/ResponsavelContainer.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';
import { useResponsavelGrid } from '../../hooks/useResponsavelGrid';
import { validateResponsavel } from '../../utils/validations';

jest.mock('../../hooks/useResponsavelGrid');
jest.mock('../../utils/validations');

describe('ResponsavelContainer', () => {
  const mockProps = {
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
  });

  it('should render correctly with props', () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Responsável Teste')).toBeInTheDocument();
    expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Analista')).toBeInTheDocument();
  });

  it('should handle responsavel add', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
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
  });

  it('should handle responsavel edit', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);
    
    const nomeInput = screen.getByLabelText('Nome');
    fireEvent.change(nomeInput, { target: { value: 'Responsável Editado' } });
    
    const submitButton = screen.getByText('Salvar');
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
  });

  it('should handle responsavel delete', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    const deleteButton = screen.getByText('Excluir');
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockProps.handleResponsavelDelete).toHaveBeenCalledWith(1);
    });
  });

  it('should validate responsavel data', async () => {
    (validateResponsavel as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Nome é obrigatório'],
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    const addButton = screen.getByText('Adicionar Responsável');
    fireEvent.click(addButton);
    
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(mockProps.handleResponsavelAdd).not.toHaveBeenCalled();
    });
  });

  it('should handle loading state', () => {
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
  });

  it('should handle error state', () => {
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: [],
      loading: false,
      error: 'Erro ao carregar responsáveis',
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Erro ao carregar responsáveis')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: [],
      loading: false,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Nenhum responsável cadastrado')).toBeInTheDocument();
  });
});
```

#### 3.2 Teste de Integração
```typescript
// src/app/diagnostico/containers/__tests__/ResponsavelContainer.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';
import { ResponsavelComponent } from '../../components/ResponsavelComponent';
import { useResponsavelGrid } from '../../hooks/useResponsavelGrid';
import { validateResponsavel } from '../../utils/validations';

jest.mock('../../components/ResponsavelComponent');
jest.mock('../../hooks/useResponsavelGrid');
jest.mock('../../utils/validations');

describe('ResponsavelContainer Integration', () => {
  const mockProps = {
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

## Hooks

### 1. useDiagnosticoControles
```typescript
// src/app/diagnostico/hooks/__tests__/useDiagnosticoControles.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDiagnosticoControles } from '../useDiagnosticoControles';

describe('useDiagnosticoControles', () => {
  const mockState = {
    controles: {
      1: [
        {
          id: 1,
          nome: 'Controle Teste',
          programa: 1,
          diagnostico: 1,
          incc: 0,
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
      ],
    },
  };

  it('should return initial state', () => {
    const { result } = renderHook(() =>
      useDiagnosticoControles(1, 1, mockState)
    );

    expect(result.current).toEqual(mockState.controles[1]);
  });

  it('should handle updates', () => {
    const { result, rerender } = renderHook(
      ({ diagnosticoId, programaId, state }) =>
        useDiagnosticoControles(diagnosticoId, programaId, state),
      {
        initialProps: {
          diagnosticoId: 1,
          programaId: 1,
          state: mockState,
        },
      }
    );

    const newState = {
      ...mockState,
      controles: {
        1: [
          {
            ...mockState.controles[1][0],
            incc: 75,
          },
        ],
      },
    };

    rerender({
      diagnosticoId: 1,
      programaId: 1,
      state: newState,
    });

    expect(result.current).toEqual(newState.controles[1]);
  });
});
```

### 2. useControleMedidas
```typescript
// src/app/diagnostico/hooks/__tests__/useControleMedidas.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useControleMedidas } from '../useControleMedidas';

describe('useControleMedidas', () => {
  const mockState = {
    medidas: {
      1: [
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
    },
  };

  const mockHandleMedidaFetch = jest.fn();
  const mockHandleMedidaChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return medidas for a given controle', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toEqual(mockState.medidas[1]);
  });

  it('should fetch medidas on mount', () => {
    renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(mockHandleMedidaFetch).toHaveBeenCalledWith(1, 1);
  });

  it('should handle medida changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('nome', 'Nova Medida');
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'nome', 'Nova Medida');
  });

  it('should handle empty medidas', () => {
    const emptyState = {
      medidas: {},
    };

    const { result } = renderHook(() =>
      useControleMedidas(1, emptyState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toEqual([]);
  });

  it('should handle multiple medidas', () => {
    const multipleMedidasState = {
      medidas: {
        1: [
          {
            id: 1,
            nome: 'Medida 1',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
          {
            id: 2,
            nome: 'Medida 2',
            controle: 1,
            programa: 1,
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
    };

    const { result } = renderHook(() =>
      useControleMedidas(1, multipleMedidasState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[0].nome).toBe('Medida 1');
    expect(result.current[1].nome).toBe('Medida 2');
  });

  it('should handle medida status changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('status', 'inativo');
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'status', 'inativo');
  });

  it('should handle medida program changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('programa', 2);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'programa', 2);
  });

  it('should handle medida creation date changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    const newDate = '2024-02-01';
    act(() => {
      result.current[0].handleChange('data_criacao', newDate);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'data_criacao', newDate);
  });

  it('should handle medida update date changes', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    const newDate = '2024-02-01';
    act(() => {
      result.current[0].handleChange('data_atualizacao', newDate);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledWith(1, 1, 1, 'data_atualizacao', newDate);
  });

  it('should handle multiple changes in sequence', () => {
    const { result } = renderHook(() =>
      useControleMedidas(1, mockState, mockHandleMedidaFetch, mockHandleMedidaChange)
    );

    act(() => {
      result.current[0].handleChange('nome', 'Nova Medida');
      result.current[0].handleChange('status', 'inativo');
      result.current[0].handleChange('programa', 2);
    });

    expect(mockHandleMedidaChange).toHaveBeenCalledTimes(3);
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(1, 1, 1, 1, 'nome', 'Nova Medida');
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(2, 1, 1, 1, 'status', 'inativo');
    expect(mockHandleMedidaChange).toHaveBeenNthCalledWith(3, 1, 1, 1, 'programa', 2);
  });

  it('should handle state updates', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useControleMedidas(1, state, mockHandleMedidaFetch, mockHandleMedidaChange),
      {
        initialProps: { state: mockState },
      }
    );

    const updatedState = {
      medidas: {
        1: [
          {
            ...mockState.medidas[1][0],
            nome: 'Medida Atualizada',
          },
        ],
      },
    };

    rerender({ state: updatedState });

    expect(result.current[0].nome).toBe('Medida Atualizada');
  });
});
```

### 3. useResponsavelGrid
```typescript
// src/app/diagnostico/hooks/__tests__/useResponsavelGrid.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useResponsavelGrid } from '../useResponsavelGrid';

describe('useResponsavelGrid', () => {
  const mockResponsaveis = [
    {
      id: 1,
      nome: 'Responsável Teste',
      email: 'teste@exemplo.com',
      cargo: 'Analista',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
  ];

  const mockHandleResponsavelAdd = jest.fn();
  const mockHandleResponsavelEdit = jest.fn();
  const mockHandleResponsavelDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return grid data and handlers', () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    expect(result.current.gridData).toEqual(mockResponsaveis);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.handleAdd).toBeDefined();
    expect(result.current.handleEdit).toBeDefined();
    expect(result.current.handleDelete).toBeDefined();
  });

  it('should handle responsavel add', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const newResponsavel = {
      nome: 'Novo Responsável',
      email: 'novo@exemplo.com',
      cargo: 'Novo Cargo',
    };

    act(() => {
      result.current.handleAdd(newResponsavel);
    });

    expect(mockHandleResponsavelAdd).toHaveBeenCalledWith(newResponsavel);
  });

  it('should handle responsavel edit', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const updatedResponsavel = {
      id: 1,
      nome: 'Responsável Editado',
      email: 'editado@exemplo.com',
      cargo: 'Cargo Editado',
    };

    act(() => {
      result.current.handleEdit(1, updatedResponsavel);
    });

    expect(mockHandleResponsavelEdit).toHaveBeenCalledWith(1, updatedResponsavel);
  });

  it('should handle responsavel delete', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    act(() => {
      result.current.handleDelete(1);
    });

    expect(mockHandleResponsavelDelete).toHaveBeenCalledWith(1);
  });

  it('should handle empty responsaveis', () => {
    const { result } = renderHook(() =>
      useResponsavelGrid([], mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    expect(result.current.gridData).toEqual([]);
  });

  it('should handle multiple responsaveis', () => {
    const multipleResponsaveis = [
      ...mockResponsaveis,
      {
        id: 2,
        nome: 'Responsável 2',
        email: 'teste2@exemplo.com',
        cargo: 'Analista 2',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
    ];

    const { result } = renderHook(() =>
      useResponsavelGrid(multipleResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    expect(result.current.gridData).toHaveLength(2);
    expect(result.current.gridData[0].nome).toBe('Responsável Teste');
    expect(result.current.gridData[1].nome).toBe('Responsável 2');
  });

  it('should handle responsavel status changes', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const updatedResponsavel = {
      ...mockResponsaveis[0],
      status: 'inativo',
    };

    act(() => {
      result.current.handleEdit(1, updatedResponsavel);
    });

    expect(mockHandleResponsavelEdit).toHaveBeenCalledWith(1, updatedResponsavel);
  });

  it('should handle responsavel creation date changes', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const newDate = '2024-02-01';
    const updatedResponsavel = {
      ...mockResponsaveis[0],
      data_criacao: newDate,
    };

    act(() => {
      result.current.handleEdit(1, updatedResponsavel);
    });

    expect(mockHandleResponsavelEdit).toHaveBeenCalledWith(1, updatedResponsavel);
  });

  it('should handle responsavel update date changes', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const newDate = '2024-02-01';
    const updatedResponsavel = {
      ...mockResponsaveis[0],
      data_atualizacao: newDate,
    };

    act(() => {
      result.current.handleEdit(1, updatedResponsavel);
    });

    expect(mockHandleResponsavelEdit).toHaveBeenCalledWith(1, updatedResponsavel);
  });

  it('should handle multiple changes in sequence', async () => {
    const { result } = renderHook(() =>
      useResponsavelGrid(mockResponsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete)
    );

    const newResponsavel = {
      nome: 'Novo Responsável',
      email: 'novo@exemplo.com',
      cargo: 'Novo Cargo',
    };

    const updatedResponsavel = {
      ...mockResponsaveis[0],
      nome: 'Responsável Editado',
    };

    act(() => {
      result.current.handleAdd(newResponsavel);
      result.current.handleEdit(1, updatedResponsavel);
      result.current.handleDelete(1);
    });

    expect(mockHandleResponsavelAdd).toHaveBeenCalledWith(newResponsavel);
    expect(mockHandleResponsavelEdit).toHaveBeenCalledWith(1, updatedResponsavel);
    expect(mockHandleResponsavelDelete).toHaveBeenCalledWith(1);
  });

  it('should handle responsaveis updates', () => {
    const { result, rerender } = renderHook(
      ({ responsaveis }) =>
        useResponsavelGrid(responsaveis, mockHandleResponsavelAdd, mockHandleResponsavelEdit, mockHandleResponsavelDelete),
      {
        initialProps: { responsaveis: mockResponsaveis },
      }
    );

    const updatedResponsaveis = [
      {
        ...mockResponsaveis[0],
        nome: 'Responsável Atualizado',
      },
    ];

    rerender({ responsaveis: updatedResponsaveis });

    expect(result.current.gridData[0].nome).toBe('Responsável Atualizado');
  });
});
```

## Utilitários

### 1. Validations
```typescript
// src/app/diagnostico/utils/__tests__/validations.test.ts
import { validateResponsavel, validateMedida, validateControle } from '../validations';

describe('validations', () => {
  describe('validateResponsavel', () => {
    it('should validate a valid responsavel', () => {
      const responsavel = {
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate responsavel with missing required fields', () => {
      const responsavel = {
        nome: '',
        email: '',
        cargo: '',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        email: 'Email é obrigatório',
        cargo: 'Cargo é obrigatório',
      });
    });

    it('should validate responsavel with invalid email', () => {
      const responsavel = {
        nome: 'Responsável Teste',
        email: 'email-invalido',
        cargo: 'Analista',
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Email inválido',
      });
    });

    it('should validate responsavel with long fields', () => {
      const responsavel = {
        nome: 'a'.repeat(256),
        email: 'teste@exemplo.com',
        cargo: 'a'.repeat(256),
      };

      const result = validateResponsavel(responsavel);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
        cargo: 'Cargo deve ter no máximo 255 caracteres',
      });
    });
  });

  describe('validateMedida', () => {
    it('should validate a valid medida', () => {
      const medida = {
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate medida with missing required fields', () => {
      const medida = {
        nome: '',
        controle: 0,
        programa: 0,
        status: '',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        controle: 'Controle é obrigatório',
        programa: 'Programa é obrigatório',
        status: 'Status é obrigatório',
      });
    });

    it('should validate medida with invalid status', () => {
      const medida = {
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'status-invalido',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        status: 'Status inválido',
      });
    });

    it('should validate medida with long fields', () => {
      const medida = {
        nome: 'a'.repeat(256),
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = validateMedida(medida);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
      });
    });
  });

  describe('validateControle', () => {
    it('should validate a valid controle', () => {
      const controle = {
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate controle with missing required fields', () => {
      const controle = {
        nome: '',
        descricao: '',
        status: '',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome é obrigatório',
        descricao: 'Descrição é obrigatória',
        status: 'Status é obrigatório',
      });
    });

    it('should validate controle with invalid status', () => {
      const controle = {
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'status-invalido',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        status: 'Status inválido',
      });
    });

    it('should validate controle with long fields', () => {
      const controle = {
        nome: 'a'.repeat(256),
        descricao: 'a'.repeat(1001),
        status: 'ativo',
      };

      const result = validateControle(controle);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        nome: 'Nome deve ter no máximo 255 caracteres',
        descricao: 'Descrição deve ter no máximo 1000 caracteres',
      });
    });
  });
});

### 2. Transformations
```typescript
// src/app/diagnostico/utils/__tests__/transformations.test.ts
import { transformResponsavel, transformMedida, transformControle } from '../transformations';

describe('transformations', () => {
  describe('transformResponsavel', () => {
    it('should transform responsavel data correctly', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle responsavel with missing optional fields', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle responsavel with invalid dates', () => {
      const responsavel = {
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformResponsavel(responsavel);

      expect(result).toEqual({
        id: 1,
        nome: 'Responsável Teste',
        email: 'teste@exemplo.com',
        cargo: 'Analista',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });

  describe('transformMedida', () => {
    it('should transform medida data correctly', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle medida with missing optional fields', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle medida with invalid dates', () => {
      const medida = {
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformMedida(medida);

      expect(result).toEqual({
        id: 1,
        nome: 'Medida Teste',
        controle: 1,
        programa: 1,
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });

  describe('transformControle', () => {
    it('should transform controle data correctly', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: new Date('2024-01-01'),
        data_atualizacao: new Date('2024-01-01'),
      });
    });

    it('should handle controle with missing optional fields', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });

    it('should handle controle with invalid dates', () => {
      const controle = {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: 'data-invalida',
        data_atualizacao: 'data-invalida',
      };

      const result = transformControle(controle);

      expect(result).toEqual({
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: null,
        data_atualizacao: null,
      });
    });
  });
});
```

## Referências

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheatsheet](https://devhints.io/jest)

### Componentes

#### DiagnosticoComponent

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import DiagnosticoComponent from '../DiagnosticoComponent';

describe('DiagnosticoComponent', () => {
  const mockProps = {
    diagnostico: {
      id: 1,
      nome: 'Diagnóstico Teste',
      descricao: 'Descrição do diagnóstico',
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
    controles: [
      {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
        status: 'ativo',
        data_criacao: '2024-01-01',
        data_atualizacao: '2024-01-01',
      },
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
    expect(screen.getByText('Descrição do diagnóstico')).toBeInTheDocument();
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

  it('should handle inactive status', () => {
    const propsWithInactiveStatus = {
      ...mockProps,
      diagnostico: {
        ...mockProps.diagnostico,
        status: 'inativo',
      },
    };

    render(<DiagnosticoComponent {...propsWithInactiveStatus} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
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
          nome: 'Controle Teste 2',
          descricao: 'Descrição do controle 2',
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
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
        nome: 'a'.repeat(100),
        descricao: 'a'.repeat(1000),
      },
    };

    render(<DiagnosticoComponent {...propsWithLongText} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
});
```

#### ControleComponent

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ControleComponent from '../ControleComponent';

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

#### MedidaComponent

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MedidaComponent from '../MedidaComponent';

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

#### ResponsavelComponent

```typescript
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
```

#### DiagnosticoContainer

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import DiagnosticoContainer from '../DiagnosticoContainer';
import { useDiagnosticoGrid } from '../../hooks/useDiagnosticoGrid';
import { useDiagnosticoControles } from '../../hooks/useDiagnosticoControles';
import { calculateSumOfResponsesForDiagnostico } from '../../utils/calculations';
import { getMaturityLabel } from '../../utils/maturity';

// Mock dos hooks e funções
jest.mock('../../hooks/useDiagnosticoControles');
jest.mock('../../utils/calculations');
jest.mock('../../utils/maturity');
jest.mock('../../hooks/useDiagnosticoGrid');

describe('DiagnosticoContainer', () => {
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
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: mockGridData,
      handlers: mockHandlers,
    });
  });

  it('should render correctly', () => {
    render(<DiagnosticoContainer />);

    expect(screen.getByText('Diagnóstico Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do diagnóstico')).toBeInTheDocument();
  });

  it('should handle add diagnostico', () => {
    render(<DiagnosticoContainer />);

    fireEvent.click(screen.getByText('Adicionar Diagnóstico'));

    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  it('should handle edit diagnostico', () => {
    render(<DiagnosticoContainer />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockGridData.diagnosticos[0]);
  });

  it('should handle delete diagnostico', () => {
    render(<DiagnosticoContainer />);

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

    render(<DiagnosticoContainer />);

    expect(screen.getByText('Nenhum diagnóstico cadastrado')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        loading: true,
      },
      handlers: mockHandlers,
    });

    render(<DiagnosticoContainer />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        error: 'Erro ao carregar diagnósticos',
      },
      handlers: mockHandlers,
    });

    render(<DiagnosticoContainer />);

    expect(screen.getByText('Erro ao carregar diagnósticos')).toBeInTheDocument();
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

    render(<DiagnosticoContainer />);

    expect(screen.getByText('Diagnóstico Teste')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico Teste 2')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    (useDiagnosticoGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        diagnosticos: [
          {
            ...mockGridData.diagnosticos[0],
            nome: 'a'.repeat(100),
            descricao: 'a'.repeat(1000),
          },
        ],
      },
      handlers: mockHandlers,
    });

    render(<DiagnosticoContainer />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
});
```

#### ControleContainer

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ControleContainer from '../ControleContainer';
import { useControleGrid } from '../../hooks/useControleGrid';
import { useControleMedidas } from '../../hooks/useControleMedidas';

jest.mock('../../hooks/useControleGrid');
jest.mock('../../hooks/useControleMedidas');

describe('ControleContainer', () => {
  const mockGridData = {
    controles: [
      {
        id: 1,
        nome: 'Controle Teste',
        descricao: 'Descrição do controle',
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

  const mockMedidas = [
    {
      id: 1,
      nome: 'Medida Teste',
      controle: 1,
      programa: 1,
      status: 'ativo',
      data_criacao: '2024-01-01',
      data_atualizacao: '2024-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: mockGridData,
      handlers: mockHandlers,
    });
    (useControleMedidas as jest.Mock).mockReturnValue({
      medidas: mockMedidas,
      loading: false,
      error: null,
    });
  });

  it('should render correctly', () => {
    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Descrição do controle')).toBeInTheDocument();
    expect(screen.getByText('Medida Teste')).toBeInTheDocument();
  });

  it('should handle add controle', () => {
    render(<ControleContainer diagnosticoId={1} />);

    fireEvent.click(screen.getByText('Adicionar Controle'));

    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  it('should handle edit controle', () => {
    render(<ControleContainer diagnosticoId={1} />);

    fireEvent.click(screen.getByText('Editar'));

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockGridData.controles[0]);
  });

  it('should handle delete controle', () => {
    render(<ControleContainer diagnosticoId={1} />);

    fireEvent.click(screen.getByText('Excluir'));

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
  });

  it('should handle empty controles', () => {
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        controles: [],
      },
      handlers: mockHandlers,
    });

    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('Nenhum controle cadastrado')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        loading: true,
      },
      handlers: mockHandlers,
    });

    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        error: 'Erro ao carregar controles',
      },
      handlers: mockHandlers,
    });

    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('Erro ao carregar controles')).toBeInTheDocument();
  });

  it('should handle multiple controles', () => {
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        controles: [
          ...mockGridData.controles,
          {
            id: 2,
            nome: 'Controle Teste 2',
            descricao: 'Descrição do controle 2',
            status: 'ativo',
            data_criacao: '2024-01-01',
            data_atualizacao: '2024-01-01',
          },
        ],
      },
      handlers: mockHandlers,
    });

    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('Controle Teste')).toBeInTheDocument();
    expect(screen.getByText('Controle Teste 2')).toBeInTheDocument();
  });

  it('should handle long text', () => {
    (useControleGrid as jest.Mock).mockReturnValue({
      gridData: {
        ...mockGridData,
        controles: [
          {
            ...mockGridData.controles[0],
            nome: 'a'.repeat(100),
            descricao: 'a'.repeat(1000),
          },
        ],
      },
      handlers: mockHandlers,
    });

    render(<ControleContainer diagnosticoId={1} />);

    expect(screen.getByText('a'.repeat(100))).toBeInTheDocument();
    expect(screen.getByText('a'.repeat(1000))).toBeInTheDocument();
  });
});
```

#### ResponsavelContainer

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';
import { useResponsavelGrid } from '../../hooks/useResponsavelGrid';
import { validateResponsavel } from '../../utils/validations';

jest.mock('../../hooks/useResponsavelGrid');
jest.mock('../../utils/validations');

describe('ResponsavelContainer', () => {
  const mockProps = {
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
  });

  it('should render correctly with props', () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Responsável Teste')).toBeInTheDocument();
    expect(screen.getByText('teste@exemplo.com')).toBeInTheDocument();
    expect(screen.getByText('Analista')).toBeInTheDocument();
  });

  it('should handle responsavel add', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
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
  });

  it('should handle responsavel edit', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    const editButton = screen.getByText('Editar');
    fireEvent.click(editButton);
    
    const nomeInput = screen.getByLabelText('Nome');
    fireEvent.change(nomeInput, { target: { value: 'Responsável Editado' } });
    
    const submitButton = screen.getByText('Salvar');
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
  });

  it('should handle responsavel delete', async () => {
    render(<ResponsavelContainer {...mockProps} />);
    
    const deleteButton = screen.getByText('Excluir');
    fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockProps.handleResponsavelDelete).toHaveBeenCalledWith(1);
    });
  });

  it('should validate responsavel data', async () => {
    (validateResponsavel as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['Nome é obrigatório'],
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    const addButton = screen.getByText('Adicionar Responsável');
    fireEvent.click(addButton);
    
    const submitButton = screen.getByText('Salvar');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(mockProps.handleResponsavelAdd).not.toHaveBeenCalled();
    });
  });

  it('should handle loading state', () => {
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
  });

  it('should handle error state', () => {
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: [],
      loading: false,
      error: 'Erro ao carregar responsáveis',
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Erro ao carregar responsáveis')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    (useResponsavelGrid as jest.Mock).mockReturnValue({
      gridData: [],
      loading: false,
      error: null,
      handleAdd: mockProps.handleResponsavelAdd,
      handleEdit: mockProps.handleResponsavelEdit,
      handleDelete: mockProps.handleResponsavelDelete,
    });
    
    render(<ResponsavelContainer {...mockProps} />);
    
    expect(screen.getByText('Nenhum responsável cadastrado')).toBeInTheDocument();
  });
});
```

#### ResponsavelContainer

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResponsavelContainer } from '../ResponsavelContainer';
import { useResponsavelGrid } from '../../hooks/useResponsavelGrid';
import { validateResponsavel } from '../../utils/validations';

jest.mock('../../hooks/useResponsavelGrid');
jest.mock('../../utils/validations');

describe('ResponsavelContainer', () => {
  const mockProps = {
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

## Testes de Componentes de Diagnóstico

### DiagnosticoComponent

```typescript
// Testes de renderização
describe('DiagnosticoComponent', () => {
  it('deve renderizar corretamente com dados válidos', () => {
    const mockDiagnostico = {
      id: 1,
      descricao: 'Teste Diagnóstico',
      programaId: 1
    };
    
    const mockControles = [
      {
        id: 1,
        nome: 'Controle 1',
        texto: 'Descrição do controle 1'
      }
    ];

    render(
      <DiagnosticoComponent
        diagnostico={mockDiagnostico}
        controles={mockControles}
        onControleClick={jest.fn()}
        onAddControle={jest.fn()}
        onEditDiagnostico={jest.fn()}
        onDeleteDiagnostico={jest.fn()}
      />
    );

    expect(screen.getByText('Teste Diagnóstico')).toBeInTheDocument();
    expect(screen.getByText('Controle 1')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há controles', () => {
    const mockDiagnostico = {
      id: 1,
      descricao: 'Teste Diagnóstico',
      programaId: 1
    };

    render(
      <DiagnosticoComponent
        diagnostico={mockDiagnostico}
        controles={[]}
        onControleClick={jest.fn()}
        onAddControle={jest.fn()}
        onEditDiagnostico={jest.fn()}
        onDeleteDiagnostico={jest.fn()}
      />
    );

    expect(screen.getByText('Nenhum controle cadastrado')).toBeInTheDocument();
  });

  it('deve chamar handlers corretamente', () => {
    const mockDiagnostico = {
      id: 1,
      descricao: 'Teste Diagnóstico',
      programaId: 1
    };
    
    const mockControles = [
      {
        id: 1,
        nome: 'Controle 1',
        texto: 'Descrição do controle 1'
      }
    ];

    const onControleClick = jest.fn();
    const onAddControle = jest.fn();
    const onEditDiagnostico = jest.fn();
    const onDeleteDiagnostico = jest.fn();

    render(
      <DiagnosticoComponent
        diagnostico={mockDiagnostico}
        controles={mockControles}
        onControleClick={onControleClick}
        onAddControle={onAddControle}
        onEditDiagnostico={onEditDiagnostico}
        onDeleteDiagnostico={onDeleteDiagnostico}
      />
    );

    fireEvent.click(screen.getByText('Adicionar Controle'));
    expect(onAddControle).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Editar'));
    expect(onEditDiagnostico).toHaveBeenCalledWith(mockDiagnostico);

    fireEvent.click(screen.getByText('Excluir'));
    expect(onDeleteDiagnostico).toHaveBeenCalledWith(mockDiagnostico.id);
  });
});
```

### DiagnosticoContainer

```typescript
describe('DiagnosticoContainer', () => {
  const mockDiagnostico = {
    id: 1,
    descricao: 'Teste Diagnóstico',
    programaId: 1
  };

  const mockPrograma = {
    id: 1,
    nome: 'Programa Teste'
  };

  const mockState = {
    controles: {
      1: [
        {
          id: 1,
          nome: 'Controle 1',
          texto: 'Descrição do controle 1'
        }
      ]
    },
    medidas: {},
    loading: false,
    error: null
  };

  it('deve buscar controles ao montar', () => {
    const handleControleFetch = jest.fn();
    
    render(
      <DiagnosticoContainer
        diagnostico={mockDiagnostico}
        programa={mockPrograma}
        state={mockState}
        handleControleFetch={handleControleFetch}
        handleINCCChange={jest.fn()}
        handleMedidaFetch={jest.fn()}
        handleMedidaChange={jest.fn()}
        responsaveis={[]}
      />
    );

    expect(handleControleFetch).toHaveBeenCalledWith(mockPrograma.id, mockDiagnostico.id);
  });

  it('deve calcular maturidade corretamente', () => {
    const mockStateWithResponses = {
      ...mockState,
      medidas: {
        1: [
          {
            id: 1,
            resposta: 3
          }
        ]
      }
    };

    render(
      <DiagnosticoContainer
        diagnostico={mockDiagnostico}
        programa={mockPrograma}
        state={mockStateWithResponses}
        handleControleFetch={jest.fn()}
        handleINCCChange={jest.fn()}
        handleMedidaFetch={jest.fn()}
        handleMedidaChange={jest.fn()}
        responsaveis={[]}
      />
    );

    // Verificar se o cálculo de maturidade está correto
    expect(screen.getByText(/Maturidade:/)).toBeInTheDocument();
  });
});
```

### ControleContainer

```typescript
describe('ControleContainer', () => {
  const mockControle = {
    id: 1,
    nome: 'Controle Teste',
    texto: 'Descrição do controle'
  };

  const mockDiagnostico = {
    id: 1,
    descricao: 'Diagnóstico Teste',
    programaId: 1
  };

  const mockState = {
    medidas: {
      1: [
        {
          id: 1,
          medida: 'Medida 1',
          resposta: 3
        }
      ]
    },
    loading: false,
    error: null
  };

  it('deve buscar medidas ao montar', () => {
    const handleMedidaFetch = jest.fn();
    
    render(
      <ControleContainer
        controle={mockControle}
        diagnostico={mockDiagnostico}
        programaId={1}
        state={mockState}
        handleINCCChange={jest.fn()}
        handleMedidaFetch={handleMedidaFetch}
        handleMedidaChange={jest.fn()}
        responsaveis={[]}
      />
    );

    expect(handleMedidaFetch).toHaveBeenCalledWith(mockControle.id, 1);
  });

  it('deve atualizar medidas quando state mudar', () => {
    const { rerender } = render(
      <ControleContainer
        controle={mockControle}
        diagnostico={mockDiagnostico}
        programaId={1}
        state={mockState}
        handleINCCChange={jest.fn()}
        handleMedidaFetch={jest.fn()}
        handleMedidaChange={jest.fn()}
        responsaveis={[]}
      />
    );

    const newState = {
      ...mockState,
      medidas: {
        1: [
          {
            id: 1,
            medida: 'Medida Atualizada',
            resposta: 4
          }
        ]
      }
    };

    rerender(
      <ControleContainer
        controle={mockControle}
        diagnostico={mockDiagnostico}
        programaId={1}
        state={newState}
        handleINCCChange={jest.fn()}
        handleMedidaFetch={jest.fn()}
        handleMedidaChange={jest.fn()}
        responsaveis={[]}
      />
    );

    expect(screen.getByText('Medida Atualizada')).toBeInTheDocument();
  });

  it('deve chamar handlers corretamente', () => {
    const handleINCCChange = jest.fn();
    const handleMedidaChange = jest.fn();

    render(
      <ControleContainer
        controle={mockControle}
        diagnostico={mockDiagnostico}
        programaId={1}
        state={mockState}
        handleINCCChange={handleINCCChange}
        handleMedidaFetch={jest.fn()}
        handleMedidaChange={handleMedidaChange}
        responsaveis={[]}
      />
    );

    // Simular mudança de INCC
    fireEvent.change(screen.getByLabelText(/INCC/), { target: { value: '4' } });
    expect(handleINCCChange).toHaveBeenCalledWith(1, mockDiagnostico.id, 4);

    // Simular mudança de medida
    fireEvent.change(screen.getByLabelText(/Medida/), { target: { value: 'Nova Medida' } });
    expect(handleMedidaChange).toHaveBeenCalledWith(1, mockControle.id, 1, 'nome', 'Nova Medida');
  });
});
```