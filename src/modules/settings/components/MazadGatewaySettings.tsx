import React, { useState, useEffect } from 'react';
import { Crown, Save, RotateCcw, Info, Zap, Clock, Eye, Timer, Sparkles, Circle, Layers, Film } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface MazadGatewaySettings {
  id?: string;
  enabled: boolean;
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_logo: boolean;
  fade_duration: number;
  animation_speed: 'slow' | 'normal' | 'fast';
  show_sparkles: boolean;
  show_particles: boolean;
  button_glow_enabled: boolean;
  show_progress_bar: boolean;
  background_pattern_enabled: boolean;
  title_animation_enabled: boolean;
  title_line1?: string;
  title_line2?: string;
  subtitle?: string;
  button_text?: string;
  show_title?: boolean;
  show_subtitle?: boolean;
}

export function MazadGatewaySettings() {
  const [settings, setSettings] = useState<MazadGatewaySettings>({
    enabled: true,
    auto_enter_enabled: true,
    auto_enter_delay: 3,
    show_logo: true,
    fade_duration: 400,
    animation_speed: 'normal',
    show_sparkles: true,
    show_particles: true,
    button_glow_enabled: true,
    show_progress_bar: true,
    background_pattern_enabled: true,
    title_animation_enabled: true,
    title_line1: 'بوابة مزاد',
    title_line2: '',
    subtitle: '',
    button_text: 'مزاد تملك النخيل و اشجار الزيتون',
    show_title: true,
    show_subtitle: true,
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

      console.log('🔵 بدء تحميل الإعدادات...');

      const { data, error } = await supabase
        .from('mazad_gateway_settings')
        .select('*')
        .eq('id', 'd06bd962-d0a4-411a-a510-7deedb987839')
        .single();

      if (error) {
        console.error('❌ خطأ في تحميل الإعدادات:', error);
        throw error;
      }

      console.log('✅ تم تحميل الإعدادات:', data);

      if (data) {
        setSettings(data);
        console.log('✅ تم تطبيق الإعدادات على الحالة');
      }
    } catch (error) {
      console.error('❌ فشل تحميل الإعدادات:', error);
      showMessage('error', 'فشل تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      console.log('🔵 بدء حفظ الإعدادات:', settings);

      const updateData = {
        enabled: settings.enabled,
        auto_enter_enabled: settings.auto_enter_enabled,
        auto_enter_delay: settings.auto_enter_delay,
        show_logo: settings.show_logo,
        fade_duration: settings.fade_duration,
        animation_speed: settings.animation_speed,
        show_sparkles: settings.show_sparkles,
        show_particles: settings.show_particles,
        button_glow_enabled: settings.button_glow_enabled,
        show_progress_bar: settings.show_progress_bar,
        background_pattern_enabled: settings.background_pattern_enabled,
        title_animation_enabled: settings.title_animation_enabled,
        title_line1: settings.title_line1 || '',
        title_line2: settings.title_line2 || '',
        subtitle: settings.subtitle || '',
        button_text: settings.button_text || '',
        show_title: settings.show_title !== undefined ? settings.show_title : true,
        show_subtitle: settings.show_subtitle !== undefined ? settings.show_subtitle : true,
        updated_at: new Date().toISOString(),
      };

      console.log('📤 البيانات للتحديث:', updateData);

      // التحديث المباشر
      const { data: updated, error: updateError } = await supabase
        .from('mazad_gateway_settings')
        .update(updateData)
        .eq('id', 'd06bd962-d0a4-411a-a510-7deedb987839')
        .select();

      if (updateError) {
        console.error('❌ خطأ في التحديث:', updateError);
        throw updateError;
      }

      console.log('✅ تم التحديث بنجاح:', updated);

      showMessage('success', '✅ تم حفظ الإعدادات بنجاح!');

      // تحديث الحالة المحلية
      await loadSettings();
    } catch (error) {
      console.error('❌ فشل الحفظ:', error);
      showMessage('error', 'فشل حفظ الإعدادات: ' + (error as Error).message);
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
      fade_duration: 400,
      animation_speed: 'normal',
      show_sparkles: true,
      show_particles: true,
      button_glow_enabled: true,
      show_progress_bar: true,
      background_pattern_enabled: true,
      title_animation_enabled: true,
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
      {/* إشعار: البوابة تم استبدالها */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl border-2 border-blue-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">تم تحديث نظام التحميل</h3>
            <p className="text-white/90 text-base leading-relaxed mb-3">
              تم استبدال البوابة القديمة بـ <strong>شاشة تحميل مبتكرة ورسمية</strong> تظهر تلقائياً عند فتح المنصة.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="text-white/90 mb-1">✨ <strong>الشاشة الجديدة تتضمن:</strong></p>
              <ul className="text-white/80 space-y-1 mr-6">
                <li>• شعار ديناميكي مع sparkles متحركة</li>
                <li>• شريط تقدم متطور يعرض النسبة المئوية</li>
                <li>• نصوص توضيحية تتغير حسب مرحلة التحميل</li>
                <li>• تصميم احترافي مع animations سلسة</li>
              </ul>
            </div>
            <p className="text-white/70 text-xs mt-3">
              💡 هذه الإعدادات القديمة متاحة للمراجعة فقط ولن تؤثر على شاشة التحميل الجديدة
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-8 text-white opacity-60">
        <div className="flex items-center gap-4 mb-2">
          <Crown className="w-10 h-10" />
          <h2 className="text-3xl font-black">إعدادات بوابة مزاد المتقدمة (قديمة)</h2>
        </div>
        <p className="text-white/80 text-lg">تم استبدالها بشاشة تحميل مبتكرة</p>
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
        {/* Column 1: Basic Settings */}
        <div className="space-y-6">
          {/* Enable Gateway */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-xl mb-4 text-gray-900">الإعدادات الأساسية</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">تفعيل البوابة</h4>
                    <p className="text-sm text-gray-600">عرض البوابة عند فتح المنصة</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-gray-400"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">الدخول التلقائي</h4>
                    <p className="text-sm text-gray-600">الانتقال للمنصة تلقائياً</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <input
                    type="checkbox"
                    checked={settings.auto_enter_enabled}
                    disabled
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-gray-400"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Timing Settings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
              <Timer className="w-6 h-6" />
              إعدادات التوقيت
            </h3>

            <div className="space-y-6">
              {/* Auto Enter Delay */}
              {settings.auto_enter_enabled && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block mb-3">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      مدة الانتظار (بالثواني)
                    </span>
                    <span className="text-sm text-gray-600 block mt-1">
                      المدة قبل الانتقال التلقائي للمنصة (1-30 ثانية)
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={settings.auto_enter_delay}
                      onChange={(e) => setSettings({ ...settings, auto_enter_delay: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="w-20 h-12 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600">{settings.auto_enter_delay}ث</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fade Duration */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <label className="block mb-3">
                  <span className="font-bold text-gray-900 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    مدة الظهور/الاختفاء (ميلي ثانية)
                  </span>
                  <span className="text-sm text-gray-600 block mt-1">
                    سرعة ظهور واختفاء البوابة (100-2000ms)
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={settings.fade_duration}
                    onChange={(e) => setSettings({ ...settings, fade_duration: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="w-24 h-12 bg-white rounded-lg border-2 border-purple-300 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">{settings.fade_duration}ms</span>
                  </div>
                </div>
              </div>

              {/* Animation Speed */}
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <label className="block mb-3">
                  <span className="font-bold text-gray-900 flex items-center gap-2">
                    <Film className="w-5 h-5" />
                    سرعة الأنيميشن
                  </span>
                  <span className="text-sm text-gray-600 block mt-1">
                    سرعة حركة التاج والعناصر
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['slow', 'normal', 'fast'] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSettings({ ...settings, animation_speed: speed })}
                      className={`p-3 rounded-xl font-bold transition-all ${
                        settings.animation_speed === speed
                          ? 'bg-orange-600 text-white scale-105'
                          : 'bg-white text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      {speed === 'slow' ? 'بطيء' : speed === 'fast' ? 'سريع' : 'عادي'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Visual Effects */}
        <div className="space-y-6">
          {/* Visual Elements */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6" />
              العناصر المرئية
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">عرض شعار التاج</h4>
                    <p className="text-sm text-gray-600">إظهار التاج الأخضر</p>
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

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">عرض Sparkles</h4>
                    <p className="text-sm text-gray-600">النقاط المتلألئة حول التاج</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_sparkles}
                    onChange={(e) => setSettings({ ...settings, show_sparkles: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Circle className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">الجزيئات المتحركة</h4>
                    <p className="text-sm text-gray-600">الدوائر الخلفية المتحركة</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_particles}
                    onChange={(e) => setSettings({ ...settings, show_particles: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">نمط الخلفية</h4>
                    <p className="text-sm text-gray-600">النقاط المنقطة في الخلفية</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.background_pattern_enabled}
                    onChange={(e) => setSettings({ ...settings, background_pattern_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Button & Animation Effects */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              مؤثرات الزر والعنوان
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">توهج الزر</h4>
                    <p className="text-sm text-gray-600">التأثير الضوئي عند hover</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.button_glow_enabled}
                    onChange={(e) => setSettings({ ...settings, button_glow_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">شريط التقدم</h4>
                    <p className="text-sm text-gray-600">الشريط السفلي للعد التنازلي</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.show_progress_bar}
                    onChange={(e) => setSettings({ ...settings, show_progress_bar: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-cyan-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Film className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">أنيميشن العنوان</h4>
                    <p className="text-sm text-gray-600">حركة ظهور العنوان والنص</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.title_animation_enabled}
                    onChange={(e) => setSettings({ ...settings, title_animation_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                              peer-checked:after:translate-x-full peer-checked:after:border-white
                              after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                              after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                              peer-checked:bg-violet-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-bold">معلومات مهمة:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>التوقيت الآن يعمل بدقة - جرب تغيير مدة الانتظار من 1 إلى 30 ثانية</li>
              <li>مدة الظهور/الاختفاء تتحكم في سرعة fade البوابة (100-2000ms)</li>
              <li>سرعة الأنيميشن تؤثر على حركة التاج والعناصر</li>
              <li>يمكنك تشغيل/إيقاف أي مؤثر بشكل منفصل</li>
              <li>التغييرات تُطبق فوراً في الزيارة القادمة</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                   bg-gray-400 text-white
                   rounded-xl font-bold text-lg
                   opacity-50 cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          حفظ جميع الإعدادات (معطل)
        </button>

        <button
          disabled
          className="px-6 py-4 bg-gray-300 text-gray-600 rounded-xl font-bold
                   opacity-50 cursor-not-allowed flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          استعادة الافتراضي (معطل)
        </button>
      </div>

      {/* ملاحظة نهائية */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
        <p className="text-yellow-800 font-bold text-sm">
          ⚠️ هذه الإعدادات القديمة للمراجعة فقط - شاشة التحميل الجديدة نشطة تلقائياً
        </p>
      </div>
    </div>
  );
}
