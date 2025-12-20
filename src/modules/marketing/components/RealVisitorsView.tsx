/**
 * Real Visitors View - عرض الزوار الحقيقي
 *
 * يعتمد على analytics_sessions (بيانات حقيقية 100%)
 * تحديث تلقائي كل 5 ثواني
 */

import React, { useState, useEffect } from 'react';
import { Users, Globe, Smartphone, TrendingUp, Clock, Activity } from 'lucide-react';
import { VisitorsAnalyticsService } from '../../../services/analytics/visitorsAnalyticsService';

type TimeRange = '1h' | '24h' | '7d' | '30d';

export function RealVisitorsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [stats, setStats] = useState({
    totalSessions: 0,
    uniqueVisitors: 0,
    activeSessions: 0,
    avgDuration: 0,
  });

  const [sources, setSources] = useState<{ source: string; sessions: number; percentage: number }[]>([]);
  const [devices, setDevices] = useState<{ deviceType: string; os: string; sessions: number; percentage: number }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: number; sessions: number }[]>([]);

  const fetchData = async () => {
    try {
      const [statsData, sourcesData, devicesData, hourlyDataResult] = await Promise.all([
        VisitorsAnalyticsService.getVisitorStats(timeRange),
        VisitorsAnalyticsService.getSourceBreakdown(timeRange),
        VisitorsAnalyticsService.getDeviceBreakdown(timeRange),
        VisitorsAnalyticsService.getSessionsByHour(),
      ]);

      setStats(statsData);
      setSources(sourcesData);
      setDevices(devicesData);
      setHourlyData(hourlyDataResult);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching visitors data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Direct: 'bg-emerald-100 text-emerald-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      tiktok: 'bg-purple-100 text-purple-800',
      whatsapp: 'bg-green-100 text-green-800',
      twitter: 'bg-sky-100 text-sky-800',
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' ? '📱' : deviceType === 'tablet' ? '📲' : '💻';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">الزوار والمصادر</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar')}
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { value: '1h' as TimeRange, label: 'آخر ساعة' },
            { value: '24h' as TimeRange, label: 'آخر 24 ساعة' },
            { value: '7d' as TimeRange, label: 'آخر 7 أيام' },
            { value: '30d' as TimeRange, label: 'آخر 30 يوم' },
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 opacity-80" />
            <Activity className="h-5 w-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalSessions.toLocaleString()}</div>
          <div className="text-sm opacity-90">إجمالي الجلسات</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Globe className="h-8 w-8 opacity-80" />
            <TrendingUp className="h-5 w-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.uniqueVisitors.toLocaleString()}</div>
          <div className="text-sm opacity-90">زوار فريدون</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 opacity-80" />
            <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeSessions.toLocaleString()}</div>
          <div className="text-sm opacity-90">نشط الآن</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-8 w-8 opacity-80" />
            <Smartphone className="h-5 w-5 opacity-60" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {Math.floor(stats.avgDuration / 60)}:{(stats.avgDuration % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm opacity-90">متوسط المدة</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع المصادر</h3>
          <div className="space-y-3">
            {sources.length === 0 ? (
              <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
            ) : (
              sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(source.source)}`}>
                      {source.source}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">{source.sessions}</span>
                    <span className="text-sm text-gray-500 w-12 text-left">{source.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الأجهزة</h3>
          <div className="space-y-3">
            {devices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
            ) : (
              devices.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getDeviceIcon(device.deviceType)}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 capitalize">{device.deviceType}</div>
                      <div className="text-xs text-gray-500">{device.os}</div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden mx-3">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">{device.sessions}</span>
                    <span className="text-sm text-gray-500 w-12 text-left">{device.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">الجلسات حسب الساعة (آخر 24 ساعة)</h3>
        <div className="flex items-end justify-between gap-1 h-40">
          {hourlyData.map((data, index) => {
            const maxSessions = Math.max(...hourlyData.map(d => d.sessions), 1);
            const height = (data.sessions / maxSessions) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t hover:from-emerald-600 hover:to-emerald-500 transition-all cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.sessions} جلسة
                  </div>
                </div>
                <span className="text-xs text-gray-500">{data.hour}:00</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">📊 بيانات حقيقية من analytics_sessions</p>
            <p className="text-blue-700">
              جميع البيانات يتم جلبها مباشرة من جدول{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">analytics_sessions</code>.
              التحديث التلقائي كل 5 ثواني.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
