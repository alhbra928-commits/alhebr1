/**
 * Real Funnel View - رحلة المستثمر الحقيقية
 *
 * يعتمد على analytics_events (بيانات حقيقية 100%)
 * تحديث تلقائي كل 5 ثواني
 */

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Activity, Clock, Target } from 'lucide-react';
import { FunnelAnalyticsService } from '../../../services/analytics/funnelAnalyticsService';

type TimeRange = '1h' | '24h' | '7d' | '30d';

interface FunnelStep {
  step: string;
  stepNumber: number;
  count: number;
  percentage: number;
  dropOff: number;
}

export function RealFunnelView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [conversionRate, setConversionRate] = useState({ visitors: 0, bookings: 0, conversionRate: 0 });
  const [topPages, setTopPages] = useState<{ pagePath: string; views: number; uniqueVisitors: number }[]>([]);

  const fetchData = async () => {
    try {
      const [funnel, conversion, pages] = await Promise.all([
        FunnelAnalyticsService.getFunnelData(timeRange),
        FunnelAnalyticsService.getConversionRate(timeRange),
        FunnelAnalyticsService.getTopPages(timeRange, 5),
      ]);

      setFunnelData(funnel);
      setConversionRate(conversion);
      setTopPages(pages);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">رحلة المستثمر</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar')}
          </p>
        </div>

        {/* Time Range */}
        <div className="flex gap-2">
          {[
            { value: '1h' as TimeRange, label: 'آخر ساعة' },
            { value: '24h' as TimeRange, label: 'آخر 24 ساعة' },
            { value: '7d' as TimeRange, label: 'آخر 7 أيام' },
            { value: '30d' as TimeRange, label: 'آخر 30 يوم' },
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">معدل التحويل الإجمالي</div>
            <div className="text-5xl font-bold">{conversionRate.conversionRate}%</div>
            <div className="text-sm opacity-90 mt-2">
              {conversionRate.bookings} حجز من {conversionRate.visitors} زائر
            </div>
          </div>
          <Target className="h-16 w-16 opacity-60" />
        </div>
      </div>

      {/* Funnel Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">مراحل الرحلة</h3>

        <div className="space-y-4">
          {funnelData.map((step, index) => {
            // حساب عرض الشريط بناءً على النسبة
            const barWidth = step.percentage;

            return (
              <div key={index} className="space-y-2">
                {/* معلومات الخطوة */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {step.stepNumber}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{step.step}</div>
                      <div className="text-xs text-gray-500">{step.count.toLocaleString()} مستخدم</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* النسبة المئوية */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">{step.percentage}%</div>
                      <div className="text-xs text-gray-500">من الإجمالي</div>
                    </div>

                    {/* Drop-off */}
                    {step.dropOff > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm font-medium">{step.dropOff}%</span>
                        </div>
                        <div className="text-xs text-gray-500">تسرب</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* شريط التقدم */}
                <div className="relative">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>

                {/* سهم للخطوة التالية */}
                {index < funnelData.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="text-gray-400">↓</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">أكثر الصفحات مشاهدة</h3>

        <div className="space-y-3">
          {topPages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">لا توجد بيانات</div>
          ) : (
            topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{page.pagePath}</div>
                    <div className="text-xs text-gray-500">{page.uniqueVisitors} زائر فريد</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">{page.views}</div>
                  <div className="text-xs text-gray-500">مشاهدة</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* أكبر تسرب */}
        {(() => {
          const maxDropOff = funnelData.reduce((max, step) => (step.dropOff > max.dropOff ? step : max), funnelData[0] || { dropOff: 0 });

          if (!maxDropOff || maxDropOff.dropOff === 0) return null;

          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-900 mb-1">أكبر نقطة تسرب</div>
                  <div className="text-sm text-red-700">
                    {maxDropOff.dropOff}% من المستخدمين يغادرون عند "{maxDropOff.step}"
                  </div>
                  <div className="text-xs text-red-600 mt-2">
                    💡 ركز على تحسين هذه المرحلة لزيادة معدل التحويل
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* أفضل أداء */}
        {(() => {
          const bestStep = funnelData.reduce((best, step) => (step.percentage > best.percentage ? step : best), funnelData[0] || { percentage: 0 });

          if (!bestStep || bestStep.percentage === 0) return null;

          return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900 mb-1">أقوى مرحلة</div>
                  <div className="text-sm text-emerald-700">
                    {bestStep.percentage}% من الزوار يصلون إلى "{bestStep.step}"
                  </div>
                  <div className="text-xs text-emerald-600 mt-2">
                    ✅ هذه المرحلة تعمل بشكل ممتاز
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">📊 بيانات حقيقية من analytics_events</p>
            <p className="text-blue-700">
              جميع مراحل الرحلة يتم حسابها من جدول{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">analytics_events</code>.
              التحديث التلقائي كل 5 ثواني.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
