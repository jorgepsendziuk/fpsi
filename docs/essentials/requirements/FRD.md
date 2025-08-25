# Functional Requirements Document (FRD) - FPSI

## 1. Módulos do Sistema

### 1.1 Módulo de Autenticação
#### Funcionalidades
- Login de usuários
- Gerenciamento de sessão
- Recuperação de senha
- Proteção de rotas

#### Fluxos de Usuário
1. Acesso à página de login
2. Inserção de credenciais
3. Validação de autenticação
4. Redirecionamento para dashboard

#### Regras de Negócio
- Credenciais válidas são requeridas para acesso
- Sessões expiram após período de inatividade
- Tentativas de login são limitadas

### 1.2 Módulo de Diagnóstico
#### Funcionalidades
- Visualização de diagnósticos
- Cálculo de maturidade
- Gerenciamento de controles
- Acompanhamento de evolução

#### Fluxos de Usuário
1. Seleção de diagnóstico
2. Visualização de controles
3. Atualização de níveis NCC
4. Registro de medidas
5. Cálculo de maturidade

#### Regras de Negócio
- Cada diagnóstico possui controles específicos
- Níveis NCC seguem escala predefinida
- Índice de maturidade é calculado automaticamente

### 1.3 Módulo de Controles
#### Funcionalidades
- Cadastro de controles
- Definição de níveis NCC
- Gestão de medidas
- Atribuição de responsáveis

#### Fluxos de Usuário
1. Criação de controle
2. Definição de nível NCC
3. Registro de medidas
4. Atribuição de responsáveis
5. Acompanhamento de status

#### Regras de Negócio
- Controles são organizados por categorias
- Níveis NCC são obrigatórios
- Medidas devem ter responsáveis definidos

### 1.4 Módulo de Responsáveis
#### Funcionalidades
- Cadastro de responsáveis
- Atribuição a controles
- Gestão de departamentos
- Histórico de atribuições

#### Fluxos de Usuário
1. Cadastro de responsável
2. Definição de departamento
3. Atribuição a controles
4. Acompanhamento de responsabilidades

#### Regras de Negócio
- Responsáveis devem ter email válido
- Departamentos são obrigatórios
- Atribuições são registradas no histórico

## 2. Casos de Uso

### 2.1 Gestão de Diagnósticos
#### Caso de Uso: Realizar Diagnóstico
**Ator**: Usuário autenticado
**Pré-condições**: 
- Usuário está logado
- Diagnóstico existe no sistema

**Fluxo Principal**:
1. Usuário seleciona diagnóstico
2. Sistema carrega controles
3. Usuário avalia controles
4. Sistema calcula maturidade
5. Usuário salva diagnóstico

**Fluxos Alternativos**:
- A: Usuário cancela operação
- B: Sistema detecta erro
- C: Usuário precisa de ajuda

**Pós-condições**:
- Diagnóstico é atualizado
- Índice de maturidade é recalculado

### 2.2 Gestão de Controles
#### Caso de Uso: Atualizar Controle
**Ator**: Usuário autenticado
**Pré-condições**:
- Controle existe no sistema
- Usuário tem permissão

**Fluxo Principal**:
1. Usuário seleciona controle
2. Sistema carrega dados
3. Usuário atualiza informações
4. Sistema valida alterações
5. Usuário confirma atualização

**Fluxos Alternativos**:
- A: Dados inválidos
- B: Conflito de versão
- C: Erro de sistema

**Pós-condições**:
- Controle é atualizado
- Histórico é registrado

## 3. Validações

### 3.1 Validações de Dados
#### Diagnósticos
- Nome é obrigatório
- Cor deve ser válida
- ID deve ser único

#### Controles
- Número é obrigatório
- Nome é obrigatório
- Nível NCC deve ser válido
- Programa deve existir

#### Medidas
- Nome é obrigatório
- Status deve ser válido
- Datas devem ser coerentes
- Responsável deve existir

#### Responsáveis
- Nome é obrigatório
- Email deve ser válido
- Departamento é obrigatório

### 3.2 Validações de Negócio
#### Regras de NCC
- Níveis devem seguir escala
- Alterações são registradas
- Histórico é mantido

#### Regras de Maturidade
- Cálculo considera todos os controles
- Pesos são aplicados corretamente
- Resultados são validados

#### Regras de Responsáveis
- Atribuições são únicas
- Histórico é mantido
- Notificações são enviadas

## 4. Integrações

### 4.1 Integração com Supabase
- Autenticação de usuários
- Persistência de dados
- Gerenciamento de sessão

### 4.2 Integração com Material-UI
- Componentes de interface
- Temas e estilos
- Responsividade

## 5. Relatórios

### 5.1 Relatórios de Diagnóstico
- Resumo de maturidade
- Detalhamento de controles
- Evolução temporal

### 5.2 Relatórios de Controles
- Status por categoria
- Responsáveis por controle
- Medidas pendentes

### 5.3 Relatórios de Responsáveis
- Atribuições atuais
- Histórico de responsabilidades
- Performance de gestão

## 6. Notificações

### 6.1 Tipos de Notificação
- Alterações em controles
- Atribuições de responsáveis
- Prazos de medidas
- Alertas de sistema

### 6.2 Canais de Notificação
- Interface do sistema
- Email
- Dashboard

## 7. Auditoria

### 7.1 Logs de Sistema
- Ações de usuários
- Alterações em dados
- Erros e exceções

### 7.2 Rastreabilidade
- Histórico de alterações
- Responsáveis por mudanças
- Justificativas de alterações 