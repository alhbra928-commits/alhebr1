import { useState, useEffect } from 'react';
import {
  Settings, Save, TestTube, CheckCircle, XCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { whatsappService, WhatsAppSettings as IWhatsAppSettings } from '../services/whatsappService';

export function WhatsAppSettings() {
  const [settings, setSettings] = useState<IWhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);

  const [formData, setFormData] = useState({
    api_key: '',
    phone_number_id: '',
    business_account_id: '',
    webhook_verify_token: '',
    platform_signature: '',
    platform_logo_url: '',
    is_active: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await whatsappService.getSettings();
      if (data) {
        setSettings(data);
        setFormData({
          api_key: data.api_key || '',
          phone_number_id: data.phone_number_id || '',
          business_account_id: data.business_account_id || '',
          webhook_verify_token: data.webhook_verify_token || '',
          platform_signature: data.platform_signature || '',
          platform_logo_url: data.platform_logo_url || '',
          is_active: data.is_active
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await whatsappService.updateSettings(formData);
      await loadSettings();
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const result = await whatsappService.testConnection();
      setTestResult(result);
      await loadSettings();
    } catch (error) {
      setTestResult({
        success: false,
        message: 'فشل في اختبار الاتصال'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">إعدادات الواتساب</h2>
            <p className="text-gray-600">تكوين الاتصال مع WhatsApp Business API</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {settings && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              settings.connection_status === 'connected'
                ? 'bg-green-50 border-2 border-green-200'
                : settings.connection_status === 'error'
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-gray-50 border-2 border-gray-200'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                settings.connection_status === 'connected'
                  ? 'bg-green-500 animate-pulse'
                  : settings.connection_status === 'error'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              }`} />
              <span className={`text-sm font-bold ${
                settings.connection_status === 'connected'
                  ? 'text-green-700'
                  : settings.connection_status === 'error'
                  ? 'text-red-700'
                  : 'text-gray-700'
              }`}>
                {settings.connection_status === 'connected' ? 'متصل' :
                 settings.connection_status === 'error' ? 'خطأ' : 'غير متصل'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          إعدادات WhatsApp Business API
        </h3>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              API Access Token *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="EAAG..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              احصل عليه من: Meta Business Manager → App Settings → WhatsApp → API Access Token
            </p>
          </div>

          {/* Phone Number ID */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number ID *
            </label>
            <input
              type="text"
              value={formData.phone_number_id}
              onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              احصل عليه من: WhatsApp Business API → Phone Numbers
            </p>
          </div>

          {/* Business Account ID */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              WhatsApp Business Account ID
            </label>
            <input
              type="text"
              value={formData.business_account_id}
              onChange={(e) => setFormData({ ...formData, business_account_id: e.target.value })}
              placeholder="123456789012345"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Webhook Verify Token */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Webhook Verify Token
            </label>
            <div className="relative">
              <input
                type={showVerifyToken ? 'text' : 'password'}
                value={formData.webhook_verify_token}
                onChange={(e) => setFormData({ ...formData, webhook_verify_token: e.target.value })}
                placeholder="your_verify_token"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowVerifyToken(!showVerifyToken)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showVerifyToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              استخدمه للتحقق من Webhook Callback URL
            </p>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Settings className="h-5 w-5 text-green-600" />
          إعدادات المنصة
        </h3>

        <div className="space-y-4">
          {/* Platform Signature */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              توقيع المنصة
            </label>
            <input
              type="text"
              value={formData.platform_signature}
              onChange={(e) => setFormData({ ...formData, platform_signature: e.target.value })}
              placeholder="🌴 مزارع النخيل - Palm Olive Platform"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              يظهر في نهاية كل رسالة
            </p>
          </div>

          {/* Platform Logo URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رابط شعار المنصة
            </label>
            <input
              type="url"
              value={formData.platform_logo_url}
              onChange={(e) => setFormData({ ...formData, platform_logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <div className="font-bold text-gray-900 mb-1">تفعيل النظام</div>
              <div className="text-sm text-gray-600">
                تشغيل/إيقاف إرسال الرسائل التلقائية
              </div>
            </div>
            <button
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                formData.is_active ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-xl border-2 ${
          testResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {testResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <div className={`font-bold ${
                testResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {testResult.success ? 'نجح الاتصال!' : 'فشل الاتصال'}
              </div>
              <div className={`text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleTest}
          disabled={testing || !formData.api_key || !formData.phone_number_id}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-500 text-blue-700 rounded-xl hover:bg-blue-50 transition-colors font-bold disabled:opacity-50"
        >
          {testing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              جاري الاختبار...
            </>
          ) : (
            <>
              <TestTube className="h-5 w-5" />
              اختبار الاتصال
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !formData.api_key || !formData.phone_number_id}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-black text-gray-900 mb-4">📚 كيفية الحصول على بيانات API</h4>
        <ol className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">1.</span>
            <span>سجل دخول إلى <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">Meta Business Manager</a></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">2.</span>
            <span>اذهب إلى <strong>App Settings → WhatsApp → API Setup</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">3.</span>
            <span>انسخ <strong>Temporary Access Token</strong> (أو أنشئ Permanent Token)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">4.</span>
            <span>انسخ <strong>Phone Number ID</strong> من قسم Phone Numbers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-blue-600">5.</span>
            <span>الصق البيانات هنا واضغط "اختبار الاتصال"</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
