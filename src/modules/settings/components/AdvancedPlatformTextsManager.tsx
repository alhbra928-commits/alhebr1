import { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  Search,
  Edit2,
  Check,
  X,
  Copy,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Zap,
  Eye,
  Filter,
  Grid3x3,
  List,
  Globe,
  Languages,
  Hash,
  Tag,
  BookOpen
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
}

interface SectionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  sections: string[];
}

// ✅ الأقسام المستثناة (لها إدارات خاصة)
const EXCLUDED_SECTIONS = ['contact_bar', 'side_dock', 'loader', 'whatsapp', 'smart_button'];

// 🎨 تصنيفات الأقسام المبتكرة
const CATEGORIES: SectionCategory[] = [
  {
    id: 'main',
    name: 'الواجهة الرئيسية',
    icon: '🏠',
    color: 'from-emerald-500 to-teal-600',
    description: 'نصوص الصفحة الرئيسية والعرض الأول',
    sections: ['hero', 'features', 'benefits', 'stats', 'testimonials']
  },
  {
    id: 'content',
    name: 'المحتوى والبطاقات',
    icon: '📦',
    color: 'from-blue-500 to-indigo-600',
    description: 'نصوص بطاقات المزارع والعرض',
    sections: ['farm_cards', 'farm_details', 'owner_cards', 'investor_cards']
  },
  {
    id: 'interaction',
    name: 'عناصر التفاعل',
    icon: '🎯',
    color: 'from-purple-500 to-pink-600',
    description: 'الأزرار والرسائل والتنبيهات',
    sections: ['buttons', 'messages', 'alerts', 'notifications']
  },
  {
    id: 'navigation',
    name: 'التنقل والهيكل',
    icon: '🧭',
    color: 'from-amber-500 to-orange-600',
    description: 'قوائم التنقل والهيكل العام',
    sections: ['navigation', 'header', 'footer', 'sidebar']
  },
  {
    id: 'forms',
    name: 'النماذج والحجز',
    icon: '📝',
    color: 'from-cyan-500 to-blue-600',
    description: 'نماذج الإدخال والحجز',
    sections: ['booking', 'forms', 'validation', 'confirmation']
  },
  {
    id: 'search',
    name: 'البحث والفلترة',
    icon: '🔍',
    color: 'from-lime-500 to-green-600',
    description: 'نصوص البحث والتصفية',
    sections: ['search', 'filters', 'sorting', 'pagination']
  },
  {
    id: 'status',
    name: 'الحالات والرسائل',
    icon: '⚡',
    color: 'from-rose-500 to-red-600',
    description: 'رسائل النجاح والأخطاء',
    sections: ['success', 'errors', 'warnings', 'info']
  },
  {
    id: 'seo',
    name: 'SEO والميتا',
    icon: '🌐',
    color: 'from-violet-500 to-purple-600',
    description: 'نصوص تحسين محركات البحث',
    sections: ['seo', 'meta', 'og_tags', 'schema']
  }
];

