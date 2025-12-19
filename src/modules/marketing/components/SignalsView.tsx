import React from 'react';
import { AlertTriangle, TrendingUp, Lightbulb, Bell } from 'lucide-react';

export function SignalsView() {
  const signals = [
    {
      type: 'warning',
      title: 'TikTok: زيارات عالية وتحويل منخفض',
      description: 'المصدر TikTok يجلب زيارات كثيرة لكن معدل التحويل أقل من 1%',
      recommendation: 'راجع محتوى الفيديوهات وتأكد من وضوح العرض',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-600',
    },
    {
      type: 'success',
      title: 'WhatsApp: معدل تحويل مرتفع اليوم',
      description: 'المصدر WhatsApp يحقق معدل تحويل 8.5% - أعلى من المعتاد',
      recommendation: 'ركز على هذا المصدر وزد الاستثمار فيه',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
    },
    {
      type: 'suggestion',
      title: 'نسبة التسرب عالية عند خطوة الحجز',
      description: '45% من الزوار يتركون الموقع عند بدء الحجز',
      recommendation: 'بسّط نموذج الحجز وقلل عدد الخطوات المطلوبة',
      icon: Lightbulb,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      type: 'info',
      title: 'أفضل وقت للنشر: 8-10 مساءً',
      description: 'أعلى معدل تفاعل يحدث في هذا الوقت',
      recommendation: 'جدول المنشورات الجديدة في هذا التوقيت',
      icon: Bell,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            التنبيهات والتوصيات
            </h1>
          <p className="text-gray-600 mt-2">إشارات ذكية لتحسين الأداء</p>
        </div>

        {/* Signals List */}
        <div className="space-y-6">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${signal.color}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${signal.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{signal.title}</h3>
                      <p className="text-gray-600 mb-3">{signal.description}</p>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-blue-800">التوصية:</span>
                        </div>
                        <p className="text-blue-700">{signal.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">💡 كيف تعمل التنبيهات؟</h2>
          <div className="space-y-2 text-white/90">
            <p>• نظام ذكي يحلل البيانات بشكل مستمر</p>
            <p>• يكتشف الأنماط والفرص والمشاكل تلقائياً</p>
            <p>• يقدم توصيات عملية قابلة للتطبيق فوراً</p>
            <p>• يساعدك على اتخاذ قرارات تسويقية أفضل</p>
          </div>
        </div>
      </div>
    </div>
  );
}
