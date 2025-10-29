import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Settings, Save, RefreshCw, Eye, EyeOff, Zap, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewaySettings {
  id: string;
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_progress_bar: boolean;
  particle_density: 'low' | 'medium' | 'high';
  animation_speed: 'slow' | 'medium' | 'fast';
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  theme_color: 'amber' | 'gold' | 'bronze';
  show_crown: boolean;
  show_sparkles: boolean;
  show_particles: boolean;
  show_rings: boolean;
  show_geometric_pattern: boolean;
  show_shimmer_effect: boolean;
}

export function RoyalGatewaySettings() {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
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
        .from('royal_gateway_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings(data as GatewaySettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('royal_gateway_settings')
        .update(settings)
        .eq('id', settings.id);

      if (error) throw error;
      showMessage('success', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateSetting = <K extends keyof GatewaySettings>(
    key: K,
    value: GatewaySettings[K]
  ) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-amber-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20 text-gray-500">
        لم يتم العثور على إعدادات البوابة
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-yellow-900 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-800/50 rounded-xl">
            <Crown className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">إعدادات البوابة الملكية</h2>
            <p className="text-amber-200/80">تخصيص مظهر وسلوك البوابة الرئيسية</p>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-500/30 text-green-400'
              : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* الإعدادات العامة */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Settings className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">الإعدادات العامة</h3>
          </div>

          {/* تفعيل البوابة */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-900">تفعيل البوابة</label>
              <p className="text-xs text-gray-500">عرض البوابة عند دخول الموقع</p>
            </div>
            <button
              onClick={() => updateSetting('enabled', !settings.enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.enabled ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.enabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* الدخول التلقائي */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-900">الدخول التلقائي</label>
              <p className="text-xs text-gray-500">الانتقال التلقائي للمنصة</p>
            </div>
            <button
              onClick={() => updateSetting('auto_enter_enabled', !settings.auto_enter_enabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.auto_enter_enabled ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.auto_enter_enabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* وقت الانتظار */}
          {settings.auto_enter_enabled && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Clock className="w-4 h-4" />
                وقت الانتظار: {settings.auto_enter_delay} ثانية
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.auto_enter_delay}
                onChange={(e) => updateSetting('auto_enter_delay', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 ثانية</span>
                <span>10 ثوانٍ</span>
              </div>
            </div>
          )}

          {/* عرض شريط التقدم */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-900">شريط التقدم</label>
              <p className="text-xs text-gray-500">عرض شريط التحميل</p>
            </div>
            <button
              onClick={() => updateSetting('show_progress_bar', !settings.show_progress_bar)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.show_progress_bar ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.show_progress_bar ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* إعدادات التأثيرات */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">التأثيرات البصرية</h3>
          </div>

          {/* كثافة الجزيئات */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">كثافة الجزيئات</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => updateSetting('particle_density', density)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.particle_density === density
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {density === 'low' ? 'قليل' : density === 'medium' ? 'متوسط' : 'كثيف'}
                </button>
              ))}
            </div>
          </div>

          {/* سرعة الحركات */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">سرعة الحركات</label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'medium', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateSetting('animation_speed', speed)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.animation_speed === speed
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع'}
                </button>
              ))}
            </div>
          </div>

          {/* اللون الرئيسي */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">اللون الرئيسي</label>
            <div className="grid grid-cols-3 gap-2">
              {(['amber', 'gold', 'bronze'] as const).map((color) => (
                <button
                  key={color}
                  onClick={() => updateSetting('theme_color', color)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.theme_color === color
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {color === 'amber' ? 'كهرماني' : color === 'gold' ? 'ذهبي' : 'برونزي'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* النصوص القابلة للتخصيص */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Eye className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">النصوص</h3>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">النص الترحيبي</label>
            <input
              type="text"
              value={settings.welcome_text_ar}
              onChange={(e) => updateSetting('welcome_text_ar', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">النص الثانوي</label>
            <input
              type="text"
              value={settings.subtitle_text_ar}
              onChange={(e) => updateSetting('subtitle_text_ar', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">النص الوصفي</label>
            <input
              type="text"
              value={settings.description_text_ar}
              onChange={(e) => updateSetting('description_text_ar', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
        </div>

        {/* عناصر التصميم */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">عناصر التصميم</h3>
          </div>

          {[
            { key: 'show_crown', label: 'عرض التاج', icon: Crown },
            { key: 'show_sparkles', label: 'عرض النجوم', icon: Sparkles },
            { key: 'show_particles', label: 'عرض الجزيئات', icon: Zap },
            { key: 'show_rings', label: 'عرض الحلقات الدوارة', icon: RefreshCw },
            { key: 'show_geometric_pattern', label: 'النمط الهندسي', icon: Settings },
            { key: 'show_shimmer_effect', label: 'تأثير اللمعان', icon: Sparkles },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-medium text-gray-900">{label}</label>
              </div>
              <button
                onClick={() =>
                  updateSetting(key as keyof GatewaySettings, !settings[key as keyof GatewaySettings])
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings[key as keyof GatewaySettings] ? 'bg-amber-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    settings[key as keyof GatewaySettings] ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-3">
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </div>
        </button>

        <button
          onClick={loadSettings}
          className="px-8 py-4 rounded-xl font-bold text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5" />
            <span>إعادة تحميل</span>
          </div>
        </button>
      </div>
    </div>
  );
}
