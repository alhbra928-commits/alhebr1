import React, { useState, useEffect } from 'react';
import { Users, Eye, Clock, TrendingUp, Loader2, Calendar } from 'lucide-react';
import { marketingAnalyticsService, DashboardStats, TrafficSource } from '../../../services/marketingAnalyticsService';
import { PlatformConnectionsSettings } from './PlatformConnectionsSettings';
import { TrafficSourcesTable } from './TrafficSourcesTable';
import { ConnectionHealthStatus } from './ConnectionHealthStatus';

export const MarketingAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'sources' | 'health'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('month');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  // تحديث تلقائي كل دقيقة
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      // تجميع البيانات اليومية
      await marketingAnalyticsService.aggregateDailyData();
      // إعادة تحميل الإحصائيات
      await loadStats();
      setLastUpdate(new Date());
      console.log('🔄 Auto-refreshed at:', new Date().toLocaleTimeString('ar-SA'));
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [autoRefresh, dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const endDate = new Date().toISOString().split('T')[0];
      let startDate: string;

      switch (dateRange) {
        case 'today':
          startDate = endDate;
          break;
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'month':
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const data = await marketingAnalyticsService.getDashboardStats(startDate, endDate);
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return '0د 0ث';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}د ${secs}ث`;
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

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
    { id: 'connections', label: 'إعدادات الربط', icon: Users },
    { id: 'sources', label: 'مصادر الزوار', icon: Eye },
    { id: 'health', label: 'حالة الاتصال', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            التحليل والربط التسويقي
            {autoRefresh && (
              <span className="flex items-center gap-2 text-sm font-normal text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                مباشر
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            تتبع الزوار ومصادر الزيارات
            {lastUpdate && (
              <span className="text-xs text-gray-500 mr-2">
                • آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </span>
            )}
          </p>
        </div>

        {activeTab === 'overview' && (
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {[
              { value: 'today', label: 'اليوم' },
              { value: 'week', label: 'أسبوع' },
              { value: 'month', label: 'شهر' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === option.value
                    ? 'bg-[#8B7355] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8B7355] text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#8B7355] animate-spin" />
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-sm opacity-80">إجمالي الزوار</span>
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(stats.total_visitors)}</p>
                  <p className="text-sm opacity-80 mt-2">زائر فريد</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="w-8 h-8 opacity-80" />
                    <span className="text-sm opacity-80">الزيارات</span>
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(stats.total_visits)}</p>
                  <p className="text-sm opacity-80 mt-2">زيارة</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 opacity-80" />
                    <span className="text-sm opacity-80">المشاهدات</span>
                  </div>
                  <p className="text-3xl font-bold">{formatNumber(stats.total_page_views)}</p>
                  <p className="text-sm opacity-80 mt-2">صفحة</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 opacity-80" />
                    <span className="text-sm opacity-80">متوسط الوقت</span>
                  </div>
                  <p className="text-3xl font-bold">{formatTime(stats.avg_time_on_site)}</p>
                  <p className="text-sm opacity-80 mt-2">في الموقع</p>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">مصادر الزيارات</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.sources_breakdown || {}).map(([source, count]) => {
                    const total = Object.values(stats.sources_breakdown || {}).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

                    return (
                      <div key={source} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getSourceIcon(source)}</span>
                          <span className="text-sm font-medium text-gray-700">{getSourceName(source)}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatNumber(count)}</p>
                        <p className="text-sm text-gray-600 mt-1">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Pages */}
              {stats.top_pages && stats.top_pages.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">أكثر الصفحات زيارة</h2>
                  <div className="space-y-3">
                    {stats.top_pages.slice(0, 5).map((page, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{page.title}</p>
                          <p className="text-sm text-gray-600 truncate">{page.url}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-[#8B7355]">{formatNumber(page.views)}</p>
                          <p className="text-xs text-gray-600">مشاهدة</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">لا توجد بيانات متاحة</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'connections' && <PlatformConnectionsSettings />}
      {activeTab === 'sources' && <TrafficSourcesTable />}
      {activeTab === 'health' && <ConnectionHealthStatus />}
    </div>
  );
};
