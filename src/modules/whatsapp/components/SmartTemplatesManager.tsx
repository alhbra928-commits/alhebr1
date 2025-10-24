import { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Eye, Copy, Search, Sparkles,
  Save, X, Check, AlertCircle, TrendingUp, BarChart3, Clock,
  Zap, MessageCircle, DollarSign, Award, Calendar, Bell, Users,
  GripVertical, ArrowUpDown, Image, ExternalLink, Target, Activity,
  CheckCircle, XCircle, FileEdit, Download, Upload, RefreshCw
} from 'lucide-react';
import { whatsappService, WhatsAppTemplate } from '../services/whatsappService';
import { notificationSoundService } from '../../../services/notificationSoundService';

export function SmartTemplatesManager() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, statsData] = await Promise.all([
        whatsappService.getTemplates(),
        whatsappService.getTemplateStats()
      ]);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch =
        template.template_name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.message_content_ar.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.template_category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const categories = [
    { id: 'all', label: 'الكل', icon: FileText, color: 'gray' },
    { id: 'booking', label: 'حجوزات', icon: Calendar, color: 'blue' },
    { id: 'payment', label: 'مدفوعات', icon: DollarSign, color: 'green' },
    { id: 'certificate', label: 'شهادات', icon: Award, color: 'purple' },
    { id: 'settlement', label: 'تسويات', icon: TrendingUp, color: 'amber' },
    { id: 'notification', label: 'إشعارات', icon: Bell, color: 'red' },
    { id: 'greeting', label: 'ترحيب', icon: Sparkles, color: 'pink' },
    { id: 'reminder', label: 'تذكير', icon: Clock, color: 'orange' },
    { id: 'general', label: 'عام', icon: MessageCircle, color: 'gray' }
  ];

  const statuses = [
    { id: 'all', label: 'الكل', color: 'gray' },
    { id: 'active', label: 'نشط', color: 'green' },
    { id: 'inactive', label: 'معطل', color: 'gray' },
    { id: 'draft', label: 'مسودة', color: 'yellow' },
    { id: 'review', label: 'قيد المراجعة', color: 'blue' }
  ];

  const getCategoryConfig = (category: string) => {
    return categories.find(c => c.id === category) || categories[0];
  };

  const getStatusConfig = (status: string) => {
    return statuses.find(s => s.id === status) || statuses[0];
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setModalMode('edit');
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleView = (template: WhatsAppTemplate) => {
    setModalMode('view');
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await whatsappService.deleteTemplate(id);
      await loadData();
      notificationSoundService.playSuccess();
      setShowDeleteConfirm(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      notificationSoundService.playError();
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await whatsappService.duplicateTemplate(id);
      await loadData();
      notificationSoundService.playSuccess();
    } catch (error) {
      console.error('Error duplicating template:', error);
      notificationSoundService.playError();
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await whatsappService.toggleTemplateStatus(id);
      await loadData();
      notificationSoundService.playSuccess();
    } catch (error) {
      console.error('Error toggling status:', error);
      notificationSoundService.playError();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTemplate(null);
  };

  const handleModalSave = async () => {
    await loadData();
    setShowModal(false);
    setSelectedTemplate(null);
    notificationSoundService.playSuccess();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
              <FileText className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mb-2">جاري التحميل...</p>
          <p className="text-gray-600">استرجاع القوالب الذكية</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header with Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-8 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-2xl"></div>
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white flex items-center gap-3 mb-2">
                  مركز القوالب الذكية
                  <Sparkles className="h-8 w-8 text-yellow-200 animate-pulse" />
                </h1>
                <p className="text-amber-100 text-lg">إدارة متكاملة لقوالب رسائل WhatsApp</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="px-6 py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl hover:bg-white/30 transition-all border-2 border-white/30 font-bold shadow-lg hover:scale-105"
              >
                <RefreshCw className="h-5 w-5 inline mr-2" />
                تحديث
              </button>

              <button
                onClick={handleCreate}
                className="px-8 py-3 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-all font-bold shadow-lg hover:scale-105 flex items-center gap-2"
              >
                <Plus className="h-6 w-6" />
                قالب جديد
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <FileText className="h-8 w-8 text-white" />
                  <span className="text-white/80 text-sm font-bold">الإجمالي</span>
                </div>
                <div className="text-4xl font-black text-white">{stats.total}</div>
              </div>

              <div className="bg-green-500/20 backdrop-blur-xl rounded-xl p-5 border border-green-300/30">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-8 w-8 text-white" />
                  <span className="text-white/90 text-sm font-bold">نشط</span>
                </div>
                <div className="text-4xl font-black text-white">{stats.active}</div>
              </div>

              <div className="bg-gray-500/20 backdrop-blur-xl rounded-xl p-5 border border-gray-300/30">
                <div className="flex items-center justify-between mb-3">
                  <XCircle className="h-8 w-8 text-white" />
                  <span className="text-white/90 text-sm font-bold">معطل</span>
                </div>
                <div className="text-4xl font-black text-white">{stats.inactive}</div>
              </div>

              <div className="bg-yellow-500/20 backdrop-blur-xl rounded-xl p-5 border border-yellow-300/30">
                <div className="flex items-center justify-between mb-3">
                  <FileEdit className="h-8 w-8 text-white" />
                  <span className="text-white/90 text-sm font-bold">مسودة</span>
                </div>
                <div className="text-4xl font-black text-white">{stats.draft}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Bar */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900">الأكثر استخداماً</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {stats.mostUsed.slice(0, 5).map((template: WhatsAppTemplate) => (
              <div
                key={template.id}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => handleView(template)}
              >
                <div className="text-sm font-bold text-gray-900 mb-1 truncate">
                  {template.template_name_ar}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Activity className="h-3 w-3" />
                  <span>{template.usage_count} استخدام</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-black text-gray-900">البحث والتصفية</h3>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن قالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الفئة</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300 shadow-md`
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الحالة</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    selectedStatus === status.id
                      ? `bg-${status.color}-100 text-${status.color}-700 border-2 border-${status.color}-300 shadow-md`
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
            <div className="text-sm text-gray-600">
              عرض <span className="font-black text-gray-900 text-lg">{filteredTemplates.length}</span> من {templates.length} قالب
            </div>

            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="text-sm text-red-600 hover:text-red-700 font-bold hover:underline"
              >
                ✖ إعادة تعيين الفلاتر
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-16 text-center">
          <FileText className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-3">لا توجد قوالب</h3>
          <p className="text-gray-600 text-lg mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'لم يتم العثور على قوالب تطابق معايير البحث'
              : 'ابدأ بإنشاء قالب جديد'}
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5" />
            إنشاء قالب جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const categoryConfig = getCategoryConfig(template.template_category);
            const statusConfig = getStatusConfig(template.status || 'active');
            const CategoryIcon = categoryConfig.icon;

            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-2xl transition-all group overflow-hidden"
              >
                {/* Header with Drag Handle */}
                <div className={`bg-gradient-to-r from-${categoryConfig.color}-500 to-${categoryConfig.color}-600 p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-white/50 cursor-move" />
                      <div className={`w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center`}>
                        <CategoryIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30 text-white`}>
                        {statusConfig.label}
                      </span>
                      {template.event_trigger && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-xl border border-white/30 text-white flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          مربوط
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                    {template.template_name_ar}
                    {template.priority && template.priority > 50 && (
                      <Target className="h-5 w-5 text-amber-500" />
                    )}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 whitespace-pre-wrap">
                    {template.message_content_ar}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 mb-4">
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-bold">المتغيرات:</span>
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-mono text-xs"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        <span>{template.usage_count} استخدام</span>
                      </div>

                      {template.last_used_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(template.last_used_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      )}
                    </div>

                    {template.event_trigger && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 font-bold">الحدث:</span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold">
                          {template.event_trigger}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleView(template)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      معاينة
                    </button>

                    <button
                      onClick={() => handleEdit(template)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDuplicate(template.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-bold text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      نسخ
                    </button>

                    <button
                      onClick={() => handleToggleStatus(template.id)}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors font-bold text-sm ${
                        template.status === 'active'
                          ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {template.status === 'active' ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          تعطيل
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          تفعيل
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTemplateToDelete(template.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-colors font-bold text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف القالب
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Modal */}
      {showModal && (
        <TemplateModal
          mode={modalMode}
          template={selectedTemplate}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && templateToDelete && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(templateToDelete)}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setTemplateToDelete(null);
          }}
        />
      )}
    </div>
  );
}

// Template Modal Component
function TemplateModal({
  mode,
  template,
  onClose,
  onSave
}: {
  mode: 'create' | 'edit' | 'view';
  template: WhatsAppTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<Partial<WhatsAppTemplate>>({
    template_code: template?.template_code || '',
    template_name_ar: template?.template_name_ar || '',
    template_category: template?.template_category || 'general',
    template_icon: template?.template_icon || 'MessageCircle',
    message_content_ar: template?.message_content_ar || '',
    message_content_en: template?.message_content_en || '',
    variables: template?.variables || [],
    target_audience: template?.target_audience || ['investor'],
    event_trigger: template?.event_trigger || '',
    priority: template?.priority || 0,
    has_image: template?.has_image || false,
    has_cta_button: template?.has_cta_button || false,
    cta_button_text: template?.cta_button_text || '',
    cta_button_url: template?.cta_button_url || '',
    status: template?.status || 'draft',
    is_active: template?.is_active ?? true
  });

  const [saving, setSaving] = useState(false);
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.variables && formData.variables.length > 0) {
      const defaults: Record<string, string> = {};
      formData.variables.forEach(variable => {
        defaults[variable] = `[${variable}]`;
      });
      setPreviewVariables(defaults);
    }
  }, [formData.variables]);

  const handleSave = async () => {
    try {
      setSaving(true);

      if (mode === 'create') {
        await whatsappService.createTemplate(formData as any);
      } else if (mode === 'edit' && template) {
        await whatsappService.updateTemplate(template.id, formData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const detectVariables = () => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = formData.message_content_ar?.matchAll(regex);
    const variables = Array.from(matches || []).map(match => match[1].trim());
    setFormData({ ...formData, variables: [...new Set(variables)] });
  };

  const getPreviewMessage = () => {
    let preview = formData.message_content_ar || '';
    Object.entries(previewVariables).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return preview;
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className={`bg-gradient-to-r ${
          mode === 'create' ? 'from-amber-500 to-yellow-600' :
          mode === 'edit' ? 'from-blue-500 to-cyan-600' :
          'from-purple-500 to-pink-600'
        } p-8 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border-2 border-white/30">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2">
                  {mode === 'create' ? 'قالب جديد' : mode === 'edit' ? 'تعديل القالب' : 'معاينة القالب'}
                </h3>
                <p className="text-white/90">
                  {mode === 'create' ? 'إنشاء قالب رسالة ذكي جديد' :
                   mode === 'edit' ? formData.template_name_ar :
                   formData.template_name_ar}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <FileEdit className="h-5 w-5" />
                تفاصيل القالب
              </h4>

              {/* Template Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كود القالب *
                </label>
                <input
                  type="text"
                  value={formData.template_code}
                  onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                  disabled={isReadOnly || mode === 'edit'}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="BOOKING_CONFIRMED"
                />
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم القالب *
                </label>
                <input
                  type="text"
                  value={formData.template_name_ar}
                  onChange={(e) => setFormData({ ...formData, template_name_ar: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="تأكيد الحجز"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  value={formData.template_category}
                  onChange={(e) => setFormData({ ...formData, template_category: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 font-bold"
                >
                  <option value="booking">حجوزات</option>
                  <option value="payment">مدفوعات</option>
                  <option value="certificate">شهادات</option>
                  <option value="settlement">تسويات</option>
                  <option value="notification">إشعارات</option>
                  <option value="greeting">ترحيب</option>
                  <option value="reminder">تذكير</option>
                  <option value="general">عام</option>
                </select>
              </div>

              {/* Event Trigger */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الحدث المرتبط
                </label>
                <input
                  type="text"
                  value={formData.event_trigger || ''}
                  onChange={(e) => setFormData({ ...formData, event_trigger: e.target.value })}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="booking_confirmed"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الأولوية (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority || 0}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  disabled={isReadOnly}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 font-bold"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">معطل</option>
                  <option value="draft">مسودة</option>
                  <option value="review">قيد المراجعة</option>
                </select>
              </div>

              {/* Message Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    نص الرسالة *
                  </label>
                  {!isReadOnly && (
                    <button
                      onClick={detectVariables}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      استخراج المتغيرات تلقائياً
                    </button>
                  )}
                </div>
                <textarea
                  value={formData.message_content_ar}
                  onChange={(e) => setFormData({ ...formData, message_content_ar: e.target.value })}
                  disabled={isReadOnly}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 resize-none"
                  placeholder="مرحباً {{اسم_العميل}}، تم تأكيد حجزكم..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  استخدم {`{{اسم_المتغير}}`} لإضافة متغيرات ديناميكية
                </p>
              </div>

              {/* Variables */}
              {formData.variables && formData.variables.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المتغيرات المكتشفة ({formData.variables.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable) => (
                      <span
                        key={variable}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-mono text-sm"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                معاينة مباشرة
              </h4>

              {/* WhatsApp Preview */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="bg-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-2 font-bold">
                        WhatsApp Business • الآن
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {getPreviewMessage() || 'اكتب نص الرسالة لمعاينتها...'}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-3 text-gray-400">
                        <span className="text-xs">
                          {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <CheckCheck className="h-4 w-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Variables Editor */}
              {formData.variables && formData.variables.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    قيم المعاينة
                  </label>
                  <div className="space-y-2">
                    {formData.variables.map((variable) => (
                      <div key={variable} className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-600 w-32">
                          {`{{${variable}}}`}
                        </span>
                        <input
                          type="text"
                          value={previewVariables[variable] || ''}
                          onChange={(e) => setPreviewVariables({
                            ...previewVariables,
                            [variable]: e.target.value
                          })}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                          placeholder="قيمة المعاينة"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {mode === 'view' && template && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-200">
                  <h5 className="text-sm font-black text-gray-900 mb-4">إحصائيات الاستخدام</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">عدد الاستخدام</div>
                      <div className="text-2xl font-black text-gray-900">{template.usage_count}</div>
                    </div>
                    {template.last_used_at && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">آخر استخدام</div>
                        <div className="text-sm font-bold text-gray-900">
                          {new Date(template.last_used_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold"
          >
            {isReadOnly ? 'إغلاق' : 'إلغاء'}
          </button>

          {!isReadOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  حفظ القالب
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>

          <h3 className="text-2xl font-black text-gray-900 mb-3">
            هل أنت متأكد؟
          </h3>

          <p className="text-gray-600 mb-8">
            سيتم حذف هذا القالب نهائياً. يمكنك استعادته من النسخة الاحتياطية خلال 24 ساعة.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold"
            >
              إلغاء
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              حذف نهائي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
