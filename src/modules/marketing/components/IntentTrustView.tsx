import React, { useEffect, useState } from 'react';
import { Eye, Heart, Target, Check } from 'lucide-react';
import { marketingAnalyticsService } from '../../../services/analytics/marketingAnalyticsService';

export function IntentTrustView() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [intentData, setIntentData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await marketingAnalyticsService.getIntentAnalysis(period);
      setIntentData(data);
    } catch (error) {
      console.error('Failed to load intent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = intentData ? intentData.browsers + intentData.interested + intentData.nearDecision + intentData.investors : 0;

  const categories = [
    {
      id: 'browsers',
      label: 'متصفحون',
      icon: Eye,
      count: intentData?.browsers || 0,
      color: 'from-gray-500 to-gray-600',
      description: 'دخلوا وخرجوا بدون تفاعل',
    },
    {
      id: 'interested',
      label: 'مهتمون',
      icon: Heart,
      count: intentData?.interested || 0,
      color: 'from-blue-500 to-blue-600',
      description: 'شاهدوا مزرعة واحدة على الأقل',
    },
    {
      id: 'nearDecision',
      label: 'قريبو القرار',
      icon: Target,
      count: intentData?.nearDecision || 0,
      color: 'from-orange-500 to-orange-600',
      description: 'غيروا الكمية أو بدأوا الحجز',
    },
    {
      id: 'investors',
      label: 'مستثمرون',
      icon: Check,
      count: intentData?.investors || 0,
      color: 'from-green-500 to-green-600',
      description: 'أرسلوا طلب أو رفعوا إيصال',
    },
  ];

  if (loading) {
    return (
      <div className="p-8" dir="rtl">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              النية والثقة
            </h1>
            <p className="text-gray-600 mt-2">تحليل نية الزوار ومستوى الثقة</p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'الأسبوع' },
              { id: 'month', label: 'الشهر' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  period === p.id
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => {
            const percentage = total > 0 ? ((category.count / total) * 100).toFixed(1) : '0';
            const Icon = category.icon;

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{category.label}</h3>
                <div className="text-4xl font-bold text-gray-800 mb-2">{category.count}</div>
                <div className="text-sm text-gray-600 mb-3">{category.description}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-600">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Score */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 shadow-2xl text-white">
          <h2 className="text-2xl font-bold mb-6">مؤشر الثقة والنية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="text-white/80 text-sm mb-2">معدل الاهتمام</div>
              <div className="text-4xl font-bold">
                {total > 0 ? (((intentData.interested + intentData.nearDecision + intentData.investors) / total) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-white/70 text-xs mt-2">من الزوار أظهروا اهتماماً</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="text-white/80 text-sm mb-2">معدل القرار</div>
              <div className="text-4xl font-bold">
                {total > 0 ? (((intentData.nearDecision + intentData.investors) / total) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-white/70 text-xs mt-2">قريبون من اتخاذ القرار</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
              <div className="text-white/80 text-sm mb-2">معدل التحويل النهائي</div>
              <div className="text-4xl font-bold">
                {total > 0 ? ((intentData.investors / total) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-white/70 text-xs mt-2">أصبحوا مستثمرين فعليين</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
