import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, Users, Calendar, DollarSign, Target, Zap } from 'lucide-react';
import { marketingAnalyticsService } from '../../../services/analytics/marketingAnalyticsService';

export function CommandCenterView() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [pulse, setPulse] = useState<any>(null);
  const [kpis, setKPIs] = useState<any>(null);
  const [bestSource, setBestSource] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pulseData, kpisData, bestSourceData] = await Promise.all([
        marketingAnalyticsService.getPulseData(period),
        marketingAnalyticsService.getKPIs(period),
        marketingAnalyticsService.getBestSourceToday(),
      ]);

      setPulse(pulseData);
      setKPIs(kpisData);
      setBestSource(bestSourceData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPulseColor = (level: string) => {
    if (level === 'high') return 'from-green-500 to-emerald-600';
    if (level === 'medium') return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  const getPulseIcon = (level: string) => {
    if (level === 'high') return '🚀';
    if (level === 'medium') return '📊';
    return '📉';
  };

  if (loading) {
    return (
      <div className="p-8" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              مركز القيادة
            </h1>
            <p className="text-gray-600 mt-2">نبض المنصة والتحليلات الفورية</p>
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pulse Card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${getPulseColor(pulse?.level || 'low')} p-8 shadow-2xl`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-4xl">
                  {getPulseIcon(pulse?.level || 'low')}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">نبض المنصة</h2>
                  <p className="text-white/80">Platform Pulse</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-white">{pulse?.score?.toFixed(0) || 0}</div>
                <div className="text-white/80 text-sm mt-1">
                  {pulse?.level === 'high' && 'عالي جداً'}
                  {pulse?.level === 'medium' && 'متوسط'}
                  {pulse?.level === 'low' && 'ضعيف'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/80 text-sm mb-1">الزوار</div>
                <div className="text-3xl font-bold text-white">{pulse?.visitors || 0}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/80 text-sm mb-1">المهتمون</div>
                <div className="text-3xl font-bold text-white">{pulse?.engaged || 0}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
                <div className="text-white/80 text-sm mb-1">الحجوزات</div>
                <div className="text-3xl font-bold text-white">{pulse?.bookings || 0}</div>
              </div>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white rounded-full"></div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            icon={Users}
            label="الزوار"
            value={kpis?.visitors || 0}
            color="blue"
          />
          <KPICard
            icon={Activity}
            label="المهتمون"
            value={kpis?.engaged || 0}
            subValue={`${kpis?.engagementRate || 0}% معدل التفاعل`}
            color="purple"
          />
          <KPICard
            icon={Calendar}
            label="بدء الحجز"
            value={kpis?.bookingStarts || 0}
            color="orange"
          />
          <KPICard
            icon={Target}
            label="إرسال الحجز"
            value={kpis?.bookingSubmits || 0}
            subValue={`${kpis?.conversionRate || 0}% معدل التحويل`}
            color="green"
          />
          <KPICard
            icon={DollarSign}
            label="رفع الإيصال"
            value={kpis?.paymentUploads || 0}
            color="emerald"
          />
          <KPICard
            icon={TrendingUp}
            label="أفضل مصدر اليوم"
            value={bestSource?.source || 'لا يوجد'}
            subValue={bestSource ? `${bestSource.conversionRate.toFixed(1)}% تحويل` : ''}
            color="teal"
          />
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  icon: any;
  label: string;
  value: number | string;
  subValue?: string;
  color: string;
}

function KPICard({ icon: Icon, label, value, subValue, color }: KPICardProps) {
  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-gray-600 text-sm mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {subValue && <div className="text-sm text-gray-500 mt-1">{subValue}</div>}
    </div>
  );
}
