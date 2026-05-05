# 📚 Documentação FPSI

Documentação técnica completa do Framework de Privacidade e Segurança da Informação.

## 🗂️ Estrutura Organizada

### 📖 **Essenciais** - Documentação principal ativa

#### 🏗️ **[Arquitetura](essentials/architecture/)**
- **[Architecture](essentials/architecture/ARCHITECTURE.md)** - Arquitetura geral do sistema
- **[ADR](essentials/architecture/ADR.md)** - Architectural Decision Records
- **[Engineering Guidelines](essentials/architecture/ENGINEERING_GUIDELINES.md)** - Diretrizes de desenvolvimento

#### 📝 **[Requisitos](essentials/requirements/)**
- **[PRD](essentials/requirements/PRD.md)** - Product Requirements Document
- **[FRD](essentials/requirements/FRD.md)** - Functional Requirements Document  
- **[TRD](essentials/requirements/TRD.md)** - Technical Reference Document

#### 🔧 **[Setup](essentials/setup/)**
- **[Como Rodar Localmente](essentials/setup/COMO_RODAR_LOCALMENTE.md)** - Guia completo de setup
- **[Node Version Fix](essentials/setup/NODE_VERSION_FIX.md)** - Correção de versão do Node
- **[Build Success](essentials/setup/BUILD_CORRIGIDO_SUCESSO.md)** - Resolução de problemas de build
- **[TinyMCE Migration](essentials/setup/TINYMCE_MIGRATION.md)** - Migração do editor

#### 🧪 **[Testes](essentials/testing/)**
- **[Testing Guide](essentials/testing/TESTING.md)** - Guia geral de testes
- **[Testing Plan](essentials/testing/TESTING_PLAN.md)** - Plano de testes
- **[Testing Patterns](essentials/testing/TESTING_PATTERNS.md)** - Padrões de teste
- **[Testing Examples](essentials/testing/TESTING_EXAMPLES.md)** - Exemplos práticos

#### 📊 **[Sistemas](essentials/systems/)**
- **[Sistema Maturidade](essentials/systems/SISTEMA_MATURIDADE.md)** - Sistema principal de maturidade
- **[Sistema Maturidade Inteligente](essentials/systems/SISTEMA_MATURIDADE_INTELIGENTE.md)** - Versão inteligente
- **[Sistema Maturidade Diagnósticos](essentials/systems/SISTEMA_MATURIDADE_DIAGNOSTICOS.md)** - Maturidade específica
- **[Sistema Redesign](essentials/systems/SISTEMA_REDESIGN.md)** - Redesign completo

#### ⚙️ **[Operações](essentials/operations/)**
- **[Operational](essentials/operations/OPERATIONAL.md)** - Documentação operacional

#### 🎮 **[Features em evolução](essentials/features/)**
- **[Escritório de governança (camada visual / PPSI)](essentials/features/OFFICE_RPG_GOVERNANCA.md)** - Metáfora de escritório 2D como interface alternativa ao painel do programa

### 📋 **Guias Práticos**

#### 👑 **[Admin Guide](guides/ADMIN_GUIDE.md)**
Como gerenciar usuários, permissões e administração do sistema

#### 🚀 **Deploy**
- **[Deploy Instructions](guides/DEPLOY_INSTRUCTIONS.md)** - Instruções gerais de deploy
- **[Deploy Vercel](guides/DEPLOY_VERCEL_AGORA.md)** - Deploy específico para Vercel

### 📦 **[Archive](archive/)** - Documentação histórica

Logs de implementação, correções pontuais e documentação de desenvolvimento que foram mantidos para referência histórica:

- **fixes/** - Correções específicas implementadas
- **improvements/** - Melhorias e mudanças implementadas  
- **ui-improvements/** - Melhorias visuais específicas
- **refactoring/** - Logs de refatoração
- **analysis/** - Análises técnicas pontuais
- **organization/** - Logs de organização

## 🚀 **Navegação Rápida**

### 👨‍💻 **Para Desenvolvedores Novos**
1. [Como Rodar Localmente](essentials/setup/COMO_RODAR_LOCALMENTE.md)
2. [Arquitetura](essentials/architecture/ARCHITECTURE.md)
3. [Engineering Guidelines](essentials/architecture/ENGINEERING_GUIDELINES.md)

### 🐛 **Para Debugging**
1. Consulte [Archive](archive/) para correções históricas
2. Veja [Testing](essentials/testing/) para padrões de teste

### 🚀 **Para Implementar Features**
1. [PRD](essentials/requirements/PRD.md) e [FRD](essentials/requirements/FRD.md)
2. [Engineering Guidelines](essentials/architecture/ENGINEERING_GUIDELINES.md)
3. [Testing Patterns](essentials/testing/TESTING_PATTERNS.md)

### 👑 **Para Administração**
1. [Admin Guide](guides/ADMIN_GUIDE.md)
2. [Deploy Instructions](guides/DEPLOY_INSTRUCTIONS.md)

### 📊 **Para Entender Maturidade**
1. [Sistema Maturidade](essentials/systems/SISTEMA_MATURIDADE.md)
2. [Sistema Maturidade Inteligente](essentials/systems/SISTEMA_MATURIDADE_INTELIGENTE.md)

## 📅 **Organização**

Esta nova estrutura foi criada para:
- ✅ Separar documentação ativa de histórica
- ✅ Facilitar navegação para desenvolvedores novos
- ✅ Reduzir ruído de logs de implementação
- ✅ Manter acesso ao histórico quando necessário
- ✅ Organizar por propósito (essenciais, guias, arquivo)