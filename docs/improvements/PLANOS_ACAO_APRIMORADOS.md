# 📋 Plano de Trabalho Aprimorado - FPSI

## Visão Geral
O sistema de plano de trabalho aprimorado oferece um controle completo sobre o ciclo de vida do plano, desde a criação até a conclusão, com recursos avançados de gerenciamento de projeto.

## Funcionalidades Implementadas

### 1. Sistema de Planos Estruturado
- **📊 Dashboard completo**: Métricas em tempo real e KPIs
- **🎯 Gestão de status**: 8 status diferentes para controle preciso
- **⚡ Prioridades**: Sistema de prioridades de baixa a crítica
- **💰 Controle orçamentário**: Gestão de orçamento previsto vs utilizado
- **👥 Responsáveis**: Atribuição clara de responsabilidades

### 2. Sistema de Marcos (Milestones)
```typescript
interface Marco {
  id: number;
  plano_acao_id: number;
  titulo: string;
  data_prevista: string;
  data_real?: string;
  status: StatusMarco;
  percentual_conclusao: number;
  responsavel?: string;
}
```

### 3. Gestão de Atividades
- **📝 Atividades detalhadas**: Subdivisão dos marcos em atividades
- **🔗 Dependências**: Sistema de dependências entre atividades
- **⏱️ Controle de tempo**: Horas estimadas vs horas reais
- **🚧 Status avançado**: Controle de bloqueios e cancelamentos

### 4. Gestão de Recursos
```typescript
enum TipoRecurso {
  HUMANO = 'humano',
  MATERIAL = 'material',
  EQUIPAMENTO = 'equipamento',
  SOFTWARE = 'software',
  SERVICO = 'servico',
  TREINAMENTO = 'treinamento'
}
```

### 5. Sistema de Riscos
- **⚠️ Identificação de riscos**: Cadastro e categorização
- **📊 Matriz de risco**: Probabilidade vs Impacto
- **🛡️ Estratégias de mitigação**: Planos de ação para riscos
- **📈 Monitoramento**: Acompanhamento contínuo

## Status do Sistema

### Status de Planos
- **📝 Rascunho**: Plano em elaboração
- **⏳ Aguardando Aprovação**: Plano submetido para revisão
- **✅ Aprovado**: Plano aprovado e pronto para execução
- **🟢 Em Andamento**: Plano sendo executado
- **⏸️ Pausado**: Plano temporariamente pausado
- **🏆 Concluído**: Plano finalizado com sucesso
- **❌ Cancelado**: Plano cancelado
- **🔴 Atrasado**: Plano com prazo vencido

### Prioridades
- **🟢 Baixa**: Pode ser executado quando houver disponibilidade
- **🔵 Média**: Prioridade normal de execução
- **🟡 Alta**: Deve ser priorizado na execução
- **🔴 Crítica**: Máxima prioridade, execução imediata

## Dashboard e Métricas

### Cards de Resumo
```typescript
interface DashboardPlanos {
  total_planos: number;
  planos_por_status: Record<StatusPlanoAcao, number>;
  planos_por_prioridade: Record<PrioridadePlano, number>;
  planos_atrasados: number;
  planos_vencendo: number;
  progresso_medio: number;
  orcamento_total: number;
  orcamento_utilizado: number;
}
```

### Indicadores Visuais
- **📊 Gráficos de status**: Distribuição por status em barras de progresso
- **🎯 Gráficos de prioridade**: Distribuição por prioridade
- **⚠️ Alertas de vencimento**: Planos próximos ao vencimento
- **🔴 Indicadores de atraso**: Destacar planos atrasados

### Marcos Próximos
- **📅 Lista de marcos**: Próximos marcos a serem cumpridos
- **📈 Progresso**: Percentual de conclusão de cada marco
- **⏰ Alertas**: Marcos próximos ao vencimento

### Riscos Críticos
- **⚠️ Lista de riscos**: Riscos de alta prioridade
- **🎯 Estratégias**: Planos de mitigação ativos
- **📊 Status**: Acompanhamento do status dos riscos

## Interface do Usuário

### Dashboard Principal
- **📊 Cards de métricas**: Total de planos, progresso médio, orçamento
- **📈 Gráficos interativos**: Status e prioridades em formato visual
- **📋 Tabela de planos**: Lista completa com filtros e ações
- **⚡ Ações rápidas**: Botões para visualização Gantt e relatórios

