import { useState, useEffect } from 'react';
import {
  TrendingUp, Power, Database, Gauge, Clock, Eye, Plus, Edit2,
  Trash2, Save, X, ArrowUp, ArrowDown, Check
} from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { ActivityBarService, ActivityBarSettings, ActivityBarMessage } from '../../../services/activityBarService';

export function LiveActivityBarSettings() {
  const [settings, setSettings] = useState<ActivityBarSettings | null>(null);
  const [messages, setMessages] = useState<ActivityBarMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ActivityBarMessage | null>(null);
  const [newMessage, setNewMessage] = useState({
    message_ar: '',
    message_en: '',
    icon: 'TrendingUp',
    category: 'general' as const,
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, messagesData] = await Promise.all([
        ActivityBarService.getSettings(),
        ActivityBarService.getMockMessages()
      ]);

      if (settingsData) {
        setSettings(settingsData);
      }
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const success = await ActivityBarService.updateSettings(settings);
      if (success) {
        alert('تم حفظ الإعدادات بنجاح');
        window.dispatchEvent(new Event('activity-bar-settings-updated'));
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.message_ar.trim()) {
      alert('يرجى إدخال نص الرسالة بالعربية');
      return;
    }

    try {
      const success = await ActivityBarService.addMessage(newMessage);
      if (success) {
        alert('تم إضافة الرسالة بنجاح');
        setShowAddModal(false);
        setNewMessage({
          message_ar: '',
          message_en: '',
          icon: 'TrendingUp',
          category: 'general',
          display_order: 0,
          is_active: true
        });
        loadData();
      } else {
        alert('حدث خطأ أثناء إضافة الرسالة');
      }
    } catch (error) {
      console.error('Error adding message:', error);
      alert('حدث خطأ أثناء إضافة الرسالة');
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;

    try {
      const success = await ActivityBarService.updateMessage(editingMessage.id, editingMessage);
      if (success) {
        alert('تم تحديث الرسالة بنجاح');
        setEditingMessage(null);
        loadData();
      } else {
        alert('حدث خطأ أثناء تحديث الرسالة');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      alert('حدث خطأ أثناء تحديث الرسالة');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const success = await ActivityBarService.deleteMessage(id);
      if (success) {
        alert('تم حذف الرسالة بنجاح');
        loadData();
      } else {
        alert('حدث خطأ أثناء حذف الرسالة');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('حدث خطأ أثناء حذف الرسالة');
    }
  };

  const handleMoveMessage = async (message: ActivityBarMessage, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? message.display_order - 1 : message.display_order + 1;
    try {
      await ActivityBarService.updateMessage(message.id, { display_order: newOrder });
      loadData();
    } catch (error) {
      console.error('Error moving message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D5B4B] mx-auto mb-4"></div>
          <p className="text-[#2C2C2C]/70">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>حدث خطأ في تحميل الإعدادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8" />
          <h2 className="text-2xl font-black">إعدادات الشريط العلوي</h2>
        </div>
        <p className="text-white/80">تحكم كامل في شريط النشاط المباشر</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card3D interactive={false}>
          <div className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Power className="h-6 w-6 text-[#3D5B4B]" />
              <h3 className="text-xl font-bold text-[#2C2C2C]">التحكم العام</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F9F8F6] rounded-xl">
                <span className="font-semibold text-[#2C2C2C]">تفعيل الشريط</span>
                <button
                  onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    settings.is_enabled ? 'bg-[#3D5B4B]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      settings.is_enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-[#F9F8F6] rounded-xl">
                <label className="block font-semibold text-[#2C2C2C] mb-3">
                  <Database className="inline h-5 w-5 mr-2" />
                  نوع البيانات
                </label>
                <select
                  value={settings.data_mode}
                  onChange={(e) => setSettings({ ...settings, data_mode: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3D5B4B]/20 focus:border-[#3D5B4B] outline-none"
                >
                  <option value="mock">بيانات وهمية (محاكاة)</option>
                  <option value="real">بيانات حقيقية من المنصة</option>
                  <option value="hybrid">وضع مختلط (هجين)</option>
                </select>
              </div>

              <div className="p-4 bg-[#F9F8F6] rounded-xl">
                <label className="block font-semibold text-[#2C2C2C] mb-3">
                  <Gauge className="inline h-5 w-5 mr-2" />
                  سرعة الحركة
                </label>
                <select
                  value={settings.scroll_speed}
                  onChange={(e) => setSettings({ ...settings, scroll_speed: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3D5B4B]/20 focus:border-[#3D5B4B] outline-none"
                >
                  <option value="slow">بطيء</option>
                  <option value="medium">متوسط</option>
                  <option value="fast">سريع</option>
                </select>
              </div>

              <div className="p-4 bg-[#F9F8F6] rounded-xl">
                <label className="block font-semibold text-[#2C2C2C] mb-3">
                  <Clock className="inline h-5 w-5 mr-2" />
                  مدة عرض كل إعلان (ثانية)
                </label>
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={settings.display_duration}
                  onChange={(e) => setSettings({ ...settings, display_duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3D5B4B]/20 focus:border-[#3D5B4B] outline-none"
                />
                <p className="text-xs text-[#2C2C2C]/60 mt-2">
                  ملاحظة: لا يوجد توقف بين الإعلانات - يتم الانتقال مباشرة
                </p>
              </div>
            </div>
          </div>
        </Card3D>

        <Card3D interactive={false}>
          <div className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="h-6 w-6 text-[#3D5B4B]" />
              <h3 className="text-xl font-bold text-[#2C2C2C]">نوع الأحداث المعروضة</h3>
            </div>

            <div className="space-y-3">
              {[
                { key: 'show_ownership', label: 'عمليات التملك' },
                { key: 'show_registrations', label: 'التسجيلات الجديدة' },
                { key: 'show_reservations', label: 'الحجوزات' },
                { key: 'show_investors', label: 'نشاط المستثمرين' },
                { key: 'show_farms', label: 'نشاط المزارع' },
                { key: 'show_marketing', label: 'أحداث تسويقية' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-[#F9F8F6] rounded-xl">
                  <span className="font-medium text-[#2C2C2C]">{label}</span>
                  <button
                    onClick={() => setSettings({ ...settings, [key]: !settings[key as keyof ActivityBarSettings] })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      settings[key as keyof ActivityBarSettings] ? 'bg-[#3D5B4B]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        settings[key as keyof ActivityBarSettings] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card3D>
      </div>

      <Card3D interactive={false}>
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-[#3D5B4B]" />
              <h3 className="text-xl font-bold text-[#2C2C2C]">إدارة الرسائل الوهمية</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="h-5 w-5" />
              إضافة رسالة
            </button>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between p-4 bg-[#F9F8F6] rounded-xl hover:bg-[#F4EBDD] transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-[#2C2C2C]">{message.message_ar}</p>
                  <p className="text-sm text-[#2C2C2C]/60 mt-1">
                    الفئة: {message.category} | الترتيب: {message.display_order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveMessage(message, 'up')}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ArrowUp className="h-5 w-5 text-[#3D5B4B]" />
                  </button>
                  <button
                    onClick={() => handleMoveMessage(message, 'down')}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <ArrowDown className="h-5 w-5 text-[#3D5B4B]" />
                  </button>
                  <button
                    onClick={() => setEditingMessage(message)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card3D>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-6 w-6" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>

      {(showAddModal || editingMessage) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#2C2C2C]">
                {editingMessage ? 'تعديل الرسالة' : 'إضافة رسالة جديدة'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMessage(null);
                }}
                className="p-2 hover:bg-[#F9F8F6] rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[#2C2C2C] mb-2">
                  الرسالة بالعربية
                </label>
                <textarea
                  value={editingMessage ? editingMessage.message_ar : newMessage.message_ar}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingMessage({ ...editingMessage, message_ar: e.target.value });
                    } else {
                      setNewMessage({ ...newMessage, message_ar: e.target.value });
                    }
                  }}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3D5B4B]/20 focus:border-[#3D5B4B] outline-none"
                  placeholder="أدخل نص الرسالة..."
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2C2C2C] mb-2">الفئة</label>
                <select
                  value={editingMessage ? editingMessage.category : newMessage.category}
                  onChange={(e) => {
                    if (editingMessage) {
                      setEditingMessage({ ...editingMessage, category: e.target.value as any });
                    } else {
                      setNewMessage({ ...newMessage, category: e.target.value as any });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3D5B4B]/20 focus:border-[#3D5B4B] outline-none"
                >
                  <option value="general">عام</option>
                  <option value="ownership">تملك</option>
                  <option value="registration">تسجيل</option>
                  <option value="reservation">حجز</option>
                  <option value="investor">مستثمر</option>
                  <option value="farm">مزرعة</option>
                  <option value="marketing">تسويق</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMessage(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-[#2C2C2C] rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={editingMessage ? handleUpdateMessage : handleAddMessage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3D5B4B] to-[#4A6F5C] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Check className="inline h-5 w-5 ml-2" />
                  {editingMessage ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
