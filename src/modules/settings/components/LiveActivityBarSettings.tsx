import { useState, useEffect } from 'react';
import {
  Activity, Power, Zap, Settings, Plus, Trash2, Edit2, Save,
  AlertCircle, CheckCircle, TreePine, Calendar, UserPlus, Shield
} from 'lucide-react';
import { liveActivityBarService, ActivityBarSettings, FakeEvent } from '../../../services/liveActivityBarService';

export function LiveActivityBarSettings() {
  const [settings, setSettings] = useState<ActivityBarSettings | null>(null);
  const [fakeEvents, setFakeEvents] = useState<FakeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<FakeEvent | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // حالة النموذج للحدث الجديد
  const [newEvent, setNewEvent] = useState({
    event_type: 'ownership' as const,
    message_ar: '',
    message_en: '',
    icon: 'TreePine',
    priority: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, eventsData] = await Promise.all([
        liveActivityBarService.getSettings(),
        liveActivityBarService.getFakeEvents()
      ]);
      setSettings(settingsData);
      setFakeEvents(eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateSettings = async (updates: Partial<ActivityBarSettings>) => {
    if (!settings) return;

    try {
      setSaving(true);
      const updated = await liveActivityBarService.updateSettings(updates);
      setSettings(updated);
      showMessage('success', 'تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Error updating settings:', error);
      showMessage('error', 'حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.message_ar || !newEvent.message_en) {
      showMessage('error', 'يرجى إدخال الرسالة بالعربية والإنجليزية');
      return;
    }

    try {
      setSaving(true);
      await liveActivityBarService.addFakeEvent({
        ...newEvent,
        enabled: true
      });
      await loadData();
      setShowAddEvent(false);
      setNewEvent({
        event_type: 'ownership',
        message_ar: '',
        message_en: '',
        icon: 'TreePine',
        priority: 1
      });
      showMessage('success', 'تم إضافة الحدث بنجاح');
    } catch (error) {
      console.error('Error adding event:', error);
      showMessage('error', 'حدث خطأ في إضافة الحدث');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<FakeEvent>) => {
    try {
      setSaving(true);
      await liveActivityBarService.updateFakeEvent(id, updates);
      await loadData();
      setEditingEvent(null);
      showMessage('success', 'تم تحديث الحدث بنجاح');
    } catch (error) {
      console.error('Error updating event:', error);
      showMessage('error', 'حدث خطأ في تحديث الحدث');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحدث؟')) return;

    try {
      setSaving(true);
      await liveActivityBarService.deleteFakeEvent(id);
      await loadData();
      showMessage('success', 'تم حذف الحدث بنجاح');
    } catch (error) {
      console.error('Error deleting event:', error);
      showMessage('error', 'حدث خطأ في حذف الحدث');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* رسالة النجاح/الخطأ */}
      {message && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* الإعدادات الأساسية */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#2C2C2C]">الإعدادات الأساسية</h3>
              <p className="text-sm text-[#2C2C2C]/60">التحكم في شريط النشاط المباشر</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* تفعيل/إيقاف الشريط */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Power className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-[#2C2C2C]">تفعيل الشريط</p>
                  <p className="text-sm text-[#2C2C2C]/60">إظهار/إخفاء شريط النشاط</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdateSettings({ enabled: !settings.enabled })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                  settings.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                disabled={saving}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* وضع التشغيل */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                وضع التشغيل
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'fake', label: 'وهمي', desc: 'أحداث تجريبية' },
                  { value: 'real', label: 'حقيقي', desc: 'أحداث فعلية' },
                  { value: 'hybrid', label: 'هجين', desc: 'دمج الاثنين' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => handleUpdateSettings({ mode: mode.value as any })}
                    disabled={saving}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      settings.mode === mode.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="font-semibold text-sm">{mode.label}</p>
                    <p className="text-xs text-gray-600">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* سرعة الحركة */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="font-semibold text-[#2C2C2C] flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  سرعة الحركة
                </label>
                <span className="text-sm font-bold text-emerald-600">{settings.speed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={settings.speed}
                onChange={(e) => handleUpdateSettings({ speed: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>بطيء</span>
                <span>سريع</span>
              </div>
            </div>

            {/* أنواع الأحداث المعروضة */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                أنواع الأحداث المعروضة
              </label>
              <div className="space-y-2">
                {[
                  { key: 'show_ownership', label: 'عمليات التملك', icon: TreePine },
                  { key: 'show_bookings', label: 'الحجوزات', icon: Calendar },
                  { key: 'show_registrations', label: 'التسجيلات', icon: UserPlus },
                  { key: 'show_verifications', label: 'التوثيقات', icon: Shield }
                ].map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof ActivityBarSettings] as boolean}
                      onChange={(e) => handleUpdateSettings({ [key]: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <Icon className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ارتفاع الشريط */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                ارتفاع الشريط (px)
              </label>
              <input
                type="number"
                min="30"
                max="80"
                value={parseInt(settings.height)}
                onChange={(e) => handleUpdateSettings({ height: `${e.target.value}px` })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* لون الخلفية */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                لون الخلفية
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.background_color}
                  onChange={(e) => handleUpdateSettings({ background_color: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={settings.background_color}
                  onChange={(e) => handleUpdateSettings({ background_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">يدعم rgba() للشفافية، مثال: rgba(0,0,0,0.8)</p>
            </div>

            {/* لون النص */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                لون النص والأيقونات
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.text_color}
                  onChange={(e) => handleUpdateSettings({ text_color: e.target.value })}
                  className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <input
                  type="text"
                  value={settings.text_color}
                  onChange={(e) => handleUpdateSettings({ text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* قوالب ألوان جاهزة */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <label className="block font-semibold text-[#2C2C2C] mb-3">
                قوالب ألوان جاهزة
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'داكن', bg: 'rgba(0, 0, 0, 0.9)', text: '#ffffff' },
                  { name: 'أخضر', bg: 'rgba(16, 185, 129, 0.95)', text: '#ffffff' },
                  { name: 'أزرق', bg: 'rgba(59, 130, 246, 0.95)', text: '#ffffff' },
                  { name: 'ذهبي', bg: 'rgba(245, 158, 11, 0.95)', text: '#ffffff' },
                  { name: 'زجاجي', bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff' },
                  { name: 'بنفسجي', bg: 'rgba(139, 92, 246, 0.95)', text: '#ffffff' },
                  { name: 'وردي', bg: 'rgba(236, 72, 153, 0.95)', text: '#ffffff' },
                  { name: 'فاتح', bg: 'rgba(255, 255, 255, 0.95)', text: '#000000' }
                ].map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handleUpdateSettings({
                      background_color: template.bg,
                      text_color: template.text
                    })}
                    className="relative p-3 rounded-lg border-2 border-gray-200 hover:border-emerald-500 transition-all cursor-pointer group overflow-hidden"
                    style={{
                      background: template.bg,
                      backdropFilter: 'blur(12px)'
                    }}
                  >
                    <p className="text-xs font-semibold relative z-10" style={{ color: template.text }}>
                      {template.name}
                    </p>
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* إدارة الأحداث الوهمية */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2C2C2C]">إدارة الأحداث الوهمية</h3>
                <p className="text-sm text-[#2C2C2C]/60">إضافة وتعديل الأحداث التجريبية</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddEvent(!showAddEvent)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              إضافة حدث
            </button>
          </div>

          {/* نموذج إضافة حدث جديد */}
          {showAddEvent && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <h4 className="font-bold text-[#2C2C2C] mb-4">حدث جديد</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع الحدث</label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="ownership">تملك</option>
                    <option value="booking">حجز</option>
                    <option value="registration">تسجيل</option>
                    <option value="verification">توثيق</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الرسالة (عربي)</label>
                  <input
                    type="text"
                    value={newEvent.message_ar}
                    onChange={(e) => setNewEvent({ ...newEvent, message_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="مثال: 🎉 أحمد محمد قام بتملك 5 أشجار"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الرسالة (إنجليزي)</label>
                  <input
                    type="text"
                    value={newEvent.message_en}
                    onChange={(e) => setNewEvent({ ...newEvent, message_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Example: 🎉 Ahmed Mohammed owned 5 trees"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddEvent}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* قائمة الأحداث */}
          <div className="space-y-2">
            {fakeEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.event_type === 'ownership' ? 'bg-green-100 text-green-700' :
                        event.event_type === 'booking' ? 'bg-blue-100 text-blue-700' :
                        event.event_type === 'registration' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {event.event_type === 'ownership' ? 'تملك' :
                         event.event_type === 'booking' ? 'حجز' :
                         event.event_type === 'registration' ? 'تسجيل' : 'توثيق'}
                      </span>
                      <span className="text-xs text-gray-500">أولوية: {event.priority}</span>
                    </div>
                    <p className="text-sm text-[#2C2C2C] mb-1">{event.message_ar}</p>
                    <p className="text-xs text-gray-500">{event.message_en}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleUpdateEvent(event.id, { enabled: !event.enabled })}
                      className={`p-2 rounded-lg transition-colors cursor-pointer hover:shadow-md ${
                        event.enabled ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors cursor-pointer hover:shadow-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
