import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Crown, Eye, EyeOff, RefreshCw, Save, Palette, Type, Clock, Zap } from 'lucide-react';
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
  main_title: string;
  main_title_en: string;
  subtitle: string;
  subtitle_en: string;
  loading_text_1: string;
  loading_text_2: string;
  loading_text_3: string;
  loading_text_4: string;
  loading_text_5: string;
  background_color_from: string;
  background_color_to: string;
  text_color: string;
  progress_bar_color: string;
  sparkle_color: string;
}

export function InnovativeGatewayLoader() {
  const [settings, setSettings] = useState<LoaderSettings>({
    enabled: true,
    show_logo: true,
    show_sparkles: true,
    show_progress_bar: true,
    show_percentage: true,
    show_dynamic_texts: true,
    animation_speed: 'normal',
    fade_duration: 400,
    min_display_time: 2000,
    main_title: 'مزاد',
    main_title_en: 'Mazad',
    subtitle: 'منصة استثمار زراعي متطورة',
    subtitle_en: 'Advanced Agricultural Investment Platform',
    loading_text_1: 'جاري تحميل المزارع...',
    loading_text_2: 'جاري تجهيز البيانات...',
    loading_text_3: 'جاري التحقق من الاتصال...',
    loading_text_4: 'جاري تحميل الواجهة...',
    loading_text_5: 'تقريباً انتهينا...',
    background_color_from: '#10b981',
    background_color_to: '#059669',
    text_color: '#ffffff',
    progress_bar_color: '#fbbf24',
    sparkle_color: '#fbbf24',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'appearance' | 'texts' | 'colors' | 'timing'>('appearance');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('loader_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading loader settings:', error);
      showMessage('error', 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('loader_settings')
        .upsert({
          ...settings,
          id: settings.id || 'cbac8275-1a77-4659-961d-c1b403bbdbd5',
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      showMessage('success', '✅ تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving loader settings:', error);
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-emerald-900">
              🎨 إعدادات بوابة التحميل
            </h2>
            <p className="text-emerald-700 mt-1">
              تحكم كامل في شاشة التحميل المبتكرة للمنصة
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">الحالة</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {settings.enabled ? 'مفعّل' : 'معطّل'}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">السرعة</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {settings.animation_speed === 'slow' ? 'بطيء' : settings.animation_speed === 'fast' ? 'سريع' : 'عادي'}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">المدة الدنيا</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {settings.min_display_time / 1000}ث
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">التأثيرات</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {[settings.show_sparkles, settings.show_logo, settings.show_progress_bar].filter(Boolean).length}/3
            </p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSection('appearance')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeSection === 'appearance'
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-emerald-50 border-2 border-emerald-200'
          }`}
        >
          <Eye className="h-5 w-5" />
          المظهر والتأثيرات
        </button>
        <button
          onClick={() => setActiveSection('texts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeSection === 'texts'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-blue-50 border-2 border-blue-200'
          }`}
        >
          <Type className="h-5 w-5" />
          النصوص والعناوين
        </button>
        <button
          onClick={() => setActiveSection('colors')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeSection === 'colors'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-purple-50 border-2 border-purple-200'
          }`}
        >
          <Palette className="h-5 w-5" />
          الألوان والتدرجات
        </button>
        <button
          onClick={() => setActiveSection('timing')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeSection === 'timing'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-700 hover:bg-orange-50 border-2 border-orange-200'
          }`}
        >
          <Clock className="h-5 w-5" />
          التوقيت والسرعة
        </button>
      </div>

      {/* Appearance Section */}
      {activeSection === 'appearance' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200 space-y-6">
          <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2 mb-4">
            <Eye className="h-6 w-6" />
            المظهر والتأثيرات المرئية
          </h3>

          {/* Enable Loader */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              {settings.enabled ? (
                <Eye className="h-6 w-6 text-emerald-600" />
              ) : (
                <EyeOff className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <p className="font-bold text-gray-900">تفعيل شاشة التحميل</p>
                <p className="text-sm text-gray-600">إظهار الشاشة عند تحميل المنصة</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Show Logo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">إظهار اللوجو</p>
                  <p className="text-sm text-gray-600">أيقونة التاج</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.show_logo}
                onChange={(e) => setSettings({ ...settings, show_logo: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>

            {/* Show Sparkles */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">إظهار البريق</p>
                  <p className="text-sm text-gray-600">تأثيرات متلألئة</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.show_sparkles}
                onChange={(e) => setSettings({ ...settings, show_sparkles: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>

            {/* Show Progress Bar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gradient-to-r from-emerald-600 to-green-600 rounded"></div>
                <div>
                  <p className="font-medium text-gray-900">شريط التقدم</p>
                  <p className="text-sm text-gray-600">مؤشر التحميل</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.show_progress_bar}
                onChange={(e) => setSettings({ ...settings, show_progress_bar: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>

            {/* Show Percentage */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-emerald-600">%</div>
                <div>
                  <p className="font-medium text-gray-900">إظهار النسبة</p>
                  <p className="text-sm text-gray-600">نسبة التحميل</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.show_percentage}
                onChange={(e) => setSettings({ ...settings, show_percentage: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>

            {/* Show Dynamic Texts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 md:col-span-2">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">النصوص الديناميكية</p>
                  <p className="text-sm text-gray-600">رسائل التحميل المتغيرة</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.show_dynamic_texts}
                onChange={(e) => setSettings({ ...settings, show_dynamic_texts: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Texts Section */}
      {activeSection === 'texts' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 space-y-6">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2 mb-4">
            <Type className="h-6 w-6" />
            النصوص والعناوين
          </h3>

          <div className="space-y-4">
            {/* Main Title Arabic */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العنوان الرئيسي (عربي)
              </label>
              <input
                type="text"
                value={settings.main_title}
                onChange={(e) => setSettings({ ...settings, main_title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-right font-bold text-lg"
                placeholder="مزاد"
              />
            </div>

            {/* Main Title English */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العنوان الرئيسي (English)
              </label>
              <input
                type="text"
                value={settings.main_title_en}
                onChange={(e) => setSettings({ ...settings, main_title_en: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-left font-bold text-lg"
                placeholder="Mazad"
                dir="ltr"
              />
            </div>

            {/* Subtitle Arabic */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العنوان الفرعي (عربي)
              </label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-right"
                placeholder="منصة استثمار زراعي متطورة"
              />
            </div>

            {/* Subtitle English */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العنوان الفرعي (English)
              </label>
              <input
                type="text"
                value={settings.subtitle_en}
                onChange={(e) => setSettings({ ...settings, subtitle_en: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-left"
                placeholder="Advanced Agricultural Investment Platform"
                dir="ltr"
              />
            </div>

            {/* Loading Texts */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <p className="font-bold text-blue-900 mb-3">نصوص التحميل الديناميكية:</p>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <input
                    key={num}
                    type="text"
                    value={settings[`loading_text_${num}` as keyof LoaderSettings] as string}
                    onChange={(e) => setSettings({ ...settings, [`loading_text_${num}`]: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-right text-sm"
                    placeholder={`نص التحميل ${num}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 space-y-6">
          <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2 mb-4">
            <Palette className="h-6 w-6" />
            الألوان والتدرجات
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Background Gradient Start */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                لون الخلفية (بداية التدرج)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.background_color_from}
                  onChange={(e) => setSettings({ ...settings, background_color_from: e.target.value })}
                  className="h-12 w-20 rounded-xl cursor-pointer border-2 border-purple-200"
                />
                <input
                  type="text"
                  value={settings.background_color_from}
                  onChange={(e) => setSettings({ ...settings, background_color_from: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 font-mono"
                  placeholder="#10b981"
                />
              </div>
            </div>

            {/* Background Gradient End */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                لون الخلفية (نهاية التدرج)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.background_color_to}
                  onChange={(e) => setSettings({ ...settings, background_color_to: e.target.value })}
                  className="h-12 w-20 rounded-xl cursor-pointer border-2 border-purple-200"
                />
                <input
                  type="text"
                  value={settings.background_color_to}
                  onChange={(e) => setSettings({ ...settings, background_color_to: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 font-mono"
                  placeholder="#059669"
                />
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                لون النصوص
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.text_color}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="h-12 w-20 rounded-xl cursor-pointer border-2 border-purple-200"
                />
                <input
                  type="text"
                  value={settings.text_color}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 font-mono"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Progress Bar Color */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                لون شريط التقدم
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.progress_bar_color}
                  onChange={(e) => setSettings({ ...settings, progress_bar_color: e.target.value })}
                  className="h-12 w-20 rounded-xl cursor-pointer border-2 border-purple-200"
                />
                <input
                  type="text"
                  value={settings.progress_bar_color}
                  onChange={(e) => setSettings({ ...settings, progress_bar_color: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 font-mono"
                  placeholder="#fbbf24"
                />
              </div>
            </div>

            {/* Sparkle Color */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                لون البريق والتأثيرات
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.sparkle_color}
                  onChange={(e) => setSettings({ ...settings, sparkle_color: e.target.value })}
                  className="h-12 w-20 rounded-xl cursor-pointer border-2 border-purple-200"
                />
                <input
                  type="text"
                  value={settings.sparkle_color}
                  onChange={(e) => setSettings({ ...settings, sparkle_color: e.target.value })}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 font-mono"
                  placeholder="#fbbf24"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-8 rounded-2xl border-2 border-purple-300"
               style={{
                 background: `linear-gradient(135deg, ${settings.background_color_from}, ${settings.background_color_to})`
               }}>
            <div className="text-center">
              <p className="text-3xl font-black mb-2" style={{ color: settings.text_color }}>
                {settings.main_title}
              </p>
              <p className="text-lg" style={{ color: settings.text_color }}>
                {settings.subtitle}
              </p>
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: settings.progress_bar_color }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timing Section */}
      {activeSection === 'timing' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 space-y-6">
          <h3 className="text-xl font-bold text-orange-900 flex items-center gap-2 mb-4">
            <Clock className="h-6 w-6" />
            التوقيت والسرعة
          </h3>

          <div className="space-y-6">
            {/* Animation Speed */}
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                سرعة الحركة
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'slow', label: 'بطيء', icon: '🐢' },
                  { value: 'normal', label: 'عادي', icon: '🚶' },
                  { value: 'fast', label: 'سريع', icon: '🏃' }
                ].map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => setSettings({ ...settings, animation_speed: speed.value as any })}
                    className={`p-4 rounded-xl font-bold transition-all ${
                      settings.animation_speed === speed.value
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-orange-200 hover:border-orange-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{speed.icon}</div>
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fade Duration */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                مدة التلاشي (ميلي ثانية): {settings.fade_duration}ms
              </label>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={settings.fade_duration}
                onChange={(e) => setSettings({ ...settings, fade_duration: parseInt(e.target.value) })}
                className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>200ms (سريع)</span>
                <span>1000ms (بطيء)</span>
              </div>
            </div>

            {/* Min Display Time */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الحد الأدنى للعرض (ميلي ثانية): {settings.min_display_time}ms ({settings.min_display_time / 1000}ث)
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={settings.min_display_time}
                onChange={(e) => setSettings({ ...settings, min_display_time: parseInt(e.target.value) })}
                className="w-full h-3 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5ث (سريع جداً)</span>
                <span>5ث (بطيء)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              حفظ جميع الإعدادات
            </>
          )}
        </button>

        <button
          onClick={loadSettings}
          className="px-6 py-4 rounded-xl font-bold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          إعادة تحميل
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-bold text-center">{message.text}</p>
        </div>
      )}
    </div>
  );
}
