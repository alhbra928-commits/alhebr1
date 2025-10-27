import React, { useState, useEffect } from 'react';
import {
  Type,
  Languages,
  Save,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface PlatformText {
  id: string;
  section: string;
  key: string;
  text_ar: string;
  text_en: string;
  description: string;
  display_order: number;
  editable: boolean;
}

interface EditingText {
  id: string;
  text_ar: string;
  text_en: string;
}

const SECTION_LABELS: Record<string, { ar: string; en: string; icon: string; color: string }> = {
  header: { ar: 'الهيدر (الرأس)', en: 'Header', icon: '🎯', color: 'from-blue-500 to-blue-600' },
  footer: { ar: 'الفوتر (التذييل)', en: 'Footer', icon: '📋', color: 'from-green-500 to-green-600' },
  contact_bar: { ar: 'الشريط السفلي (شريط التواصل)', en: 'Contact Bar', icon: '📱', color: 'from-emerald-500 to-emerald-600' },
  hero: { ar: 'القسم البطولي', en: 'Hero Section', icon: '🌟', color: 'from-purple-500 to-purple-600' },
  stats: { ar: 'الإحصائيات', en: 'Statistics', icon: '📊', color: 'from-orange-500 to-orange-600' },
  features: { ar: 'المميزات', en: 'Features', icon: '✨', color: 'from-pink-500 to-pink-600' },
  about: { ar: 'من نحن', en: 'About', icon: '👥', color: 'from-indigo-500 to-indigo-600' },
  contact: { ar: 'اتصل بنا', en: 'Contact', icon: '📞', color: 'from-teal-500 to-teal-600' },
  home: { ar: 'الصفحة الرئيسية', en: 'Home', icon: '🏠', color: 'from-cyan-500 to-cyan-600' },
  cta: { ar: 'دعوة للعمل', en: 'Call to Action', icon: '🎯', color: 'from-red-500 to-red-600' }
};

export const PlatformTextsManager: React.FC = () => {
  const [texts, setTexts] = useState<PlatformText[]>([]);
  const [filteredTexts, setFilteredTexts] = useState<PlatformText[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingTexts, setEditingTexts] = useState<Record<string, EditingText>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    footer: true,
    hero: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  useEffect(() => {
    filterTexts();
  }, [texts, searchQuery, selectedSection]);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_texts')
        .select('*')
        .order('section', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTexts(data || []);
    } catch (err) {
      console.error('Error loading texts:', err);
      showError('فشل تحميل النصوص');
    } finally {
      setLoading(false);
    }
  };

  const filterTexts = () => {
    let filtered = texts;

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = filtered.filter(t => t.section === selectedSection);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.text_ar.toLowerCase().includes(query) ||
        t.text_en?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.key.toLowerCase().includes(query)
      );
    }

    setFilteredTexts(filtered);
  };

  const handleEdit = (text: PlatformText) => {
    setEditingTexts(prev => ({
      ...prev,
      [text.id]: {
        id: text.id,
        text_ar: text.text_ar,
        text_en: text.text_en || ''
      }
    }));
  };

  const handleCancel = (id: string) => {
    setEditingTexts(prev => {
      const newEditing = { ...prev };
      delete newEditing[id];
      return newEditing;
    });
  };

  const handleSave = async (text: PlatformText) => {
    const editedText = editingTexts[text.id];
    if (!editedText) return;

    try {
      setSaving(text.id);

      console.log('💾 Saving text:', {
        id: text.id,
        text_ar: editedText.text_ar,
        text_en: editedText.text_en
      });

      const { data, error } = await supabase
        .from('platform_texts')
        .update({
          text_ar: editedText.text_ar,
          text_en: editedText.text_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', text.id)
        .select();

      if (error) {
        console.error('❌ Save error:', error);
        throw error;
      }

      console.log('✅ Saved successfully:', data);

      // Update local state immediately
      setTexts(prev => prev.map(t =>
        t.id === text.id
          ? { ...t, text_ar: editedText.text_ar, text_en: editedText.text_en, updated_at: new Date().toISOString() }
          : t
      ));

      // Clear editing state
      handleCancel(text.id);

      // Reload to ensure data consistency
      await loadTexts();

      showSuccess('تم الحفظ بنجاح! ✅');
    } catch (err) {
      console.error('Error saving text:', err);
      showError('فشل حفظ التغييرات');
    } finally {
      setSaving(null);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  const groupedTexts = filteredTexts.reduce((acc, text) => {
    if (!acc[text.section]) {
      acc[text.section] = [];
    }
    acc[text.section].push(text);
    return acc;
  }, {} as Record<string, PlatformText[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#8B7355] mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B7355] to-[#A0916A] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-2xl font-bold">إدارة نصوص المنصة</h2>
            </div>
            <p className="text-white/90 text-sm">
              تحكم في جميع النصوص الظاهرة في المنصة بطريقة احترافية ومباشرة
            </p>
          </div>
          <button
            onClick={loadTexts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all disabled:opacity-50"
            title="إعادة تحميل"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">تحديث</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في النصوص..."
                className="w-full pr-10 pl-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A0916A]"
              />
            </div>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A0916A]"
            >
              <option value="all">جميع الأقسام</option>
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label.icon} {label.ar}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              showPreview
                ? 'bg-[#8B7355] text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="text-sm">معاينة</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-gray-400 pt-3 border-t border-gray-700">
          <span>إجمالي النصوص: <span className="text-[#A0916A] font-bold">{texts.length}</span></span>
          <span>المعروضة: <span className="text-[#A0916A] font-bold">{filteredTexts.length}</span></span>
          <span>القابلة للتعديل: <span className="text-[#A0916A] font-bold">{texts.filter(t => t.editable).length}</span></span>
        </div>
      </div>

      {/* Texts by Section */}
      <div className="space-y-4">
        {Object.entries(groupedTexts).map(([section, sectionTexts]) => {
          const sectionInfo = SECTION_LABELS[section] || {
            ar: section,
            en: section,
            icon: '📄',
            color: 'from-gray-500 to-gray-600'
          };
          const isExpanded = expandedSections[section];

          return (
            <div key={section} className="bg-gray-800 rounded-xl overflow-hidden">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section)}
                className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${sectionInfo.color} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sectionInfo.icon}</span>
                  <div className="text-right">
                    <h3 className="text-white font-bold text-lg">{sectionInfo.ar}</h3>
                    <p className="text-white/80 text-xs">{sectionInfo.en}</p>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold">
                    {sectionTexts.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {sectionTexts.map((text) => {
                    const isEditing = !!editingTexts[text.id];
                    const editedText = editingTexts[text.id];
                    const isSaving = saving === text.id;

                    return (
                      <div
                        key={text.id}
                        className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-[#A0916A]/50 transition-colors"
                      >
                        {/* Text Info */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Type className="w-4 h-4 text-[#A0916A]" />
                              <span className="text-gray-400 text-xs font-mono">{text.key}</span>
                            </div>
                            {text.description && (
                              <p className="text-gray-400 text-sm">{text.description}</p>
                            )}
                          </div>

                          {/* Actions */}
                          {text.editable && (
                            <div className="flex items-center gap-2">
                              {!isEditing ? (
                                <button
                                  onClick={() => handleEdit(text)}
                                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                  title="تعديل"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleSave(text)}
                                    disabled={isSaving}
                                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                                  >
                                    {isSaving ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4" />
                                    )}
                                    حفظ
                                  </button>
                                  <button
                                    onClick={() => handleCancel(text.id)}
                                    disabled={isSaving}
                                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm"
                                  >
                                    إلغاء
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-3">
                          {/* Arabic Text */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Languages className="w-4 h-4 text-green-400" />
                              <label className="text-gray-300 text-sm font-medium">النص بالعربية</label>
                            </div>
                            {isEditing ? (
                              <textarea
                                value={editedText.text_ar}
                                onChange={(e) => setEditingTexts(prev => ({
                                  ...prev,
                                  [text.id]: { ...editedText, text_ar: e.target.value }
                                }))}
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A0916A] resize-none"
                              />
                            ) : (
                              <p className="text-white bg-gray-800/50 px-3 py-2 rounded-lg">
                                {text.text_ar}
                              </p>
                            )}
                          </div>

                          {/* English Text */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Languages className="w-4 h-4 text-blue-400" />
                              <label className="text-gray-300 text-sm font-medium">النص بالإنجليزية</label>
                            </div>
                            {isEditing ? (
                              <textarea
                                value={editedText.text_en}
                                onChange={(e) => setEditingTexts(prev => ({
                                  ...prev,
                                  [text.id]: { ...editedText, text_en: e.target.value }
                                }))}
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A0916A] resize-none"
                              />
                            ) : (
                              <p className="text-white/70 bg-gray-800/50 px-3 py-2 rounded-lg">
                                {text.text_en || 'غير متوفر'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTexts.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">لا توجد نصوص مطابقة للبحث</p>
          <p className="text-gray-500 text-sm mt-2">جرب تغيير معايير البحث أو الفلترة</p>
        </div>
      )}
    </div>
  );
};
