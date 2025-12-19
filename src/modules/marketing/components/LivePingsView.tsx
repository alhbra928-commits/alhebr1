/**
 * Live Pings View - عرض مباشر لزيارات الموقع
 *
 * يعرض آخر 50 زيارة من analytics_pings
 * مع تحديث تلقائي كل 5 ثواني
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Activity, Smartphone, Monitor, Tablet, MapPin, Clock, ExternalLink } from 'lucide-react';

interface PingData {
  id: string;
  created_at: string;
  session_id: string;
  path: string;
  landing_path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string;
  os: string;
  user_agent: string;
}

export function LivePingsView() {
  const [pings, setPings] = useState<PingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [totalCount, setTotalCount] = useState(0);

  /**
   * جلب البيانات من analytics_pings
   */
  const fetchPings = async () => {
    try {
      const { data, error, count } = await supabase
        .from('analytics_pings')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setPings(data || []);
      setTotalCount(count || 0);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // جلب البيانات عند التحميل
    fetchPings();

    // تحديث كل 5 ثواني
    const interval = setInterval(() => {
      fetchPings();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * رسم أيقونة الجهاز
   */
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-purple-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * رسم OS badge
   */
  const getOSBadge = (os: string) => {
    const colors: Record<string, string> = {
      iOS: 'bg-blue-100 text-blue-800',
      Android: 'bg-green-100 text-green-800',
      Windows: 'bg-indigo-100 text-indigo-800',
      macOS: 'bg-gray-100 text-gray-800',
      Linux: 'bg-orange-100 text-orange-800',
    };

    const color = colors[os] || 'bg-gray-100 text-gray-600';

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {os || 'Unknown'}
      </span>
    );
  };

  /**
   * رسم source badge
   */
  const getSourceBadge = (utmSource: string | null, referrer: string | null) => {
    if (utmSource) {
      const colors: Record<string, string> = {
        google: 'bg-red-100 text-red-800',
        facebook: 'bg-blue-100 text-blue-800',
        instagram: 'bg-pink-100 text-pink-800',
        tiktok: 'bg-purple-100 text-purple-800',
        whatsapp: 'bg-green-100 text-green-800',
        twitter: 'bg-sky-100 text-sky-800',
      };

      const color = colors[utmSource.toLowerCase()] || 'bg-amber-100 text-amber-800';

      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
          {utmSource}
        </span>
      );
    }

    if (referrer) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          Referral
        </span>
      );
    }

    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        Direct
      </span>
    );
  };

  /**
   * تنسيق الوقت (منذ كم من الوقت)
   */
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                الزيارات المباشرة
              </h2>
              <p className="text-sm text-gray-500">
                آخر 50 زيارة • تحديث تلقائي كل 5 ثواني
              </p>
            </div>
          </div>

          <div className="text-left">
            <div className="text-3xl font-bold text-emerald-600">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar')}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* عدد الزيارات اليوم */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-4 text-white">
          <div className="text-sm opacity-90 mb-1">زيارات اليوم</div>
          <div className="text-2xl font-bold">
            {pings.filter((p) => {
              const pingDate = new Date(p.created_at);
              const today = new Date();
              return pingDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </div>

        {/* جوال */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm p-4 text-white">
          <div className="text-sm opacity-90 mb-1">جوال</div>
          <div className="text-2xl font-bold">
            {pings.filter((p) => p.device_type === 'mobile').length}
          </div>
        </div>

        {/* iOS */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm p-4 text-white">
          <div className="text-sm opacity-90 mb-1">iOS</div>
          <div className="text-2xl font-bold">
            {pings.filter((p) => p.os === 'iOS').length}
          </div>
        </div>

        {/* Direct */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm p-4 text-white">
          <div className="text-sm opacity-90 mb-1">مباشر</div>
          <div className="text-2xl font-bold">
            {pings.filter((p) => !p.utm_source && !p.referrer).length}
          </div>
        </div>
      </div>

      {/* جدول الزيارات */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الوقت
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الصفحة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المصدر
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الجهاز
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  النظام
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الجلسة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    لا توجد زيارات حتى الآن
                  </td>
                </tr>
              ) : (
                pings.map((ping) => (
                  <tr
                    key={ping.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* الوقت */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {timeAgo(ping.created_at)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(ping.created_at).toLocaleTimeString('ar')}
                      </div>
                    </td>

                    {/* الصفحة */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {ping.landing_path || ping.path || '/'}
                          </div>
                          {ping.utm_campaign && (
                            <div className="text-xs text-gray-500 truncate">
                              Campaign: {ping.utm_campaign}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* المصدر */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getSourceBadge(ping.utm_source, ping.referrer)}
                      {ping.utm_medium && (
                        <div className="text-xs text-gray-500 mt-1">
                          {ping.utm_medium}
                        </div>
                      )}
                    </td>

                    {/* الجهاز */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(ping.device_type)}
                        <span className="text-sm text-gray-700 capitalize">
                          {ping.device_type}
                        </span>
                      </div>
                    </td>

                    {/* النظام */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getOSBadge(ping.os)}
                    </td>

                    {/* الجلسة */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-500 truncate max-w-[120px]">
                        {ping.session_id?.substring(0, 16)}...
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">📊 إثبات البيانات الحقيقية</p>
            <p className="text-blue-700">
              هذه البيانات يتم جلبها مباشرة من جدول{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">
                analytics_pings
              </code>{' '}
              في قاعدة البيانات. كل زيارة تظهر هنا تعني أنها مُحفوظة فعلياً
              في DB. التحديث التلقائي كل 5 ثواني.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
