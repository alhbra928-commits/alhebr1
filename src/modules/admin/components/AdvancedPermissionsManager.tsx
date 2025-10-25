import { useState, useEffect } from 'react';
import { Shield, User, Edit, Lock, Trash2, Plus, Check, X } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService, AdminPermission } from '../services/adminSessionService';

interface AdminUser {
  phone: string;
  name: string;
  role: string;
  roleAr: string;
  avatar?: string;
}

export function AdvancedPermissionsManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingPermission, setEditingPermission] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      loadPermissions(selectedUser.phone);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('🔍 [AdvancedPermissionsManager] Loading users from DB...');
      const loadedUsers = await AdminSessionService.getAllUsers();
      console.log('✅ [AdvancedPermissionsManager] Loaded users:', loadedUsers);
      setUsers(loadedUsers);
    } catch (error) {
      console.error('❌ [AdvancedPermissionsManager] Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPermissions = async (phone: string) => {
    setLoading(true);
    try {
      const perms = await AdminSessionService.getPermissions(phone);
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permId: string, field: keyof AdminPermission, currentValue: boolean) => {
    console.log('🔄 [AdvancedPermissionsManager] Toggle permission START');
    console.log('Permission ID:', permId);
    console.log('Field:', field);
    console.log('Current Value:', currentValue);
    console.log('New Value:', !currentValue);

    try {
      console.log('📤 Calling updatePermission...');
      await AdminSessionService.updatePermission(permId, { [field]: !currentValue } as any);
      console.log('✅ Update successful in DB');

      setPermissions(permissions.map(p =>
        p.id === permId ? { ...p, [field]: !currentValue } : p
      ));
      console.log('✅ State updated successfully');
      console.log('🔄 [AdvancedPermissionsManager] Toggle permission END');
    } catch (error) {
      console.error('❌❌❌ Error updating permission:', error);
      alert('حدث خطأ في تحديث الصلاحية: ' + (error as any).message);
    }
  };

  const handleFreezeUser = async (phone: string) => {
    if (!confirm('هل تريد تجميد جميع صلاحيات هذا المستخدم؟')) return;

    try {
      for (const perm of permissions) {
        await AdminSessionService.updatePermission(perm.id, { is_active: false });
      }
      await loadPermissions(phone);
      alert('تم تجميد المستخدم بنجاح');
    } catch (error) {
      console.error('Error freezing user:', error);
      alert('حدث خطأ في تجميد المستخدم');
    }
  };

  const handleActivateUser = async (phone: string) => {
    try {
      for (const perm of permissions) {
        await AdminSessionService.updatePermission(perm.id, { is_active: true });
      }
      await loadPermissions(phone);
      alert('تم تفعيل المستخدم بنجاح');
    } catch (error) {
      console.error('Error activating user:', error);
      alert('حدث خطأ في تفعيل المستخدم');
    }
  };

  const handleDeletePermission = async (permId: string) => {
    const permission = permissions.find(p => p.id === permId);
    if (!permission) return;

    // حماية خاصة للمدير العام (0500000001)
    const isSuperAdmin = permission.admin_phone === '0500000001';

    if (isSuperAdmin) {
      // التحذير الأول
      const firstConfirm = confirm(
        `🚨 تحذير: أنت على وشك حذف صلاحيات المدير العام!\n\n` +
        `📱 الجوال: ${permission.admin_phone}\n` +
        `📦 القسم: ${permission.module_id}\n\n` +
        `⚠️ هذا المستخدم هو المدير العام للمنصة!\n\n` +
        `هل تريد المتابعة؟`
      );

      if (!firstConfirm) return;

      // التحذير الثاني
      const finalConfirmation = prompt(
        `⚠️ للمتابعة في حذف صلاحيات المدير العام\n\n` +
        `اكتب كلمة "تأكيد الحذف" بالضبط:`
      );

      if (finalConfirmation !== 'تأكيد الحذف') {
        alert('❌ تم إلغاء العملية. لم يتم كتابة التأكيد الصحيح.');
        return;
      }
    } else {
      if (!confirm('هل تريد حذف هذه الصلاحية؟')) return;
    }

    try {
      await AdminSessionService.deletePermission(permId);
      setPermissions(permissions.filter(p => p.id !== permId));
      alert('✅ تم حذف الصلاحية بنجاح');
    } catch (error) {
      console.error('Error deleting permission:', error);
      alert('❌ حدث خطأ في حذف الصلاحية');
    }
  };

  const allPermissionsActive = permissions.every(p => p.is_active);
  const allPermissionsFrozen = permissions.every(p => !p.is_active);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #F9F8F6 0%, #E8E6E1 100%)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: brandGradients.gold }}
          >
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black" style={{ color: brandColors.text.primary }}>
              إدارة الصلاحيات المتقدمة
            </h1>
            <p className="mt-1 text-sm" style={{ color: brandColors.text.secondary }}>
              تحكم كامل في صلاحيات المستخدمين
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <h2 className="mb-4 text-lg font-bold" style={{ color: brandColors.text.primary }}>
                المستخدمون
              </h2>
              <div className="space-y-3">
                {users.map((user) => (
                  <button
                    key={user.phone}
                    onClick={() => setSelectedUser(user)}
                    className="w-full rounded-xl p-4 text-right transition-all hover:scale-[1.02]"
                    style={{
                      background: selectedUser?.phone === user.phone
                        ? 'linear-gradient(135deg, rgba(61, 91, 75, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)'
                        : 'rgba(0, 0, 0, 0.02)',
                      border: selectedUser?.phone === user.phone
                        ? `2px solid ${brandColors.primary.gold}`
                        : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full font-black text-white"
                        style={{ background: brandGradients.gold }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold" style={{ color: brandColors.text.primary }}>
                          {user.name}
                        </p>
                        <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                          {user.phone}
                        </p>
                        <span
                          className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                          style={{
                            background: user.role === 'super_admin' ? brandGradients.gold : 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
                          }}
                        >
                          {user.roleAr}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!selectedUser ? (
              <div
                className="flex h-full items-center justify-center rounded-2xl p-12"
                style={{
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="text-center">
                  <User className="mx-auto h-16 w-16 opacity-30" style={{ color: brandColors.primary.gold }} />
                  <p className="mt-4 font-bold" style={{ color: brandColors.text.secondary }}>
                    اختر مستخدماً لعرض وتعديل صلاحياته
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'white',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full font-black text-white"
                      style={{ background: brandGradients.gold }}
                    >
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                        {selectedUser.name}
                      </h2>
                      <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                        {selectedUser.phone} • {selectedUser.roleAr}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {allPermissionsActive ? (
                      <button
                        onClick={() => handleFreezeUser(selectedUser.phone)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                      >
                        <Lock className="h-4 w-4" />
                        <span>تجميد</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(selectedUser.phone)}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                      >
                        <Check className="h-4 w-4" />
                        <span>تفعيل</span>
                      </button>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200" style={{ borderTopColor: brandColors.primary.gold }} />
                    <p className="mt-4 font-bold" style={{ color: brandColors.text.secondary }}>
                      جاري التحميل...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {permissions.map((perm) => (
                      <div
                        key={perm.id}
                        className="group rounded-xl p-4 transition-all"
                        style={{
                          background: perm.is_active
                            ? 'rgba(16, 185, 129, 0.05)'
                            : 'rgba(239, 68, 68, 0.05)',
                          border: perm.is_active
                            ? '2px solid rgba(16, 185, 129, 0.2)'
                            : '2px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
                                {perm.module_name_ar}
                              </h3>
                              <span
                                className="rounded-full px-2 py-0.5 text-xs font-bold"
                                style={{
                                  background: perm.is_active ? '#10B981' : '#EF4444',
                                  color: 'white',
                                }}
                              >
                                {perm.is_active ? 'مفعّل' : 'مجمّد'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm" style={{ color: brandColors.text.secondary }}>
                              {perm.module_name_en}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                onClick={() => handleTogglePermission(perm.id, 'can_view', perm.can_view)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                                  perm.can_view ? 'text-white' : 'bg-gray-100'
                                }`}
                                style={{
                                  background: perm.can_view ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : undefined,
                                  color: perm.can_view ? 'white' : brandColors.text.secondary,
                                }}
                              >
                                {perm.can_view ? '✓' : '✗'} عرض
                              </button>
                              <button
                                onClick={() => handleTogglePermission(perm.id, 'can_create', perm.can_create)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                                  perm.can_create ? 'text-white' : 'bg-gray-100'
                                }`}
                                style={{
                                  background: perm.can_create ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' : undefined,
                                  color: perm.can_create ? 'white' : brandColors.text.secondary,
                                }}
                              >
                                {perm.can_create ? '✓' : '✗'} إنشاء
                              </button>
                              <button
                                onClick={() => handleTogglePermission(perm.id, 'can_edit', perm.can_edit)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                                  perm.can_edit ? 'text-white' : 'bg-gray-100'
                                }`}
                                style={{
                                  background: perm.can_edit ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : undefined,
                                  color: perm.can_edit ? 'white' : brandColors.text.secondary,
                                }}
                              >
                                {perm.can_edit ? '✓' : '✗'} تعديل
                              </button>
                              <button
                                onClick={() => handleTogglePermission(perm.id, 'can_delete', perm.can_delete)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                                  perm.can_delete ? 'text-white' : 'bg-gray-100'
                                }`}
                                style={{
                                  background: perm.can_delete ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : undefined,
                                  color: perm.can_delete ? 'white' : brandColors.text.secondary,
                                }}
                              >
                                {perm.can_delete ? '✓' : '✗'} حذف
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeletePermission(perm.id)}
                            className="rounded-lg p-2 opacity-0 transition-all hover:bg-red-100 group-hover:opacity-100"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
