import { useState, useEffect } from 'react';
import { Save, RefreshCw, Settings, Phone, Home, User, Brain } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SideDockText {
  id: string;
  key: string;
  text_ar: string;
  text_en: string;
  description: string;
}

export function SideDockSettings() {
  const [texts, setTexts] = useState<SideDockText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .eq('section', 'side_dock')
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (data) setTexts(data);
    } catch (error) {
      console.error('Error loading side dock settings:', error);
      alert('فشل تحميل إعدادات الشريط الجانبي');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (textId: string, updatedText: Partial<SideDockText>) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_texts')
        .update({
          text_ar: updatedText.text_ar,
          text_en: updatedText.text_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', textId);

      if (error) throw error;

      setTexts(prev => prev.map(text =>
        text.id === textId ? { ...text, ...updatedText } : text
      ));

      setSuccessMessage('تم الحفظ بنجاح ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (id: string, field: 'text_ar' | 'text_en', value: string) => {
    setTexts(prev => prev.map(text =>
      text.id === id ? { ...text, [field]: value } : text
    ));
  };

  const getIconForKey = (key: string) => {
    if (key.includes('home')) return <Home className="w-5 h-5" />;
    if (key.includes('account')) return <User className="w-5 h-5" />;
    if (key.includes('phone')) return <Phone className="w-5 h-5" />;
    if (key.includes('smart')) return <Brain className="w-5 h-5" />;
    return <Settings className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8" />
          <h2 className="text-2xl font-bold">إعدادات الشريط الجانبي</h2>
        </div>
        <p className="text-emerald-50">تحكم في نصوص وإعدادات الشريط الجانبي للتنقل</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-green-700 font-bold text-center animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid gap-4">
        {texts.map((text) => {
          const isButton = text.key.includes('button');
          const isTooltip = text.key.includes('tooltip');
          const isSetting = text.key.includes('number') || text.key.includes('state') || text.key.includes('position');

          return (
            <div
              key={text.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                isButton ? 'border-emerald-200' :
                isTooltip ? 'border-blue-200' :
                isSetting ? 'border-amber-200' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isButton ? 'bg-emerald-100 text-emerald-600' :
                  isTooltip ? 'bg-blue-100 text-blue-600' :
                  isSetting ? 'bg-amber-100 text-amber-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {getIconForKey(text.key)}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{text.description}</h3>
                    <p className="text-sm text-gray-500">المفتاح: {text.key}</p>
                    {isButton && (
                      <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold">
                        زر تنقل
                      </span>
                    )}
                    {isTooltip && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                        تلميح
                      </span>
                    )}
                    {isSetting && (
                      <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">
                        إعداد
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        النص بالعربية
                      </label>
                      <input
                        type="text"
                        value={text.text_ar}
                        onChange={(e) => handleInputChange(text.id, 'text_ar', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        النص بالإنجليزية
                      </label>
                      <input
                        type="text"
                        value={text.text_en}
                        onChange={(e) => handleInputChange(text.id, 'text_en', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave(text.id, { text_ar: text.text_ar, text_en: text.text_en })}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">ℹ️ معلومات مهمة</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">•</span>
            <span>أزرار التنقل: تظهر في الشريط الجانبي للتنقل السريع</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>التلميحات: تظهر عند التمرير على الأزرار</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">•</span>
            <span>الإعدادات: تتحكم في سلوك وموضع الشريط</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 font-bold">•</span>
            <span>التغييرات تطبق فوراً بعد الحفظ في الواجهة العامة</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
