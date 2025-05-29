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
```

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
```

### 2. Hooks

#### 2.1 useDiagnosticoControles
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

### 3. Utilitários

#### 3.1 calculations
```typescript
// src/app/diagnostico/utils/__tests__/calculations.test.ts
import { calculateSumOfResponsesForDiagnostico } from '../calculations';

describe('calculations', () => {
  const mockState = {
    controles: {
      1: [
        {
          id: 1,
          nome: 'Controle Teste',
          programa: 1,
          diagnostico: 1,
          incc: 50,
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
        {
          id: 2,
          nome: 'Controle Teste 2',
          programa: 1,
          diagnostico: 1,
          incc: 75,
          status: 'ativo',
          data_criacao: '2024-01-01',
          data_atualizacao: '2024-01-01',
        },
      ],
    },
  };

  it('should calculate sum correctly', () => {
    const result = calculateSumOfResponsesForDiagnostico(1, mockState);
    expect(result).toBe(125);
  });

  it('should handle empty state', () => {
    const result = calculateSumOfResponsesForDiagnostico(1, { controles: {} });
    expect(result).toBe(0);
  });

  it('should handle invalid diagnostico', () => {
    const result = calculateSumOfResponsesForDiagnostico(999, mockState);
    expect(result).toBe(0);
  });
});
```

#### 3.2 maturity
```typescript
// src/app/diagnostico/utils/__tests__/maturity.test.ts
import { getMaturityLabel } from '../maturity';

describe('maturity', () => {
  it('should return correct label for score', () => {
    expect(getMaturityLabel(0)).toBe('Inicial');
    expect(getMaturityLabel(25)).toBe('Inicial');
    expect(getMaturityLabel(50)).toBe('Intermediário');
    expect(getMaturityLabel(75)).toBe('Avançado');
    expect(getMaturityLabel(100)).toBe('Excelente');
  });

  it('should handle invalid scores', () => {
    expect(getMaturityLabel(-1)).toBe('Inicial');
    expect(getMaturityLabel(101)).toBe('Excelente');
  });
});
```

## Referências

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheatsheet](https://devhints.io/jest) 