import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, Settings, Zap, BarChart3, MessageSquare, ToggleLeft, ToggleRight,
  Save, Brain, Eye, CheckCircle2, Shield
} from 'lucide-react';
import { SmartAutoResponsesManager } from './SmartAutoResponsesManager';
import { AdvancedSmartButtonSettings } from './AdvancedSmartButtonSettings';
import { SmartButtonAnalyticsDashboard } from './SmartButtonAnalyticsDashboard';
import { SmartButtonAccessControl } from './SmartButtonAccessControl';
import { AdvancedAIEngine } from './AdvancedAIEngine';

interface SmartButtonSettings {
  is_enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  primary_color: string;
  pulse_enabled: boolean;
  sound_enabled: boolean;
  welcome_message_visitor: string;
  welcome_message_investor: string;
  welcome_message_owner: string;
}

export const SimpleSmartButtonManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'responses' | 'ai' | 'stats' | 'access'>('settings');
  const [settings, setSettings] = useState<SmartButtonSettings>({
    is_enabled: true,
    position: 'bottom-right',
    primary_color: '#10B981',
    pulse_enabled: true,
    sound_enabled: true,
    welcome_message_visitor: 'مرحباً! كيف يمكننا مساعدتك اليوم؟ 🌿',
    welcome_message_investor: 'أهلاً بك عزيزي المستثمر! كيف يمكننا خدمتك؟ 💼',
    welcome_message_owner: 'مرحباً بك! نحن هنا لدعمك في إدارة مزرعتك 🚜'
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts or tab changes
  useEffect(() => {
    // Scroll container to top
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Also scroll window to top for mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Focus trap for keyboard accessibility
    document.body.style.overflow = 'auto';
  }, []);

  // Scroll to top when sub-tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSubTab]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem('smart_button_settings', JSON.stringify(settings));
      setSuccessMessage('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(null), 3000);
      window.dispatchEvent(new Event('smart-button-settings-changed'));
    } catch (err: any) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="space-y-4 md:space-y-6 pb-24 md:pb-6"
      dir="rtl"
      style={{
        minHeight: '100vh',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)'
      }}
    >
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/95 backdrop-blur-sm border border-green-400 rounded-xl px-6 py-3 text-white text-center shadow-2xl animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 md:p-3 rounded-xl">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-white">الزر الذكي</h1>
            <p className="text-gray-400 text-xs md:text-sm hidden sm:block">إدارة متقدمة للزر التفاعلي على جميع صفحات المنصة</p>
          </div>
        </div>
      </div>

      {/* Sub Tabs - Mobile Optimized */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
            activeSubTab === 'settings'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 active:scale-95'
          }`}
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">إعدادات الزر</span>
          <span className="sm:hidden">إعدادات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('responses')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
            activeSubTab === 'responses'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 active:scale-95'
          }`}
        >
          <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">الردود التلقائية</span>
          <span className="sm:hidden">الردود</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
            activeSubTab === 'ai'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 active:scale-95'
          }`}
        >
          <Brain className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">الذكاء المتقدم</span>
          <span className="sm:hidden">AI</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
            activeSubTab === 'stats'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 active:scale-95'
          }`}
        >
          <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
          <span>الإحصاءات</span>
        </button>

        <button
          onClick={() => setActiveSubTab('access')}
          className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg whitespace-nowrap transition-all text-sm md:text-base touch-manipulation ${
            activeSubTab === 'access'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 active:scale-95'
          }`}
        >
          <Shield className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">صلاحيات الزر</span>
          <span className="sm:hidden">صلاحيات</span>
        </button>
      </div>

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <AdvancedSmartButtonSettings />
      )}

      {/* Responses Tab */}
      {activeSubTab === 'responses' && (
        <SmartAutoResponsesManager />
      )}

      {/* AI Tab */}
      {activeSubTab === 'ai' && (
        <AdvancedAIEngine />
      )}

      {/* Stats Tab */}
      {activeSubTab === 'stats' && (
        <SmartButtonAnalyticsDashboard />
      )}

      {/* Access Control Tab */}
      {activeSubTab === 'access' && (
        <SmartButtonAccessControl />
      )}
    </div>
  );
};
