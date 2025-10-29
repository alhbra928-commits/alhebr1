import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, Save, RotateCcw, Eye, EyeOff, Zap, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewaySettings {
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  show_particles: boolean;
  particle_density: 'low' | 'medium' | 'high';
  show_animated_bg: boolean;
  show_crown: boolean;
  show_progress_bar: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';
}

export function LuxuryGatewaySettings() {
  const [settings, setSettings] = useState<GatewaySettings>({
    enabled: true,
    auto_enter_enabled: true,
    auto_enter_delay: 4,
    welcome_text_ar: 'مرحباً بك في منصة الاستثمار الزراعي',
    subtitle_text_ar: 'استثمر في أشجار النخيل والزيتون',
    description_text_ar: 'رحلتك نحو الاستثمار الآمن تبدأ هنا',
    show_particles: true,
    particle_density: 'medium',
    show_animated_bg: true,
    show_crown: true,
    show_progress_bar: true,
    animation_speed: 'medium',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('royal_gateway_settings')
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
    setSaving(true);
    try {
      const { error } = await supabase
        .from('royal_gateway_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) throw error;
      showMessage('success', 'تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      enabled: true,
      auto_enter_enabled: true,
      auto_enter_delay: 4,
      welcome_text_ar: 'مرحباً بك في منصة الاستثمار الزراعي',
      subtitle_text_ar: 'استثمر في أشجار النخيل والزيتون',
      description_text_ar: 'رحلتك نحو الاستثمار الآمن تبدأ هنا',
      show_particles: true,
      particle_density: 'medium',
      show_animated_bg: true,
      show_crown: true,
      show_progress_bar: true,
      animation_speed: 'medium',
    });
    showMessage('success', 'تم إعادة تعيين الإعدادات الافتراضية');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#C89B3C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Luxury Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#C89B3C] via-[#D4AF37] to-[#C89B3C] p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative flex items-center gap-6">
          <div className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <Crown className="w-12 h-12 text-white" />
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

        {/* Card 1: Main Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">التحكم الرئيسي</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Gateway */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
              <div>
                <label className="text-base font-black text-[#2C2C2C]">تفعيل البوابة</label>
                <p className="text-sm text-[#2C2C2C]/60 mt-1">عرض البوابة عند دخول الموقع</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
                  settings.enabled ? 'bg-[#3D5B4B]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    settings.enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Enter */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
              <div>
                <label className="text-base font-black text-[#2C2C2C]">الدخول التلقائي</label>
                <p className="text-sm text-[#2C2C2C]/60 mt-1">دخول تلقائي بعد العد التنازلي</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, auto_enter_enabled: !settings.auto_enter_enabled })}
                className={`relative w-16 h-8 rounded-full transition-all shadow-inner ${
                  settings.auto_enter_enabled ? 'bg-[#3D5B4B]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${
                    settings.auto_enter_enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Delay Slider */}
            {settings.auto_enter_enabled && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#F4EBDD] to-[#E8E1D3] border border-[#C89B3C]/20">
                <label className="flex items-center gap-2 text-base font-black text-[#2C2C2C] mb-3">
                  <Clock className="w-5 h-5 text-[#C89B3C]" />
                  وقت الانتظار: {settings.auto_enter_delay} ثانية
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={settings.auto_enter_delay}
                  onChange={(e) => setSettings({ ...settings, auto_enter_delay: Number(e.target.value) })}
                  className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer shadow-inner"
                  style={{
                    background: `linear-gradient(to right, #3D5B4B 0%, #3D5B4B ${((settings.auto_enter_delay - 2) / 8) * 100}%, #E8E1D3 ${((settings.auto_enter_delay - 2) / 8) * 100}%, #E8E1D3 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-[#2C2C2C]/60 mt-2 font-medium">
                  <span>2 ثانية</span>
                  <span>10 ثوانٍ</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Visual Effects */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#C89B3C]" />
              <h3 className="text-xl font-black text-[#2C2C2C]">التأثيرات البصرية</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Particle Density */}
            <div>
              <label className="text-base font-black text-[#2C2C2C] mb-3 block">كثافة الجزيئات</label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => setSettings({ ...settings, particle_density: density })}
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

            {/* Animation Speed */}
            <div>
              <label className="flex items-center gap-2 text-base font-black text-[#2C2C2C] mb-3">
                <Zap className="w-5 h-5 text-[#C89B3C]" />
                سرعة الحركة
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['slow', 'medium', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSettings({ ...settings, animation_speed: speed })}
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

            {/* Toggles */}
            <div className="space-y-3">
              {[
                { key: 'show_particles', label: 'عرض الجزيئات' },
                { key: 'show_animated_bg', label: 'الخلفية المتحركة' },
                { key: 'show_crown', label: 'عرض التاج' },
                { key: 'show_progress_bar', label: 'شريط التقدم' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[#F9F8F6] border border-[#E8E1D3]">
                  <label className="text-sm font-black text-[#2C2C2C]">{label}</label>
                  <button
                    onClick={() => setSettings({ ...settings, [key]: !settings[key as keyof GatewaySettings] })}
                    className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${
                      settings[key as keyof GatewaySettings] ? 'bg-[#3D5B4B]' : 'bg-gray-300'
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

        {/* Card 3: Text Settings */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E8E1D3] overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-[#F4EBDD] to-[#E8E1D3] p-6 border-b border-[#C89B3C]/20">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-[#C89B3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-black text-[#2C2C2C]">النصوص والمحتوى</h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الترحيبي الرئيسي</label>
              <input
                type="text"
                value={settings.welcome_text_ar}
                onChange={(e) => setSettings({ ...settings, welcome_text_ar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الفرعي</label>
              <input
                type="text"
                value={settings.subtitle_text_ar}
                onChange={(e) => setSettings({ ...settings, subtitle_text_ar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>

            <div>
              <label className="text-sm font-black text-[#2C2C2C] mb-2 block">النص الوصفي</label>
              <input
                type="text"
                value={settings.description_text_ar}
                onChange={(e) => setSettings({ ...settings, description_text_ar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#E8E1D3] rounded-xl focus:ring-2 focus:ring-[#C89B3C] focus:border-transparent bg-[#F9F8F6] text-[#2C2C2C] font-medium"
                dir="rtl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white px-8 py-5 rounded-xl font-black text-lg hover:shadow-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-3">
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
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
          onClick={resetSettings}
          className="px-8 py-5 rounded-xl font-black text-lg bg-white text-[#2C2C2C] hover:bg-[#F4EBDD] transition-all border-2 border-[#E8E1D3] shadow-lg"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6" />
            <span>إعادة تعيين</span>
          </div>
        </button>
      </div>

      {/* Preview Notice */}
      <div className="bg-gradient-to-r from-[#C89B3C]/10 to-[#D4AF37]/10 rounded-2xl p-6 border-2 border-[#C89B3C]/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#C89B3C]/20 rounded-xl">
            <Eye className="w-6 h-6 text-[#C89B3C]" />
          </div>
          <div>
            <h4 className="text-lg font-black text-[#2C2C2C] mb-2">معاينة التغييرات</h4>
            <p className="text-[#2C2C2C]/70 leading-relaxed">
              لرؤية التغييرات في البوابة الملكية، قم بحفظ الإعدادات ثم افتح المنصة العامة في نافذة جديدة أو امسح ذاكرة التخزين المؤقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
