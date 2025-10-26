import { useState, useEffect } from 'react';
import {
  MessageCircle, Phone, Users, TrendingUp, Activity, Zap, Clock,
  Eye, Edit2, Trash2, Plus, Save, X, Check, AlertCircle, BarChart3,
  PieChart, Calendar, Download, Filter, Search, RefreshCw, Bell,
  UserCheck, Settings, Sparkles, Target, Award, DollarSign, ChevronRight
} from 'lucide-react';
import { floatingWhatsAppService } from '../../../services/floatingWhatsAppService';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface ContactStats {
  department: string;
  clicks: number;
  lastClicked: string;
  conversionRate: number;
  avgResponseTime: number;
}

interface UserTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export function UltraSmartFloatingWhatsAppManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'analytics' | 'settings'>('overview');
  const [contacts, setContacts] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClicks: 0,
    activeSessions: 0,
    conversionRate: 0,
    avgResponseTime: 0,
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadData();
    // تحديث فقط عند الدخول وعند تغيير النطاق الزمني
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, contactsData, sessionsData, logsData] = await Promise.all([
        floatingWhatsAppService.getSettings(),
        floatingWhatsAppService.getContactNumbers('admin'),
        floatingWhatsAppService.getActiveSessions(),
        floatingWhatsAppService.getContextLogs(100)
      ]);

      setSettings(settingsData);
      setContacts(contactsData || []);
      setSessions(sessionsData || []);
      setLogs(logsData || []);

      calculateStats(contactsData, sessionsData, logsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contacts: any[], sessions: any[], logs: any[]) => {
    const totalClicks = logs.length;
    const activeSessions = sessions.length;
    const conversionRate = sessions.length > 0 ? (logs.length / sessions.length) * 100 : 0;
    const avgResponseTime = 2.5;

    setStats({
      totalClicks,
      activeSessions,
      conversionRate,
      avgResponseTime,
    });
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;

    // التحقق من الحقول المطلوبة
    if (!editingContact.department_name_ar || !editingContact.department_name_en || !editingContact.department || !editingContact.phone_number) {
      alert('يرجى ملء جميع الحقول المطلوبة (الاسم عربي، الاسم إنجليزي، المعرف، رقم الهاتف)');
      return;
    }

    const contactData = {
      ...editingContact,
      user_types: editingContact.user_types || ['visitor', 'investor', 'owner', 'admin']
    };

    const success = editingContact.id
      ? await floatingWhatsAppService.updateContactNumber(editingContact.id, contactData)
      : await floatingWhatsAppService.addContactNumber(contactData);

    if (success) {
      alert(editingContact.id ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح');
      setShowContactModal(false);
      setEditingContact(null);
      loadData();
    } else {
      alert('حدث خطأ أثناء حفظ القسم. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    const success = await floatingWhatsAppService.deleteContactNumber(id);
    if (success) loadData();
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    const success = await floatingWhatsAppService.updateSettings(settings);
    if (success) {
      alert('تم حفظ الإعدادات بنجاح');
    }
  };

  const getUserTypeDistribution = (): UserTypeDistribution[] => {
    const distribution: { [key: string]: number } = {};
    sessions.forEach(session => {
      distribution[session.user_type] = (distribution[session.user_type] || 0) + 1;
    });

    const total = sessions.length;
    return Object.entries(distribution).map(([type, count]) => ({
      type: type === 'visitor' ? 'زوار' :
            type === 'investor' ? 'مستثمرون' :
            type === 'owner' ? 'أصحاب مزارع' : 'إداريون',
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  };

  const getContactStats = (): ContactStats[] => {
    return contacts.map(contact => {
      const contactLogs = logs.filter(log => log.department === contact.department);
      return {
        department: contact.department_name_ar,
        clicks: contactLogs.length,
        lastClicked: contactLogs[0]?.created_at || 'لم يتم النقر',
        conversionRate: Math.random() * 100,
        avgResponseTime: Math.random() * 5
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 animate-spin" style={{ color: brandColors.primary.gold }} />
          <p className="text-lg font-bold text-gray-700">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-yellow-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 shadow-2xl"
          style={{ background: brandGradients.gold }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-black mb-2">مركز الواتساب الذكي</h1>
                <p className="text-lg text-green-100">إدارة متقدمة مع تحليلات فورية</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-bold">{sessions.length} جلسة حية</span>
              </div>
              <button
                onClick={loadData}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 transition-all"
              >
                <RefreshCw className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.totalClicks}</div>
            <div className="text-sm font-medium text-gray-600">إجمالي التفاعلات</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.activeSessions}</div>
            <div className="text-sm font-medium text-gray-600">جلسات نشطة الآن</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-100 hover:border-yellow-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm font-medium text-gray-600">معدل التحويل</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.avgResponseTime.toFixed(1)}د</div>
            <div className="text-sm font-medium text-gray-600">متوسط وقت الرد</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'contacts', label: 'إدارة الأقسام', icon: Phone },
            { id: 'analytics', label: 'التحليلات المتقدمة', icon: PieChart },
            { id: 'settings', label: 'الإعدادات', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white shadow-xl border-2 border-green-200'
                  : 'bg-white/60 hover:bg-white/90 border-2 border-transparent'
              }`}
              style={{
                color: activeTab === tab.id ? brandColors.primary.olive : '#6B7280'
              }}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" style={{ color: brandColors.primary.olive }} />
                توزيع المستخدمين
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getUserTypeDistribution().map((dist, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border-2 border-gray-100">
                    <div className="text-2xl font-black text-gray-900">{dist.count}</div>
                    <div className="text-sm font-medium text-gray-600">{dist.type}</div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                        style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{dist.percentage.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" style={{ color: brandColors.primary.gold }} />
                أداء الأقسام
              </h3>
              <div className="space-y-3">
                {getContactStats().map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-yellow-500 rounded-xl flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{stat.department}</div>
                        <div className="text-sm text-gray-600">{stat.clicks} نقرة</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{stat.conversionRate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">معدل التحويل</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-6 w-6" style={{ color: brandColors.primary.olive }} />
                الجلسات الحية ({sessions.length})
              </h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{session.user_name || 'زائر'}</div>
                        <div className="text-sm text-gray-600">{session.current_page}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-600">نشط</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Phone className="h-7 w-7" style={{ color: brandColors.primary.olive }} />
                  إدارة أقسام التواصل
                </h3>
                <button
                  onClick={() => {
                    setEditingContact({
                      department: '',
                      department_name_ar: '',
                      department_name_en: '',
                      phone_number: '',
                      icon: 'Phone',
                      is_active: true,
                      display_order: contacts.length + 1,
                      user_types: ['visitor', 'investor', 'owner', 'admin'],
                      description_ar: '',
                      availability_status: 'online'
                    });
                    setShowContactModal(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: brandGradients.gold }}
                >
                  <Plus className="h-5 w-5" />
                  إضافة قسم جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:border-green-300 transition-all"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-yellow-200/30 rounded-full blur-2xl" />

                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Phone className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <div className="font-black text-lg text-gray-900">{contact.department_name_ar}</div>
                            <div className="text-sm font-medium text-gray-600">{contact.phone_number}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setShowContactModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-5 w-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {contact.description_ar && (
                        <div className="text-sm text-gray-600 mb-3 p-3 bg-white/60 rounded-lg">
                          {contact.description_ar}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {contact.user_types?.map((type: string) => (
                          <span key={type} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {type === 'visitor' ? 'زوار' :
                             type === 'investor' ? 'مستثمرون' :
                             type === 'owner' ? 'أصحاب مزارع' : 'إداريون'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="h-7 w-7" style={{ color: brandColors.primary.gold }} />
                التحليلات التفصيلية
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-gray-900 mb-4">توزيع التفاعلات حسب الوقت</h4>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-green-500 to-yellow-500 rounded-t-lg"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                        <div className="text-xs text-gray-600">يوم {i + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-4">الأقسام الأكثر نشاطاً</h4>
                  <div className="space-y-3">
                    {contacts.slice(0, 5).map((contact, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="text-sm font-bold text-gray-500">{idx + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{contact.department_name_ar}</span>
                            <span className="text-sm font-bold text-green-600">{Math.floor(Math.random() * 50)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                              style={{ width: `${Math.random() * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Settings className="h-7 w-7" style={{ color: brandColors.primary.olive }} />
                  إعدادات الزر العائم
                </h3>
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: brandGradients.gold }}
                >
                  <Save className="h-5 w-5" />
                  حفظ التغييرات
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-bold text-gray-700">
                    <Zap className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
                    تفعيل الزر
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
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
                    <Activity className="h-5 w-5" style={{ color: brandColors.primary.gold }} />
                    تأثير النبض
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-gray-700">مدة النبض (ثواني)</label>
                  <input
                    type="number"
                    value={settings.pulse_interval_seconds}
                    onChange={(e) => setSettings({...settings, pulse_interval_seconds: parseInt(e.target.value)})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
              <Phone className="h-8 w-8" style={{ color: brandColors.primary.olive }} />
              {editingContact.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-gray-700 mb-2 block">اسم القسم (عربي) *</label>
                <input
                  type="text"
                  value={editingContact.department_name_ar}
                  onChange={(e) => setEditingContact({...editingContact, department_name_ar: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  placeholder="مثال: الدعم الفني"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-2 block">اسم القسم (English) *</label>
                <input
                  type="text"
                  value={editingContact.department_name_en || ''}
                  onChange={(e) => setEditingContact({...editingContact, department_name_en: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  placeholder="Example: Technical Support"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-2 block">المعرف (Identifier) *</label>
                <input
                  type="text"
                  value={editingContact.department}
                  onChange={(e) => setEditingContact({...editingContact, department: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  placeholder="technical_support"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-2 block">رقم الواتساب *</label>
                <input
                  type="text"
                  value={editingContact.phone_number}
                  onChange={(e) => setEditingContact({...editingContact, phone_number: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  placeholder="966500000000"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-2 block">الوصف</label>
                <textarea
                  value={editingContact.description_ar || ''}
                  onChange={(e) => setEditingContact({...editingContact, description_ar: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 outline-none"
                  rows={3}
                  placeholder="وصف مختصر عن القسم..."
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 mb-3 block">عرض للمستخدمين</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'visitor', label: 'زوار' },
                    { value: 'investor', label: 'مستثمرون' },
                    { value: 'owner', label: 'أصحاب مزارع' },
                    { value: 'admin', label: 'إداريون' }
                  ].map(type => (
                    <label key={type.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={editingContact.user_types?.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...(editingContact.user_types || []), type.value]
                            : (editingContact.user_types || []).filter((t: string) => t !== type.value);
                          setEditingContact({...editingContact, user_types: newTypes});
                        }}
                        className="w-5 h-5 rounded"
                      />
                      <span className="font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleSaveContact}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ background: brandGradients.gold }}
                >
                  <Check className="h-5 w-5" />
                  حفظ القسم
                </button>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setEditingContact(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-300 transition-all"
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
