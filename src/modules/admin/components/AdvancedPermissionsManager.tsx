import { useState, useEffect } from 'react';
import { Shield, User, Edit, Lock, Trash2, Plus, Check, X, MessageCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService, AdminPermission } from '../services/adminSessionService';
import { SmartButtonPermissionsView } from '../../permissions/components/SmartButtonPermissionsView';
import { AdvancedSmartButtonPermissionsView } from '../../permissions/components/AdvancedSmartButtonPermissionsView';

interface AdminUser {
  phone: string;
  name: string;
  role: string;
  roleAr: string;
  avatar?: string;
  jobTitle?: string;
  jobTitleEn?: string;
}

export function AdvancedPermissionsManager() {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'smart-button'>('general');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingPermission, setEditingPermission] = useState<string | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({ name: '', jobTitle: '' });
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [newPermissionForm, setNewPermissionForm] = useState({
    moduleId: '',
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  useEffect(() => {
    loadUsers();
    const session = AdminSessionService.getCurrentSession();
    if (session?.admin) {
      setCurrentAdmin(session.admin);
    }
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

  const handleEditUser = () => {
    if (!selectedUser) return;
    setEditUserForm({
      name: selectedUser.name,
      jobTitle: selectedUser.jobTitle || '',
    });
    setShowEditUserModal(true);
  };

  const handleSaveUserInfo = async () => {
    if (!selectedUser) return;

    try {
      await AdminSessionService.updateUserInfo(selectedUser.phone, {
        full_name: editUserForm.name,
        job_title: editUserForm.jobTitle,
      });

      setUsers(users.map(u =>
        u.phone === selectedUser.phone
          ? { ...u, name: editUserForm.name, jobTitle: editUserForm.jobTitle }
          : u
      ));

      setSelectedUser({
        ...selectedUser,
        name: editUserForm.name,
        jobTitle: editUserForm.jobTitle,
      });

      setShowEditUserModal(false);
      alert('✅ تم تحديث بيانات المستخدم بنجاح');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ حدث خطأ في تحديث البيانات');
    }
  };

  const handleDeleteUser = (user: AdminUser) => {
    // التحقق من أن المستخدم ليس صاحب المنصة أو المدير العام
    if (user.phone === '0569335257' || user.phone === '0500000001') {
      alert('⛔ لا يمكن حذف صاحب المنصة أو المدير العام!');
      return;
    }

    // فتح نموذج الحذف
    setUserToDelete(user);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete || !deleteReason) {
      alert('⚠️ يرجى اختيار سبب الحذف');
      return;
    }

    try {
      console.log('🗑️ Starting delete process for user:', userToDelete.phone);

      // حذف المستخدم من قاعدة البيانات (يحذف الصلاحيات تلقائياً)
      await AdminSessionService.deleteUser(userToDelete.phone);

      console.log('✅ User deleted from database');

      // تحديث القائمة في الواجهة
      setUsers(users.filter(u => u.phone !== userToDelete.phone));

      // إلغاء تحديد المستخدم إذا كان محدداً
      if (selectedUser?.phone === userToDelete.phone) {
        setSelectedUser(null);
        setPermissions([]);
      }

      // إغلاق النموذج
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeleteReason('');

      console.log('✅ UI updated, modal closed');

      alert('✅ تم حذف المستخدم بنجاح من قاعدة البيانات\n\nالسبب: ' + deleteReason);
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('❌ حدث خطأ في حذف المستخدم: ' + (error as any).message);
    }
  };

  const handleAddPermission = () => {
    setNewPermissionForm({
      moduleId: '',
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    });
    setShowAddPermissionModal(true);
  };

  const handleSaveNewPermission = async () => {
    if (!selectedUser || !newPermissionForm.moduleId) {
      alert('⚠️ الرجاء اختيار قسم');
      return;
    }

    const moduleMapping: Record<string, string> = {
      finance: 'المالية',
      farms: 'المزارع',
      documentation: 'التوثيق',
      investors: 'المستثمرون',
      reservations: 'الحجوزات',
      operations: 'التشغيل',
      control: 'الرقابة',
      support: 'الدعم',
    };

    try {
      await AdminSessionService.addPermissionToDB({
        admin_phone: selectedUser.phone,
        module_id: newPermissionForm.moduleId,
        module_name_ar: moduleMapping[newPermissionForm.moduleId] || newPermissionForm.moduleId,
        module_name_en: newPermissionForm.moduleId,
        can_view: newPermissionForm.canView,
        can_create: newPermissionForm.canCreate,
        can_edit: newPermissionForm.canEdit,
        can_delete: newPermissionForm.canDelete,
        icon: 'shield',
        is_active: true,
      });

      await loadPermissions(selectedUser.phone);
      setShowAddPermissionModal(false);
      alert('✅ تم إضافة الصلاحية بنجاح');
    } catch (error) {
      console.error('Error adding permission:', error);
      alert('❌ حدث خطأ في إضافة الصلاحية');
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

        {/* Sub Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
              activeSubTab === 'general'
                ? 'text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={activeSubTab === 'general' ? { background: brandGradients.gold } : { color: brandColors.text.primary }}
          >
            <Shield className="w-5 h-5" />
            الصلاحيات العامة
          </button>
          <button
            onClick={() => setActiveSubTab('smart-button')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-semibold ${
              activeSubTab === 'smart-button'
                ? 'text-white'
                : 'bg-white hover:bg-gray-50'
            }`}
            style={activeSubTab === 'smart-button' ? { background: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)' } : { color: brandColors.text.primary }}
          >
            <MessageCircle className="w-5 h-5" />
            الزر الذكي (Smart Button)
          </button>
        </div>

        {/* Content based on active tab */}
        {activeSubTab === 'smart-button' ? (
          currentAdmin ? (
            <AdvancedSmartButtonPermissionsView
              currentUserId={currentAdmin.id}
              isSystemAdmin={currentAdmin.jobTitle === 'مدير النظام'}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>جاري تحميل معلومات المستخدم...</p>
            </div>
          )
        ) : (
          <>

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
                        {selectedUser.phone}
                        {selectedUser.jobTitle && ` • ${selectedUser.jobTitle}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditUser();
                      }}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                      style={{ background: brandGradients.gold }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>تعديل البيانات</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddPermission();
                      }}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                    >
                      <Plus className="h-4 w-4" />
                      <span>إضافة صلاحية</span>
                    </button>
                    {allPermissionsActive ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFreezeUser(selectedUser.phone);
                        }}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}
                      >
                        <Lock className="h-4 w-4" />
                        <span>تجميد</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleActivateUser(selectedUser.phone);
                        }}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                      >
                        <Check className="h-4 w-4" />
                        <span>تفعيل</span>
                      </button>
                    )}
                    {/* زر حذف المستخدم - محمي للمدير العام وصاحب المنصة */}
                    {selectedUser.phone !== '0569335257' && selectedUser.phone !== '0500000001' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteUser(selectedUser);
                        }}
                        className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-white transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' }}
                        title="حذف المستخدم نهائياً"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>حذف المستخدم</span>
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

        {/* نموذج تعديل بيانات المستخدم */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'white', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
          >
            <h3 className="mb-4 text-2xl font-black" style={{ color: brandColors.text.primary }}>
              تعديل بيانات المستخدم
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full rounded-xl border-2 px-4 py-3 font-bold transition-all focus:outline-none"
                  style={{
                    borderColor: brandColors.primary.gold,
                    color: brandColors.text.primary,
                  }}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                  المسمى الوظيفي
                </label>
                <input
                  type="text"
                  value={editUserForm.jobTitle}
                  onChange={(e) => setEditUserForm({ ...editUserForm, jobTitle: e.target.value })}
                  className="w-full rounded-xl border-2 px-4 py-3 font-bold transition-all focus:outline-none"
                  style={{
                    borderColor: brandColors.primary.gold,
                    color: brandColors.text.primary,
                  }}
                  placeholder="أدخل المسمى الوظيفي"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveUserInfo}
                  className="flex-1 rounded-xl py-3 font-bold text-white transition-all hover:scale-105"
                  style={{ background: brandGradients.gold }}
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 rounded-xl py-3 font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: brandColors.text.secondary,
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نموذج إضافة صلاحية جديدة */}
      {showAddPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'white', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
          >
            <h3 className="mb-4 text-2xl font-black" style={{ color: brandColors.text.primary }}>
              إضافة صلاحية جديدة
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                  القسم
                </label>
                <select
                  value={newPermissionForm.moduleId}
                  onChange={(e) => setNewPermissionForm({ ...newPermissionForm, moduleId: e.target.value })}
                  className="w-full rounded-xl border-2 px-4 py-3 font-bold transition-all focus:outline-none"
                  style={{
                    borderColor: brandColors.primary.gold,
                    color: brandColors.text.primary,
                  }}
                >
                  <option value="">اختر القسم</option>
                  <option value="finance">المالية</option>
                  <option value="farms">المزارع</option>
                  <option value="documentation">التوثيق</option>
                  <option value="investors">المستثمرون</option>
                  <option value="reservations">الحجوزات</option>
                  <option value="operations">التشغيل</option>
                  <option value="control">الرقابة</option>
                  <option value="support">الدعم</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="mb-2 block text-sm font-bold" style={{ color: brandColors.text.secondary }}>
                  الصلاحيات
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newPermissionForm.canView}
                    onChange={(e) => setNewPermissionForm({ ...newPermissionForm, canView: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <span className="font-bold" style={{ color: brandColors.text.primary }}>عرض</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newPermissionForm.canCreate}
                    onChange={(e) => setNewPermissionForm({ ...newPermissionForm, canCreate: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <span className="font-bold" style={{ color: brandColors.text.primary }}>إنشاء</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newPermissionForm.canEdit}
                    onChange={(e) => setNewPermissionForm({ ...newPermissionForm, canEdit: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <span className="font-bold" style={{ color: brandColors.text.primary }}>تعديل</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newPermissionForm.canDelete}
                    onChange={(e) => setNewPermissionForm({ ...newPermissionForm, canDelete: e.target.checked })}
                    className="h-5 w-5"
                  />
                  <span className="font-bold" style={{ color: brandColors.text.primary }}>حذف</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveNewPermission}
                  className="flex-1 rounded-xl py-3 font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                >
                  إضافة الصلاحية
                </button>
                <button
                  onClick={() => setShowAddPermissionModal(false)}
                  className="flex-1 rounded-xl py-3 font-bold transition-all hover:scale-105"
                  style={{
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: brandColors.text.secondary,
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نموذج حذف المستخدم */}
      {showDeleteModal && userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-8"
            style={{ background: 'white', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النموذج */}
            <div className="mb-6 text-center">
              <div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)' }}
              >
                <Trash2 className="h-10 w-10" style={{ color: '#DC2626' }} />
              </div>
              <h2 className="mb-2 text-2xl font-black" style={{ color: brandColors.text.primary }}>
                حذف المستخدم
              </h2>
              <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                ⚠️ هذا الإجراء لا يمكن التراجع عنه
              </p>
            </div>

            {/* معلومات المستخدم */}
            <div
              className="mb-6 rounded-2xl p-4"
              style={{ background: 'rgba(0, 0, 0, 0.03)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full font-black text-white"
                  style={{ background: brandGradients.gold }}
                >
                  {userToDelete.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold" style={{ color: brandColors.text.primary }}>
                    {userToDelete.name}
                  </p>
                  <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                    📱 {userToDelete.phone}
                  </p>
                  {userToDelete.jobTitle && (
                    <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                      💼 {userToDelete.jobTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* سبب الحذف */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-bold" style={{ color: brandColors.text.primary }}>
                سبب الحذف <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'استقالة', label: '📤 استقالة من العمل', icon: '📤' },
                  { value: 'انتهاء_عقد', label: '📄 انتهاء العقد', icon: '📄' },
                  { value: 'نقل', label: '🔄 نقل إلى قسم آخر', icon: '🔄' },
                  { value: 'أداء_ضعيف', label: '📉 أداء ضعيف', icon: '📉' },
                  { value: 'مخالفات', label: '⚠️ مخالفات إدارية', icon: '⚠️' },
                  { value: 'آخر', label: '✏️ سبب آخر', icon: '✏️' },
                ].map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteReason(reason.value);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-right font-bold transition-all hover:scale-[1.02]"
                    style={{
                      background: deleteReason === reason.value
                        ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)'
                        : 'rgba(0, 0, 0, 0.02)',
                      border: deleteReason === reason.value
                        ? '2px solid #DC2626'
                        : '2px solid transparent',
                      color: deleteReason === reason.value
                        ? '#DC2626'
                        : brandColors.text.secondary,
                    }}
                  >
                    <span className="text-2xl">{reason.icon}</span>
                    <span className="flex-1">{reason.label.replace(reason.icon + ' ', '')}</span>
                    {deleteReason === reason.value && (
                      <Check className="h-5 w-5" style={{ color: '#DC2626' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  setDeleteReason('');
                }}
                className="flex-1 rounded-xl py-3 font-bold transition-all hover:scale-105"
                style={{
                  background: 'rgba(0, 0, 0, 0.05)',
                  color: brandColors.text.secondary,
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmDeleteUser();
                }}
                disabled={!deleteReason}
                className="flex-1 rounded-xl py-3 font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:scale-105"
                style={{
                  background: deleteReason
                    ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                    : '#9CA3AF',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  <span>تأكيد الحذف</span>
                </div>
              </button>
            </div>

            {/* ملاحظة */}
            <div
              className="mt-4 rounded-xl p-3 text-center text-xs"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(185, 28, 28, 0.05) 100%)',
                color: '#DC2626',
              }}
            >
              ⚠️ سيتم حذف المستخدم وجميع صلاحياته بشكل نهائي
            </div>
          </div>
        </div>
      )}
        </>
        )}
    </div>
  </div>
  );
}
