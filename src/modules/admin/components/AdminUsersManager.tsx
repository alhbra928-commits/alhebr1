import { useState, useEffect } from 'react';
import { User, Edit, Lock, Trash2, Plus, CheckCircle, XCircle, Clock, X, Sparkles } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';
import { SmartUserBuilder } from './SmartUserBuilder';
import { AdminUsersStorage } from '../services/adminUsersStorage';

interface AdminUser {
  phone: string;
  name: string;
  role: string;
  roleAr: string;
  status: 'active' | 'frozen' | 'offline';
  lastLogin?: string;
  avatar?: string;
  secretCode?: string;
}

interface UserFormData {
  phone: string;
  name: string;
  role: 'super_admin' | 'admin' | 'staff';
}

export function AdminUsersManager() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSmartBuilder, setShowSmartBuilder] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    phone: '',
    name: '',
    role: 'staff',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const loadedUsers = AdminUsersStorage.getAll();
    console.log('🔄 تحميل المستخدمين من localStorage:', loadedUsers);
    setUsers(loadedUsers);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'frozen':
        return '#EF4444';
      case 'offline':
        return '#6B7280';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'frozen':
        return 'مجمّد';
      case 'offline':
        return 'غير متصل';
      default:
        return 'غير معروف';
    }
  };

  const handleFreezeUser = async (user: AdminUser) => {
    if (!confirm(`هل تريد تجميد المستخدم "${user.name}"؟`)) return;

    try {
      await AdminSessionService.addAccessLog(
        AdminSessionService.getCurrentSession().admin?.phone || '',
        AdminSessionService.getCurrentSession().admin?.name || '',
        'freeze_user',
        `تجميد المستخدم: ${user.name} (${user.phone})`,
        'success'
      );

      AdminUsersStorage.setStatus(user.phone, 'frozen');
      loadUsers();

      alert('تم تجميد المستخدم بنجاح');
    } catch (error) {
      console.error('Error freezing user:', error);
      alert('حدث خطأ في تجميد المستخدم');
    }
  };

  const handleActivateUser = async (user: AdminUser) => {
    try {
      await AdminSessionService.addAccessLog(
        AdminSessionService.getCurrentSession().admin?.phone || '',
        AdminSessionService.getCurrentSession().admin?.name || '',
        'activate_user',
        `تفعيل المستخدم: ${user.name} (${user.phone})`,
        'success'
      );

      AdminUsersStorage.setStatus(user.phone, 'offline');
      loadUsers();

      alert('تم تفعيل المستخدم بنجاح');
    } catch (error) {
      console.error('Error activating user:', error);
      alert('حدث خطأ في تفعيل المستخدم');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!confirm(`⚠️ هل أنت متأكد من حذف المستخدم "${user.name}"؟\n\nهذا الإجراء لا يمكن التراجع عنه!`)) return;

    try {
      await AdminSessionService.addAccessLog(
        AdminSessionService.getCurrentSession().admin?.phone || '',
        AdminSessionService.getCurrentSession().admin?.name || '',
        'delete_user',
        `حذف المستخدم: ${user.name} (${user.phone})`,
        'success'
      );

      AdminUsersStorage.remove(user.phone);
      loadUsers();
      alert('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('حدث خطأ في حذف المستخدم');
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'لم يسجل دخول بعد';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const getRoleText = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'مدير عام';
      case 'admin':
        return 'مدير';
      case 'staff':
        return 'موظف';
      default:
        return 'موظف';
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData({ phone: '', name: '', role: 'staff' });
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      phone: user.phone,
      name: user.name,
      role: user.role as 'super_admin' | 'admin' | 'staff',
    });
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setFormData({ phone: '', name: '', role: 'staff' });
    setIsEditing(false);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'الرجاء إدخال اسم المستخدم';
    }
    if (!formData.phone.trim()) {
      return 'الرجاء إدخال رقم الجوال';
    }
    if (!/^05\d{8}$/.test(formData.phone)) {
      return 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    }
    if (!isEditing && users.some(u => u.phone === formData.phone)) {
      return 'رقم الجوال مسجل مسبقاً';
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      const currentSession = AdminSessionService.getCurrentSession();

      if (isEditing && selectedUser) {
        await AdminSessionService.addAccessLog(
          currentSession.admin?.phone || '',
          currentSession.admin?.name || '',
          'update_user',
          `تعديل مستخدم: ${formData.name} (${formData.phone})`,
          'success'
        );

        setUsers(users.map(u =>
          u.phone === selectedUser.phone
            ? {
                ...u,
                name: formData.name,
                phone: formData.phone,
                role: formData.role,
                roleAr: getRoleText(formData.role),
              }
            : u
        ));

        alert('تم تعديل المستخدم بنجاح');
      } else {
        await AdminSessionService.addAccessLog(
          currentSession.admin?.phone || '',
          currentSession.admin?.name || '',
          'create_user',
          `إضافة مستخدم جديد: ${formData.name} (${formData.phone})`,
          'success'
        );

        const newUser: AdminUser = {
          phone: formData.phone,
          name: formData.name,
          role: formData.role,
          roleAr: getRoleText(formData.role),
          status: 'offline',
        };

        setUsers([...users, newUser]);
        alert('تم إضافة المستخدم بنجاح');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('حدث خطأ في حفظ المستخدم');
    }
  };

  const handleSmartBuilderSuccess = (userData: any) => {
    console.log('🎯🎯🎯 handleSmartBuilderSuccess CALLED!');
    console.log('📥 userData received:', userData);

    const newUser: AdminUser = {
      phone: userData.phone,
      name: userData.name,
      role: userData.role,
      roleAr: getRoleText(userData.role),
      status: userData.status as 'active' | 'frozen' | 'offline' | 'pending',
      lastLogin: userData.status === 'active' ? new Date().toISOString() : undefined,
      secretCode: userData.secretCode,
      permissions: userData.permissions,
      jobTitle: userData.jobTitle,
      department: userData.department,
      color: userData.color,
      createdAt: userData.createdAt,
      createdBy: userData.createdBy,
    };

    console.log('👤 newUser object created:', newUser);
    console.log('💾 Calling AdminUsersStorage.add()...');

    AdminUsersStorage.add(newUser);

    console.log('✅ AdminUsersStorage.add() completed');

    const allUsers = AdminUsersStorage.getAll();
    console.log('📊 جميع المستخدمين بعد الإضافة:', allUsers.length, 'مستخدمين');
    console.log('📋 القائمة الكاملة:', allUsers);

    // Verify in localStorage directly
    const rawData = localStorage.getItem('palm_olive_admin_users');
    console.log('🔍 Raw localStorage data:', rawData);

    // Force refresh users list
    setTimeout(() => {
      console.log('🔄 Forcing users refresh...');
      loadUsers();
      console.log('🔄 loadUsers() called');
    }, 100);

    setShowSmartBuilder(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: brandGradients.gold }}
            >
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                المستخدمون الإداريون
              </h1>
              <p className="mt-1 text-sm text-white/70">
                إدارة المدراء والموظفين المصرح لهم بالدخول
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSmartBuilder(true)}
              className="flex items-center gap-2 rounded-xl px-6 py-3 font-black text-white transition-all hover:scale-105 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                boxShadow: '0 8px 32px rgba(212, 175, 55, 0.5)',
              }}
            >
              <Sparkles className="h-5 w-5" />
              <span>➕ إضافة مستخدم ذكي</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-xl px-6 py-3 font-black text-white transition-all hover:scale-105"
              style={{ background: 'rgba(107, 114, 128, 0.5)' }}
            >
              <Plus className="h-5 w-5" />
              <span>إضافة سريعة</span>
            </button>
          </div>
        </div>

        <div
          className="mb-6 rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(196, 148, 31, 0.1) 100%)',
            border: `2px solid ${brandColors.primary.gold}40`,
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-white/70">إجمالي المستخدمين</p>
              <p className="mt-1 text-3xl font-black" style={{ color: brandColors.primary.gold }}>
                {users.length}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-white/70">النشطون حالياً</p>
              <p className="mt-1 text-3xl font-black text-green-400">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold text-white/70">المجمدون</p>
              <p className="mt-1 text-3xl font-black text-red-400">
                {users.filter(u => u.status === 'frozen').length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.phone}
              className="group rounded-2xl p-6 transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: `2px solid ${getStatusColor(user.status)}40`,
                boxShadow: `0 8px 32px ${getStatusColor(user.status)}20`,
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full font-black text-white"
                    style={{ background: brandGradients.gold }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{user.name}</h3>
                    <p className="text-sm text-white/70">{user.phone}</p>
                  </div>
                </div>

                <div
                  className="rounded-full px-3 py-1 text-xs font-black text-white"
                  style={{ background: getStatusColor(user.status) }}
                >
                  {getStatusText(user.status)}
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm font-bold text-white/70">المسمى الوظيفي</span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      background: user.role === 'super_admin' ? brandGradients.gold : 'rgba(107, 114, 128, 0.3)',
                      color: 'white',
                    }}
                  >
                    {user.roleAr}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm font-bold text-white/70">آخر دخول</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/50" />
                    <span className="text-sm font-bold text-white">
                      {formatLastLogin(user.lastLogin)}
                    </span>
                  </div>
                </div>

                {user.secretCode && (
                  <div
                    className="flex items-center justify-between rounded-lg p-3"
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '2px solid rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <span className="text-sm font-bold text-white/90">🔑 الرقم السري</span>
                    <span
                      className="rounded-lg px-4 py-1 text-lg font-black tracking-wider"
                      style={{
                        background: brandGradients.gold,
                        color: 'white',
                        letterSpacing: '0.2em',
                      }}
                    >
                      {user.secretCode}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'rgba(59, 130, 246, 0.3)' }}
                >
                  <Edit className="h-4 w-4" />
                  <span className="text-sm">تعديل</span>
                </button>

                {user.status === 'frozen' ? (
                  <button
                    onClick={() => handleActivateUser(user)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-bold text-white transition-all hover:scale-105"
                    style={{ background: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">تفعيل</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFreezeUser(user)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-bold text-white transition-all hover:scale-105"
                    style={{ background: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">تجميد</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteUser(user)}
                  className="flex items-center justify-center rounded-lg px-3 py-2 font-bold text-white transition-all hover:scale-105"
                  style={{ background: 'rgba(239, 68, 68, 0.5)' }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-8"
            style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">
                {isEditing ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 transition-all hover:bg-white/10"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: محمد أحمد"
                  className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  maxLength={10}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white placeholder-white/50 transition-all focus:bg-white/20 focus:outline-none"
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="mt-1 text-xs text-white/50">
                    لا يمكن تعديل رقم الجوال
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/70">
                  المسمى الوظيفي
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'super_admin' | 'admin' | 'staff' })}
                  className="w-full rounded-xl bg-white/10 px-4 py-3 font-bold text-white transition-all focus:bg-white/20 focus:outline-none"
                >
                  <option value="staff" className="bg-gray-800">موظف</option>
                  <option value="admin" className="bg-gray-800">مدير</option>
                  <option value="super_admin" className="bg-gray-800">مدير عام</option>
                </select>
              </div>

              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: `2px solid ${brandColors.primary.gold}40`,
                }}
              >
                <p className="text-sm font-bold text-white/90">
                  📝 ملاحظة: سيتمكن المستخدم من تسجيل الدخول باستخدام رقم الجوال
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 rounded-xl py-3 font-black text-white transition-all hover:scale-105"
                style={{ background: 'rgba(107, 114, 128, 0.3)' }}
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-xl py-3 font-black text-white transition-all hover:scale-105"
                style={{ background: brandGradients.gold }}
              >
                {isEditing ? 'حفظ التعديلات' : 'إضافة المستخدم'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSmartBuilder && (
        <SmartUserBuilder
          onClose={() => setShowSmartBuilder(false)}
          onSuccess={handleSmartBuilderSuccess}
          existingUsers={users}
        />
      )}
    </div>
  );
}
