import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Inbox, FileText, Settings, BarChart3, Link2 } from 'lucide-react';
import { WhatsAppProvidersHub } from './WhatsAppProvidersHub';
import { TemplateStudio } from './TemplateStudio';
import { EventConnector } from './EventConnector';
import { SmartInboxPage } from './SmartInboxPage';
import { whatsappService } from '../../../services/whatsappService';

type TabType = 'overview' | 'providers' | 'templates' | 'events' | 'messages' | 'inbox';

export const WhatsAppDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState({
    total_providers: 0,
    total_messages: 0,
    total_templates: 0,
    sent_today: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await whatsappService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'نظرة عامة', icon: BarChart3 },
    { id: 'providers' as TabType, label: 'ربط الشركات', icon: Settings },
    { id: 'templates' as TabType, label: 'القوالب', icon: FileText },
    { id: 'events' as TabType, label: 'ربط الأحداث', icon: Link2 },
    { id: 'messages' as TabType, label: 'الرسائل', icon: Send },
    { id: 'inbox' as TabType, label: 'صندوق الوارد', icon: Inbox }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'providers':
        return <WhatsAppProvidersHub />;

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

      case 'messages':
        return (
          <div className="text-center py-12" dir="rtl">
            <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">سجل الرسائل</h2>
            <p className="text-gray-400">قريباً - المرحلة الثالثة</p>
          </div>
        );

      case 'inbox':
        return <SmartInboxPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2" dir="rtl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
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

        {renderContent()}
      </div>
    </div>
  );
};
