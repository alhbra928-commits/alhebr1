import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Inbox, FileText, Settings, BarChart3, Link2, Link as LinkIcon, Zap, X } from 'lucide-react';
import { WhatsAppProvidersHub } from './WhatsAppProvidersHub';
import { TemplateStudio } from './TemplateStudio';
import { EventConnector } from './EventConnector';
import { EnhancedSmartInboxPage } from './EnhancedSmartInboxPage';
import { SimpleSmartButtonManagement } from './SimpleSmartButtonManagement';
import { AnalyticsReports } from './AnalyticsReports';
import { ExternalIntegration } from './ExternalIntegration';
import { SystemTesting } from './SystemTesting';
import { BackButton } from '../../../components/common/BackButton';
import { whatsappService } from '../../../services/whatsappService';

type TabType = 'overview' | 'integration' | 'templates' | 'events' | 'inbox' | 'smart-button' | 'analytics' | 'testing';

interface WhatsAppDashboardProps {
  onBack?: () => void;
}

export const WhatsAppDashboard: React.FC<WhatsAppDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    total_providers: 0,
    total_messages: 0,
    total_templates: 0,
    sent_today: 0
  });
  const [loading, setLoading] = useState(true);
  const [showSmartButtonModal, setShowSmartButtonModal] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  // Handle smart button tab click - always check window size when clicked
  const handleSmartButtonClick = () => {
    const isMobile = window.innerWidth < 768;
    console.log('Smart Button clicked! Screen width:', window.innerWidth, 'isMobile:', isMobile);

    if (isMobile) {
      console.log('Opening Full Screen Modal...');
      setShowSmartButtonModal(true);
      document.body.style.overflow = 'hidden';
    } else {
      console.log('Using regular tab...');
      setActiveTab('smart-button');
    }
  };

  // Close modal
  const closeSmartButtonModal = () => {
    console.log('Closing Full Screen Modal...');
    setShowSmartButtonModal(false);
    document.body.style.overflow = 'auto';
  };

  // Log when modal state changes
  useEffect(() => {
    console.log('Modal state changed:', showSmartButtonModal);
  }, [showSmartButtonModal]);

  // Force scroll to top when tab changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await whatsappService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setStats({
        total_providers: 0,
        total_messages: 0,
        total_templates: 0,
        sent_today: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'integration' as TabType, label: 'الربط الخارجي', icon: LinkIcon },
    { id: 'templates' as TabType, label: 'القوالب', icon: FileText },
    { id: 'events' as TabType, label: 'ربط الأحداث', icon: Link2 },
    { id: 'inbox' as TabType, label: 'صندوق الوارد', icon: Inbox },
    { id: 'smart-button' as TabType, label: 'الزر الذكي', icon: MessageCircle },
    { id: 'analytics' as TabType, label: 'التقارير', icon: BarChart3 },
    { id: 'testing' as TabType, label: 'الاختبارات', icon: Zap }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'integration':
        return <ExternalIntegration />;

      case 'overview':
        return (
          <div className="space-y-6" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">إدارة الواتساب الذكي</h1>
                <p className="text-gray-400 text-sm">نظرة شاملة على نظام الواتساب</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Settings className="w-8 h-8 text-green-400" />
                  <span className="text-3xl font-bold text-white">{stats.total_providers}</span>
                </div>
                <p className="text-gray-300 text-sm">مزودي الخدمة</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Send className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-bold text-white">{stats.total_messages}</span>
                </div>
                <p className="text-gray-300 text-sm">إجمالي الرسائل</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <span className="text-3xl font-bold text-white">{stats.total_templates}</span>
                </div>
                <p className="text-gray-300 text-sm">القوالب النشطة</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-orange-400" />
                  <span className="text-3xl font-bold text-white">{stats.sent_today}</span>
                </div>
                <p className="text-gray-300 text-sm">رسائل اليوم</p>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  نظام إدارة الواتساب الذكي
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                  نظام متكامل لإدارة اتصالات الواتساب مع المستثمرين وأصحاب المزارع.
                  يدعم إرسال الإشعارات التلقائية، رموز التحقق، والرسائل الترويجية.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <Settings className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">ربط متعدد</h3>
                    <p className="text-gray-400 text-sm">
                      دعم عدة مزودي خدمة (Meta, Twilio, 360Dialog)
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">قوالب ذكية</h3>
                    <p className="text-gray-400 text-sm">
                      قوالب رسائل قابلة للتخصيص مع متغيرات ديناميكية
                    </p>
                  </div>

                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <Inbox className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold mb-1">صندوق ذكي</h3>
                    <p className="text-gray-400 text-sm">
                      إدارة المحادثات والردود اليدوية عند الحاجة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'templates':
        return <TemplateStudio />;

      case 'events':
        return <EventConnector />;

      case 'analytics':
        return <AnalyticsReports />;

      case 'inbox':
        return <EnhancedSmartInboxPage />;

      case 'smart-button':
        return <SimpleSmartButtonManagement />;

      case 'testing':
        return <SystemTesting />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ scrollBehavior: 'smooth' }}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)' }}>
        {onBack && (
          <div className="mb-6">
            <BackButton onClick={onBack} label="العودة للإدارة" />
          </div>
        )}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" dir="rtl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'smart-button') {
                    handleSmartButtonClick();
                  } else {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id || (showSmartButtonModal && tab.id === 'smart-button')
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Desktop content */}
        {!showSmartButtonModal && renderContent()}

        {/* Mobile Full Screen Modal for Smart Button */}
        {showSmartButtonModal && (
          <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-y-auto">
            {/* Header with close button */}
            <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">الزر الذكي</h2>
              </div>
              <button
                onClick={closeSmartButtonModal}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 transition-all"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <SimpleSmartButtonManagement />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
