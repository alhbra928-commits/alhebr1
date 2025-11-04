import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Upload, Image, Zap, Type, Clock, Palette, Sparkles, Play, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface LoaderSettings {
  id?: string;
  enabled: boolean;
  logo_url?: string;
  main_title: string;
  subtitle: string;
  auto_enter: boolean;
  min_display_time: number;
  fade_duration: number;
  animation_speed: 'slow' | 'normal' | 'fast';
  show_progress_bar: boolean;
  show_sparkles: boolean;
  logo_animation: 'none' | 'bounce' | 'spin' | 'pulse' | 'float';
  background_color_from: string;
  background_color_to: string;
  text_color: string;
  progress_bar_color: string;
  loading_text_1: string;
  loading_text_2: string;
  loading_text_3: string;
  loading_text_4: string;
  loading_text_5: string;
}

export function InnovativeLoaderSettings() {
  const [settings, setSettings] = useState<LoaderSettings>({
    enabled: true,
    logo_url: '',
    main_title: 'مرحباً بكم في منصة مزاد',
    subtitle: 'منصة تملك النخيل وأشجار الزيتون',
    auto_enter: true,
    min_display_time: 2000,
    fade_duration: 600,
    animation_speed: 'normal',
    show_progress_bar: true,
    show_sparkles: true,
    logo_animation: 'pulse',
    background_color_from: '#064E3B',
    background_color_to: '#047857',
    text_color: '#FFFFFF',
    progress_bar_color: '#10B981',
    loading_text_1: 'جاري تحضير المنصة...',
    loading_text_2: 'تحميل المزارع المتاحة...',
    loading_text_3: 'تجهيز البيانات...',
    loading_text_4: 'اللمسات الأخيرة...',
    loading_text_5: 'جاهز!',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('loader_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
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
        .update(settings)
        .eq('id', settings.id || '');

      if (error) throw error;

      showMessage('success', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'يرجى اختيار ملف صورة فقط');
      return;
    }

    // التحقق من حجم الملف (أقصى 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'حجم الصورة يجب أن يكون أقل من 2MB');
      return;
    }

    try {
      setUploading(true);

      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // رفع الملف
      const { error: uploadError } = await supabase.storage
        .from('loader-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // الحصول على الرابط العام
      const { data: { publicUrl } } = supabase.storage
        .from('loader-logos')
        .getPublicUrl(filePath);

      // تحديث الإعدادات
      setSettings({ ...settings, logo_url: publicUrl });
      showMessage('success', 'تم رفع الشعار بنجاح');
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      showMessage('error', error.message || 'فشل رفع الشعار');
    } finally {
      setUploading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const resetToDefaults = () => {
    if (confirm('هل أنت متأكد من إعادة التعيين للإعدادات الافتراضية؟')) {
      setSettings({
        ...settings,
        main_title: 'مرحباً بكم في منصة مزاد',
        subtitle: 'منصة تملك النخيل وأشجار الزيتون',
        auto_enter: true,
        min_display_time: 2000,
        animation_speed: 'normal',
        logo_animation: 'pulse',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2">🎨 إعدادات شاشة التحميل المبتكرة</h2>
            <p className="text-emerald-100">صمم تجربة فريدة عند دخول المستخدمين للمنصة</p>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all"
          >
            <Eye className="w-5 h-5" />
            {previewMode ? 'إخفاء المعاينة' : 'معاينة مباشرة'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview Mode */}
      {previewMode && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border-4 border-emerald-200">
          <h3 className="text-xl font-bold mb-4 text-gray-900">معاينة مباشرة:</h3>
          <div
            className="relative h-96 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${settings.background_color_from} 0%, ${settings.background_color_to} 100%)`,
            }}
          >
            {/* Sparkles */}
            {settings.show_sparkles && (
              <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute text-yellow-300 opacity-20 animate-pulse"
                    size={20}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>
            )}

            <div className="relative z-10 text-center space-y-4">
              {settings.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className={`w-24 h-24 object-contain mx-auto mb-4 ${
                    settings.logo_animation === 'bounce' ? 'animate-bounce' :
                    settings.logo_animation === 'spin' ? 'animate-spin' :
                    settings.logo_animation === 'pulse' ? 'animate-pulse' : ''
                  }`}
                />
              )}
              <h1
                className="text-3xl font-black"
                style={{ color: settings.text_color }}
              >
                {settings.main_title}
              </h1>
              <p
                className="text-lg"
                style={{ color: settings.text_color }}
              >
                {settings.subtitle}
              </p>
              {settings.show_progress_bar && (
                <div className="w-64 mx-auto">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full w-3/4 transition-all rounded-full"
                      style={{ backgroundColor: settings.progress_bar_color }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-emerald-600" />
            رفع الشعار
          </h3>

          <div className="space-y-4">
            {settings.logo_url && (
              <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                <img
                  src={settings.logo_url}
                  alt="Current Logo"
                  className="w-32 h-32 object-contain"
                />
              </div>
            )}

            <label className="block">
              <div className="relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all font-bold">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Image className="w-5 h-5" />
                      اختر شعار جديد
                    </>
                  )}
                </div>
              </div>
            </label>

            <p className="text-sm text-gray-600 text-center">
              PNG, JPG, GIF (أقصى حجم 2MB)
            </p>

            {/* Logo Animation */}
            <div>
              <label className="block font-bold text-gray-900 mb-2">حركة الشعار:</label>
              <select
                value={settings.logo_animation}
                onChange={(e) => setSettings({ ...settings, logo_animation: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="none">بدون حركة</option>
                <option value="pulse">نبض</option>
                <option value="bounce">قفز</option>
                <option value="spin">دوران</option>
                <option value="float">طفو</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-emerald-600" />
            الإعدادات الرئيسية
          </h3>

          <div className="space-y-4">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-bold text-gray-900">تفعيل شاشة التحميل</h4>
                <p className="text-sm text-gray-600">عرض الشاشة عند دخول المنصة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Auto Enter */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-bold text-gray-900">الدخول التلقائي</h4>
                <p className="text-sm text-gray-600">الانتقال تلقائياً بعد انتهاء التحميل</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auto_enter}
                  onChange={(e) => setSettings({ ...settings, auto_enter: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Display Time */}
            <div>
              <label className="block font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                مدة العرض (ميلي ثانية):
              </label>
              <input
                type="range"
                min="1000"
                max="5000"
                step="100"
                value={settings.min_display_time}
                onChange={(e) => setSettings({ ...settings, min_display_time: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>سريع (1s)</span>
                <span className="font-bold text-emerald-600">{settings.min_display_time}ms</span>
                <span>بطيء (5s)</span>
              </div>
            </div>

            {/* Animation Speed */}
            <div>
              <label className="block font-bold text-gray-900 mb-2">سرعة الحركة:</label>
              <select
                value={settings.animation_speed}
                onChange={(e) => setSettings({ ...settings, animation_speed: e.target.value as any })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
              >
                <option value="slow">بطيء</option>
                <option value="normal">عادي</option>
                <option value="fast">سريع</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Type className="w-6 h-6 text-emerald-600" />
            النصوص
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-gray-900 mb-2">العنوان الرئيسي:</label>
              <input
                type="text"
                value={settings.main_title}
                onChange={(e) => setSettings({ ...settings, main_title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-2">النص الفرعي:</label>
              <input
                type="text"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-900 mb-2">نصوص التحميل الديناميكية:</label>
              {[1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={settings[`loading_text_${i}` as keyof LoaderSettings] as string}
                  onChange={(e) => setSettings({ ...settings, [`loading_text_${i}`]: e.target.value })}
                  placeholder={`نص ${i}`}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 mb-2"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Visual Effects */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="font-black text-xl mb-4 text-gray-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-emerald-600" />
            المؤثرات البصرية
          </h3>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-900">شريط التقدم</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_progress_bar}
                  onChange={(e) => setSettings({ ...settings, show_progress_bar: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Sparkles */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-900">البريق</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_sparkles}
                  onChange={(e) => setSettings({ ...settings, show_sparkles: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:right-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">لون البداية:</label>
                <input
                  type="color"
                  value={settings.background_color_from}
                  onChange={(e) => setSettings({ ...settings, background_color_from: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">لون النهاية:</label>
                <input
                  type="color"
                  value={settings.background_color_to}
                  onChange={(e) => setSettings({ ...settings, background_color_to: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">لون النص:</label>
                <input
                  type="color"
                  value={settings.text_color}
                  onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">لون شريط التقدم:</label>
                <input
                  type="color"
                  value={settings.progress_bar_color}
                  onChange={(e) => setSettings({ ...settings, progress_bar_color: e.target.value })}
                  className="w-full h-12 rounded-xl cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold"
        >
          <RotateCcw className="w-5 h-5" />
          إعادة تعيين
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-bold shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
