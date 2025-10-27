import React, { useState } from 'react';
import { BarChart3, Link2, Settings, Activity } from 'lucide-react';
import { MarketingAnalyticsDashboard } from './MarketingAnalyticsDashboard';
import { VisitorAnalyticsDashboard } from './VisitorAnalyticsDashboard';
import { TrackingLinksGenerator } from './TrackingLinksGenerator';
import { PlatformConnectionsSettings } from './PlatformConnectionsSettings';
import { ConnectionHealthStatus } from './ConnectionHealthStatus';
import { BackButton } from '../../../components/common/BackButton';

interface MarketingViewProps {
  onBack?: () => void;
}

type Tab = 'analytics' | 'visitors' | 'tracking-links' | 'connections' | 'health';

export function MarketingView({ onBack }: MarketingViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('visitors');

  const tabs = [
    { id: 'visitors' as const, label: 'تحليل الزوار', icon: Activity, description: 'تتبع شامل للزوار ومصادر الزيارات' },
    { id: 'tracking-links' as const, label: 'روابط التتبع', icon: Link2, description: 'مولّد الروابط الذكية' },
    { id: 'analytics' as const, label: 'تحليلات تفصيلية', icon: BarChart3, description: 'إحصائيات متقدمة' },
    { id: 'connections' as const, label: 'إعدادات الربط', icon: Settings, description: 'ربط المنصات الإعلانية' },
    { id: 'health' as const, label: 'حالة الاتصال', icon: Activity, description: 'سجل اختبارات الاتصال' }
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة التسويق</h1>
          <p className="text-gray-600">تتبع وتحليل أداء الحملات التسويقية ومصادر الزيارات</p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-[#8B7355] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-right">
                    <div className="text-sm font-semibold">{tab.label}</div>
                    {isActive && (
                      <div className="text-xs opacity-90">{tab.description}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'visitors' && <VisitorAnalyticsDashboard />}
          {activeTab === 'tracking-links' && <TrackingLinksGenerator />}
          {activeTab === 'analytics' && <MarketingAnalyticsDashboard />}
          {activeTab === 'connections' && <PlatformConnectionsSettings />}
          {activeTab === 'health' && <ConnectionHealthStatus />}
        </div>
      </div>
    </div>
  );
}
