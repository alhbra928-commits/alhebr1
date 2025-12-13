import { useState, useEffect } from 'react';
import { Save, RefreshCw, Building2, Mail, Phone, MessageCircle, MapPin, Shield, Eye, EyeOff, Smartphone } from 'lucide-react';
import { footerService, FooterInfo } from '../../../services/footerService';

export function FooterManagement() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    setLoading(true);
    const data = await footerService.getActiveFooter();
    if (data) {
      setFooterInfo(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!footerInfo) return;

    setSaving(true);
    setMessage(null);

    try {
      const success = await footerService.updateFooter(footerInfo.id, footerInfo);
      if (success) {
        setMessage({ type: 'success', text: 'تم حفظ معلومات الفوتر بنجاح!' });
      } else {
        setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof FooterInfo, value: any) => {
    if (!footerInfo) return;
    setFooterInfo({ ...footerInfo, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!footerInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">لا توجد معلومات فوتر</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الفوتر</h2>
          <p className="text-gray-500 mt-1">إدارة معلومات التواصل والتوثيق في أسفل الصفحة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ التغييرات
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Organization Info Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">معلومات المؤسسة</h3>
            <p className="text-sm text-gray-500">الاسم والسجل التجاري</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المؤسسة (عربي) *
            </label>
            <input
              type="text"
              value={footerInfo.organization_name_ar}
              onChange={(e) => updateField('organization_name_ar', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المؤسسة (English)
            </label>
            <input
              type="text"
              value={footerInfo.organization_name_en}
              onChange={(e) => updateField('organization_name_en', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم السجل التجاري
            </label>
            <input
              type="text"
              value={footerInfo.commercial_registration}
              onChange={(e) => updateField('commercial_registration', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">معلومات التواصل</h3>
            <p className="text-sm text-gray-500">البريد، الهاتف، والواتساب</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={footerInfo.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              رقم الهاتف
            </label>
            <input
              type="text"
              value={footerInfo.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageCircle size={16} />
              واتساب
            </label>
            <input
              type="text"
              value={footerInfo.whatsapp}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">الموقع الجغرافي</h3>
            <p className="text-sm text-gray-500">المدينة والدولة</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة (عربي)
            </label>
            <input
              type="text"
              value={footerInfo.city_ar}
              onChange={(e) => updateField('city_ar', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة (English)
            </label>
            <input
              type="text"
              value={footerInfo.city_en}
              onChange={(e) => updateField('city_en', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدولة (عربي)
            </label>
            <input
              type="text"
              value={footerInfo.country_ar}
              onChange={(e) => updateField('country_ar', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الدولة (English)
            </label>
            <input
              type="text"
              value={footerInfo.country_en}
              onChange={(e) => updateField('country_en', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Trust Statement Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">عبارة الثقة والتوثيق</h3>
            <p className="text-sm text-gray-500">رسالة تعزز المصداقية لدى المستخدم</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عبارة الثقة (عربي)
            </label>
            <textarea
              value={footerInfo.trust_statement_ar}
              onChange={(e) => updateField('trust_statement_ar', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عبارة الثقة (English)
            </label>
            <textarea
              value={footerInfo.trust_statement_en}
              onChange={(e) => updateField('trust_statement_en', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Legal Links Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">الروابط القانونية</h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_privacy"
              checked={footerInfo.show_privacy_policy}
              onChange={(e) => updateField('show_privacy_policy', e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="show_privacy" className="flex-1">
              <span className="text-sm font-medium text-gray-900">عرض سياسة الخصوصية</span>
            </label>
            {footerInfo.show_privacy_policy && (
              <input
                type="text"
                value={footerInfo.privacy_policy_url}
                onChange={(e) => updateField('privacy_policy_url', e.target.value)}
                placeholder="/privacy-policy"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                dir="ltr"
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_terms"
              checked={footerInfo.show_terms_conditions}
              onChange={(e) => updateField('show_terms_conditions', e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="show_terms" className="flex-1">
              <span className="text-sm font-medium text-gray-900">عرض الشروط والأحكام</span>
            </label>
            {footerInfo.show_terms_conditions && (
              <input
                type="text"
                value={footerInfo.terms_conditions_url}
                onChange={(e) => updateField('terms_conditions_url', e.target.value)}
                placeholder="/terms-conditions"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                dir="ltr"
              />
            )}
          </div>
        </div>
      </div>

      {/* Display Settings Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">إعدادات العرض</h3>
            <p className="text-sm text-gray-500">التحكم في ظهور الفوتر</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_mobile"
              checked={footerInfo.show_in_mobile}
              onChange={(e) => updateField('show_in_mobile', e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="show_mobile" className="flex-1">
              <span className="text-sm font-medium text-gray-900">عرض في الجوال</span>
              <p className="text-xs text-gray-500 mt-1">إذا تم التعطيل، لن يظهر الفوتر في شاشات الجوال</p>
            </label>
          </div>

          {footerInfo.show_in_mobile && (
            <div className="flex items-center gap-3 mr-8">
              <input
                type="checkbox"
                id="mobile_collapsed"
                checked={footerInfo.mobile_collapsed}
                onChange={(e) => updateField('mobile_collapsed', e.target.checked)}
                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="mobile_collapsed" className="flex-1">
                <span className="text-sm font-medium text-gray-900">مضغوط في الجوال</span>
                <p className="text-xs text-gray-500 mt-1">يظهر شريط مختصر قابل للتوسيع</p>
              </label>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={footerInfo.is_active}
              onChange={(e) => updateField('is_active', e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="flex-1">
              <span className="text-sm font-medium text-gray-900">نشط</span>
              <p className="text-xs text-gray-500 mt-1">تفعيل/تعطيل الفوتر بالكامل</p>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">المظهر والألوان</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              لون الخلفية
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footerInfo.footer_bg_color}
                onChange={(e) => updateField('footer_bg_color', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={footerInfo.footer_bg_color}
                onChange={(e) => updateField('footer_bg_color', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              لون النص
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={footerInfo.footer_text_color}
                onChange={(e) => updateField('footer_text_color', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={footerInfo.footer_text_color}
                onChange={(e) => updateField('footer_text_color', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ جميع التغييرات
            </>
          )}
        </button>
      </div>
    </div>
  );
}
