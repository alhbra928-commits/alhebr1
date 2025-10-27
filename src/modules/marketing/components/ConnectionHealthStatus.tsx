import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';

interface HealthLog {
  id: string;
  platform: string;
  status: string;
  response_time?: number;
  error_message?: string;
  checked_at: string;
}

export const ConnectionHealthStatus: React.FC = () => {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [selectedPlatform]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await marketingAnalyticsService.getConnectionHealthLog(selectedPlatform || undefined, 50);
      setLogs(data);
    } catch (err) {
      console.error('Error loading health logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      timeout: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      success: 'نجح',
      failed: 'فشل',
      timeout: 'انتهى الوقت'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPlatformName = (platform: string): string => {
    const names: Record<string, string> = {
      google_analytics: 'Google Analytics',
      tiktok_pixel: 'TikTok Pixel',
      meta_pixel: 'Meta Pixel',
      twitter_pixel: 'Twitter Pixel',
      youtube_analytics: 'YouTube Analytics'
    };
    return names[platform] || platform;
  };

  const getPlatformIcon = (platform: string): string => {
    const icons: Record<string, string> = {
      google_analytics: '📊',
      tiktok_pixel: '🎵',
      meta_pixel: '📘',
      twitter_pixel: '🐦',
      youtube_analytics: '▶️'
    };
    return icons[platform] || '🔌';
  };

  const platforms = ['google_analytics', 'tiktok_pixel', 'meta_pixel', 'twitter_pixel', 'youtube_analytics'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#8B7355] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedPlatform(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !selectedPlatform
              ? 'bg-[#8B7355] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الكل
        </button>
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPlatform === platform
                ? 'bg-[#8B7355] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{getPlatformIcon(platform)}</span>
            {getPlatformName(platform)}
          </button>
        ))}
        <button
          onClick={loadLogs}
          className="mr-auto flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">سجل حالة الاتصال</h2>
          <p className="text-sm text-gray-600 mt-1">آخر 50 فحص</p>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد سجلات متاحة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    المنصة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    وقت الاستجابة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    الرسالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(log.platform)}</span>
                        <span className="font-medium text-gray-900">{getPlatformName(log.platform)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.response_time ? (
                        <span className="text-sm text-gray-700">{log.response_time}ms</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.error_message ? (
                        <span className="text-sm text-red-600">{log.error_message}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(log.checked_at).toLocaleString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-800">نجح</span>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {logs.filter(l => l.status === 'success').length}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <X className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium text-red-800">فشل</span>
          </div>
          <p className="text-3xl font-bold text-red-900">
            {logs.filter(l => l.status === 'failed').length}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">انتهى الوقت</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900">
            {logs.filter(l => l.status === 'timeout').length}
          </p>
        </div>
      </div>
    </div>
  );
};
