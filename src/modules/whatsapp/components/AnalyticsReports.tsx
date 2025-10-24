import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Calendar, Download, Filter, PieChart
} from 'lucide-react';
import { whatsappService, DailyStats } from '../services/whatsappService';

export function AnalyticsReports() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [daily, overall] = await Promise.all([
        whatsappService.getDailyStats(period),
        whatsappService.getOverallStats()
      ]);
      setDailyStats(daily);
      setOverallStats(overall);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const csv = [
      ['التاريخ', 'مرسل', 'مستلم', 'مقروء', 'فاشل', 'معدل النجاح%'],
      ...dailyStats.map(stat => [
        stat.date,
        stat.total_sent,
        stat.total_delivered,
        stat.total_read,
        stat.total_failed,
        stat.total_sent > 0 ? ((stat.total_delivered / stat.total_sent) * 100).toFixed(1) : '0'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  const maxSent = Math.max(...dailyStats.map(s => s.total_sent), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">التقارير والإحصائيات</h2>
            <p className="text-gray-600">تحليل شامل لأداء نظام الواتساب</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 90 يوم</option>
          </select>

          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Download className="h-5 w-5" />
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="إجمالي المرسل"
          value={overallStats?.total_sent || 0}
          color="from-blue-500 to-cyan-600"
          icon={TrendingUp}
        />
        <StatCard
          label="إجمالي المستلم"
          value={overallStats?.total_delivered || 0}
          color="from-green-500 to-emerald-600"
          icon={TrendingUp}
        />
        <StatCard
          label="معدل التسليم"
          value={`${overallStats?.delivery_rate?.toFixed(1) || 0}%`}
          color="from-purple-500 to-pink-600"
          icon={PieChart}
        />
        <StatCard
          label="معدل النجاح"
          value={`${overallStats?.success_rate?.toFixed(1) || 0}%`}
          color="from-yellow-500 to-orange-600"
          icon={BarChart3}
        />
      </div>

      {/* Daily Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-gray-900 mb-6">الإحصائيات اليومية</h3>

        <div className="space-y-4">
          {dailyStats.slice().reverse().map((stat) => {
            const successRate = stat.total_sent > 0
              ? (stat.total_delivered / stat.total_sent) * 100
              : 0;

            return (
              <div key={stat.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="font-bold text-gray-900">
                      {new Date(stat.date).toLocaleDateString('ar-SA', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.total_sent} رسالة
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {/* مرسل */}
                  <div className="relative">
                    <div
                      className="h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg transition-all"
                      style={{ width: `${(stat.total_sent / maxSent) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {stat.total_sent}
                    </div>
                  </div>

                  {/* مستلم */}
                  <div className="relative">
                    <div
                      className="h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg transition-all"
                      style={{ width: `${(stat.total_delivered / maxSent) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {stat.total_delivered}
                    </div>
                  </div>

                  {/* مقروء */}
                  <div className="relative">
                    <div
                      className="h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg transition-all"
                      style={{ width: `${(stat.total_read / maxSent) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {stat.total_read}
                    </div>
                  </div>

                  {/* فاشل */}
                  <div className="relative">
                    <div
                      className="h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg transition-all"
                      style={{ width: `${(stat.total_failed / maxSent) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {stat.total_failed}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>معدل النجاح: {successRate.toFixed(1)}%</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      مرسل
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      مستلم
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      مقروء
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      فاشل
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-black text-gray-900 mb-4">📊 ملخص الأداء</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <strong>متوسط الرسائل اليومية:</strong>{' '}
            {dailyStats.length > 0
              ? Math.round(dailyStats.reduce((sum, s) => sum + s.total_sent, 0) / dailyStats.length)
              : 0}
          </div>
          <div>
            <strong>أفضل يوم:</strong>{' '}
            {dailyStats.length > 0
              ? new Date(
                  dailyStats.reduce((best, s) =>
                    s.total_sent > best.total_sent ? s : best
                  ).date
                ).toLocaleDateString('ar-SA')
              : '-'}
          </div>
          <div>
            <strong>معدل القراءة:</strong>{' '}
            {overallStats?.total_sent > 0
              ? ((overallStats.total_read / overallStats.total_sent) * 100).toFixed(1)
              : 0}
            %
          </div>
          <div>
            <strong>معدل الفشل:</strong>{' '}
            {overallStats?.total_sent > 0
              ? ((overallStats.total_failed / overallStats.total_sent) * 100).toFixed(1)
              : 0}
            %
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon
}: {
  label: string;
  value: string | number;
  color: string;
  icon: any;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
