import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Heart,
  Building2,
  Users,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FinancialCoreService, FarmFinanceData, FinancialStats } from '../services/financialCoreService';
import { LuxuryFarmFinanceCard } from './LuxuryFarmFinanceCard';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { BackButton } from '../../../components/common/BackButton';

interface FinancialCoreV3DashboardProps {
  onBack?: () => void;
}

export function FinancialCoreV3Dashboard({ onBack }: FinancialCoreV3DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farms, setFarms] = useState<FarmFinanceData[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);

  useEffect(() => {
    loadData();

    // الاشتراك في التحديثات المباشرة
    const unsubscribe = FinancialCoreService.subscribeToFinancialUpdates((updatedFarms) => {
      setFarms(updatedFarms);
      calculateStats(updatedFarms);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [farmsData, statsData] = await Promise.all([
        FinancialCoreService.getAllFarmFinances(),
        FinancialCoreService.getFinancialStats(),
      ]);

      setFarms(farmsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات المالية:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (farmsData: FarmFinanceData[]) => {
    const statsData = await FinancialCoreService.getFinancialStats();
    setStats(statsData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل النظام المالي المتكامل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && <BackButton onClick={onBack} />}
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <h1 className="text-3xl font-bold text-gray-900">النظام المالي المتكامل V3</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  نظام شامل لربط الأسعار وحساب الأرباح تلقائياً
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* الإحصائيات الإجمالية */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* إجمالي الإيرادات */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8" />
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-full">إجمالي</div>
                </div>
                <h3 className="text-sm font-medium mb-2 text-white/80">إجمالي الإيرادات</h3>
                <p className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={stats.totalRevenue} duration={1500} />
                </p>
                <p className="text-xs text-white/70">
                  {FinancialCoreService.formatCurrency(stats.totalRevenue)}
                </p>
              </div>

              {/* الربح الصافي */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8" />
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-full">ربح</div>
                </div>
                <h3 className="text-sm font-medium mb-2 text-white/80">الربح الصافي</h3>
                <p className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={stats.totalNetProfit} duration={1500} />
                </p>
                <p className="text-xs text-white/70">
                  {FinancialCoreService.formatCurrency(stats.totalNetProfit)}
                </p>
              </div>

              {/* محفظة الخير */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <Heart className="w-8 h-8" />
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-full">25%</div>
                </div>
                <h3 className="text-sm font-medium mb-2 text-white/80">محفظة الخير</h3>
                <p className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={stats.totalCharityAmount} duration={1500} />
                </p>
                <p className="text-xs text-white/70">
                  {FinancialCoreService.formatCurrency(stats.totalCharityAmount)}
                </p>
              </div>

              {/* ربح المنصة الصافي */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <Sparkles className="w-8 h-8" />
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-full">75%</div>
                </div>
                <h3 className="text-sm font-medium mb-2 text-white/80">ربح المنصة الصافي</h3>
                <p className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={stats.platformNetProfit} duration={1500} />
                </p>
                <p className="text-xs text-white/70">
                  {FinancialCoreService.formatCurrency(stats.platformNetProfit)}
                </p>
              </div>
            </div>

            {/* إحصائيات الأسعار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الأسعار</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">إجمالي السعر الفعلي:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {FinancialCoreService.formatCurrency(stats.totalActualPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">إجمالي السعر التسويقي:</span>
                    <span className="text-lg font-bold text-green-600">
                      {FinancialCoreService.formatCurrency(stats.totalMarketingPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">الفرق (الربح):</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {FinancialCoreService.formatCurrency(stats.totalNetProfit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات عامة</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">المستثمرون</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalInvestors}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">الأشجار</p>
                    <p className="text-2xl font-bold text-green-600">{stats.totalTreesSold.toLocaleString('ar')}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">المزارع النشطة</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.activeFarms}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">المكتملة</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.completedFarms}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* بطاقات المزارع الفاخرة */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            البطاقات المالية للمزارع
          </h2>
          {farms.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد بيانات مالية</h3>
              <p className="text-gray-600">لم يتم العثور على أي مزارع مالية في النظام</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {farms.map((farm) => (
                <LuxuryFarmFinanceCard key={farm.id} finance={farm} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
