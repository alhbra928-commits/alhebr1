import React, { useState, useEffect } from 'react';
import {
  Shield, Lock, Unlock, Clock, Activity, AlertTriangle, CheckCircle2,
  X, Settings, BarChart3, Users, TrendingUp, Calendar, Eye, Zap,
  Brain, MessageCircle, TestTube, Download, Play, Pause, Trash2,
  UserCheck, UserX, Award, Target, Sparkles, ArrowRight, ChevronDown,
  Bell, LineChart, PieChart, TrendingDown
} from 'lucide-react';
import { smartButtonPermissionsService, Permission, ActivityLog, ViolationAlert } from '../services/smartButtonPermissionsService';
import { supabase } from '../../../lib/supabase';

interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  job_title: string;
  phone_number: string;
}

interface Props {
  currentUserId: string;
  isSystemAdmin: boolean;
}

type ViewMode = 'cards' | 'analytics' | 'timeline';

export const InnovativeSmartButtonPermissions: React.FC<Props> = ({ currentUserId, isSystemAdmin }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [violationAlerts, setViolationAlerts] = useState<ViolationAlert[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [hoveredPermission, setHoveredPermission] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadData();
    }
  }, [selectedUserId, viewMode]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, full_name, job_title, phone_number')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [perms, logs, alerts, statsData] = await Promise.all([
        smartButtonPermissionsService.getUserPermissions(selectedUserId),
        smartButtonPermissionsService.getActivityLogs(selectedUserId, 50),
        smartButtonPermissionsService.getViolationAlerts(true),
        smartButtonPermissionsService.getActivityStats(selectedUserId, 7)
      ]);

      setPermissions(perms);
      setActivityLogs(logs);
      setViolationAlerts(alerts);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionAction = async (
    permissionCode: string,
    action: 'grant' | 'grant-temp' | 'suspend' | 'reactivate' | 'revoke'
  ) => {
    if (!isSystemAdmin) return;

    try {
      switch (action) {
        case 'grant':
          await smartButtonPermissionsService.grantPermission(
            selectedUserId,
            permissionCode,
            false,
            null,
            currentUserId
          );
          break;
        case 'grant-temp':
          await smartButtonPermissionsService.grantPermission(
            selectedUserId,
            permissionCode,
            true,
            new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            currentUserId
          );
          break;
        case 'suspend':
          await smartButtonPermissionsService.suspendPermission(selectedUserId, permissionCode);
          break;
        case 'reactivate':
          await smartButtonPermissionsService.reactivatePermission(selectedUserId, permissionCode);
          break;
        case 'revoke':
          if (confirm('هل أنت متأكد من إلغاء هذه الصلاحية نهائياً؟')) {
            await smartButtonPermissionsService.revokePermission(selectedUserId, permissionCode);
          }
          break;
      }
      await loadData();
    } catch (error) {
      console.error('Error handling permission action:', error);
    }
  };

  const getPermissionIcon = (code: string) => {
    if (code.includes('view')) return Eye;
    if (code.includes('edit')) return Settings;
    if (code.includes('responses')) return MessageCircle;
    if (code.includes('ai')) return Brain;
    if (code.includes('stats')) return BarChart3;
    if (code.includes('export')) return Download;
    if (code.includes('test')) return TestTube;
    return Shield;
  };

  const getPermissionColor = (code: string) => {
    if (code.includes('view')) return { bg: 'from-cyan-500/20 to-blue-500/20', border: 'cyan-500/30', text: 'cyan-400' };
    if (code.includes('edit')) return { bg: 'from-green-500/20 to-emerald-500/20', border: 'green-500/30', text: 'green-400' };
    if (code.includes('responses')) return { bg: 'from-blue-500/20 to-indigo-500/20', border: 'blue-500/30', text: 'blue-400' };
    if (code.includes('ai')) return { bg: 'from-purple-500/20 to-pink-500/20', border: 'purple-500/30', text: 'purple-400' };
    if (code.includes('stats')) return { bg: 'from-orange-500/20 to-red-500/20', border: 'orange-500/30', text: 'orange-400' };
    if (code.includes('export')) return { bg: 'from-teal-500/20 to-cyan-500/20', border: 'teal-500/30', text: 'teal-400' };
    if (code.includes('test')) return { bg: 'from-yellow-500/20 to-amber-500/20', border: 'yellow-500/30', text: 'yellow-400' };
    return { bg: 'from-gray-500/20 to-gray-600/20', border: 'gray-500/30', text: 'gray-400' };
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const activePermissions = permissions.filter(p => p.status === 'active').length;
  const tempPermissions = permissions.filter(p => p.is_temporary).length;
  const totalUsage = permissions.reduce((sum, p) => sum + (p.usage_count || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Innovative Header with User Selector */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 p-6 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  صلاحيات الزر الذكي
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-gray-300 text-sm mt-1">نظام متطور للتحكم الذكي والمراقبة الآلية</p>
              </div>
            </div>

            {isSystemAdmin && (
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30 text-purple-400 text-sm font-medium flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  مدير النظام
                </div>
              </div>
            )}
          </div>

          {/* User Selector */}
          {isSystemAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="w-full flex items-center justify-between bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 rounded-xl p-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{selectedUser?.full_name || 'اختر مستخدم'}</p>
                    <p className="text-gray-400 text-sm">{selectedUser?.job_title}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showUserSelector ? 'rotate-180' : ''}`} />
              </button>

              {showUserSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setShowUserSelector(false);
                      }}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-700/50 transition-all border-b border-gray-700/30 ${
                        user.id === selectedUserId ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        user.id === selectedUserId
                          ? 'bg-purple-500/20'
                          : 'bg-gray-700/50'
                      }`}>
                        <Users className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-gray-400 text-xs">{user.job_title} • {user.phone_number}</p>
                      </div>
                      {user.id === selectedUserId && (
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{activePermissions}</span>
              </div>
              <p className="text-gray-300 text-sm">صلاحية نشطة</p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-white">{tempPermissions}</span>
              </div>
              <p className="text-gray-300 text-sm">صلاحية مؤقتة</p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">{totalUsage}</span>
              </div>
              <p className="text-gray-300 text-sm">إجمالي الاستخدام</p>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <span className="text-3xl font-bold text-white">{violationAlerts.length}</span>
              </div>
              <p className="text-gray-300 text-sm">تنبيهات نشطة</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setViewMode('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            viewMode === 'cards'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Target className="w-5 h-5" />
          بطاقات الصلاحيات
        </button>

        <button
          onClick={() => setViewMode('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            viewMode === 'analytics'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <PieChart className="w-5 h-5" />
          التحليلات المتقدمة
        </button>

        <button
          onClick={() => setViewMode('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            viewMode === 'timeline'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <LineChart className="w-5 h-5" />
          الخط الزمني
        </button>
      </div>

      {/* Content based on view mode */}
      {loading ? (
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Activity className="relative w-16 h-16 text-purple-400 animate-spin" />
          </div>
          <p className="text-gray-400 mt-4">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <>
          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {permissions.map((perm) => {
                const Icon = getPermissionIcon(perm.permission_code);
                const colors = getPermissionColor(perm.permission_code);
                const isExpanded = expandedCard === perm.permission_code;

                return (
                  <div
                    key={perm.permission_code}
                    onMouseEnter={() => setHoveredPermission(perm.permission_code)}
                    onMouseLeave={() => setHoveredPermission(null)}
                    className={`relative group bg-gray-800/50 backdrop-blur-sm rounded-2xl border transition-all duration-300 ${
                      hoveredPermission === perm.permission_code
                        ? `border-${colors.text} shadow-2xl scale-105`
                        : 'border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg} border border-${colors.border}`}>
                            <Icon className={`w-6 h-6 text-${colors.text}`} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold">{perm.permission_name_ar}</h3>
                            <p className="text-gray-400 text-xs mt-0.5">{perm.permission_code}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-300 text-sm mb-4">{perm.description_ar}</p>

                      {/* Status Badge */}
                      {perm.status ? (
                        <div className="mb-4">
                          {perm.status === 'active' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">نشطة</span>
                            </div>
                          )}
                          {perm.status === 'temporary' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                              <Clock className="w-4 h-4 text-yellow-400" />
                              <span className="text-yellow-400 text-sm font-medium">مؤقتة</span>
                            </div>
                          )}
                          {perm.status === 'suspended' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg border border-red-500/30">
                              <Pause className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-sm font-medium">موقوفة</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg mb-4">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">غير مفعّلة</span>
                        </div>
                      )}

                      {/* Stats */}
                      {perm.status && (
                        <div className="space-y-2 mb-4 p-3 bg-gray-900/50 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">آخر استخدام:</span>
                            <span className="text-gray-300 font-medium">
                              {perm.last_used_at
                                ? new Date(perm.last_used_at).toLocaleDateString('ar-SA', {
                                    day: 'numeric',
                                    month: 'short'
                                  })
                                : 'لم تُستخدم'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">عدد الاستخدام:</span>
                            <span className={`font-bold text-${colors.text}`}>{perm.usage_count || 0}</span>
                          </div>
                          {perm.is_temporary && perm.valid_until && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded mt-2">
                              <Clock className="w-3 h-3" />
                              تنتهي: {new Date(perm.valid_until).toLocaleDateString('ar-SA')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {isSystemAdmin && (
                        <div className="space-y-2">
                          {!perm.status && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'grant')}
                                className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all border border-green-500/30 flex items-center justify-center gap-1"
                              >
                                <Unlock className="w-4 h-4" />
                                تفعيل
                              </button>
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'grant-temp')}
                                className="flex-1 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-all border border-yellow-500/30 flex items-center justify-center gap-1"
                              >
                                <Clock className="w-4 h-4" />
                                مؤقت
                              </button>
                            </div>
                          )}

                          {perm.status === 'active' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'suspend')}
                                className="flex-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm transition-all border border-orange-500/30 flex items-center justify-center gap-1"
                              >
                                <Pause className="w-4 h-4" />
                                إيقاف
                              </button>
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'revoke')}
                                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all border border-red-500/30 flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                إلغاء
                              </button>
                            </div>
                          )}

                          {perm.status === 'suspended' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'reactivate')}
                                className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all border border-green-500/30 flex items-center justify-center gap-1"
                              >
                                <Play className="w-4 h-4" />
                                تفعيل
                              </button>
                              <button
                                onClick={() => handlePermissionAction(perm.permission_code, 'revoke')}
                                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all border border-red-500/30 flex items-center justify-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                إلغاء
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hover Glow Effect */}
                    {hoveredPermission === perm.permission_code && (
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.bg} blur-xl opacity-30 -z-10`}></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Analytics View */}
          {viewMode === 'analytics' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="text-4xl font-bold text-white">{stats?.successful_actions || 0}</span>
                  </div>
                  <p className="text-green-400 font-medium">عمليات ناجحة</p>
                  <p className="text-gray-400 text-sm mt-1">آخر 7 أيام</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl p-6 border border-red-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingDown className="w-8 h-8 text-red-400" />
                    <span className="text-4xl font-bold text-white">{stats?.denied_actions || 0}</span>
                  </div>
                  <p className="text-red-400 font-medium">محاولات مرفوضة</p>
                  <p className="text-gray-400 text-sm mt-1">آخر 7 أيام</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <span className="text-4xl font-bold text-white">{stats?.total_actions || 0}</span>
                  </div>
                  <p className="text-blue-400 font-medium">إجمالي النشاطات</p>
                  <p className="text-gray-400 text-sm mt-1">آخر 7 أيام</p>
                </div>
              </div>

              {/* Most Used Permission */}
              {stats?.most_used_permission && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-white font-bold text-lg">الصلاحية الأكثر استخداماً</h3>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-yellow-400 font-bold text-xl">{stats.most_used_permission}</p>
                  </div>
                </div>
              )}

              {/* Violation Alerts */}
              {violationAlerts.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                    <h3 className="text-white font-bold text-lg">تنبيهات المخالفات ({violationAlerts.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {violationAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{alert.details}</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {new Date(alert.created_at).toLocaleString('ar-SA')}
                            </p>
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
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <LineChart className="w-6 h-6 text-purple-400" />
                  <h3 className="text-white font-bold text-lg">الخط الزمني للنشاطات</h3>
                </div>
                <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-all border border-blue-500/30 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  تصدير
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {activityLogs.map((log, index) => (
                  <div key={log.id} className="relative">
                    {/* Timeline Line */}
                    {index < activityLogs.length - 1 && (
                      <div className="absolute right-5 top-12 w-0.5 h-full bg-gray-700"></div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div className={`relative z-10 p-2 rounded-full ${
                        log.was_successful
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-red-500/20 border-2 border-red-500'
                      }`}>
                        {log.was_successful ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium">{log.action_description}</p>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action_type === 'denied' ? 'bg-red-500/20 text-red-400' :
                            log.action_type === 'delete' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {log.action_type}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {log.permission_code} • {new Date(log.created_at).toLocaleString('ar-SA')}
                        </p>
                        {!log.was_successful && log.denial_reason && (
                          <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                            <p className="text-red-400 text-xs">{log.denial_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {activityLogs.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>لا توجد نشاطات مسجلة</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
