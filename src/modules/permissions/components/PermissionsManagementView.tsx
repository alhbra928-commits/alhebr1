import { useState, useEffect } from 'react';
import {
  Shield, Users, Trees, Briefcase, Activity, Search, Plus, Edit2, Trash2,
  Check, X, Eye, Clock, AlertTriangle, Loader, UserCheck, UserX, Settings, Smartphone
} from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import {
  PermissionsService,
  AdminUser,
  AdminRole,
  InvestorInfo,
  FarmOwnerInfo,
  UserSession,
  MonitoringStats
} from '../services/permissionsService';
import { SessionManager } from '../../investor/services/sessionManager';

type TabType = 'investors' | 'owners' | 'admins' | 'monitoring';

export function PermissionsManagementView() {
  const [activeTab, setActiveTab] = useState<TabType>('monitoring');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [investors, setInvestors] = useState<InvestorInfo[]>([]);
  const [farmOwners, setFarmOwners] = useState<FarmOwnerInfo[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<MonitoringStats | null>(null);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);

      const [
        investorsData,
        ownersData,
        adminsData,
        rolesData,
        sessionsData,
        statsData
      ] = await Promise.all([
        PermissionsService.getAllInvestors(),
        PermissionsService.getAllFarmOwners(),
        PermissionsService.getAllAdminUsers(),
        PermissionsService.getAllRoles(),
        PermissionsService.getActiveSessions(),
        PermissionsService.getMonitoringStats()
      ]);

      setInvestors(investorsData);
      setFarmOwners(ownersData);
      setAdminUsers(adminsData);
      setRoles(rolesData);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminStatus = async (admin: AdminUser) => {
    try {
      await PermissionsService.updateAdminUser(admin.id, {
        is_active: !admin.is_active
      });
      await loadAllData();
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await PermissionsService.endSession(sessionId);
      await loadAllData();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader
          className="h-12 w-12 animate-spin"
          style={{ color: brandColors.primary.gold }}
        />
      </div>
    );
  }

  const tabs = [
    { id: 'monitoring', label: 'مركز الرقابة', icon: Activity },
    { id: 'investors', label: 'المستثمرون', icon: Users },
    { id: 'owners', label: 'أصحاب المزارع', icon: Trees },
    { id: 'admins', label: 'موظفو الإدارة', icon: Briefcase },
  ];

  const filteredInvestors = investors.filter(inv =>
    inv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.phone?.includes(searchQuery)
  );

  const filteredOwners = farmOwners.filter(owner =>
    owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.phone?.includes(searchQuery)
  );

  const filteredAdmins = adminUsers.filter(admin =>
    admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: brandGradients.gold }}
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black" style={{ color: brandColors.text.primary }}>
              إدارة الرقابة والصلاحيات
            </h1>
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              التحكم الكامل في الوصول والمراقبة والصلاحيات
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap"
              style={{
                background: isActive ? brandGradients.gold : 'white',
                color: isActive ? 'white' : brandColors.text.primary,
                boxShadow: isActive ? '0 4px 20px rgba(212,175,55,0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: brandColors.text.secondary }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-12 pl-4 py-3 rounded-xl border-2 outline-none transition-all"
            style={{
              background: 'white',
              borderColor: brandColors.primary.gold + '30',
            }}
          />
        </div>
      </div>

      {activeTab === 'monitoring' && stats && (
        <div>
          <h2 className="text-2xl font-black mb-6" style={{ color: brandColors.text.primary }}>
            مركز الرقابة الموحدة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(59,130,246,0.3)',
              }}
            >
              <Users className="w-8 h-8 mb-3 text-blue-500" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                مستثمرون متصلون
              </p>
              <p className="text-4xl font-black text-blue-500">
                {stats.activeInvestors}
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(16,185,129,0.3)',
              }}
            >
              <Trees className="w-8 h-8 mb-3 text-green-500" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                أصحاب مزارع نشطون
              </p>
              <p className="text-4xl font-black text-green-500">
                {stats.activeFarmOwners}
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(168,85,247,0.3)',
              }}
            >
              <Briefcase className="w-8 h-8 mb-3 text-purple-500" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                موظفون متصلون
              </p>
              <p className="text-4xl font-black text-purple-500">
                {stats.activeAdmins}
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(239,68,68,0.3)',
              }}
            >
              <AlertTriangle className="w-8 h-8 mb-3 text-red-500" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                محاولات فاشلة اليوم
              </p>
              <p className="text-4xl font-black text-red-500">
                {stats.failedLoginAttempts}
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: `linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,255,255,0.95) 100%)`,
                border: `2px solid ${brandColors.primary.gold}30`,
              }}
            >
              <Activity className="w-8 h-8 mb-3" style={{ color: brandColors.primary.gold }} />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                جلسات نشطة
              </p>
              <p className="text-4xl font-black" style={{ color: brandColors.primary.gold }}>
                {stats.activeSessions}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(139,92,246,0.3)',
              }}
            >
              <Smartphone className="w-8 h-8 mb-3 text-purple-600" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                نظام الجلسات
              </p>
              <p className="text-2xl font-black text-purple-600 mb-2">
                {SessionManager.isDemoMode() ? 'وضع تجريبي' : 'وضع إنتاج'}
              </p>
              <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                {SessionManager.isDemoMode()
                  ? 'الجلسات مستمرة بعد إغلاق المتصفح'
                  : `صلاحية الجلسة: ${SessionManager.getSessionDuration()} ساعة`
                }
              </p>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(255,255,255,0.95) 100%)',
                border: '2px solid rgba(34,197,94,0.3)',
              }}
            >
              <Clock className="w-8 h-8 mb-3 text-green-600" />
              <p className="text-sm mb-2" style={{ color: brandColors.text.secondary }}>
                متوسط مدة الجلسة
              </p>
              <p className="text-2xl font-black text-green-600 mb-2">
                {SessionManager.isDemoMode() ? '∞' : '12 ساعة'}
              </p>
              <p className="text-xs" style={{ color: brandColors.text.secondary }}>
                تحديث تلقائي عند كل نشاط
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background: 'white',
              border: `2px solid ${brandColors.primary.gold}30`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black" style={{ color: brandColors.text.primary }}>
                الجلسات النشطة
              </h3>
              {SessionManager.isDemoMode() && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: '#a855f720',
                    color: '#a855f7'
                  }}
                >
                  وضع تجريبي نشط
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <p className="text-center py-8" style={{ color: brandColors.text.secondary }}>
                لا توجد جلسات نشطة
              </p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl flex items-center justify-between"
                    style={{ background: brandColors.background.beige }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            background: session.user_type === 'investor' ? '#3b82f620' :
                                       session.user_type === 'farm_owner' ? '#10b98120' :
                                       '#a855f720',
                            color: session.user_type === 'investor' ? '#3b82f6' :
                                   session.user_type === 'farm_owner' ? '#10b981' :
                                   '#a855f7'
                          }}
                        >
                          {session.user_type === 'investor' ? 'مستثمر' :
                           session.user_type === 'farm_owner' ? 'مالك مزرعة' :
                           'موظف إداري'}
                        </span>
                        <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                          {session.ip_address}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                        آخر نشاط: {new Date(session.last_activity).toLocaleString('ar-SA')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEndSession(session.id)}
                      className="px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                      style={{
                        background: brandColors.error + '20',
                        color: brandColors.error,
                      }}
                    >
                      إنهاء الجلسة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'investors' && (
        <div>
          <h2 className="text-2xl font-black mb-6" style={{ color: brandColors.text.primary }}>
            إدارة المستثمرين ({filteredInvestors.length})
          </h2>

          {filteredInvestors.length === 0 ? (
            <p className="text-center py-8" style={{ color: brandColors.text.secondary }}>
              لا يوجد مستثمرون
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInvestors.map((investor) => (
                <div
                  key={investor.phone}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'white',
                    border: `2px solid ${brandColors.primary.gold}30`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black mb-2" style={{ color: brandColors.text.primary }}>
                        {investor.name}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                        {investor.phone}
                      </p>
                    </div>
                    {investor.is_active ? (
                      <UserCheck className="w-6 h-6 text-green-500" />
                    ) : (
                      <UserX className="w-6 h-6 text-red-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                        الحجوزات
                      </span>
                      <span className="font-bold text-blue-500">
                        {investor.total_reservations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                        إجمالي الاستثمار
                      </span>
                      <span className="font-bold" style={{ color: brandColors.primary.gold }}>
                        {investor.total_amount.toLocaleString('ar-SA')} ر.س
                      </span>
                    </div>
                    {investor.last_activity && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          آخر نشاط
                        </span>
                        <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                          {new Date(investor.last_activity).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'owners' && (
        <div>
          <h2 className="text-2xl font-black mb-6" style={{ color: brandColors.text.primary }}>
            إدارة أصحاب المزارع ({filteredOwners.length})
          </h2>

          {filteredOwners.length === 0 ? (
            <p className="text-center py-8" style={{ color: brandColors.text.secondary }}>
              لا يوجد أصحاب مزارع
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOwners.map((owner) => (
                <div
                  key={owner.id}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'white',
                    border: `2px solid ${brandColors.accent.olive}30`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black mb-2" style={{ color: brandColors.text.primary }}>
                        {owner.name}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                        {owner.phone}
                      </p>
                    </div>
                    <Trees className="w-6 h-6" style={{ color: brandColors.accent.olive }} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                        إجمالي المزارع
                      </span>
                      <span className="font-bold text-blue-500">
                        {owner.total_farms}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                        المزارع النشطة
                      </span>
                      <span className="font-bold text-green-500">
                        {owner.active_farms}
                      </span>
                    </div>
                    {owner.last_update && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                          آخر تحديث
                        </span>
                        <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                          {new Date(owner.last_update).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admins' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black" style={{ color: brandColors.text.primary }}>
              موظفو الإدارة ({filteredAdmins.length})
            </h2>

            <button
              onClick={() => setShowAddAdminModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                background: brandGradients.gold,
                color: 'white',
              }}
            >
              <Plus className="w-5 h-5" />
              <span>إضافة موظف</span>
            </button>
          </div>

          {filteredAdmins.length === 0 ? (
            <p className="text-center py-8" style={{ color: brandColors.text.secondary }}>
              لا يوجد موظفون
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'white',
                    border: `2px solid ${admin.is_active ? brandColors.primary.gold : '#ccc'}30`,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black mb-2" style={{ color: brandColors.text.primary }}>
                        {admin.full_name}
                      </h3>
                      <p className="text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                        {admin.email}
                      </p>
                      {admin.role && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2"
                          style={{
                            background: brandColors.primary.gold + '20',
                            color: brandColors.primary.gold
                          }}
                        >
                          {admin.role.role_name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleAdminStatus(admin)}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: admin.is_active ? '#10b98120' : '#ef444420',
                        color: admin.is_active ? '#10b981' : '#ef4444',
                      }}
                    >
                      {admin.is_active ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" style={{ color: brandColors.text.secondary }} />
                      <span style={{ color: brandColors.text.secondary }}>
                        {admin.last_login
                          ? new Date(admin.last_login).toLocaleDateString('ar-SA')
                          : 'لم يسجل دخول بعد'}
                      </span>
                    </div>

                    {admin.two_factor_enabled && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Shield className="w-4 h-4" />
                        <span>التحقق بخطوتين مفعّل</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
