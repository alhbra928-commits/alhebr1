import React, { useState, useEffect } from 'react';
import {
  Link, Plus, Wifi, WifiOff, Zap, CheckCircle, XCircle, Trash2,
  Edit2, Settings, ArrowUp, ArrowDown, Star, Copy
} from 'lucide-react';
import { whatsappService, WhatsAppProvider } from '../../../services/whatsappService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface ProviderFormData {
  name: string;
  type: 'meta' | 'twilio' | '360dialog' | 'wati' | 'other';
  base_url: string;
  api_key: string;
  webhook_secret: string;
  phone_number: string;
  is_active: boolean;
  is_default: boolean;
}

export const ExternalIntegration: React.FC = () => {
  const [providers, setProviders] = useState<WhatsAppProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<WhatsAppProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    type: 'meta',
    base_url: '',
    api_key: '',
    webhook_secret: '',
    phone_number: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await whatsappService.getProviders();
      setProviders(data);
    } catch (err: any) {
      console.error('Error loading providers:', err);
      setError(err.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      if (editingProvider) {
        await whatsappService.updateProvider(editingProvider.id, formData);
      } else {
        await whatsappService.createProvider(formData);
      }

      await loadProviders();
      resetForm();
    } catch (err: any) {
      console.error('Error submitting provider:', err);
      setError(err.message || 'حدث خطأ في حفظ البيانات');
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      setError(null);
      const result = await whatsappService.testConnection(providerId);

      if (result.success) {
        alert(`✅ نجح الاتصال!\n${result.message}\nالوقت: ${result.latency_ms}ms`);
      } else {
        alert(`❌ فشل الاتصال!\n${result.message}`);
      }

      await loadProviders();
    } catch (err: any) {
      console.error('Error testing connection:', err);
      setError(err.message || 'حدث خطأ في اختبار الاتصال');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSetDefault = async (providerId: string) => {
    try {
      setError(null);
      await whatsappService.setDefaultProvider(providerId);
      await loadProviders();
    } catch (err: any) {
      console.error('Error setting default provider:', err);
      setError(err.message || 'حدث خطأ في تعيين المزود الافتراضي');
    }
  };

  const handleToggleActive = async (providerId: string, currentStatus: boolean) => {
    try {
      setError(null);
      await whatsappService.updateProvider(providerId, { is_active: !currentStatus });
      await loadProviders();
    } catch (err: any) {
      console.error('Error toggling provider status:', err);
      setError(err.message || 'حدث خطأ في تغيير حالة المزود');
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المزود؟')) return;

    try {
      setError(null);
      await whatsappService.deleteProvider(providerId);
      await loadProviders();
    } catch (err: any) {
      console.error('Error deleting provider:', err);
      setError(err.message || 'حدث خطأ في حذف المزود');
    }
  };

  const handleEdit = (provider: WhatsAppProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      base_url: provider.base_url || '',
      api_key: provider.api_key,
      webhook_secret: provider.webhook_secret || '',
      phone_number: provider.phone_number || '',
      is_active: provider.is_active,
      is_default: provider.is_default
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'meta',
      base_url: '',
      api_key: '',
      webhook_secret: '',
      phone_number: '',
      is_active: true,
      is_default: false
    });
    setEditingProvider(null);
    setShowForm(false);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'meta':
        return '🟢';
      case 'twilio':
        return '🔴';
      case '360dialog':
        return '🔵';
      case 'wati':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getProviderDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'meta': 'WhatsApp Business API - Meta Official',
      'twilio': 'Twilio WhatsApp Business',
      '360dialog': '360Dialog WhatsApp Partner',
      'wati': 'Wati.io WhatsApp Platform',
      'other': 'Custom WhatsApp Provider'
    };
    return descriptions[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
            <Link className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">الربط الخارجي</h1>
            <p className="text-gray-400 text-sm">إدارة مزودي خدمة الواتساب</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          مزود جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full my-8">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProvider ? 'تعديل المزود' : 'مزود جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    اسم المزود
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="مثال: Meta WhatsApp API"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    نوع المزود
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="meta">Meta (WhatsApp Business API)</option>
                    <option value="twilio">Twilio</option>
                    <option value="360dialog">360Dialog</option>
                    <option value="wati">Wati.io</option>
                    <option value="other">آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Base URL
                </label>
                <input
                  type="url"
                  value={formData.base_url}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://api.whatsapp.com/v1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your API Key"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Webhook Secret (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.webhook_secret}
                    onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Webhook verification token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+966 5XXXXXXXX"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">نشط</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">افتراضي</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  {editingProvider ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {providers.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-12 text-center">
          <Link className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">لا توجد مزودي خدمة مضافة</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
          >
            إضافة أول مزود
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                provider.is_default
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'border-gray-700/50 hover:border-green-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{getProviderIcon(provider.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                      {provider.is_default && (
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      )}
                      {provider.is_active ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-3">
                      {getProviderDescription(provider.type)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {provider.phone_number && (
                        <div className="text-gray-400">
                          <span className="text-gray-500">الهاتف:</span> {provider.phone_number}
                        </div>
                      )}
                      {provider.last_test_at && (
                        <div className="text-gray-400">
                          <span className="text-gray-500">آخر اختبار:</span>{' '}
                          {new Date(provider.last_test_at).toLocaleString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>

                    {provider.last_test_status && (
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            provider.last_test_status === 'success'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {provider.last_test_status === 'success'
                            ? '✓ متصل'
                            : '✗ فشل الاتصال'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!provider.is_default && provider.is_active && (
                    <button
                      onClick={() => handleSetDefault(provider.id)}
                      className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                      title="تعيين كافتراضي"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                    title="اختبار الاتصال"
                  >
                    {testingProvider === provider.id ? (
                      <Zap className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Wifi className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleActive(provider.id, provider.is_active)}
                    className={`p-2 rounded-lg transition-all ${
                      provider.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                    title={provider.is_active ? 'تعطيل' : 'تفعيل'}
                  >
                    {provider.is_active ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => handleEdit(provider)}
                    className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                    title="تعديل"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">💡 نصائح للربط الخارجي</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• تأكد من صحة Base URL و API Key قبل الحفظ</li>
          <li>• استخدم زر "اختبار الاتصال" للتحقق من عمل المزود</li>
          <li>• المزود الافتراضي (⭐) يُستخدم تلقائياً لإرسال الرسائل</li>
          <li>• يمكنك تفعيل عدة مزودين للاحتياط (Failover)</li>
          <li>• احفظ بيانات API بشكل آمن ولا تشاركها</li>
        </ul>
      </div>
    </div>
  );
};
