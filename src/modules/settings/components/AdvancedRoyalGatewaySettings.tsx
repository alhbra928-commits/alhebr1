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
  TreePine,
  Activity,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Sun,
  Wind,
  Zap,
  Globe,
  Image,
  Layout,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
  MessageSquare,
  Info,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AdvancedGatewaySettings {
  id: string;
  enabled: boolean;

  // Reappear Duration
  gateway_reappear_duration: 'always' | '30min' | '1hour' | '2hours' | '6hours' | '24hours';

  // Auto Enter Settings
  auto_enter_enabled: boolean;
  auto_enter_delay: number;
  show_progress_bar: boolean;
  show_countdown: boolean;

  // Text Content
  welcome_text_ar: string;
  subtitle_text_ar: string;
  description_text_ar: string;
  button_text_ar: string;

  // Theme & Colors
  theme_style: 'gold' | 'green' | 'blue' | 'purple';
  background_style: 'gradient' | 'pattern' | 'solid';
  glass_intensity: 'light' | 'medium' | 'strong';

  // Visual Elements
  show_crown: boolean;
  show_particles: boolean;
  particle_count: number;
  particle_color: string;

  // Animated Elements
  show_floating_icons: boolean;
  show_orbiting_icons: boolean;
  show_decorative_shapes: boolean;
  animation_speed: 'slow' | 'medium' | 'fast';

  // Interactive Features
  enable_mouse_tracking: boolean;
  enable_parallax: boolean;
  enable_sound_effects: boolean;

  // Badge & Features
  show_feature_pills: boolean;
  feature_pill_1: string;
  feature_pill_2: string;
  feature_pill_3: string;
  feature_pill_4: string;

  // Floating Badges
  show_top_badge: boolean;
  top_badge_text: string;
  show_bottom_badge: boolean;
  bottom_badge_text: string;

  // Advanced
  blur_background: boolean;
  blur_intensity: number;
  border_glow: boolean;
  custom_css: string;

  // Responsive
  mobile_optimized: boolean;
  tablet_optimized: boolean;
  desktop_optimized: boolean;
}

