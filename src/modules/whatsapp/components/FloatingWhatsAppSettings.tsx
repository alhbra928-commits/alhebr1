import { useState, useEffect } from 'react';
import {
  Settings, Save, Eye, EyeOff, Plus, Edit2, Trash2, Check, X,
  Phone, Users, Activity, Database, Zap, AlertCircle, Clock
} from 'lucide-react';
import { floatingWhatsAppService, ContactNumber } from '../../../services/floatingWhatsAppService';

export function FloatingWhatsAppSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [contacts, setContacts] = useState<ContactNumber[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'contacts' | 'sessions' | 'logs'>('settings');
  const [editingContact, setEditingContact] = useState<ContactNumber | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (activeTab === 'sessions' || activeTab === 'logs') {
        loadData();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, contactsData, sessionsData, logsData] = await Promise.all([
        floatingWhatsAppService.getSettings(),
        floatingWhatsAppService.getContactNumbers('admin'),
        floatingWhatsAppService.getActiveSessions(),
        floatingWhatsAppService.getContextLogs(50)
      ]);

      setSettings(settingsData);
      setContacts(contactsData);
      setSessions(sessionsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const success = await floatingWhatsAppService.updateSettings(settings);
    setSaving(false);
    if (success) {
      alert('تم حفظ الإعدادات بنجاح');
    }
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;

    const success = editingContact.id
      ? await floatingWhatsAppService.updateContactNumber(editingContact.id, editingContact)
      : await floatingWhatsAppService.addContactNumber(editingContact);

    if (success) {
      setShowContactModal(false);
      setEditingContact(null);
      loadData();
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرقم؟')) return;

    const success = await floatingWhatsAppService.deleteContactNumber(id);
    if (success) {
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 animate-spin text-green-600" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#556B2F] to-[#D4AF37] rounded-3xl p-8 shadow-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-black">إعدادات الزر العائم</h1>
              <p className="text-green-100">إدارة نظام الواتساب الذكي</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'settings', label: 'الإعدادات العامة', icon: Settings },
            { id: 'contacts', label: 'أرقام الاتصال', icon: Phone },
            { id: 'sessions', label: 'الجلسات الحية', icon: Users },
            { id: 'logs', label: 'سجل التفاعلات', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-lg text-[#556B2F]'
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">الإعدادات العامة</h2>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#556B2F] to-[#D4AF37] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? <Activity className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                حفظ التغييرات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-gray-700">
                  <Zap className="h-5 w-5 text-[#D4AF37]" />
                  تفعيل الزر
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.is_enabled}
                    onChange={(e) => setSettings({...settings, is_enabled: e.target.checked})}
                    className="w-6 h-6 rounded"
                  />
                  <span className="font-medium">عرض الزر العائم في جميع الصفحات</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-bold text-gray-700">
                  <Activity className="h-5 w-5 text-[#D4AF37]" />
                  تأثير النبض
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pulse_enabled}
                    onChange={(e) => setSettings({...settings, pulse_enabled: e.target.checked})}
                    className="w-6 h-6 rounded"
                  />
                  <span className="font-medium">تفعيل تأثير النبض المتوهج</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700">النص التوضيحي (عربي)</label>
                <input
                  type="text"
                  value={settings.tooltip_text_ar}
                  onChange={(e) => setSettings({...settings, tooltip_text_ar: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#556B2F] outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-gray-700">مدة النبض (ثواني)</label>
                <input
                  type="number"
                  value={settings.pulse_interval_seconds}
                  onChange={(e) => setSettings({...settings, pulse_interval_seconds: parseInt(e.target.value)})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#556B2F] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">أرقام الاتصال</h2>
              <button
                onClick={() => {
                  setEditingContact({
                    id: '',
                    department: '',
                    department_name_ar: '',
                    department_name_en: '',
                    phone_number: '',
                    icon: 'MessageCircle',
                    is_active: true,
                    display_order: contacts.length + 1,
                    user_types: ['visitor']
                  });
                  setShowContactModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#556B2F] to-[#D4AF37] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                إضافة رقم
              </button>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#556B2F] to-[#D4AF37] rounded-xl flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{contact.department_name_ar}</div>
                      <div className="text-sm text-gray-600">{contact.phone_number}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingContact(contact);
                        setShowContactModal(true);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-5 w-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">الجلسات الحية ({sessions.length})</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border-2 border-green-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{session.user_name || 'زائر'}</div>
                      <div className="text-sm text-gray-600">{session.user_phone || 'غير مسجل'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {session.user_type === 'visitor' ? 'زائر' :
                         session.user_type === 'investor' ? 'مستثمر' :
                         session.user_type === 'owner' ? 'صاحب مزرعة' : 'إداري'}
                      </div>
                      <div className="text-xs text-gray-500">{session.current_page}</div>
                    </div>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد جلسات نشطة حالياً</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">سجل التفاعلات ({logs.length})</h2>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-gray-900">{log.user_name || 'زائر'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    القسم: {log.department} | الصفحة: {log.page_name}
                  </div>
                  {log.farm_code && (
                    <div className="text-sm text-green-600 font-medium">
                      المزرعة: {log.farm_code}
                    </div>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد تفاعلات مسجلة</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingContact.id ? 'تعديل الرقم' : 'إضافة رقم جديد'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="font-bold text-gray-700">اسم القسم (عربي)</label>
                <input
                  type="text"
                  value={editingContact.department_name_ar}
                  onChange={(e) => setEditingContact({...editingContact, department_name_ar: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#556B2F] outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700">رقم الهاتف</label>
                <input
                  type="text"
                  value={editingContact.phone_number}
                  onChange={(e) => setEditingContact({...editingContact, phone_number: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-[#556B2F] outline-none"
                  placeholder="966500000000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveContact}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#556B2F] to-[#D4AF37] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <Check className="h-5 w-5" />
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setEditingContact(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  <X className="h-5 w-5" />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
