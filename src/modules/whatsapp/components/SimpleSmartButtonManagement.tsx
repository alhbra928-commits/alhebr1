import React, { useState } from 'react';
import {
  MessageCircle, Settings, Zap, BarChart3, MessageSquare, ToggleLeft, ToggleRight,
  Save, Brain, Eye, CheckCircle2
} from 'lucide-react';
import { SmartAutoResponsesManager } from './SmartAutoResponsesManager';

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
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'responses' | 'ai' | 'stats'>('settings');
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
      </div>

      {/* Settings Tab */}
      {activeSubTab === 'settings' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">⚙️ إعدادات الزر الذكي</h3>

          <div className="space-y-6">
            {/* حالة التفعيل */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-semibold mb-1">تفعيل الزر الذكي</h4>
                <p className="text-gray-400 text-sm">إظهار الزر على جميع صفحات المنصة</p>
                <p className="text-xs text-cyan-400 mt-1">
                  الحالة الحالية: {settings.is_enabled ? '✅ نشط' : '❌ معطل'}
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
                className={`p-2 rounded-lg transition-all ${
                  settings.is_enabled
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              >
                {settings.is_enabled ? (
                  <ToggleRight className="w-8 h-8 text-white" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {/* الموقع */}
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">📍 موقع الزر</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => setSettings({ ...settings, position: 'bottom-right' })}
                  className={`flex-1 p-3 rounded-lg transition-all ${
                    settings.position === 'bottom-right'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  أسفل اليسار ⬋
                </button>
                <button
                  onClick={() => setSettings({ ...settings, position: 'bottom-left' })}
                  className={`flex-1 p-3 rounded-lg transition-all ${
                    settings.position === 'bottom-left'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  أسفل اليمين ⬊
                </button>
              </div>
            </div>

            {/* الرسائل الترحيبية */}
            <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
              <h4 className="text-white font-semibold mb-3">💬 الرسائل الترحيبية حسب نوع المستخدم</h4>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة الزائر:</label>
                <input
                  type="text"
                  value={settings.welcome_message_visitor}
                  onChange={(e) => setSettings({ ...settings, welcome_message_visitor: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة المستثمر:</label>
                <input
                  type="text"
                  value={settings.welcome_message_investor}
                  onChange={(e) => setSettings({ ...settings, welcome_message_investor: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">رسالة صاحب المزرعة:</label>
                <input
                  type="text"
                  value={settings.welcome_message_owner}
                  onChange={(e) => setSettings({ ...settings, welcome_message_owner: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            {/* اللون الأساسي */}
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-semibold mb-3">🎨 اللون الأساسي</h4>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-20 h-12 rounded-lg cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">اللون المختار: {settings.primary_color}</p>
                  <div
                    className="mt-2 h-8 rounded-lg"
                    style={{ background: settings.primary_color }}
                  />
                </div>
              </div>
            </div>

            {/* النبض والصوت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold mb-1">النبض المتحرك</h4>
                  <p className="text-gray-400 text-sm">تأثير نبض كل 5 ثوانٍ</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, pulse_enabled: !settings.pulse_enabled })}
                  className={`p-2 rounded-lg transition-all ${
                    settings.pulse_enabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {settings.pulse_enabled ? (
                    <ToggleRight className="w-8 h-8 text-white" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <h4 className="text-white font-semibold mb-1">صوت الإشعارات</h4>
                  <p className="text-gray-400 text-sm">تنبيه عند الرد</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, sound_enabled: !settings.sound_enabled })}
                  className={`p-2 rounded-lg transition-all ${
                    settings.sound_enabled
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                >
                  {settings.sound_enabled ? (
                    <ToggleRight className="w-8 h-8 text-white" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* زر الحفظ */}
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
          </div>
        </div>
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
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">📊 الإحصاءات والتحليلات</h3>
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">قريباً: الإحصاءات التفصيلية</p>
            <p className="text-sm mt-2">سيتم إضافة لوحة الإحصاءات الكاملة في التحديث القادم</p>
          </div>
        </div>
      )}
    </div>
  );
};
