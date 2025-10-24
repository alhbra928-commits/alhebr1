import { useState, useEffect } from 'react';
import {
  MessageCircle, Send, CheckCheck, Eye, AlertCircle, TrendingUp,
  Users, Settings, BarChart3, RefreshCw, Bell, Zap, ArrowRight,
  FileText, Sparkles, Activity, Clock, Target, Crown
} from 'lucide-react';
import { whatsappService, DailyStats } from '../services/whatsappService';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { UltraModernTemplatesManager } from './UltraModernTemplatesManager';
import { ModernMessagesLog } from './ModernMessagesLog';
import { ModernBroadcastManager } from './ModernBroadcastManager';
import { UltraModernWhatsAppSettings } from './UltraModernWhatsAppSettings';
import { AdvancedAnalyticsReports } from './AdvancedAnalyticsReports';

export function ModernWhatsAppDashboard() {
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
        whatsappService.getMessages({ limit: 5 })
      ]);
      setTodayStats(today);
      setOverallStats(overall);
      setRecentMessages(messages);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
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

  if (activeView !== 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto p-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-500 hover:shadow-lg transition-all font-bold text-gray-700 mb-6"
          >
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            العودة للرئيسية
          </button>

          {activeView === 'templates' && <UltraModernTemplatesManager />}
          {activeView === 'messages' && <ModernMessagesLog />}
          {activeView === 'broadcast' && <ModernBroadcastManager />}
          {activeView === 'settings' && <UltraModernWhatsAppSettings />}
          {activeView === 'analytics' && <AdvancedAnalyticsReports />}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse mx-auto">
              <MessageCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
          </div>
          <p className="text-xl font-black text-gray-900 mb-2">جاري التحميل...</p>
          <p className="text-gray-600">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                {connectionStatus === 'connected' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-green-600 animate-pulse" />
                )}
              </div>

              <div className="text-white">
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                  مركز إدارة الواتساب
                  <Sparkles className="h-8 w-8 text-yellow-300" />
                </h1>
                <p className="text-green-100 text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  نظام متكامل لإدارة الرسائل والإشعارات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm border-2 ${
                connectionStatus === 'connected'
                  ? 'bg-green-500/20 border-green-300/50'
                  : connectionStatus === 'error'
                  ? 'bg-red-500/20 border-red-300/50'
                  : 'bg-gray-500/20 border-gray-300/50'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-300 animate-pulse'
                    : connectionStatus === 'error'
                    ? 'bg-red-300'
                    : 'bg-gray-300'
                }`} />
                <span className="text-white font-bold">
                  {connectionStatus === 'connected' ? 'متصل' :
                   connectionStatus === 'error' ? 'خطأ' : 'غير متصل'}
                </span>
              </div>

              {/* Refresh */}
              <button
                onClick={loadData}
                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl transition-all border-2 border-white/30 group"
              >
                <RefreshCw className="h-6 w-6 text-white group-hover:rotate-180 transition-transform duration-500" />
              </button>

              {/* Settings Quick Access */}
              <button
                onClick={() => setActiveView('settings')}
                className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-2xl transition-all border-2 border-white/30 group"
              >
                <Settings className="h-6 w-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Stats Cards - Glassmorphism Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LiveStatCard
            icon={Send}
            label="رسائل اليوم"
            value={todayStats?.total_sent || 0}
            trend="+12%"
            color="from-blue-500 to-cyan-500"
            bgColor="bg-blue-50"
          />
          <LiveStatCard
            icon={CheckCheck}
            label="تم التسليم"
            value={todayStats?.total_delivered || 0}
            trend="+8%"
            color="from-green-500 to-emerald-500"
            bgColor="bg-green-50"
          />
          <LiveStatCard
            icon={Eye}
            label="تم القراءة"
            value={todayStats?.total_read || 0}
            trend="+15%"
            color="from-purple-500 to-pink-500"
            bgColor="bg-purple-50"
          />
          <LiveStatCard
            icon={AlertCircle}
            label="فاشل"
            value={todayStats?.total_failed || 0}
            trend="-5%"
            color="from-red-500 to-orange-500"
            bgColor="bg-red-50"
            isNegative
          />
        </div>

        {/* Quick Actions - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ModernActionCard
            title="القوالب"
            subtitle="إدارة الرسائل"
            icon={FileText}
            gradient="from-blue-500 via-blue-600 to-cyan-600"
            onClick={() => setActiveView('templates')}
            badge="6"
          />
          <ModernActionCard
            title="السجل"
            subtitle="عرض الرسائل"
            icon={MessageCircle}
            gradient="from-purple-500 via-purple-600 to-pink-600"
            onClick={() => setActiveView('messages')}
          />
          <ModernActionCard
            title="البث"
            subtitle="حملات جماعية"
            icon={Users}
            gradient="from-green-500 via-emerald-600 to-teal-600"
            onClick={() => setActiveView('broadcast')}
          />
          <ModernActionCard
            title="التقارير"
            subtitle="تحليل الأداء"
            icon={BarChart3}
            gradient="from-indigo-500 via-purple-600 to-pink-600"
            onClick={() => setActiveView('analytics')}
            badge={<Crown className="h-4 w-4" />}
          />
          <ModernActionCard
            title="الإعدادات"
            subtitle="التكوين"
            icon={Settings}
            gradient="from-yellow-500 via-orange-500 to-red-500"
            onClick={() => setActiveView('settings')}
          />
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Rate Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">معدل النجاح</h3>
                  <p className="text-sm text-gray-600">آخر 7 أيام</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-green-600">
                  {overallStats?.success_rate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-500">متوسط الأداء</div>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressBar label="التسليم" value={overallStats?.delivery_rate || 0} color="bg-green-500" />
              <ProgressBar label="القراءة" value={overallStats?.read_rate || 0} color="bg-purple-500" />
              <ProgressBar label="الاستجابة" value={85} color="bg-blue-500" />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">النشاط الأخير</h3>
                <p className="text-sm text-gray-600">آخر 5 رسائل</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>لا توجد رسائل حديثة</p>
                </div>
              ) : (
                recentMessages.map((msg) => (
                  <ActivityItem key={msg.id} message={msg} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">آخر تحديث</p>
                <p className="text-xs text-gray-600">
                  {lastRefresh.toLocaleTimeString('ar-SA')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>تحديث تلقائي كل 30 ثانية</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveStatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  bgColor,
  isNegative = false
}: any) {
  return (
    <div className={`relative overflow-hidden ${bgColor} rounded-3xl p-6 border-2 border-gray-200 hover:border-gray-300 transition-all group hover:shadow-xl`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/50 to-transparent rounded-full -mr-16 -mt-16" />

      <div className="relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>

        <div className="text-4xl font-black text-gray-900 mb-2">
          <AnimatedCounter value={value} />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-gray-700">{label}</div>
          <div className={`text-xs font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernActionCard({
  title,
  subtitle,
  icon: Icon,
  gradient,
  onClick,
  badge
}: any) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-gray-300 transition-all hover:shadow-2xl"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

      <div className="relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>

        <div className="text-right">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-black text-gray-900">{title}</h3>
            {badge && (
              <div className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                {badge}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>

        <div className="mt-4 flex items-center justify-end text-gray-400 group-hover:text-gray-600 transition-colors">
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}

function ProgressBar({ label, value, color }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-sm font-black text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({ message }: any) {
  const statusConfig = {
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCheck, label: 'مستلم' },
    sent: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Send, label: 'مرسل' },
    read: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Eye, label: 'مقروء' },
    failed: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle, label: 'فاشل' }
  };

  const config = statusConfig[message.status as keyof typeof statusConfig] || statusConfig.sent;
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
      <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <StatusIcon className={`h-5 w-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{message.recipient_name}</p>
        <p className="text-xs text-gray-600">{message.recipient_phone}</p>
      </div>

      <div className="text-right">
        <div className={`text-xs font-bold ${config.color} mb-1`}>{config.label}</div>
        <div className="text-xs text-gray-500">
          {new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
