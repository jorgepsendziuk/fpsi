# Technical Reference Document (TRD) - FPSI

## 1. Arquitetura do Sistema

### 1.1 Visão Geral
O FPSI é uma aplicação web moderna construída com Next.js, utilizando uma arquitetura baseada em componentes React e seguindo o padrão de design Material-UI. O sistema é estruturado em camadas bem definidas:

- **Frontend**: Next.js com React e Material-UI
- **Backend**: Supabase (Autenticação e Banco de Dados)
- **Estado**: Gerenciamento de estado distribuído entre componentes

### 1.2 Estrutura de Diretórios
```
src/
├── app/                    # Aplicação principal
│   ├── diagnostico/       # Módulo de diagnóstico
│   │   ├── components/    # Componentes React
│   │   ├── containers/    # Containers de lógica
│   │   └── types/        # Definições de tipos
├── components/            # Componentes compartilhados
├── contexts/             # Contextos React
├── providers/            # Provedores de serviços
└── utils/               # Utilitários
```

### 1.3 Padrões de Design
- **Container/Presenter**: Separação de lógica e apresentação
- **Context API**: Gerenciamento de estado global
- **Componentes Funcionais**: Uso de hooks React
- **TypeScript**: Tipagem estática

## 2. APIs e Endpoints

### 2.1 Supabase
- **Autenticação**: `/auth/*`
- **Banco de Dados**: `/rest/v1/*`

### 2.2 Endpoints Principais
- **Diagnósticos**: `/api/diagnosticos`
- **Controles**: `/api/controles`
- **Medidas**: `/api/medidas`
- **Responsáveis**: `/api/responsaveis`

## 3. Contratos de Comunicação

### 3.1 Tipos de Dados
```typescript
interface Diagnostico {
  id: number;
  nome: string;
  cor: string;
  // ... outros campos
}

interface Controle {
  id: number;
  numero: string;
  nome: string;
  nivel?: number;
  programa_controle_id?: number;
  // ... outros campos
}

interface Medida {
  id: number;
  nome: string;
  status: string;
  // ... outros campos
}

interface Responsavel {
  id: number;
  nome: string;
  departamento: string;
  email: string;
  // ... outros campos
}
```

### 3.2 Fluxos de Dados
1. **Autenticação**
   - Login via Supabase
   - Gerenciamento de sessão
   - Proteção de rotas

2. **Diagnóstico**
   - Carregamento de dados
   - Cálculo de maturidade
   - Atualização de controles

3. **Controles**
   - Gerenciamento de NCC
   - Atualização de medidas
   - Cálculo de índices

## 4. Fluxos de Dados

### 4.1 Fluxo Principal
1. Usuário acessa o sistema
2. Autenticação via Supabase
3. Carregamento de diagnósticos
4. Interação com controles
5. Atualização de medidas
6. Cálculo de maturidade

### 4.2 Fluxos Secundários
- Gerenciamento de responsáveis
- Exportação de relatórios
- Configurações do sistema

## 5. Dependências Externas

### 5.1 Frontend
- **Next.js**: Framework React
- **Material-UI**: Componentes de UI
- **TypeScript**: Linguagem de programação
- **React**: Biblioteca de UI
- **Refine**: Framework de admin

### 5.2 Backend
- **Supabase**: Plataforma backend
- **PostgreSQL**: Banco de dados

### 5.3 Utilitários
- **dayjs**: Manipulação de datas
- **@mui/x-data-grid**: Grid de dados
- **@mui/x-date-pickers**: Seletores de data

## 6. Segurança

### 6.1 Autenticação
- Autenticação via Supabase
- Proteção de rotas
- Gerenciamento de sessão

### 6.2 Autorização
- Controle de acesso baseado em perfil
- Validação de permissões
- Proteção de endpoints

### 6.3 Dados
- Criptografia de dados sensíveis
- Validação de inputs
- Sanitização de dados

## 7. Performance

### 7.1 Otimizações
- Lazy loading de componentes
- Caching de dados
- Otimização de consultas

### 7.2 Monitoramento
- Logs de erro
- Métricas de performance
- Rastreamento de sessão

## 8. Manutenção

### 8.1 Código
- Padrões de código
- Documentação inline
- Testes unitários

### 8.2 Deploy
- CI/CD via GitHub
- Ambiente de staging
- Rollback automático 