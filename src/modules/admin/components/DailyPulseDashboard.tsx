import { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, Users, Clock, CheckCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';

interface DailyStats {
  activeSessions: number;
  mostActiveModule: string;
  modificationsCount: number;
  criticalActions: number;
  totalLogins: number;
  totalActions: number;
}

export function DailyPulseDashboard() {
  const [stats, setStats] = useState<DailyStats>({
    activeSessions: 0,
    mostActiveModule: '',
    modificationsCount: 0,
    criticalActions: 0,
    totalLogins: 0,
    totalActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentCriticalActions, setRecentCriticalActions] = useState<any[]>([]);

  useEffect(() => {
    loadDailyStats();
  }, []);

  const loadDailyStats = async () => {
    try {
      const sessions = await AdminSessionService.getActiveSessions();
      const logs = await AdminSessionService.getAccessLog(undefined, 1000);

      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogs = logs.filter(log => new Date(log.created_at) > last24Hours);

      const criticalTypes = ['delete', 'freeze_user', 'terminate_session_from_control', 'delete_user'];
      const critical = recentLogs.filter(log => criticalTypes.includes(log.action_type));

      const moduleCount: Record<string, number> = {};
      sessions.forEach(s => {
        moduleCount[s.current_module] = (moduleCount[s.current_module] || 0) + 1;
      });

      const mostActive = Object.entries(moduleCount).sort((a, b) => b[1] - a[1])[0];

      setStats({
        activeSessions: sessions.length,
        mostActiveModule: mostActive ? mostActive[0] : 'لا يوجد',
        modificationsCount: recentLogs.filter(l => l.action_type.includes('update') || l.action_type.includes('edit')).length,
        criticalActions: critical.length,
        totalLogins: recentLogs.filter(l => l.action_type === 'login').length,
        totalActions: recentLogs.length,
      });

      setRecentCriticalActions(critical.slice(0, 5));
    } catch (error) {
      console.error('Error loading daily stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleNameAr = (moduleName: string): string => {
    const modules: Record<string, string> = {
      dashboard: 'لوحة التحكم',
      farms: 'المزارع',
      investors: 'المستثمرون',
      reservations: 'الحجوزات',
      documentation: 'التوثيق',
      finance: 'المالية',
      wallets: 'المحافظ',
      owners: 'أصحاب المزارع',
      permissions: 'الصلاحيات',
      settings: 'الإعدادات',
    };
    return modules[moduleName] || moduleName;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: brandColors.primary.gold }}
          />
          <p className="text-lg font-bold text-white">جاري تحميل النبض الإداري...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl animate-pulse"
              style={{ background: brandGradients.gold }}
            >
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                النبض الإداري اليومي
              </h1>
              <p className="mt-1 text-sm text-white/70">
                موجز شامل لنشاط آخر 24 ساعة
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Users className="h-8 w-8 text-green-400" />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: 'rgba(16, 185, 129, 0.3)' }}
              >
                حالياً
              </div>
            </div>
            <p className="text-4xl font-black text-green-400">{stats.activeSessions}</p>
            <p className="mt-2 text-sm font-bold text-white/70">جلسة مفتوحة حالياً</p>
          </div>

          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(196, 148, 31, 0.2) 100%)',
              border: `2px solid ${brandColors.primary.gold}40`,
              boxShadow: `0 8px 32px ${brandColors.primary.gold}20`,
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <TrendingUp className="h-8 w-8" style={{ color: brandColors.primary.gold }} />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: brandGradients.gold }}
              >
                الأكثر نشاطاً
              </div>
            </div>
            <p className="text-2xl font-black text-white">{getModuleNameAr(stats.mostActiveModule)}</p>
            <p className="mt-2 text-sm font-bold text-white/70">القسم الأكثر استخداماً</p>
          </div>

          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-blue-400" />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: 'rgba(59, 130, 246, 0.3)' }}
              >
                24 ساعة
              </div>
            </div>
            <p className="text-4xl font-black text-blue-400">{stats.modificationsCount}</p>
            <p className="mt-2 text-sm font-bold text-white/70">تعديل خلال آخر 24 ساعة</p>
          </div>

          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: stats.criticalActions > 0
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.2) 100%)',
              border: stats.criticalActions > 0
                ? '2px solid rgba(239, 68, 68, 0.3)'
                : '2px solid rgba(107, 114, 128, 0.3)',
              boxShadow: stats.criticalActions > 0
                ? '0 8px 32px rgba(239, 68, 68, 0.2)'
                : '0 8px 32px rgba(107, 114, 128, 0.2)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <AlertTriangle className={`h-8 w-8 ${stats.criticalActions > 0 ? 'text-red-400' : 'text-gray-400'}`} />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{
                  background: stats.criticalActions > 0
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(107, 114, 128, 0.3)',
                }}
              >
                حرج
              </div>
            </div>
            <p className={`text-4xl font-black ${stats.criticalActions > 0 ? 'text-red-400' : 'text-gray-400'}`}>
              {stats.criticalActions}
            </p>
            <p className="mt-2 text-sm font-bold text-white/70">عملية حساسة</p>
          </div>

          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              border: '2px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Clock className="h-8 w-8 text-purple-400" />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: 'rgba(168, 85, 247, 0.3)' }}
              >
                دخول
              </div>
            </div>
            <p className="text-4xl font-black text-purple-400">{stats.totalLogins}</p>
            <p className="mt-2 text-sm font-bold text-white/70">عملية تسجيل دخول</p>
          </div>

          <div
            className="group rounded-2xl p-6 transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(219, 39, 119, 0.2) 100%)',
              border: '2px solid rgba(236, 72, 153, 0.3)',
              boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Activity className="h-8 w-8 text-pink-400" />
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ background: 'rgba(236, 72, 153, 0.3)' }}
              >
                إجمالي
              </div>
            </div>
            <p className="text-4xl font-black text-pink-400">{stats.totalActions}</p>
            <p className="mt-2 text-sm font-bold text-white/70">إجراء إداري</p>
          </div>
        </div>

        {recentCriticalActions.length > 0 && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-black text-white">⚠️ عمليات حساسة حديثة</h2>
            </div>

            <div className="space-y-3">
              {recentCriticalActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-lg bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-white">{action.admin_name}</p>
                      <p className="mt-1 text-sm font-bold text-white/90">{action.action_details}</p>
                    </div>
                    <p className="text-xs font-bold text-white/50">
                      {new Date(action.created_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
