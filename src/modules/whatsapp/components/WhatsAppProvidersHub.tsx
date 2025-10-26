import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Wifi, WifiOff, Zap, CheckCircle, XCircle, Trash2, Edit2, Settings } from 'lucide-react';
import { whatsappService, WhatsAppProvider } from '../../../services/whatsappService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface ProviderFormData {
  name: string;
  type: 'meta' | 'twilio' | '360dialog' | 'other';
  base_url: string;
  api_key: string;
  webhook_secret: string;
  phone_number: string;
  is_active: boolean;
  is_default: boolean;
}

export const WhatsAppProvidersHub: React.FC = () => {
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
      const data = await whatsappService.getProviders();
      setProviders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProvider) {
        await whatsappService.updateProvider(editingProvider.id, formData);
      } else {
        await whatsappService.createProvider(formData);
      }

      await loadProviders();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingProvider(providerId);
    try {
      const result = await whatsappService.testConnection(providerId);

      if (result.success) {
        alert(`✅ ${result.message}\nالوقت: ${result.latency_ms}ms`);
      } else {
        alert(`❌ ${result.message}`);
      }

      await loadProviders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المزود؟')) return;

    try {
      await whatsappService.deleteProvider(providerId);
      await loadProviders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (provider: WhatsAppProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      base_url: provider.base_url,
      api_key: provider.api_key,
      webhook_secret: provider.webhook_secret || '',
      phone_number: provider.phone_number,
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
    return <MessageCircle className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
            <CheckCircle className="w-3 h-3" />
            متصل
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
            <XCircle className="w-3 h-3" />
            فشل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
            <Settings className="w-3 h-3" />
            معلق
          </span>
        );
    }
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
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ربط الواتساب مع الشركات</h1>
            <p className="text-gray-400 text-sm">إدارة مزودي خدمة الواتساب</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة مزود جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProvider ? 'تعديل المزود' : 'إضافة مزود جديد'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  اسم المزود
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <option value="meta">Meta (Facebook)</option>
                  <option value="twilio">Twilio</option>
                  <option value="360dialog">360Dialog</option>
                  <option value="other">أخرى</option>
                </select>
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
                  placeholder="https://api.provider.com/v1/messages"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Webhook Secret (اختياري)
                </label>
                <input
                  type="password"
                  value={formData.webhook_secret}
                  onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  رقم الواتساب
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+966xxxxxxxxx"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-300">مفعل</span>
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
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
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
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">لا توجد مزودات خدمة مضافة</p>
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
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    provider.is_active ? 'bg-green-500/20' : 'bg-gray-700'
                  }`}>
                    {getProviderIcon(provider.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                      {provider.is_default && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          افتراضي
                        </span>
                      )}
                      {getStatusBadge(provider.test_status)}
                      {provider.is_active ? (
                        <Wifi className="w-4 h-4 text-green-400" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-gray-500" />
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">
                        <span className="text-gray-500">النوع:</span> {provider.type}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-gray-500">الرقم:</span> {provider.phone_number}
                      </p>
                      <p className="text-gray-400 truncate max-w-md">
                        <span className="text-gray-500">URL:</span> {provider.base_url}
                      </p>
                      {provider.test_message && (
                        <p className="text-gray-400 text-xs">
                          {provider.test_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(provider.id)}
                    disabled={testingProvider === provider.id}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all disabled:opacity-50"
                    title="اختبار الاتصال"
                  >
                    {testingProvider === provider.id ? (
                      <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
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
    </div>
  );
};
