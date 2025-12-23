import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Power, Save, X, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface TickerMessage {
  id: string;
  message_ar: string;
  message_type: 'activity' | 'alert' | 'stat' | 'custom';
  icon: string;
  is_active: boolean;
  priority: number;
  display_duration?: number;
  created_at: string;
  updated_at: string;
}

interface TickerFormData {
  message_ar: string;
  message_type: 'activity' | 'alert' | 'stat' | 'custom';
  icon: string;
  priority: number;
  display_duration?: number;
}

export function LiveTickerManagement() {
  const [messages, setMessages] = useState<TickerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<TickerFormData>({
    message_ar: '',
    message_type: 'activity',
    icon: '✨',
    priority: 50,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadMessages();

    // Setup Realtime subscription
    const channel = supabase
      .channel('ticker_messages_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticker_messages' },
        (payload) => {
          console.log('[LiveTicker] Realtime event:', payload.eventType);
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticker_messages')
        .select('*')
        .is('deleted_at', null)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading ticker messages:', error);
      showError('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Update existing message
        const { error } = await supabase
          .from('ticker_messages')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        showSuccess('تم تحديث الرسالة بنجاح');
      } else {
        // Create new message
        const { error } = await supabase
          .from('ticker_messages')
          .insert({
            ...formData,
            is_active: true,
          });

        if (error) throw error;
        showSuccess('تم إضافة الرسالة بنجاح');
      }

      resetForm();
      loadMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      showError('فشل حفظ الرسالة');
    }
  };

  const handleEdit = (message: TickerMessage) => {
    setEditingId(message.id);
    setFormData({
      message_ar: message.message_ar,
      message_type: message.message_type,
      icon: message.icon,
      priority: message.priority,
      display_duration: message.display_duration,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('ticker_messages')
        .update({
          deleted_at: new Date().toISOString(),
          is_active: false,
        })
        .eq('id', id);

      if (error) throw error;
      showSuccess('تم حذف الرسالة بنجاح');
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('فشل حذف الرسالة');
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('ticker_messages')
        .update({
          is_active: !currentState,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      showSuccess(`تم ${!currentState ? 'تفعيل' : 'تعطيل'} الرسالة بنجاح`);
      loadMessages();
    } catch (error) {
      console.error('Error toggling message:', error);
      showError('فشل تحديث حالة الرسالة');
    }
  };

  const resetForm = () => {
    setFormData({
      message_ar: '',
      message_type: 'activity',
      icon: '✨',
      priority: 50,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const messageTypeColors = {
    activity: 'from-emerald-500 to-green-500',
    alert: 'from-amber-500 to-orange-500',
    stat: 'from-blue-500 to-cyan-500',
    custom: 'from-purple-500 to-pink-500',
  };

  const messageTypeLabels = {
    activity: 'نشاط',
    alert: 'تنبيه',
    stat: 'إحصائية',
    custom: 'مخصص',
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة الشريط المتحرك</h2>
          <p className="text-sm text-gray-600 mt-1">
            أي تغيير سيظهر فوراً في الشريط المتحرك
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          إضافة رسالة جديدة
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <CheckCircle2 className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertCircle className="w-5 h-5" />
          {errorMessage}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? 'تعديل الرسالة' : 'إضافة رسالة جديدة'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Message Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص الرسالة *
                  </label>
                  <textarea
                    required
                    value={formData.message_ar}
                    onChange={(e) => setFormData({ ...formData, message_ar: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={3}
                    placeholder="مثال: تم تفعيل حجز جديد في المنصة"
                  />
                </div>

                {/* Message Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الرسالة *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['activity', 'alert', 'stat', 'custom'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, message_type: type })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.message_type === type
                            ? `border-emerald-500 bg-emerald-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{messageTypeLabels[type]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأيقونة *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="مثال: 🌱 أو ✨"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    استخدم emoji أو رمز من Lucide React
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأولوية (0-100) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    كلما زادت الأولوية، ظهرت الرسالة أولاً
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {editingId ? 'حفظ التعديلات' : 'إضافة الرسالة'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            لا توجد رسائل. أضف رسالة جديدة للبدء
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                message.is_active
                  ? 'border-emerald-200 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-br ${
                      messageTypeColors[message.message_type]
                    } text-white shadow-lg`}
                  >
                    {message.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {messageTypeLabels[message.message_type]}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        الأولوية: {message.priority}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{message.message_ar}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {message.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          نشطة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          معطلة
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(message.id, message.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      message.is_active
                        ? 'hover:bg-gray-100 text-gray-600'
                        : 'hover:bg-green-50 text-green-600'
                    }`}
                    title={message.is_active ? 'تعطيل' : 'تفعيل'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(message)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-green-800">
          التحديثات الفورية مفعّلة - أي تغيير سيظهر فوراً في الشريط
        </span>
      </div>
    </div>
  );
}
