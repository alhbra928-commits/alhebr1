import { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Eye, Copy, Check, X,
  Search, Filter, TrendingUp, Calendar, DollarSign, Award
} from 'lucide-react';
import { whatsappService, WhatsAppTemplate } from '../services/whatsappService';

export function TemplatesManager() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await whatsappService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.template_category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'الكل', color: 'gray' },
    { id: 'booking', label: 'حجوزات', color: 'blue' },
    { id: 'payment', label: 'مدفوعات', color: 'green' },
    { id: 'certificate', label: 'شهادات', color: 'purple' },
    { id: 'settlement', label: 'تسويات', color: 'yellow' },
    { id: 'notification', label: 'إشعارات', color: 'red' },
    { id: 'greeting', label: 'ترحيب', color: 'pink' },
    { id: 'reminder', label: 'تذكير', color: 'orange' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return Calendar;
      case 'payment': return DollarSign;
      case 'certificate': return Award;
      case 'settlement': return TrendingUp;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل القوالب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">إدارة قوالب الرسائل</h2>
            <p className="text-gray-600">إنشاء وتعديل قوالب الرسائل التلقائية</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          قالب جديد
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن قالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300`
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const Icon = getCategoryIcon(template.template_category);
          const color = getCategoryColor(template.template_category);

          return (
            <div
              key={template.id}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>

                <div className="flex items-center gap-2">
                  {template.is_active ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      مفعّل
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                      معطّل
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {template.template_name_ar}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.message_content_ar}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{template.usage_count} استخدام</span>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Copy className="h-4 w-4" />
                    <span>{template.variables.length} متغير</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm"
                >
                  <Eye className="h-4 w-4" />
                  معاينة
                </button>

                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  تعديل
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">لا توجد قوالب</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'لم يتم العثور على قوالب تطابق البحث'
              : 'ابدأ بإنشاء قالب جديد'}
          </p>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            إنشاء قالب جديد
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowModal(false);
            setSelectedTemplate(null);
          }}
          onSave={() => {
            loadTemplates();
            setShowModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}

// مكون Modal للقالب
function TemplateModal({
  template,
  onClose,
  onSave
}: {
  template: WhatsAppTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isView = template !== null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">
                  {isView ? template.template_name_ar : 'قالب جديد'}
                </h3>
                {isView && (
                  <p className="text-purple-100 text-sm">{template.template_code}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isView ? (
            <>
              {/* Template Preview */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الفئة
                  </label>
                  <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold">
                    {template.template_category}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نص الرسالة
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 whitespace-pre-wrap">
                    {template.message_content_ar}
                  </div>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      المتغيرات
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-mono text-sm"
                        >
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الفئة المستهدفة
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {template.target_audience.map((audience) => (
                      <span
                        key={audience}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-sm"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
                  <div>
                    <div className="text-sm text-gray-600">عدد مرات الاستخدام</div>
                    <div className="text-2xl font-black text-gray-900">
                      {template.usage_count}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">الحالة</div>
                    <div className="text-2xl font-black text-gray-900">
                      {template.is_active ? (
                        <span className="text-green-600">مفعّل</span>
                      ) : (
                        <span className="text-gray-600">معطّل</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Plus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">نموذج إنشاء قالب جديد سيكون هنا</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
          >
            إغلاق
          </button>
          {isView && (
            <button
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
            >
              تعديل القالب
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
