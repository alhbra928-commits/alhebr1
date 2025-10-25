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

      console.log('🔍🔍🔍 [PermissionsContext] ======================');
      console.log('🔍 [PermissionsContext] Current admin:', JSON.stringify(admin, null, 2));

      if (!admin || !admin.phone) {
        console.warn('⚠️ [PermissionsContext] NO ADMIN SESSION FOUND');
        setPermissions([]);
        setIsAdmin(false);
        setCurrentAdminPhone(null);
        setCurrentAdminRole(null);
        return;
      }

      setCurrentAdminPhone(admin.phone);
      setCurrentAdminRole(admin.role);

      console.log('🔍 [PermissionsContext] Admin Phone:', admin.phone);
      console.log('🔍 [PermissionsContext] Admin Role:', admin.role);
      console.log('🔍 [PermissionsContext] Admin Name:', admin.name);

      const SUPER_ADMIN_PHONES = ['0500000000'];
      const isSuperAdmin = SUPER_ADMIN_PHONES.includes(admin.phone);

      if (isSuperAdmin) {
        console.log('✅✅✅ [PermissionsContext] SUPER ADMIN DETECTED (by phone) - Full permissions granted');
        setIsAdmin(true);
        setPermissions([]);
        return;
      }

      console.log('⚠️⚠️⚠️ [PermissionsContext] EMPLOYEE ROLE DETECTED');
      console.log('📞 [PermissionsContext] Fetching permissions for phone:', admin.phone);

      setIsAdmin(false);

      const userPermissions = await AdminSessionService.getPermissions(admin.phone);

      console.log('📋📋📋 [PermissionsContext] RAW PERMISSIONS RESPONSE:', JSON.stringify(userPermissions, null, 2));
      console.log('📋 [PermissionsContext] Permissions COUNT:', userPermissions.length);

      if (!userPermissions || userPermissions.length === 0) {
        console.error('❌❌❌ [PermissionsContext] NO PERMISSIONS FOUND FOR', admin.phone);
        console.error('❌ [PermissionsContext] USER WILL HAVE NO ACCESS TO ANY MODULE');
      } else {
        console.log('✅ [PermissionsContext] Permissions loaded successfully:');
        userPermissions.forEach((perm, index) => {
          console.log(`  ${index + 1}. Module: ${perm.module_id} (${perm.module_name_ar})`);
          console.log(`     View: ${perm.can_view}, Create: ${perm.can_create}, Edit: ${perm.can_edit}, Delete: ${perm.can_delete}`);
          console.log(`     Active: ${perm.is_active}`);
        });
      }

      setPermissions(userPermissions);
      console.log('✅ [PermissionsContext] Permissions SET in state:', userPermissions.length);
      console.log('🔍🔍🔍 [PermissionsContext] ======================');
    } catch (error) {
      console.error('❌❌❌ [PermissionsContext] ERROR LOADING PERMISSIONS:', error);
      setPermissions([]);
      setIsAdmin(false);
      setCurrentAdminPhone(null);
      setCurrentAdminRole(null);
    } finally {
      console.log('⏳ [PermissionsContext] Setting loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄🔄🔄 [PermissionsContext] useEffect triggered - loading permissions');
    loadPermissions();

    const interval = setInterval(() => {
      const { admin } = AdminSessionService.getCurrentSession();
      if (admin && admin.phone !== currentAdminPhone) {
        console.log('🔄 [PermissionsContext] Admin changed, reloading permissions');
        loadPermissions();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentAdminPhone]);

  const hasPermission = (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    console.log(`🔍 [hasPermission] Checking ${action} for module: ${moduleId}`);
    console.log(`🔍 [hasPermission] isAdmin: ${isAdmin}`);
    console.log(`🔍 [hasPermission] permissions count: ${permissions.length}`);

    if (isAdmin) {
      console.log(`✅ [hasPermission] ADMIN - Access granted`);
      return true;
    }

    if (permissions.length === 0) {
      console.log(`❌ [hasPermission] NO PERMISSIONS - Access denied`);
      return false;
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);

    if (!permission) {
      console.log(`❌ [hasPermission] Module "${moduleId}" NOT FOUND in permissions - Access denied`);
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

    console.log(`${result ? '✅' : '❌'} [hasPermission] ${action} permission for ${moduleId}: ${result}`);
    return result;
  };

  const canAccessModule = (moduleId: string): boolean => {
    console.log(`🔍🔍🔍 [canAccessModule] ===== Checking: ${moduleId} =====`);
    console.log(`  📊 isAdmin: ${isAdmin}`);
    console.log(`  📋 Total Permissions: ${permissions.length}`);
    console.log(`  ⏳ Loading: ${loading}`);

    if (moduleId === 'dashboard') {
      console.log(`✅ [canAccessModule] Dashboard always accessible`);
      return true;
    }

    if (isAdmin) {
      console.log(`✅✅✅ [canAccessModule] ADMIN - Full access to ${moduleId}`);
      return true;
    }

    if (permissions.length === 0) {
      console.log(`❌❌❌ [canAccessModule] NO PERMISSIONS ARRAY - Access DENIED for ${moduleId}`);
      return false;
    }

    const permission = permissions.find(p => p.module_id === moduleId && p.is_active);

    if (!permission) {
      console.log(`❌ [canAccessModule] Module "${moduleId}" NOT FOUND in permissions array`);
      console.log(`  Available modules:`, permissions.map(p => p.module_id));
      return false;
    }

    const canAccess = permission.can_view;
    console.log(`${canAccess ? '✅✅✅' : '❌❌❌'} [canAccessModule] ${moduleId}: can_view = ${canAccess}`);
    console.log(`  Permission:`, {
      module_id: permission.module_id,
      module_name_ar: permission.module_name_ar,
      can_view: permission.can_view,
      can_create: permission.can_create,
      can_edit: permission.can_edit,
      can_delete: permission.can_delete,
      is_active: permission.is_active
    });

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
