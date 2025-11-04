import React, { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw, Info, Sparkles, Clock, Type, Palette, Zap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoaderSettings {
  id?: string;
  enabled: boolean;
  show_logo: boolean;
  show_sparkles: boolean;
  show_progress_bar: boolean;
  show_percentage: boolean;
  show_dynamic_texts: boolean;
  animation_speed: 'slow' | 'normal' | 'fast';
  fade_duration: number;
  min_display_time: number;
  // النصوص
  main_title: string;
  main_title_en: string;
  subtitle: string;
  subtitle_en: string;
  loading_text_1: string;
  loading_text_2: string;
  loading_text_3: string;
  loading_text_4: string;
  loading_text_5: string;
  // الألوان
  background_color_from: string;
  background_color_to: string;
  text_color: string;
  progress_bar_color: string;
  sparkle_color: string;
}

export function LoaderSettings() {
  const [settings, setSettings] = useState<LoaderSettings>({
    enabled: true,
    show_logo: true,
    show_sparkles: true,
    show_progress_bar: true,
    show_percentage: true,
    show_dynamic_texts: true,
    animation_speed: 'normal',
    fade_duration: 600,
    min_display_time: 1500,
    // النصوص
    main_title: 'منصة الحبر',
    main_title_en: 'Palm & Olive Platform',
    subtitle: 'منصة بيع أشجار النخيل والزيتون',
    subtitle_en: 'Palm & Olive Trees Marketplace',
    loading_text_1: 'جاري تحضير المنصة...',
    loading_text_2: 'تحميل المزارع المتاحة...',
    loading_text_3: 'تجهيز البيانات...',
    loading_text_4: 'اللمسات الأخيرة...',
    loading_text_5: 'جاهز!',
    // الألوان
    background_color_from: '#064E3B',
    background_color_to: '#047857',
    text_color: '#FFFFFF',
    progress_bar_color: '#10B981',
    sparkle_color: '#FCD34D',
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
        .from('loader_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('فشل تحميل الإعدادات:', error);
      showMessage('error', 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('loader_settings')
        .upsert(settings);

      if (error) throw error;

      showMessage('success', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('فشل حفظ الإعدادات:', error);
      showMessage('error', 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      enabled: true,
      show_logo: true,
      show_sparkles: true,
      show_progress_bar: true,
      show_percentage: true,
      show_dynamic_texts: true,
      animation_speed: 'normal',
      fade_duration: 600,
      min_display_time: 1500,
      main_title: 'منصة الحبر',
      main_title_en: 'Palm & Olive Platform',
      subtitle: 'منصة بيع أشجار النخيل والزيتون',
      subtitle_en: 'Palm & Olive Trees Marketplace',
      loading_text_1: 'جاري تحضير المنصة...',
      loading_text_2: 'تحميل المزارع المتاحة...',
      loading_text_3: 'تجهيز البيانات...',
      loading_text_4: 'اللمسات الأخيرة...',
      loading_text_5: 'جاهز!',
      background_color_from: '#064E3B',
      background_color_to: '#047857',
      text_color: '#FFFFFF',
      progress_bar_color: '#10B981',
      sparkle_color: '#FCD34D',
    });
    showMessage('success', 'تم استعادة الإعدادات الافتراضية');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <Loader2 className="w-10 h-10" />
          <h2 className="text-3xl font-black">شاشة تحميل منصة الحبر</h2>
        </div>
        <p className="text-white/80 text-lg">التحكم الكامل في شاشة التحميل المبتكرة</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`p-4 rounded-xl font-bold ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
              : 'bg-red-50 text-red-700 border-2 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الإعدادات الأساسية */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6" />
            الإعدادات الأساسية
          </h3>

          <div className="space-y-4">
            <ToggleSetting
              icon={<Loader2 className="w-6 h-6 text-emerald-600" />}
              title="تفعيل شاشة التحميل"
              description="عرض الشاشة عند فتح المنصة"
              checked={settings.enabled}
              onChange={(checked) => setSettings({ ...settings, enabled: checked })}
              color="emerald"
            />

            <ToggleSetting
              icon={<Sparkles className="w-6 h-6 text-yellow-600" />}
              title="Sparkles متحركة"
              description="النجوم المتلألئة حول الشعار"
              checked={settings.show_sparkles}
              onChange={(checked) => setSettings({ ...settings, show_sparkles: checked })}
              color="yellow"
            />

            <ToggleSetting
              icon={<div className="w-6 h-6 bg-blue-600 rounded" />}
              title="شريط التقدم"
              description="عرض شريط التحميل"
              checked={settings.show_progress_bar}
              onChange={(checked) => setSettings({ ...settings, show_progress_bar: checked })}
              color="blue"
            />

            <ToggleSetting
              icon={<Type className="w-6 h-6 text-purple-600" />}
              title="النصوص الديناميكية"
              description="النصوص المتغيرة أثناء التحميل"
              checked={settings.show_dynamic_texts}
              onChange={(checked) => setSettings({ ...settings, show_dynamic_texts: checked })}
              color="purple"
            />
          </div>
        </div>

        {/* إعدادات التوقيت */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            إعدادات التوقيت
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الحد الأدنى للعرض (ميلي ثانية)
              </label>
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={settings.min_display_time}
                onChange={(e) => setSettings({ ...settings, min_display_time: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">الوقت: {settings.min_display_time}ms ({(settings.min_display_time / 1000).toFixed(1)}s)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                مدة الـ Fade Out (ميلي ثانية)
              </label>
              <input
                type="number"
                min="200"
                max="2000"
                step="100"
                value={settings.fade_duration}
                onChange={(e) => setSettings({ ...settings, fade_duration: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">الوقت: {settings.fade_duration}ms ({(settings.fade_duration / 1000).toFixed(1)}s)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                سرعة الأنيميشن
              </label>
              <select
                value={settings.animation_speed}
                onChange={(e) => setSettings({ ...settings, animation_speed: e.target.value as 'slow' | 'normal' | 'fast' })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="slow">بطيء</option>
                <option value="normal">عادي</option>
                <option value="fast">سريع</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* النصوص */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
          <Type className="w-6 h-6" />
          إدارة النصوص
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              العنوان الرئيسي (عربي)
            </label>
            <input
              type="text"
              value={settings.main_title}
              onChange={(e) => setSettings({ ...settings, main_title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              placeholder="منصة الحبر"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              العنوان الرئيسي (English)
            </label>
            <input
              type="text"
              value={settings.main_title_en}
              onChange={(e) => setSettings({ ...settings, main_title_en: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              placeholder="Palm & Olive Platform"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              العنوان الفرعي (عربي)
            </label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              placeholder="منصة بيع أشجار النخيل والزيتون"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              العنوان الفرعي (English)
            </label>
            <input
              type="text"
              value={settings.subtitle_en}
              onChange={(e) => setSettings({ ...settings, subtitle_en: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
              placeholder="Palm & Olive Trees Marketplace"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              نصوص التحميل (5 مراحل)
            </label>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <input
                  key={num}
                  type="text"
                  value={settings[`loading_text_${num}` as keyof LoaderSettings] as string}
                  onChange={(e) => setSettings({ ...settings, [`loading_text_${num}`]: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none"
                  placeholder={`النص ${num}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* الألوان */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
          <Palette className="w-6 h-6" />
          الألوان
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ColorPicker
            label="لون الخلفية (من)"
            value={settings.background_color_from}
            onChange={(color) => setSettings({ ...settings, background_color_from: color })}
          />
          <ColorPicker
            label="لون الخلفية (إلى)"
            value={settings.background_color_to}
            onChange={(color) => setSettings({ ...settings, background_color_to: color })}
          />
          <ColorPicker
            label="لون النص"
            value={settings.text_color}
            onChange={(color) => setSettings({ ...settings, text_color: color })}
          />
          <ColorPicker
            label="لون شريط التقدم"
            value={settings.progress_bar_color}
            onChange={(color) => setSettings({ ...settings, progress_bar_color: color })}
          />
          <ColorPicker
            label="لون Sparkles"
            value={settings.sparkle_color}
            onChange={(color) => setSettings({ ...settings, sparkle_color: color })}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                   bg-gradient-to-r from-emerald-600 to-green-600 text-white
                   rounded-xl font-bold text-lg hover:shadow-lg transition-all
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
              حفظ جميع الإعدادات
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

// Helper Components
function ToggleSetting({
  icon,
  title,
  description,
  checked,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}) {
  const colorClasses = {
    emerald: 'peer-checked:bg-emerald-600',
    yellow: 'peer-checked:bg-yellow-600',
    blue: 'peer-checked:bg-blue-600',
    purple: 'peer-checked:bg-purple-600',
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className={`w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                    peer-checked:after:translate-x-full peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                    after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                    ${colorClasses[color as keyof typeof colorClasses]}`}></div>
      </label>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-12 rounded-xl cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none font-mono text-sm"
        />
      </div>
    </div>
  );
}
