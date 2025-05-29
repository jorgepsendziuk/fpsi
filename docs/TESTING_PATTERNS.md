# Padrões de Teste - FPSI

## Visão Geral

Este documento descreve os padrões de teste utilizados no projeto FPSI. Os padrões são baseados em boas práticas e experiências do time.

## Padrões de Componentes

### 1. Container/Presenter

#### 1.1 Container
```typescript
// src/app/diagnostico/containers/__tests__/DiagnosticoContainer.test.tsx
describe('DiagnosticoContainer', () => {
  it('should manage state correctly', () => {
    // Testar gerenciamento de estado
  });

  it('should handle side effects', () => {
    // Testar efeitos colaterais
  });

  it('should pass props to presenter', () => {
    // Testar passagem de props
  });
});
```

#### 1.2 Presenter
```typescript
// src/app/diagnostico/components/__tests__/DiagnosticoComponent.test.tsx
describe('DiagnosticoComponent', () => {
  it('should render correctly', () => {
    // Testar renderização
  });

  it('should handle user interactions', () => {
    // Testar interações
  });

  it('should display data correctly', () => {
    // Testar exibição de dados
  });
});
```

### 2. Hooks

#### 2.1 Custom Hooks
```typescript
// src/app/diagnostico/hooks/__tests__/useDiagnosticoControles.test.ts
describe('useDiagnosticoControles', () => {
  it('should return initial state', () => {
    // Testar estado inicial
  });

  it('should handle updates', () => {
    // Testar atualizações
  });

  it('should handle side effects', () => {
    // Testar efeitos colaterais
  });
});
```

#### 2.2 Context Hooks
```typescript
// src/app/diagnostico/hooks/__tests__/useDiagnosticoContext.test.ts
describe('useDiagnosticoContext', () => {
  it('should provide context values', () => {
    // Testar valores do contexto
  });

  it('should handle context updates', () => {
    // Testar atualizações do contexto
  });
});
```

### 3. Utilitários

#### 3.1 Funções Puras
```typescript
// src/app/diagnostico/utils/__tests__/calculations.test.ts
describe('calculations', () => {
  it('should calculate correctly', () => {
    // Testar cálculos
  });

  it('should handle edge cases', () => {
    // Testar casos de borda
  });
});
```

#### 3.2 Transformações
```typescript
// src/app/diagnostico/utils/__tests__/transformations.test.ts
describe('transformations', () => {
  it('should transform data correctly', () => {
    // Testar transformações
  });

  it('should handle invalid data', () => {
    // Testar dados inválidos
  });
});
```

## Padrões de Integração

### 1. Fluxos

#### 1.1 Criação
```typescript
// src/app/diagnostico/__tests__/flows.test.tsx
describe('Diagnostico Creation Flow', () => {
  it('should create diagnostico', () => {
    // Testar criação
  });

  it('should handle validation', () => {
    // Testar validação
  });

  it('should handle errors', () => {
    // Testar erros
  });
});
```

#### 1.2 Atualização
```typescript
describe('Diagnostico Update Flow', () => {
  it('should update diagnostico', () => {
    // Testar atualização
  });

  it('should handle conflicts', () => {
    // Testar conflitos
  });
});
```

### 2. Interações

#### 2.1 Usuário
```typescript
describe('User Interactions', () => {
  it('should handle user input', () => {
    // Testar input
  });

  it('should handle user actions', () => {
    // Testar ações
  });
});
```

#### 2.2 Sistema
```typescript
describe('System Interactions', () => {
  it('should handle API calls', () => {
    // Testar chamadas API
  });

  it('should handle state updates', () => {
    // Testar atualizações de estado
  });
});
```

## Padrões de Mock

### 1. Dados

#### 1.1 Fixtures
```typescript
// src/app/diagnostico/__tests__/fixtures.ts
export const mockDiagnostico = {
  id: 1,
  nome: 'Teste',
  // ...
};

export const mockControles = [
  {
    id: 1,
    nome: 'Teste',
    // ...
  },
];
```

#### 1.2 Factories
```typescript
// src/app/diagnostico/__tests__/factories.ts
export const createDiagnostico = (overrides = {}) => ({
  id: 1,
  nome: 'Teste',
  ...overrides,
});
```

### 2. Funções

#### 2.1 Handlers
```typescript
// src/app/diagnostico/__tests__/handlers.ts
export const mockHandlers = {
  handleControleFetch: jest.fn(),
  handleINCCChange: jest.fn(),
  // ...
};
```

#### 2.2 Utilitários
```typescript
// src/app/diagnostico/__tests__/utils.ts
export const mockUtils = {
  calculateSumOfResponsesForDiagnostico: jest.fn(),
  getMaturityLabel: jest.fn(),
  // ...
};
```

## Padrões de Assertion

### 1. Renderização

#### 1.1 Elementos
```typescript
expect(screen.getByText('Teste')).toBeInTheDocument();
expect(screen.getByTestId('test-id')).toBeInTheDocument();
expect(screen.queryByText('Teste')).not.toBeInTheDocument();
```

#### 1.2 Atributos
```typescript
expect(element).toHaveAttribute('data-testid', 'test-id');
expect(element).toHaveClass('test-class');
expect(element).toHaveStyle({ color: 'red' });
```

### 2. Estado

#### 2.1 Props
```typescript
expect(mockFn).toHaveBeenCalledWith(prop1, prop2);
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).not.toHaveBeenCalled();
```

#### 2.2 Hooks
```typescript
expect(result.current.value).toBe(expected);
expect(result.current.setValue).toBeDefined();
```

## Padrões de Organização

### 1. Estrutura

```
src/
  app/
    diagnostico/
      containers/
        __tests__/
          DiagnosticoContainer.test.tsx
          DiagnosticoContainer.integration.test.tsx
      components/
        __tests__/
          DiagnosticoComponent.test.tsx
      hooks/
        __tests__/
          useDiagnosticoControles.test.ts
      utils/
        __tests__/
          calculations.test.ts
          maturity.test.ts
      __tests__/
        fixtures.ts
        factories.ts
        handlers.ts
        utils.ts
```

### 2. Nomenclatura

- `[nome].test.tsx`: Testes unitários
- `[nome].integration.test.tsx`: Testes de integração
- `[nome].snapshot.test.tsx`: Testes de snapshot
- `[nome].e2e.test.tsx`: Testes end-to-end

## Referências

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheatsheet](https://devhints.io/jest) 