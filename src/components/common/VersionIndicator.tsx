import React, { useEffect, useState } from 'react';
import { Package, Calendar, GitBranch, Check } from 'lucide-react';

interface VersionManifest {
  version: string;
  timestamp: number;
  date: string;
  build: string;
  environment: string;
}

export const VersionIndicator: React.FC = () => {
  const [manifest, setManifest] = useState<VersionManifest | null>(null);
  const [cacheBuster, setCacheBuster] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      // Get cache-buster from meta tag
      const metaTag = document.querySelector('meta[name="cache-buster"]');
      if (metaTag) {
        setCacheBuster(metaTag.getAttribute('content') || '');
      }

      // Load version manifest
      const response = await fetch('/version-manifest.json?t=' + Date.now());
      if (response.ok) {
        const data = await response.json();
        setManifest(data);
      }
    } catch (error) {
      console.error('Failed to load version info:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  if (!manifest && !cacheBuster) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-white border-2 border-green-500 text-green-700 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-bold text-sm"
      >
        <Package size={18} />
        <span>{cacheBuster || 'نظام الكاش الذكي'}</span>
      </button>

      {showDetails && manifest && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-green-500 rounded-xl shadow-2xl p-4 min-w-[350px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Check className="text-white" size={18} />
              </div>
              <h3 className="font-bold text-gray-900">معلومات الإصدار</h3>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <GitBranch size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600 text-xs mb-1">رقم الإصدار</div>
                <div className="font-mono font-bold text-gray-900">{manifest.version}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600 text-xs mb-1">رقم البناء</div>
                <div className="font-mono text-gray-900">{manifest.build}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-gray-600 text-xs mb-1">تاريخ النشر</div>
                <div className="text-gray-900">{formatDate(manifest.timestamp)}</div>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">البيئة:</span>
                <span
                  className={`px-2 py-1 rounded-full font-bold ${
                    manifest.environment === 'production'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {manifest.environment === 'production' ? 'إنتاج' : 'تطوير'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                <div className="text-green-700 font-bold text-xs">
                  ✅ نظام الكاش الذكي نشط
                </div>
                <div className="text-green-600 text-[10px] mt-1">
                  يتم تحديث المنصة تلقائياً دون حذف الكاش
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
