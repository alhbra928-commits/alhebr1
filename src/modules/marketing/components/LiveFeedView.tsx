import React, { useEffect, useState, useRef } from 'react';
import { Activity, MapPin, Smartphone, Monitor, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LiveActivity {
  id: string;
  timestamp: Date;
  type: 'session' | 'event';
  action: string;
  source: string;
  device: string;
  os: string;
  details?: any;
  isTest?: boolean;
}

export function LiveFeedView() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [stats, setStats] = useState({
    activeSessions: 0,
    todayVisitors: 0,
    liveEvents: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    isMountedRef.current = true;

    loadRecentActivities();
    loadStats();

    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        loadRecentActivities(true);
        loadStats();
      }
    }, 5000);

    setupRealtimeSubscription();

    return () => {
      isMountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const loadRecentActivities = async (silent = false) => {
    if (!isMountedRef.current) return;

    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const { data: recentSessions, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('created_at', fiveMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (sessionsError) throw sessionsError;

      const { data: recentEvents, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', fiveMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (eventsError) throw eventsError;

      if (!isMountedRef.current) return;

      const combined: LiveActivity[] = [];

      recentSessions?.forEach(session => {
        const source = getSource(session);
        combined.push({
          id: `session-${session.id}`,
          timestamp: new Date(session.created_at),
          type: 'session',
          action: 'دخول جديد',
          source,
          device: session.device_type || 'unknown',
          os: session.os || 'unknown',
          details: {
            landing: session.landing_path,
            referrer: session.referrer,
          },
          isTest: session.metadata?.is_test,
        });
      });

      recentEvents?.forEach(event => {
        combined.push({
          id: `event-${event.id}`,
          timestamp: new Date(event.created_at),
          type: 'event',
          action: getEventLabel(event.event_name),
          source: '',
          device: '',
          os: '',
          details: event.event_value,
        });
      });

      combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (isMountedRef.current) {
        setActivities(combined.slice(0, 30));
        setError(null);
      }

      if (silent) {
        console.log('🔄 تحديث البث الحي:', combined.length, 'نشاط');
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.error('Failed to load activities:', error);
      setError('فشل تحميل البيانات');
    }
  };

  const loadStats = async () => {
    if (!isMountedRef.current) return;

    try {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const { data: todaySessions, error: todayError } = await supabase
        .from('analytics_sessions')
        .select('session_id', { count: 'exact' })
        .gte('created_at', todayStart.toISOString());

      if (todayError) throw todayError;

      const { data: activeSessions, error: activeError } = await supabase
        .from('analytics_sessions')
        .select('session_id, is_active, updated_at', { count: 'exact' })
        .or(`is_active.eq.true,updated_at.gte.${fiveMinutesAgo.toISOString()}`);

      if (activeError) throw activeError;

      const { data: liveEvents, error: eventsError } = await supabase
        .from('analytics_events')
        .select('id', { count: 'exact' })
        .gte('created_at', fiveMinutesAgo.toISOString());

      if (eventsError) throw eventsError;

      if (!isMountedRef.current) return;

      setStats({
        activeSessions: activeSessions?.length || 0,
        todayVisitors: todaySessions?.length || 0,
        liveEvents: liveEvents?.length || 0,
      });
    } catch (error: any) {
      if (!isMountedRef.current) return;
      console.error('Failed to load stats:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    try {
      const channel = supabase
        .channel('live-analytics-feed')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'analytics_sessions' },
          (payload) => {
            if (isMountedRef.current) {
              console.log('🔔 جلسة جديدة:', payload.new);
              loadRecentActivities(true);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'analytics_events' },
          (payload) => {
            if (isMountedRef.current) {
              console.log('🔔 حدث جديد:', payload.new);
              loadRecentActivities(true);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ اشتراك البث الحي نشط');
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('❌ خطأ في قناة البث الحي');
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Failed to setup realtime:', error);
    }
  };

  const getSource = (session: any): string => {
    if (session.utm_source) return session.utm_source;
    if (session.referrer) {
      const ref = session.referrer.toLowerCase();
      if (ref.includes('tiktok')) return 'TikTok';
      if (ref.includes('instagram')) return 'Instagram';
      if (ref.includes('facebook')) return 'Facebook';
      if (ref.includes('whatsapp')) return 'WhatsApp';
      if (ref.includes('google')) return 'Google';
      return 'Referral';
    }
    return 'Direct';
  };

  const getEventLabel = (eventName: string): string => {
    if (!eventName) return 'نشاط غير معروف';
    const labels: Record<string, string> = {
      home_view: 'مشاهدة الرئيسية',
      farm_view: 'مشاهدة مزرعة',
      qty_change: 'تغيير الكمية',
      booking_start: 'بدء الحجز',
      booking_submit: 'إرسال الحجز',
      payment_upload: 'رفع الإيصال',
      whatsapp_click: 'فتح واتساب',
    };
    return labels[eventName] || eventName;
  };

  const getSourceIcon = (source: string) => {
    if (!source) return '🔗';
    if (source === 'TikTok') return '🎵';
    if (source === 'Instagram') return '📷';
    if (source === 'Facebook') return '📘';
    if (source === 'WhatsApp') return '💬';
    if (source === 'Google') return '🔍';
    if (source === 'Direct') return '🌐';
    return '🔗';
  };

  const getDeviceIcon = (device: string) => {
    if (!device) return <Activity className="w-4 h-4" />;
    if (device === 'mobile') return <Smartphone className="w-4 h-4" />;
    if (device === 'desktop') return <Monitor className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (!action) return 'text-gray-600 bg-gray-50';
    if (action.includes('دخول')) return 'text-blue-600 bg-blue-50';
    if (action.includes('مزرعة')) return 'text-purple-600 bg-purple-50';
    if (action.includes('حجز')) return 'text-green-600 bg-green-50';
    if (action.includes('إيصال')) return 'text-emerald-600 bg-emerald-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTimeDiff = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (seconds < 10) return 'الآن';
    if (seconds < 60) return `منذ ${seconds}ث`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes}د`;
    const hours = Math.floor(minutes / 60);
    return `منذ ${hours}س`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                البث الحي للزيارات
              </h1>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full border-2 border-red-200">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-bold text-sm">LIVE</span>
              </div>
            </div>
            <p className="text-gray-600 mt-2">مراقبة لحظية لكل دخول وتفاعل</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">الجلسات النشطة</div>
                <div className="text-4xl font-bold">{stats.activeSessions}</div>
              </div>
            </div>
            <div className="text-sm opacity-80">الآن على المنصة</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">زوار اليوم</div>
                <div className="text-4xl font-bold">{stats.todayVisitors}</div>
              </div>
            </div>
            <div className="text-sm opacity-80">إجمالي الجلسات</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">الأحداث الحية</div>
                <div className="text-4xl font-bold">{stats.liveEvents}</div>
              </div>
            </div>
            <div className="text-sm opacity-80">آخر 5 دقائق</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">النشاط اللحظي</h2>
            <p className="text-gray-500 text-sm mt-1">آخر 5 دقائق • يتحديث كل 5 ثواني</p>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">لا يوجد نشاط حالياً</p>
                <p className="text-sm mt-2">انتظر الزيارات الجديدة...</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getActionColor(activity.action)} flex items-center justify-center font-bold text-xl`}>
                      {activity.type === 'session' ? getSourceIcon(activity.source) : '⚡'}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{activity.action}</span>
                          {activity.isTest && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                              TEST
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{getTimeDiff(activity.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {activity.source && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{activity.source}</span>
                          </div>
                        )}
                        {activity.device && (
                          <div className="flex items-center gap-1">
                            {getDeviceIcon(activity.device)}
                            <span>{activity.os}</span>
                          </div>
                        )}
                      </div>

                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                          {activity.details.farm_name && (
                            <div>🌾 {activity.details.farm_name}</div>
                          )}
                          {activity.details.landing && (
                            <div>📍 {activity.details.landing}</div>
                          )}
                          {activity.details.trees_count && (
                            <div>🌳 {activity.details.trees_count} شجرة</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