export function AdvancedPlatformTextsManager() {
  const [texts, setTexts] = useState<PlatformText[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<PlatformText[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ text_ar: '', text_en: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero']));

  useEffect(() => {
    loadTexts();
  }, []);

  useEffect(() => {
    filterTexts();
  }, [texts, selectedCategory, searchTerm]);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .not('section', 'in', `(${EXCLUDED_SECTIONS.join(',')})`)
        .order('section')
        .order('display_order');

      if (error) throw error;
      setTexts(data || []);
    } catch (error) {
      console.error('Error loading texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTexts = () => {
    let filtered = texts;

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      const category = CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(t => category.sections.includes(t.section));
      }
    }

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.text_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.text_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTexts(filtered);
  };

  const startEdit = (text: PlatformText) => {
    setEditingId(text.id);
    setEditData({ text_ar: text.text_ar, text_en: text.text_en });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ text_ar: '', text_en: '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_texts')
        .update({
          text_ar: editData.text_ar,
          text_en: editData.text_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId);

      if (error) throw error;

      setTexts(prev => prev.map(t => t.id === editingId ? { ...t, ...editData } : t));
      setEditingId(null);
      showSuccess('تم الحفظ بنجاح!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('فشل الحفظ!');
    } finally {
      setSaving(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('تم النسخ!');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const exportTexts = () => {
    const dataStr = JSON.stringify(filteredTexts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `platform-texts-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSuccess('تم تصدير النصوص!');
  };

  // تجميع النصوص حسب القسم
  const groupedTexts = filteredTexts.reduce((acc, text) => {
    if (!acc[text.section]) {
      acc[text.section] = [];
    }
    acc[text.section].push(text);
    return acc;
  }, {} as Record<string, PlatformText[]>);

  const sections = Object.keys(groupedTexts);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل النصوص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black">إدارة نصوص المنصة</h2>
            <p className="text-emerald-100 mt-1">نظام متطور وشامل لإدارة جميع نصوص المنصة</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black">{texts.length}</div>
            <div className="text-emerald-100 text-sm mt-1">إجمالي النصوص</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black">{sections.length}</div>
            <div className="text-emerald-100 text-sm mt-1">عدد الأقسام</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-black">{filteredTexts.length}</div>
            <div className="text-emerald-100 text-sm mt-1">نتائج البحث</div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-900 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في النصوص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* View Mode */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-md text-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-md text-emerald-600'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={loadTexts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">تحديث</span>
            </button>
            <button
              onClick={exportTexts}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
            >
              <Download className="h-5 w-5" />
              <span className="hidden lg:inline">تصدير</span>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌟 الكل ({texts.length})
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Texts by Section */}
      {sections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">لا توجد نصوص مطابقة للبحث</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map(section => {
            const sectionTexts = groupedTexts[section];
            const isExpanded = expandedSections.has(section);

            return (
              <div key={section} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-bold text-gray-900">{section}</h3>
                      <p className="text-sm text-gray-500">{sectionTexts.length} نص</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                      {sectionTexts.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {sectionTexts.map(text => (
                          <TextCard
                            key={text.id}
                            text={text}
                            isEditing={editingId === text.id}
                            editData={editData}
                            onEdit={startEdit}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            onCopy={copyText}
                            onChange={setEditData}
                            saving={saving}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sectionTexts.map(text => (
                          <TextRow
                            key={text.id}
                            text={text}
                            isEditing={editingId === text.id}
                            editData={editData}
                            onEdit={startEdit}
                            onSave={saveEdit}
                            onCancel={cancelEdit}
                            onCopy={copyText}
                            onChange={setEditData}
                            saving={saving}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Card View Component
interface TextComponentProps {
  text: PlatformText;
  isEditing: boolean;
  editData: { text_ar: string; text_en: string };
  onEdit: (text: PlatformText) => void;
  onSave: () => void;
  onCancel: () => void;
  onCopy: (text: string) => void;
  onChange: (data: { text_ar: string; text_en: string }) => void;
  saving: boolean;
}

function TextCard({
  text,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  onCopy,
  onChange,
  saving
}: TextComponentProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-5 hover:border-emerald-500 transition-all">
      {/* Key */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-emerald-600" />
          <span className="font-mono text-sm text-gray-700 font-medium">{text.key}</span>
        </div>
        {text.editable && !isEditing && (
          <button
            onClick={() => onEdit(text)}
            className="p-2 hover:bg-emerald-100 rounded-lg transition-all"
          >
            <Edit2 className="h-4 w-4 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Description */}
      {text.description && (
        <p className="text-xs text-gray-500 mb-3 italic">{text.description}</p>
      )}

      {isEditing ? (
        <div className="space-y-3">
          {/* Arabic */}
          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Languages className="h-3 w-3" />
              النص العربي
            </label>
            <textarea
              value={editData.text_ar}
              onChange={(e) => onChange({ ...editData, text_ar: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
              rows={2}
            />
          </div>

          {/* English */}
          <div>
            <label className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <Globe className="h-3 w-3" />
              English Text
            </label>
            <textarea
              value={editData.text_en}
              onChange={(e) => onChange({ ...editData, text_en: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
              rows={2}
              dir="ltr"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              حفظ
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Arabic */}
          <div className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">🇸🇦 العربي</span>
              <button
                onClick={() => onCopy(text.text_ar)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
              >
                <Copy className="h-3 w-3 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-100">
              {text.text_ar}
            </p>
          </div>

          {/* English */}
          {text.text_en && (
            <div className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">🇬🇧 English</span>
                <button
                  onClick={() => onCopy(text.text_en)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                >
                  <Copy className="h-3 w-3 text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border border-gray-100" dir="ltr">
                {text.text_en}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// List View Component
function TextRow({
  text,
  isEditing,
  editData,
  onEdit,
  onSave,
  onCancel,
  onCopy,
  onChange,
  saving
}: TextComponentProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-500 transition-all">
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-3">
            <Tag className="h-4 w-4 text-emerald-600" />
            <span className="font-mono text-sm text-gray-700 font-medium">{text.key}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">النص العربي</label>
              <textarea
                value={editData.text_ar}
                onChange={(e) => onChange({ ...editData, text_ar: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">English Text</label>
              <textarea
                value={editData.text_en}
                onChange={(e) => onChange({ ...editData, text_en: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none text-sm"
                rows={2}
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              حفظ
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag className="h-3 w-3 text-gray-400" />
                <span className="font-mono text-xs text-gray-500">{text.key}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900">{text.text_ar}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600" dir="ltr">{text.text_en}</p>
            </div>
          </div>
          {text.editable && (
            <button
              onClick={() => onEdit(text)}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-all"
            >
              <Edit2 className="h-4 w-4 text-emerald-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
