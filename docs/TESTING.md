# Guia de Testes - FPSI

## Visão Geral

Este guia descreve as práticas e padrões de teste utilizados no projeto FPSI. O objetivo é garantir a qualidade do código, facilitar a manutenção e prevenir regressões.

## Estrutura

### 1. Testes Unitários

#### 1.1 Componentes
```typescript
// src/app/diagnostico/containers/__tests__/DiagnosticoContainer.test.tsx
describe('DiagnosticoContainer', () => {
  // Setup
  beforeEach(() => {
    // ...
  });

  // Testes
  it('should render correctly', () => {
    // ...
  });

  it('should handle state updates', () => {
    // ...
  });
});
```

#### 1.2 Hooks
```typescript
// src/app/diagnostico/hooks/__tests__/useDiagnosticoControles.test.ts
describe('useDiagnosticoControles', () => {
  // Setup
  beforeEach(() => {
    // ...
  });

  // Testes
  it('should return controles', () => {
    // ...
  });

  it('should handle updates', () => {
    // ...
  });
});
```

#### 1.3 Utilitários
```typescript
// src/app/diagnostico/utils/__tests__/calculations.test.ts
describe('calculations', () => {
  // Setup
  beforeEach(() => {
    // ...
  });

  // Testes
  it('should calculate correctly', () => {
    // ...
  });

  it('should handle edge cases', () => {
    // ...
  });
});
```

### 2. Testes de Integração

#### 2.1 Componentes
```typescript
// src/app/diagnostico/containers/__tests__/DiagnosticoContainer.integration.test.tsx
describe('DiagnosticoContainer Integration', () => {
  // Setup
  beforeEach(() => {
    // ...
  });

  // Testes
  it('should integrate with DiagnosticoComponent', () => {
    // ...
  });

  it('should handle state updates', () => {
    // ...
  });
});
```

#### 2.2 Fluxos
```typescript
// src/app/diagnostico/__tests__/flows.test.tsx
describe('Diagnostico Flows', () => {
  // Setup
  beforeEach(() => {
    // ...
  });

  // Testes
  it('should handle diagnostico creation', () => {
    // ...
  });

  it('should handle controle updates', () => {
    // ...
  });
});
```

## Padrões

### 1. Setup

#### 1.1 Mocks
```typescript
// Mock de módulos
jest.mock('../../hooks/useDiagnosticoControles');
jest.mock('../../utils/calculations');

// Mock de funções
const mockFn = jest.fn();
mockFn.mockReturnValue(value);
mockFn.mockImplementation(() => {});
```

#### 1.2 Props
```typescript
const mockProps = {
  diagnostico: {
    id: 1,
    nome: 'Teste',
    // ...
  },
  // ...
};
```

#### 1.3 Estado
```typescript
const mockState = {
  controles: {
    1: [
      {
        id: 1,
        nome: 'Teste',
        // ...
      },
    ],
  },
  // ...
};
```

### 2. Assertions

#### 2.1 Renderização
```typescript
expect(screen.getByText('Teste')).toBeInTheDocument();
expect(screen.queryByText('Teste')).not.toBeInTheDocument();
expect(screen.getByTestId('test-id')).toBeInTheDocument();
```

#### 2.2 Eventos
```typescript
fireEvent.click(element);
fireEvent.change(element, { target: { value: 'test' } });
fireEvent.submit(form);
```

#### 2.3 Estado
```typescript
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(1);
```

### 3. Async

#### 3.1 Wait
```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

#### 3.2 Timeout
```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 1000 });
```

## Cobertura

### 1. Métricas

- Componentes: > 80%
- Hooks: > 90%
- Utilitários: > 95%
- Integração: > 70%

### 2. Relatórios

```bash
# Gerar relatório de cobertura
npm test -- --coverage

# Gerar relatório HTML
npm test -- --coverage --coverageReporters=html
```

## Boas Práticas

### 1. Organização

- Testes próximos ao código
- Nomenclatura clara
- Setup isolado
- Limpeza após testes

### 2. Isolamento

- Mockar dependências
- Limpar estado
- Resetar mocks
- Evitar side effects

### 3. Assertions

- Testar comportamento
- Evitar detalhes de implementação
- Cobrir casos de erro
- Validar side effects

### 4. Performance

- Evitar testes lentos
- Usar mocks apropriados
- Limitar timeouts
- Otimizar setup

## Troubleshooting

### 1. Erros Comuns

#### 1.1 "Cannot find module"
```bash
# Verificar paths
npm test -- --moduleNameMapper='{"^@/(.*)$": "<rootDir>/src/$1"}'
```

#### 1.2 "Test environment"
```bash
# Configurar ambiente
npm test -- --testEnvironment=jsdom
```

#### 1.3 "Async operations"
```typescript
// Usar waitFor
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

### 2. Debugging

#### 2.1 Console
```typescript
console.log(element);
console.debug(props);
```

#### 2.2 Debugger
```typescript
debugger;
```

#### 2.3 Screenshots
```typescript
screen.debug();
```

## Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheatsheet](https://devhints.io/jest) 