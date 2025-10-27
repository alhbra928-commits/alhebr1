import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, FileText, Download, RefreshCw,
  MessageCircle, CheckCircle, XCircle, Clock, Users
} from 'lucide-react';
import { analyticsService, AnalyticsData, EventAnalytics } from '../services/analyticsService';
import { SmartErrorModal } from '../../../components/common/SmartErrorModal';

export const AnalyticsReports: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, eventsData] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getEventAnalytics()
      ]);
      setAnalytics(analyticsData);
      setEventAnalytics(eventsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      const data = await analyticsService.exportData(format);

      const blob = new Blob([data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'booking_created': 'إنشاء حجز',
      'booking_confirmed': 'تأكيد حجز',
      'certificate_issued': 'إصدار شهادة',
      'payment_received': 'استلام دفعة',
      'payment_rejected': 'رفض دفعة',
      'settlement_completed': 'تسوية مكتملة',
      'farm_approved': 'اعتماد مزرعة',
      'farm_rejected': 'رفض مزرعة',
      'investor_welcome': 'ترحيب مستثمر',
      'owner_welcome': 'ترحيب مالك',
      'login_otp': 'رمز دخول'
    };
    return labels[eventType] || eventType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6" dir="rtl">
      <SmartErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        error={error || ''}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">التقارير والتحليلات</h1>
            <p className="text-gray-400 text-sm">إحصائيات شاملة لنظام الواتساب</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            تصدير CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            تصدير JSON
          </button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-white">{analytics.messages_sent_today}</span>
          </div>
          <p className="text-gray-300 text-sm">رسائل اليوم</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-white">{analytics.success_rate}%</span>
          </div>
          <p className="text-gray-300 text-sm">نسبة النجاح</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-bold text-white">{analytics.failed_count}</span>
          </div>
          <p className="text-gray-300 text-sm">رسائل فاشلة</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-white">{analytics.messages_sent_week}</span>
          </div>
          <p className="text-gray-300 text-sm">رسائل الأسبوع</p>
        </div>
      </div>

      {/* أهم المؤشرات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            أكثر القوالب استخداماً
          </h3>
          {analytics.top_template ? (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{analytics.top_template.name}</span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                  {analytics.top_template.usage_count} مرة
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">لا توجد بيانات</p>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            أكثر حدث تفاعلاً
          </h3>
          {analytics.top_event ? (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">
                  {getEventTypeLabel(analytics.top_event.event_type)}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {analytics.top_event.count} رسالة
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">لا توجد بيانات</p>
          )}
        </div>
      </div>

      {/* الرسائل حسب الحالة */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">الرسائل حسب الحالة</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.messages_by_status.pending}</p>
            <p className="text-sm text-gray-400">معلق</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.messages_by_status.sent}</p>
            <p className="text-sm text-gray-400">مرسل</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.messages_by_status.delivered}</p>
            <p className="text-sm text-gray-400">تم التسليم</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.messages_by_status.read}</p>
            <p className="text-sm text-gray-400">مقروء</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{analytics.messages_by_status.failed}</p>
            <p className="text-sm text-gray-400">فاشل</p>
          </div>
        </div>
      </div>

      {/* الرسائل حسب نوع المستخدم */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          المحادثات حسب نوع المستخدم
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-500/10 rounded-lg p-4 text-center border border-purple-500/30">
            <p className="text-3xl font-bold text-purple-400">{analytics.messages_by_user_type.investor}</p>
            <p className="text-sm text-gray-300">مستثمرون</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-4 text-center border border-amber-500/30">
            <p className="text-3xl font-bold text-amber-400">{analytics.messages_by_user_type.owner}</p>
            <p className="text-sm text-gray-300">أصحاب مزارع</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 text-center border border-blue-500/30">
            <p className="text-3xl font-bold text-blue-400">{analytics.messages_by_user_type.visitor}</p>
            <p className="text-sm text-gray-300">زوار</p>
          </div>
          <div className="bg-gray-500/10 rounded-lg p-4 text-center border border-gray-500/30">
            <p className="text-3xl font-bold text-gray-400">{analytics.messages_by_user_type.unknown}</p>
            <p className="text-sm text-gray-300">غير محدد</p>
          </div>
        </div>
      </div>

      {/* إحصائيات الزر الذكي والذكاء الاصطناعي */}
      {analytics.smart_button && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الزر الذكي */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-cyan-400" />
              الزر الذكي - تقرير الذكاء الاصطناعي
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">إجمالي المحادثات</span>
                <span className="text-white font-bold text-lg">{analytics.smart_button.total_conversations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">رد تلقائي بالذكاء</span>
                <span className="text-cyan-400 font-bold text-lg">{analytics.smart_button.ai_handled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">تحويل للموظف</span>
                <span className="text-orange-400 font-bold text-lg">{analytics.smart_button.human_escalated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">نسبة نجاح الذكاء</span>
                <span className={`font-bold text-lg ${
                  analytics.smart_button.ai_success_rate >= 80 ? 'text-green-400' :
                  analytics.smart_button.ai_success_rate >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analytics.smart_button.ai_success_rate}%
                </span>
              </div>
              {analytics.smart_button.top_intent && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <span className="text-gray-300">أكثر نية مُكتشفة</span>
                  <span className="text-white font-semibold">{analytics.smart_button.top_intent}</span>
                </div>
              )}
            </div>
          </div>

          {/* التعلم الذاتي */}
          {analytics.ai_learning && (
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                التعلم الذاتي للذكاء
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">إجمالي المُتعلّم</span>
                  <span className="text-white font-bold text-lg">{analytics.ai_learning.total_learned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">بانتظار الموافقة</span>
                  <span className="text-yellow-400 font-bold text-lg">{analytics.ai_learning.pending_approval}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">أنماط مُعتمدة</span>
                  <span className="text-green-400 font-bold text-lg">{analytics.ai_learning.approved_patterns}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* تحليل الأحداث */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-4">تحليل الأحداث</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4 text-gray-300">الحدث</th>
                <th className="text-center py-3 px-4 text-gray-300">إجمالي الرسائل</th>
                <th className="text-center py-3 px-4 text-gray-300">نجح</th>
                <th className="text-center py-3 px-4 text-gray-300">فشل</th>
                <th className="text-center py-3 px-4 text-gray-300">نسبة النجاح</th>
              </tr>
            </thead>
            <tbody>
              {eventAnalytics.map((event) => (
                <tr key={event.event_type} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="py-3 px-4 text-white">{getEventTypeLabel(event.event_type)}</td>
                  <td className="py-3 px-4 text-center text-white font-semibold">{event.total_messages}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      {event.success_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                      {event.failed_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-sm ${
                      event.success_rate >= 90 ? 'bg-green-500/20 text-green-400' :
                      event.success_rate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {event.success_rate}%
                    </span>
                  </td>
                </tr>
              ))}
              {eventAnalytics.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    لا توجد بيانات للأحداث
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
