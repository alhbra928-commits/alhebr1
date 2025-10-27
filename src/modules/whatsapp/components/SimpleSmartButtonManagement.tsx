import React, { useState } from 'react';
import {
  MessageCircle, Settings, Zap, BarChart3, MessageSquare, ToggleLeft, ToggleRight,
  Save, Brain, Eye, CheckCircle2, Shield
} from 'lucide-react';
import { SmartAutoResponsesManager } from './SmartAutoResponsesManager';
import { AdvancedSmartButtonSettings } from './AdvancedSmartButtonSettings';
import { SmartButtonAnalyticsDashboard } from './SmartButtonAnalyticsDashboard';
import { SmartButtonAccessControl } from './SmartButtonAccessControl';

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
    <div className="space-y-6" dir="rtl">
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-center animate-pulse">
          {successMessage}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">الزر الذكي (Smart WhatsApp Button)</h1>
            <p className="text-gray-400 text-sm">إدارة متقدمة للزر التفاعلي على جميع صفحات المنصة</p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'settings'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Settings className="w-5 h-5" />
          إعدادات الزر
        </button>

        <button
          onClick={() => setActiveSubTab('responses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'responses'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          الردود التلقائية
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'ai'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Brain className="w-5 h-5" />
          الذكاء المتقدم
        </button>

        <button
          onClick={() => setActiveSubTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'stats'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          الإحصاءات
        </button>

        <button
          onClick={() => setActiveSubTab('access')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
            activeSubTab === 'access'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <Shield className="w-5 h-5" />
          صلاحيات الزر الذكي
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
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">🧠 الذكاء المتقدم</h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-600/20 rounded-lg border border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
                <div>
                  <h4 className="text-white font-semibold">محرك الذكاء الاصطناعي v2</h4>
                  <p className="text-gray-300 text-sm">يشمل: تحليل المشاعر، التعلم الذاتي، والتحويل الذكي</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-bold">تحليل المحادثة</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-bold">اكتشاف المشاعر</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-white font-bold">دعم ثنائي اللغة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
