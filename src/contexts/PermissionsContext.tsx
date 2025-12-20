import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
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
  const isLoadingRef = React.useRef(false);

  const loadPermissions = useCallback(async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const { admin } = AdminSessionService.getCurrentSession();

      if (!admin || !admin.phone) {
        setPermissions([]);
        setIsAdmin(false);
        setCurrentAdminPhone(null);
        setCurrentAdminRole(null);
        setLoading(false);
        return;
      }

      setCurrentAdminPhone(admin.phone);
      setCurrentAdminRole(admin.role);

      const SUPER_ADMIN_PHONES = ['0544433244'];
      const isSuperAdmin = SUPER_ADMIN_PHONES.includes(admin.phone) || admin.role === 'super_admin';

      if (isSuperAdmin) {
        setIsAdmin(true);
        setPermissions([]);
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      const userPermissions = await AdminSessionService.getPermissions(admin.phone);
      setPermissions(userPermissions || []);
    } catch (error) {
      setPermissions([]);
      setIsAdmin(false);
      setCurrentAdminPhone(null);
      setCurrentAdminRole(null);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadPermissions();

    let debounceTimer: NodeJS.Timeout;
    const handleStorageChange = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadPermissions();
      }, 500);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-session-changed', handleStorageChange);

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-session-changed', handleStorageChange);
    };
  }, []);

  const hasPermission = useCallback((moduleId: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (isAdmin) {
      return true;
    }

    if (!permissions || permissions.length === 0) {
      return false;
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);

    if (!permission) {
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
  }, [isAdmin, permissions]);

  const canAccessModule = useCallback((moduleId: string): boolean => {
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
  }, [isAdmin, permissions]);

  const getModulePermissions = useCallback((moduleId: string): PermissionCheck | null => {
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
  }, [isAdmin, permissions]);

  const refreshPermissions = useCallback(async () => {
    await loadPermissions();
  }, [loadPermissions]);

  // دوال مركزية للتحكم في الإجراءات - memoized
  const checkCanCreate = useCallback((moduleId: string) => hasPermission(moduleId, 'create'), [hasPermission]);
  const checkCanEdit = useCallback((moduleId: string) => hasPermission(moduleId, 'edit'), [hasPermission]);
  const checkCanDelete = useCallback((moduleId: string) => hasPermission(moduleId, 'delete'), [hasPermission]);
  const checkCanView = useCallback((moduleId: string) => hasPermission(moduleId, 'view'), [hasPermission]);

  const contextValue = useMemo(() => ({
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
  }), [
    permissions,
    loading,
    hasPermission,
    canAccessModule,
    getModulePermissions,
    refreshPermissions,
    isAdmin,
    checkCanCreate,
    checkCanEdit,
    checkCanDelete,
    checkCanView,
    currentAdminPhone,
    currentAdminRole
  ]);

  return (
    <PermissionsContext.Provider value={contextValue}>
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
