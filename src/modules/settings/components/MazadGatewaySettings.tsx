import React, { useState, useEffect } from 'react';
import { Crown, Save, RotateCcw, Info, Zap, Clock, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface MazadGatewaySettings {
  id?: string;
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_logo: boolean;
}

export function MazadGatewaySettings() {
  const [settings, setSettings] = useState<MazadGatewaySettings>({
    enabled: true,
    auto_enter_enabled: true,
    auto_enter_delay: 3,
    show_logo: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mazad_gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      if (settings.id) {
        // تحديث
        const { error } = await supabase
          .from('mazad_gateway_settings')
          .update({
            enabled: settings.enabled,
            auto_enter_enabled: settings.auto_enter_enabled,
            auto_enter_delay: settings.auto_enter_delay,
            show_logo: settings.show_logo,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // إنشاء جديد
        const { error } = await supabase
          .from('mazad_gateway_settings')
          .insert([settings]);

        if (error) throw error;
      }

      showMessage('success', 'تم حفظ الإعدادات بنجاح');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      ...settings,
      enabled: true,
      auto_enter_enabled: true,
      auto_enter_delay: 3,
      show_logo: true,
    });
    showMessage('success', 'تم استعادة الإعدادات الافتراضية');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <Crown className="w-10 h-10" />
          <h2 className="text-3xl font-black">إعدادات بوابة مزاد</h2>
        </div>
        <p className="text-white/80 text-lg">إدارة البوابة الترحيبية للمنصة</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
        {/* Enable Gateway */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">تفعيل البوابة</h3>
              <p className="text-sm text-gray-600">عرض البوابة عند فتح المنصة</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                          after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                          peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Auto Enter */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">الدخول التلقائي</h3>
              <p className="text-sm text-gray-600">الانتقال للمنصة تلقائياً</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.auto_enter_enabled}
              onChange={(e) => setSettings({ ...settings, auto_enter_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                          after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                          peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Auto Enter Delay */}
        {settings.auto_enter_enabled && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <label className="block mb-3">
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                مدة الانتظار (بالثواني)
              </span>
              <span className="text-sm text-gray-600 block mt-1">
                المدة قبل الانتقال التلقائي للمنصة
              </span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.auto_enter_delay}
                onChange={(e) => setSettings({ ...settings, auto_enter_delay: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-16 h-12 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">{settings.auto_enter_delay}</span>
              </div>
            </div>
          </div>
        )}

        {/* Show Logo */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">عرض شعار التاج</h3>
              <p className="text-sm text-gray-600">إظهار التاج الأخضر في البوابة</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.show_logo}
              onChange={(e) => setSettings({ ...settings, show_logo: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                          peer-checked:after:translate-x-full peer-checked:after:border-white
                          after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                          after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                          peer-checked:bg-yellow-600"></div>
          </label>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-bold">معلومات مهمة:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>البوابة خفيفة ومحسنة للجوال والآيفون</li>
              <li>التاج الأخضر يطابق شعار المنصة الرئيسية</li>
              <li>الدخول التلقائي يوفر تجربة سلسة</li>
              <li>يمكن تعطيل البوابة للدخول المباشر</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                   bg-gradient-to-r from-emerald-600 to-green-600 text-white
                   rounded-xl font-bold hover:shadow-lg transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ الإعدادات
            </>
          )}
        </button>

        <button
          onClick={resetToDefaults}
          className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold
                   hover:bg-gray-300 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          استعادة الافتراضي
        </button>
      </div>
    </div>
  );
}
