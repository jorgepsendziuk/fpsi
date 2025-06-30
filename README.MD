# FPSI - FERRAMENTA DO FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO

## 🚀 Quick Start

### Running the development server.

```bash
npm run dev
```

### Building for production.

```bash
npm run build
```

### Running the production server.

```bash
npm run start
```

## 📚 Documentation

A documentação completa do projeto está organizada na pasta `docs/` por categorias:

### 🔧 **Setup & Getting Started**
- [📖 Como Rodar Localmente](./docs/setup/COMO_RODAR_LOCALMENTE.md) - Guia completo de setup
- [🔧 Node Version Fix](./docs/setup/NODE_VERSION_FIX.md) - Correção de versão do Node
- [✅ Build Success](./docs/setup/BUILD_CORRIGIDO_SUCESSO.md) - Resolução de problemas de build

### 🏗️ **Architecture & Design**
- [🏛️ Architecture](./docs/architecture/ARCHITECTURE.md) - Arquitetura geral do sistema
- [📋 ADR](./docs/architecture/ADR.md) - Architectural Decision Records
- [⚙️ Engineering Guidelines](./docs/architecture/ENGINEERING_GUIDELINES.md) - Diretrizes de engenharia

### 📝 **Requirements & Specifications**
- [📊 PRD](./docs/requirements/PRD.md) - Product Requirements Document
- [⚡ FRD](./docs/requirements/FRD.md) - Functional Requirements Document  
- [🔧 TRD](./docs/requirements/TRD.md) - Technical Reference Document

### 🧪 **Testing**
- [🧪 Testing Guide](./docs/testing/TESTING.md) - Guia geral de testes
- [📋 Testing Plan](./docs/testing/TESTING_PLAN.md) - Plano de testes
- [🎯 Testing Patterns](./docs/testing/TESTING_PATTERNS.md) - Padrões de teste
- [💡 Testing Examples](./docs/testing/TESTING_EXAMPLES.md) - Exemplos práticos

## 📋 Índice Completo

Para ver toda a documentação organizada por categoria, consulte:
**[📚 Índice Completo da Documentação](./docs/README.md)**

### Categorias Disponíveis:
- 🏗️ **Arquitetura e Design**
- 📝 **Especificações e Requisitos** 
- 🔧 **Setup e Operação**
- 🧪 **Testes**
- 🔄 **Refatoração e Manutenção**
- 🚀 **Melhorias e Correções**
- 🐛 **Correções Específicas**
- 🎨 **Melhorias Visuais**
- 📊 **Sistemas e Funcionalidades**
- 🔍 **Análises e Otimização**
- 🗂️ **Organização**

## 🧪 Testing

### Estrutura de Testes

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
```

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes com watch
npm test -- --watch

# Executar testes com cobertura
npm test -- --coverage
```

### Cobertura de Testes

- Componentes: > 80%
- Hooks: > 90%
- Utilitários: > 95%
- Integração: > 70%

Para mais detalhes sobre testes, consulte a [documentação completa de testes](./docs/testing/).

## 🤝 Contributing

1. Consulte o [Engineering Guidelines](./docs/architecture/ENGINEERING_GUIDELINES.md)
2. Siga os [Testing Patterns](./docs/testing/TESTING_PATTERNS.md)
3. Use o [Refactoring Guide](./docs/refactoring/REFACTORING_GUIDE.md)

## 📞 Support

Para dúvidas sobre:
- **Setup**: Consulte [Como Rodar Localmente](./docs/setup/COMO_RODAR_LOCALMENTE.md)
- **Debugging**: Veja [Correções Específicas](./docs/fixes/)
- **Arquitetura**: Consulte [Architecture](./docs/architecture/ARCHITECTURE.md)

## License

MIT