import { useState, useEffect } from 'react';
import {
  Users, Plus, Send, Eye, Calendar, CheckCheck, AlertCircle, X, Clock,
  Target, TrendingUp, Zap, Filter, Search, BarChart3, MessageCircle,
  Play, Pause, RefreshCw, Download, Settings, ChevronRight, Sparkles,
  UserCheck, UserX, Mail, Phone, MapPin, Building, Circle, CheckCircle2,
  XCircle, Loader2, ArrowRight, FileText, Copy, Edit2, Trash2, History
} from 'lucide-react';
import { whatsappService, BroadcastCampaign, WhatsAppTemplate } from '../services/whatsappService';

export function ModernBroadcastManager() {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<BroadcastCampaign | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [campaignsData, templatesData] = await Promise.all([
        whatsappService.getCampaigns(),
        whatsappService.getTemplates()
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      draft: {
        bg: 'bg-gradient-to-r from-slate-500 to-slate-600',
        icon: FileText,
        label: 'مسودة',
        textColor: 'text-slate-700'
      },
      scheduled: {
        bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        icon: Clock,
        label: 'مجدول',
        textColor: 'text-blue-700'
      },
      sending: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
        icon: Loader2,
        label: 'جاري الإرسال',
        textColor: 'text-amber-700'
      },
      completed: {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
        icon: CheckCircle2,
        label: 'مكتمل',
        textColor: 'text-emerald-700'
      },
      cancelled: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-600',
        icon: XCircle,
        label: 'ملغي',
        textColor: 'text-red-700'
      }
    };
    return configs[status as keyof typeof configs] || configs.draft;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (campaign.campaign_description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalRecipients: campaigns.reduce((sum, c) => sum + c.total_recipients, 0),
    totalDelivered: campaigns.reduce((sum, c) => sum + c.delivered_count, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <Users className="h-10 w-10 text-white" />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">جاري التحميل</p>
          <p className="text-gray-600">تحميل حملات البث الجماعي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      {/* Header with Stats */}
      <div className="mb-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                البث الجماعي المتطور
              </h1>
              <p className="text-gray-600 font-semibold">
                إرسال رسائل WhatsApp لمجموعات كبيرة بذكاء
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <span>حملة جديدة</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">إجمالي الحملات</div>
                <div className="text-3xl font-black text-gray-900">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">نشطة</div>
                <div className="text-3xl font-black text-gray-900">{stats.active}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">مكتملة</div>
                <div className="text-3xl font-black text-gray-900">{stats.completed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">المستلمين</div>
                <div className="text-3xl font-black text-gray-900">{stats.totalRecipients}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <CheckCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">تم التسليم</div>
                <div className="text-3xl font-black text-gray-900">{stats.totalDelivered}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الحملات..."
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'الكل', icon: Filter },
              { value: 'draft', label: 'مسودة', icon: FileText },
              { value: 'scheduled', label: 'مجدول', icon: Clock },
              { value: 'sending', label: 'جاري', icon: Send },
              { value: 'completed', label: 'مكتمل', icon: CheckCircle2 }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  filterStatus === status.value
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <status.icon className="h-4 w-4" />
                <span>{status.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns Grid/List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-16 text-center shadow-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            {searchQuery || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد حملات'}
          </h3>
          <p className="text-gray-600 font-semibold mb-8 max-w-md mx-auto">
            {searchQuery || filterStatus !== 'all'
              ? 'جرب البحث بكلمات مختلفة أو قم بتغيير الفلاتر'
              : 'ابدأ بإنشاء حملة بث جماعي جديدة للوصول إلى جمهورك'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-2xl font-black hover:shadow-xl transition-all hover:scale-105"
            >
              <Sparkles className="h-6 w-6" />
              <span>إنشاء حملة جديدة</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={() => setSelectedCampaign(campaign)}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCampaignModal
          templates={templates}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            loadData();
            setShowCreateModal(false);
          }}
        />
      )}

      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  onView,
  onRefresh
}: {
  campaign: BroadcastCampaign;
  onView: () => void;
  onRefresh: () => void;
}) {
  const statusConfig = {
    draft: { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
    sending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Loader2 },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
  }[campaign.status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: FileText };

  const StatusIcon = statusConfig.icon;
  const successRate = campaign.total_recipients > 0
    ? (campaign.delivered_count / campaign.total_recipients) * 100
    : 0;

  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b-2 border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">
              {campaign.campaign_name}
            </h3>
            {campaign.campaign_description && (
              <p className="text-sm text-gray-600 font-semibold line-clamp-2">
                {campaign.campaign_description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${statusConfig.bg} ${statusConfig.text}`}>
            <StatusIcon className={`h-4 w-4 ${campaign.status === 'sending' ? 'animate-spin' : ''}`} />
            {statusConfig.text.includes('slate') ? 'مسودة' :
             statusConfig.text.includes('blue') ? 'مجدول' :
             statusConfig.text.includes('amber') ? 'جاري الإرسال' :
             statusConfig.text.includes('emerald') ? 'مكتمل' : 'ملغي'}
          </span>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{new Date(campaign.created_at).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
            <div className="text-xs text-blue-600 font-bold mb-1">المستلمين</div>
            <div className="text-2xl font-black text-blue-900">{campaign.total_recipients}</div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-100">
            <div className="text-xs text-emerald-600 font-bold mb-1">تم التسليم</div>
            <div className="text-2xl font-black text-emerald-900">{campaign.delivered_count}</div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
            <div className="text-xs text-purple-600 font-bold mb-1">تم الإرسال</div>
            <div className="text-2xl font-black text-purple-900">{campaign.sent_count}</div>
          </div>

          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-100">
            <div className="text-xs text-red-600 font-bold mb-1">فاشل</div>
            <div className="text-2xl font-black text-red-900">{campaign.failed_count}</div>
          </div>
        </div>

        {/* Progress */}
        {campaign.total_recipients > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">معدل النجاح</span>
              <span className="text-sm font-black text-emerald-600">{successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500 rounded-full"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-bold"
          >
            <Eye className="h-4 w-4" />
            <span>عرض التفاصيل</span>
          </button>

          {campaign.status === 'draft' && (
            <button className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all">
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateCampaignModal({
  templates,
  onClose,
  onSave
}: {
  templates: WhatsAppTemplate[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [step, setStep] = useState<'basic' | 'template' | 'audience' | 'schedule'>('basic');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>(['investor']);
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      await whatsappService.createCampaign({
        campaign_name: campaignName,
        campaign_description: campaignDescription,
        message_content: selectedTemplate ? selectedTemplate.message_text : customMessage,
        target_audience: targetAudience,
        total_recipients: 0,
        status: scheduleType === 'now' ? 'draft' : 'scheduled'
      });

      onSave();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('فشل في إنشاء الحملة');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 'basic':
        return <BasicInfoStep
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          campaignDescription={campaignDescription}
          setCampaignDescription={setCampaignDescription}
        />;
      case 'template':
        return <TemplateStep
          templates={templates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          customMessage={customMessage}
          setCustomMessage={setCustomMessage}
        />;
      case 'audience':
        return <AudienceStep
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
        />;
      case 'schedule':
        return <ScheduleStep
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
        />;
    }
  };

  const canProceed = () => {
    switch(step) {
      case 'basic':
        return campaignName.trim() !== '';
      case 'template':
        return selectedTemplate !== null || customMessage.trim() !== '';
      case 'audience':
        return targetAudience.length > 0;
      case 'schedule':
        return scheduleType === 'now' || (scheduledDate && scheduledTime);
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-1">حملة بث جماعي جديدة</h3>
                <p className="text-emerald-100 font-semibold">أنشئ حملة احترافية خطوة بخطوة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Steps Progress */}
          <div className="mt-6 flex items-center gap-2">
            {[
              { id: 'basic', label: 'معلومات أساسية', icon: FileText },
              { id: 'template', label: 'القالب', icon: MessageCircle },
              { id: 'audience', label: 'الجمهور', icon: Users },
              { id: 'schedule', label: 'الجدولة', icon: Clock }
            ].map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isCompleted = ['basic', 'template', 'audience', 'schedule'].indexOf(s.id) <
                                 ['basic', 'template', 'audience', 'schedule'].indexOf(step);

              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setStep(s.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all w-full ${
                      isActive
                        ? 'bg-white text-emerald-600 shadow-lg'
                        : isCompleted
                        ? 'bg-white/30 text-white hover:bg-white/40'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{s.label}</span>
                  </button>
                  {idx < 3 && <ChevronRight className="h-5 w-5 mx-1 text-white/40" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[50vh] overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold disabled:opacity-50"
          >
            إلغاء
          </button>

          <div className="flex gap-3">
            {step !== 'basic' && (
              <button
                onClick={() => {
                  const steps = ['basic', 'template', 'audience', 'schedule'];
                  const currentIdx = steps.indexOf(step);
                  if (currentIdx > 0) setStep(steps[currentIdx - 1] as any);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-bold"
              >
                السابق
              </button>
            )}

            {step !== 'schedule' ? (
              <button
                onClick={() => {
                  const steps = ['basic', 'template', 'audience', 'schedule'];
                  const currentIdx = steps.indexOf(step);
                  if (currentIdx < steps.length - 1) setStep(steps[currentIdx + 1] as any);
                }}
                disabled={!canProceed()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || !canProceed()}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    <span>إنشاء الحملة</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicInfoStep({
  campaignName,
  setCampaignName,
  campaignDescription,
  setCampaignDescription
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-black text-gray-900 mb-3">
          اسم الحملة *
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="مثال: حملة العروض الشتوية 2024"
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-black text-gray-900 mb-3">
          وصف الحملة (اختياري)
        </label>
        <textarea
          value={campaignDescription}
          onChange={(e) => setCampaignDescription(e.target.value)}
          placeholder="وصف مختصر للحملة وأهدافها..."
          rows={4}
          className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold resize-none"
        />
      </div>
    </div>
  );
}

function TemplateStep({ templates, selectedTemplate, setSelectedTemplate, customMessage, setCustomMessage }: any) {
  const [useTemplate, setUseTemplate] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <button
          onClick={() => setUseTemplate(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
            useTemplate
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span>اختر من القوالب</span>
        </button>
        <button
          onClick={() => setUseTemplate(false)}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
            !useTemplate
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Edit2 className="h-5 w-5" />
          <span>رسالة مخصصة</span>
        </button>
      </div>

      {useTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {templates.map((template: WhatsAppTemplate) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`text-right p-4 rounded-xl border-2 transition-all ${
                selectedTemplate?.id === template.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-black text-gray-900 mb-2">{template.template_name_ar}</div>
              <div className="text-sm text-gray-600 line-clamp-3">{template.message_text}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-black text-gray-900 mb-3">
            نص الرسالة *
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="اكتب رسالتك المخصصة هنا..."
            rows={8}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold resize-none"
          />
          <div className="text-sm text-gray-600 mt-2 font-semibold">
            عدد الأحرف: {customMessage.length}
          </div>
        </div>
      )}
    </div>
  );
}

function AudienceStep({ targetAudience, setTargetAudience }: any) {
  const toggleAudience = (audience: string) => {
    if (targetAudience.includes(audience)) {
      setTargetAudience(targetAudience.filter((a: string) => a !== audience));
    } else {
      setTargetAudience([...targetAudience, audience]);
    }
  };

  const audiences = [
    {
      id: 'investor',
      label: 'المستثمرون',
      icon: Users,
      description: 'جميع المستثمرين المسجلين',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'farm_owner',
      label: 'أصحاب المزارع',
      icon: Building,
      description: 'جميع أصحاب المزارع',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'admin',
      label: 'المشرفون',
      icon: Settings,
      description: 'فريق الإدارة والمشرفين',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-black text-gray-900 mb-4">
          اختر الفئة المستهدفة *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            const isSelected = targetAudience.includes(audience.id);

            return (
              <button
                key={audience.id}
                onClick={() => toggleAudience(audience.id)}
                className={`p-6 rounded-2xl border-2 transition-all text-right ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${audience.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="font-black text-gray-900 mb-2">{audience.label}</div>
                <div className="text-sm text-gray-600">{audience.description}</div>

                {isSelected && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>محدد</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleStep({ scheduleType, setScheduleType, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime }: any) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-black text-gray-900 mb-4">
          وقت الإرسال *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setScheduleType('now')}
            className={`p-6 rounded-2xl border-2 transition-all text-right ${
              scheduleType === 'now'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="font-black text-gray-900 mb-2">إرسال فوري</div>
            <div className="text-sm text-gray-600">البدء بالإرسال مباشرة بعد الإنشاء</div>
          </button>

          <button
            onClick={() => setScheduleType('scheduled')}
            className={`p-6 rounded-2xl border-2 transition-all text-right ${
              scheduleType === 'scheduled'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="font-black text-gray-900 mb-2">جدولة الإرسال</div>
            <div className="text-sm text-gray-600">تحديد وقت محدد للإرسال</div>
          </button>
        </div>
      </div>

      {scheduleType === 'scheduled' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              التاريخ *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              الوقت *
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-bold"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CampaignDetailsModal({ campaign, onClose }: { campaign: BroadcastCampaign; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black mb-1">{campaign.campaign_name}</h3>
              <p className="text-blue-100">{campaign.campaign_description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-100">
              <div className="text-sm text-blue-600 font-bold mb-1">المستلمين</div>
              <div className="text-3xl font-black text-blue-900">{campaign.total_recipients}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-100">
              <div className="text-sm text-emerald-600 font-bold mb-1">تم التسليم</div>
              <div className="text-3xl font-black text-emerald-900">{campaign.delivered_count}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-100">
              <div className="text-sm text-purple-600 font-bold mb-1">تم الإرسال</div>
              <div className="text-3xl font-black text-purple-900">{campaign.sent_count}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-100">
              <div className="text-sm text-red-600 font-bold mb-1">فاشل</div>
              <div className="text-3xl font-black text-red-900">{campaign.failed_count}</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
            <h4 className="font-black text-gray-900 mb-3">نص الرسالة</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{campaign.message_content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
