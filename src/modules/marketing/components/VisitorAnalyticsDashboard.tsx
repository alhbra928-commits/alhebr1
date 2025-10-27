import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, Clock, Monitor, Smartphone, Tablet,
  Globe, RefreshCw, Calendar, Eye, MousePointer, BarChart3
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DailyTrafficSummary {
  date: string;
  total_visits: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  visits_from_tiktok: number;
  visits_from_instagram: number;
  visits_from_twitter: number;
  visits_from_facebook: number;
  visits_from_youtube: number;
  visits_from_google: number;
  visits_from_direct: number;
  visits_from_other: number;
  tiktok_percentage: number;
  instagram_percentage: number;
  twitter_percentage: number;
  facebook_percentage: number;
  youtube_percentage: number;
  google_percentage: number;
  direct_percentage: number;
  other_percentage: number;
  mobile_visits: number;
  tablet_visits: number;
  desktop_visits: number;
  avg_session_duration_seconds: number;
  avg_pages_per_session: number;
}

interface TrafficSource {
  source_name: string;
  visit_count: number;
  percentage: number;
}

interface TopPage {
  page_url: string;
  page_title: string;
  page_section: string;
  visit_count: number;
  avg_time_on_page: number;
}

export const VisitorAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState<DailyTrafficSummary | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [realtimeVisitors, setRealtimeVisitors] = useState(0);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAnalytics();

    // Auto-refresh كل دقيقة إذا كان مفعّل
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(loadAnalytics, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dateRange, autoRefresh]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // تحميل إحصائيات اليوم
      await loadTodayStats();

      // تحميل مصادر الزيارات
      await loadTrafficSources();

      // تحميل الصفحات الأكثر زيارة
      await loadTopPages();

      // تحميل الزوار الحاليين
      await loadRealtimeVisitors();

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayStats = async () => {
    const { data, error } = await supabase
      .from('daily_traffic_summary')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (error) throw error;

    if (data) {
      setTodayStats(data);
    } else {
      // تجميع بيانات اليوم إذا لم تكن موجودة
      await supabase.rpc('aggregate_daily_traffic_data');
      await loadTodayStats(); // إعادة المحاولة
    }
  };

  const loadTrafficSources = async () => {
    const { data, error } = await supabase.rpc('get_traffic_by_source', {
      p_start_date: getStartDate(),
      p_end_date: new Date().toISOString().split('T')[0]
    });

    if (error) throw error;
    setTrafficSources(data || []);
  };

  const loadTopPages = async () => {
    const { data, error } = await supabase.rpc('get_top_pages', {
      p_limit: 10,
      p_start_date: getStartDate(),
      p_end_date: new Date().toISOString().split('T')[0]
    });

    if (error) throw error;
    setTopPages(data || []);
  };

  const loadRealtimeVisitors = async () => {
    const { data, error } = await supabase.rpc('get_realtime_visitors_count');

    if (error) throw error;
    setRealtimeVisitors(data || 0);
  };

  const getStartDate = (): string => {
    const today = new Date();

    if (dateRange === 'today') {
      return today.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo.toISOString().split('T')[0];
    } else {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return monthAgo.toISOString().split('T')[0];
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}د ${secs}ث`;
  };

  const getSocialIcon = (source: string): string => {
    const icons: Record<string, string> = {
      tiktok: '🎵',
      instagram: '📷',
      twitter: '🐦',
      x: '🐦',
      facebook: '📘',
      youtube: '▶️',
      google: '🔍',
      search: '🔍',
      direct: '🔗',
      referral: '🔗',
      email: '📧',
      social: '👥',
      paid: '💰'
    };
    return icons[source.toLowerCase()] || '🌐';
  };

  if (loading && !todayStats) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#8B7355] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تحليل الزوار</h1>
          <p className="text-gray-600 mt-1">تتبع شامل لزوار المنصة ومصادر الزيارات</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'تحديث تلقائي' : 'تحديث يدوي'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6D5A43] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث الآن
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {[
          { key: 'today' as const, label: 'اليوم' },
          { key: 'week' as const, label: 'آخر 7 أيام' },
          { key: 'month' as const, label: 'آخر 30 يوم' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setDateRange(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRange === key
                ? 'bg-[#8B7355] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Realtime Visitors Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-6 h-6" />
              <h3 className="text-lg font-semibold">الزوار الحاليون</h3>
            </div>
            <p className="text-white/90 text-sm">متصل الآن على المنصة</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{realtimeVisitors}</div>
            <div className="flex items-center gap-2 mt-2 justify-end">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm">نشط</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Visits */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MousePointer className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">إجمالي الزيارات</p>
            <p className="text-3xl font-bold text-gray-900">{todayStats.total_visits.toLocaleString()}</p>
          </div>

          {/* Unique Visitors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">زوار فريدون</p>
            <p className="text-3xl font-bold text-gray-900">{todayStats.unique_visitors.toLocaleString()}</p>
          </div>

          {/* Avg Session Duration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">متوسط مدة الزيارة</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatDuration(todayStats.avg_session_duration_seconds)}
            </p>
          </div>

          {/* Avg Pages Per Session */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">متوسط الصفحات/زيارة</p>
            <p className="text-3xl font-bold text-gray-900">
              {todayStats.avg_pages_per_session.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Traffic Sources & Devices Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Pie Chart */}
        {todayStats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">مصادر الزيارات</h3>

            <div className="space-y-4">
              {[
                { name: 'TikTok', count: todayStats.visits_from_tiktok, percentage: todayStats.tiktok_percentage, color: 'bg-black', icon: '🎵' },
                { name: 'Instagram', count: todayStats.visits_from_instagram, percentage: todayStats.instagram_percentage, color: 'bg-pink-500', icon: '📷' },
                { name: 'Twitter', count: todayStats.visits_from_twitter, percentage: todayStats.twitter_percentage, color: 'bg-blue-400', icon: '🐦' },
                { name: 'Facebook', count: todayStats.visits_from_facebook, percentage: todayStats.facebook_percentage, color: 'bg-blue-600', icon: '📘' },
                { name: 'YouTube', count: todayStats.visits_from_youtube, percentage: todayStats.youtube_percentage, color: 'bg-red-600', icon: '▶️' },
                { name: 'Google', count: todayStats.visits_from_google, percentage: todayStats.google_percentage, color: 'bg-green-600', icon: '🔍' },
                { name: 'Direct', count: todayStats.visits_from_direct, percentage: todayStats.direct_percentage, color: 'bg-gray-600', icon: '🔗' },
                { name: 'Other', count: todayStats.visits_from_other, percentage: todayStats.other_percentage, color: 'bg-gray-400', icon: '🌐' }
              ]
                .filter(source => source.count > 0)
                .map((source) => (
                  <div key={source.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{source.icon}</span>
                        <span className="font-medium text-gray-900">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{source.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-600 mr-2">({source.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${source.color} h-2 rounded-full transition-all`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Device Types */}
        {todayStats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">الأجهزة المستخدمة</h3>

            <div className="space-y-6">
              {[
                { name: 'الجوال', count: todayStats.mobile_visits, icon: Smartphone, color: 'bg-blue-500' },
                { name: 'الحاسوب', count: todayStats.desktop_visits, icon: Monitor, color: 'bg-purple-500' },
                { name: 'التابلت', count: todayStats.tablet_visits, icon: Tablet, color: 'bg-green-500' }
              ].map((device) => {
                const DeviceIcon = device.icon;
                const total = todayStats.mobile_visits + todayStats.desktop_visits + todayStats.tablet_visits;
                const percentage = total > 0 ? (device.count / total * 100) : 0;

                return (
                  <div key={device.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${device.color} bg-opacity-10 rounded-lg`}>
                          <DeviceIcon className={`w-5 h-5 ${device.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="font-medium text-gray-900">{device.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{device.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-600 mr-2">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${device.color} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* New vs Returning Visitors */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">نوع الزوار</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 mb-1">زوار جدد</p>
                  <p className="text-2xl font-bold text-green-900">{todayStats.new_visitors}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">زوار عائدون</p>
                  <p className="text-2xl font-bold text-blue-900">{todayStats.returning_visitors}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Pages */}
      {topPages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">الصفحات الأكثر زيارة</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">#</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الصفحة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">القسم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الزيارات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">متوسط الوقت</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPages.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{page.page_title || 'بدون عنوان'}</div>
                      <div className="text-xs text-gray-500">{page.page_url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {page.page_section}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {page.visit_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDuration(page.avg_time_on_page)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
