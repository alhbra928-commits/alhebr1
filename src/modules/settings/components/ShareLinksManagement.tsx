import React, { useState, useEffect } from 'react';
import { Link2, Image, Type, Smile, Save, Eye, RefreshCw, ExternalLink } from 'lucide-react';
import { shareSettingsService, ShareSettings } from '../../../services/shareSettingsService';

const PAGE_TYPES = [
  { value: 'home', label: 'الصفحة الرئيسية', icon: '🏠' },
  { value: 'farm_detail', label: 'تفاصيل المزرعة', icon: '🌳' },
  { value: 'farms_list', label: 'قائمة المزارع', icon: '📋' },
  { value: 'about', label: 'عن المنصة', icon: 'ℹ️' },
  { value: 'concept', label: 'فكرة المنصة', icon: '💡' },
  { value: 'contact', label: 'تواصل معنا', icon: '📞' }
];

const DEFAULT_EMOJIS = [
  { key: 'tree', label: 'شجرة', default: '🌳' },
  { key: 'location', label: 'موقع', default: '📍' },
  { key: 'money', label: 'نقود', default: '💰' },
  { key: 'check', label: 'صح', default: '✅' },
  { key: 'fire', label: 'نار', default: '🔥' },
  { key: 'target', label: 'هدف', default: '🎯' },
  { key: 'down', label: 'أسفل', default: '👇' }
];

