import { useState, useEffect } from 'react';
import { Save, RefreshCw, Eye, Palette, Settings, Sparkles, TrendingUp, Image, Type, Layers } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export function AdvancedLoaderManagement() {
  const [settings, setSettings] = useState<any>(null);
  const [phases, setPhases] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'phases' | 'elements' | 'themes'>('general');
  const [isSaving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load settings
      const { data: settingsData } = await supabase
        .from('platform_loader_settings')
        .select('*')
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Load phases
      const { data: phasesData } = await supabase
        .from('loader_content_phases')
        .select('*')
        .order('display_order');

      if (phasesData) {
        setPhases(phasesData);
      }

      // Load themes
      const { data: themesData } = await supabase
        .from('loader_themes')
        .select('*')
        .eq('is_active', true);

      if (themesData) {
        setThemes(themesData);
      }

      // Load elements
      const { data: elementsData } = await supabase
        .from('loader_background_elements')
        .select('*')
        .eq('is_active', true);

      if (elementsData) {
        setElements(elementsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_loader_settings')
        .update(settings)
        .eq('id', settings.id);

      if (error) throw error;

      alert('تم حفظ الإعدادات بنجاح!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePhase = async (phaseId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('loader_content_phases')
        .update(updates)
        .eq('id', phaseId);

      if (error) throw error;

      setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating phase:', error);
    }
  };

  const applyTheme = async (theme: any) => {
    const themeSettings = theme.settings;
    const updatedSettings = { ...settings, ...themeSettings };
    setSettings(updatedSettings);

    try {
      await supabase
        .from('platform_loader_settings')
        .update(themeSettings)
        .eq('id', settings.id);

      alert(`تم تطبيق ثيم "${theme.name_ar}" بنجاح!`);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 p-6" dir="rtl">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-emerald-900 mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-emerald-600" />
                إدارة شاشة التحميل المتطورة
              </h1>
              <p className="text-lg text-emerald-700">تحكم كامل في كل تفاصيل شاشة التحميل</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'إخفاء المعاينة' : 'معاينة'}
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-xl p-2 flex gap-2">
          {[
            { id: 'general', label: 'إعدادات عامة', icon: Settings },
            { id: 'design', label: 'التصميم', icon: Palette },
            { id: 'phases', label: 'المراحل', icon: TrendingUp },
            { id: 'elements', label: 'العناصر', icon: Layers },
            { id: 'themes', label: 'الثيمات', icon: Image },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-emerald-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-emerald-900 mb-6">الإعدادات العامة</h2>

              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">تفعيل شاشة التحميل</h3>
                  <p className="text-emerald-700">عرض شاشة التحميل عند فتح المنصة</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <label className="block text-xl font-bold text-emerald-900">
                  مدة العرض (ميلي ثانية)
                </label>
                <input
                  type="number"
                  value={settings.min_display_time}
                  onChange={(e) => setSettings({ ...settings, min_display_time: parseInt(e.target.value) })}
                  className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-sm text-gray-600">الوقت: {(settings.min_display_time / 1000).toFixed(1)} ثانية</p>
              </div>

              {/* Main Title */}
              <div className="space-y-3">
                <label className="block text-xl font-bold text-emerald-900">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={settings.main_title}
                  onChange={(e) => setSettings({ ...settings, main_title: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-3">
                <label className="block text-xl font-bold text-emerald-900">العنوان الفرعي</label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Design Settings */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-emerald-900 mb-6">إعدادات التصميم</h2>

              {/* Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-xl font-bold text-emerald-900">اللون الأول للخلفية</label>
                  <input
                    type="color"
                    value={settings.background_color_from}
                    onChange={(e) => setSettings({ ...settings, background_color_from: e.target.value })}
                    className="w-full h-16 border-2 border-emerald-200 rounded-xl cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xl font-bold text-emerald-900">اللون الثاني للخلفية</label>
                  <input
                    type="color"
                    value={settings.background_color_to}
                    onChange={(e) => setSettings({ ...settings, background_color_to: e.target.value })}
                    className="w-full h-16 border-2 border-emerald-200 rounded-xl cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xl font-bold text-emerald-900">اللون المميز</label>
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-full h-16 border-2 border-emerald-200 rounded-xl cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xl font-bold text-emerald-900">لون النص</label>
                  <input
                    type="color"
                    value={settings.text_color}
                    onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                    className="w-full h-16 border-2 border-emerald-200 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              {/* Logo Settings */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-emerald-900">إعدادات الشعار</h3>

                <div className="space-y-3">
                  <label className="block text-lg font-bold text-emerald-900">نوع الشعار</label>
                  <select
                    value={settings.logo_type}
                    onChange={(e) => setSettings({ ...settings, logo_type: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="emoji">رمز تعبيري (Emoji)</option>
                    <option value="text">نص</option>
                    <option value="image">صورة</option>
                    <option value="none">لا شيء</option>
                  </select>
                </div>

                {settings.logo_type === 'emoji' && (
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-emerald-900">الرمز التعبيري</label>
                    <input
                      type="text"
                      value={settings.logo_emoji}
                      onChange={(e) => setSettings({ ...settings, logo_emoji: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-4xl text-center focus:border-emerald-500 focus:outline-none"
                      maxLength={2}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-lg font-bold text-emerald-900">حجم الشعار</label>
                  <select
                    value={settings.logo_size}
                    onChange={(e) => setSettings({ ...settings, logo_size: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="small">صغير</option>
                    <option value="medium">متوسط</option>
                    <option value="large">كبير</option>
                    <option value="xlarge">كبير جداً</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-lg font-bold text-emerald-900">حركة الشعار</label>
                  <select
                    value={settings.logo_animation}
                    onChange={(e) => setSettings({ ...settings, logo_animation: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="none">بدون حركة</option>
                    <option value="rotate3d">دوران ثلاثي الأبعاد</option>
                    <option value="bounce">ارتداد</option>
                    <option value="pulse">نبض</option>
                    <option value="float">طفو</option>
                  </select>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-emerald-900">شريط التقدم</h3>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="text-lg font-bold">عرض شريط التقدم</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_progress_bar}
                      onChange={(e) => setSettings({ ...settings, show_progress_bar: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="text-lg font-bold">تأثير التوهج</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_progress_glow}
                      onChange={(e) => setSettings({ ...settings, show_progress_glow: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              {/* Effects */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-emerald-900">التأثيرات</h3>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="text-lg font-bold">تأثير اللمعان (Shimmer)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_shimmer_effect}
                      onChange={(e) => setSettings({ ...settings, show_shimmer_effect: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <span className="text-lg font-bold">العناصر العائمة</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_floating_elements}
                      onChange={(e) => setSettings({ ...settings, show_floating_elements: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {settings.show_floating_elements && (
                  <div className="space-y-3">
                    <label className="block text-lg font-bold text-emerald-900">عدد العناصر العائمة</label>
                    <input
                      type="number"
                      value={settings.floating_elements_count}
                      onChange={(e) => setSettings({ ...settings, floating_elements_count: parseInt(e.target.value) })}
                      className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
                      min="0"
                      max="50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phases */}
          {activeTab === 'phases' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-emerald-900 mb-6">مراحل التحميل</h2>

              {phases.map((phase, index) => (
                <div key={phase.id} className="p-6 bg-emerald-50 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-emerald-900">المرحلة {phase.phase_number}</h3>
                    <span className="text-4xl">{phase.phase_icon}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-emerald-900 mb-2">النص</label>
                      <input
                        type="text"
                        value={phase.phase_text}
                        onChange={(e) => handleUpdatePhase(phase.id, { phase_text: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-emerald-900 mb-2">الأيقونة</label>
                      <input
                        type="text"
                        value={phase.phase_icon}
                        onChange={(e) => handleUpdatePhase(phase.id, { phase_icon: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl text-2xl text-center focus:border-emerald-500 focus:outline-none"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-emerald-900 mb-2">اللون</label>
                      <input
                        type="color"
                        value={phase.phase_color}
                        onChange={(e) => handleUpdatePhase(phase.id, { phase_color: e.target.value })}
                        className="w-full h-12 border-2 border-emerald-200 rounded-xl cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-emerald-900 mb-2">النطاق ({phase.start_percentage}% - {phase.end_percentage}%)</label>
                      <div className="h-4 bg-gray-200 rounded-full relative">
                        <div
                          className="absolute h-full rounded-full"
                          style={{
                            left: `${phase.start_percentage}%`,
                            width: `${phase.end_percentage - phase.start_percentage}%`,
                            backgroundColor: phase.phase_color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Elements */}
          {activeTab === 'elements' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-emerald-900 mb-6">العناصر العائمة</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className="p-6 bg-emerald-50 rounded-2xl text-center hover:bg-emerald-100 transition-all"
                  >
                    <div className="text-5xl mb-3">{element.element_value}</div>
                    <div className="text-sm text-emerald-700 font-bold">{element.animation_type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-emerald-900 mb-6">الثيمات الجاهزة</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer"
                    onClick={() => applyTheme(theme)}
                  >
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2">{theme.name_ar}</h3>
                    <p className="text-emerald-700 mb-4">{theme.description}</p>
                    <div className="flex gap-2">
                      {theme.settings.background_color_from && (
                        <div
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                          style={{ backgroundColor: theme.settings.background_color_from }}
                        />
                      )}
                      {theme.settings.background_color_to && (
                        <div
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                          style={{ backgroundColor: theme.settings.background_color_to }}
                        />
                      )}
                      {theme.settings.accent_color && (
                        <div
                          className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
                          style={{ backgroundColor: theme.settings.accent_color }}
                        />
                      )}
                    </div>
                    <button className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all">
                      تطبيق الثيم
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
