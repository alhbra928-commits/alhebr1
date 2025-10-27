import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Clock, Activity, CheckCircle2, X, CreditCard as Edit2, UserCheck, AlertTriangle, TrendingUp, Users, Eye, Settings as SettingsIcon, MessageSquare, Brain, BarChart3, Trash2, Plus, Calendar } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { smartButtonPermissionsService } from '../../permissions/services/smartButtonPermissionsService';

interface Employee {
  id: string;
  full_name: string;
  phone: string;
  job_title: string;
  email: string;
}

interface ButtonAccess {
  id: string;
  employee_id: string;
  employee_name: string;
  permissions: {
    edit_settings: boolean;
    manage_responses: boolean;
    manage_ai: boolean;
    view_stats: boolean;
  };
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'suspended';
  last_modified: string;
}

export const SmartButtonAccessControl: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [accessList, setAccessList] = useState<ButtonAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    job_title: '',
    edit_settings: false,
    manage_responses: false,
    manage_ai: false,
    view_stats: true,
    is_temporary: false,
    expires_in_days: 7
  });
  const [stats, setStats] = useState({
    total_employees_with_access: 0,
    active_permissions: 0,
    denied_attempts_7days: 0,
    recent_changes: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load employees
      const { data: employeesData, error: empError } = await supabase
        .from('admin_users')
        .select('id, full_name, phone, job_title, email')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('full_name');

      if (empError) throw empError;
      setEmployees(employeesData || []);

      // Load existing access permissions
      const accessData = await loadAccessList(employeesData || []);
      setAccessList(accessData);

      // Load stats
      await loadStats();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccessList = async (employeesList: Employee[]): Promise<ButtonAccess[]> => {
    try {
      const accessPromises = employeesList.map(async (emp) => {
        const perms = await smartButtonPermissionsService.getUserPermissions(emp.id);

        const permissions = {
          edit_settings: perms.some(p => p.permission_code === 'whatsapp.button.edit' && p.status === 'active'),
          manage_responses: perms.some(p => p.permission_code === 'whatsapp.button.responses' && p.status === 'active'),
          manage_ai: perms.some(p => p.permission_code === 'whatsapp.button.ai' && p.status === 'active'),
          view_stats: perms.some(p => p.permission_code === 'whatsapp.button.stats' && p.status === 'active')
        };

        const hasAnyPermission = Object.values(permissions).some(p => p);
        if (!hasAnyPermission) return null;

        const activePerm = perms.find(p => p.status === 'active');

        return {
          id: emp.id,
          employee_id: emp.id,
          employee_name: emp.full_name,
          permissions,
          granted_by: 'System Admin',
          granted_at: activePerm?.last_used_at || new Date().toISOString(),
          expires_at: activePerm?.valid_until || null,
          status: activePerm?.is_temporary && activePerm?.valid_until && new Date(activePerm.valid_until) < new Date()
            ? 'expired'
            : 'active',
          last_modified: new Date().toISOString()
        } as ButtonAccess;
      });

      const results = await Promise.all(accessPromises);
      return results.filter((r): r is ButtonAccess => r !== null);
    } catch (error) {
      console.error('Error loading access list:', error);
      return [];
    }
  };

  const loadStats = async () => {
    try {
      const { data: violationData } = await supabase
        .from('permission_violation_alerts')
        .select('id')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_resolved', false);

      setStats({
        total_employees_with_access: accessList.length,
        active_permissions: accessList.filter(a => a.status === 'active').length,
        denied_attempts_7days: violationData?.length || 0,
        recent_changes: accessList.filter(a => {
          const modifiedDate = new Date(a.last_modified);
          const daysDiff = (Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        }).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleTogglePermission = async (
    employeeId: string,
    permissionType: 'edit_settings' | 'manage_responses' | 'manage_ai' | 'view_stats'
  ) => {
    try {
      const permissionCodeMap = {
        edit_settings: 'whatsapp.button.edit',
        manage_responses: 'whatsapp.button.responses',
        manage_ai: 'whatsapp.button.ai',
        view_stats: 'whatsapp.button.stats'
      };

      const currentAccess = accessList.find(a => a.employee_id === employeeId);
      const currentValue = currentAccess?.permissions[permissionType] || false;

      if (currentValue) {
        await smartButtonPermissionsService.revokePermission(employeeId, permissionCodeMap[permissionType]);
      } else {
        const session = JSON.parse(localStorage.getItem('admin_session') || '{}');
        await smartButtonPermissionsService.grantPermission(
          employeeId,
          permissionCodeMap[permissionType],
          false,
          null,
          session.admin?.id || 'system'
        );
      }

      await loadData();
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  const handleAddAccess = async () => {
    if (!newEmployeeForm.full_name || !newEmployeeForm.phone) {
      alert('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem('admin_session') || '{}');
      const currentUserId = session.admin?.id || 'system';

      // 1. تسجيل الموظف الجديد أو التحقق من وجوده
      let employeeId: string;

      const { data: existingEmployee } = await supabase
        .from('admin_users')
        .select('id')
        .eq('phone', newEmployeeForm.phone)
        .maybeSingle();

      if (existingEmployee) {
        employeeId = existingEmployee.id;
      } else {
        // إنشاء موظف جديد
        // التأكد من وجود بريد إلكتروني (إلزامي في الجدول)
        const emailToUse = newEmployeeForm.email && newEmployeeForm.email.trim() !== ''
          ? newEmployeeForm.email
          : `${newEmployeeForm.phone.replace(/\D/g, '')}@whatsapp.local`;

        const { data: newEmployee, error: createError } = await supabase
          .from('admin_users')
          .insert({
            full_name: newEmployeeForm.full_name.trim(),
            phone: newEmployeeForm.phone.trim(),
            email: emailToUse,
            job_title: newEmployeeForm.job_title && newEmployeeForm.job_title.trim() !== ''
              ? newEmployeeForm.job_title
              : 'موظف واتساب',
            is_active: true,
            secret_code: Math.random().toString(36).substring(2, 10).toUpperCase()
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Database error:', createError);
          throw new Error(`فشل إنشاء الموظف: ${createError.message}`);
        }

        if (!newEmployee) {
          throw new Error('فشل إنشاء الموظف: لم يتم إرجاع بيانات');
        }

        employeeId = newEmployee.id;
      }

      // 2. منح صلاحيات الزر الذكي
      const expiryDate = newEmployeeForm.is_temporary
        ? new Date(Date.now() + newEmployeeForm.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const permissionsToGrant = [
        { code: 'whatsapp.button.edit', enabled: newEmployeeForm.edit_settings },
        { code: 'whatsapp.button.responses', enabled: newEmployeeForm.manage_responses },
        { code: 'whatsapp.button.ai', enabled: newEmployeeForm.manage_ai },
        { code: 'whatsapp.button.stats', enabled: newEmployeeForm.view_stats }
      ];

      for (const perm of permissionsToGrant) {
        if (perm.enabled) {
          await smartButtonPermissionsService.grantPermission(
            employeeId,
            perm.code,
            newEmployeeForm.is_temporary,
            expiryDate,
            currentUserId
          );
        }
      }

      setShowAddModal(false);
      setNewEmployeeForm({
        full_name: '',
        phone: '',
        email: '',
        job_title: '',
        edit_settings: false,
        manage_responses: false,
        manage_ai: false,
        view_stats: true,
        is_temporary: false,
        expires_in_days: 7
      });
      await loadData();

      // رسالة نجاح
      alert('✅ تم تسجيل الموظف ومنح الصلاحيات بنجاح!');
    } catch (error: any) {
      console.error('Error adding access:', error);

      // رسالة خطأ مفصلة
      const errorMessage = error?.message || 'حدث خطأ غير معروف';

      if (errorMessage.includes('duplicate key value')) {
        alert('❌ خطأ: رقم الهاتف أو البريد الإلكتروني مسجل مسبقاً');
      } else if (errorMessage.includes('violates')) {
        alert('❌ خطأ: البيانات المدخلة غير صحيحة أو غير مكتملة');
      } else {
        alert(`❌ حدث خطأ أثناء إضافة الموظف:\n${errorMessage}`);
      }
    }
  };

  const handleRevokeAllAccess = async (employeeId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء جميع صلاحيات هذا الموظف؟')) return;

    try {
      const permissions = ['whatsapp.button.edit', 'whatsapp.button.responses', 'whatsapp.button.ai', 'whatsapp.button.stats'];

      for (const perm of permissions) {
        try {
          await smartButtonPermissionsService.revokePermission(employeeId, perm);
        } catch (err) {
          // Continue even if one fails
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const getPermissionIcon = (type: string) => {
    switch (type) {
      case 'edit_settings': return SettingsIcon;
      case 'manage_responses': return MessageSquare;
      case 'manage_ai': return Brain;
      case 'view_stats': return BarChart3;
      default: return Shield;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">صلاحيات الزر الذكي</h2>
            <p className="text-gray-400 text-sm">التحكم في وصول الموظفين لمزايا الزر الذكي</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          منح صلاحية جديدة
        </button>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-white">{stats.total_employees_with_access}</span>
          </div>
          <p className="text-gray-300 text-sm">موظفون لديهم صلاحيات</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-white">{stats.active_permissions}</span>
          </div>
          <p className="text-gray-300 text-sm">صلاحيات نشطة</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl p-4 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-bold text-white">{stats.denied_attempts_7days}</span>
          </div>
          <p className="text-gray-300 text-sm">محاولات مرفوضة (7 أيام)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white">{stats.recent_changes}</span>
          </div>
          <p className="text-gray-300 text-sm">تعديلات حديثة</p>
        </div>
      </div>

      {/* Access Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            جدول الصلاحيات الحالية
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : accessList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد صلاحيات ممنوحة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-white font-semibold">الموظف</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">تعديل الإعدادات</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">إدارة الردود</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">الذكاء المتقدم</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">الإحصاءات</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">تاريخ التعديل</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-center text-white font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {accessList.map((access) => (
                  <tr key={access.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{access.employee_name}</span>
                      </div>
                    </td>

                    {(['edit_settings', 'manage_responses', 'manage_ai', 'view_stats'] as const).map((permType) => (
                      <td key={permType} className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleTogglePermission(access.employee_id, permType)}
                          className={`p-2 rounded-lg transition-all ${
                            access.permissions[permType]
                              ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30'
                              : 'bg-gray-700/50 hover:bg-gray-600/50'
                          }`}
                        >
                          {access.permissions[permType] ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <X className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                    ))}

                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-400 text-sm">
                        {new Date(access.last_modified).toLocaleDateString('ar-SA')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {access.status === 'active' ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-lg text-green-400 text-sm border border-green-500/30">
                          <CheckCircle2 className="w-4 h-4" />
                          نشط
                        </div>
                      ) : access.status === 'expired' ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-sm border border-red-500/30">
                          <Clock className="w-4 h-4" />
                          منتهي
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700/50 rounded-lg text-gray-400 text-sm">
                          <Lock className="w-4 h-4" />
                          موقوف
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRevokeAllAccess(access.employee_id)}
                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        إلغاء الكل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              تسجيل موظف ومنح صلاحيات الزر الذكي
            </h3>

            <div className="space-y-4">
              {/* Employee Registration Form */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  معلومات الموظف
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">الاسم الكامل *</label>
                    <input
                      type="text"
                      value={newEmployeeForm.full_name}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, full_name: e.target.value })}
                      placeholder="مثال: أحمد محمد"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">رقم الهاتف *</label>
                    <input
                      type="text"
                      value={newEmployeeForm.phone}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={newEmployeeForm.email}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                      placeholder="example@domain.com"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={newEmployeeForm.job_title}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, job_title: e.target.value })}
                      placeholder="مثال: مسؤول الواتساب"
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-all">
                  <input
                    type="checkbox"
                    checked={newEmployeeForm.edit_settings}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, edit_settings: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-green-400" />
                    <span className="text-white text-sm">تعديل الإعدادات</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-all">
                  <input
                    type="checkbox"
                    checked={newEmployeeForm.manage_responses}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, manage_responses: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span className="text-white text-sm">إدارة الردود</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-all">
                  <input
                    type="checkbox"
                    checked={newEmployeeForm.manage_ai}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, manage_ai: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-white text-sm">الذكاء المتقدم</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-all">
                  <input
                    type="checkbox"
                    checked={newEmployeeForm.view_stats}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, view_stats: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    <span className="text-white text-sm">عرض الإحصاءات</span>
                  </div>
                </label>
              </div>

              {/* Temporary Access */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEmployeeForm.is_temporary}
                    onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, is_temporary: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">صلاحية مؤقتة</span>
                  </div>
                </label>

                {newEmployeeForm.is_temporary && (
                  <div className="mt-3">
                    <label className="block text-gray-300 text-sm mb-2">مدة الصلاحية (بالأيام)</label>
                    <input
                      type="number"
                      min="1"
                      value={newEmployeeForm.expires_in_days}
                      onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, expires_in_days: parseInt(e.target.value) || 7 })}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAccess}
                disabled={!newEmployeeForm.full_name || !newEmployeeForm.phone}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تسجيل ومنح الصلاحيات
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
