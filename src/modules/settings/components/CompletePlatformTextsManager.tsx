import { useState, useEffect } from 'react';
import { Save, RefreshCw, Search, Edit2, Check, X, Copy, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlatformText {
  id: string;
  section: string;
  key: string;
  text_ar: string;
  text_en: string;
  description: string;
  editable: boolean;
  display_order: number;
}

interface SectionData {
  section: string;
  texts: PlatformText[];
  isExpanded: boolean;
}

// أسماء الأقسام بالعربية
const SECTION_NAMES: Record<string, { name: string; icon: string; description: string }> = {
  'hero': { name: 'البطل الرئيسي', icon: '🎯', description: 'القسم الرئيسي في أعلى الصفحة' },
  'header': { name: 'الرأس العلوي', icon: '📋', description: 'شريط التنقل العلوي' },
  'footer': { name: 'التذييل السفلي', icon: '📄', description: 'القسم السفلي من الصفحة' },
  'home': { name: 'الصفحة الرئيسية', icon: '🏠', description: 'نصوص الصفحة الرئيسية' },
  'buttons': { name: 'الأزرار', icon: '🔘', description: 'نصوص جميع الأزرار' },
  'farm_cards': { name: 'بطاقات المزارع', icon: '🌾', description: 'نصوص بطاقات عرض المزارع' },
  'navigation': { name: 'التنقل', icon: '🧭', description: 'قوائم التنقل والروابط' },
  'steps': { name: 'الخطوات', icon: '📝', description: 'خطوات العملية والإجراءات' },
  'benefits': { name: 'الفوائد والمميزات', icon: '⭐', description: 'مميزات وفوائد المنصة' },
  'messages': { name: 'الرسائل', icon: '💬', description: 'رسائل النظام والإشعارات' },
  'features': { name: 'الميزات', icon: '✨', description: 'ميزات المنصة' },
  'stats': { name: 'الإحصائيات', icon: '📊', description: 'نصوص الإحصائيات' },
  'contact_bar': { name: 'شريط التواصل', icon: '📞', description: 'معلومات التواصل' },
  'side_dock': { name: 'الشريط الجانبي', icon: '🎛️', description: 'أدوات التنقل الجانبي السريع' },
  'loader': { name: 'شاشة التحميل', icon: '👑', description: 'تاج مزادات وشاشة الانتظار' },
  'cta': { name: 'دعوات الإجراء', icon: '🎬', description: 'نصوص دعوات الإجراء' },
  'about': { name: 'من نحن', icon: 'ℹ️', description: 'نصوص صفحة من نحن' },
  'contact': { name: 'اتصل بنا', icon: '📧', description: 'نصوص صفحة اتصل بنا' }
};

export function CompletePlatformTextsManager() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState({ text_ar: '', text_en: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAllTexts();
  }, []);

  const loadAllTexts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data) {
        // تجميع النصوص حسب الأقسام
        const sectionsMap: Record<string, PlatformText[]> = {};

        data.forEach((text) => {
          if (!sectionsMap[text.section]) {
            sectionsMap[text.section] = [];
          }
          sectionsMap[text.section].push(text);
        });

        // تحويل إلى مصفوفة
        const sectionsArray: SectionData[] = Object.keys(sectionsMap).map((section) => ({
          section,
          texts: sectionsMap[section],
          isExpanded: false // البداية: جميع الأقسام مطوية
        }));

        setSections(sectionsArray);
      }
    } catch (error) {
      console.error('Error loading texts:', error);
      alert('فشل تحميل النصوص');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (text: PlatformText) => {
    if (!text.editable) {
      alert('هذا النص غير قابل للتعديل لأنه مرتبط بمصدر آخر');
      return;
    }
    setEditingId(text.id);
    setEditText({ text_ar: text.text_ar, text_en: text.text_en });
  };

  const handleSave = async (textId: string) => {
    if (!editText.text_ar.trim()) {
      alert('النص العربي مطلوب');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_texts')
        .update({
          text_ar: editText.text_ar.trim(),
          text_en: editText.text_en.trim() || editText.text_ar.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', textId);

      if (error) throw error;

      // تحديث الحالة المحلية
      setSections(prev => prev.map(section => ({
        ...section,
        texts: section.texts.map(text =>
          text.id === textId
            ? { ...text, text_ar: editText.text_ar.trim(), text_en: editText.text_en.trim() || editText.text_ar.trim() }
            : text
        )
      })));

      setEditingId(null);
      setSuccessMessage('تم الحفظ بنجاح ✅');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving text:', error);
      alert('فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText({ text_ar: '', text_en: '' });
  };

  const toggleSection = (sectionName: string) => {
    setSections(prev => prev.map(section =>
      section.section === sectionName
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ));
  };

  const expandAll = () => {
    setSections(prev => prev.map(section => ({ ...section, isExpanded: true })));
  };

  const collapseAll = () => {
    setSections(prev => prev.map(section => ({ ...section, isExpanded: false })));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('تم النسخ ✅');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // تصفية الأقسام والنصوص
  const filteredSections = sections
    .filter(section => filterSection === 'all' || section.section === filterSection)
    .map(section => ({
      ...section,
      texts: section.texts.filter(text =>
        searchTerm === '' ||
        text.text_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.text_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        text.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(section => section.texts.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل النصوص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8" />
          <h2 className="text-2xl font-bold">إدارة نصوص المنصة الشاملة</h2>
        </div>
        <p className="text-emerald-50">تحكم في جميع النصوص الظاهرة في الواجهة الرئيسية للمنصة</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-green-700 font-bold text-center animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في النصوص..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">جميع الأقسام ({sections.length})</option>
              {sections.map((section) => (
                <option key={section.section} value={section.section}>
                  {SECTION_NAMES[section.section]?.icon || '📝'} {SECTION_NAMES[section.section]?.name || section.section} ({section.texts.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ChevronDown className="w-4 h-4" />
            توسيع الكل
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <ChevronUp className="w-4 h-4" />
            طي الكل
          </button>
          <button
            onClick={loadAllTexts}
            className="mr-auto px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-600 mb-1">إجمالي الأقسام</p>
          <p className="text-2xl font-bold text-blue-700">{sections.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-600 mb-1">إجمالي النصوص</p>
          <p className="text-2xl font-bold text-emerald-700">
            {sections.reduce((acc, section) => acc + section.texts.length, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-600 mb-1">قابلة للتعديل</p>
          <p className="text-2xl font-bold text-amber-700">
            {sections.reduce((acc, section) =>
              acc + section.texts.filter(t => t.editable).length, 0
            )}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-sm text-purple-600 mb-1">محمية</p>
          <p className="text-2xl font-bold text-purple-700">
            {sections.reduce((acc, section) =>
              acc + section.texts.filter(t => !t.editable).length, 0
            )}
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">لا توجد نتائج مطابقة للبحث</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const sectionInfo = SECTION_NAMES[section.section] || {
              name: section.section,
              icon: '📝',
              description: ''
            };

            return (
              <div
                key={section.section}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sectionInfo.icon}</span>
                    <div className="text-right">
                      <h3 className="text-lg font-bold text-gray-800">{sectionInfo.name}</h3>
                      <p className="text-sm text-gray-500">{sectionInfo.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {section.texts.length} نص
                    </span>
                    {section.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Section Content */}
                {section.isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="divide-y divide-gray-100">
                      {section.texts.map((text) => (
                        <div
                          key={text.id}
                          className={`p-4 ${!text.editable ? 'bg-gray-50' : 'hover:bg-emerald-50/30'} transition-colors`}
                        >
                          {editingId === text.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  النص بالعربية *
                                </label>
                                <input
                                  type="text"
                                  value={editText.text_ar}
                                  onChange={(e) => setEditText({ ...editText, text_ar: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  النص بالإنجليزية
                                </label>
                                <input
                                  type="text"
                                  value={editText.text_en}
                                  onChange={(e) => setEditText({ ...editText, text_en: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  dir="ltr"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSave(text.id)}
                                  disabled={saving}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" />
                                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  disabled={saving}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" />
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                                    {text.key}
                                  </code>
                                  {!text.editable && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                      محمي
                                    </span>
                                  )}
                                </div>
                                {text.description && (
                                  <p className="text-xs text-gray-500">{text.description}</p>
                                )}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">🇸🇦</span>
                                    <p className="text-gray-800 font-medium">{text.text_ar}</p>
                                    <button
                                      onClick={() => copyText(text.text_ar)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title="نسخ"
                                    >
                                      <Copy className="w-3 h-3 text-gray-500" />
                                    </button>
                                  </div>
                                  {text.text_en && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700">🇬🇧</span>
                                      <p className="text-gray-600 text-sm" dir="ltr">{text.text_en}</p>
                                      <button
                                        onClick={() => copyText(text.text_en)}
                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        title="نسخ"
                                      >
                                        <Copy className="w-3 h-3 text-gray-500" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {text.editable && (
                                <button
                                  onClick={() => handleEdit(text)}
                                  className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex-shrink-0"
                                  title="تعديل"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
          <span>ℹ️</span>
          ملاحظات هامة
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold">✅</span>
            <span>النصوص <strong>القابلة للتعديل</strong> يمكن تغييرها بحرية</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">🔒</span>
            <span>النصوص <strong>المحمية</strong> مرتبطة بمصادر أخرى (مثل البوابة الملكية أو الإعدادات الديناميكية)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">🔄</span>
            <span>التغييرات تظهر فوراً في الواجهة الرئيسية بعد الحفظ</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 font-bold">⚠️</span>
            <span>يُنصح بنسخ النص الأصلي قبل التعديل للرجوع إليه عند الحاجة</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
