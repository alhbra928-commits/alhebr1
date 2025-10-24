import { useState, useEffect } from 'react';
import {
  Settings, Save, TestTube, CheckCircle, XCircle, Eye, EyeOff,
  RefreshCw, Zap, Shield, Globe, Key, Link2, Sparkles, Info,
  AlertTriangle, ChevronRight, Copy, Check
} from 'lucide-react';
import { whatsappService, WhatsAppSettings as IWhatsAppSettings } from '../services/whatsappService';

export function ModernWhatsAppSettings() {
  const [settings, setSettings] = useState<IWhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'platform' | 'advanced'>('connection');
  const [copied, setCopied] = useState(false);

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
      setTestResult({ success: true, message: 'تم حفظ الإعدادات بنجاح!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult({ success: false, message: 'فشل في حفظ الإعدادات' });
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

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-black mb-1 flex items-center gap-2">
                إعدادات الواتساب
                <Sparkles className="h-7 w-7 text-yellow-300" />
              </h2>
              <p className="text-blue-100">تكوين متقدم للاتصال والإعدادات</p>
            </div>
          </div>

          {settings && (
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm border-2 ${
              settings.connection_status === 'connected'
                ? 'bg-green-500/20 border-green-300/50'
                : 'bg-red-500/20 border-red-300/50'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                settings.connection_status === 'connected'
                  ? 'bg-green-300 animate-pulse'
                  : 'bg-red-300'
              }`} />
              <span className="text-white font-bold">
                {settings.connection_status === 'connected' ? 'متصل' : 'غير متصل'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-100">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'connection'}
            onClick={() => setActiveTab('connection')}
            icon={Link2}
            label="الاتصال"
          />
          <TabButton
            active={activeTab === 'platform'}
            onClick={() => setActiveTab('platform')}
            icon={Globe}
            label="المنصة"
          />
          <TabButton
            active={activeTab === 'advanced'}
            onClick={() => setActiveTab('advanced')}
            icon={Shield}
            label="متقدم"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          {/* API Configuration */}
          <ConfigSection
            icon={Key}
            title="بيانات API"
            description="معلومات الاتصال بـ WhatsApp Business API"
            gradient="from-blue-500 to-cyan-600"
          >
            {/* API Access Token */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Key className="h-4 w-4" />
                API Access Token
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="EAAG..."
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>احصل عليه من: Meta Business Manager → App Settings → WhatsApp → API Access Token</p>
              </div>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Zap className="h-4 w-4" />
                Phone Number ID
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone_number_id}
                onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                placeholder="123456789012345"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
              />
              <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>احصل عليه من: WhatsApp Business API → Phone Numbers</p>
              </div>
            </div>

            {/* Business Account ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Globe className="h-4 w-4" />
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
          </ConfigSection>

          {/* Test Connection */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TestTube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 mb-1">اختبار الاتصال</h4>
                  <p className="text-sm text-gray-600">تحقق من صحة البيانات المدخلة</p>
                </div>
              </div>
              <button
                onClick={handleTest}
                disabled={testing || !formData.api_key || !formData.phone_number_id}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {testing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    اختبار الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'platform' && (
        <div className="space-y-6">
          <ConfigSection
            icon={Globe}
            title="إعدادات المنصة"
            description="تخصيص الرسائل والشعار"
            gradient="from-purple-500 to-pink-600"
          >
            {/* Platform Signature */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Sparkles className="h-4 w-4" />
                توقيع المنصة
              </label>
              <input
                type="text"
                value={formData.platform_signature}
                onChange={(e) => setFormData({ ...formData, platform_signature: e.target.value })}
                placeholder="🌴 مزارع النخيل - Palm Olive Platform"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">يظهر في نهاية كل رسالة تلقائية</p>
            </div>

            {/* Platform Logo URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Globe className="h-4 w-4" />
                رابط شعار المنصة
              </label>
              <input
                type="url"
                value={formData.platform_logo_url}
                onChange={(e) => setFormData({ ...formData, platform_logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Active Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-black text-gray-900 mb-1">تفعيل النظام</div>
                    <div className="text-sm text-gray-600">
                      {formData.is_active ? 'الإرسال التلقائي مفعّل' : 'الإرسال التلقائي متوقف'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-12 w-20 items-center rounded-full transition-all duration-300 ${
                    formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                      formData.is_active ? 'translate-x-9' : 'translate-x-2'
                    }`}
                  />
                </button>
              </div>
            </div>
          </ConfigSection>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <ConfigSection
            icon={Shield}
            title="إعدادات متقدمة"
            description="Webhook والأمان"
            gradient="from-yellow-500 to-orange-600"
          >
            {/* Webhook Verify Token */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Shield className="h-4 w-4" />
                Webhook Verify Token
              </label>
              <div className="relative">
                <input
                  type={showVerifyToken ? 'text' : 'password'}
                  value={formData.webhook_verify_token}
                  onChange={(e) => setFormData({ ...formData, webhook_verify_token: e.target.value })}
                  placeholder="your_verify_token"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowVerifyToken(!showVerifyToken)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showVerifyToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Webhook URL */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Link2 className="h-4 w-4" />
                Webhook Callback URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/api/whatsapp/webhook`}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border-2 border-gray-200"
                >
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">استخدم هذا الرابط في إعدادات Meta Business</p>
            </div>
          </ConfigSection>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              دليل الإعداد السريع
            </h4>
            <ol className="space-y-3 text-sm text-gray-700">
              {[
                'سجل دخول إلى Meta Business Manager',
                'اذهب إلى App Settings → WhatsApp → API Setup',
                'انسخ Temporary Access Token أو أنشئ Permanent Token',
                'انسخ Phone Number ID من قسم Phone Numbers',
                'الصق البيانات هنا واضغط "اختبار الاتصال"',
                'فعّل النظام وابدأ الإرسال!'
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`rounded-2xl p-4 border-2 ${
          testResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        } animate-fade-in`}>
          <div className="flex items-center gap-3">
            {testResult.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            )}
            <div>
              <div className={`font-bold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? 'نجح الاتصال!' : 'فشل الاتصال'}
              </div>
              <div className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-6 z-20">
        <div className="bg-white rounded-2xl p-4 shadow-2xl border-2 border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.api_key || !formData.phone_number_id}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  حفظ جميع الإعدادات
                </>
              )}
            </button>

            {!formData.api_key || !formData.phone_number_id ? (
              <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-4 py-2 rounded-xl border-2 border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                يرجى إدخال البيانات المطلوبة
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function ConfigSection({ icon: Icon, title, description, gradient, children }: any) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
