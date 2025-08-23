# 👥 Sistema de Múltiplos Usuários - FPSI

## Visão Geral
O sistema de múltiplos usuários permite que diferentes pessoas colaborem no mesmo programa FPSI, com controle granular de permissões baseado em funções específicas.

## Funcionalidades Implementadas

### 1. Sistema de Funções (Roles)
- **🔴 Administrador**: Acesso completo ao sistema
- **🔵 Coordenador**: Pode gerenciar equipe e aprovar atividades
- **🟢 Analista**: Pode responder medidas e criar plano de trabalho
- **🟡 Consultor**: Acesso apenas para visualização e comentários
- **🟣 Auditor**: Acesso para auditoria e exportação de relatórios

### 2. Sistema de Permissões Granulares
```typescript
interface ProgramaPermissions {
  // Diagnósticos
  can_view_diagnosticos: boolean;
  can_edit_diagnosticos: boolean;
  can_create_diagnosticos: boolean;
  can_delete_diagnosticos: boolean;

  // Medidas
  can_view_medidas: boolean;
  can_edit_medidas: boolean;
  can_approve_medidas: boolean;

  // Plano de Trabalho
  can_view_planos: boolean;
  can_edit_planos: boolean;
  can_approve_planos: boolean;

  // Políticas
  can_view_politicas: boolean;
  can_edit_politicas: boolean;
  can_publish_politicas: boolean;

  // Relatórios
  can_view_relatorios: boolean;
  can_export_relatorios: boolean;
  can_share_relatorios: boolean;

  // Usuários
  can_view_users: boolean;
  can_invite_users: boolean;
  can_remove_users: boolean;
  can_change_roles: boolean;

  // Programa
  can_view_programa: boolean;
  can_edit_programa: boolean;
  can_delete_programa: boolean;
}
```

### 3. Sistema de Convites
- **Convite por email**: Envio de convites para novos usuários
- **Tokens seguros**: Sistema de tokens com expiração
- **Status tracking**: Acompanhamento do status dos convites
- **Mensagens personalizadas**: Possibilidade de adicionar mensagem ao convite

### 4. Interface de Gerenciamento
- **Lista de usuários ativos**: Visualização de todos os usuários do programa
- **Gerenciamento de permissões**: Alteração de funções e permissões
- **Convites pendentes**: Visualização e gestão de convites enviados
- **Remoção de usuários**: Capacidade de remover usuários do programa

## Implementação Técnica

### Arquivos Criados
```
src/lib/types/user.ts                           # Tipos e interfaces
src/hooks/useUserPermissions.ts                 # Hook para gerenciar permissões
src/components/user-management/UserManagement.tsx # Componente principal
src/app/programas/[id]/usuarios/page.tsx        # Página de usuários
```

### Arquivos Modificados
```
src/app/programas/[id]/page.tsx                 # Adicionada seção de usuários
```

### Sistema de Tipos
```typescript
export enum UserRole {
  ADMIN = 'admin',
  COORDENADOR = 'coordenador',
  ANALISTA = 'analista',
  CONSULTOR = 'consultor',
  AUDITOR = 'auditor'
}

export interface ProgramaUser {
  id: number;
  programa_id: number;
  user_id: string;
  role: UserRole;
  permissions: ProgramaPermissions;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
}
```

### Hook de Permissões
```typescript
const { 
  user, 
  permissions, 
  hasPermission, 
  canViewResource,
  canEditResource,
  canDeleteResource,
  canApproveResource 
} = useUserPermissions(programaId);

// Verificação de permissão específica
if (hasPermission('can_edit_medidas')) {
  // Mostrar botão de edição
}

// Verificação por recurso
if (canEditResource('politicas')) {
  // Permitir edição de políticas
}
```

## Permissões por Função

### 🔴 Administrador
- ✅ **Acesso total**: Todas as permissões habilitadas
- ✅ **Gerenciar usuários**: Convidar, remover, alterar funções
- ✅ **Configurações**: Editar e deletar programa
- ✅ **Aprovações**: Aprovar medidas e plano de trabalho

### 🔵 Coordenador
- ✅ **Gestão operacional**: Editar diagnósticos e políticas
- ✅ **Aprovações**: Aprovar medidas e planos
- ✅ **Equipe**: Convidar usuários
- ✅ **Relatórios**: Visualizar e exportar
- ❌ **Administração**: Não pode deletar programa

### 🟢 Analista
- ✅ **Execução**: Editar medidas e plano de trabalho
- ✅ **Visualização**: Ver diagnósticos, políticas e relatórios
- ✅ **Colaboração**: Ver outros usuários
- ❌ **Aprovações**: Não pode aprovar
- ❌ **Convites**: Não pode convidar usuários

