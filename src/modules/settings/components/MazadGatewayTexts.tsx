import React, { useState, useEffect } from 'react';
import { Type, Save, RotateCcw, Info, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GatewayTexts {
  id?: string;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  button_text: string;
  show_title: boolean;
  show_subtitle: boolean;
}

export function MazadGatewayTexts() {
  const [texts, setTexts] = useState<GatewayTexts>({
    title_line1: 'بوابة',
    title_line2: 'مزاد',
    subtitle: 'منصة استثمار زراعي متطورة',
    button_text: 'ادخل إلى المنصة',
    show_title: true,
    show_subtitle: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mazad_gateway_settings')
        .select('id, title_line1, title_line2, subtitle, button_text, show_title, show_subtitle')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTexts({
          id: data.id,
          title_line1: data.title_line1 || 'بوابة',
          title_line2: data.title_line2 || 'مزاد',
          subtitle: data.subtitle || 'منصة استثمار زراعي متطورة',
          button_text: data.button_text || 'ادخل إلى المنصة',
          show_title: data.show_title ?? true,
          show_subtitle: data.show_subtitle ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading texts:', error);
      showMessage('error', 'فشل تحميل النصوص');
    } finally {
      setLoading(false);
    }
  };

  const saveTexts = async () => {
    try {
      setSaving(true);

      const updateData = {
        title_line1: texts.title_line1,
        title_line2: texts.title_line2,
        subtitle: texts.subtitle,
        button_text: texts.button_text,
        show_title: texts.show_title,
        show_subtitle: texts.show_subtitle,
      };

      // محاولة التحديث أولاً
      const { data: updated, error: updateError } = await supabase
        .from('mazad_gateway_settings')
        .update(updateData)
        .eq('id', texts.id || 'd06bd962-d0a4-411a-a510-7deedb987839')
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Update error:', updateError);
        // إذا فشل التحديث، حاول الإنشاء
        const { error: insertError } = await supabase
          .from('mazad_gateway_settings')
          .insert([updateData]);

        if (insertError) throw insertError;
      }

      showMessage('success', '✅ تم حفظ النصوص بنجاح!');

      // تحديث الحالة المحلية
      await loadTexts();
    } catch (error) {
      console.error('Error saving texts:', error);
      showMessage('error', 'فشل حفظ النصوص: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setTexts({
      ...texts,
      title_line1: 'بوابة',
      title_line2: 'مزاد',
      subtitle: 'منصة استثمار زراعي متطورة',
      button_text: 'ادخل إلى المنصة',
      show_title: true,
      show_subtitle: true,
    });
    showMessage('success', 'تم استعادة النصوص الافتراضية');
  };

  const clearText = (field: keyof GatewayTexts) => {
    if (typeof texts[field] === 'string') {
      setTexts({ ...texts, [field]: '' });
    }
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
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-2">
          <Type className="w-10 h-10" />
          <h2 className="text-3xl font-black">إدارة نصوص البوابة</h2>
        </div>
        <p className="text-white/80 text-lg">تحكم كامل في جميع النصوص والعناوين</p>
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

      {/* Title Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
            <Type className="w-6 h-6" />
            العنوان الرئيسي
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={texts.show_title}
              onChange={(e) => setTexts({ ...texts, show_title: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                        peer-checked:after:translate-x-full peer-checked:after:border-white
                        after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                        after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                        peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Title Line 1 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="font-bold text-gray-900">السطر الأول</span>
            <button
              onClick={() => clearText('title_line1')}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <EyeOff className="w-4 h-4" />
              مسح
            </button>
          </label>
          <input
            type="text"
            value={texts.title_line1}
            onChange={(e) => setTexts({ ...texts, title_line1: e.target.value })}
            placeholder="بوابة"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                     focus:border-purple-500 focus:outline-none text-2xl font-bold text-center"
          />
          <p className="text-sm text-gray-600 text-center">سيظهر بخط gradient أخضر</p>
        </div>

        {/* Title Line 2 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="font-bold text-gray-900">السطر الثاني</span>
            <button
              onClick={() => clearText('title_line2')}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <EyeOff className="w-4 h-4" />
              مسح
            </button>
          </label>
          <input
            type="text"
            value={texts.title_line2}
            onChange={(e) => setTexts({ ...texts, title_line2: e.target.value })}
            placeholder="مزاد"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                     focus:border-purple-500 focus:outline-none text-2xl font-bold text-center"
          />
          <p className="text-sm text-gray-600 text-center">سيظهر بخط gradient أخضر داكن</p>
        </div>
      </div>

      {/* Subtitle Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
            <Type className="w-6 h-6" />
            النص الفرعي
          </h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={texts.show_subtitle}
              onChange={(e) => setTexts({ ...texts, show_subtitle: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer
                        peer-checked:after:translate-x-full peer-checked:after:border-white
                        after:content-[''] after:absolute after:top-0.5 after:right-[4px]
                        after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all
                        peer-checked:bg-pink-600"></div>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="font-bold text-gray-900">النص الفرعي</span>
            <button
              onClick={() => clearText('subtitle')}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <EyeOff className="w-4 h-4" />
              مسح
            </button>
          </label>
          <textarea
            value={texts.subtitle}
            onChange={(e) => setTexts({ ...texts, subtitle: e.target.value })}
            placeholder="منصة استثمار زراعي متطورة"
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                     focus:border-pink-500 focus:outline-none text-lg text-center resize-none"
          />
          <p className="text-sm text-gray-600 text-center">نص توضيحي تحت العنوان</p>
        </div>
      </div>

      {/* Button Text */}
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
          <Type className="w-6 h-6" />
          نص الزر
        </h3>

        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span className="font-bold text-gray-900">نص زر الدخول</span>
            <button
              onClick={() => clearText('button_text')}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <EyeOff className="w-4 h-4" />
              مسح
            </button>
          </label>
          <input
            type="text"
            value={texts.button_text}
            onChange={(e) => setTexts({ ...texts, button_text: e.target.value })}
            placeholder="ادخل إلى المنصة"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl
                     focus:border-emerald-500 focus:outline-none text-lg font-bold text-center"
          />
          <p className="text-sm text-gray-600 text-center">النص الذي يظهر على زر الدخول</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-2xl p-8 border-2 border-emerald-200">
        <h3 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-2">
          <Eye className="w-6 h-6" />
          معاينة النصوص
        </h3>

        <div className="space-y-6 text-center">
          {texts.show_title && (texts.title_line1 || texts.title_line2) && (
            <div>
              {texts.title_line1 && (
                <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700
                             bg-clip-text text-transparent mb-2">
                  {texts.title_line1}
                </h1>
              )}
              {texts.title_line2 && (
                <h1 className="text-5xl font-black bg-gradient-to-r from-green-700 via-emerald-800 to-green-900
                             bg-clip-text text-transparent">
                  {texts.title_line2}
                </h1>
              )}
            </div>
          )}

          {texts.show_subtitle && texts.subtitle && (
            <p className="text-emerald-700/80 text-lg font-medium">
              {texts.subtitle}
            </p>
          )}

          {texts.button_text && (
            <button className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-green-600
                             text-white rounded-2xl font-bold text-lg shadow-xl">
              {texts.button_text}
            </button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-2">
            <p className="font-bold">نصائح:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>يمكنك مسح أي نص لإخفائه تماماً</li>
              <li>استخدم toggle لإخفاء/إظهار العنوان أو النص الفرعي</li>
              <li>المعاينة تعرض شكل النصوص كما ستظهر في البوابة</li>
              <li>التغييرات تُطبق فوراً بعد الحفظ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveTexts}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                   bg-gradient-to-r from-purple-600 to-pink-600 text-white
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
              حفظ جميع النصوص
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
