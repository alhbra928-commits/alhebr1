import { useState, useEffect } from 'react';
import {
  Save, RefreshCw, Search, Edit2, Check, X, MapPin,
  Code, Info, Eye, Filter, FileText, ChevronDown, ChevronUp,
  Home, Layout, Loader, Phone, Navigation, Grid, AlertCircle
} from 'lucide-react';
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
  page_location?: string;
  component_name?: string;
  usage_context?: string;
  visual_location?: string;
  is_active?: boolean;
}

interface SectionData {
  section: string;
  texts: PlatformText[];
  isExpanded: boolean;
}

const SECTION_INFO: Record<string, {
  name: string;
  icon: any;
  color: string;
  category: string;
  priority: number;
}> = {
  'header': {
    name: 'الرأس (Header)',
    icon: Layout,
    color: 'text-blue-600 dark:text-blue-400',
    category: 'التنقل والهيكل',
    priority: 1
  },
  'side_dock': {
    name: 'الشريط الجانبي',
    icon: Navigation,
    color: 'text-purple-600 dark:text-purple-400',
    category: 'التنقل والهيكل',
    priority: 2
  },
  'loader': {
    name: 'شاشة التحميل',
    icon: Loader,
    color: 'text-amber-600 dark:text-amber-400',
    category: 'التنقل والهيكل',
    priority: 3
  },
  'contact_bar': {
    name: 'شريط التواصل',
    icon: Phone,
    color: 'text-green-600 dark:text-green-400',
    category: 'التواصل',
    priority: 4
  },
  'bottom_nav': {
    name: 'التنقل السفلي',
    icon: Grid,
    color: 'text-indigo-600 dark:text-indigo-400',
    category: 'التنقل والهيكل',
    priority: 5
  },
  'farm_cards': {
    name: 'بطاقات المزارع',
    icon: Home,
    color: 'text-emerald-600 dark:text-emerald-400',
    category: 'المحتوى',
    priority: 6
  }
};

