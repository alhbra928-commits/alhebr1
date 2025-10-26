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
  currentAdminPhone: string | null;
  currentAdminRole: string | null;
  canCreate: (moduleId: string) => boolean;
  canEdit: (moduleId: string) => boolean;
  canDelete: (moduleId: string) => boolean;
  canView: (moduleId: string) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAdminPhone, setCurrentAdminPhone] = useState<string | null>(null);
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const { admin } = AdminSessionService.getCurrentSession();

      if (!admin || !admin.phone) {
        // لا جلسة نشطة - طبيعي عند بداية التطبيق
        setPermissions([]);
        setIsAdmin(false);
        setCurrentAdminPhone(null);
        setCurrentAdminRole(null);
        setLoading(false);
        return;
      }

      setCurrentAdminPhone(admin.phone);
      setCurrentAdminRole(admin.role);

      // Admin info loaded

      const SUPER_ADMIN_PHONES = ['0500000000', '0500000001'];
      const isSuperAdmin = SUPER_ADMIN_PHONES.includes(admin.phone);

      if (isSuperAdmin) {
        // Super admin access granted
        setIsAdmin(true);
        setPermissions([]);
        return;
      }

      // Loading permissions

      setIsAdmin(false);

      const userPermissions = await AdminSessionService.getPermissions(admin.phone);

      // Loaded permissions

      if (!userPermissions || userPermissions.length === 0) {
        console.warn('⚠️ [PermissionsContext] No permissions found');
      }

      setPermissions(userPermissions);
    } catch (error) {
      console.error('❌❌❌ [PermissionsContext] ERROR LOADING PERMISSIONS:', error);
      setPermissions([]);
      setIsAdmin(false);
      setCurrentAdminPhone(null);
      setCurrentAdminRole(null);
    } finally {
      // Loading complete
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const hasPermission = (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (isAdmin) {
      return true;
    }

    if (permissions.length === 0) {
      return false;
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);

    if (!permission) {
      return false;
    }

    let result = false;
    switch (action) {
      case 'view':
        result = permission.can_view;
        break;
      case 'create':
        result = permission.can_create;
        break;
      case 'edit':
        result = permission.can_edit;
        break;
      case 'delete':
        result = permission.can_delete;
        break;
      default:
        result = false;
    }

    return result;
  };

  const canAccessModule = (moduleId: string): boolean => {
    if (moduleId === 'dashboard') {
      return true;
    }

    if (isAdmin) {
      return true;
    }

    if (permissions.length === 0) {
      return false;
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);

    if (!permission) {
      return false;
    }

    return permission.can_view;
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
    console.log('🔄 [PermissionsContext] Manual refresh requested');
    await loadPermissions();
  };

  // دوال مركزية للتحكم في الإجراءات
  const checkCanCreate = (moduleId: string) => isAdmin || hasPermission(moduleId, 'create');
  const checkCanEdit = (moduleId: string) => isAdmin || hasPermission(moduleId, 'edit');
  const checkCanDelete = (moduleId: string) => isAdmin || hasPermission(moduleId, 'delete');
  const checkCanView = (moduleId: string) => isAdmin || hasPermission(moduleId, 'view');

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
        canCreate: checkCanCreate,
        canEdit: checkCanEdit,
        canDelete: checkCanDelete,
        canView: checkCanView,
        currentAdminPhone,
        currentAdminRole,
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
