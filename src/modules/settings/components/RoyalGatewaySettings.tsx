import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Settings, Save, RefreshCw, Eye, Zap, Clock, Palette, Type, Layers } from 'lucide-react';
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
        <div className="flex items-center gap-3 text-[#C89B3C]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-[#2C2C2C] font-medium">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20 text-[#2C2C2C]/60">
        لم يتم العثور على إعدادات البوابة
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Luxury Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#C89B3C] via-[#D4AF37] to-[#C89B3C] p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative flex items-center gap-6">
          <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <Crown className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
              البوابة الملكية
              <Sparkles className="w-8 h-8 text-white/80" />
            </h1>
            <p className="text-white/90 text-lg font-medium">
              تخصيص تجربة الترحيب الفاخرة للزوار
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-5 rounded-xl border-2 font-bold ${
            message.type === 'success'
              ? 'bg-[#3D5B4B]/10 border-[#3D5B4B]/30 text-[#3D5B4B]'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* الإعدادات العامة */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">الإعدادات العامة</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* تفعيل البوابة */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
              <div>
                <label className="text-base font-black text-[#2C2C2C]">تفعيل البوابة</label>
                <p className="text-sm text-[#2C2C2C]/60 mt-1">عرض البوابة عند دخول الموقع</p>
              </div>
              <button
                onClick={() => updateSetting('enabled', !settings.enabled)}
                className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
                  settings.enabled ? 'bg-[#3D5B4B]' : 'bg-[#C4C4C4]'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    settings.enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* الدخول التلقائي */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
              <div>
                <label className="text-base font-black text-[#2C2C2C]">الدخول التلقائي</label>
                <p className="text-sm text-[#2C2C2C]/60 mt-1">الانتقال التلقائي للمنصة</p>
              </div>
              <button
                onClick={() => updateSetting('auto_enter_enabled', !settings.auto_enter_enabled)}
                className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
                  settings.auto_enter_enabled ? 'bg-[#3D5B4B]' : 'bg-[#C4C4C4]'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    settings.auto_enter_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* وقت الانتظار */}
            {settings.auto_enter_enabled && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#F4EBDD] to-[#E8E1D3] border border-[#C89B3C]/20">
                <label className="flex items-center gap-2 text-base font-black text-[#2C2C2C] mb-3">
                  <Clock className="w-5 h-5 text-[#C89B3C]" />
                  وقت الانتظار: {settings.auto_enter_delay} ثانية
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.auto_enter_delay}
                  onChange={(e) => updateSetting('auto_enter_delay', parseInt(e.target.value))}
                  className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer shadow-inner"
                  style={{
                    background: `linear-gradient(to right, #3D5B4B 0%, #3D5B4B ${(settings.auto_enter_delay - 1) * 11.11}%, #E8E1D3 ${(settings.auto_enter_delay - 1) * 11.11}%, #E8E1D3 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[#2C2C2C]/60 mt-2 font-medium">
                  <span>1 ثانية</span>
                  <span>10 ثوانٍ</span>
                </div>
              </div>
            )}

            {/* عرض شريط التقدم */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
              <div>
                <label className="text-base font-black text-[#2C2C2C]">شريط التقدم</label>
                <p className="text-sm text-[#2C2C2C]/60 mt-1">عرض شريط التحميل</p>
              </div>
              <button
                onClick={() => updateSetting('show_progress_bar', !settings.show_progress_bar)}
                className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
                  settings.show_progress_bar ? 'bg-[#3D5B4B]' : 'bg-[#C4C4C4]'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    settings.show_progress_bar ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* إعدادات التأثيرات */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">التأثيرات البصرية</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* كثافة الجزيئات */}
            <div>
              <label className="text-base font-black text-[#2C2C2C] mb-3 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C89B3C]" />
                كثافة الجزيئات
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => updateSetting('particle_density', density)}
                    className={`px-4 py-3 rounded-xl text-sm font-black transition-all border-2 ${
                      settings.particle_density === density
                        ? 'bg-[#3D5B4B] text-white border-[#3D5B4B] shadow-lg scale-105'
                        : 'bg-white text-[#2C2C2C] border-[#E8E1D3] hover:border-[#C89B3C] hover:shadow-md'
                    }`}
                  >
                    {density === 'low' ? 'قليل' : density === 'medium' ? 'متوسط' : 'كثيف'}
                  </button>
                ))}
              </div>
            </div>

            {/* سرعة الحركات */}
            <div>
              <label className="text-base font-black text-[#2C2C2C] mb-3 block flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C89B3C]" />
                سرعة الحركات
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['slow', 'medium', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSetting('animation_speed', speed)}
                    className={`px-4 py-3 rounded-xl text-sm font-black transition-all border-2 ${
                      settings.animation_speed === speed
                        ? 'bg-[#3D5B4B] text-white border-[#3D5B4B] shadow-lg scale-105'
                        : 'bg-white text-[#2C2C2C] border-[#E8E1D3] hover:border-[#C89B3C] hover:shadow-md'
                    }`}
                  >
                    {speed === 'slow' ? 'بطيء' : speed === 'medium' ? 'متوسط' : 'سريع'}
                  </button>
                ))}
              </div>
            </div>

            {/* اللون الرئيسي */}
            <div>
              <label className="text-base font-black text-[#2C2C2C] mb-3 block flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#C89B3C]" />
                اللون الرئيسي
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['amber', 'gold', 'bronze'] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSetting('theme_color', color)}
                    className={`px-4 py-3 rounded-xl text-sm font-black transition-all border-2 ${
                      settings.theme_color === color
                        ? 'bg-[#3D5B4B] text-white border-[#3D5B4B] shadow-lg scale-105'
                        : 'bg-white text-[#2C2C2C] border-[#E8E1D3] hover:border-[#C89B3C] hover:shadow-md'
                    }`}
                  >
                    {color === 'amber' ? 'كهرماني' : color === 'gold' ? 'ذهبي' : 'برونزي'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* النصوص القابلة للتخصيص */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Type className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">النصوص</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الترحيبي</label>
              <input
                type="text"
                value={settings.welcome_text_ar}
                onChange={(e) => updateSetting('welcome_text_ar', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الثانوي</label>
              <input
                type="text"
                value={settings.subtitle_text_ar}
                onChange={(e) => updateSetting('subtitle_text_ar', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الوصفي</label>
              <input
                type="text"
                value={settings.description_text_ar}
                onChange={(e) => updateSetting('description_text_ar', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* عناصر التصميم */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">عناصر التصميم</h3>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {[
              { key: 'show_crown', label: 'عرض التاج', icon: Crown },
              { key: 'show_sparkles', label: 'عرض النجوم', icon: Sparkles },
              { key: 'show_particles', label: 'عرض الجزيئات', icon: Zap },
              { key: 'show_rings', label: 'عرض الحلقات الدوارة', icon: RefreshCw },
              { key: 'show_geometric_pattern', label: 'النمط الهندسي', icon: Settings },
              { key: 'show_shimmer_effect', label: 'تأثير اللمعان', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#C89B3C]" />
                  <label className="text-sm font-black text-[#2C2C2C]">{label}</label>
                </div>
                <button
                  onClick={() =>
                    updateSetting(key as keyof GatewaySettings, !settings[key as keyof GatewaySettings])
                  }
                  className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${
                    settings[key as keyof GatewaySettings] ? 'bg-[#3D5B4B]' : 'bg-[#C4C4C4]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${
                      settings[key as keyof GatewaySettings] ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white px-8 py-5 rounded-xl font-black text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <div className="flex items-center justify-center gap-3">
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
        </button>

        <button
          onClick={loadSettings}
          className="px-8 py-5 rounded-xl font-black text-lg bg-white text-[#2C2C2C] hover:bg-[#F4EBDD] transition-all border-2 border-[#E8E1D3] shadow-lg"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6" />
            <span>إعادة تحميل</span>
          </div>
        </button>
      </div>
    </div>
  );
}
