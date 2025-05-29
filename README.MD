# FPSI - FERRAMENTA DO FRAMEWORK DE PRIVACIDADE E SEGURANÇA DA INFORMAÇÃO

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

## Documentation

Para informações sobre o processo de refatoração e documentação do projeto, consulte:
- [Guia de Refatoração e Documentação](./docs/REFACTORING_GUIDE.md)
- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Reference Document (TRD)](./docs/TRD.md)
- [Functional Requirements Document (FRD)](./docs/FRD.md)
- [Architectural Decision Records (ADR)](./docs/ADR.md)
- [Engineering Guidelines](./docs/ENGINEERING_GUIDELINES.md)
- [Documentação de Arquitetura](./docs/ARCHITECTURE.md)
- [Documentação Operacional](./docs/OPERATIONAL.md)
- [Plano de Refatoração](./docs/REFACTORING_PLAN.md)
- [Plano de Refatoração de Componentes](./docs/COMPONENT_REFACTORING.md)

## Testes

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
      utils/
        __tests__/
          calculations.test.ts
          maturity.test.ts
```

### Tipos de Testes

1. **Testes Unitários**
   - Testam componentes isoladamente
   - Verificam lógica de negócio
   - Validam props e estados
   - Cobrem casos de erro

2. **Testes de Integração**
   - Testam interação entre componentes
   - Validam fluxo de dados
   - Verificam atualizações de estado
   - Testam cenários de erro

3. **Testes de Utilitários**
   - Testam funções puras
   - Validam cálculos
   - Verificam transformações
   - Cobrem casos de borda

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar testes com watch
npm test -- --watch

# Executar testes com cobertura
npm test -- --coverage

# Executar testes específicos
npm test -- DiagnosticoContainer
```

### Cobertura de Testes

- Componentes: > 80%
- Hooks: > 90%
- Utilitários: > 95%
- Integração: > 70%

### Convenções de Testes

1. **Nomenclatura**
   - Arquivos: `[nome].test.tsx`
   - Integração: `[nome].integration.test.tsx`
   - Snapshots: `[nome].snapshot.test.tsx`

2. **Estrutura**
   ```typescript
   describe('Component', () => {
     // Setup
     beforeEach(() => {
       // ...
     });

     // Testes
     it('should ...', () => {
       // ...
     });
   });
   ```

3. **Mocks**
   - Usar `jest.mock()` para módulos
   - Mockar apenas o necessário
   - Documentar comportamento esperado
   - Limpar mocks entre testes

4. **Assertions**
   - Usar matchers específicos
   - Validar comportamento, não implementação
   - Testar casos de erro
   - Verificar side effects

### Documentação

- [Guia de Testes](./docs/TESTING.md)
- [Padrões de Teste](./docs/TESTING_PATTERNS.md)
- [Exemplos de Testes](./docs/TESTING_EXAMPLES.md)

### Exemplos

1. **Componentes**
   - [DiagnosticoContainer](./src/app/diagnostico/containers/__tests__/DiagnosticoContainer.test.tsx)
   - [DiagnosticoComponent](./src/app/diagnostico/components/__tests__/DiagnosticoComponent.test.tsx)

2. **Hooks**
   - [useDiagnosticoControles](./src/app/diagnostico/hooks/__tests__/useDiagnosticoControles.test.ts)

3. **Utilitários**
   - [calculations](./src/app/diagnostico/utils/__tests__/calculations.test.ts)
   - [maturity](./src/app/diagnostico/utils/__tests__/maturity.test.ts)

### Boas Práticas

1. **Organização**
   - Testes próximos ao código
   - Nomenclatura clara
   - Setup isolado
   - Limpeza após testes

2. **Isolamento**
   - Mockar dependências
   - Limpar estado
   - Resetar mocks
   - Evitar side effects

3. **Assertions**
   - Testar comportamento
   - Evitar detalhes de implementação
   - Cobrir casos de erro
   - Validar side effects

4. **Performance**
   - Evitar testes lentos
   - Usar mocks apropriados
   - Limitar timeouts
   - Otimizar setup

### Troubleshooting

1. **Erros Comuns**
   - "Cannot find module"
   - "Test environment"
   - "Async operations"

2. **Debugging**
   - Console
   - Debugger
   - Screenshots

### Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Jest Cheatsheet](https://devhints.io/jest)

## License

MIT