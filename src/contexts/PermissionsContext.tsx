import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminSessionService, AdminPermission } from '../modules/admin/services/adminSessionService';

export interface PermissionCheck {
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionsContextValue {
  permissions: AdminPermission[];
  loading: boolean;
  hasPermission: (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
  canAccessModule: (moduleId: string) => boolean;
  getModulePermissions: (moduleId: string) => PermissionCheck | null;
  refreshPermissions: () => Promise<void>;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const { admin } = AdminSessionService.getCurrentSession();

      if (!admin) {
        setPermissions([]);
        setIsAdmin(false);
        return;
      }

      if (admin.role === 'super_admin' || admin.role === 'admin') {
        setIsAdmin(true);
        const allModulePermissions: AdminPermission[] = [
          {
            id: 'all',
            admin_phone: admin.phone,
            module_id: 'all',
            module_name_ar: 'جميع الصلاحيات',
            module_name_en: 'All Permissions',
            can_view: true,
            can_create: true,
            can_edit: true,
            can_delete: true,
            icon: 'shield',
            is_active: true,
          },
        ];
        setPermissions(allModulePermissions);
      } else {
        setIsAdmin(false);
        const userPermissions = await AdminSessionService.getPermissions(admin.phone);
        console.log('✅ [PermissionsContext] Loaded permissions for', admin.phone, ':', userPermissions);
        setPermissions(userPermissions);
      }
    } catch (error) {
      console.error('❌ [PermissionsContext] Error loading permissions:', error);
      setPermissions([]);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const hasPermission = (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (isAdmin) return true;

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);
    if (!permission) {
      console.warn(`⚠️ No permission found for module: ${moduleId}, action: ${action}`);
      return false;
    }

    switch (action) {
      case 'view':
        return permission.can_view;
      case 'create':
        return permission.can_create;
      case 'edit':
        return permission.can_edit;
      case 'delete':
        return permission.can_delete;
      default:
        return false;
    }
  };

  const canAccessModule = (moduleId: string): boolean => {
    if (isAdmin) return true;

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);
    const canAccess = permission ? permission.can_view : false;

    if (!canAccess) {
      console.warn(`⚠️ Access denied for module: ${moduleId}`);
    }

    return canAccess;
  };

  const getModulePermissions = (moduleId: string): PermissionCheck | null => {
    if (isAdmin) {
      return {
        module_id: moduleId,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      };
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);
    if (!permission) return null;

    return {
      module_id: moduleId,
      can_view: permission.can_view,
      can_create: permission.can_create,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
    };
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        loading,
        hasPermission,
        canAccessModule,
        getModulePermissions,
        refreshPermissions,
        isAdmin,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

export function ProtectedAction({
  moduleId,
  action,
  children,
  fallback = null,
}: {
  moduleId: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, loading } = usePermissions();

  if (loading) return <>{fallback}</>;

  if (!hasPermission(moduleId, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function ProtectedModule({
  moduleId,
  children,
  fallback = null,
}: {
  moduleId: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { canAccessModule, loading } = usePermissions();

  if (loading) return <>{fallback}</>;

  if (!canAccessModule(moduleId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
