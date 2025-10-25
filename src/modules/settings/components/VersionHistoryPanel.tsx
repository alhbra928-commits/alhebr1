import React, { useEffect, useState } from 'react';
import { Package, Calendar, User, GitBranch, CheckCircle, Clock } from 'lucide-react';
import { versionTrackingService, SystemVersion } from '../../../services/versionTrackingService';

export const VersionHistoryPanel: React.FC = () => {
  const [versions, setVersions] = useState<SystemVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    setLoading(true);
    const data = await versionTrackingService.getVersionHistory(20);
    setVersions(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="mr-3 text-gray-600">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Package className="text-green-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">سجل الإصدارات</h2>
            <p className="text-sm text-gray-600">جميع إصدارات المنصة المنشورة</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {versions.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">لا توجد إصدارات مسجلة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  version.is_active
                    ? 'bg-green-50 border-green-300 shadow-md'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {version.is_active && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                      <CheckCircle size={14} />
                      النسخة النشطة
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          version.is_active ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      >
                        <GitBranch className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {version.version}
                        </h3>
                        {version.build_number && (
                          <p className="text-sm text-gray-600">
                            البناء: {version.build_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        version.environment === 'production'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {version.environment === 'production' ? 'إنتاج' : 'تطوير'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(version.deployed_at)}</span>
                    </div>
                    {version.deployed_by && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={16} />
                        <span>{version.deployed_by}</span>
                      </div>
                    )}
                  </div>

                  {version.changelog && version.changelog.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        سجل التغييرات:
                      </h4>
                      <ul className="space-y-1">
                        {version.changelog.map((item, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{item.change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {!version.is_active && index === 0 && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-300 rounded-full p-1">
                      <Clock className="text-gray-600" size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
