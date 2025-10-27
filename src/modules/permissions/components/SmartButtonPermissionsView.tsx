import React, { useState, useEffect } from 'react';
import {
  MessageCircle, Shield, Users, CheckCircle2, XCircle, Edit2, Save,
  RefreshCw, AlertTriangle, Eye, Settings, MessageSquare, Brain, TestTube
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface AdminUser {
  id: string;
  phone_number: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
}

interface UserPermissions {
  user_id: string;
  user_name: string;
  phone_number: string;
  role_name: string;
  permissions: {
    view: boolean;
    edit: boolean;
    responses: boolean;
    ai: boolean;
    test: boolean;
  };
}

export const SmartButtonPermissionsView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all admin users
      const { data: usersData, error: usersError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // Load permissions for each user
      const permissionsPromises = (usersData || []).map(async (user) => {
        const { data: perms } = await supabase
          .from('smart_button_sub_permissions')
          .select('*')
          .eq('phone_number', user.phone_number)
          .single();

        return {
          user_id: user.id,
          user_name: user.full_name,
          phone_number: user.phone_number,
          role_name: 'إداري', // يمكن تحسينه لاحقاً
          permissions: {
            view: perms?.can_view || false,
            edit: perms?.can_edit || false,
            responses: perms?.can_manage_responses || false,
            ai: perms?.can_manage_ai || false,
            test: perms?.can_test || false
          }
        };
      });

      const permsData = await Promise.all(permissionsPromises);
      setUserPermissions(permsData);

    } catch (err: any) {
      console.error('Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (
    userId: string,
    phoneNumber: string,
    permissionKey: keyof UserPermissions['permissions']
  ) => {
    try {
      setSaving(true);

      // Find current permissions
      const userPerm = userPermissions.find(u => u.user_id === userId);
      if (!userPerm) return;

      const newValue = !userPerm.permissions[permissionKey];

      // Map permission keys to database columns
      const columnMap = {
        view: 'can_view',
        edit: 'can_edit',
        responses: 'can_manage_responses',
        ai: 'can_manage_ai',
        test: 'can_test'
      };

      // Check if record exists
      const { data: existing } = await supabase
        .from('smart_button_sub_permissions')
        .select('id')
        .eq('phone_number', phoneNumber)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('smart_button_sub_permissions')
          .update({ [columnMap[permissionKey]]: newValue })
          .eq('phone_number', phoneNumber);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('smart_button_sub_permissions')
          .insert({
            phone_number: phoneNumber,
            [columnMap[permissionKey]]: newValue,
            can_view: permissionKey === 'view' ? newValue : false,
            can_edit: false,
            can_manage_responses: false,
            can_manage_ai: false,
            can_test: false
          });

        if (error) throw error;
      }

      // Reload data
      await loadData();

      setSuccessMessage(`تم تحديث صلاحية ${getPermissionLabel(permissionKey)} بنجاح`);
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGrantAllPermissions = async (userId: string, phoneNumber: string) => {
    if (!confirm('هل أنت متأكد من منح جميع الصلاحيات لهذا المستخدم؟')) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('smart_button_sub_permissions')
        .upsert({
          phone_number: phoneNumber,
          can_view: true,
          can_edit: true,
          can_manage_responses: true,
          can_manage_ai: true,
          can_test: true
        }, {
          onConflict: 'phone_number'
        });

      if (error) throw error;

      await loadData();

      setSuccessMessage('تم منح جميع الصلاحيات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeAllPermissions = async (userId: string, phoneNumber: string) => {
    if (!confirm('هل أنت متأكد من إلغاء جميع الصلاحيات لهذا المستخدم؟')) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('smart_button_sub_permissions')
        .delete()
        .eq('phone_number', phoneNumber);

      if (error) throw error;

      await loadData();

      setSuccessMessage('تم إلغاء جميع الصلاحيات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getPermissionLabel = (key: keyof UserPermissions['permissions']): string => {
    const labels = {
      view: 'عرض إعدادات الزر',
      edit: 'تعديل إعدادات الزر',
      responses: 'إدارة الردود التلقائية',
      ai: 'إدارة الذكاء المتقدم',
      test: 'اختبار الزر الذكي'
    };
    return labels[key];
  };

  const getPermissionIcon = (key: keyof UserPermissions['permissions']) => {
    const icons = {
      view: Eye,
      edit: Settings,
      responses: MessageSquare,
      ai: Brain,
      test: TestTube
    };
    const Icon = icons[key];
    return <Icon className="w-4 h-4" />;
  };

  const getPermissionColor = (key: keyof UserPermissions['permissions']): string => {
    const colors = {
      view: 'cyan',
      edit: 'green',
      responses: 'blue',
      ai: 'purple',
      test: 'yellow'
    };
    return colors[key];
  };

  const calculatePermissionStats = () => {
    const totalUsers = userPermissions.length;
    const usersWithView = userPermissions.filter(u => u.permissions.view).length;
    const usersWithEdit = userPermissions.filter(u => u.permissions.edit).length;
    const usersWithFullAccess = userPermissions.filter(u =>
      u.permissions.view && u.permissions.edit && u.permissions.responses &&
      u.permissions.ai && u.permissions.test
    ).length;

    return { totalUsers, usersWithView, usersWithEdit, usersWithFullAccess };
  };

  const stats = calculatePermissionStats();

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-center animate-pulse">
          {successMessage}
        </div>
      )}

      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">صلاحيات الزر الذكي</h1>
            <p className="text-gray-400 text-sm">إدارة الوصول والتحكم في الزر الذكي (Smart WhatsApp Button)</p>
          </div>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
          </div>
          <p className="text-gray-300 text-sm">إجمالي المستخدمين</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-xl p-4 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-bold text-white">{stats.usersWithView}</span>
          </div>
          <p className="text-gray-300 text-sm">لديهم صلاحية العرض</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <Edit2 className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-white">{stats.usersWithEdit}</span>
          </div>
          <p className="text-gray-300 text-sm">لديهم صلاحية التعديل</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white">{stats.usersWithFullAccess}</span>
          </div>
          <p className="text-gray-300 text-sm">وصول كامل</p>
        </div>
      </div>

      {/* شرح الصلاحيات */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">الصلاحيات الخمس للزر الذكي:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span><strong>عرض:</strong> الاطلاع على التبويب فقط</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-400" />
                <span><strong>تعديل:</strong> تغيير إعدادات الزر</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span><strong>الردود:</strong> إدارة الردود التلقائية</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span><strong>الذكاء:</strong> التحكم في المحرك الذكي</span>
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4 text-yellow-400" />
                <span><strong>اختبار:</strong> اختبار الزر في الواجهة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">جدول صلاحيات المستخدمين</h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-white font-semibold">المستخدم</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">عرض</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">تعديل</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">ردود</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">ذكاء</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">اختبار</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {userPermissions.map((userPerm) => (
                  <tr key={userPerm.user_id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-semibold">{userPerm.user_name}</p>
                        <p className="text-gray-400 text-sm">{userPerm.phone_number}</p>
                      </div>
                    </td>

                    {(['view', 'edit', 'responses', 'ai', 'test'] as const).map((permKey) => (
                      <td key={permKey} className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(userPerm.user_id, userPerm.phone_number, permKey)}
                          disabled={saving}
                          className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                            userPerm.permissions[permKey]
                              ? `bg-${getPermissionColor(permKey)}-500 hover:bg-${getPermissionColor(permKey)}-600`
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {userPerm.permissions[permKey] ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                    ))}

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleGrantAllPermissions(userPerm.user_id, userPerm.phone_number)}
                          disabled={saving}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-all disabled:opacity-50"
                          title="منح الكل"
                        >
                          منح الكل
                        </button>
                        <button
                          onClick={() => handleRevokeAllPermissions(userPerm.user_id, userPerm.phone_number)}
                          disabled={saving}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all disabled:opacity-50"
                          title="إلغاء الكل"
                        >
                          إلغاء الكل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {userPermissions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      لا يوجد مستخدمين
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ملاحظة أمنية */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold mb-2">ملاحظة أمنية:</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• يتم تسجيل جميع محاولات التعديل غير المصرح بها في السجلات الأمنية</li>
              <li>• المستخدمون بدون صلاحية العرض لن يتمكنوا من رؤية تبويب الزر الذكي</li>
              <li>• التعديلات تطبق فوراً على النظام الحي</li>
              <li>• يُنصح بمنح صلاحية "اختبار" للمطورين فقط</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
