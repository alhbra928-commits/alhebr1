import { useState, useEffect } from 'react';
import { Activity, Eye, StopCircle, Clock, MapPin, Monitor, User } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';

interface LiveSession {
  token: string;
  admin_phone: string;
  admin_name: string;
  admin_role: string;
  current_module: string;
  last_activity: string;
  device_info: string;
  ip_address: string;
  status: 'active' | 'idle';
  duration: number;
}

export function AdvancedLiveSessionsMonitor() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await AdminSessionService.getActiveSessions();
      setSessions(data.map(s => ({
        ...s,
        status: isSessionIdle(s.last_activity) ? 'idle' : 'active',
        duration: calculateDuration(s.created_at),
      })));
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSessionIdle = (lastActivity: string): boolean => {
    const diff = Date.now() - new Date(lastActivity).getTime();
    return diff > 20 * 60 * 1000;
  };

  const calculateDuration = (createdAt: string): number => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة و ${mins} دقيقة`;
  };

  const formatLastActivity = (dateString: string): string => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours} ساعة`;
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
      public: 'استكشاف المنصة',
    };
    return modules[moduleName] || moduleName;
  };

  const handleTerminateSession = async (session: LiveSession) => {
    if (!confirm(`هل تريد إنهاء جلسة "${session.admin_name}"؟\n\nسيتم فصل المستخدم فوراً من لوحة الإدارة.`)) return;

    try {
      await AdminSessionService.terminateSession(session.token);
      await AdminSessionService.addAccessLog(
        AdminSessionService.getCurrentSession().admin?.phone || '',
        AdminSessionService.getCurrentSession().admin?.name || '',
        'terminate_session_from_control',
        `إنهاء جلسة: ${session.admin_name} (${session.admin_phone}) - إغلاق يدوي من الرقابة`,
        'success'
      );

      setSessions(sessions.filter(s => s.token !== session.token));
      alert('تم إنهاء الجلسة بنجاح');
    } catch (error) {
      console.error('Error terminating session:', error);
      alert('حدث خطأ في إنهاء الجلسة');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: brandColors.primary.gold }}
          />
          <p className="text-lg font-bold text-white">جاري تحميل الجلسات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl animate-pulse"
              style={{ background: brandGradients.gold }}
            >
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">
                الجلسات الحية
              </h1>
              <p className="mt-1 text-sm text-white/70">
                مراقبة الجلسات النشطة في الوقت الفعلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="rounded-xl px-4 py-2"
              style={{ background: 'rgba(16, 185, 129, 0.2)' }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                <span className="text-sm font-bold text-green-400">
                  {sessions.filter(s => s.status === 'active').length} نشط
                </span>
              </div>
            </div>

            <div
              className="rounded-xl px-4 py-2"
              style={{ background: 'rgba(251, 191, 36, 0.2)' }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">
                  {sessions.filter(s => s.status === 'idle').length} خامل
                </span>
              </div>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            }}
          >
            <Activity className="mx-auto mb-4 h-16 w-16 text-white/30" />
            <p className="text-lg font-bold text-white/70">لا توجد جلسات نشطة حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.token}
                className="group rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                  border: session.status === 'active'
                    ? '2px solid rgba(16, 185, 129, 0.3)'
                    : '2px solid rgba(251, 191, 36, 0.3)',
                  boxShadow: session.status === 'active'
                    ? '0 8px 32px rgba(16, 185, 129, 0.2)'
                    : '0 8px 32px rgba(251, 191, 36, 0.2)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full font-black text-white"
                        style={{ background: brandGradients.gold }}
                      >
                        {session.admin_name.charAt(0)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-black text-white">{session.admin_name}</h3>
                          <span
                            className="rounded-full px-3 py-1 text-xs font-black text-white"
                            style={{
                              background: session.status === 'active'
                                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            }}
                          >
                            {session.status === 'active' ? 'نشط' : 'خامل'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/70">{session.admin_phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs font-bold">القسم الحالي</span>
                        </div>
                        <p className="mt-1 text-sm font-black text-white">
                          {getModuleNameAr(session.current_module)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs font-bold">مدة الجلسة</span>
                        </div>
                        <p className="mt-1 text-sm font-black text-white">
                          {formatDuration(session.duration)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs font-bold">آخر نشاط</span>
                        </div>
                        <p className="mt-1 text-sm font-black text-white">
                          {formatLastActivity(session.last_activity)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <Monitor className="h-4 w-4" />
                          <span className="text-xs font-bold">الجهاز</span>
                        </div>
                        <p className="mt-1 text-xs font-black text-white">
                          {session.device_info.includes('Mobile') ? '📱 موبايل' : '💻 حاسوب'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-all hover:scale-105"
                      style={{ background: 'rgba(59, 130, 246, 0.3)' }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">عرض</span>
                    </button>

                    <button
                      onClick={() => handleTerminateSession(session)}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-white transition-all hover:scale-105"
                      style={{ background: 'rgba(239, 68, 68, 0.3)' }}
                    >
                      <StopCircle className="h-4 w-4" />
                      <span className="text-sm">إنهاء</span>
                    </button>
                  </div>
                </div>

                {session.status === 'idle' && (
                  <div
                    className="mt-4 rounded-lg p-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                      border: '2px dashed rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    <p className="text-sm font-bold text-yellow-400">
                      ⚠️ تحذير: هذه الجلسة خاملة منذ أكثر من 20 دقيقة
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedSession(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl p-8"
            style={{ background: 'linear-gradient(135deg, #2E2A26 0%, #3D5B4B 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-2xl font-black text-white">تفاصيل الجلسة</h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white/70">المستخدم</p>
                <p className="mt-1 text-lg font-black text-white">{selectedSession.admin_name}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white/70">رقم الجوال</p>
                <p className="mt-1 text-lg font-black text-white">{selectedSession.admin_phone}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white/70">معلومات الجهاز</p>
                <p className="mt-1 text-sm font-bold text-white">{selectedSession.device_info}</p>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white/70">عنوان IP</p>
                <p className="mt-1 text-lg font-black text-white">{selectedSession.ip_address}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedSession(null)}
              className="mt-6 w-full rounded-xl py-3 font-black text-white transition-all hover:scale-105"
              style={{ background: brandGradients.gold }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
