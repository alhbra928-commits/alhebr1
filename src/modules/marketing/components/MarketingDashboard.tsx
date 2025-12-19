import React, { useState } from 'react';
import { ArrowRight, Activity, Users, Filter, Target, Lightbulb, TrendingUp, Radio, Zap } from 'lucide-react';
import { CommandCenterView } from './CommandCenterView';
import { VisitorsAcquisitionView } from './VisitorsAcquisitionView';
import { FunnelAnalysisView } from './FunnelAnalysisView';
import { CampaignsManagerView } from './CampaignsManagerView';
import { IntentTrustView } from './IntentTrustView';
import { SignalsView } from './SignalsView';
import { LiveFeedView } from './LiveFeedView';
import { LivePingsView } from './LivePingsView';

interface MarketingDashboardProps {
  onBack: () => void;
}

type Tab = 'command' | 'live' | 'pings' | 'visitors' | 'funnel' | 'campaigns' | 'intent' | 'signals';

export function MarketingDashboard({ onBack }: MarketingDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('command');

  const tabs = [
    { id: 'command', label: 'مركز القيادة', icon: Activity },
    { id: 'pings', label: '📊 إثبات الرصد', icon: Zap },
    { id: 'live', label: 'البث الحي', icon: Radio },
    { id: 'visitors', label: 'الزوار والمصادر', icon: Users },
    { id: 'funnel', label: 'رحلة المستثمر', icon: Filter },
    { id: 'campaigns', label: 'الحملات', icon: TrendingUp },
    { id: 'intent', label: 'النية والثقة', icon: Target },
    { id: 'signals', label: 'التنبيهات', icon: Lightbulb },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'command':
        return <CommandCenterView />;
      case 'pings':
        return <LivePingsView />;
      case 'live':
        return <LiveFeedView />;
      case 'visitors':
        return <VisitorsAcquisitionView />;
      case 'funnel':
        return <FunnelAnalysisView />;
      case 'campaigns':
        return <CampaignsManagerView />;
      case 'intent':
        return <IntentTrustView />;
      case 'signals':
        return <SignalsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="font-medium">رجوع</span>
            </button>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                مركز التسويق والتحليل الاستثماري
              </h1>
              <p className="text-sm text-gray-600">Marketing & Investment Analytics Center</p>
            </div>

            <div className="w-24" />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {renderContent()}
      </div>
    </div>
  );
}
