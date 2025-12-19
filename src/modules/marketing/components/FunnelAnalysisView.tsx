import React, { useEffect, useState } from 'react';
import { Filter, TrendingDown, ArrowDown } from 'lucide-react';
import { marketingAnalyticsService } from '../../../services/analytics/marketingAnalyticsService';

export function FunnelAnalysisView() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [funnelData, setFunnelData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await marketingAnalyticsService.getFunnelData(period);
      setFunnelData(data);
    } catch (error) {
      console.error('Failed to load funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...funnelData.map(step => step.count), 1);

  if (loading) {
    return (
      <div className="p-8" dir="rtl">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              رحلة المستثمر
            </h1>
            <p className="text-gray-600 mt-2">تحليل مسار التحويل والتسرب</p>
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-4">
          {funnelData.map((step, index) => {
            const widthPercent = (step.count / maxCount) * 100;
            const isLast = index === funnelData.length - 1;

            return (
              <div key={index} className="space-y-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{step.step}</h3>
                          {step.dropoffRate > 0 && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" />
                              {step.dropoffRate.toFixed(1)}% تسرب
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-4xl font-bold text-gray-800">{step.count}</div>
                        <div className="text-sm text-gray-500">{((step.count / funnelData[0].count) * 100).toFixed(0)}%</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 right-0 h-full bg-gradient-to-l from-purple-500 to-pink-600 transition-all duration-500 rounded-full"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {!isLast && (
                  <div className="flex justify-center">
                    <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 shadow-2xl text-white">
          <h2 className="text-2xl font-bold mb-4">ملخص الأداء</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="text-white/80 text-sm mb-1">معدل التحويل الإجمالي</div>
              <div className="text-3xl font-bold">
                {funnelData.length > 0 ? ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="text-white/80 text-sm mb-1">أعلى نسبة تسرب</div>
              <div className="text-3xl font-bold">
                {Math.max(...funnelData.map(s => s.dropoffRate)).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="text-white/80 text-sm mb-1">المستثمرون الفعليون</div>
              <div className="text-3xl font-bold">
                {funnelData[funnelData.length - 1]?.count || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
