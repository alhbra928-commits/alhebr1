import { useState, useEffect } from 'react';
import {
  MessageCircle, Send, CheckCheck, Eye, AlertCircle,
  TrendingUp, Calendar, Users, Settings, Zap, BarChart3,
  RefreshCw, Bell, Clock, Activity, FileText, ArrowRight
} from 'lucide-react';
import { whatsappService, DailyStats } from '../services/whatsappService';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { TemplatesManager } from './TemplatesManager';
import { MessagesLog } from './MessagesLog';
import { BroadcastManager } from './BroadcastManager';
import { WhatsAppSettings } from './WhatsAppSettings';
import { AnalyticsReports } from './AnalyticsReports';

export function WhatsAppDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadData();
    checkConnection();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [today, overall, messages] = await Promise.all([
        whatsappService.getTodayStats(),
        whatsappService.getOverallStats(),
        whatsappService.getMessages({ limit: 10 })
      ]);

      setTodayStats(today);
      setOverallStats(overall);
      setRecentMessages(messages);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading WhatsApp data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      const settings = await whatsappService.getSettings();
      setConnectionStatus(settings?.connection_status || 'disconnected');
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadData();
    checkConnection();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold">جاري تحميل لوحة الواتساب...</p>
        </div>
      </div>
    );
  }

  // عرض الصفحة الفرعية
  if (activeView !== 'dashboard') {
    return (
      <div>
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700 mb-6"
        >
          <ArrowRight className="h-5 w-5" />
          العودة للرئيسية
        </button>

        {activeView === 'templates' && <TemplatesManager />}
        {activeView === 'messages' && <MessagesLog />}
        {activeView === 'broadcast' && <BroadcastManager />}
        {activeView === 'settings' && <WhatsAppSettings />}
        {activeView === 'analytics' && <AnalyticsReports />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              مركز الاتصالات والواتساب
            </h1>
            <p className="text-gray-600">إدارة شاملة لجميع رسائل المنصة</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* حالة الاتصال */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            connectionStatus === 'connected'
              ? 'bg-green-50 border-2 border-green-200'
              : connectionStatus === 'error'
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-gray-50 border-2 border-gray-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-500 animate-pulse'
                : connectionStatus === 'error'
                ? 'bg-red-500'
                : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-bold ${
              connectionStatus === 'connected'
                ? 'text-green-700'
                : connectionStatus === 'error'
                ? 'text-red-700'
                : 'text-gray-700'
            }`}>
              {connectionStatus === 'connected' ? 'متصل' : connectionStatus === 'error' ? 'خطأ' : 'غير متصل'}
            </span>
          </div>

          {/* زر التحديث */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* إحصائيات اليوم */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* مرسل */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <Zap className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-blue-900 mb-1">
            <AnimatedCounter value={todayStats?.total_sent || 0} />
          </div>
          <div className="text-sm text-blue-700 font-bold">رسائل مرسلة اليوم</div>
        </div>

        {/* مستلم */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCheck className="h-6 w-6 text-green-600" />
            </div>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-3xl font-black text-green-900 mb-1">
            <AnimatedCounter value={todayStats?.total_delivered || 0} />
          </div>
          <div className="text-sm text-green-700 font-bold">رسائل مستلمة</div>
        </div>

        {/* مقروء */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-purple-900 mb-1">
            <AnimatedCounter value={todayStats?.total_read || 0} />
          </div>
          <div className="text-sm text-purple-700 font-bold">رسائل مقروءة</div>
        </div>

        {/* فاشل */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-900 mb-1">
            <AnimatedCounter value={todayStats?.total_failed || 0} />
          </div>
          <div className="text-sm text-red-700 font-bold">رسائل فاشلة</div>
        </div>
      </div>

      {/* بطاقات الإدارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* الحجوزات */}
        <DepartmentCard
          title="الحجوزات"
          description="تأكيدات الحجز التلقائية"
          icon={Calendar}
          count={todayStats?.by_category?.['booking'] || 0}
          color="from-blue-500 to-cyan-600"
        />

        {/* المدفوعات */}
        <DepartmentCard
          title="المدفوعات"
          description="إشعارات استلام الدفع"
          icon={CheckCheck}
          count={todayStats?.by_category?.['payment'] || 0}
          color="from-green-500 to-emerald-600"
        />

        {/* التوثيق */}
        <DepartmentCard
          title="التوثيق"
          description="إصدار الشهادات"
          icon={Bell}
          count={todayStats?.by_category?.['certificate'] || 0}
          color="from-purple-500 to-pink-600"
        />

        {/* التسويات */}
        <DepartmentCard
          title="التسويات"
          description="إشعارات التسويات المالية"
          icon={TrendingUp}
          count={todayStats?.by_category?.['settlement'] || 0}
          color="from-yellow-500 to-orange-600"
        />
      </div>

      {/* معدل النجاح */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* معدل التسليم */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">معدل التسليم</div>
              <div className="text-2xl font-black text-gray-900">
                {overallStats?.delivery_rate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
              style={{ width: `${overallStats?.delivery_rate || 0}%` }}
            />
          </div>
        </div>

        {/* معدل النجاح */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">معدل النجاح</div>
              <div className="text-2xl font-black text-gray-900">
                {overallStats?.success_rate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all"
              style={{ width: `${overallStats?.success_rate || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* آخر الرسائل */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900">آخر الرسائل</h3>
          </div>
          <span className="text-sm text-gray-500">
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
          </span>
        </div>

        <div className="space-y-3">
          {recentMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد رسائل بعد</p>
            </div>
          ) : (
            recentMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    message.status === 'delivered' ? 'bg-green-100' :
                    message.status === 'sent' ? 'bg-blue-100' :
                    message.status === 'failed' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {message.status === 'delivered' ? (
                      <CheckCheck className="h-5 w-5 text-green-600" />
                    ) : message.status === 'sent' ? (
                      <Send className="h-5 w-5 text-blue-600" />
                    ) : message.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{message.recipient_name}</div>
                    <div className="text-sm text-gray-600">{message.recipient_phone}</div>
                  </div>

                  <div className="text-left">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      message.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      message.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      message.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {message.status === 'delivered' ? 'مستلم' :
                       message.status === 'sent' ? 'مرسل' :
                       message.status === 'failed' ? 'فاشل' :
                       'قيد الإرسال'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.created_at).toLocaleString('ar-SA')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <QuickActionCard
          title="إدارة القوالب"
          description="إضافة وتعديل قوالب الرسائل"
          icon={FileText}
          color="from-blue-500 to-cyan-600"
          onClick={() => setActiveView('templates')}
        />

        <QuickActionCard
          title="سجل الرسائل"
          description="عرض جميع الرسائل المرسلة"
          icon={MessageCircle}
          color="from-purple-500 to-pink-600"
          onClick={() => setActiveView('messages')}
        />

        <QuickActionCard
          title="البث الجماعي"
          description="إرسال رسائل لمجموعة"
          icon={Users}
          color="from-green-500 to-emerald-600"
          onClick={() => setActiveView('broadcast')}
        />

        <QuickActionCard
          title="الإعدادات"
          description="تكوين الاتصال بالواتساب"
          icon={Settings}
          color="from-yellow-500 to-orange-600"
          onClick={() => setActiveView('settings')}
        />
      </div>
    </div>
  );
}

// مكون بطاقة الإدارة
function DepartmentCard({
  title,
  description,
  icon: Icon,
  count,
  color
}: {
  title: string;
  description: string;
  icon: any;
  count: number;
  color: string;
}) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-2xl font-black text-gray-900 mb-1">
        <AnimatedCounter value={count} />
      </div>
      <div className="text-sm font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  );
}

// مكون بطاقة الإجراء السريع
function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick
}: {
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group text-right w-full">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-lg font-black text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </button>
  );
}