export function EnhancedPlatformTextsManager() {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState({ text_ar: '', text_en: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [showInactiveTexts, setShowInactiveTexts] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAllTexts();
  }, [showInactiveTexts]);

  const loadAllTexts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('platform_texts')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (!showInactiveTexts) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const sectionsMap: Record<string, PlatformText[]> = {};

        data.forEach((text) => {
          if (!sectionsMap[text.section]) {
            sectionsMap[text.section] = [];
          }
          sectionsMap[text.section].push(text);
        });

        const sectionsArray: SectionData[] = Object.keys(sectionsMap)
          .sort((a, b) => {
            const priorityA = SECTION_INFO[a]?.priority || 999;
            const priorityB = SECTION_INFO[b]?.priority || 999;
            return priorityA - priorityB;
          })
          .map(section => ({
            section,
            texts: sectionsMap[section],
            isExpanded: ['header', 'side_dock', 'loader'].includes(section)
          }));

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
      loadAllTexts();
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

  const getFilteredTexts = (texts: PlatformText[]) => {
    if (!searchTerm) return texts;

    const term = searchTerm.toLowerCase();
    return texts.filter(
      text =>
        text.text_ar.toLowerCase().includes(term) ||
        text.text_en.toLowerCase().includes(term) ||
        text.key.toLowerCase().includes(term) ||
        text.description?.toLowerCase().includes(term) ||
        text.page_location?.toLowerCase().includes(term) ||
        text.component_name?.toLowerCase().includes(term)
    );
  };

  const getSectionIcon = (section: string) => {
    const info = SECTION_INFO[section];
    if (!info) return AlertCircle;
    return info.icon;
  };

  const getSectionColor = (section: string) => {
    return SECTION_INFO[section]?.color || 'text-gray-600 dark:text-gray-400';
  };

  const getSectionName = (section: string) => {
    return SECTION_INFO[section]?.name || section;
  };

  const filteredSections = filterSection === 'all'
    ? sections
    : sections.filter(s => s.section === filterSection);

  const totalTexts = sections.reduce((sum, s) => sum + s.texts.length, 0);
  const activeTexts = sections.reduce((sum, s) =>
    sum + s.texts.filter(t => t.is_active !== false).length, 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل النصوص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">إدارة نصوص المنصة المتطورة</h2>
            <p className="text-emerald-100">
              إدارة شاملة لجميع النصوص مع تتبع دقيق للمواقع والمكونات
            </p>
          </div>
          <FileText className="w-12 h-12 opacity-80" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{totalTexts}</div>
            <div className="text-sm text-emerald-100">إجمالي النصوص</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{activeTexts}</div>
            <div className="text-sm text-emerald-100">النصوص النشطة</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold mb-1">{sections.length}</div>
            <div className="text-sm text-emerald-100">الأقسام</div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث في النصوص، الأقسام، المواقع، أو المكونات..."
              className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">جميع الأقسام</option>
            {sections.map(({ section }) => (
              <option key={section} value={section}>
                {getSectionName(section)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowInactiveTexts(!showInactiveTexts)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              showInactiveTexts
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600'
            }`}
          >
            {showInactiveTexts ? 'إخفاء النصوص القديمة' : 'عرض النصوص القديمة'}
          </button>

          <button
            onClick={loadAllTexts}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            تحديث
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {filteredSections.map(({ section, texts, isExpanded }) => {
          const filteredTexts = getFilteredTexts(texts);
          if (filteredTexts.length === 0 && searchTerm) return null;

          const SectionIcon = getSectionIcon(section);
          const sectionColor = getSectionColor(section);

          return (
            <div
              key={section}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 dark:border-gray-700"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-700 ${sectionColor}`}>
                    <SectionIcon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {getSectionName(section)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredTexts.length} {filteredTexts.length === 1 ? 'نص' : 'نصوص'}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {filteredTexts.map((text, index) => (
                    <div
                      key={text.id}
                      className={`p-6 ${
                        index !== filteredTexts.length - 1
                          ? 'border-b border-gray-100 dark:border-gray-750'
                          : ''
                      } ${
                        text.is_active === false
                          ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60'
                          : ''
                      }`}
                    >
                      {/* Text Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-mono">
                              {text.key}
                            </code>
                            {text.is_active === false && (
                              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium">
                                نص قديم
                              </span>
                            )}
                          </div>
                          {text.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {text.description}
                            </p>
                          )}
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

                      {/* Location Info */}
                      {(text.page_location || text.visual_location || text.component_name) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-4 space-y-2">
                          {text.page_location && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">
                                  الصفحة
                                </div>
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                  {text.page_location}
                                </div>
                              </div>
                            </div>
                          )}
                          {text.visual_location && (
                            <div className="flex items-start gap-2">
                              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">
                                  الموقع البصري
                                </div>
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                  {text.visual_location}
                                </div>
                              </div>
                            </div>
                          )}
                          {text.component_name && (
                            <div className="flex items-start gap-2">
                              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">
                                  المكون
                                </div>
                                <code className="text-sm text-blue-900 dark:text-blue-100 font-mono">
                                  {text.component_name}
                                </code>
                              </div>
                            </div>
                          )}
                          {text.usage_context && (
                            <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-0.5">
                                  السياق
                                </div>
                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                  {text.usage_context}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text Content */}
                      {editingId === text.id ? (
                        <div className="space-y-3">
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
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl focus:ring-2 focus:ring-emerald-500"
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
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(text.id)}
                              disabled={saving}
                              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
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
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800">
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                              النص العربي
                            </div>
                            <div className="text-base font-medium text-gray-900 dark:text-white">
                              {text.text_ar}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                              النص الإنجليزي
                            </div>
                            <div className="text-base font-medium text-gray-900 dark:text-white" dir="ltr">
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

      {filteredSections.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            لا توجد نصوص تطابق البحث
          </p>
        </div>
      )}
    </div>
  );
}