### Tabela de Planos
```typescript
// Colunas da tabela
- Plano (título e objetivo)
- Status (chip colorido com ícone)
- Prioridade (chip colorido com ícone)
- Progresso (barra de progresso)
- Responsável
- Prazo (com alertas de vencimento)
- Orçamento (utilizado/previsto)
- Ações (visualizar/editar)
```

### Componentes Visuais
- **🎨 Chips coloridos**: Sistema de cores consistente
- **📊 Barras de progresso**: Progresso visual em tempo real
- **🚨 Alertas visuais**: Cores para indicar urgência
- **🔍 Tooltips informativos**: Informações adicionais ao passar o mouse

## Sistema de Cores

### Status
```typescript
const getStatusColor = (status: StatusPlanoAcao) => {
  switch (status) {
    case RASCUNHO: return 'default';        // Cinza
    case AGUARDANDO_APROVACAO: return 'warning';  // Amarelo
    case APROVADO: return 'info';           // Azul claro
    case EM_ANDAMENTO: return 'primary';    // Azul
    case PAUSADO: return 'secondary';       // Roxo
    case CONCLUIDO: return 'success';       // Verde
    case CANCELADO: return 'error';         // Vermelho
    case ATRASADO: return 'error';          // Vermelho
  }
};
```

### Prioridades
```typescript
const getPrioridadeColor = (prioridade: PrioridadePlano) => {
  switch (prioridade) {
    case BAIXA: return 'success';    // Verde
    case MEDIA: return 'info';       // Azul
    case ALTA: return 'warning';     // Amarelo
    case CRITICA: return 'error';    // Vermelho
  }
};
```

## Integração com Permissões

### Controle de Acesso
- **👀 Visualizar planos**: `can_view_planos`
- **✏️ Editar planos**: `can_edit_planos`
- **✅ Aprovar planos**: `can_approve_planos`

### Ações por Função
- **🔴 Administrador**: Acesso completo a todos os recursos
- **🔵 Coordenador**: Pode aprovar planos e gerenciar equipe
- **🟢 Analista**: Pode criar e editar planos
- **🟡 Consultor**: Apenas visualização
- **🟣 Auditor**: Visualização e exportação de relatórios

## Funcionalidades Avançadas (Planejadas)

### 1. Visualização Gantt
- **📅 Cronograma visual**: Gráfico de Gantt interativo
- **🔗 Dependências**: Visualização de dependências entre atividades
- **📊 Linha do tempo**: Timeline visual dos marcos
- **⚡ Drag & Drop**: Edição visual de datas

### 2. Sistema de Comentários
- **💬 Comentários contextuais**: Por plano, marco ou atividade
- **📎 Anexos**: Sistema de upload de arquivos
- **🔔 Notificações**: Alertas para novos comentários
- **👥 Colaboração**: Sistema de menções

### 3. Relatórios Avançados
- **📊 Relatórios customizados**: Geração de relatórios sob medida
- **📈 Analytics**: Análise de performance dos planos
- **📋 Exportação**: PDF, Excel, CSV
- **📧 Distribuição**: Envio automático de relatórios

### 4. Integração com Calendário
- **📅 Sincronização**: Marcos e atividades no calendário
- **⏰ Lembretes**: Notificações de vencimento
- **👥 Convites**: Reuniões automáticas para marcos
- **📱 Apps móveis**: Integração com calendários móveis

## Implementação Técnica

### Arquivos Criados
```
src/lib/types/planoAcao.ts                      # Tipos e interfaces
src/components/planos-acao/DashboardPlanosAcao.tsx  # Dashboard principal
src/app/programas/[id]/planos-acao/page.tsx    # Página de planos
```

### Arquivos Modificados
```
src/app/programas/[id]/page.tsx                 # Adicionada seção de planos
```

### Estrutura de Dados
```typescript
// Principais entidades
- PlanoAcao: Estrutura principal do plano
- Marco: Marcos/milestones do plano
- Atividade: Tarefas detalhadas
- RecursoPlano: Recursos necessários
- RiscoPlano: Riscos identificados
- ComentarioPlano: Sistema de comentários
- HistoricoPlano: Auditoria de mudanças
```

