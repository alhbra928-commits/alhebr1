import React, { useState, useEffect } from 'react';
import { FileText, Plus, Eye, Save, Trash2, Edit2, Copy, Check, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface Template {
  id: string;
  name: string;
  category: 'notification' | 'otp' | 'marketing' | 'support' | 'transaction';
  content_ar: string;
  content_en?: string;
  variables: string[];
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

interface TemplateFormData {
  name: string;
  category: 'notification' | 'otp' | 'marketing' | 'support' | 'transaction';
  content_ar: string;
  content_en: string;
  is_active: boolean;
}

const categoryOptions = [
  { value: 'notification', label: 'إشعارات', color: 'blue' },
  { value: 'otp', label: 'رموز التحقق', color: 'green' },
  { value: 'marketing', label: 'تسويق', color: 'purple' },
  { value: 'support', label: 'دعم فني', color: 'orange' },
  { value: 'transaction', label: 'عمليات مالية', color: 'emerald' }
];

export const TemplateStudio: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    category: 'notification',
    content_ar: '',
    content_en: '',
    is_active: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  };

  const handlePreview = () => {
    const sampleVariables: Record<string, string> = {
      'اسم_المستخدم': 'أحمد محمد',
      'رقم_الحجز': 'BK-12345',
      'المزرعة': 'مزرعة الخالدية',
      'التاريخ': '2025-10-26',
      'المبلغ': '50000',
      'رمز_التحقق': '123456',
      'customer_name': 'Ahmed Mohammed',
      'booking_id': 'BK-12345',
      'farm_name': 'Al-Khaldiya Farm',
      'date': '2025-10-26',
      'amount': '50000',
      'verification_code': '123456'
    };

    let preview = formData.content_ar;
    Object.entries(sampleVariables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    setPreviewContent(preview);
    setPreviewMode(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: session } = await supabase.auth.getSession();
      const variables = extractVariables(formData.content_ar);

      if (editingTemplate) {
        const { error } = await supabase
          .from('whatsapp_templates')
          .update({
            ...formData,
            variables
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_templates')
          .insert({
            ...formData,
            variables,
            created_by: session?.session?.user?.id
          });

        if (error) throw error;
      }

      await loadTemplates();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: session?.session?.user?.id
        })
        .eq('id', templateId);

      if (error) throw error;
      await loadTemplates();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      content_ar: template.content_ar,
      content_en: template.content_en || '',
      is_active: template.is_active
    });
    setShowForm(true);
  };

  const handleDuplicate = (template: Template) => {
    setFormData({
      name: `${template.name} - نسخة`,
      category: template.category,
      content_ar: template.content_ar,
      content_en: template.content_en || '',
      is_active: false
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'notification',
      content_ar: '',
      content_en: '',
      is_active: true
    });
    setEditingTemplate(null);
    setShowForm(false);
  };

  const getCategoryColor = (category: string) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat?.color || 'gray';
  };

  const getCategoryLabel = (category: string) => {
    const cat = categoryOptions.find(c => c.value === category);
    return cat?.label || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">استوديو القوالب</h1>
            <p className="text-gray-400 text-sm">إنشاء وإدارة قوالب رسائل الواتساب</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          قالب جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full my-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTemplate ? 'تعديل القالب' : 'قالب جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم القالب
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثال: BOOKING_CONFIRMED"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    الفئة
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  محتوى الرسالة (عربي)
                </label>
                <textarea
                  value={formData.content_ar}
                  onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 font-arabic"
                  placeholder="مثال: مرحباً {{اسم_المستخدم}}، تم تأكيد حجزك رقم {{رقم_الحجز}} في {{المزرعة}}."
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  استخدم  لإضافة متغيرات ديناميكية
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  محتوى الرسالة (إنجليزي - اختياري)
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                  placeholder="Example: Hello {{customer_name}}, your booking {{booking_id}} at {{farm_name}} is confirmed."
                />
              </div>

              {formData.content_ar && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">المتغيرات المكتشفة:</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractVariables(formData.content_ar).map(variable => (
                      <span
                        key={variable}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                      >
                        {variable}
                      </span>
                    ))}
                    {extractVariables(formData.content_ar).length === 0 && (
                      <span className="text-gray-400 text-sm">لا توجد متغيرات</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="text-sm text-gray-300">قالب نشط</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  <Eye className="w-5 h-5" />
                  معاينة
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingTemplate ? 'تحديث' : 'حفظ'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">معاينة الرسالة</h2>
              <button
                onClick={() => setPreviewMode(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="bg-white rounded-lg p-4 text-gray-900 whitespace-pre-wrap font-arabic">
                {previewContent}
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              هذه معاينة بقيم تجريبية للمتغيرات
            </p>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">لا توجد قوالب مضافة</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all"
          >
            إضافة أول قالب
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <span className={`px-2 py-1 bg-${getCategoryColor(template.category)}-500/20 text-${getCategoryColor(template.category)}-400 rounded text-xs`}>
                      {getCategoryLabel(template.category)}
                    </span>
                    {template.is_active ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap font-arabic">
                    {template.content_ar}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {template.variables.map(variable => (
                      <span
                        key={variable}
                        className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">
                    استخدام: {template.usage_count} مرة
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                    title="نسخ"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                    title="تعديل"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
