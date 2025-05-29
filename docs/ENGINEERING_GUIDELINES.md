# Engineering Guidelines - FPSI

## 1. Padrões de Código

### 1.1 Estrutura de Arquivos
```
src/
├── app/                    # Aplicação principal
│   ├── [module]/          # Módulos da aplicação
│   │   ├── components/    # Componentes React
│   │   ├── containers/    # Containers de lógica
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── types/        # Definições de tipos
│   │   └── utils/        # Utilitários do módulo
├── components/            # Componentes compartilhados
├── contexts/             # Contextos React
├── providers/            # Provedores de serviços
└── utils/               # Utilitários globais
```

### 1.2 Convenções de Nomenclatura
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
  - `UserProfile.tsx`
  - `useAuth.ts`
  - `formatDate.ts`
- **Componentes**: PascalCase
  - `Button`
  - `UserCard`
  - `NavigationMenu`
- **Funções**: camelCase
  - `handleSubmit`
  - `calculateTotal`
  - `formatCurrency`
- **Variáveis**: camelCase
  - `userData`
  - `isLoading`
  - `errorMessage`
- **Tipos/Interfaces**: PascalCase com prefixo I para interfaces
  - `IUser`
  - `ProductType`
  - `ApiResponse`

### 1.3 Formatação
- Usar 2 espaços para indentação
- Máximo de 80 caracteres por linha
- Ponto e vírgula no final de cada declaração
- Aspas simples para strings
- Vírgula final em objetos e arrays
- Espaço após palavras-chave

### 1.4 Imports
```typescript
// 1. Imports do React
import React, { useState, useEffect } from 'react';

// 2. Imports de bibliotecas externas
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// 3. Imports de componentes
import { Button } from '@components/Button';
import { Card } from '@components/Card';

// 4. Imports de hooks
import { useAuth } from '@hooks/useAuth';

// 5. Imports de tipos
import { IUser } from '@types/user';

// 6. Imports de utilitários
import { formatCurrency } from '@utils/format';
```

## 2. Boas Práticas

### 2.1 Componentes React
- Usar componentes funcionais
- Implementar memoização quando necessário
- Separar lógica de apresentação
- Usar TypeScript para props
- Documentar props com JSDoc

```typescript
interface ButtonProps {
  /** Texto do botão */
  label: string;
  /** Função chamada ao clicar */
  onClick: () => void;
  /** Variante do botão */
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### 2.2 Hooks
- Criar hooks personalizados para lógica reutilizável
- Seguir convenção de nomenclatura `use*`
- Documentar parâmetros e retornos
- Implementar tratamento de erros

```typescript
const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, error, loading };
};
```

### 2.3 Estado
- Usar Context API para estado global
- Manter estado local quando possível
- Implementar memoização para performance
- Usar reducers para lógica complexa

## 3. Processo de Code Review

### 3.1 Checklist
- [ ] Código segue padrões definidos
- [ ] Testes foram implementados
- [ ] Documentação foi atualizada
- [ ] Performance foi considerada
- [ ] Segurança foi verificada
- [ ] Acessibilidade foi testada

### 3.2 Processo
1. Criar branch feature/fix
2. Implementar mudanças
3. Executar testes
4. Criar Pull Request
5. Revisão por pares
6. Aprovação e merge

### 3.3 Template de PR
```markdown
## Descrição
[Descrição das mudanças]

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Adicionei testes para minhas mudanças
- [ ] Atualizei a documentação
- [ ] Todos os testes passam
```

## 4. Testes

### 4.1 Testes Unitários
- Usar Jest e React Testing Library
- Testar componentes isoladamente
- Cobrir casos de sucesso e erro
- Manter cobertura acima de 80%

```typescript
describe('Button', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button label="Click me" onClick={() => {}} />);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button label="Click me" onClick={onClick} />);
    fireEvent.click(getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### 4.2 Testes de Integração
- Testar fluxos completos
- Verificar integrações
- Simular chamadas API
- Validar estados

### 4.3 Testes E2E
- Usar Cypress
- Testar fluxos críticos
- Validar UI/UX
- Verificar responsividade

## 5. Segurança

### 5.1 Autenticação
- Usar JWT com expiração
- Implementar refresh tokens
- Validar sessões
- Sanitizar inputs

### 5.2 Autorização
- Implementar RBAC
- Validar permissões
- Proteger rotas
- Logar acessos

### 5.3 Dados
- Criptografar dados sensíveis
- Validar inputs
- Sanitizar outputs
- Implementar rate limiting

## 6. Pipelines

### 6.1 CI/CD
```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy
```

### 6.2 Ambiente de Desenvolvimento
- Node.js >= 22.0.0
- npm >= 10.0.0
- Git >= 2.0.0
- VS Code com extensões recomendadas

### 6.3 Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

## 7. Documentação

### 7.1 Código
- Documentar funções com JSDoc
- Explicar lógica complexa
- Manter README atualizado
- Documentar decisões técnicas

### 7.2 API
- Documentar endpoints
- Explicar parâmetros
- Fornecer exemplos
- Manter changelog

## 8. Performance

### 8.1 Otimizações
- Implementar lazy loading
- Otimizar imagens
- Usar cache
- Minificar assets

### 8.2 Monitoramento
- Implementar logging
- Monitorar erros
- Rastrear performance
- Analisar métricas 