export function AdvancedRoyalGatewaySettings() {
  const [settings, setSettings] = useState<AdvancedGatewaySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'content' | 'advanced'>('general');

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
        // تحويل البيانات من الجدول القديم إلى الواجهة الجديدة
        const mappedSettings: AdvancedGatewaySettings = {
          id: data.id,
          enabled: data.enabled ?? true,
          gateway_reappear_duration: data.gateway_reappear_duration || '1hour',
          auto_enter_enabled: data.auto_enter_enabled ?? true,
          auto_enter_delay: data.auto_enter_delay ?? 5,
          show_progress_bar: data.show_progress_bar ?? true,
          show_countdown: true,
          welcome_text_ar: data.welcome_text_ar || 'مرحباً بكم في عالم الاستثمار الأخضر',
          subtitle_text_ar: data.subtitle_text_ar || 'منصة التطوير الزراعي المتقدمة',
          description_text_ar: data.description_text_ar || 'تكنولوجيا زراعية حديثة لمستقبل مستدام',
          button_text_ar: 'ادخل إلى المنصة',
          theme_style: 'green',
          background_style: 'gradient',
          glass_intensity: 'medium',
          show_crown: data.show_crown ?? false,
          show_particles: data.show_particles ?? true,
          particle_count: data.particle_density === 'low' ? 15 : data.particle_density === 'high' ? 40 : 30,
          particle_color: 'emerald',
          show_floating_icons: true,
          show_orbiting_icons: data.show_rings ?? true,
          show_decorative_shapes: data.show_geometric_pattern ?? true,
          animation_speed: (data.animation_speed as any) || 'medium',
          enable_mouse_tracking: true,
          enable_parallax: true,
          enable_sound_effects: false,
          show_feature_pills: true,
          feature_pill_1: 'تكنولوجيا متقدمة',
          feature_pill_2: 'استثمار مستدام',
          feature_pill_3: 'بيئة صحية',
          feature_pill_4: 'ري ذكي',
          show_top_badge: true,
          top_badge_text: 'تصميم ثوري',
          show_bottom_badge: true,
          bottom_badge_text: 'صديق للبيئة',
          blur_background: true,
          blur_intensity: 20,
          border_glow: data.show_shimmer_effect ?? true,
          custom_css: '',
          mobile_optimized: true,
          tablet_optimized: true,
          desktop_optimized: true,
        };
        setSettings(mappedSettings);
      } else {
        setSettings({
          id: '',
          enabled: true,
          auto_enter_enabled: true,
          auto_enter_delay: 5,
          show_progress_bar: true,
          show_countdown: true,
          welcome_text_ar: 'مرحباً بكم في عالم الاستثمار الأخضر',
          subtitle_text_ar: 'منصة التطوير الزراعي المتقدمة',
          description_text_ar: 'تكنولوجيا زراعية حديثة لمستقبل مستدام',
          button_text_ar: 'ادخل إلى المنصة',
          theme_style: 'green',
          background_style: 'gradient',
          glass_intensity: 'medium',
          show_crown: false,
          show_particles: true,
          particle_count: 30,
          particle_color: 'emerald',
          show_floating_icons: true,
          show_orbiting_icons: true,
          show_decorative_shapes: true,
          animation_speed: 'medium',
          enable_mouse_tracking: true,
          enable_parallax: true,
          enable_sound_effects: false,
          show_feature_pills: true,
          feature_pill_1: 'تكنولوجيا متقدمة',
          feature_pill_2: 'استثمار مستدام',
          feature_pill_3: 'بيئة صحية',
          feature_pill_4: 'ري ذكي',
          show_top_badge: true,
          top_badge_text: 'تصميم ثوري',
          show_bottom_badge: true,
          bottom_badge_text: 'صديق للبيئة',
          blur_background: true,
          blur_intensity: 20,
          border_glow: true,
          custom_css: '',
          mobile_optimized: true,
          tablet_optimized: true,
          desktop_optimized: true,
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

      // فقط الحقول الموجودة في الجدول حالياً
      const updateData = {
        enabled: settings.enabled,
        gateway_reappear_duration: settings.gateway_reappear_duration,
        auto_enter_enabled: settings.auto_enter_enabled,
        auto_enter_delay: settings.auto_enter_delay,
        show_progress_bar: settings.show_progress_bar,
        particle_density: settings.particle_count <= 15 ? 'low' : settings.particle_count >= 35 ? 'high' : 'medium',
        animation_speed: settings.animation_speed,
        welcome_text_ar: settings.welcome_text_ar,
        subtitle_text_ar: settings.subtitle_text_ar,
        description_text_ar: settings.description_text_ar,
        theme_color: settings.theme_style === 'green' ? 'amber' : settings.theme_style,
        show_crown: settings.show_crown,
        show_sparkles: true,
        show_particles: settings.show_particles,
        show_rings: settings.show_orbiting_icons,
        show_geometric_pattern: settings.show_decorative_shapes,
        show_shimmer_effect: settings.border_glow,
        updated_at: new Date().toISOString(),
      };

      const { error } = settings.id
        ? await supabase
            .from('royal_gateway_settings')
            .update(updateData)
            .eq('id', settings.id)
        : await supabase.from('royal_gateway_settings').insert([{
            ...updateData,
            id: crypto.randomUUID(),
          }]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      showMessage('success', '✅ تم حفظ الإعدادات بنجاح! سيتم تطبيقها فوراً');
      await loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showMessage('error', `❌ فشل حفظ الإعدادات: ${error.message || 'حاول مرة أخرى'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('هل تريد حقاً استعادة الإعدادات الافتراضية؟ سيتم فقدان جميع التخصيصات الحالية.')) {
      loadSettings();
      showMessage('success', 'تم استعادة الإعدادات الافتراضية');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
          <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
        <p className="text-lg font-semibold text-gray-700">جاري تحميل الإعدادات المتقدمة...</p>
      </div>
    );
  }

  if (!settings) return null;

  const tabs = [
    { id: 'general', label: 'عام', icon: Settings },
    { id: 'visual', label: 'بصري', icon: Palette },
    { id: 'content', label: 'المحتوى', icon: Type },
    { id: 'advanced', label: 'متقدم', icon: Zap },
  ];

  return (
    <div
      className="min-h-screen overflow-y-auto pb-20 scroll-smooth"
      style={{
        maxHeight: '100vh',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30">
                  <Leaf className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-2 rounded-full shadow-lg animate-bounce">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">البوابة الملكية الخضراء</h1>
                <p className="text-emerald-100 text-lg">إعدادات متقدمة وشاملة للتحكم الكامل في التصميم والمحتوى</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg hover:scale-105"
                title="رجوع للإعدادات"
              >
                <ArrowRight className="w-5 h-5" />
                <span className="font-semibold">رجوع</span>
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg"
              >
                {previewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                <span className="font-semibold">{previewMode ? 'إخفاء المعاينة' : 'معاينة حية'}</span>
              </button>
            </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Activity, label: 'الحالة', value: settings.enabled ? 'مفعّل' : 'معطّل', color: settings.enabled ? 'emerald' : 'red' },
            { icon: Clock, label: 'وقت الدخول', value: `${settings.auto_enter_delay}ث`, color: 'blue' },
            { icon: Sparkles, label: 'الجزيئات', value: settings.particle_count, color: 'yellow' },
            { icon: Palette, label: 'السمة', value: settings.theme_style === 'green' ? 'أخضر' : settings.theme_style === 'gold' ? 'ذهبي' : settings.theme_style, color: 'purple' },
          ].map((stat, index) => (
            <div key={index} className="bg-white/15 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${stat.color}-100/30 rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs">{stat.label}</p>
                  <p className="text-white text-lg font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-4 p-5 rounded-2xl border-2 shadow-lg animate-in slide-in-from-top-4 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-7 h-7 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0" />
          )}
          <span
            className={`font-bold text-lg ${
              message.type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Controls */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">التحكم الرئيسي</h3>
                <p className="text-sm text-gray-600">الإعدادات الأساسية للبوابة</p>
              </div>
            </div>

            {/* Enable Gateway */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">تفعيل البوابة الملكية</p>
                    <p className="text-sm text-gray-700">عرض البوابة عند دخول المستخدمين للمنصة</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                    settings.enabled ? 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      settings.enabled ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reappear Duration */}
            <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">مدة إعادة ظهور البوابة</p>
                  <p className="text-sm text-gray-700">متى تظهر البوابة للمستخدم مرة أخرى</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'always', label: 'ظهور متكرر', desc: 'في كل مرة', color: 'red' },
                  { value: '30min', label: '٣٠ دقيقة', desc: 'نصف ساعة', color: 'orange' },
                  { value: '1hour', label: 'ساعة واحدة', desc: '60 دقيقة', color: 'amber' },
                  { value: '2hours', label: 'ساعتين', desc: '120 دقيقة', color: 'yellow' },
                  { value: '6hours', label: '٦ ساعات', desc: 'نصف يوم', color: 'lime' },
                  { value: '24hours', label: '٢٤ ساعة', desc: 'يوم كامل', color: 'green' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings({ ...settings, gateway_reappear_duration: option.value as any })}
                    className={`p-4 rounded-xl text-right transition-all border-2 ${
                      settings.gateway_reappear_duration === option.value
                        ? `bg-${option.color}-500 text-white border-${option.color}-600 shadow-lg scale-105`
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{option.label}</div>
                    <div className="text-xs opacity-80 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    {settings.gateway_reappear_duration === 'always' && '🔄 البوابة ستظهر في كل مرة يزور فيها المستخدم المنصة'}
                    {settings.gateway_reappear_duration === '30min' && '⏱️ بعد نصف ساعة من آخر دخول، ستظهر البوابة مرة أخرى'}
                    {settings.gateway_reappear_duration === '1hour' && '⏳ بعد ساعة كاملة من آخر دخول، ستظهر البوابة مرة أخرى'}
                    {settings.gateway_reappear_duration === '2hours' && '⏰ بعد ساعتين من آخر دخول، ستظهر البوابة مرة أخرى'}
                    {settings.gateway_reappear_duration === '6hours' && '🕐 بعد 6 ساعات من آخر دخول، ستظهر البوابة مرة أخرى'}
                    {settings.gateway_reappear_duration === '24hours' && '📅 بعد يوم كامل من آخر دخول، ستظهر البوابة مرة أخرى'}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto Enter */}
            <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg">الدخول التلقائي</p>
                    <p className="text-sm text-gray-700">الدخول للمنصة تلقائياً بعد فترة</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings({ ...settings, auto_enter_enabled: !settings.auto_enter_enabled })
                  }
                  className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                    settings.auto_enter_enabled ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      settings.auto_enter_enabled ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.auto_enter_enabled && (
                <div className="space-y-4 pt-4 border-t border-blue-300">
                  <div>
                    <label className="block mb-3">
                      <span className="font-bold text-gray-900 text-sm">⏱️ مدة الانتظار (بالثواني)</span>
                      <p className="text-xs text-gray-600">الوقت قبل الدخول التلقائي للمنصة</p>
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
                        className="flex-1 h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-black text-white">{settings.auto_enter_delay}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.show_progress_bar}
                          onChange={(e) =>
                            setSettings({ ...settings, show_progress_bar: e.target.checked })
                          }
                          className="w-5 h-5 rounded accent-blue-600"
                        />
                        <span className="text-sm font-semibold text-gray-800">شريط التقدم</span>
                      </label>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.show_countdown}
                          onChange={(e) => setSettings({ ...settings, show_countdown: e.target.checked })}
                          className="w-5 h-5 rounded accent-blue-600"
                        />
                        <span className="text-sm font-semibold text-gray-800">العد التنازلي</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Responsive Settings */}
            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg">التوافق مع الأجهزة</p>
                  <p className="text-sm text-gray-700">تحسين العرض لكل جهاز</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'mobile_optimized', icon: Smartphone, label: 'موبايل' },
                  { key: 'tablet_optimized', icon: Tablet, label: 'تابلت' },
                  { key: 'desktop_optimized', icon: Monitor, label: 'ديسكتوب' },
                ].map((device) => (
                  <button
                    key={device.key}
                    onClick={() => setSettings({ ...settings, [device.key]: !(settings as any)[device.key] })}
                    className={`p-4 rounded-xl transition-all ${
                      (settings as any)[device.key]
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <device.icon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-xs font-bold">{device.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">السمة والألوان</h3>
                <p className="text-sm text-gray-600">اختر نمط البوابة</p>
              </div>
            </div>

            {/* Theme Style */}
            <div>
              <label className="block mb-3">
                <span className="font-bold text-gray-900">🎨 نمط السمة الرئيسي</span>
                <p className="text-sm text-gray-600">اختر اللون الأساسي للبوابة</p>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'gold', label: 'ذهبي ملكي', gradient: 'from-amber-400 via-yellow-500 to-amber-600', icon: Crown },
                  { value: 'green', label: 'أخضر بيئي', gradient: 'from-emerald-400 via-green-500 to-teal-500', icon: Leaf },
                  { value: 'blue', label: 'أزرق محيطي', gradient: 'from-blue-400 via-cyan-500 to-sky-500', icon: Droplets },
                  { value: 'purple', label: 'بنفسجي فاخر', gradient: 'from-purple-400 via-violet-500 to-fuchsia-500', icon: Sparkles },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setSettings({ ...settings, theme_style: theme.value as any })}
                    className={`relative p-5 rounded-2xl transition-all ${
                      settings.theme_style === theme.value
                        ? 'ring-4 ring-offset-2 ring-emerald-400 shadow-2xl scale-105'
                        : 'hover:scale-102 shadow-md'
                    }`}
                  >
                    <div className={`h-24 rounded-xl bg-gradient-to-br ${theme.gradient} mb-3 flex items-center justify-center`}>
                      <theme.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="font-bold text-gray-900 text-center">{theme.label}</p>
                    {settings.theme_style === theme.value && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Style */}
            <div>
              <label className="block mb-3">
                <span className="font-bold text-gray-900">🖼️ نمط الخلفية</span>
                <p className="text-sm text-gray-600">اختر شكل خلفية البوابة</p>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'gradient', label: 'متدرج', desc: 'تدرج ملون' },
                  { value: 'pattern', label: 'نقوش', desc: 'نقوش هندسية' },
                  { value: 'solid', label: 'ثابت', desc: 'لون واحد' },
                ].map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSettings({ ...settings, background_style: style.value as any })}
                    className={`p-4 rounded-xl transition-all text-center ${
                      settings.background_style === style.value
                        ? 'bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-bold text-sm mb-1">{style.label}</p>
                    <p className="text-xs opacity-80">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Glass Intensity */}
            <div>
              <label className="block mb-3">
                <span className="font-bold text-gray-900">💎 شدة التأثير الزجاجي</span>
                <p className="text-sm text-gray-600">مستوى الشفافية والضبابية</p>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'خفيف', intensity: '20%' },
                  { value: 'medium', label: 'متوسط', intensity: '40%' },
                  { value: 'strong', label: 'قوي', intensity: '60%' },
                ].map((intensity) => (
                  <button
                    key={intensity.value}
                    onClick={() => setSettings({ ...settings, glass_intensity: intensity.value as any })}
                    className={`p-4 rounded-xl transition-all ${
                      settings.glass_intensity === intensity.value
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <p className="font-bold mb-1">{intensity.label}</p>
                    <p className="text-xs opacity-80">{intensity.intensity}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Tab */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Particles Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">الجزيئات والحركات</h3>
                <p className="text-sm text-gray-600">التحكم في العناصر المتحركة</p>
              </div>
            </div>

            {/* Show Particles */}
            <div className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-black text-gray-900">الجزيئات العائمة</p>
                    <p className="text-sm text-gray-700">جزيئات متحركة في الخلفية</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_particles: !settings.show_particles })}
                  className={`relative w-16 h-8 rounded-full transition-all ${
                    settings.show_particles ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      settings.show_particles ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.show_particles && (
                <div className="space-y-4 pt-4 border-t border-yellow-300">
                  <div>
                    <label className="block mb-3">
                      <span className="font-bold text-gray-900 text-sm">🌟 عدد الجزيئات</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={settings.particle_count}
                        onChange={(e) =>
                          setSettings({ ...settings, particle_count: parseInt(e.target.value) })
                        }
                        className="flex-1 h-3 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                      />
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-black text-white">{settings.particle_count}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2">
                      <span className="font-bold text-gray-900 text-sm">🎨 لون الجزيئات</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['emerald', 'amber', 'blue', 'purple'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setSettings({ ...settings, particle_color: color })}
                          className={`h-12 rounded-lg transition-all ${
                            settings.particle_color === color ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''
                          } ${
                            color === 'emerald' ? 'bg-emerald-400' :
                            color === 'amber' ? 'bg-amber-400' :
                            color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Animation Speed */}
            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <label className="block mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-black text-gray-900">⚡ سرعة الحركات</span>
                </div>
                <p className="text-sm text-gray-700">سرعة التأثيرات المتحركة</p>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'slow', label: 'بطيء', icon: '🐢' },
                  { value: 'medium', label: 'متوسط', icon: '🚶' },
                  { value: 'fast', label: 'سريع', icon: '🚀' },
                ].map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => setSettings({ ...settings, animation_speed: speed.value as any })}
                    className={`p-4 rounded-xl transition-all ${
                      settings.animation_speed === speed.value
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <p className="text-2xl mb-1">{speed.icon}</p>
                    <p className="font-bold text-sm">{speed.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Elements */}
            <div className="space-y-3">
              {[
                { key: 'show_crown', icon: Crown, label: 'عرض التاج الملكي', desc: 'أيقونة التاج في الأعلى' },
                { key: 'show_floating_icons', icon: TreePine, label: 'الأيقونات العائمة', desc: 'أيقونات كبيرة في الخلفية' },
                { key: 'show_orbiting_icons', icon: Sun, label: 'الأيقونات المدارية', desc: 'أيقونات تدور حول المركز' },
                { key: 'show_decorative_shapes', icon: Layers, label: 'الأشكال الزخرفية', desc: 'أشكال هندسية إضافية' },
              ].map((element) => (
                <div key={element.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <element.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{element.label}</p>
                      <p className="text-xs text-gray-600">{element.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, [element.key]: !(settings as any)[element.key] })}
                    className={`relative w-14 h-7 rounded-full transition-all ${
                      (settings as any)[element.key] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        (settings as any)[element.key] ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Features */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">المميزات التفاعلية</h3>
                <p className="text-sm text-gray-600">تفاعلات متقدمة مع المستخدم</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'enable_mouse_tracking', icon: Target, label: 'تتبع حركة الماوس', desc: 'خلفية تتفاعل مع حركة الماوس', color: 'blue' },
                { key: 'enable_parallax', icon: Layers, label: 'تأثير Parallax', desc: 'حركة متعددة الطبقات', color: 'purple' },
                { key: 'enable_sound_effects', icon: Wind, label: 'المؤثرات الصوتية', desc: 'أصوات عند التفاعل', color: 'green' },
              ].map((feature) => (
                <div key={feature.key} className={`p-5 bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-xl border-2 border-${feature.color}-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${feature.color}-500 rounded-lg`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{feature.label}</p>
                        <p className="text-sm text-gray-700">{feature.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, [feature.key]: !(settings as any)[feature.key] })}
                      className={`relative w-16 h-8 rounded-full transition-all ${
                        (settings as any)[feature.key] ? `bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 shadow-lg` : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                          (settings as any)[feature.key] ? 'translate-x-8' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Pills */}
            <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border-2 border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-black text-gray-900">بطاقات المميزات</p>
                    <p className="text-sm text-gray-700">عرض المميزات الرئيسية</p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, show_feature_pills: !settings.show_feature_pills })}
                  className={`relative w-16 h-8 rounded-full transition-all ${
                    settings.show_feature_pills ? 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      settings.show_feature_pills ? 'translate-x-8' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.show_feature_pills && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-300">
                  {[1, 2, 3, 4].map((num) => (
                    <input
                      key={num}
                      type="text"
                      value={(settings as any)[`feature_pill_${num}`]}
                      onChange={(e) => setSettings({ ...settings, [`feature_pill_${num}`]: e.target.value })}
                      className="px-4 py-2 rounded-lg border-2 border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-right text-sm font-semibold"
                      placeholder={`ميزة ${num}`}
                      dir="rtl"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-gray-900 text-sm">Badge العلوي</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_top_badge}
                  onChange={(e) => setSettings({ ...settings, show_top_badge: e.target.checked })}
                  className="mb-2 accent-green-600"
                />
                {settings.show_top_badge && (
                  <input
                    type="text"
                    value={settings.top_badge_text}
                    onChange={(e) => setSettings({ ...settings, top_badge_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-green-300 text-right text-xs"
                    dir="rtl"
                  />
                )}
              </div>

              <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5 text-teal-600" />
                  <p className="font-bold text-gray-900 text-sm">Badge السفلي</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_bottom_badge}
                  onChange={(e) => setSettings({ ...settings, show_bottom_badge: e.target.checked })}
                  className="mb-2 accent-teal-600"
                />
                {settings.show_bottom_badge && (
                  <input
                    type="text"
                    value={settings.bottom_badge_text}
                    onChange={(e) => setSettings({ ...settings, bottom_badge_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-teal-300 text-right text-xs"
                    dir="rtl"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                <Type className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">محتوى البوابة النصي</h3>
                <p className="text-gray-600">تخصيص النصوص المعروضة في البوابة</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Welcome Text */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-black text-gray-900 text-lg">العنوان الرئيسي الكبير</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">النص الأكبر في منتصف البوابة - يظهر بخط ضخم وملفت</p>
                </label>
                <input
                  type="text"
                  value={settings.welcome_text_ar}
                  onChange={(e) => setSettings({ ...settings, welcome_text_ar: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-right text-2xl font-bold"
                  placeholder="مثال: مرحباً بكم في عالم الاستثمار الأخضر"
                  dir="rtl"
                />
                <p className="text-xs text-gray-600 mt-2 text-right">✨ يُنصح بنص قصير ومؤثر (3-7 كلمات)</p>
              </div>

              {/* Subtitle */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-purple-600" />
                    <span className="font-black text-gray-900 text-lg">العنوان الفرعي المتوسط</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">نص أصغر قليلاً تحت العنوان الرئيسي - يوضح طبيعة المنصة</p>
                </label>
                <input
                  type="text"
                  value={settings.subtitle_text_ar}
                  onChange={(e) => setSettings({ ...settings, subtitle_text_ar: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-right text-xl font-semibold"
                  placeholder="مثال: منصة التطوير الزراعي المتقدمة"
                  dir="rtl"
                />
                <p className="text-xs text-gray-600 mt-2 text-right">💡 اجعله وصفياً وواضحاً (4-8 كلمات)</p>
              </div>

              {/* Description */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    <span className="font-black text-gray-900 text-lg">النص الوصفي التفصيلي</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">وصف أكثر تفصيلاً عن المنصة وما تقدمه - نص متوسط الحجم</p>
                </label>
                <textarea
                  value={settings.description_text_ar}
                  onChange={(e) => setSettings({ ...settings, description_text_ar: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all text-right text-lg resize-none"
                  rows={4}
                  placeholder="مثال: تكنولوجيا زراعية حديثة لمستقبل مستدام - استثمر بذكاء في القطاع الزراعي"
                  dir="rtl"
                />
                <p className="text-xs text-gray-600 mt-2 text-right">📝 يمكن أن يكون أطول قليلاً (10-20 كلمة)</p>
              </div>

              {/* Button Text */}
              <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-200">
                <label className="block mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <span className="font-black text-gray-900 text-lg">نص زر الدخول</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">النص المعروض على الزر الرئيسي للدخول إلى المنصة</p>
                </label>
                <input
                  type="text"
                  value={settings.button_text_ar}
                  onChange={(e) => setSettings({ ...settings, button_text_ar: e.target.value })}
                  className="w-full px-6 py-4 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all text-right text-xl font-bold"
                  placeholder="مثال: ادخل إلى المنصة"
                  dir="rtl"
                />
                <p className="text-xs text-gray-600 mt-2 text-right">🎯 يُفضل نص قصير وواضح (2-4 كلمات)</p>
              </div>

              {/* Preview */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-gray-200">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-2">👀 معاينة النصوص</h4>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      سيتم عرض النصوص بهذا الترتيب من الأعلى للأسفل في البوابة. تأكد من التناسق والوضوح قبل الحفظ.
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 text-center space-y-3">
                  <p className="text-3xl font-bold text-gray-900">{settings.welcome_text_ar}</p>
                  <p className="text-xl font-semibold text-gray-700">{settings.subtitle_text_ar}</p>
                  <p className="text-base text-gray-600">{settings.description_text_ar}</p>
                  <div className="pt-4">
                    <div className="inline-block bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-3 rounded-xl font-bold">
                      {settings.button_text_ar}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Blur Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">إعدادات الضبابية والتوهج</h3>
                <p className="text-sm text-gray-600">تحكم في التأثيرات البصرية المتقدمة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-black text-gray-900">ضبابية الخلفية</p>
                    <p className="text-sm text-gray-700">تأثير blur على الخلفية</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, blur_background: !settings.blur_background })}
                    className={`relative w-16 h-8 rounded-full transition-all ${
                      settings.blur_background ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.blur_background ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {settings.blur_background && (
                  <div>
                    <label className="block mb-2 text-sm font-bold text-gray-900">شدة الضبابية</label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={settings.blur_intensity}
                      onChange={(e) => setSettings({ ...settings, blur_intensity: parseInt(e.target.value) })}
                      className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-right text-xl font-bold text-blue-600 mt-2">{settings.blur_intensity}px</p>
                  </div>
                )}
              </div>

              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-gray-900">توهج الحدود</p>
                    <p className="text-sm text-gray-700">تأثير glow حول البطاقة</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, border_glow: !settings.border_glow })}
                    className={`relative w-16 h-8 rounded-full transition-all ${
                      settings.border_glow ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.border_glow ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">CSS مخصص (للمتقدمين)</h3>
                <p className="text-sm text-gray-600">أضف تنسيقات CSS إضافية</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl mb-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-bold mb-1">⚠️ تحذير: للمستخدمين المتقدمين فقط</p>
                    <p>استخدام CSS خاطئ قد يؤدي إلى مشاكل في العرض. اختبر التعديلات جيداً قبل الحفظ.</p>
                  </div>
                </div>
              </div>
              <textarea
                value={settings.custom_css}
                onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 font-mono text-sm resize-none"
                rows={8}
                placeholder=".gateway-custom { ... }"
                dir="ltr"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-gray-900 text-lg mb-3">💡 نصائح مهمة للإعدادات المتقدمة</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>جميع الإعدادات يتم تطبيقها فوراً بعد الحفظ على البوابة الحية</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>استخدم المعاينة الحية للتأكد من النتيجة قبل الحفظ النهائي</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>يُنصح بعدم المبالغة في الجزيئات والحركات للحفاظ على الأداء</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>اختبر البوابة على أجهزة مختلفة (موبايل، تابلت، ديسكتوب)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>حافظ على النصوص واضحة ومقروءة على جميع الخلفيات</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="sticky bottom-6 flex justify-center gap-4">
        <button
          onClick={resetToDefaults}
          className="group px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 hover:border-gray-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6" />
            <span>استعادة الافتراضي</span>
          </div>
        </button>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-300 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="flex items-center gap-3 relative z-10">
            {saving ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>💾 حفظ جميع التغييرات</span>
              </>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 rounded-2xl" />
        </button>
      </div>
      </div>
    </div>
  );
}
