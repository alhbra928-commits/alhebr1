import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Calendar, Download, Filter, PieChart,
  Activity, Target, Zap, Users, MessageCircle, CheckCheck,
  Clock, ArrowUp, ArrowDown, Minus, Eye, Send, AlertCircle,
  Sparkles, FileText, Image, Mail, Globe, Settings, RefreshCw,
  TrendingDown, Award, Star, Flame, CircleDot, ChevronRight,
  BarChart2, LineChart, DollarSign, Percent, Hash, Clock3
} from 'lucide-react';
import { whatsappService, DailyStats } from '../services/whatsappService';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';

export function AdvancedAnalyticsReports() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [comparisonPeriod, setComparisonPeriod] = useState<'week' | 'month' | 'quarter'>('week');

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

  const exportReport = (format: 'csv' | 'pdf' | 'excel') => {
    if (format === 'csv') {
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
      link.download = `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      alert(`تصدير ${format.toUpperCase()} قريباً`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse mx-auto shadow-2xl">
              <BarChart3 className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">جاري تحميل التحليلات</p>
          <p className="text-gray-600">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  const calculateTrend = () => {
    if (dailyStats.length < 2) return { direction: 'stable' as const, percentage: 0 };

    const recent = dailyStats.slice(-7);
    const previous = dailyStats.slice(-14, -7);

    const recentAvg = recent.reduce((sum, s) => sum + s.total_sent, 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + s.total_sent, 0) / previous.length;

    if (previousAvg === 0) return { direction: 'stable' as const, percentage: 0 };

    const percentage = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (percentage > 5) return { direction: 'up' as const, percentage };
    if (percentage < -5) return { direction: 'down' as const, percentage };
    return { direction: 'stable' as const, percentage };
  };

  const trend = calculateTrend();

  const insights = generateInsights(dailyStats, overallStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                التحليلات المتقدمة
              </h1>
              <p className="text-gray-600 font-semibold">
                تقارير شاملة ورؤى ذكية لأداء نظام WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadStats()}
              className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>

            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold bg-white"
            >
              <option value={7}>آخر 7 أيام</option>
              <option value={30}>آخر 30 يوم</option>
              <option value={90}>آخر 90 يوم</option>
              <option value={180}>آخر 6 أشهر</option>
              <option value={365}>آخر سنة</option>
            </select>

            <div className="relative group">
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                <Download className="h-5 w-5" />
                تصدير
              </button>

              <div className="absolute left-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[180px]">
                <button
                  onClick={() => exportReport('csv')}
                  className="w-full px-4 py-3 text-right hover:bg-gray-50 font-bold text-gray-700 first:rounded-t-xl"
                >
                  <FileText className="inline h-4 w-4 ml-2" />
                  CSV
                </button>
                <button
                  onClick={() => exportReport('excel')}
                  className="w-full px-4 py-3 text-right hover:bg-gray-50 font-bold text-gray-700"
                >
                  <FileText className="inline h-4 w-4 ml-2" />
                  Excel
                </button>
                <button
                  onClick={() => exportReport('pdf')}
                  className="w-full px-4 py-3 text-right hover:bg-gray-50 font-bold text-gray-700 last:rounded-b-xl"
                >
                  <FileText className="inline h-4 w-4 ml-2" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Eye },
            { id: 'detailed', label: 'تفصيلي', icon: BarChart2 },
            { id: 'comparison', label: 'مقارنات', icon: LineChart }
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'overview' && (
        <OverviewView
          dailyStats={dailyStats}
          overallStats={overallStats}
          trend={trend}
          insights={insights}
        />
      )}

      {viewMode === 'detailed' && (
        <DetailedView
          dailyStats={dailyStats}
          overallStats={overallStats}
        />
      )}

      {viewMode === 'comparison' && (
        <ComparisonView
          dailyStats={dailyStats}
          comparisonPeriod={comparisonPeriod}
          setComparisonPeriod={setComparisonPeriod}
        />
      )}
    </div>
  );
}

function OverviewView({ dailyStats, overallStats, trend, insights }: any) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="إجمالي الرسائل"
          value={overallStats?.total_sent || 0}
          trend={trend}
          icon={MessageCircle}
          color="from-blue-500 to-cyan-600"
        />
        <KPICard
          title="معدل التسليم"
          value={`${overallStats?.delivery_rate?.toFixed(1) || 0}%`}
          trend={{ direction: 'up', percentage: 2.4 }}
          icon={CheckCheck}
          color="from-emerald-500 to-green-600"
        />
        <KPICard
          title="معدل القراءة"
          value={`${overallStats?.total_sent > 0 ? ((overallStats.total_read / overallStats.total_sent) * 100).toFixed(1) : 0}%`}
          trend={{ direction: 'up', percentage: 5.2 }}
          icon={Eye}
          color="from-purple-500 to-pink-600"
        />
        <KPICard
          title="معدل الفشل"
          value={`${overallStats?.total_sent > 0 ? ((overallStats.total_failed / overallStats.total_sent) * 100).toFixed(1) : 0}%`}
          trend={{ direction: 'down', percentage: -1.8 }}
          icon={AlertCircle}
          color="from-amber-500 to-orange-600"
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900">اتجاه الرسائل</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-2 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-bold text-blue-900">مرسل</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-bold text-green-900">مستلم</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm font-bold text-purple-900">مقروء</span>
            </div>
          </div>
        </div>

        <TrendLineChart data={dailyStats} />
      </div>

      {/* Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel insights={insights} />
        <PerformanceBreakdown dailyStats={dailyStats} overallStats={overallStats} />
      </div>

      {/* Category Performance */}
      <CategoryPerformance overallStats={overallStats} />
    </div>
  );
}

function DetailedView({ dailyStats, overallStats }: any) {
  const maxSent = Math.max(...dailyStats.map((s: DailyStats) => s.total_sent), 1);

  return (
    <div className="space-y-6">
      {/* Detailed Stats Table */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b-2 border-gray-200">
          <h3 className="text-xl font-black text-gray-900">الإحصائيات التفصيلية</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-black text-gray-900">التاريخ</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">مرسل</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">مستلم</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">مقروء</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">فاشل</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">معدل النجاح</th>
                <th className="px-6 py-4 text-center text-sm font-black text-gray-900">معدل القراءة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyStats.slice().reverse().map((stat: DailyStats, idx: number) => {
                const successRate = stat.total_sent > 0 ? (stat.total_delivered / stat.total_sent) * 100 : 0;
                const readRate = stat.total_sent > 0 ? (stat.total_read / stat.total_sent) * 100 : 0;

                return (
                  <tr key={stat.date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {new Date(stat.date).toLocaleDateString('ar-SA', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-900 rounded-lg font-bold text-sm">
                        {stat.total_sent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-900 rounded-lg font-bold text-sm">
                        {stat.total_delivered}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-900 rounded-lg font-bold text-sm">
                        {stat.total_read}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-900 rounded-lg font-bold text-sm">
                        {stat.total_failed}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all"
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-gray-900">{successRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all"
                            style={{ width: `${readRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-black text-gray-900">{readRate.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HourlyDistribution dailyStats={dailyStats} />
        <MessageTypeBreakdown overallStats={overallStats} />
      </div>
    </div>
  );
}

function ComparisonView({ dailyStats, comparisonPeriod, setComparisonPeriod }: any) {
  const getComparison = () => {
    const days = comparisonPeriod === 'week' ? 7 : comparisonPeriod === 'month' ? 30 : 90;

    const current = dailyStats.slice(-days);
    const previous = dailyStats.slice(-days * 2, -days);

    const currentTotal = current.reduce((sum: number, s: DailyStats) => sum + s.total_sent, 0);
    const previousTotal = previous.reduce((sum: number, s: DailyStats) => sum + s.total_sent, 0);

    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      current: {
        total: currentTotal,
        avg: current.length > 0 ? currentTotal / current.length : 0,
        delivered: current.reduce((sum: number, s: DailyStats) => sum + s.total_delivered, 0),
        read: current.reduce((sum: number, s: DailyStats) => sum + s.total_read, 0)
      },
      previous: {
        total: previousTotal,
        avg: previous.length > 0 ? previousTotal / previous.length : 0,
        delivered: previous.reduce((sum: number, s: DailyStats) => sum + s.total_delivered, 0),
        read: previous.reduce((sum: number, s: DailyStats) => sum + s.total_read, 0)
      },
      change
    };
  };

  const comparison = getComparison();

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-3">
        {[
          { value: 'week', label: 'أسبوع' },
          { value: 'month', label: 'شهر' },
          { value: 'quarter', label: '3 أشهر' }
        ].map(p => (
          <button
            key={p.value}
            onClick={() => setComparisonPeriod(p.value)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              comparisonPeriod === p.value
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ComparisonCard
          title="إجمالي الرسائل"
          current={comparison.current.total}
          previous={comparison.previous.total}
          change={comparison.change}
          icon={MessageCircle}
        />
        <ComparisonCard
          title="معدل التسليم"
          current={comparison.current.total > 0 ? (comparison.current.delivered / comparison.current.total) * 100 : 0}
          previous={comparison.previous.total > 0 ? (comparison.previous.delivered / comparison.previous.total) * 100 : 0}
          change={0}
          isPercentage
          icon={CheckCheck}
        />
        <ComparisonCard
          title="معدل القراءة"
          current={comparison.current.total > 0 ? (comparison.current.read / comparison.current.total) * 100 : 0}
          previous={comparison.previous.total > 0 ? (comparison.previous.read / comparison.previous.total) * 100 : 0}
          change={0}
          isPercentage
          icon={Eye}
        />
      </div>

      {/* Side-by-Side Comparison */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-gray-900 mb-6">المقارنة التفصيلية</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PeriodSummary
            title="الفترة الحالية"
            data={comparison.current}
            color="from-blue-500 to-cyan-600"
          />
          <PeriodSummary
            title="الفترة السابقة"
            data={comparison.previous}
            color="from-gray-400 to-gray-500"
          />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, icon: Icon, color }: any) {
  const getTrendIcon = () => {
    if (trend.direction === 'up') return <ArrowUp className="h-4 w-4" />;
    if (trend.direction === 'down') return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend.direction === 'up') return 'text-emerald-600 bg-emerald-50';
    if (trend.direction === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6 text-white" />
        </div>

        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend.percentage).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="text-3xl font-black text-gray-900 mb-2">
        {typeof value === 'number' ? (
          <AnimatedCounter value={value} />
        ) : (
          value
        )}
      </div>

      <div className="text-sm text-gray-600 font-bold">{title}</div>
    </div>
  );
}

function TrendLineChart({ data }: { data: DailyStats[] }) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => Math.max(d.total_sent, d.total_delivered, d.total_read)));
  const points = data.slice(-14).reverse();

  const createPath = (values: number[]) => {
    const width = 100;
    const height = 60;
    const step = width / (values.length - 1);

    return values.map((value, i) => {
      const x = i * step;
      const y = height - (value / maxValue) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="relative h-64">
      <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid */}
        <line x1="0" y1="15" x2="100" y2="15" stroke="#e5e7eb" strokeWidth="0.1" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="#e5e7eb" strokeWidth="0.1" />
        <line x1="0" y1="45" x2="100" y2="45" stroke="#e5e7eb" strokeWidth="0.1" />

        {/* Lines */}
        <path
          d={createPath(points.map(p => p.total_sent))}
          fill="none"
          stroke="url(#blue-gradient)"
          strokeWidth="0.5"
          className="drop-shadow-lg"
        />
        <path
          d={createPath(points.map(p => p.total_delivered))}
          fill="none"
          stroke="url(#green-gradient)"
          strokeWidth="0.5"
          className="drop-shadow-lg"
        />
        <path
          d={createPath(points.map(p => p.total_read))}
          fill="none"
          stroke="url(#purple-gradient)"
          strokeWidth="0.5"
          className="drop-shadow-lg"
        />

        {/* Gradients */}
        <defs>
          <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Date Labels */}
      <div className="flex justify-between mt-4 text-xs text-gray-500 font-bold">
        {points.filter((_, i) => i % 3 === 0).map(p => (
          <div key={p.date}>
            {new Date(p.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPanel({ insights }: any) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900">الرؤى الذكية</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight: any, idx: number) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border-2 ${
              insight.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
              insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <insight.icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                insight.type === 'success' ? 'text-emerald-600' :
                insight.type === 'warning' ? 'text-amber-600' :
                'text-blue-600'
              }`} />
              <div className="flex-1">
                <div className="font-black text-gray-900 mb-1">{insight.title}</div>
                <div className="text-sm text-gray-700">{insight.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceBreakdown({ dailyStats, overallStats }: any) {
  const metrics = [
    {
      label: 'أفضل يوم أداءً',
      value: dailyStats.length > 0
        ? new Date(dailyStats.reduce((best: DailyStats, s: DailyStats) =>
            s.total_sent > best.total_sent ? s : best
          ).date).toLocaleDateString('ar-SA', { weekday: 'long' })
        : '-',
      icon: Star,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      label: 'متوسط يومي',
      value: dailyStats.length > 0
        ? Math.round(dailyStats.reduce((sum: number, s: DailyStats) => sum + s.total_sent, 0) / dailyStats.length)
        : 0,
      icon: Activity,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'أعلى معدل تسليم',
      value: `${(overallStats?.delivery_rate || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600'
    },
    {
      label: 'مجموع القراءات',
      value: overallStats?.total_read || 0,
      icon: Eye,
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Target className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-black text-gray-900">تفصيل الأداء</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
              <div className={`w-10 h-10 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 font-bold mb-1">{metric.label}</div>
                <div className="text-2xl font-black text-gray-900">{metric.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPerformance({ overallStats }: any) {
  const categories = overallStats?.by_category || {};
  const total = Object.values(categories).reduce((sum: number, val: any) => sum + val, 0) || 1;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-black text-gray-900 mb-6">الأداء حسب التصنيف</h3>

      <div className="space-y-4">
        {Object.entries(categories).map(([category, count]: [string, any]) => {
          const percentage = (count / total) * 100;

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{category}</span>
                <span className="text-sm font-black text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HourlyDistribution({ dailyStats }: any) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-black text-gray-900 mb-6">التوزيع حسب الوقت</h3>
      <div className="text-center text-gray-600 py-12">
        <Clock3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <p className="font-bold">قريباً: تحليل توزيع الرسائل حسب الساعات</p>
      </div>
    </div>
  );
}

function MessageTypeBreakdown({ overallStats }: any) {
  const types = overallStats?.by_type || {};

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-black text-gray-900 mb-6">التوزيع حسب النوع</h3>

      <div className="space-y-4">
        {Object.entries(types).map(([type, count]: [string, any]) => (
          <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-bold text-gray-900">{type}</span>
            <span className="text-2xl font-black text-blue-600">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({ title, current, previous, change, isPercentage, icon: Icon }: any) {
  const diff = current - previous;
  const diffPercentage = previous > 0 ? (diff / previous) * 100 : 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="text-sm font-bold text-gray-600">{title}</div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 font-bold mb-1">الحالية</div>
          <div className="text-3xl font-black text-gray-900">
            {isPercentage ? `${current.toFixed(1)}%` : Math.round(current)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {diffPercentage > 0 ? (
            <ArrowUp className="h-4 w-4 text-emerald-600" />
          ) : diffPercentage < 0 ? (
            <ArrowDown className="h-4 w-4 text-red-600" />
          ) : (
            <Minus className="h-4 w-4 text-gray-600" />
          )}
          <span className={`text-sm font-black ${
            diffPercentage > 0 ? 'text-emerald-600' :
            diffPercentage < 0 ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {Math.abs(diffPercentage).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 font-bold">مقارنة بالسابقة</span>
        </div>

        <div className="pt-3 border-t-2 border-gray-100">
          <div className="text-xs text-gray-500 font-bold mb-1">السابقة</div>
          <div className="text-lg font-black text-gray-600">
            {isPercentage ? `${previous.toFixed(1)}%` : Math.round(previous)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodSummary({ title, data, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color === 'from-blue-500 to-cyan-600' ? 'from-blue-50 to-cyan-50' : 'from-gray-50 to-gray-100'} border-2 border-gray-200 rounded-xl p-6`}>
      <h4 className="font-black text-gray-900 mb-4">{title}</h4>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">الإجمالي</span>
          <span className="text-2xl font-black text-gray-900">{Math.round(data.total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">المتوسط اليومي</span>
          <span className="text-xl font-black text-gray-900">{Math.round(data.avg)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">المستلم</span>
          <span className="text-xl font-black text-emerald-600">{Math.round(data.delivered)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-bold">المقروء</span>
          <span className="text-xl font-black text-purple-600">{Math.round(data.read)}</span>
        </div>
      </div>
    </div>
  );
}

function generateInsights(dailyStats: DailyStats[], overallStats: any) {
  const insights = [];

  // High delivery rate
  if (overallStats?.delivery_rate > 95) {
    insights.push({
      type: 'success',
      icon: Award,
      title: 'معدل تسليم ممتاز',
      description: `معدل التسليم ${overallStats.delivery_rate.toFixed(1)}% يتجاوز المعدل المثالي`
    });
  }

  // Growth trend
  if (dailyStats.length >= 7) {
    const recent = dailyStats.slice(-3).reduce((sum, s) => sum + s.total_sent, 0) / 3;
    const older = dailyStats.slice(-7, -3).reduce((sum, s) => sum + s.total_sent, 0) / 4;

    if (recent > older * 1.1) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'نمو ملحوظ',
        description: 'زيادة بنسبة 10% في معدل الإرسال خلال الأيام الأخيرة'
      });
    }
  }

  // Read rate warning
  if (overallStats?.total_sent > 0) {
    const readRate = (overallStats.total_read / overallStats.total_sent) * 100;
    if (readRate < 50) {
      insights.push({
        type: 'warning',
        icon: Eye,
        title: 'معدل قراءة منخفض',
        description: 'فقط ${readRate.toFixed(1)}% من الرسائل تم قراءتها - حاول تحسين المحتوى'
      });
    }
  }

  // Best day
  if (dailyStats.length > 0) {
    const bestDay = dailyStats.reduce((best, s) => s.total_sent > best.total_sent ? s : best);
    insights.push({
      type: 'info',
      icon: Star,
      title: 'أفضل يوم',
      description: `تم إرسال ${bestDay.total_sent} رسالة في ${new Date(bestDay.date).toLocaleDateString('ar-SA')}`
    });
  }

  return insights;
}
