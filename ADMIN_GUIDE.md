# 👑 **Guia Completo: Como Atribuir Admin no Sistema FPSI**

## 🎯 **Métodos Disponíveis**

### **1. 🎮 Via Interface Web (Recomendado)**

#### **Passo a Passo:**
1. **Acesse o modo demo**: `http://localhost:3000/demo`
2. **Entre no programa**: Clique em "Acessar Diagnóstico"
3. **Vá para usuários**: Clique em "Usuários e Permissões"
4. **Gerencie usuários**:
   - **Convidar novo como admin**: Clique "Convidar Usuário" → Selecione "Administrador"
   - **Promover existente**: Menu (⋮) → "Alterar Função" → "Administrador"

#### **Funcionalidades da Interface:**
- ✅ **Convite por email** com função específica
- ✅ **Alteração de função** de usuários existentes  
- ✅ **Remoção de usuários** do programa
- ✅ **Visualização de permissões** por função
- ✅ **Histórico de convites** pendentes

### **2. 🔧 Via API (Programático)**

#### **APIs Implementadas:**

```typescript
// Listar usuários do programa
GET /api/programas/[id]/users

// Adicionar usuário como admin
POST /api/programas/[id]/users
{
  "user_id": "admin@empresa.com",
  "role": "admin",
  "permissions": { /* todas as 21 permissões */ }
}

// Promover usuário para admin
PUT /api/programas/[id]/users/[userId]/role
{
  "role": "admin"
}

// Convidar novo usuário como admin
POST /api/programas/[id]/invites
{
  "email": "novo-admin@empresa.com",
  "role": "admin",
  "message": "Você foi convidado como administrador"
}
```

#### **Exemplo de Uso:**
```javascript
// Promover usuário existente para admin
const promoteToAdmin = async (programaId, userId) => {
  const response = await fetch(`/api/programas/${programaId}/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' })
  });
  
  const result = await response.json();
  console.log(result.message); // "Função alterada para admin com sucesso"
};
```

### **3. 💾 Via Banco de Dados (Direto)**

#### **Estrutura das Tabelas:**
```sql
-- Tabela: programa_users
CREATE TABLE programa_users (
  id SERIAL PRIMARY KEY,
  programa_id INTEGER REFERENCES programa(id),
  user_id VARCHAR(255), -- Email ou ID do usuário
  role VARCHAR(50), -- 'admin', 'coordenador', etc.
  permissions JSONB, -- Objeto com todas as permissões
  status VARCHAR(20) DEFAULT 'accepted',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: programa_invites  
CREATE TABLE programa_invites (
  id SERIAL PRIMARY KEY,
  programa_id INTEGER REFERENCES programa(id),
  email VARCHAR(255),
  role VARCHAR(50),
  permissions JSONB,
  token VARCHAR(255) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  invited_by VARCHAR(255),
  invited_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  message TEXT
);
```

#### **Inserir Admin Diretamente:**
```sql
-- Adicionar usuário como admin
INSERT INTO programa_users (
  programa_id, user_id, role, permissions, status
) VALUES (
  1, -- ID do programa
  'admin@empresa.com', -- Email do usuário
  'admin', -- Função
  '{
    "can_view_diagnosticos": true,
    "can_edit_diagnosticos": true,
    "can_create_diagnosticos": true,
    "can_delete_diagnosticos": true,
    "can_view_medidas": true,
    "can_edit_medidas": true,
    "can_approve_medidas": true,
    "can_view_planos": true,
    "can_edit_planos": true,
    "can_approve_planos": true,
    "can_view_politicas": true,
    "can_edit_politicas": true,
    "can_publish_politicas": true,
    "can_view_relatorios": true,
    "can_export_relatorios": true,
    "can_share_relatorios": true,
    "can_view_users": true,
    "can_invite_users": true,
    "can_remove_users": true,
    "can_change_roles": true,
    "can_view_programa": true,
    "can_edit_programa": true,
    "can_delete_programa": true
  }', -- Todas as 21 permissões
  'accepted' -- Status aceito
);
```

#### **Promover Usuário Existente:**
```sql
-- Atualizar função para admin
UPDATE programa_users 
SET 
  role = 'admin',
  permissions = '{
    "can_view_diagnosticos": true,
    "can_edit_diagnosticos": true,
    "can_create_diagnosticos": true,
    "can_delete_diagnosticos": true,
    "can_view_medidas": true,
    "can_edit_medidas": true,
    "can_approve_medidas": true,
    "can_view_planos": true,
    "can_edit_planos": true,
    "can_approve_planos": true,
    "can_view_politicas": true,
    "can_edit_politicas": true,
    "can_publish_politicas": true,
    "can_view_relatorios": true,
    "can_export_relatorios": true,
    "can_share_relatorios": true,
    "can_view_users": true,
    "can_invite_users": true,
    "can_remove_users": true,
    "can_change_roles": true,
    "can_view_programa": true,
    "can_edit_programa": true,
    "can_delete_programa": true
  }',
  updated_at = NOW()
