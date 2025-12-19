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

              <textarea
                value={currentSettings.share_text_template}
                onChange={e => updateField('share_text_template', e.target.value)}
                rows={8}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 font-mono text-sm resize-none"
                placeholder="استخدم {{emoji_tree}} للرموز و {{farm_name}} للبيانات"
                dir="ltr"
              />

              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>المتغيرات المتاحة:</strong>
                <div className="mt-2 space-y-1">
                  <div>• <code>{'{{emoji_tree}}'}</code>, <code>{'{{emoji_location}}'}</code>, <code>{'{{emoji_money}}'}</code>, etc.</div>
                  <div>• <code>{'{{farm_name}}'}</code>, <code>{'{{location}}'}</code>, <code>{'{{price}}'}</code></div>
                  <div>• <code>{'{{available_trees}}'}</code>, <code>{'{{availability_text}}'}</code></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">معاينة النص</h3>
              </div>

              <div className="bg-white rounded-lg p-4 whitespace-pre-line text-sm leading-relaxed">
                {previewText}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </>
                )}
              </button>

              <button
                onClick={() => loadSettings()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
