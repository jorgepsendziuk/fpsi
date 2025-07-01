// Tipos para sistema de múltiplos usuários

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export enum UserRole {
  ADMIN = 'admin',           // Acesso completo
  COORDENADOR = 'coordenador', // Pode gerenciar equipe e programas
  ANALISTA = 'analista',     // Pode responder medidas e criar planos
  CONSULTOR = 'consultor',   // Apenas leitura e comentários
  AUDITOR = 'auditor'        // Acesso apenas para auditoria/revisão
}

export interface ProgramaUser {
  id: number;
  programa_id: number;
  user_id: string;
  role: UserRole;
  permissions: ProgramaPermissions;
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface ProgramaPermissions {
  // Diagnósticos
  can_view_diagnosticos: boolean;
  can_edit_diagnosticos: boolean;
  can_create_diagnosticos: boolean;
  can_delete_diagnosticos: boolean;

  // Medidas
  can_view_medidas: boolean;
  can_edit_medidas: boolean;
  can_approve_medidas: boolean;

  // Planos de Ação
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

export interface UserInvite {
  id: number;
  programa_id: number;
  email: string;
  role: UserRole;
  permissions: ProgramaPermissions;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  token: string;
  status: InviteStatus;
  message?: string;
}

export interface UserActivity {
  id: number;
  user_id: string;
  programa_id: number;
  action: ActivityAction;
  resource_type: ResourceType;
  resource_id?: number;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export enum ActivityAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  APPROVE = 'approve',
  REJECT = 'reject',
  INVITE = 'invite',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum ResourceType {
  PROGRAMA = 'programa',
  DIAGNOSTICO = 'diagnostico',
  CONTROLE = 'controle',
  MEDIDA = 'medida',
  PLANO_ACAO = 'plano_acao',
  POLITICA = 'politica',
  RELATORIO = 'relatorio',
  USER = 'user'
}

// Funções utilitárias para permissões
export const getDefaultPermissions = (role: UserRole): ProgramaPermissions => {
  const basePermissions: ProgramaPermissions = {
    can_view_diagnosticos: false,
    can_edit_diagnosticos: false,
    can_create_diagnosticos: false,
    can_delete_diagnosticos: false,
    can_view_medidas: false,
    can_edit_medidas: false,
    can_approve_medidas: false,
    can_view_planos: false,
    can_edit_planos: false,
    can_approve_planos: false,
    can_view_politicas: false,
    can_edit_politicas: false,
    can_publish_politicas: false,
    can_view_relatorios: false,
    can_export_relatorios: false,
    can_share_relatorios: false,
    can_view_users: false,
    can_invite_users: false,
    can_remove_users: false,
    can_change_roles: false,
    can_view_programa: false,
    can_edit_programa: false,
    can_delete_programa: false
  };

  switch (role) {
    case UserRole.ADMIN:
      return {
        ...basePermissions,
        can_view_diagnosticos: true,
        can_edit_diagnosticos: true,
        can_create_diagnosticos: true,
        can_delete_diagnosticos: true,
        can_view_medidas: true,
        can_edit_medidas: true,
        can_approve_medidas: true,
        can_view_planos: true,
        can_edit_planos: true,
        can_approve_planos: true,
        can_view_politicas: true,
        can_edit_politicas: true,
        can_publish_politicas: true,
        can_view_relatorios: true,
        can_export_relatorios: true,
        can_share_relatorios: true,
        can_view_users: true,
        can_invite_users: true,
        can_remove_users: true,
        can_change_roles: true,
        can_view_programa: true,
        can_edit_programa: true,
        can_delete_programa: true
      };

    case UserRole.COORDENADOR:
      return {
        ...basePermissions,
        can_view_diagnosticos: true,
        can_edit_diagnosticos: true,
        can_create_diagnosticos: true,
        can_view_medidas: true,
        can_edit_medidas: true,
        can_approve_medidas: true,
        can_view_planos: true,
        can_edit_planos: true,
        can_approve_planos: true,
        can_view_politicas: true,
        can_edit_politicas: true,
        can_view_relatorios: true,
        can_export_relatorios: true,
        can_share_relatorios: true,
        can_view_users: true,
        can_invite_users: true,
        can_view_programa: true,
        can_edit_programa: true
      };

    case UserRole.ANALISTA:
      return {
        ...basePermissions,
        can_view_diagnosticos: true,
        can_view_medidas: true,
        can_edit_medidas: true,
        can_view_planos: true,
        can_edit_planos: true,
        can_view_politicas: true,
        can_view_relatorios: true,
        can_view_users: true,
        can_view_programa: true
      };

    case UserRole.CONSULTOR:
      return {
        ...basePermissions,
        can_view_diagnosticos: true,
        can_view_medidas: true,
        can_view_planos: true,
        can_view_politicas: true,
        can_view_relatorios: true,
        can_view_users: true,
        can_view_programa: true
      };

    case UserRole.AUDITOR:
      return {
        ...basePermissions,
        can_view_diagnosticos: true,
        can_view_medidas: true,
        can_view_planos: true,
        can_view_politicas: true,
        can_view_relatorios: true,
        can_export_relatorios: true,
        can_view_programa: true
      };

    default:
      return basePermissions;
  }
};

export const hasPermission = (
  userPermissions: ProgramaPermissions,
  permission: keyof ProgramaPermissions
): boolean => {
  return userPermissions[permission] === true;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.COORDENADOR]: 'Coordenador',
    [UserRole.ANALISTA]: 'Analista',
    [UserRole.CONSULTOR]: 'Consultor',
    [UserRole.AUDITOR]: 'Auditor'
  };

  return roleNames[role] || role;
};

export const getRoleDescription = (role: UserRole): string => {
  const descriptions = {
    [UserRole.ADMIN]: 'Acesso completo ao sistema, pode gerenciar usuários e configurações',
    [UserRole.COORDENADOR]: 'Pode gerenciar equipe, aprovar medidas e coordenar atividades',
    [UserRole.ANALISTA]: 'Pode responder medidas, criar planos de ação e editar políticas',
    [UserRole.CONSULTOR]: 'Acesso apenas para visualização e comentários',
    [UserRole.AUDITOR]: 'Acesso para auditoria, revisão e exportação de relatórios'
  };

  return descriptions[role] || 'Função não definida';
};

export const canUserPerformAction = (
  user: ProgramaUser,
  action: keyof ProgramaPermissions
): boolean => {
  return hasPermission(user.permissions, action);
};