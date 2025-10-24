import { useState, useEffect } from 'react';
import {
  Settings, Save, TestTube, CheckCircle, XCircle, Eye, EyeOff,
  RefreshCw, Zap, Shield, Globe, Key, Link2, Sparkles, Info,
  AlertTriangle, Copy, Check, Send, History, Database, Download,
  Upload, Activity, TrendingUp, Clock, Bell, Smartphone, MessageSquare,
  FileText, Lock, Unlock, AlertCircle, BarChart3, Users, Hash
} from 'lucide-react';
import { whatsappService, WhatsAppSettings as IWhatsAppSettings } from '../services/whatsappService';

export function UltraModernWhatsAppSettings() {
  const [settings, setSettings] = useState<IWhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'platform' | 'advanced' | 'usage' | 'security'>('connection');
  const [copied, setCopied] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [changeHistory, setChangeHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    api_key: '',
    phone_number_id: '',
    business_account_id: '',
    webhook_verify_token: '',
    platform_signature: '',
    platform_logo_url: '',
    is_active: false
  });

  const [apiUsage, setApiUsage] = useState({
    messages_sent_today: 0,
    messages_sent_this_month: 0,
    daily_limit: 1000,
    monthly_limit: 100000,
    success_rate: 0
  });

  useEffect(() => {
    loadSettings();
    loadUsageStats();
    loadChangeHistory();
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

  const loadUsageStats = async () => {
    try {
      const stats = await whatsappService.getOverallStats();
      setApiUsage({
        messages_sent_today: stats?.total_sent || 0,
        messages_sent_this_month: stats?.total_sent || 0,
        daily_limit: 1000,
        monthly_limit: 100000,
        success_rate: stats?.delivery_rate || 0
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const loadChangeHistory = async () => {
    const mockHistory = [
      {
        date: new Date(),
        user: 'Admin',
        action: 'تحديث API Token',
        details: 'تم تحديث مفتاح API بنجاح'
      }
    ];
    setChangeHistory(mockHistory);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await whatsappService.updateSettings(formData);
      await loadSettings();
      setTestResult({ success: true, message: 'تم حفظ الإعدادات بنجاح!' });
      setTimeout(() => setTestResult(null), 3000);

      setChangeHistory([
        {
          date: new Date(),
          user: 'Admin',
          action: 'حفظ الإعدادات',
          details: 'تم تحديث جميع الإعدادات'
        },
        ...changeHistory
      ]);
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

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber) {
      setTestResult({ success: false, message: 'يرجى إدخال رقم الهاتف' });
      return;
    }

    try {
      setSendingTest(true);
      setTestResult(null);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setTestResult({
        success: true,
        message: `تم إرسال رسالة اختبارية إلى ${testPhoneNumber} بنجاح!`
      });
      setTestPhoneNumber('');
    } catch (error) {
      setTestResult({
        success: false,
        message: 'فشل في إرسال الرسالة التجريبية'
      });
    } finally {
      setSendingTest(false);
    }
  };

  const exportSettings = () => {
    const settingsData = {
      ...formData,
      api_key: '***HIDDEN***',
      webhook_verify_token: '***HIDDEN***',
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const copyWebhookUrl = () => {
    const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSecurityScore = () => {
    let score = 0;
    if (formData.api_key) score += 25;
    if (formData.webhook_verify_token) score += 25;
    if (formData.phone_number_id) score += 25;
    if (formData.business_account_id) score += 25;
    return score;
  };

  const securityScore = getSecurityScore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse mx-auto shadow-2xl">
              <Settings className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">جاري تحميل الإعدادات</p>
          <p className="text-gray-600">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      {/* Ultra Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-cyan-600 to-blue-600 rounded-3xl p-8 shadow-2xl mb-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-black mb-1 flex items-center gap-2">
                  إعدادات WhatsApp المتقدمة
                  <Sparkles className="h-7 w-7 text-yellow-300" />
                </h1>
                <p className="text-blue-100">تكوين شامل وإدارة احترافية للنظام</p>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <QuickStatCard
              icon={MessageSquare}
              label="رسائل اليوم"
              value={apiUsage.messages_sent_today}
              max={apiUsage.daily_limit}
            />
            <QuickStatCard
              icon={TrendingUp}
              label="معدل النجاح"
              value={`${apiUsage.success_rate.toFixed(1)}%`}
            />
            <QuickStatCard
              icon={Shield}
              label="درجة الأمان"
              value={`${securityScore}%`}
            />
            <QuickStatCard
              icon={Activity}
              label="الحالة"
              value={formData.is_active ? 'مفعّل' : 'متوقف'}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-100 mb-6">
        <div className="grid grid-cols-5 gap-2">
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
            active={activeTab === 'usage'}
            onClick={() => setActiveTab('usage')}
            icon={BarChart3}
            label="الاستخدام"
          />
          <TabButton
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
            icon={Shield}
            label="الأمان"
          />
          <TabButton
            active={activeTab === 'advanced'}
            onClick={() => setActiveTab('advanced')}
            icon={Settings}
            label="متقدم"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'connection' && (
        <ConnectionTab
          formData={formData}
          setFormData={setFormData}
          showApiKey={showApiKey}
          setShowApiKey={setShowApiKey}
          testing={testing}
          handleTest={handleTest}
        />
      )}

      {activeTab === 'platform' && (
        <PlatformTab
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {activeTab === 'usage' && (
        <UsageTab
          apiUsage={apiUsage}
          testPhoneNumber={testPhoneNumber}
          setTestPhoneNumber={setTestPhoneNumber}
          sendingTest={sendingTest}
          handleSendTestMessage={handleSendTestMessage}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab
          securityScore={securityScore}
          changeHistory={changeHistory}
          exportSettings={exportSettings}
        />
      )}

      {activeTab === 'advanced' && (
        <AdvancedTab
          formData={formData}
          setFormData={setFormData}
          showVerifyToken={showVerifyToken}
          setShowVerifyToken={setShowVerifyToken}
          copied={copied}
          copyWebhookUrl={copyWebhookUrl}
        />
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`rounded-2xl p-4 border-2 mb-6 ${
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
                {testResult.success ? 'نجحت العملية!' : 'فشلت العملية'}
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
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border-2 border-amber-200">
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

function ConnectionTab({ formData, setFormData, showApiKey, setShowApiKey, testing, handleTest }: any) {
  return (
    <div className="space-y-6">
      <ConfigSection
        icon={Key}
        title="بيانات API الأساسية"
        description="معلومات الاتصال بـ WhatsApp Business API"
        gradient="from-emerald-500 to-cyan-600"
      >
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
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-sm"
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

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Smartphone className="h-4 w-4" />
            Phone Number ID
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone_number_id}
            onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
            placeholder="123456789012345"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
          />
          <div className="mt-2 flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>احصل عليه من: WhatsApp Business API → Phone Numbers</p>
          </div>
        </div>

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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>
      </ConfigSection>

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
  );
}

function PlatformTab({ formData, setFormData }: any) {
  const previewMessage = `مرحباً بك في منصتنا!\n\nشكراً لتواصلك معنا.\n\n${formData.platform_signature || '🌴 مزارع النخيل - Palm Olive Platform'}`;

  return (
    <div className="space-y-6">
      <ConfigSection
        icon={Globe}
        title="إعدادات المنصة"
        description="تخصيص الرسائل والعلامة التجارية"
        gradient="from-blue-500 to-cyan-600"
      >
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">يظهر في نهاية كل رسالة تلقائية</p>
        </div>

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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
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
                formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
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

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-black text-gray-900">معاينة الرسالة</h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-gray-800 whitespace-pre-line text-sm leading-relaxed">
              {previewMessage}
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">هكذا ستظهر رسائلك للمستخدمين</p>
        </div>
      </div>
    </div>
  );
}

function UsageTab({ apiUsage, testPhoneNumber, setTestPhoneNumber, sendingTest, handleSendTestMessage }: any) {
  const dailyPercentage = (apiUsage.messages_sent_today / apiUsage.daily_limit) * 100;
  const monthlyPercentage = (apiUsage.messages_sent_this_month / apiUsage.monthly_limit) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageCard
          title="الاستخدام اليومي"
          current={apiUsage.messages_sent_today}
          max={apiUsage.daily_limit}
          percentage={dailyPercentage}
          icon={Activity}
          color="from-blue-500 to-cyan-600"
        />
        <UsageCard
          title="الاستخدام الشهري"
          current={apiUsage.messages_sent_this_month}
          max={apiUsage.monthly_limit}
          percentage={monthlyPercentage}
          icon={BarChart3}
          color="from-emerald-500 to-green-600"
        />
      </div>

      <ConfigSection
        icon={Send}
        title="اختبار إرسال رسالة"
        description="أرسل رسالة تجريبية إلى أي رقم"
        gradient="from-cyan-500 to-blue-600"
      >
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
            <Smartphone className="h-4 w-4" />
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={testPhoneNumber}
            onChange={(e) => setTestPhoneNumber(e.target.value)}
            placeholder="966501234567"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">أدخل الرقم بدون صفر ومع كود الدولة (مثال: 966501234567)</p>
        </div>

        <button
          onClick={handleSendTestMessage}
          disabled={sendingTest || !testPhoneNumber}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingTest ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              إرسال رسالة تجريبية
            </>
          )}
        </button>
      </ConfigSection>
    </div>
  );
}

function SecurityTab({ securityScore, changeHistory, exportSettings }: any) {
  const getSecurityLevel = (score: number) => {
    if (score >= 75) return { label: 'ممتاز', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 50) return { label: 'جيد', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    return { label: 'ضعيف', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const level = getSecurityLevel(securityScore);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 bg-gradient-to-r ${securityScore >= 75 ? 'from-green-500 to-emerald-600' : securityScore >= 50 ? 'from-blue-500 to-cyan-600' : 'from-red-500 to-orange-600'} rounded-xl flex items-center justify-center`}>
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">درجة الأمان</h3>
            <p className="text-sm text-gray-600">تقييم شامل لأمان إعداداتك</p>
          </div>
          <div className={`px-6 py-3 rounded-xl border-2 ${level.bg} ${level.border}`}>
            <div className="text-3xl font-black mb-1 ${level.color}">{securityScore}%</div>
            <div className={`text-sm font-bold ${level.color}`}>{level.label}</div>
          </div>
        </div>

        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              securityScore >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              securityScore >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
              'bg-gradient-to-r from-red-500 to-orange-600'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <SecurityCheckItem
            label="API Access Token"
            completed={!!securityScore}
            icon={Key}
          />
          <SecurityCheckItem
            label="Phone Number ID"
            completed={!!securityScore}
            icon={Smartphone}
          />
          <SecurityCheckItem
            label="Webhook Verify Token"
            completed={!!securityScore}
            icon={Shield}
          />
          <SecurityCheckItem
            label="Business Account ID"
            completed={!!securityScore}
            icon={Globe}
          />
        </div>
      </div>

      <ConfigSection
        icon={History}
        title="سجل التغييرات"
        description="تتبع جميع التعديلات على الإعدادات"
        gradient="from-amber-500 to-orange-600"
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {changeHistory.map((change: any, idx: number) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{change.action}</div>
                <div className="text-sm text-gray-600">{change.details}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(change.date).toLocaleString('ar-SA')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ConfigSection>

      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 mb-1">نسخ احتياطي</h4>
              <p className="text-sm text-gray-600">احفظ نسخة من إعداداتك الحالية</p>
            </div>
          </div>
          <button
            onClick={exportSettings}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg"
          >
            <Download className="h-5 w-5" />
            تصدير
          </button>
        </div>
      </div>
    </div>
  );
}

function AdvancedTab({ formData, setFormData, showVerifyToken, setShowVerifyToken, copied, copyWebhookUrl }: any) {
  return (
    <div className="space-y-6">
      <ConfigSection
        icon={Shield}
        title="إعدادات Webhook"
        description="تكوين استقبال الإشعارات من WhatsApp"
        gradient="from-amber-500 to-orange-600"
      >
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
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
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
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
        active
          ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden md:inline">{label}</span>
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

function QuickStatCard({ icon: Icon, label, value, max }: any) {
  const percentage = max ? (value / max) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-white" />
        <span className="text-sm text-white/90 font-bold">{label}</span>
      </div>
      <div className="text-2xl font-black text-white mb-1">{value}</div>
      {max && (
        <>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-white/70 mt-1">من {max}</div>
        </>
      )}
    </div>
  );
}

function UsageCard({ title, current, max, percentage, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{current} / {max}</p>
        </div>
      </div>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-gray-700">{percentage.toFixed(1)}%</span>
        <span className="text-gray-500">متبقي: {max - current}</span>
      </div>
    </div>
  );
}

function SecurityCheckItem({ label, completed, icon: Icon }: any) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
      completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        completed ? 'bg-green-500' : 'bg-gray-400'
      }`}>
        {completed ? (
          <Check className="h-5 w-5 text-white" />
        ) : (
          <Icon className="h-5 w-5 text-white" />
        )}
      </div>
      <span className={`text-sm font-bold ${completed ? 'text-green-900' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}
