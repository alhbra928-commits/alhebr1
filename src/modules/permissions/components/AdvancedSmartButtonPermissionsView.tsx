import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Unlock, Clock, Activity, AlertTriangle, CheckCircle2,
  X, Plus, Settings, BarChart3, Users, TrendingUp, Calendar, Eye,
  EyeOff, Ban, Play, Pause, Trash2, Download, Brain, Zap
} from 'lucide-react';
import { smartButtonPermissionsService, Permission, ActivityLog, ViolationAlert, SmartRule } from '../services/smartButtonPermissionsService';

interface Props {
  currentUserId: string;
  isSystemAdmin: boolean;
}

type TabType = 'permissions' | 'smart-access' | 'audit';

export const AdvancedSmartButtonPermissionsView: React.FC<Props> = ({ currentUserId, isSystemAdmin }) => {
  const [activeTab, setActiveTab] = useState<TabType>('permissions');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [violationAlerts, setViolationAlerts] = useState<ViolationAlert[]>([]);
  const [smartRules, setSmartRules] = useState<SmartRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedUserId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'permissions') {
        const perms = await smartButtonPermissionsService.getUserPermissions(selectedUserId);
        setPermissions(perms);
      } else if (activeTab === 'smart-access') {
        const rules = await smartButtonPermissionsService.getSmartRules(isSystemAdmin ? null : selectedUserId);
        setSmartRules(rules);
      } else if (activeTab === 'audit') {
        const logs = await smartButtonPermissionsService.getActivityLogs(isSystemAdmin ? null : selectedUserId, 100);
        const alerts = await smartButtonPermissionsService.getViolationAlerts(true);
        setActivityLogs(logs);
        setViolationAlerts(alerts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async (permissionCode: string, isTemporary: boolean = false) => {
    if (!isSystemAdmin) return;

    try {
      await smartButtonPermissionsService.grantPermission(
        selectedUserId,
        permissionCode,
        isTemporary,
        isTemporary ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
        currentUserId,
        'Granted via permissions management'
      );
      await loadData();
    } catch (error) {
      console.error('Error granting permission:', error);
    }
  };

  const handleRevokePermission = (permissionCode: string) => {
    if (!isSystemAdmin) return;

    setConfirmDialog({
      show: true,
      title: 'تأكيد الإلغاء',
      message: 'هل أنت متأكد من إلغاء هذه الصلاحية؟ هذا الإجراء يتطلب تأكيد مزدوج.',
      action: async () => {
        try {
          await smartButtonPermissionsService.revokePermission(selectedUserId, permissionCode);
          await loadData();
          setConfirmDialog(null);
        } catch (error) {
          console.error('Error revoking permission:', error);
        }
      }
    });
  };

  const handleSuspendPermission = async (permissionCode: string) => {
    if (!isSystemAdmin) return;

    try {
      await smartButtonPermissionsService.suspendPermission(selectedUserId, permissionCode);
      await loadData();
    } catch (error) {
      console.error('Error suspending permission:', error);
    }
  };

  const handleReactivatePermission = async (permissionCode: string) => {
    if (!isSystemAdmin) return;

    try {
      await smartButtonPermissionsService.reactivatePermission(selectedUserId, permissionCode);
      await loadData();
    } catch (error) {
      console.error('Error reactivating permission:', error);
    }
  };

  const getPermissionStatusBadge = (perm: Permission) => {
    if (!perm.status) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 rounded-lg text-gray-400">
          <Ban className="w-4 h-4" />
          <span className="text-sm">غير مفعّلة</span>
        </div>
      );
    }

    if (perm.status === 'active') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg text-green-400 border border-green-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">نشطة</span>
        </div>
      );
    }

    if (perm.status === 'temporary') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 rounded-lg text-yellow-400 border border-yellow-500/30">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">مؤقتة</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg text-red-400 border border-red-500/30">
        <Ban className="w-4 h-4" />
        <span className="text-sm font-medium">موقوفة</span>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">صلاحيات الزر الذكي v2.0</h1>
            <p className="text-gray-400 text-sm">نظام متقدم للتحكم والمراقبة والتحليل مع ذكاء اصطناعي</p>
          </div>
        </div>

        {isSystemAdmin && (
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-400 text-sm font-medium">
              <Shield className="w-4 h-4 inline mr-2" />
              مدير النظام
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'permissions'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Settings className="w-5 h-5" />
          إدارة الصلاحيات
        </button>

        <button
          onClick={() => setActiveTab('smart-access')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'smart-access'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Brain className="w-5 h-5" />
          الوصول الذكي
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          تقارير الاستخدام
        </button>
      </div>

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((perm) => (
                <div
                  key={perm.permission_code}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">{perm.permission_name_ar}</h3>
                      <p className="text-gray-400 text-sm">{perm.description_ar}</p>
                      <p className="text-gray-500 text-xs mt-1 font-mono">{perm.permission_code}</p>
                    </div>
                  </div>

                  {getPermissionStatusBadge(perm)}

                  {perm.status && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>آخر استخدام:</span>
                        <span className="text-gray-300">
                          {perm.last_used_at
                            ? new Date(perm.last_used_at).toLocaleDateString('ar-SA', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'لم تُستخدم بعد'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>عدد مرات الاستخدام:</span>
                        <span className="font-bold text-purple-400 text-sm">{perm.usage_count || 0}</span>
                      </div>

                      {perm.is_temporary && perm.valid_until && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded-lg">
                          <Clock className="w-3 h-3" />
                          تنتهي: {new Date(perm.valid_until).toLocaleString('ar-SA')}
                        </div>
                      )}
                    </div>
                  )}

                  {isSystemAdmin && (
                    <div className="mt-4 flex gap-2">
                      {!perm.status && (
                        <>
                          <button
                            onClick={() => handleGrantPermission(perm.permission_code, false)}
                            className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs transition-all border border-green-500/30"
                          >
                            <Unlock className="w-3 h-3 inline mr-1" />
                            تفعيل دائم
                          </button>
                          <button
                            onClick={() => handleGrantPermission(perm.permission_code, true)}
                            className="flex-1 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs transition-all border border-yellow-500/30"
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            مؤقت (24س)
                          </button>
                        </>
                      )}

                      {perm.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleSuspendPermission(perm.permission_code)}
                            className="flex-1 px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-xs transition-all border border-orange-500/30"
                          >
                            <Pause className="w-3 h-3 inline mr-1" />
                            إيقاف
                          </button>
                          <button
                            onClick={() => handleRevokePermission(perm.permission_code)}
                            className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-all border border-red-500/30"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            إلغاء
                          </button>
                        </>
                      )}

                      {perm.status === 'suspended' && (
                        <>
                          <button
                            onClick={() => handleReactivatePermission(perm.permission_code)}
                            className="flex-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs transition-all border border-green-500/30"
                          >
                            <Play className="w-3 h-3 inline mr-1" />
                            إعادة تفعيل
                          </button>
                          <button
                            onClick={() => handleRevokePermission(perm.permission_code)}
                            className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-all border border-red-500/30"
                          >
                            <Trash2 className="w-3 h-3 inline mr-1" />
                            إلغاء نهائي
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart Access Tab */}
      {activeTab === 'smart-access' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-white font-bold text-lg">نظام الوصول الذكي</h3>
                <p className="text-gray-300 text-sm">التحكم الديناميكي بالصلاحيات حسب السلوك والسياق</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all">
                <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-white font-bold text-sm">ربط بالنشاط</p>
                <p className="text-gray-400 text-xs mt-1">تفعيل تلقائي حسب النشاط الفعلي</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all">
                <Brain className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-white font-bold text-sm">الذكاء السلوكي</p>
                <p className="text-gray-400 text-xs mt-1">تعلم وتكيف ذكي مع الأنماط</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all">
                <Calendar className="w-6 h-6 text-green-400 mb-2" />
                <p className="text-white font-bold text-sm">جدولة زمنية</p>
                <p className="text-gray-400 text-xs mt-1">تفعيل حسب الوقت والتاريخ</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all">
                <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
                <p className="text-white font-bold text-sm">تنبيهات فورية</p>
                <p className="text-gray-400 text-xs mt-1">مراقبة المخالفات والأنشطة</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
              <p>جاري التحميل...</p>
            </div>
          ) : smartRules.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50 text-purple-500" />
              <p className="text-lg font-medium">لا توجد قواعد ذكية بعد</p>
              <p className="text-sm mt-2 text-gray-500">سيتم إضافة قواعد ذكية تلقائياً بناءً على سلوك المستخدمين</p>
            </div>
          ) : (
            <div className="space-y-3">
              {smartRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        rule.rule_type === 'time_based' ? 'bg-blue-500/20 border border-blue-500/30' :
                        rule.rule_type === 'behavior_based' ? 'bg-purple-500/20 border border-purple-500/30' :
                        rule.rule_type === 'ai_suggested' ? 'bg-pink-500/20 border border-pink-500/30' :
                        'bg-green-500/20 border border-green-500/30'
                      }`}>
                        {rule.rule_type === 'time_based' && <Calendar className="w-5 h-5 text-blue-400" />}
                        {rule.rule_type === 'behavior_based' && <Brain className="w-5 h-5 text-purple-400" />}
                        {rule.rule_type === 'ai_suggested' && <Zap className="w-5 h-5 text-pink-400" />}
                        {rule.rule_type === 'context_based' && <Activity className="w-5 h-5 text-green-400" />}
                      </div>
                      <div>
                        <p className="text-white font-bold">{rule.permission_code}</p>
                        <p className="text-gray-400 text-sm">
                          {rule.rule_type === 'time_based' && 'قاعدة زمنية'}
                          {rule.rule_type === 'behavior_based' && 'قاعدة سلوكية'}
                          {rule.rule_type === 'ai_suggested' && 'اقتراح ذكي'}
                          {rule.rule_type === 'context_based' && 'قاعدة سياقية'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {rule.confidence_score > 0 && (
                        <div className="text-sm flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-lg">
                          <span className="text-gray-400">الثقة: </span>
                          <span className="text-green-400 font-bold">
                            {(rule.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}

                      {rule.is_active ? (
                        <div className="px-3 py-1 bg-green-500/20 rounded-lg text-green-400 text-sm font-medium border border-green-500/30">
                          نشط
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-gray-700/50 rounded-lg text-gray-400 text-sm">
                          متوقف
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Violation Alerts */}
          {violationAlerts.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-white font-bold">تنبيهات المخالفات ({violationAlerts.length})</h3>
              </div>

              <div className="space-y-2">
                {violationAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-bold">{alert.details}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(alert.created_at).toLocaleString('ar-SA')}
                        </p>
                        {alert.auto_lockout_triggered && (
                          <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            تم إيقاف الحساب مؤقتاً حتى {alert.lockout_until && new Date(alert.lockout_until).toLocaleTimeString('ar-SA')}
                          </p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-gray-700/50 text-gray-400'
                      }`}>
                        {alert.severity === 'critical' && 'حرج'}
                        {alert.severity === 'high' && 'عالي'}
                        {alert.severity === 'medium' && 'متوسط'}
                        {alert.severity === 'low' && 'منخفض'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logs */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                سجل النشاطات
              </h3>
              <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all flex items-center gap-2 border border-blue-500/30">
                <Download className="w-4 h-4" />
                تصدير PDF
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
                <p>جاري التحميل...</p>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>لا توجد نشاطات مسجلة</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {log.was_successful ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{log.action_description}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {log.permission_code} • {new Date(log.created_at).toLocaleString('ar-SA')}
                          </p>
                          {!log.was_successful && log.denial_reason && (
                            <p className="text-red-400 text-xs mt-1 bg-red-500/10 p-2 rounded">{log.denial_reason}</p>
                          )}
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        log.action_type === 'denied' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        log.action_type === 'delete' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {log.action_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">{confirmDialog.title}</h3>
            <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDialog.action}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-medium"
              >
                تأكيد نهائي
              </button>
              <button
                onClick={() => setConfirmDialog(null)}
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
