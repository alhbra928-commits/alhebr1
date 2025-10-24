import { useState, useEffect } from 'react';
import { FileText, Plus, CreditCard as Edit2, Trash2, Eye, Copy, Search, Sparkles, Save, X, Check, AlertCircle, TrendingUp, BarChart3, Clock, Zap, MessageCircle, DollarSign, Award, Calendar, Bell, Users, GripVertical, ArrowUpDown, Image, ExternalLink, Target, Activity, CheckCircle, XCircle, File as FileEdit, Download, Upload, RefreshCw, Filter, Star, Send, Bookmark, Share2, Settings, ChevronRight, Grid2x2 as Grid, List, PlayCircle, Pause, Layers, Package, Workflow, CheckCheck } from 'lucide-react';
import { whatsappService, WhatsAppTemplate } from '../services/whatsappService';
import { notificationSoundService } from '../../../services/notificationSoundService';

export function UltraModernTemplatesManager() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    const favorites = localStorage.getItem('favorite_templates');
    if (favorites) {
      setFavoriteTemplates(JSON.parse(favorites));
    }

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
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
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aFav = favoriteTemplates.includes(a.id);
      const bFav = favoriteTemplates.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return (b.priority || 0) - (a.priority || 0);
    });

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favoriteTemplates.includes(templateId)
      ? favoriteTemplates.filter(id => id !== templateId)
      : [...favoriteTemplates, templateId];
    setFavoriteTemplates(newFavorites);
    localStorage.setItem('favorite_templates', JSON.stringify(newFavorites));
  };

  const categories = [
    { id: 'all', label: 'الكل', icon: Layers, color: 'from-gray-500 to-gray-600', count: templates.length },
    { id: 'booking', label: 'حجوزات', icon: Calendar, color: 'from-blue-500 to-cyan-600', count: templates.filter(t => t.template_category === 'booking').length },
    { id: 'payment', label: 'مدفوعات', icon: DollarSign, color: 'from-green-500 to-emerald-600', count: templates.filter(t => t.template_category === 'payment').length },
    { id: 'certificate', label: 'شهادات', icon: Award, color: 'from-purple-500 to-pink-600', count: templates.filter(t => t.template_category === 'certificate').length },
    { id: 'settlement', label: 'تسويات', icon: TrendingUp, color: 'from-amber-500 to-orange-600', count: templates.filter(t => t.template_category === 'settlement').length },
    { id: 'notification', label: 'إشعارات', icon: Bell, color: 'from-red-500 to-rose-600', count: templates.filter(t => t.template_category === 'notification').length },
    { id: 'greeting', label: 'ترحيب', icon: Sparkles, color: 'from-pink-500 to-fuchsia-600', count: templates.filter(t => t.template_category === 'greeting').length },
  ];

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-templates-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    notificationSoundService.playSuccess();
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const importedTemplates = JSON.parse(event.target?.result as string);
          for (const template of importedTemplates) {
            const { id, created_at, updated_at, usage_count, last_used_at, ...templateData } = template;
            await whatsappService.createTemplate(templateData);
          }
          await loadData();
          notificationSoundService.playSuccess();
        } catch (error) {
          console.error('Error importing templates:', error);
          notificationSoundService.playError();
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const quickActions = [
    { icon: Plus, label: 'قالب جديد', color: 'from-blue-500 to-cyan-600', action: () => setShowCreateModal(true) },
    { icon: Download, label: 'تصدير', color: 'from-green-500 to-emerald-600', action: handleExportJSON },
    { icon: Upload, label: 'استيراد', color: 'from-purple-500 to-pink-600', action: handleImportJSON },
    { icon: BarChart3, label: 'إحصائيات', color: 'from-amber-500 to-orange-600', action: () => console.log('stats') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl animate-spin opacity-20"></div>
            <div className="absolute inset-2 bg-white rounded-3xl flex items-center justify-center">
              <FileText className="h-16 w-16 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            جاري التحميل
          </h3>
          <p className="text-gray-600">تحميل القوالب الذكية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Ultra Modern Header */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>

          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                    مركز القوالب الذكية
                  </h1>
                  <p className="text-gray-600 text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    إدارة متطورة لرسائل WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-2xl font-bold text-gray-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                  {viewMode === 'grid' ? 'قائمة' : 'شبكة'}
                </button>

                <button
                  onClick={loadData}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  تحديث
                </button>

                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="h-6 w-6" />
                  إجراءات سريعة
                </button>
              </div>
            </div>

            {/* Stats Cards - Redesigned */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Package className="h-8 w-8 opacity-80" />
                    <div className="text-sm font-bold opacity-80">الإجمالي</div>
                  </div>
                  <div className="text-5xl font-black mb-1">{stats.total}</div>
                  <div className="text-sm opacity-80">قالب متاح</div>
                </div>

                <div className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="h-8 w-8 opacity-80" />
                    <div className="text-sm font-bold opacity-80">نشط</div>
                  </div>
                  <div className="text-5xl font-black mb-1">{stats.active}</div>
                  <div className="text-sm opacity-80">جاهز للاستخدام</div>
                </div>

                <div className="group bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <Activity className="h-8 w-8 opacity-80" />
                    <div className="text-sm font-bold opacity-80">الأكثر استخداماً</div>
                  </div>
                  <div className="text-5xl font-black mb-1">
                    {stats.mostUsed[0]?.usage_count || 0}
                  </div>
                  <div className="text-sm opacity-80 truncate">
                    {stats.mostUsed[0]?.template_name_ar || '-'}
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="h-8 w-8 opacity-80" />
                    <div className="text-sm font-bold opacity-80">معدل النجاح</div>
                  </div>
                  <div className="text-5xl font-black mb-1">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </div>
                  <div className="text-sm opacity-80">قوالب فعالة</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modern Search & Categories */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            {/* Search Bar - Ultra Modern */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur"></div>
              <div className="relative flex items-center bg-white rounded-2xl border-2 border-gray-200 focus-within:border-blue-500 transition-all shadow-lg">
                <Search className="h-6 w-6 text-gray-400 mr-4 ml-6" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن قالب... (جرب: حجز، شهادة، ترحيب)"
                  className="flex-1 py-4 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-4 mr-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories - Horizontal Scroll */}
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`group flex-shrink-0 relative overflow-hidden rounded-2xl transition-all ${
                        isSelected
                          ? 'scale-105 shadow-2xl'
                          : 'hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${category.color} ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}></div>

                      <div className={`relative px-6 py-4 flex items-center gap-3 ${
                        isSelected
                          ? 'text-white'
                          : 'bg-white text-gray-700 group-hover:text-white'
                      } transition-colors`}>
                        <Icon className="h-6 w-6" />
                        <div className="text-right">
                          <div className="font-black text-lg whitespace-nowrap">{category.label}</div>
                          <div className="text-sm opacity-80">{category.count} قالب</div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Templates Display */}
        <div className="relative">
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-20 text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <Search className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4">لم نجد أي قوالب</h3>
              <p className="text-xl text-gray-600 mb-8">جرب البحث بكلمات مختلفة أو اختر فئة أخرى</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all"
              >
                إعادة تعيين البحث
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <UltraModernTemplateCard
                  key={template.id}
                  template={template}
                  isFavorite={favoriteTemplates.includes(template.id)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                  onView={() => {
                    setSelectedTemplate(template);
                    setShowPreview(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <UltraModernTemplateListItem
                  key={template.id}
                  template={template}
                  isFavorite={favoriteTemplates.includes(template.id)}
                  onToggleFavorite={() => toggleFavorite(template.id)}
                  onView={() => {
                    setSelectedTemplate(template);
                    setShowPreview(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Quick Actions Menu */}
      {showQuickActions && (
        <FloatingQuickActions
          actions={quickActions}
          onClose={() => setShowQuickActions(false)}
        />
      )}

      {/* Ultra Modern Preview Modal */}
      {showPreview && selectedTemplate && (
        <UltraModernPreviewModal
          template={selectedTemplate}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSave={async () => {
            await loadData();
            setShowCreateModal(false);
            notificationSoundService.playSuccess();
          }}
        />
      )}
    </div>
  );
}

// Ultra Modern Template Card Component
function UltraModernTemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
  onView
}: {
  template: WhatsAppTemplate;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onView: () => void;
}) {
  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      booking: 'from-blue-500 to-cyan-600',
      payment: 'from-green-500 to-emerald-600',
      certificate: 'from-purple-500 to-pink-600',
      settlement: 'from-amber-500 to-orange-600',
      notification: 'from-red-500 to-rose-600',
      greeting: 'from-pink-500 to-fuchsia-600',
      reminder: 'from-orange-500 to-amber-600',
      general: 'from-gray-500 to-slate-600'
    };
    return gradients[category] || gradients.general;
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      {/* Top Accent */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(template.template_category)}`}></div>

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {template.template_name_ar}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <code className="px-2 py-1 bg-gray-100 rounded font-mono text-xs">
                {template.template_code}
              </code>
            </div>
          </div>

          <button
            onClick={onToggleFavorite}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {template.message_content_ar}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            <span>{template.usage_count}</span>
          </div>
          {template.variables && template.variables.length > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{template.variables.length} متغير</span>
            </div>
          )}
          {template.event_trigger && (
            <div className="flex items-center gap-1 text-amber-600">
              <Workflow className="h-4 w-4" />
              <span>مربوط</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={onView}
          className={`w-full py-3 bg-gradient-to-r ${getCategoryGradient(template.template_category)} text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group`}
        >
          <Eye className="h-5 w-5" />
          معاينة وتعديل
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// Ultra Modern List Item Component
function UltraModernTemplateListItem({
  template,
  isFavorite,
  onToggleFavorite,
  onView
}: {
  template: WhatsAppTemplate;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onView: () => void;
}) {
  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      booking: 'from-blue-500 to-cyan-600',
      payment: 'from-green-500 to-emerald-600',
      certificate: 'from-purple-500 to-pink-600',
      settlement: 'from-amber-500 to-orange-600',
      notification: 'from-red-500 to-rose-600',
      greeting: 'from-pink-500 to-fuchsia-600',
    };
    return gradients[category] || 'from-gray-500 to-slate-600';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-6 p-6">
        {/* Icon */}
        <div className={`w-16 h-16 bg-gradient-to-br ${getCategoryGradient(template.template_category)} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <FileText className="h-8 w-8 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {template.template_name_ar}
              </h3>
              <code className="text-sm text-gray-500 font-mono">
                {template.template_code}
              </code>
            </div>

            <button
              onClick={onToggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Star className={`h-6 w-6 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
            </button>
          </div>

          <p className="text-gray-600 mb-3 line-clamp-2">
            {template.message_content_ar}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>{template.usage_count} استخدام</span>
            </div>
            {template.variables && template.variables.length > 0 && (
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>{template.variables.length} متغير</span>
              </div>
            )}
            {template.event_trigger && (
              <div className="flex items-center gap-1 text-amber-600">
                <Workflow className="h-4 w-4" />
                <span>مربوط بحدث</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onView}
          className={`px-8 py-4 bg-gradient-to-r ${getCategoryGradient(template.template_category)} text-white rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2 group`}
        >
          <Eye className="h-5 w-5" />
          معاينة
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// Floating Quick Actions Component
function FloatingQuickActions({
  actions,
  onClose
}: {
  actions: Array<{ icon: any; label: string; color: string; action: () => void }>;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        <h3 className="text-3xl font-black text-gray-900 mb-8">إجراءات سريعة</h3>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  onClose();
                }}
                className="group relative overflow-hidden rounded-2xl p-8 text-white hover:scale-105 transition-all shadow-lg hover:shadow-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color}`}></div>
                <div className="relative flex flex-col items-center gap-4">
                  <Icon className="h-12 w-12" />
                  <span className="text-xl font-bold">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Ultra Modern Preview Modal
function UltraModernPreviewModal({
  template,
  onClose
}: {
  template: WhatsAppTemplate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-black mb-2">{template.template_name_ar}</h3>
              <code className="text-sm opacity-80">{template.template_code}</code>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* WhatsApp Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 mb-6 border-2 border-green-200">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">WhatsApp Business</div>
                  <div className="text-sm text-green-600">متصل</div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {template.message_content_ar}
                </p>

                <div className="flex items-center justify-end gap-1 text-gray-400 text-xs">
                  <span>{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
              <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                المتغيرات الديناميكية ({template.variables.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <span
                    key={variable}
                    className="px-4 py-2 bg-white rounded-xl font-mono text-sm font-bold text-blue-600 shadow border border-blue-200"
                  >
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold transition-all"
          >
            إغلاق
          </button>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg">
            تعديل القالب
          </button>
        </div>
      </div>
    </div>
  );
}
// Create Template Modal Component
function CreateTemplateModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    template_code: '',
    template_name_ar: '',
    template_category: 'general',
    message_content_ar: '',
    message_content_en: '',
    variables: [] as string[],
    target_audience: ['investor'] as string[],
    event_trigger: '',
    priority: 50,
    status: 'draft' as const,
    is_active: true
  });

  const [saving, setSaving] = useState(false);

  const detectVariables = () => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = formData.message_content_ar.matchAll(regex);
    const variables = Array.from(matches).map(match => match[1].trim());
    setFormData({ ...formData, variables: [...new Set(variables)] });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await whatsappService.createTemplate(formData as any);
      onSave();
    } catch (error) {
      console.error('Error creating template:', error);
      notificationSoundService.playError();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-black mb-2">قالب جديد</h3>
              <p className="text-white/90">إنشاء قالب رسالة ذكي جديد</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[calc(90vh-250px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كود القالب *
                </label>
                <input
                  type="text"
                  value={formData.template_code}
                  onChange={(e) => setFormData({ ...formData, template_code: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="BOOKING_CONFIRMED"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم القالب *
                </label>
                <input
                  type="text"
                  value={formData.template_name_ar}
                  onChange={(e) => setFormData({ ...formData, template_name_ar: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="تأكيد الحجز"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  value={formData.template_category}
                  onChange={(e) => setFormData({ ...formData, template_category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
                >
                  <option value="general">عام</option>
                  <option value="booking">حجوزات</option>
                  <option value="payment">مدفوعات</option>
                  <option value="certificate">شهادات</option>
                  <option value="settlement">تسويات</option>
                  <option value="notification">إشعارات</option>
                  <option value="greeting">ترحيب</option>
                  <option value="reminder">تذكير</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">
                    نص الرسالة *
                  </label>
                  <button
                    onClick={detectVariables}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    استخراج المتغيرات
                  </button>
                </div>
                <textarea
                  value={formData.message_content_ar}
                  onChange={(e) => setFormData({ ...formData, message_content_ar: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="مرحباً {{اسم_العميل}}، تم تأكيد حجزكم..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  استخدم {`{{اسم_المتغير}}`} لإضافة متغيرات ديناميكية
                </p>
              </div>

              {formData.variables.length > 0 && (
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
            <div>
              <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                معاينة مباشرة
              </h4>

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
                        {formData.message_content_ar || 'اكتب نص الرسالة لمعاينتها...'}
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.template_code || !formData.template_name_ar || !formData.message_content_ar}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        </div>
      </div>
    </div>
  );
}
