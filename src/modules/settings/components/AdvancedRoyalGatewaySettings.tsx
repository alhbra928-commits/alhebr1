import React, { useState, useEffect } from 'react';
import {
  Save, RefreshCw, Eye, EyeOff, Settings, Sparkles,
  Clock, Palette, Type, Zap, ArrowRight, Activity,
  Layers, Star, Circle, Wind, Sun, Moon, Check, X
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewaySettings {
  id?: string;
  enabled: boolean;
  auto_enter_delay: number;
  gateway_reappear_duration: number;
  enable_repeated_gateway: boolean;
  theme_style: 'green' | 'gold' | 'elegant';
  particle_count: number;
  particle_speed: number;
  particle_size: number;
  blur_amount: number;
  animation_duration: number;
  show_logo: boolean;
  main_title: string;
  subtitle: string;
  button_text: string;
  created_at?: string;
  updated_at?: string;
}

export function AdvancedRoyalGatewaySettings() {
  const [settings, setSettings] = useState<GatewaySettings>({
    enabled: true,
    auto_enter_delay: 5,
    gateway_reappear_duration: 1800, // 30 دقيقة بالثواني
    enable_repeated_gateway: false,
    theme_style: 'green',
    particle_count: 50,
    particle_speed: 2,
    particle_size: 3,
    blur_amount: 10,
    animation_duration: 3,
    show_logo: true,
    main_title: 'منصة النخيل والزيتون',
    subtitle: 'استثمار زراعي مستدام',
    button_text: 'ادخل إلى المنصة',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'content' | 'advanced'>('general');
  const [previewMode, setPreviewMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('royal_gateway_settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading gateway settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const settingsData = {
        ...settings,
        updated_at: new Date().toISOString(),
      };

      if (settings.id) {
        const { error } = await supabase
          .from('royal_gateway_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('royal_gateway_settings')
          .insert([settingsData])
          .select()
          .single();

        if (error) throw error;
        if (data) setSettings(data);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving gateway settings:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('هل أنت متأكد من استعادة الإعدادات الافتراضية؟')) {
      setSettings({
        ...settings,
        enabled: true,
        auto_enter_delay: 5,
        theme_style: 'green',
        particle_count: 50,
        particle_speed: 2,
        particle_size: 3,
        blur_amount: 10,
        animation_duration: 3,
        show_logo: true,
        main_title: 'منصة النخيل والزيتون',
        subtitle: 'استثمار زراعي مستدام',
        button_text: 'ادخل إلى المنصة',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <RefreshCw className="w-16 h-16 text-emerald-600 animate-spin" />
          <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-xl font-bold text-gray-700">جاري تحميل إعدادات البوابة...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'visual', label: 'بصري', icon: Palette },
    { id: 'content', label: 'المحتوى', icon: Type },
    { id: 'advanced', label: 'متقدم', icon: Zap },
  ];

  return (
    <div className="min-h-screen pb-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Check className="w-6 h-6" />
            <span className="font-bold text-lg">تم حفظ الإعدادات بنجاح!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 rounded-3xl p-8 shadow-2xl mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-full shadow-xl">
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                البوابة الملكية الخضراء
              </h1>
              <p className="text-emerald-50 text-lg font-medium">
                التحكم الكامل في تجربة الدخول للمنصة
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg hover:scale-105"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="font-semibold">رجوع</span>
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg hover:scale-105"
            >
              {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span className="font-semibold">{previewMode ? 'إخفاء' : 'معاينة'}</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Activity className={`w-6 h-6 ${settings.enabled ? 'text-emerald-200' : 'text-red-200'}`} />
              <div>
                <p className="text-emerald-100 text-sm">الحالة</p>
                <p className="text-white text-xl font-black">{settings.enabled ? 'مفعّل' : 'معطّل'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-200" />
              <div>
                <p className="text-emerald-100 text-sm">وقت الدخول</p>
                <p className="text-white text-xl font-black">{settings.auto_enter_delay}ث</p>
              </div>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-200" />
              <div>
                <p className="text-emerald-100 text-sm">الجزيئات</p>
                <p className="text-white text-xl font-black">{settings.particle_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-purple-200" />
              <div>
                <p className="text-emerald-100 text-sm">السمة</p>
                <p className="text-white text-xl font-black">
                  {settings.theme_style === 'green' ? 'أخضر' : settings.theme_style === 'gold' ? 'ذهبي' : 'أنيق'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:scale-105 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enable/Disable */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">تفعيل البوابة</h3>
                  <p className="text-gray-600">تشغيل أو إيقاف البوابة الملكية</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${settings.enabled ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {settings.enabled ? (
                      <Check className={`w-6 h-6 text-emerald-600`} />
                    ) : (
                      <X className={`w-6 h-6 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {settings.enabled ? 'البوابة مفعّلة' : 'البوابة معطّلة'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {settings.enabled ? 'الزوار يرون البوابة عند الدخول' : 'الزوار يدخلون مباشرة للمنصة'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`relative w-20 h-10 rounded-full transition-all shadow-inner ${
                    settings.enabled ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg transition-all ${
                      settings.enabled ? 'right-1' : 'right-11'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Auto Enter Delay */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">مدة البقاء</h3>
                  <p className="text-gray-600">الوقت قبل الدخول التلقائي</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">المدة:</span>
                  <span className="text-4xl font-black text-emerald-600">{settings.auto_enter_delay}ث</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.auto_enter_delay}
                  onChange={(e) => setSettings({ ...settings, auto_enter_delay: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full bg-gradient-to-r from-emerald-200 to-green-200 appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(settings.auto_enter_delay / 30) * 100}%, #e5e7eb ${(settings.auto_enter_delay / 30) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>فوري (0ث)</span>
                  <span>30 ثانية</span>
                </div>
              </div>
            </div>

            {/* Enable Repeated Gateway Toggle */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 bg-gradient-to-br rounded-2xl shadow-lg transition-all ${
                    settings.enable_repeated_gateway
                      ? 'from-red-400 to-orange-500'
                      : 'from-gray-300 to-gray-400'
                  }`}>
                    <RefreshCw className={`w-7 h-7 text-white ${settings.enable_repeated_gateway ? 'animate-spin-slow' : ''}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">الظهور المتكرر للبوابة</h3>
                    <p className="text-gray-600">
                      {settings.enable_repeated_gateway
                        ? 'البوابة تظهر في كل تحديث للصفحة (∞)'
                        : 'البوابة تظهر حسب المدة المحددة'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    enable_repeated_gateway: !settings.enable_repeated_gateway,
                    gateway_reappear_duration: !settings.enable_repeated_gateway ? 0 : 3600
                  })}
                  className={`relative inline-flex h-14 w-28 items-center rounded-full transition-all duration-300 ${
                    settings.enable_repeated_gateway
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/50'
                      : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-xl transition-transform duration-300 ${
                      settings.enable_repeated_gateway ? 'translate-x-16' : 'translate-x-2'
                    }`}
                  >
                    {settings.enable_repeated_gateway ? (
                      <Check className="w-10 h-10 text-red-600 p-2" />
                    ) : (
                      <X className="w-10 h-10 text-gray-400 p-2" />
                    )}
                  </span>
                </button>
              </div>

              {settings.enable_repeated_gateway && (
                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 animate-pulse-slow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500 rounded-lg mt-0.5">
                      <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900 mb-1">⚠️ وضع الظهور المتكرر مفعّل</p>
                      <p className="text-red-700 text-sm">
                        البوابة ستظهر في كل مرة يحدث المستخدم الصفحة أو يزور المنصة.
                        هذا الوضع مناسب للحملات التسويقية المكثفة فقط.
                        قد يزعج المستخدمين عند الاستخدام الدائم.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gateway Reappear Duration */}
            {!settings.enable_repeated_gateway && (
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 lg:col-span-2">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">مدة إعادة ظهور البوابة</h3>
                    <p className="text-gray-600">متى تظهر البوابة مرة أخرى عند التحديث أو الزيارة الجديدة</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, gateway_reappear_duration: 1800 })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.gateway_reappear_duration === 1800
                      ? 'border-orange-500 bg-orange-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="text-center">
                    <Clock className={`w-12 h-12 mx-auto mb-3 ${
                      settings.gateway_reappear_duration === 1800 ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                    <p className="font-black text-2xl text-gray-900 mb-1">30</p>
                    <p className="text-sm font-bold text-gray-600">دقيقة</p>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, gateway_reappear_duration: 3600 })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.gateway_reappear_duration === 3600
                      ? 'border-blue-500 bg-blue-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <Clock className={`w-12 h-12 mx-auto mb-3 ${
                      settings.gateway_reappear_duration === 3600 ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-black text-2xl text-gray-900 mb-1">1</p>
                    <p className="text-sm font-bold text-gray-600">ساعة</p>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, gateway_reappear_duration: 21600 })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.gateway_reappear_duration === 21600
                      ? 'border-purple-500 bg-purple-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <Clock className={`w-12 h-12 mx-auto mb-3 ${
                      settings.gateway_reappear_duration === 21600 ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <p className="font-black text-2xl text-gray-900 mb-1">6</p>
                    <p className="text-sm font-bold text-gray-600">ساعات</p>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, gateway_reappear_duration: 86400 })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.gateway_reappear_duration === 86400
                      ? 'border-green-500 bg-green-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <div className="text-center">
                    <Clock className={`w-12 h-12 mx-auto mb-3 ${
                      settings.gateway_reappear_duration === 86400 ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className="font-black text-2xl text-gray-900 mb-1">24</p>
                    <p className="text-sm font-bold text-gray-600">ساعة</p>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg mt-0.5">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 mb-1">المدة المختارة:</p>
                    <p className="text-gray-700">
                      {settings.gateway_reappear_duration === 1800 && 'البوابة تظهر مرة أخرى بعد 30 دقيقة من آخر زيارة'}
                      {settings.gateway_reappear_duration === 3600 && 'البوابة تظهر مرة أخرى بعد ساعة واحدة من آخر زيارة'}
                      {settings.gateway_reappear_duration === 21600 && 'البوابة تظهر مرة أخرى بعد 6 ساعات من آخر زيارة'}
                      {settings.gateway_reappear_duration === 86400 && 'البوابة تظهر مرة أخرى بعد 24 ساعة (يوم كامل) من آخر زيارة'}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Theme Style */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 lg:col-span-2">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg">
                  <Palette className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">سمة التصميم</h3>
                  <p className="text-gray-600">اختر النمط البصري للبوابة</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <button
                  onClick={() => setSettings({ ...settings, theme_style: 'green' })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.theme_style === 'green'
                      ? 'border-emerald-500 bg-emerald-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 mb-4 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-black text-lg text-gray-900 text-center">أخضر ملكي</p>
                  <p className="text-sm text-gray-600 text-center mt-1">السمة الافتراضية</p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme_style: 'gold' })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.theme_style === 'gold'
                      ? 'border-yellow-500 bg-yellow-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-yellow-300'
                  }`}
                >
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 mb-4 flex items-center justify-center shadow-lg">
                    <Star className="w-12 h-12 text-white fill-white" />
                  </div>
                  <p className="font-black text-lg text-gray-900 text-center">ذهبي فاخر</p>
                  <p className="text-sm text-gray-600 text-center mt-1">مناسب للمناسبات</p>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, theme_style: 'elegant' })}
                  className={`p-6 rounded-2xl border-4 transition-all hover:scale-105 ${
                    settings.theme_style === 'elegant'
                      ? 'border-gray-500 bg-gray-50 shadow-2xl'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 mb-4 flex items-center justify-center shadow-lg">
                    <Moon className="w-12 h-12 text-white" />
                  </div>
                  <p className="font-black text-lg text-gray-900 text-center">أنيق داكن</p>
                  <p className="text-sm text-gray-600 text-center mt-1">تصميم عصري</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visual Tab */}
        {activeTab === 'visual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Particle Count */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">عدد الجزيئات</h3>
                  <p className="text-gray-600">كثافة المؤثرات البصرية</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">العدد:</span>
                  <span className="text-4xl font-black text-yellow-600">{settings.particle_count}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={settings.particle_count}
                  onChange={(e) => setSettings({ ...settings, particle_count: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${(settings.particle_count / 150) * 100}%, #e5e7eb ${(settings.particle_count / 150) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>لا شيء (0)</span>
                  <span>كثيف جداً (150)</span>
                </div>
              </div>
            </div>

            {/* Particle Speed */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg">
                  <Wind className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">سرعة الجزيئات</h3>
                  <p className="text-gray-600">سرعة حركة المؤثرات</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">السرعة:</span>
                  <span className="text-4xl font-black text-cyan-600">{settings.particle_speed}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.particle_speed}
                  onChange={(e) => setSettings({ ...settings, particle_speed: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((settings.particle_speed - 1) / 9) * 100}%, #e5e7eb ${((settings.particle_speed - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>بطيء (1)</span>
                  <span>سريع جداً (10)</span>
                </div>
              </div>
            </div>

            {/* Particle Size */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl shadow-lg">
                  <Circle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">حجم الجزيئات</h3>
                  <p className="text-gray-600">حجم كل جزيء</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">الحجم:</span>
                  <span className="text-4xl font-black text-pink-600">{settings.particle_size}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.particle_size}
                  onChange={(e) => setSettings({ ...settings, particle_size: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((settings.particle_size - 1) / 9) * 100}%, #e5e7eb ${((settings.particle_size - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>صغير (1px)</span>
                  <span>كبير (10px)</span>
                </div>
              </div>
            </div>

            {/* Blur Amount */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-lg">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">درجة الضبابية</h3>
                  <p className="text-gray-600">تأثير الطمس على الخلفية</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">الضبابية:</span>
                  <span className="text-4xl font-black text-indigo-600">{settings.blur_amount}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.blur_amount}
                  onChange={(e) => setSettings({ ...settings, blur_amount: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(settings.blur_amount / 30) * 100}%, #e5e7eb ${(settings.blur_amount / 30) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>واضح (0px)</span>
                  <span>ضبابي جداً (30px)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 space-y-8">
              <div className="flex items-center gap-4 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg">
                  <Type className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">محتوى البوابة</h3>
                  <p className="text-gray-600">النصوص والعناوين الظاهرة</p>
                </div>
              </div>

              {/* Main Title */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-900">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={settings.main_title}
                  onChange={(e) => setSettings({ ...settings, main_title: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-xl font-bold focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  placeholder="اسم المنصة"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-900">العنوان الفرعي</label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  placeholder="وصف مختصر"
                />
              </div>

              {/* Button Text */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-900">نص زر الدخول</label>
                <input
                  type="text"
                  value={settings.button_text}
                  onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
                  placeholder="نص الزر"
                />
              </div>

              {/* Show Logo */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${settings.show_logo ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                    {settings.show_logo ? (
                      <Check className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <X className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">عرض الشعار</p>
                    <p className="text-sm text-gray-600">إظهار شعار المنصة في البوابة</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_logo: !settings.show_logo })}
                  className={`relative w-20 h-10 rounded-full transition-all shadow-inner ${
                    settings.show_logo ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-8 h-8 bg-white rounded-full shadow-lg transition-all ${
                      settings.show_logo ? 'right-1' : 'right-11'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-gray-100">
                <div className="p-4 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">إعدادات متقدمة</h3>
                  <p className="text-gray-600">خيارات الأداء والرسوم المتحركة</p>
                </div>
              </div>

              {/* Animation Duration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">مدة الحركة</p>
                    <p className="text-sm text-gray-600">سرعة ظهور العناصر</p>
                  </div>
                  <span className="text-4xl font-black text-purple-600">{settings.animation_duration}ث</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.animation_duration}
                  onChange={(e) => setSettings({ ...settings, animation_duration: parseInt(e.target.value) })}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((settings.animation_duration - 1) / 9) * 100}%, #e5e7eb ${((settings.animation_duration - 1) / 9) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>سريع (1ث)</span>
                  <span>بطيء (10ث)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-12">
        <button
          onClick={resetToDefaults}
          className="group px-10 py-5 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 hover:border-gray-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
            <span>استعادة الافتراضي</span>
          </div>
        </button>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="group relative px-14 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-emerald-300 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
        >
          <div className="flex items-center gap-3 relative z-10">
            {saving ? (
              <>
                <RefreshCw className="w-7 h-7 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-7 h-7" />
                <span>حفظ جميع التغييرات</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </button>
      </div>
    </div>
  );
}
