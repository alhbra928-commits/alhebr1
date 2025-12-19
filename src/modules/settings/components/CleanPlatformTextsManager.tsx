import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, Edit2, Check, X, Layout, Crown,
  Navigation, Loader, MousePointerClick, MessageCircle,
  Sparkles, MapPin, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlatformText {
  id: string;
  section: string;
  text_key: string;
  text_ar: string;
  text_en: string;
  location: string;
  description: string;
  display_order: number;
  editable: boolean;
}

interface SectionGroup {
  section: string;
  title: string;
  icon: any;
  color: string;
  priority: number;
  texts: PlatformText[];
  isExpanded: boolean;
}

const SECTIONS_CONFIG: Record<string, { title: string; icon: any; color: string; priority: number }> = {
  'header': {
    title: 'نصوص الهيدر (الواجهة الرسمية)',
    icon: Layout,
    color: 'from-blue-600 to-indigo-600',
    priority: 1
  },
  'hero': {
    title: 'نصوص الصفحة الرئيسية',
    icon: Crown,
    color: 'from-amber-600 to-yellow-600',
    priority: 2
  },
  'side_dock': {
    title: 'نصوص الشريط الجانبي',
    icon: Navigation,
    color: 'from-emerald-600 to-teal-600',
    priority: 3
  },
  'loader': {
    title: 'نصوص شاشة التحميل',
    icon: Loader,
    color: 'from-purple-600 to-pink-600',
    priority: 4
  },
  'buttons': {
    title: 'نصوص الأزرار العامة',
    icon: MousePointerClick,
    color: 'from-orange-600 to-red-600',
    priority: 5
  },
  'messages': {
    title: 'نصوص الرسائل والتنبيهات',
    icon: MessageCircle,
    color: 'from-cyan-600 to-blue-600',
    priority: 6
  }
};

export function CleanPlatformTextsManager() {
  const [sections, setSections] = useState<SectionGroup[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState({ text_ar: '', text_en: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .order('section, display_order');

      if (error) throw error;

      if (data) {
        // تجميع النصوص حسب الأقسام
        const groupedTexts: Record<string, PlatformText[]> = {};

        data.forEach((text) => {
          if (!groupedTexts[text.section]) {
            groupedTexts[text.section] = [];
          }
          groupedTexts[text.section].push(text);
        });

        // تحويل إلى SectionGroup[]
        const sectionsArray: SectionGroup[] = Object.keys(groupedTexts)
          .map(sectionKey => ({
            section: sectionKey,
            title: SECTIONS_CONFIG[sectionKey]?.title || sectionKey,
            icon: SECTIONS_CONFIG[sectionKey]?.icon || Sparkles,
            color: SECTIONS_CONFIG[sectionKey]?.color || 'from-gray-600 to-gray-700',
            priority: SECTIONS_CONFIG[sectionKey]?.priority || 999,
            texts: groupedTexts[sectionKey],
            isExpanded: sectionKey === 'header' // الهيدر مفتوح افتراضياً
          }))
          .sort((a, b) => a.priority - b.priority);

        setSections(sectionsArray);
      }
    } catch (error) {
      console.error('Error loading texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (text: PlatformText) => {
    setEditingId(text.id);
    setEditText({
      text_ar: text.text_ar,
      text_en: text.text_en
    });
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_texts')
        .update({
          text_ar: editText.text_ar,
          text_en: editText.text_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setSuccessMessage('تم الحفظ بنجاح!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingId(null);
      loadTexts();
    } catch (error) {
      console.error('Error saving:', error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setSections(prev =>
      prev.map(s =>
        s.section === section ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل النصوص...</p>
        </div>
      </div>
    );
  }

  const totalTexts = sections.reduce((sum, s) => sum + s.texts.length, 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Title */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">إدارة نصوص المنصة</h2>
            <p className="text-blue-100 text-lg">
              نظام منضبط يحتوي فقط على النصوص الموجودة فعلياً في المنصة
            </p>
          </div>
          <Sparkles className="w-16 h-16 opacity-80" />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
            <div className="text-2xl font-bold">{totalTexts}</div>
            <div className="text-sm text-blue-100">نص موجود</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
            <div className="text-2xl font-bold">{sections.length}</div>
            <div className="text-sm text-blue-100">قسم</div>
          </div>
          <button
            onClick={loadTexts}
            className="mr-auto px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            تحديث
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const SectionIcon = section.icon;

          return (
            <div
              key={section.section}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 dark:border-gray-700"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${section.color} text-white shadow-lg`}>
                    <SectionIcon className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {section.texts.length} {section.texts.length === 1 ? 'نص' : 'نصوص'}
                    </p>
                  </div>
                </div>
                {section.isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {/* Section Content */}
              {section.isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {section.texts.map((text, index) => (
                    <div
                      key={text.id}
                      className={`p-6 ${
                        index !== section.texts.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-750'
                          : ''
                      }`}
                    >
                      {/* Text Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-mono font-medium">
                              {text.text_key}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {text.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {text.location}
                            </span>
                          </div>
                        </div>
                        {text.editable && editingId !== text.id && (
                          <button
                            onClick={() => handleEdit(text)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5 text-gray-400" />
                          </button>
                        )}
                      </div>

                      {/* Text Content */}
                      {editingId === text.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              النص العربي
                            </label>
                            <input
                              type="text"
                              value={editText.text_ar}
                              onChange={(e) =>
                                setEditText({ ...editText, text_ar: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              النص الإنجليزي
                            </label>
                            <input
                              type="text"
                              value={editText.text_en}
                              onChange={(e) =>
                                setEditText({ ...editText, text_en: e.target.value })
                              }
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-lg"
                              dir="ltr"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSave(text.id)}
                              disabled={saving}
                              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                            >
                              <Check className="w-5 h-5" />
                              {saving ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={saving}
                              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              <X className="w-5 h-5" />
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                              النص العربي
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white" dir="rtl">
                              {text.text_ar}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
                              النص الإنجليزي
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white" dir="ltr">
                              {text.text_en}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
              نظام منضبط ونظيف
            </h4>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              هذا النظام يحتوي فقط على النصوص الموجودة فعلياً في المنصة. لا توجد نصوص افتراضية أو مستقبلية.
              جميع النصوص المعروضة هنا مستخدمة حالياً ويمكنك تعديلها بثقة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
