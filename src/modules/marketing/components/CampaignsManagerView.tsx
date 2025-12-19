import React, { useState } from 'react';
import { Plus, Link as LinkIcon, Copy, Check } from 'lucide-react';

export function CampaignsManagerView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    campaign_name: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  });

  const handleCreate = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      utm_source: formData.utm_source,
      utm_medium: formData.utm_medium,
      utm_campaign: formData.utm_campaign,
    });

    const generatedLink = `${baseUrl}/?${params.toString()}`;

    console.log('Generated campaign link:', generatedLink);
    alert(`تم إنشاء الحملة!\n\nالرابط: ${generatedLink}`);

    setShowCreateModal(false);
    setFormData({
      campaign_name: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              إدارة الحملات
            </h1>
            <p className="text-gray-600 mt-2">إنشاء وتتبع الحملات التسويقية</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            إنشاء حملة جديدة
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">💡 كيف تعمل الحملات؟</h2>
          <div className="space-y-3 text-white/90">
            <p>• قم بإنشاء حملة جديدة وحدد المصدر (TikTok, Instagram, إلخ)</p>
            <p>• احصل على رابط UTM فريد لكل حملة</p>
            <p>• شارك الرابط في منصات التواصل الاجتماعي</p>
            <p>• تتبع أداء كل حملة بدقة (الزيارات، التفاعل، التحويلات)</p>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl" dir="rtl">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">إنشاء حملة جديدة</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اسم الحملة
                  </label>
                  <input
                    type="text"
                    value={formData.campaign_name}
                    onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                    placeholder="مثال: عرض الشتاء 2024"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    المصدر (utm_source)
                  </label>
                  <select
                    value={formData.utm_source}
                    onChange={e => setFormData({ ...formData, utm_source: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  >
                    <option value="">اختر المصدر</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="twitter">Twitter</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الوسيط (utm_medium)
                  </label>
                  <select
                    value={formData.utm_medium}
                    onChange={e => setFormData({ ...formData, utm_medium: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  >
                    <option value="">اختر الوسيط</option>
                    <option value="video">فيديو</option>
                    <option value="story">ستوري</option>
                    <option value="post">منشور</option>
                    <option value="reel">ريلز</option>
                    <option value="ad">إعلان</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اسم الحملة للرابط (utm_campaign)
                  </label>
                  <input
                    type="text"
                    value={formData.utm_campaign}
                    onChange={e => setFormData({ ...formData, utm_campaign: e.target.value })}
                    placeholder="winter_offer_2024"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleCreate}
                  disabled={!formData.utm_source || !formData.utm_medium || !formData.utm_campaign}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إنشاء وتوليد الرابط
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
