import { useState, useEffect } from 'react';
import {
  Users, Plus, Send, Eye, Calendar, CheckCheck, AlertCircle, X
} from 'lucide-react';
import { whatsappService, BroadcastCampaign } from '../services/whatsappService';

export function BroadcastManager() {
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await whatsappService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مسودة' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'مجدول' },
      sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'جاري الإرسال' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'مكتمل' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'ملغي' }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="h-12 w-12 text-green-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل الحملات...</p>
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
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">البث الجماعي</h2>
            <p className="text-gray-600">إرسال رسائل لمجموعات كبيرة</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          حملة جديدة
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 mb-2">لا توجد حملات</h3>
            <p className="text-gray-600 mb-6">ابدأ بإنشاء حملة بث جماعي جديدة</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              إنشاء حملة جديدة
            </button>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const statusBadge = getStatusBadge(campaign.status);
            const successRate = campaign.total_recipients > 0
              ? (campaign.delivered_count / campaign.total_recipients) * 100
              : 0;

            return (
              <div
                key={campaign.id}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 mb-1">
                      {campaign.campaign_name}
                    </h3>
                    {campaign.campaign_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {campaign.campaign_description}
                      </p>
                    )}
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="text-sm text-blue-600 mb-1">إجمالي المستلمين</div>
                    <div className="text-2xl font-black text-blue-900">
                      {campaign.total_recipients}
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-600 mb-1">تم التسليم</div>
                    <div className="text-2xl font-black text-green-900">
                      {campaign.delivered_count}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="text-sm text-purple-600 mb-1">تم الإرسال</div>
                    <div className="text-2xl font-black text-purple-900">
                      {campaign.sent_count}
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-xl">
                    <div className="text-sm text-red-600 mb-1">فاشل</div>
                    <div className="text-2xl font-black text-red-900">
                      {campaign.failed_count}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {campaign.total_recipients > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">معدل النجاح</span>
                      <span className="text-sm font-bold text-gray-900">
                        {successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(campaign.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-bold text-sm">
                    <Eye className="h-4 w-4" />
                    عرض
                  </button>

                  {campaign.status === 'draft' && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm">
                      <Send className="h-4 w-4" />
                      إرسال
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            loadCampaigns();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// مكون Modal لإنشاء حملة
function CreateCampaignModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<string[]>(['investor']);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      await whatsappService.createCampaign({
        campaign_name: campaignName,
        campaign_description: campaignDescription,
        message_content: messageContent,
        target_audience: targetAudience,
        total_recipients: 0,
        status: 'draft'
      });

      onSave();
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('فشل في إنشاء الحملة');
    } finally {
      setSaving(false);
    }
  };

  const toggleAudience = (audience: string) => {
    if (targetAudience.includes(audience)) {
      setTargetAudience(targetAudience.filter(a => a !== audience));
    } else {
      setTargetAudience([...targetAudience, audience]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black">حملة بث جماعي جديدة</h3>
                <p className="text-purple-100 text-sm">إرسال رسالة لمجموعة كبيرة</p>
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
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اسم الحملة *
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="مثال: حملة العروض الشتوية"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Campaign Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              وصف الحملة
            </label>
            <input
              type="text"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
              placeholder="وصف مختصر للحملة"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              الفئة المستهدفة *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'investor', label: 'المستثمرون', icon: '👥' },
                { id: 'farm_owner', label: 'أصحاب المزارع', icon: '🌾' },
                { id: 'admin', label: 'المشرفون', icon: '⚙️' }
              ].map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => toggleAudience(audience.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    targetAudience.includes(audience.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{audience.icon}</div>
                  <div className="text-sm font-bold text-gray-900">
                    {audience.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              نص الرسالة *
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
            />
            <div className="text-xs text-gray-500 mt-2">
              عدد الأحرف: {messageContent.length}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !campaignName || !messageContent || targetAudience.length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-bold disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ الحملة'}
          </button>
        </div>
      </div>
    </div>
  );
}
