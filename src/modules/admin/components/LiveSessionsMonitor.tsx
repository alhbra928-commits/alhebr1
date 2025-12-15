import { useState, useEffect } from 'react';
import { Activity, X, Clock, MapPin, Monitor, AlertCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService, AdminSession } from '../services/adminSessionService';

export function LiveSessionsMonitor() {
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    // ❌ تم تعطيل التحديث التلقائي لتجنب الإشعارات المزعجة
    // const interval = setInterval(loadSessions, 10000);
    // return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await AdminSessionService.getAllActiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionToken: string) => {
    if (!confirm('هل أنت متأكد من إنهاء هذه الجلسة؟')) return;

    try {
      await AdminSessionService.terminateSession(sessionToken);
      await loadSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
      alert('حدث خطأ في إنهاء الجلسة');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return `منذ ${diffDays} يوم`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'idle':
        return '#F59E0B';
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'idle':
        return 'خامل';
      case 'expired':
        return 'منتهي';
      case 'terminated':
        return 'تم إنهاؤه';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse" style={{ color: brandColors.primary.gold }} />
          <p className="mt-4 font-bold" style={{ color: brandColors.text.secondary }}>
            جاري تحميل الجلسات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black" style={{ color: brandColors.text.primary }}>
            الجلسات الحية
          </h2>
          <p className="mt-1 text-sm" style={{ color: brandColors.text.secondary }}>
            متابعة نشاط المستخدمين في الوقت الحقيقي
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-2"
          style={{
            background: `linear-gradient(135deg, ${brandColors.primary.green} 0%, ${brandColors.primary.gold} 100%)`,
          }}
        >
          <Activity className="h-5 w-5 text-white" />
          <span className="font-black text-white">{sessions.length} جلسة نشطة</span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(61, 91, 75, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: `2px solid ${brandColors.primary.gold}20`,
          }}
        >
          <AlertCircle className="mx-auto h-16 w-16 opacity-50" style={{ color: brandColors.primary.gold }} />
          <h3 className="mt-4 text-xl font-bold" style={{ color: brandColors.text.primary }}>
            لا توجد جلسات نشطة حالياً
          </h3>
          <p className="mt-2 text-sm" style={{ color: brandColors.text.secondary }}>
            سيتم عرض الجلسات النشطة هنا عند تسجيل دخول المستخدمين
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                border: `2px solid ${getStatusColor(session.session_status)}40`,
                boxShadow: `0 4px 20px ${getStatusColor(session.session_status)}20`,
              }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-2"
                style={{ background: getStatusColor(session.session_status) }}
              />

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full font-black text-white"
                      style={{ background: brandGradients.gold }}
                    >
                      {session.admin_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: brandColors.text.primary }}>
                        {session.admin_name}
                      </h3>
                      <p className="text-sm" style={{ color: brandColors.text.secondary }}>
                        {session.admin_phone}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                      <span style={{ color: brandColors.text.secondary }}>
                        القسم: <span className="font-bold">{session.current_module || 'غير محدد'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                      <span style={{ color: brandColors.text.secondary }}>
                        آخر نشاط: <span className="font-bold">{getTimeAgo(session.last_activity_at)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" style={{ color: brandColors.primary.gold }} />
                      <span style={{ color: brandColors.text.secondary }}>
                        IP: <span className="font-bold">{session.ip_address || 'Unknown'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <div
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ background: getStatusColor(session.session_status) }}
                    >
                      {getStatusText(session.session_status)}
                    </div>
                    <div className="text-xs" style={{ color: brandColors.text.secondary }}>
                      بدأت: {getTimeAgo(session.started_at)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleTerminateSession(session.session_token)}
                  className="rounded-full p-2 transition-all hover:scale-110 hover:bg-red-100"
                  style={{ color: '#EF4444' }}
                  title="إنهاء الجلسة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
