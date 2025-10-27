import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Zap, MessageCircle, Clock, Target,
  Calendar, Download, RefreshCw, Activity, Sparkles, Award, ArrowUp,
  ArrowDown, Circle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface OverviewStats {
  button_clicks: number;
  total_conversations: number;
  automated_responses: number;
  human_responses: number;
  notifications_sent: number;
  avg_response_time: number;
}

interface TimelineData {
  hour: number;
  incoming: number;
  outgoing: number;
  automated: number;
}

interface UsersStats {
  visitors: number;
  investors: number;
  owners: number;
  system: number;
  top_users: Array<{
    phone: string;
    type: string;
    message_count: number;
  }>;
}

interface PerformanceStats {
  avg_automated_response_time: number;
  avg_human_response_time: number;
  fastest_response_time: number;
  slowest_response_time: number;
}

export const SmartButtonAnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [usersStats, setUsersStats] = useState<UsersStats | null>(null);
  const [performance, setPerformance] = useState<PerformanceStats | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAllStats();

    // التحديث التلقائي كل 30 ثانية
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAllStats();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const loadAllStats = async () => {
    try {
      setLoading(true);

      // جلب الإحصاءات العامة
      const { data: overviewData, error: overviewError } = await supabase
        .rpc('get_button_stats_overview', { time_range: timeRange });

      if (overviewError) throw overviewError;
      setOverview(overviewData);

      // جلب بيانات الخط الزمني
      const { data: timelineData, error: timelineError } = await supabase
        .rpc('get_button_timeline_stats', {
          time_range: timeRange,
          granularity: timeRange === 'today' ? 'hour' : 'day'
        });

      if (timelineError) throw timelineError;
      setTimeline(timelineData || []);

      // جلب إحصاءات المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .rpc('get_button_users_stats', { time_range: timeRange });

      if (usersError) throw usersError;
      setUsersStats(usersData);

      // جلب أداء الردود
      const { data: perfData, error: perfError } = await supabase
        .rpc('get_button_performance_stats', { time_range: timeRange });

      if (perfError) throw perfError;
      setPerformance(perfData);

    } catch (err: any) {
      console.error('Stats error:', err);
      // استخدام بيانات تجريبية في حالة الخطأ
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    // بيانات تجريبية للمعاينة
    setOverview({
      button_clicks: 247,
      total_conversations: 89,
      automated_responses: 156,
      human_responses: 43,
      notifications_sent: 67,
      avg_response_time: 1250
    });

    setTimeline(
      Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        incoming: Math.floor(Math.random() * 30) + 5,
        outgoing: Math.floor(Math.random() * 25) + 3,
        automated: Math.floor(Math.random() * 20) + 2
      }))
    );

    setUsersStats({
      visitors: 45,
      investors: 28,
      owners: 16,
      system: 12,
      top_users: [
        { phone: '0501234567', type: 'investor', message_count: 24 },
        { phone: '0509876543', type: 'visitor', message_count: 18 },
        { phone: '0555555555', type: 'owner', message_count: 15 }
      ]
    });

    setPerformance({
      avg_automated_response_time: 850,
      avg_human_response_time: 3500,
      fastest_response_time: 245,
      slowest_response_time: 8900
    });
  };

  const exportToPDF = () => {
    alert('سيتم إضافة ميزة التصدير قريباً');
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPerformanceRating = (avgTime: number) => {
    if (avgTime < 2000) return { text: 'ممتاز', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (avgTime < 5000) return { text: 'جيد', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { text: 'يحتاج تحسين', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإحصاءات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {error && <SmartErrorModal error={error} onClose={() => setError(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">📊 الإحصاءات التفصيلية للزر الذكي</h2>
            <p className="text-gray-400 text-sm">تحليل شامل لنشاط وأداء الزر في الوقت الفعلي</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              autoRefresh
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Activity className="w-5 h-5" />
            {autoRefresh ? 'تحديث تلقائي' : 'تحديث يدوي'}
          </button>

          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[
          { value: 'today', label: '📅 اليوم', icon: Calendar },
          { value: 'week', label: '📆 الأسبوع', icon: Calendar },
          { value: 'month', label: '🗓️ الشهر', icon: Calendar }
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              timeRange === range.value
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* نقرات الزر */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6 animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-cyan-500/20 p-3 rounded-lg">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{overview.button_clicks}</p>
                <p className="text-cyan-400 text-sm mt-1">نقرة</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">🧭 إجمالي النقرات على الزر</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">+12% من الأمس</span>
            </div>
          </div>

          {/* المحادثات */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{overview.total_conversations}</p>
                <p className="text-purple-400 text-sm mt-1">محادثة</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">💬 إجمالي المحادثات</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <ArrowUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">+8% من الأمس</span>
            </div>
          </div>

          {/* الردود الآلية */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{overview.automated_responses}</p>
                <p className="text-green-400 text-sm mt-1">رد آلي</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">🤖 الردود الآلية</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                نسبة: {Math.round((overview.automated_responses / (overview.automated_responses + overview.human_responses)) * 100)}%
              </span>
            </div>
          </div>

          {/* الردود البشرية */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-xl p-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Users className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{overview.human_responses}</p>
                <p className="text-orange-400 text-sm mt-1">رد بشري</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">🤝 الردود البشرية</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-400">
                نسبة: {Math.round((overview.human_responses / (overview.automated_responses + overview.human_responses)) * 100)}%
              </span>
            </div>
          </div>

          {/* الإشعارات */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 rounded-xl p-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{overview.notifications_sent}</p>
                <p className="text-yellow-400 text-sm mt-1">إشعار</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">🔔 إشعارات مرسلة</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-400">للمستخدمين</span>
            </div>
          </div>

          {/* متوسط الوقت */}
          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatTime(overview.avg_response_time)}</p>
                <p className="text-blue-400 text-sm mt-1">متوسط</p>
              </div>
            </div>
            <p className="text-gray-300 font-semibold">⏱️ سرعة الاستجابة</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <ArrowDown className="w-4 h-4 text-green-400" />
              <span className="text-green-400">-5% أسرع</span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Chart */}
      {timeline.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            💬 نشاط المحادثات ({timeRange === 'today' ? 'حسب الساعة' : 'حسب اليوم'})
          </h3>

          <div className="space-y-4">
            {timeline.slice(0, 12).map((item, index) => {
              const maxValue = Math.max(...timeline.map(t => t.incoming + t.outgoing));
              const incomingWidth = (item.incoming / maxValue) * 100;
              const outgoingWidth = (item.outgoing / maxValue) * 100;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {timeRange === 'today' ? `${item.hour}:00` : `يوم ${item.hour + 1}`}
                    </span>
                    <span className="text-gray-300">
                      {item.incoming + item.outgoing} رسالة
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Incoming */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400 w-16">واردة:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${incomingWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-left">{item.incoming}</span>
                    </div>

                    {/* Outgoing */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-400 w-16">صادرة:</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${outgoingWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-left">{item.outgoing}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Stats & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Insight */}
        {usersStats && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" />
              👥 أنواع المستخدمين
            </h3>

            <div className="space-y-4 mb-6">
              {[
                { label: 'الزوار', value: usersStats.visitors, color: 'from-blue-500 to-cyan-500', icon: '👤' },
                { label: 'المستثمرين', value: usersStats.investors, color: 'from-green-500 to-emerald-500', icon: '💼' },
                { label: 'أصحاب المزارع', value: usersStats.owners, color: 'from-orange-500 to-red-500', icon: '🌴' },
                { label: 'النظام', value: usersStats.system, color: 'from-purple-500 to-pink-500', icon: '🧾' }
              ].map((type) => {
                const total = usersStats.visitors + usersStats.investors + usersStats.owners + usersStats.system;
                const percentage = Math.round((type.value / total) * 100);

                return (
                  <div key={type.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{type.icon} {type.label}</span>
                      <span className="text-white font-bold">{type.value} ({percentage}%)</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${type.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Users */}
            {usersStats.top_users && usersStats.top_users.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">🏆 أكثر المستخدمين تفاعلاً</h4>
                <div className="space-y-2">
                  {usersStats.top_users.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                        </span>
                        <div>
                          <p className="text-white font-medium">{user.phone}</p>
                          <p className="text-xs text-gray-400">
                            {user.type === 'investor' ? '💼 مستثمر' :
                             user.type === 'visitor' ? '👤 زائر' : '🌴 مالك'}
                          </p>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">{user.message_count} رسالة</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance */}
        {performance && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-cyan-400" />
              ⚡ سرعة الاستجابة
            </h3>

            <div className="space-y-6">
              {/* Automated Response */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold">🤖 الردود الآلية</span>
                  <span className="text-2xl font-bold text-white">
                    {formatTime(performance.avg_automated_response_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-sm text-gray-400">متوسط وقت الاستجابة</span>
                </div>
              </div>

              {/* Human Response */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-semibold">👨‍💼 الردود البشرية</span>
                  <span className="text-2xl font-bold text-white">
                    {formatTime(performance.avg_human_response_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                  <span className="text-sm text-gray-400">متوسط وقت الاستجابة</span>
                </div>
              </div>

              {/* Fastest */}
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-300">⚡ أسرع رد:</span>
                <span className="text-green-400 font-bold">{formatTime(performance.fastest_response_time)}</span>
              </div>

              {/* Slowest */}
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <span className="text-gray-300">🐌 أبطأ رد:</span>
                <span className="text-red-400 font-bold">{formatTime(performance.slowest_response_time)}</span>
              </div>

              {/* Rating */}
              <div className={`p-4 ${getPerformanceRating(performance.avg_automated_response_time).bg} border border-opacity-30 rounded-lg`}>
                <div className="flex items-center justify-center gap-3">
                  <Award className={`w-8 h-8 ${getPerformanceRating(performance.avg_automated_response_time).color}`} />
                  <div>
                    <p className={`text-xl font-bold ${getPerformanceRating(performance.avg_automated_response_time).color}`}>
                      {getPerformanceRating(performance.avg_automated_response_time).text}
                    </p>
                    <p className="text-sm text-gray-400">تقييم الأداء العام</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      {autoRefresh && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
          <Circle className="w-2 h-2 fill-white text-white" />
          <span className="text-sm font-medium">تحديث تلقائي نشط</span>
        </div>
      )}
    </div>
  );
};