export const ShareLinksManagement: React.FC = () => {
  const [settings, setSettings] = useState<ShareSettings[]>([]);
  const [selectedType, setSelectedType] = useState<string>('home');
  const [currentSettings, setCurrentSettings] = useState<ShareSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (selectedType && settings.length > 0) {
      const setting = settings.find(s => s.page_type === selectedType);
      setCurrentSettings(setting || null);
      if (setting) {
        generatePreview(setting);
      }
    }
  }, [selectedType, settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await shareSettingsService.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (setting: ShareSettings) => {
    const sampleData = {
      farm_name: 'مزرعة الخالدية',
      location: 'الجوف - سكاكا',
      price: 2500,
      available_trees: 850,
      availability_text: '✅ متوفر 850 شجرة'
    };

    const preview = shareSettingsService.processTemplate(
      setting.share_text_template,
      sampleData,
      setting.emojis
    );
    setPreviewText(preview);
  };

  const handleSave = async () => {
    if (!currentSettings) return;

    try {
      setSaving(true);
      await shareSettingsService.updateSettings(currentSettings.id, currentSettings);
      await loadSettings();
      alert('✅ تم حفظ التغييرات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ShareSettings, value: any) => {
    if (!currentSettings) return;
    const updated = { ...currentSettings, [field]: value };
    setCurrentSettings(updated);
    if (field === 'share_text_template' || field === 'emojis') {
      generatePreview(updated);
    }
  };

  const updateEmoji = (key: string, value: string) => {
    if (!currentSettings) return;
    const updatedEmojis = { ...currentSettings.emojis, [key]: value };
    updateField('emojis', updatedEmojis);
  };

  const testShare = async () => {
    if (!selectedType) return;

    const sampleData = selectedType === 'farm_detail' ? {
      farm_name: 'مزرعة الخالدية',
      location: 'الجوف - سكاكا',
      price: 2500,
      available_trees: 850,
      availability_text: '✅ متوفر 850 شجرة'
    } : {};

    await shareSettingsService.share(selectedType, sampleData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الروابط المشاركة</h2>
            <p className="text-sm text-gray-600">تحكم بالصور والنصوص والرموز لكل صفحة</p>
          </div>
        </div>
        <button
          onClick={testShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          اختبار المشاركة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">نوع الصفحة</h3>
          {PAGE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                selectedType === type.value
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-100'
              }`}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="font-medium">{type.label}</span>
            </button>
          ))}
        </div>

        {currentSettings && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">العناوين والأوصاف</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان (عربي)
                  </label>
                  <input
                    type="text"
                    value={currentSettings.og_title_ar}
                    onChange={e => updateField('og_title_ar', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-0"
                    placeholder="عنوان الصفحة عند المشاركة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={currentSettings.og_description_ar}
                    onChange={e => updateField('og_description_ar', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 resize-none"
                    placeholder="وصف مختصر للصفحة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={currentSettings.og_image_url}
                    onChange={e => updateField('og_image_url', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-0"
                    placeholder="https://example.com/image.jpg"
                  />
                  {currentSettings.og_image_url && (
                    <div className="mt-2">
                      <img
                        src={currentSettings.og_image_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Smile className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">الرموز التعبيرية</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {DEFAULT_EMOJIS.map(emoji => (
                  <div key={emoji.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {emoji.label}
                    </label>
                    <input
                      type="text"
                      value={currentSettings.emojis[emoji.key] || emoji.default}
                      onChange={e => updateEmoji(emoji.key, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 text-2xl text-center"
                      maxLength={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">قالب النص</h3>
              </div>

              <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-2xl p-5 border-2 border-gray-300 shadow-inner">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>محرر القالب النصي</span>
                </div>
                <textarea
                  value={currentSettings.share_text_template}
                  onChange={e => updateField('share_text_template', e.target.value)}
                  rows={14}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 font-mono text-base resize-none bg-white shadow-lg transition-all"
                  placeholder="اكتب القالب هنا... مثال:
{{emoji_tree}} {{farm_name}}
{{emoji_location}} {{location}}

{{emoji_money}} السعر: {{price}} ريال
{{emoji_check}} {{availability_text}}"
                  dir="ltr"
                  style={{
                    lineHeight: '2',
                    fontFamily: '"Fira Code", Consolas, Monaco, "Courier New", monospace',
                    letterSpacing: '0.5px'
                  }}
                />
              </div>

              <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl text-sm text-blue-900 border-2 border-blue-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">💡</div>
                  <div className="flex-1">
                    <strong className="block mb-3 text-base font-bold text-blue-800">المتغيرات المتاحة:</strong>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">الرموز التعبيرية:</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-emerald-50 rounded text-xs font-bold text-emerald-700">{'{{emoji_tree}}'}</code>
                            <span className="text-lg">🌳</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-emerald-50 rounded text-xs font-bold text-emerald-700">{'{{emoji_location}}'}</code>
                            <span className="text-lg">📍</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-emerald-50 rounded text-xs font-bold text-emerald-700">{'{{emoji_money}}'}</code>
                            <span className="text-lg">💰</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-emerald-50 rounded text-xs font-bold text-emerald-700">{'{{emoji_check}}'}</code>
                            <span className="text-lg">✅</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">البيانات الديناميكية:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-purple-50 rounded text-xs font-bold text-purple-700">{'{{farm_name}}'}</code>
                            <span className="text-xs text-gray-600">اسم المزرعة</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-purple-50 rounded text-xs font-bold text-purple-700">{'{{location}}'}</code>
                            <span className="text-xs text-gray-600">الموقع</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-purple-50 rounded text-xs font-bold text-purple-700">{'{{price}}'}</code>
                            <span className="text-xs text-gray-600">السعر</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                            <code className="px-2 py-1 bg-purple-50 rounded text-xs font-bold text-purple-700">{'{{available_trees}}'}</code>
                            <span className="text-xs text-gray-600">الأشجار المتاحة</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">معاينة النص النهائي</h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  مباشرة
                </span>
              </div>

              <div className="bg-white rounded-2xl p-6 whitespace-pre-line text-base leading-loose shadow-inner border-2 border-emerald-100" style={{ direction: 'rtl' }}>
                {previewText || (
                  <span className="text-gray-400 italic">ستظهر المعاينة هنا بعد كتابة القالب...</span>
                )}
              </div>

              <div className="mt-4 p-3 bg-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <span className="text-base">ℹ️</span>
                <span>هذه معاينة مع بيانات تجريبية. النص الفعلي يتغير حسب المزرعة المختارة.</span>
              </div>
            </div>

            {/* Sticky Save Button */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t-4 border-emerald-200 rounded-2xl shadow-2xl p-6 z-50">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 text-white rounded-2xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg font-bold"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xl">جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span className="text-xl">حفظ التغييرات</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => loadSettings()}
                  className="px-6 py-4 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  title="إعادة التحميل"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-3 text-center text-sm text-gray-600">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                  <span className="text-blue-600">💾</span>
                  <span>تذكر حفظ التغييرات قبل الخروج</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