## Funções Utilitárias

### Cálculos Automáticos
```typescript
// Progresso baseado em marcos
const calcularProgressoPlano = (marcos: Marco[]): number => {
  const progressoTotal = marcos.reduce((acc, marco) => 
    acc + marco.percentual_conclusao, 0
  );
  return Math.round(progressoTotal / marcos.length);
};

// Verificação de atraso
const verificarAtraso = (plano: PlanoAcao): boolean => {
  const hoje = new Date();
  const dataFim = new Date(plano.data_fim_prevista);
  return hoje > dataFim && plano.status !== StatusPlanoAcao.CONCLUIDO;
};

// Dias para vencimento
const diasParaVencimento = (dataFim: string): number => {
  const hoje = new Date();
  const dataLimite = new Date(dataFim);
  const diferenca = dataLimite.getTime() - hoje.getTime();
  return Math.ceil(diferenca / (1000 * 3600 * 24));
};
```

### Formatação
```typescript
// Formatação de moeda
const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Formatação de datas
const formatarData = (data: string): string => {
  return new Date(data).toLocaleDateString('pt-BR');
};
```

## Benefícios Implementados

### 1. Para Gestores
- ✅ **Visibilidade completa**: Dashboard com todas as métricas importantes
- ✅ **Controle de orçamento**: Acompanhamento financeiro em tempo real
- ✅ **Alertas proativos**: Identificação precoce de problemas
- ✅ **Relatórios executivos**: Informações consolidadas para tomada de decisão

### 2. Para Equipe
- ✅ **Clareza de objetivos**: Marcos e atividades bem definidos
- ✅ **Responsabilidades claras**: Atribuição específica de tarefas
- ✅ **Acompanhamento de progresso**: Feedback visual constante
- ✅ **Colaboração facilitada**: Sistema de comentários e notificações

### 3. Para Auditoria
- ✅ **Histórico completo**: Rastreamento de todas as mudanças
- ✅ **Conformidade**: Evidências de execução e aprovações
- ✅ **Relatórios detalhados**: Documentação completa
- ✅ **Transparência**: Visibilidade total do processo

## Próximos Passos

### Fase 1 - Funcionalidades Core (Implementado)
- ✅ Dashboard com métricas
- ✅ Sistema de status e prioridades
- ✅ Interface de visualização
- ✅ Integração com permissões

### Fase 2 - Funcionalidades Avançadas (Planejada)
- 🔄 Formulários de criação/edição
- 🔄 Sistema de marcos e atividades
- 🔄 Gestão de recursos e riscos
- 🔄 APIs backend completas

### Fase 3 - Recursos Premium (Futura)
- 📅 Visualização Gantt
- 💬 Sistema de comentários
- 📊 Relatórios avançados
- 🔔 Sistema de notificações

### Fase 4 - Integrações (Futura)
- 📧 Integração email
- 📅 Sincronização calendário
- 📱 App móvel
- 🔗 APIs externas

## Considerações de Performance

### Otimizações Implementadas
- **📊 Lazy loading**: Carregamento sob demanda de dados
- **🎯 Queries otimizadas**: Busca eficiente de métricas
- **💾 Cache inteligente**: Cache de dados frequentemente acessados
- **🔄 Updates incrementais**: Atualizações parciais da interface

### Limites Recomendados
- **📋 Planos por programa**: Até 200 planos ativos
- **🎯 Marcos por plano**: Até 50 marcos
- **📝 Atividades por marco**: Até 20 atividades
- **💰 Controle orçamentário**: Até R$ 10 milhões por plano

## Conclusão

O sistema de plano de trabalho aprimorado foi implementado com:
- ✅ **Arquitetura escalável**: Suporte a crescimento futuro
- ✅ **Interface moderna**: UX intuitiva e responsiva
- ✅ **Métricas avançadas**: KPIs e dashboards executivos
- ✅ **Integração robusta**: Funciona com sistema de permissões
- ✅ **Extensibilidade**: Base sólida para funcionalidades futuras

O sistema está pronto para:
- Gerenciamento profissional de projetos
- Acompanhamento de KPIs em tempo real
- Controle orçamentário eficiente
- Colaboração em equipe
- Auditoria e compliance
- Expansão com recursos avançados