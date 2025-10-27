import React, { useState, useEffect } from 'react';
import { ExternalLink, Save, TestTube, Check, AlertCircle, Briefcase, Link as LinkIcon } from 'lucide-react';
import { systemSettingsService } from '../services/systemSettingsService';

export const BusinessWhatsAppSettings: React.FC = () => {
  const [businessLink, setBusinessLink] = useState('');
  const [originalLink, setOriginalLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadBusinessLink();
  }, []);

  useEffect(() => {
    setHasChanges(businessLink !== originalLink && businessLink.trim() !== '');
  }, [businessLink, originalLink]);

  const loadBusinessLink = async () => {
    try {
      setLoading(true);
      const link = await systemSettingsService.getBusinessWhatsAppLink();
      setBusinessLink(link);
      setOriginalLink(link);
    } catch (error) {
      console.error('Error loading business link:', error);
      showMessage('error', 'فشل تحميل رابط واتساب الأعمال');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!businessLink.trim()) {
      showMessage('error', 'الرجاء إدخال رابط واتساب الأعمال');
      return;
    }

    if (!systemSettingsService.isValidWhatsAppLink(businessLink)) {
      showMessage('error', '⚠️ الرجاء إدخال رابط واتساب أعمال صالح من حساب المنصة التجاري');
      return;
    }

    try {
      setSaving(true);
      const success = await systemSettingsService.updateBusinessWhatsAppLink(businessLink);

      if (success) {
        setOriginalLink(businessLink);
        showMessage('success', '✅ تم حفظ رابط واتساب الأعمال بنجاح!');
      } else {
        showMessage('error', 'فشل حفظ الرابط');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = () => {
    if (!businessLink.trim()) {
      showMessage('error', 'الرجاء إدخال رابط أولاً');
      return;
    }

    if (!systemSettingsService.isValidWhatsAppLink(businessLink)) {
      showMessage('error', 'الرابط غير صالح');
      return;
    }

    systemSettingsService.testWhatsAppLink(businessLink);
    showMessage('success', 'تم فتح الرابط في نافذة جديدة');
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
        <p className="text-gray-400 text-center">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30" dir="rtl">
      {/* العنوان */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">💼 رابط واتساب الأعمال الرسمي</h3>
          <p className="text-gray-400 text-sm">
            يُستخدم تلقائياً في الردود الجاهزة وفي الرد الاحتياطي الذكي عند فشل الذكاء الصناعي
          </p>
        </div>
      </div>

      {/* رسالة التنبيه */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* حقل الإدخال */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            رابط واتساب الأعمال:
          </label>
          <div className="relative">
            <input
              type="text"
              value={businessLink}
              onChange={(e) => setBusinessLink(e.target.value)}
              placeholder="https://wa.me/message/XXXXXXXXXXXX"
              className="w-full px-4 py-3 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-12"
              dir="ltr"
            />
            <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            💡 يجب أن يبدأ الرابط بـ <code className="bg-gray-700/50 px-2 py-1 rounded">https://wa.me/message/</code>
          </p>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                💾 حفظ الرابط
                {hasChanges && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">تغييرات غير محفوظة</span>}
              </>
            )}
          </button>

          <button
            onClick={handleTest}
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
          >
            <TestTube className="w-5 h-5" />
            🔍 اختبار الرابط
          </button>
        </div>
      </div>

      {/* ملاحظة */}
      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>ملاحظة:</strong> هذا الرابط هو القناة الرسمية للمنصة في واتساب أعمال.
            سيتم استخدامه تلقائياً في جميع الردود التي لا تحتوي على رابط مخصص.
          </span>
        </p>
      </div>
    </div>
  );
};
