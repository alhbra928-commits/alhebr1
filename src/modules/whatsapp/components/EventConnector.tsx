import React, { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

interface EventConnector {
  id: string;
  event_type: string;
  template_id: string;
  is_active: boolean;
  priority: number;
  template_name?: string;
  template_category?: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
}

const eventTypes = [
  { value: 'booking_created', label: 'إنشاء حجز جديد', icon: '📅', description: 'يُرسل عند قيام مستثمر بحجز جديد' },
  { value: 'booking_confirmed', label: 'تأكيد الحجز', icon: '✅', description: 'يُرسل عند اكتمال الدفع وتأكيد الحجز' },
  { value: 'certificate_issued', label: 'إصدار شهادة ملكية', icon: '🏆', description: 'يُرسل عند إصدار شهادة الملكية' },
  { value: 'payment_received', label: 'استلام دفعة', icon: '💰', description: 'يُرسل عند اعتماد دفعة من المستثمر' },
  { value: 'payment_rejected', label: 'رفض دفعة', icon: '❌', description: 'يُرسل عند رفض إيصال الدفع' },
  { value: 'settlement_completed', label: 'اكتمال التسوية', icon: '💳', description: 'يُرسل عند تحويل الأرباح للمستثمرين' },
  { value: 'farm_approved', label: 'اعتماد مزرعة', icon: '🌴', description: 'يُرسل عند اعتماد مزرعة جديدة' },
  { value: 'farm_rejected', label: 'رفض مزرعة', icon: '🚫', description: 'يُرسل عند رفض طلب مزرعة' },
  { value: 'investor_welcome', label: 'ترحيب مستثمر جديد', icon: '👋', description: 'يُرسل عند تسجيل مستثمر جديد' },
  { value: 'owner_welcome', label: 'ترحيب صاحب مزرعة', icon: '🤝', description: 'يُرسل عند تسجيل صاحب مزرعة جديد' },
  { value: 'login_otp', label: 'رمز تحقق الدخول', icon: '🔑', description: 'يُرسل عند طلب رمز OTP للدخول' }
];

export const EventConnector: React.FC = () => {
  const [connectors, setConnectors] = useState<EventConnector[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    event_type: '',
    template_id: '',
    priority: 1,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [connectorsResult, templatesResult] = await Promise.all([
        supabase
          .from('whatsapp_events_connector')
          .select(`
            *,
            whatsapp_templates (
              name,
              category
            )
          `)
          .order('event_type'),
        supabase
          .from('whatsapp_templates')
          .select('id, name, category')
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('name')
      ]);

      if (connectorsResult.error) throw connectorsResult.error;
      if (templatesResult.error) throw templatesResult.error;

      const mappedConnectors = connectorsResult.data?.map(c => ({
        ...c,
        template_name: c.whatsapp_templates?.name,
        template_category: c.whatsapp_templates?.category
      })) || [];

      setConnectors(mappedConnectors);
      setTemplates(templatesResult.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('whatsapp_events_connector')
        .insert(formData);

      if (error) throw error;

      await loadData();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (connectorId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_events_connector')
        .update({ is_active: !currentStatus })
        .eq('id', connectorId);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (connectorId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الربط؟')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_events_connector')
        .delete()
        .eq('id', connectorId);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      event_type: '',
      template_id: '',
      priority: 1,
      is_active: true
    });
    setShowForm(false);
  };

  const getEventInfo = (eventType: string) => {
    return eventTypes.find(e => e.value === eventType);
  };

  const getConnectedEvents = () => {
    return connectors.map(c => c.event_type);
  };

  const getAvailableEvents = () => {
    const connected = getConnectedEvents();
    return eventTypes.filter(e => !connected.includes(e.value));
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
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ربط الأحداث الذكي</h1>
            <p className="text-gray-400 text-sm">ربط أحداث المنصة بقوالب الواتساب</p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          disabled={getAvailableEvents().length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          ربط جديد
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-white mb-4">ربط حدث بقالب</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  الحدث
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر حدث...</option>
                  {getAvailableEvents().map(event => (
                    <option key={event.value} value={event.value}>
                      {event.icon} {event.label}
                    </option>
                  ))}
                </select>
                {formData.event_type && (
                  <p className="text-xs text-gray-400 mt-1">
                    {getEventInfo(formData.event_type)?.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  القالب
                </label>
                <select
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر قالب...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-orange-400 mt-1">
                    لا توجد قوالب نشطة. يرجى إنشاء قالب أولاً.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    الأولوية
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    رقم أعلى = أولوية أعلى
                  </p>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">نشط</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={templates.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  حفظ الربط
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

      <div className="grid gap-4">
        {eventTypes.map((event) => {
          const connector = connectors.find(c => c.event_type === event.value);

          return (
            <div
              key={event.value}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                connector
                  ? 'border-purple-500/30'
                  : 'border-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">{event.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.label}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                    {connector ? (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-400 font-medium">
                          {connector.template_name}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                          {connector.template_category}
                        </span>
                        <span className="text-xs text-gray-500">
                          (أولوية: {connector.priority})
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">غير مربوط</span>
                    )}
                  </div>
                </div>

                {connector && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(connector.id, connector.is_active)}
                      className={`p-2 rounded-lg transition-all ${
                        connector.is_active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                      title={connector.is_active ? 'تعطيل' : 'تفعيل'}
                    >
                      {connector.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(connector.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">📊 ملخص الإحصائيات</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">إجمالي الأحداث:</span>
            <span className="text-white font-bold mr-2">{eventTypes.length}</span>
          </div>
          <div>
            <span className="text-gray-400">الأحداث المربوطة:</span>
            <span className="text-white font-bold mr-2">{connectors.length}</span>
          </div>
          <div>
            <span className="text-gray-400">الأحداث النشطة:</span>
            <span className="text-white font-bold mr-2">
              {connectors.filter(c => c.is_active).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
