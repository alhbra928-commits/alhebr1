import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Smartphone, Monitor, Tablet } from 'lucide-react';
import { marketingAnalyticsService, TrafficSource } from '../../../services/marketingAnalyticsService';

export const TrafficSourcesTable: React.FC = () => {
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedSources, setGroupedSources] = useState<Record<string, TrafficSource[]>>({});

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const data = await marketingAnalyticsService.getTrafficSources(startDate, endDate);
      setSources(data);

      // تجميع حسب المصدر
      const grouped = data.reduce((acc, source) => {
        const key = source.traffic_source;
        if (!acc[key]) acc[key] = [];
        acc[key].push(source);
        return acc;
      }, {} as Record<string, TrafficSource[]>);

      setGroupedSources(grouped);
    } catch (err) {
      console.error('Error loading sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string): string => {
    const icons: Record<string, string> = {
      tiktok: '🎵',
      instagram: '📸',
      facebook: '📘',
      twitter: '🐦',
      youtube: '▶️',
      google: '🔍',
      direct: '🌐',
      other: '📱'
    };
    return icons[source] || '📱';
  };

  const getSourceName = (source: string): string => {
    const names: Record<string, string> = {
      tiktok: 'تيك توك',
      instagram: 'إنستقرام',
      facebook: 'فيسبوك',
      twitter: 'تويتر',
      youtube: 'يوتيوب',
      google: 'جوجل',
      direct: 'مباشر',
      other: 'أخرى'
    };
    return names[source] || source;
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const calculateTotal = (sources: TrafficSource[]) => {
    return sources.reduce((sum, s) => sum + s.total_visits, 0);
  };

  const calculatePercentage = (value: number, total: number): string => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#8B7355] animate-spin" />
      </div>
    );
  }

  const totalVisits = Object.values(groupedSources).reduce((sum, sources) => sum + calculateTotal(sources), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">تفصيل مصادر الزيارات</h2>
          <p className="text-sm text-gray-600 mt-1">آخر 30 يوم</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  المصدر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  عدد الزوار
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  زوار فريدون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  النسبة المئوية
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الأجهزة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedSources).map(([source, sourcesData]) => {
                const totalSourceVisits = calculateTotal(sourcesData);
                const totalUniqueVisitors = sourcesData.reduce((sum, s) => sum + s.unique_visitors, 0);
                const percentage = calculatePercentage(totalSourceVisits, totalVisits);

                // تجميع الأجهزة
                const devices = sourcesData.reduce(
                  (acc, s) => ({
                    mobile: acc.mobile + (s.devices_breakdown?.mobile || 0),
                    tablet: acc.tablet + (s.devices_breakdown?.tablet || 0),
                    desktop: acc.desktop + (s.devices_breakdown?.desktop || 0)
                  }),
                  { mobile: 0, tablet: 0, desktop: 0 }
                );

                return (
                  <tr key={source} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getSourceIcon(source)}</span>
                        <span className="font-medium text-gray-900">{getSourceName(source)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(totalSourceVisits)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{formatNumber(totalUniqueVisitors)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8B7355] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Smartphone className="w-4 h-4" />
                          {formatNumber(devices.mobile)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Tablet className="w-4 h-4" />
                          {formatNumber(devices.tablet)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Monitor className="w-4 h-4" />
                          {formatNumber(devices.desktop)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr className="font-bold">
                <td className="px-6 py-4 text-gray-900">الإجمالي</td>
                <td className="px-6 py-4 text-gray-900">{formatNumber(totalVisits)}</td>
                <td className="px-6 py-4 text-gray-900">
                  {formatNumber(
                    Object.values(groupedSources).reduce(
                      (sum, sources) => sum + sources.reduce((s, src) => s + src.unique_visitors, 0),
                      0
                    )
                  )}
                </td>
                <td className="px-6 py-4 text-gray-900">100%</td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>ملاحظة:</strong> البيانات تُحدّث تلقائياً كل 24 ساعة. آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
        </p>
      </div>
    </div>
  );
};