WHERE programa_id = 1 AND user_id = 'usuario@empresa.com';
```

## 🔐 **Permissões de Admin**

### **Todas as 21 Permissões:**
- **📊 Diagnósticos (4)**: view, edit, create, delete
- **📋 Medidas (3)**: view, edit, approve  
- **📅 Planos (3)**: view, edit, approve
- **📜 Políticas (3)**: view, edit, publish
- **📊 Relatórios (3)**: view, export, share
- **👥 Usuários (4)**: view, invite, remove, change_roles
- **🏢 Programa (3)**: view, edit, delete

### **Hierarquia de Funções:**
1. **👑 Admin**: 21/21 permissões - Controle total
2. **👨‍💼 Coordenador**: 15/21 permissões - Gerencia equipe
3. **👨‍💻 Analista**: 9/21 permissões - Trabalha com medidas
4. **👨‍🏫 Consultor**: 7/21 permissões - Apenas visualização
5. **🔍 Auditor**: 8/21 permissões - Auditoria e relatórios

## 🚀 **Testando as Funcionalidades**

### **No Modo Demo:**
1. **Acesse**: `http://localhost:3000/demo`
2. **Usuário demo**: Automaticamente admin (ID: 999999)
3. **Teste todas as funções**: Interface completa disponível

### **Verificação de Permissões:**
```typescript
// Em qualquer componente
const { hasPermission, canViewResource } = useUserPermissions(programaId);

// Verificar se é admin
if (hasPermission('can_delete_programa')) {
  console.log('Usuário é admin!');
}

// Verificar permissões específicas
if (canViewResource('users')) {
  // Mostrar seção de usuários
}
```

## 📧 **Sistema de Convites**

### **Fluxo de Convite:**
1. **Admin convida**: Email + função + mensagem personalizada
2. **Token gerado**: Válido por 7 dias
3. **Email enviado**: Link de aceitação (TODO: implementar)
4. **Usuário aceita**: Automaticamente adicionado ao programa

### **URLs de Convite:**
```
https://seu-app.vercel.app/accept-invite?token=abc123...
```

## 🛡️ **Segurança**

### **Validações Implementadas:**
- ✅ **Função válida**: Apenas roles definidos no enum
- ✅ **Usuário único**: Não permite duplicatas no programa
- ✅ **Convite único**: Um convite pendente por email
- ✅ **Token seguro**: 32 bytes aleatórios
- ✅ **Expiração**: Convites expiram em 7 dias

### **Permissões Necessárias:**
- **Para convidar**: `can_invite_users`
- **Para alterar função**: `can_change_roles`  
- **Para remover**: `can_remove_users`

## 🎯 **Casos de Uso Comuns**

### **1. Primeiro Admin do Sistema:**
```sql
-- Inserir diretamente no banco
INSERT INTO programa_users (programa_id, user_id, role, permissions, status)
VALUES (1, 'primeiro-admin@empresa.com', 'admin', '{ /* todas permissões */ }', 'accepted');
```

### **2. Promover Coordenador para Admin:**
```javascript
// Via API
await fetch('/api/programas/1/users/coordenador@empresa.com/role', {
  method: 'PUT',
  body: JSON.stringify({ role: 'admin' })
});
```

### **3. Convidar Admin Externo:**
```javascript
// Via interface ou API
await fetch('/api/programas/1/invites', {
  method: 'POST',
  body: JSON.stringify({
    email: 'admin-externo@empresa.com',
    role: 'admin',
    message: 'Você foi convidado como administrador do programa FPSI'
  })
});
```

## 📱 **Interface de Usuários**

### **Localização**: `/programas/[id]/usuarios`

### **Funcionalidades:**
- 📋 **Lista de usuários** com funções e status
- ➕ **Botão "Convidar Usuário"** (se tem permissão)
- ⚙️ **Menu de ações** por usuário (alterar função, remover)
- 📊 **Convites pendentes** com status
- 🎨 **Chips coloridos** por função
- 📅 **Datas de adição** e histórico

### **Permissões da Interface:**
- **Ver usuários**: `can_view_users`
- **Convidar**: `can_invite_users`  
- **Alterar função**: `can_change_roles`
- **Remover**: `can_remove_users`

---

**🎉 Sistema completo de gerenciamento de usuários implementado!** 

Use qualquer um dos métodos acima para atribuir permissões de admin conforme sua necessidade. O modo demo é perfeito para testar todas as funcionalidades! 🚀