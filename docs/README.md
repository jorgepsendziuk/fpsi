# 📚 Documentação do Projeto FPSI

Este diretório contém toda a documentação técnica e operacional do projeto FPSI (Ferramenta do Framework de Privacidade e Segurança da Informação).

## 📋 Índice Geral

### 🏗️ **Arquitetura e Design**
- [Architecture.md](./architecture/ARCHITECTURE.md) - Arquitetura geral do sistema
- [ADR.md](./architecture/ADR.md) - Architectural Decision Records
- [Engineering Guidelines](./architecture/ENGINEERING_GUIDELINES.md) - Diretrizes de engenharia

### 📝 **Especificações e Requisitos**
- [PRD.md](./requirements/PRD.md) - Product Requirements Document
- [FRD.md](./requirements/FRD.md) - Functional Requirements Document  
- [TRD.md](./requirements/TRD.md) - Technical Reference Document

### 🔧 **Setup e Operação**
- [Como Rodar Localmente](./setup/COMO_RODAR_LOCALMENTE.md) - Guia completo de setup
- [Operational.md](./operations/OPERATIONAL.md) - Documentação operacional
- [Node Version Fix](./setup/NODE_VERSION_FIX.md) - Correção de versão do Node
- [Build Success](./setup/BUILD_CORRIGIDO_SUCESSO.md) - Resolução de problemas de build
- [TinyMCE Migration](./setup/TINYMCE_MIGRATION.md) - Migração do editor TinyMCE

### 🧪 **Testes**
- [Testing.md](./testing/TESTING.md) - Guia geral de testes
- [Testing Plan](./testing/TESTING_PLAN.md) - Plano de testes
- [Testing Patterns](./testing/TESTING_PATTERNS.md) - Padrões de teste
- [Testing Examples](./testing/TESTING_EXAMPLES.md) - Exemplos práticos

### 🔄 **Refatoração e Manutenção**
- [Refactoring Guide](./refactoring/REFACTORING_GUIDE.md) - Guia de refatoração
- [Refactoring Plan](./refactoring/REFACTORING_PLAN.md) - Plano de refatoração
- [Component Refactoring](./refactoring/COMPONENT_REFACTORING.md) - Refatoração de componentes
- [Implementation Log](./refactoring/IMPLEMENTATION_LOG.md) - Log de implementações

### 🚀 **Melhorias e Correções**
- [Melhorias Implementadas](./improvements/MELHORIAS_IMPLEMENTADAS.md) - Resumo de melhorias
- [Resumo Executivo](./improvements/RESUMO_EXECUTIVO_MUDANCAS.md) - Resumo executivo das mudanças

### 🐛 **Correções Específicas**
- [Correção Sincronização Medidas](./fixes/CORRECAO_SINCRONIZACAO_MEDIDAS.md)
- [Correção Menu Árvore Mobile](./fixes/CORRECAO_MENU_ARVORE_MOBILE.md) 
- [Correção Cálculo Maturidade](./fixes/CORRECAO_CALCULO_MATURIDADE_MEDIDAS_NULAS.md)
- [Correção INCC Save](./fixes/CORRECAO_SALVAR_INCC.md)
- [Correção Atualização INCC](./fixes/CORRECAO_ATUALIZACAO_SELECT_INCC.md)
- [Correção Índices Zero](./fixes/CORRECAO_INDICES_ZERO.md)
- [Correção Índices Maturidade](./fixes/CORRECAO_INDICES_MATURIDADE.md)

### 🎨 **Melhorias Visuais**
- [Melhoria Visual Medida](./ui-improvements/MELHORIA_VISUAL_COMPONENTE_MEDIDA.md)
- [Melhoria Visual Controle](./ui-improvements/MELHORIA_VISUAL_COMPONENTE_CONTROLE.md)

### 📊 **Sistemas e Funcionalidades**
- [Sistema Maturidade](./systems/SISTEMA_MATURIDADE.md) - Sistema principal de maturidade
- [Sistema Maturidade Inteligente](./systems/SISTEMA_MATURIDADE_INTELIGENTE.md) - Versão inteligente
- [Sistema Maturidade Diagnósticos](./systems/SISTEMA_MATURIDADE_DIAGNOSTICOS.md) - Maturidade específica
- [Sistema Redesign](./systems/SISTEMA_REDESIGN.md) - Redesign completo

### 🔍 **Análises e Otimização**
- [Análise Loops Infinitos](./analysis/ANALISE_LOOPS_INFINITOS_E_OTIMIZACAO.md)
- [Diagnósticos e Melhorias](./analysis/DIAGNOSTICOS_MELHORIAS_TESTES.md)

### 🗂️ **Organização**
- [Consolidação de Código](./organization/CONSOLIDACAO_CODIGO_ORGANIZACAO.md)
- [Logs Removidos](./organization/LOGS_REMOVIDOS.md)

## 🚀 **Como Usar Esta Documentação**

### Para Desenvolvedores Novos
1. Comece com [Como Rodar Localmente](./setup/COMO_RODAR_LOCALMENTE.md)
2. Leia a [Arquitetura](./architecture/ARCHITECTURE.md)
3. Consulte os [Engineering Guidelines](./architecture/ENGINEERING_GUIDELINES.md)

### Para Debugging
1. Consulte as [Correções Específicas](#-correções-específicas)
2. Veja as [Análises e Otimização](#-análises-e-otimização)

### Para Implementar Novas Features
1. Consulte o [PRD](./requirements/PRD.md) e [FRD](./requirements/FRD.md)
2. Siga o [Refactoring Guide](./refactoring/REFACTORING_GUIDE.md)
3. Implemente seguindo os [Testing Patterns](./testing/TESTING_PATTERNS.md)

### Para Entender o Sistema de Maturidade
1. Leia [Sistema Maturidade](./systems/SISTEMA_MATURIDADE.md)
2. Consulte [Sistema Maturidade Inteligente](./systems/SISTEMA_MATURIDADE_INTELIGENTE.md)
3. Veja as correções relacionadas em [Correções Específicas](#-correções-específicas)

## 📅 **Última Atualização**
Esta organização foi criada para melhorar a navegabilidade e manutenibilidade da documentação do projeto. 