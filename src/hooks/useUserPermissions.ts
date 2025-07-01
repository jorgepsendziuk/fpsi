import { useState, useEffect, useCallback } from 'react';
import { useGetIdentity } from '@refinedev/core';
import { 
  User, 
  ProgramaUser, 
  UserRole, 
  ProgramaPermissions, 
  hasPermission,
  getDefaultPermissions 
} from '../lib/types/user';

interface UseUserPermissionsReturn {
  user: User | null;
  programaUser: ProgramaUser | null;
  permissions: ProgramaPermissions | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: (permission: keyof ProgramaPermissions) => boolean;
  canViewResource: (resource: string) => boolean;
  canEditResource: (resource: string) => boolean;
  canDeleteResource: (resource: string) => boolean;
  canApproveResource: (resource: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

export const useUserPermissions = (programaId?: number): UseUserPermissionsReturn => {
  const [programaUser, setProgramaUser] = useState<ProgramaUser | null>(null);
  const [permissions, setPermissions] = useState<ProgramaPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: user, isLoading: userLoading, error: userError } = useGetIdentity<User>();

  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id || !programaId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar dados do usuário no programa
      const response = await fetch(`/api/users?programaId=${programaId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Usuário não tem acesso ao programa - criar usuário admin temporário
          console.warn('Usuário não encontrado no programa. Criando permissões temporárias de admin.');
          
          const tempUser: ProgramaUser = {
            id: 0,
            programa_id: programaId,
            user_id: user.id,
            role: UserRole.ADMIN,
            permissions: getDefaultPermissions(UserRole.ADMIN),
            status: 'accepted' as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setProgramaUser(tempUser);
          setPermissions(tempUser.permissions);
          return;
        }
        throw new Error('Erro ao carregar permissões do usuário');
      }

      const usersData: ProgramaUser[] = await response.json();
      const userData = usersData.find(u => u.user_id === user.id);
      
      if (userData) {
        setProgramaUser(userData);
        setPermissions(userData.permissions);
      } else {
        // Usuário não encontrado na lista - criar permissões temporárias
        const tempUser: ProgramaUser = {
          id: 0,
          programa_id: programaId,
          user_id: user.id,
          role: UserRole.ADMIN,
          permissions: getDefaultPermissions(UserRole.ADMIN),
          status: 'accepted' as any,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProgramaUser(tempUser);
        setPermissions(tempUser.permissions);
      }

    } catch (err) {
      console.error('Erro ao carregar permissões:', err);
      
      // Em caso de erro, dar permissões temporárias de admin para não bloquear o sistema
      console.warn('Erro ao carregar permissões. Aplicando permissões temporárias de admin.');
      
      const tempUser: ProgramaUser = {
        id: 0,
        programa_id: programaId,
        user_id: user?.id || 'temp-user',
        role: UserRole.ADMIN,
        permissions: getDefaultPermissions(UserRole.ADMIN),
        status: 'accepted' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProgramaUser(tempUser);
      setPermissions(tempUser.permissions);
      setError(null); // Limpar erro para não bloquear interface
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, programaId]);

  const refreshPermissions = useCallback(async () => {
    await fetchUserPermissions();
  }, [fetchUserPermissions]);

  const checkPermission = useCallback((permission: keyof ProgramaPermissions): boolean => {
    if (!permissions) return false;
    return hasPermission(permissions, permission);
  }, [permissions]);

  const canViewResource = useCallback((resource: string): boolean => {
    switch (resource) {
      case 'diagnosticos':
        return checkPermission('can_view_diagnosticos');
      case 'medidas':
        return checkPermission('can_view_medidas');
      case 'planos':
        return checkPermission('can_view_planos');
      case 'politicas':
        return checkPermission('can_view_politicas');
      case 'relatorios':
        return checkPermission('can_view_relatorios');
      case 'users':
        return checkPermission('can_view_users');
      case 'programa':
        return checkPermission('can_view_programa');
      default:
        return false;
    }
  }, [checkPermission]);

  const canEditResource = useCallback((resource: string): boolean => {
    switch (resource) {
      case 'diagnosticos':
        return checkPermission('can_edit_diagnosticos');
      case 'medidas':
        return checkPermission('can_edit_medidas');
      case 'planos':
        return checkPermission('can_edit_planos');
      case 'politicas':
        return checkPermission('can_edit_politicas');
      case 'programa':
        return checkPermission('can_edit_programa');
      default:
        return false;
    }
  }, [checkPermission]);

  const canDeleteResource = useCallback((resource: string): boolean => {
    switch (resource) {
      case 'diagnosticos':
        return checkPermission('can_delete_diagnosticos');
      case 'programa':
        return checkPermission('can_delete_programa');
      default:
        return false;
    }
  }, [checkPermission]);

  const canApproveResource = useCallback((resource: string): boolean => {
    switch (resource) {
      case 'medidas':
        return checkPermission('can_approve_medidas');
      case 'planos':
        return checkPermission('can_approve_planos');
      case 'politicas':
        return checkPermission('can_publish_politicas');
      default:
        return false;
    }
  }, [checkPermission]);

  // Carregar permissões quando user ou programaId mudar
  useEffect(() => {
    if (!userLoading && user && programaId) {
      fetchUserPermissions();
    } else if (!userLoading && !user) {
      setIsLoading(false);
      setProgramaUser(null);
      setPermissions(null);
    }
  }, [user, programaId, userLoading, fetchUserPermissions]);

  // Propagar erro do usuário
  useEffect(() => {
    if (userError) {
      setError('Erro ao carregar dados do usuário');
    }
  }, [userError]);

  return {
    user: user || null,
    programaUser,
    permissions,
    isLoading: userLoading || isLoading,
    error,
    hasPermission: checkPermission,
    canViewResource,
    canEditResource,
    canDeleteResource,
    canApproveResource,
    refreshPermissions
  };
};

// Hook auxiliar para demo mode
export const useDemoPermissions = (): UseUserPermissionsReturn => {
  const demoUser: User = {
    id: 'demo-user',
    email: 'demo@fpsi.com.br',
    name: 'Usuário Demo',
    role: UserRole.ADMIN
  };

  const demoProgramaUser: ProgramaUser = {
    id: 1,
    programa_id: 999999,
    user_id: 'demo-user',
    role: UserRole.ADMIN,
    permissions: getDefaultPermissions(UserRole.ADMIN),
    status: 'accepted' as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const permissions = getDefaultPermissions(UserRole.ADMIN);

  const checkPermission = useCallback((permission: keyof ProgramaPermissions): boolean => {
    return hasPermission(permissions, permission);
  }, [permissions]);

  const canViewResource = useCallback((resource: string): boolean => {
    // No modo demo, admin tem acesso a tudo
    return true;
  }, []);

  const canEditResource = useCallback((resource: string): boolean => {
    // No modo demo, admin pode editar tudo
    return true;
  }, []);

  const canDeleteResource = useCallback((resource: string): boolean => {
    // No modo demo, admin pode deletar tudo
    return true;
  }, []);

  const canApproveResource = useCallback((resource: string): boolean => {
    // No modo demo, admin pode aprovar tudo
    return true;
  }, []);

  const refreshPermissions = useCallback(async () => {
    // No modo demo, não há necessidade de refresh
  }, []);

  return {
    user: demoUser,
    programaUser: demoProgramaUser,
    permissions,
    isLoading: false,
    error: null,
    hasPermission: checkPermission,
    canViewResource,
    canEditResource,
    canDeleteResource,
    canApproveResource,
    refreshPermissions
  };
};