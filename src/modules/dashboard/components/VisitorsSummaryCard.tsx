import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DailyStats {
  total_visits: number;
  unique_visitors: number;
  tiktok_percentage: number;
  instagram_percentage: number;
  twitter_percentage: number;
  google_percentage: number;
  direct_percentage: number;
}

export const VisitorsSummaryCard: React.FC = () => {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [realtimeVisitors, setRealtimeVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // تحديث تلقائي كل دقيقة
    const interval = setInterval(loadStats, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      // تحميل إحصائيات اليوم
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_traffic_summary')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (dailyError) throw dailyError;

      if (dailyData) {
        setStats(dailyData);
      } else {
        // تجميع البيانات إذا لم تكن موجودة
        await supabase.rpc('aggregate_daily_traffic_data');
        // إعادة المحاولة
        const { data: retryData } = await supabase
          .from('daily_traffic_summary')
          .select('*')
          .eq('date', new Date().toISOString().split('T')[0])
          .maybeSingle();

        if (retryData) setStats(retryData);
      }

      // تحميل الزوار الحاليين
      const { data: realtimeData, error: realtimeError } = await supabase
        .rpc('get_realtime_visitors_count');

      if (!realtimeError && realtimeData !== null) {
        setRealtimeVisitors(realtimeData);
      }

    } catch (error) {
      console.error('Error loading visitor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            ملخص الزوار اليوم
          </h3>
          <p className="text-white/80 text-sm mt-1">
            تحديث تلقائي كل دقيقة
          </p>
        </div>

        <button
          onClick={loadStats}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="تحديث"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Realtime Visitors Banner */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6" />
            <div>
              <p className="text-sm text-white/80">متصل الآن</p>
              <p className="text-2xl font-bold">{realtimeVisitors}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm">نشط</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/80 text-sm mb-1">إجمالي الزيارات</p>
          <p className="text-3xl font-bold">{stats.total_visits.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-green-300">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">اليوم</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/80 text-sm mb-1">زوار فريدون</p>
          <p className="text-3xl font-bold">{stats.unique_visitors.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-green-300">
            <Users className="w-4 h-4" />
            <span className="text-xs">اليوم</span>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <p className="text-white/90 font-medium mb-3">مصادر الزيارات:</p>

        <div className="space-y-2">
          {[
            { name: 'TikTok', percentage: stats.tiktok_percentage, icon: '🎵' },
            { name: 'Instagram', percentage: stats.instagram_percentage, icon: '📷' },
            { name: 'Twitter', percentage: stats.twitter_percentage, icon: '🐦' },
            { name: 'Google', percentage: stats.google_percentage, icon: '🔍' },
            { name: 'مباشر', percentage: stats.direct_percentage, icon: '🔗' }
          ]
            .filter(source => source.percentage > 0)
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5)
            .map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{source.icon}</span>
                  <span className="text-sm">{source.name}</span>
                </div>
                <span className="text-lg font-bold">{source.percentage.toFixed(1)}%</span>
              </div>
            ))}
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <a
          href="/admin#marketing"
          className="text-sm text-white/90 hover:text-white underline flex items-center gap-2 justify-center"
        >
          عرض التفاصيل الكاملة
          <TrendingUp className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
