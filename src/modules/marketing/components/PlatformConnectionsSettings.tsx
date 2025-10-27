import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Loader2, Settings, AlertCircle } from 'lucide-react';
import { marketingAnalyticsService, PlatformConnection } from '../../../services/marketingAnalyticsService';

const PLATFORMS = [
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    icon: '📊',
    description: 'تتبع الزوار والتحويلات',
    fields: [
      { key: 'property_id', label: 'Property ID', placeholder: 'G-XXXXXXXXXX' }
    ]
  },
  {
    id: 'tiktok_pixel',
    name: 'TikTok Pixel',
    icon: '🎵',
    description: 'تتبع الأحداث والإعلانات',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'XXXXXXXXXXXX' }
    ]
  },
  {
    id: 'meta_pixel',
    name: 'Meta Pixel (Facebook & Instagram)',
    icon: '📘',
    description: 'تتبع الأحداث على Meta',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'XXXXXXXXXXXX' }
    ]
  },
  {
    id: 'twitter_pixel',
    name: 'Twitter (X) Pixel',
    icon: '🐦',
    description: 'تتبع التحويلات على Twitter',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'XXXXX' }
    ]
  },
  {
    id: 'youtube_analytics',
    name: 'YouTube Analytics',
    icon: '▶️',
    description: 'تحليل القناة والفيديوهات',
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'AIzaSy...' }
    ]
  }
];

export const PlatformConnectionsSettings: React.FC = () => {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const data = await marketingAnalyticsService.getPlatformConnections();
      setConnections(data);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError('فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (platformId: string) => {
    const connection = connections.find(c => c.platform === platformId);
    setEditingPlatform(platformId);
    setFormData({
      api_key: connection?.api_key || '',
      pixel_id: connection?.pixel_id || '',
      property_id: connection?.property_id || ''
    });
  };

  const handleSave = async (platformId: string) => {
    try {
      await marketingAnalyticsService.updatePlatformConnection(platformId, {
        ...formData as any,
        is_active: true
      });

      setEditingPlatform(null);
      await loadConnections();

      // إعادة تحميل السكربتات التحليلية فوراً
      await marketingAnalyticsService.reloadPixels();
      alert('✅ تم حفظ الإعدادات وإعادة تحميل السكربتات التحليلية بنجاح!');
    } catch (err) {
      console.error('Error saving connection:', err);
      setError('فشل حفظ الإعدادات');
    }
  };

  const handleTest = async (platformId: string) => {
    try {
      setTesting(platformId);
      const result = await marketingAnalyticsService.testPlatformConnection(platformId);

      if (result.success) {
        alert(`✅ نجح الاتصال مع ${PLATFORMS.find(p => p.id === platformId)?.name}\nوقت الاستجابة: ${result.response_time}ms`);
      } else {
        alert(`❌ فشل الاتصال: ${result.error}`);
      }

      await loadConnections();
    } catch (err) {
      console.error('Error testing connection:', err);
      alert('❌ حدث خطأ أثناء الاختبار');
    } finally {
      setTesting(null);
    }
  };

  const getConnection = (platformId: string) => {
    return connections.find(c => c.platform === platformId);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <X className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#8B7355] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {PLATFORMS.map((platform) => {
          const connection = getConnection(platform.id);
          const isEditing = editingPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{platform.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      {platform.name}
                      {getStatusIcon(connection?.connection_status)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                    {connection?.last_checked_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        آخر فحص: {new Date(connection.last_checked_at).toLocaleString('ar-SA')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => handleEdit(platform.id)}
                        className="p-2 text-gray-600 hover:text-[#8B7355] hover:bg-gray-50 rounded-lg transition-colors"
                        title="تعديل الإعدادات"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleTest(platform.id)}
                        disabled={testing === platform.id || !connection?.is_active}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="اختبار الاتصال"
                      >
                        {testing === platform.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                  {platform.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type="text"
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      />
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setEditingPlatform(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleSave(platform.id)}
                      className="px-4 py-2 text-white bg-[#8B7355] rounded-lg hover:bg-[#6D5A43] transition-colors"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              {connection?.last_error && !isEditing && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{connection.last_error}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">ملاحظة هامة:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>تأكد من صحة المفاتيح والرموز قبل الحفظ</li>
              <li>استخدم زر الاختبار للتحقق من الاتصال</li>
              <li>يتم تحديث البيانات تلقائياً كل 24 ساعة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
