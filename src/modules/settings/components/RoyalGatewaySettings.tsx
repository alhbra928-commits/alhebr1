import React, { useState, useEffect } from 'react';
import {
  Crown,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Palette,
  Type,
  Settings,
  Clock,
  Sparkles,
  Leaf,
  Palmtree,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewaySettings {
  id: string;
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  theme_color: string;
  show_crown: boolean;
  show_particles: boolean;
  particle_density: string;
  animation_speed: string;
}

export function RoyalGatewaySettings() {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

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
        setSettings(data);
      } else {
        setSettings({
          id: '',
          enabled: true,
          auto_enter_enabled: true,
          auto_enter_delay: 5,
          welcome_text_ar: 'مرحباً بكم',
          subtitle_text_ar: 'منصة الاستثمار الزراعي',
          description_text_ar: 'استثمار آمن في النخيل والزيتون',
          theme_color: 'gold',
          show_crown: true,
          show_particles: true,
          particle_density: 'medium',
          animation_speed: 'medium',
        });
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

      const { error } = settings.id
        ? await supabase
            .from('royal_gateway_settings')
            .update({
              enabled: settings.enabled,
              auto_enter_enabled: settings.auto_enter_enabled,
              auto_enter_delay: settings.auto_enter_delay,
              welcome_text_ar: settings.welcome_text_ar,
              subtitle_text_ar: settings.subtitle_text_ar,
              description_text_ar: settings.description_text_ar,
              theme_color: settings.theme_color,
              show_crown: settings.show_crown,
              show_particles: settings.show_particles,
              particle_density: settings.particle_density,
              animation_speed: settings.animation_speed,
              updated_at: new Date().toISOString(),
            })
            .eq('id', settings.id)
        : await supabase.from('royal_gateway_settings').insert([settings]);

      if (error) throw error;

      showMessage('success', 'تم حفظ الإعدادات بنجاح');
      await loadSettings();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إعدادات البوابة الملكية</h2>
            <p className="text-sm text-gray-600">تحكم كامل في تصميم ومحتوى البوابة</p>
          </div>
        </div>

        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {previewMode ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>إخفاء المعاينة</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>معاينة حية</span>
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={`font-medium ${
              message.type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Main Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">التحكم الرئيسي</h3>
            </div>

            <div className="space-y-4">
              {/* Enable/Disable Gateway */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">تفعيل البوابة</p>
                    <p className="text-sm text-gray-600">عرض البوابة عند فتح المنصة</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Enter */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">الدخول التلقائي</p>
                    <p className="text-sm text-gray-600">الدخول للمنصة بعد مدة محددة</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, auto_enter_enabled: !settings.auto_enter_enabled })
                  }
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.auto_enter_enabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.auto_enter_enabled ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Enter Delay */}
              {settings.auto_enter_enabled && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="block mb-2">
                    <span className="font-semibold text-gray-900">مدة الانتظار (ثواني)</span>
                    <p className="text-sm text-gray-600">الوقت قبل الدخول التلقائي</p>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={settings.auto_enter_delay}
                      onChange={(e) =>
                        setSettings({ ...settings, auto_enter_delay: parseInt(e.target.value) })
                      }
                      className="flex-1 h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <span className="text-2xl font-black text-amber-600 w-12 text-center">
                      {settings.auto_enter_delay}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Content */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">المحتوى النصي</h3>
            </div>

            <div className="space-y-4">
              {/* Welcome Text */}
              <div>
                <label className="block mb-2">
                  <span className="font-semibold text-gray-900">العنوان الرئيسي</span>
                  <p className="text-sm text-gray-600">النص الكبير في الأعلى</p>
                </label>
                <input
                  type="text"
                  value={settings.welcome_text_ar}
                  onChange={(e) => setSettings({ ...settings, welcome_text_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-right text-lg font-bold"
                  placeholder="مرحباً بكم"
                  dir="rtl"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block mb-2">
                  <span className="font-semibold text-gray-900">العنوان الفرعي</span>
                  <p className="text-sm text-gray-600">النص المتوسط</p>
                </label>
                <input
                  type="text"
                  value={settings.subtitle_text_ar}
                  onChange={(e) => setSettings({ ...settings, subtitle_text_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-right font-semibold"
                  placeholder="منصة الاستثمار الزراعي"
                  dir="rtl"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2">
                  <span className="font-semibold text-gray-900">النص الوصفي</span>
                  <p className="text-sm text-gray-600">الوصف التفصيلي</p>
                </label>
                <textarea
                  value={settings.description_text_ar}
                  onChange={(e) => setSettings({ ...settings, description_text_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-right resize-none"
                  rows={3}
                  placeholder="استثمار آمن في النخيل والزيتون"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Visual Elements */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">العناصر البصرية</h3>
            </div>

            <div className="space-y-4">
              {/* Show Crown */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">عرض التاج</p>
                    <p className="text-sm text-gray-600">أيقونة التاج في الأعلى</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_crown: !settings.show_crown })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.show_crown ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.show_crown ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Show Particles */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-900">الجزيئات الذهبية</p>
                    <p className="text-sm text-gray-600">الجزيئات العائمة في الخلفية</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_particles: !settings.show_particles })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.show_particles ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.show_particles ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Particle Density */}
              {settings.show_particles && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <label className="block mb-3">
                    <span className="font-semibold text-gray-900">كثافة الجزيئات</span>
                    <p className="text-sm text-gray-600">عدد الجزيئات الذهبية</p>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((density) => (
                      <button
                        key={density}
                        onClick={() => setSettings({ ...settings, particle_density: density })}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          settings.particle_density === density
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {density === 'low' ? 'قليل' : density === 'medium' ? 'متوسط' : 'كثيف'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Animation Speed */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <label className="block mb-3">
                  <span className="font-semibold text-gray-900">سرعة الحركات</span>
                  <p className="text-sm text-gray-600">سرعة التأثيرات المتحركة</p>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['slow', 'medium', 'fast'].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSettings({ ...settings, animation_speed: speed })}
                      className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                        settings.animation_speed === speed
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">لون السمة</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'gold', label: 'ذهبي', gradient: 'from-amber-400 to-yellow-500' },
                { name: 'royal', label: 'ملكي', gradient: 'from-purple-400 to-pink-500' },
                { name: 'emerald', label: 'زمردي', gradient: 'from-emerald-400 to-teal-500' },
                { name: 'ocean', label: 'محيطي', gradient: 'from-blue-400 to-cyan-500' },
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setSettings({ ...settings, theme_color: theme.name })}
                  className={`relative p-4 rounded-xl transition-all ${
                    settings.theme_color === theme.name
                      ? 'ring-4 ring-amber-400 shadow-lg scale-105'
                      : 'hover:scale-102'
                  }`}
                >
                  <div className={`h-20 rounded-lg bg-gradient-to-br ${theme.gradient} mb-3`} />
                  <p className="font-bold text-gray-900">{theme.label}</p>
                  {settings.theme_color === theme.name && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Palmtree className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">معلومة مفيدة</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  سيتم تطبيق جميع التغييرات مباشرة على البوابة بعد الحفظ. يُنصح بمعاينة
                  التغييرات قبل الحفظ للتأكد من النتيجة النهائية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-6 flex justify-center">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-amber-300 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            {saving ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl" />
        </button>
      </div>
    </div>
  );
}