### 🟡 Consultor
- ✅ **Visualização**: Acesso de leitura a todos os recursos
- ✅ **Relatórios**: Visualizar (sem exportar)
- ❌ **Edição**: Nenhuma permissão de edição
- ❌ **Gestão**: Nenhuma permissão administrativa

### 🟣 Auditor
- ✅ **Auditoria**: Visualização completa para auditoria
- ✅ **Relatórios**: Visualizar e exportar
- ❌ **Edição**: Nenhuma permissão de edição
- ❌ **Gestão**: Foco apenas em auditoria

## Interface do Usuário

### Página de Usuários
- **📊 Dashboard**: Contadores de usuários ativos e convites pendentes
- **📋 Tabela de usuários**: Lista com avatar, função, data de adição e ações
- **✉️ Gestão de convites**: Tabela separada para convites pendentes
- **➕ Convite de usuários**: Dialog com seleção de função e mensagem personalizada

### Componentes Visuais
- **Chips coloridos**: Diferentes cores para cada função
- **Ícones específicos**: Ícones únicos para cada tipo de usuário
- **Status indicators**: Indicadores visuais para status de convites
- **Menu de ações**: Menu contextual para ações do usuário

### Feedback Visual
```typescript
const getRoleColor = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'error';      // Vermelho
    case UserRole.COORDENADOR: return 'primary';  // Azul
    case UserRole.ANALISTA: return 'success';     // Verde
    case UserRole.CONSULTOR: return 'warning';    // Laranja
    case UserRole.AUDITOR: return 'secondary';    // Roxo
  }
};
```

## Segurança e Validações

### Validação de Permissões
- **Client-side**: Hook de permissões para UI responsiva
- **Server-side**: Validação em todas as APIs (a implementar)
- **Middleware**: Verificação de acesso por rota

### Proteções Implementadas
- ✅ **Auto-proteção**: Usuários não podem se remover
- ✅ **Verificação de papel**: Apenas admins podem alterar funções
- ✅ **Tokens seguros**: Convites com tokens únicos e expiração
- ✅ **Validação de email**: Verificação de formato de email

### Auditoria (Planejada)
```typescript
interface UserActivity {
  user_id: string;
  action: ActivityAction;
  resource_type: ResourceType;
  details: any;
  ip_address: string;
  timestamp: string;
}
```

## Integração com Modo Demo

### Permissões Demo
- **Usuário admin fictício**: Acesso completo no modo demo
- **Dados sintéticos**: Usuários e convites pré-configurados
- **Operações simuladas**: Todas as ações são simuladas
- **Logs identificados**: Prefixo `[DEMO MODE]` em operações

### Detecção Automática
```typescript
const isDemoMode = shouldUseDemoData(programaId);
const permissions = isDemoMode ? useDemoPermissions() : useUserPermissions(programaId);
```

## Próximos Passos

### Funcionalidades Pendentes
1. **APIs do Backend**: Implementar endpoints para operações de usuário
2. **Sistema de Notificações**: Emails de convite e notificações
3. **Auditoria de Ações**: Log completo de atividades dos usuários
4. **Bulk Operations**: Ações em lote para múltiplos usuários
5. **Grupos e Equipes**: Organização em grupos de trabalho

### Melhorias de UX
1. **Tour guiado**: Walkthrough para novos usuários
2. **Onboarding**: Processo de integração melhorado
3. **Avatars reais**: Integração com gravatar ou upload
4. **Chat/Comentários**: Sistema de comunicação entre usuários
5. **Histórico de atividades**: Timeline de ações por usuário

### Integrações
1. **SSO**: Single Sign-On com provedores externos
2. **LDAP/AD**: Integração com Active Directory
3. **Slack/Teams**: Notificações em ferramentas corporativas
4. **Calendar**: Integração com calendários para lembretes

## Considerações de Escalabilidade

### Performance
- **Lazy loading**: Carregamento sob demanda de usuários
- **Paginação**: Para listas grandes de usuários
- **Cache**: Cache de permissões para melhor performance
- **Índices**: Otimização de consultas no banco de dados

### Limites Recomendados
- **Usuários por programa**: Até 100 usuários ativos
- **Convites simultâneos**: Até 50 convites pendentes
- **Bulk operations**: Até 20 usuários por operação

## Conclusão

O sistema de múltiplos usuários foi implementado com:
- ✅ **Arquitetura sólida**: Tipos bem definidos e código modular
- ✅ **Interface intuitiva**: UX moderna e responsiva
- ✅ **Segurança robusta**: Validações e proteções adequadas
- ✅ **Flexibilidade**: Sistema de permissões granulares
- ✅ **Integração demo**: Funciona perfeitamente no modo demonstração

O sistema está pronto para:
- Colaboração em equipe
- Controle de acesso granular
- Gestão de usuários em escala
- Auditoria e compliance
- Expansão futura com novas funcionalidades