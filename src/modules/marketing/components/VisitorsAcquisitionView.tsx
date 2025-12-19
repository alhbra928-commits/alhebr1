import React, { useEffect, useState } from 'react';
import { Globe, TrendingUp, Users, Target, Eye } from 'lucide-react';
import { marketingAnalyticsService } from '../../../services/analytics/marketingAnalyticsService';

export function VisitorsAcquisitionView() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sourcesData = await marketingAnalyticsService.getSourcesBreakdown(period);
      setSources(sourcesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const lower = source.toLowerCase();
    if (lower.includes('tiktok')) return '📱';
    if (lower.includes('instagram')) return '📷';
    if (lower.includes('facebook')) return '👥';
    if (lower.includes('whatsapp')) return '💬';
    if (lower.includes('google')) return '🔍';
    if (lower.includes('direct')) return '🎯';
    return '🌐';
  };

  const getSourceType = (source: any) => {
    if (source.conversionRate > 5) return { type: 'قرار', color: 'green' };
    if (source.conversionRate > 1) return { type: 'اهتمام', color: 'blue' };
    return { type: 'وعي', color: 'gray' };
  };

  if (loading) {
    return (
      <div className="p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              الزوار والمصادر
            </h1>
            <p className="text-gray-600 mt-2">تحليل مصادر الزيارات والتحويل</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'الأسبوع' },
              { id: 'month', label: 'الشهر' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  period === p.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SummaryCard
            icon={Globe}
            label="إجمالي المصادر"
            value={sources.length}
            color="blue"
          />
          <SummaryCard
            icon={Users}
            label="إجمالي الزوار"
            value={sources.reduce((sum, s) => sum + s.visits, 0)}
            color="purple"
          />
          <SummaryCard
            icon={Eye}
            label="المهتمون"
            value={sources.reduce((sum, s) => sum + s.engaged, 0)}
            color="orange"
          />
          <SummaryCard
            icon={Target}
            label="التحويلات"
            value={sources.reduce((sum, s) => sum + s.bookings, 0)}
            color="green"
          />
        </div>

        {/* Sources Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="w-7 h-7" />
              تفصيل المصادر
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المصدر</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الزيارات</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">المهتمون</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">الحجوزات</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">معدل التحويل</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">التصنيف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sources.map((source, index) => {
                  const sourceType = getSourceType(source);
                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getSourceIcon(source.source)}</span>
                          <span className="font-bold text-gray-800">{source.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-2xl font-bold text-gray-800">{source.visits}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xl font-bold text-blue-600">{source.engaged}</div>
                        <div className="text-xs text-gray-500">
                          {source.visits > 0 ? ((source.engaged / source.visits) * 100).toFixed(0) : 0}% معدل التفاعل
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xl font-bold text-green-600">{source.bookings}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700">{source.conversionRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                          sourceType.color === 'green' ? 'bg-green-100 text-green-700' :
                          sourceType.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {sourceType.type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {sources.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">لا توجد بيانات للفترة المحددة</p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">التصنيفات:</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-700"><strong>قرار:</strong> معدل تحويل أعلى من 5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-sm text-gray-700"><strong>اهتمام:</strong> معدل تحويل 1-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-sm text-gray-700"><strong>وعي:</strong> معدل تحويل أقل من 1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  icon: any;
  label: string;
  value: number;
  color: string;
}

function SummaryCard({ icon: Icon, label, value, color }: SummaryCardProps) {
  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-gray-600 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
