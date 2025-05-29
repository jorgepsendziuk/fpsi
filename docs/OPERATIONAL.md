# Documentação Operacional - FPSI

## 1. Procedimentos de Deploy

### 1.1 Ambiente de Desenvolvimento
```bash
# Instalação de dependências
npm install

# Execução do servidor de desenvolvimento
npm run dev

# Execução de testes
npm test

# Linting
npm run lint
```

### 1.2 Ambiente de Produção
```bash
# Build da aplicação
npm run build

# Deploy na Vercel
vercel --prod

# Verificação de logs
vercel logs
```

### 1.3 Pipeline de CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 2. Monitoramento

### 2.1 Métricas de Sistema
- **Performance**
  - Tempo de resposta da API
  - Tempo de carregamento de página
  - Uso de CPU/Memória
  - Taxa de erros

- **Disponibilidade**
  - Uptime
  - Latência
  - Taxa de sucesso de requisições

- **Segurança**
  - Tentativas de login
  - Acessos não autorizados
  - Alterações em dados sensíveis

### 2.2 Ferramentas de Monitoramento
- **Vercel Analytics**
  - Métricas de performance
  - Erros de runtime
  - Uso de recursos

- **Supabase Dashboard**
  - Status do banco de dados
  - Queries lentas
  - Uso de recursos

- **Sentry**
  - Rastreamento de erros
  - Performance monitoring
  - User feedback

### 2.3 Alertas
- **Critério de Alerta**
  - Erro rate > 1%
  - Latência > 500ms
  - CPU > 80%
  - Memória > 80%

- **Canais de Notificação**
  - Email
  - Slack
  - SMS (emergências)

## 3. Resposta a Incidentes

### 3.1 Classificação de Incidentes
- **P0**: Crítico (Sistema indisponível)
- **P1**: Alto (Funcionalidade principal afetada)
- **P2**: Médio (Funcionalidade secundária afetada)
- **P3**: Baixo (Problema não crítico)

### 3.2 Procedimento de Resposta
1. **Detecção**
   - Monitoramento automático
   - Relato de usuário
   - Alerta do sistema

2. **Triagem**
   - Classificação do incidente
   - Atribuição de responsável
   - Notificação da equipe

3. **Resolução**
   - Análise do problema
   - Implementação da solução
   - Verificação da correção

4. **Comunicação**
   - Notificação aos stakeholders
   - Atualização de status
   - Documentação do incidente

### 3.3 Plano de Contingência
- **Backup de Dados**
  - Frequência: Diária
  - Retenção: 30 dias
  - Local: Supabase + S3

- **Recuperação de Desastres**
  - RTO (Recovery Time Objective): 4 horas
  - RPO (Recovery Point Objective): 24 horas

## 4. Post-Mortem

### 4.1 Template de Post-Mortem
```markdown
# Post-Mortem: [Nome do Incidente]

## Resumo
[Descrição breve do incidente]

## Impacto
- Duração: [Tempo]
- Usuários afetados: [Número]
- Serviços afetados: [Lista]

## Timeline
- [Data/Hora] - Detecção
- [Data/Hora] - Triagem
- [Data/Hora] - Resolução

## Causa Raiz
[Análise detalhada da causa]

## Ações Corretivas
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

## Lições Aprendidas
[Principais aprendizados]

## Recomendações
[Recomendações para evitar recorrência]
```

### 4.2 Processo de Análise
1. **Coleta de Dados**
   - Logs do sistema
   - Métricas de monitoramento
   - Relatos da equipe

2. **Análise**
   - Identificação da causa raiz
   - Avaliação do processo de resposta
   - Identificação de gaps

3. **Documentação**
   - Preenchimento do template
   - Registro de lições aprendidas
   - Proposta de melhorias

## 5. Infraestrutura

### 5.1 Stack Tecnológica
- **Frontend**
  - Next.js
  - Material-UI
  - TypeScript

- **Backend**
  - Supabase
  - PostgreSQL
  - REST API

- **Infraestrutura**
  - Vercel (Hosting)
  - GitHub (Versionamento)
  - GitHub Actions (CI/CD)

### 5.2 Requisitos de Sistema
- **Node.js**: >= 22.0.0
- **npm**: >= 10.0.0
- **PostgreSQL**: >= 14.0
- **Memória**: >= 2GB RAM
- **CPU**: >= 2 cores

### 5.3 Configuração de Ambiente
```bash
# Variáveis de Ambiente
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.fpsi.com
NODE_ENV=production
```

### 5.4 Manutenção
- **Backup**
  - Frequência: Diária
  - Retenção: 30 dias
  - Verificação: Semanal

- **Updates**
  - Dependências: Mensal
  - Sistema: Trimestral
  - Segurança: Imediato

- **Monitoramento**
  - 24/7
  - Alertas configurados
  - Logs centralizados 