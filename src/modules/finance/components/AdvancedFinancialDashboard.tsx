import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Download,
  Database,
  Heart,
  Building2,
  AlertCircle,
  ArrowRight,
  X,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { brandColors, brandGradients } from '../styles/brandColors';
import { supabase } from '../../../lib/supabase';

interface AdvancedFinancialDashboardProps {
  onBack?: () => void;
}

interface FarmFinancialData {
  farmCode: string;
  farmName: string;
  totalRevenue: number;
  actualAmount: number;
  platformProfit: number;
  charityAmount: number;
  netProfit: number;
  totalInvestors: number;
  totalTreesSold: number;
  status: string;
  completionStage: string;
  settlementStatus: string;
  financialCompletion: number;
  marketingAmount: number;
  coveragePercentage: number;
  remainingAmount: number;
}

interface InsightMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
}

export function AdvancedFinancialDashboard({ onBack }: AdvancedFinancialDashboardProps) {
  const [farms, setFarms] = useState<FarmFinancialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightMessage[]>([]);

  const [overallStats, setOverallStats] = useState({
    totalRevenue: 0,
    totalPlatformProfit: 0,
    totalCharity: 0,
    totalNetProfit: 0,
    activeFarms: 0,
    totalInvestors: 0,
    totalTreesSold: 0,
    avgCompletion: 0,
  });

  useEffect(() => {
    loadAllData();

    // Realtime subscription
    const channel = supabase
      .channel('advanced_finance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smart_farm_finances',
        },
        () => {
          console.log('🔄 تحديث في البيانات المالية');
          loadAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔍 بدء تحميل البيانات المالية من smart_farm_finances...');

      const { data: financesData, error } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ خطأ في جلب البيانات:', error);
        throw error;
      }

      if (!financesData || financesData.length === 0) {
        console.warn('⚠️ لا توجد بيانات مالية');
        setFarms([]);
        setLoading(false);
        return;
      }

      console.log(`✅ تم جلب ${financesData.length} مزرعة`);

      const farmsData: FarmFinancialData[] = financesData.map((finance) => {
        const totalRevenue = Number(finance.total_revenue_collected) || 0;
        const actualAmount = Number(finance.actual_amount) || 0;
        const marketingAmount = Number(finance.marketing_amount) || 0;
        const platformProfit = Number(finance.platform_profit) || 0;
        const charityAmount = Number(finance.charity_amount) || 0;
        const netProfit = Number(finance.net_platform_profit) || 0;
        const coveragePercentage = Number(finance.coverage_percentage) || 0;
        const remainingAmount = Number(finance.remaining_amount) || 0;
        const financialCompletion = Number(finance.financial_completion_percentage) || 0;

        return {
          farmCode: finance.farm_code,
          farmName: finance.farm_name || 'مزرعة غير معروفة',
          totalRevenue,
          actualAmount,
          platformProfit,
          charityAmount,
          netProfit,
          totalInvestors: finance.total_investors || 0,
          totalTreesSold: finance.total_trees_sold || 0,
          status: finance.status || 'active',
          completionStage: finance.completion_stage || 'collecting',
          settlementStatus: finance.settlement_status || 'collecting',
          financialCompletion,
          marketingAmount,
          coveragePercentage,
          remainingAmount,
        };
      });

      // حساب الإحصائيات الإجمالية
      const stats = farmsData.reduce(
        (acc, farm) => ({
          totalRevenue: acc.totalRevenue + farm.totalRevenue,
          totalPlatformProfit: acc.totalPlatformProfit + farm.platformProfit,
          totalCharity: acc.totalCharity + farm.charityAmount,
          totalNetProfit: acc.totalNetProfit + farm.netProfit,
          totalInvestors: acc.totalInvestors + farm.totalInvestors,
          totalTreesSold: acc.totalTreesSold + farm.totalTreesSold,
          avgCompletion: acc.avgCompletion + farm.financialCompletion,
        }),
        {
          totalRevenue: 0,
          totalPlatformProfit: 0,
          totalCharity: 0,
          totalNetProfit: 0,
          totalInvestors: 0,
          totalTreesSold: 0,
          avgCompletion: 0,
        }
      );

      stats.avgCompletion = farmsData.length > 0 ? stats.avgCompletion / farmsData.length : 0;

      setFarms(farmsData);
      setOverallStats({
        ...stats,
        activeFarms: farmsData.length,
      });

      generateInsights(farmsData);

      console.log('📊 الإحصائيات النهائية:', stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const generateInsights = (farmsData: FarmFinancialData[]) => {
    if (farmsData.length === 0) return;

    const newInsights: InsightMessage[] = [];

    // أعلى ربح
    const maxProfit = Math.max(...farmsData.map((f) => f.platformProfit));
    const topFarm = farmsData.find((f) => f.platformProfit === maxProfit);
    if (topFarm && maxProfit > 0) {
      newInsights.push({
        id: `insight-top-${Date.now()}`,
        message: `🏆 ${topFarm.farmName} تحقق أعلى ربح: ${maxProfit.toLocaleString('ar-SA')} ريال`,
        type: 'success',
        timestamp: new Date(),
      });
    }

    // مزارع قريبة من الاكتمال
    const nearCompletion = farmsData.filter(
      (f) => f.financialCompletion >= 80 && f.financialCompletion < 100
    );
    if (nearCompletion.length > 0) {
      newInsights.push({
        id: `insight-near-${Date.now()}`,
        message: `⏳ ${nearCompletion.length} مزرعة قريبة من الاكتمال المالي`,
        type: 'info',
        timestamp: new Date(),
      });
    }

    // مزارع مكتملة
    const completed = farmsData.filter((f) => f.financialCompletion >= 100);
    if (completed.length > 0) {
      newInsights.push({
        id: `insight-completed-${Date.now()}`,
        message: `✅ ${completed.length} مزرعة وصلت للاكتمال المالي`,
        type: 'success',
        timestamp: new Date(),
      });
    }

    // تحذير إذا لا توجد إيرادات
    const noRevenue = farmsData.filter((f) => f.totalRevenue === 0);
    if (noRevenue.length > 0) {
      newInsights.push({
        id: `insight-no-revenue-${Date.now()}`,
        message: `⚠️ ${noRevenue.length} مزرعة بدون إيرادات حتى الآن`,
        type: 'warning',
        timestamp: new Date(),
      });
    }

    setInsights(newInsights);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      collecting: 'جمع الإيرادات',
      owner_payment: 'دفع المالك',
      profit_calculation: 'حساب الأرباح',
      charity_deduction: 'خصم الصدقة',
      completed: 'مكتمل',
    };
    return labels[stage] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات المالية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton onClick={onBack} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المالية المتطورة</h1>
              <p className="text-gray-600 mt-1">نظام مالي متكامل لإدارة المزارع والمستثمرين</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">تحديث</span>
          </button>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 opacity-80" />
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(overallStats.totalRevenue)}
            </div>
            <div className="text-emerald-100">إجمالي الإيرادات</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="h-8 w-8 opacity-80" />
              <Activity className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(overallStats.totalPlatformProfit)}
            </div>
            <div className="text-blue-100">ربح المنصة</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 opacity-80" />
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {formatCurrency(overallStats.totalCharity)}
            </div>
            <div className="text-purple-100">مبلغ الصدقة</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 opacity-80" />
              <Database className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold mb-2">{overallStats.activeFarms}</div>
            <div className="text-orange-100">مزرعة نشطة</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-700">إجمالي المستثمرين</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{overallStats.totalInvestors}</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-gray-700">الأشجار المباعة</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overallStats.totalTreesSold.toLocaleString('ar-SA')}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-gray-700">متوسط الاكتمال</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {overallStats.avgCompletion.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 رؤى مالية</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg ${
                    insight.type === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : insight.type === 'warning'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <p className="text-gray-800">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farms List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">📋 المزارع المالية</h2>
            <p className="text-gray-600 mt-1">جميع المزارع وأداءها المالي</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    المزرعة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    الإيرادات
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    ربح المنصة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    الصدقة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    المستثمرون
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    الاكتمال
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    الحالة
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                    المرحلة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {farms.map((farm) => (
                  <tr
                    key={farm.farmCode}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedFarm(farm.farmCode)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{farm.farmName}</div>
                        <div className="text-sm text-gray-500">{farm.farmCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(farm.totalRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(farm.platformProfit)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-purple-600">
                        {formatCurrency(farm.charityAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{farm.totalInvestors}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full"
                            style={{ width: `${Math.min(farm.financialCompletion, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {farm.financialCompletion.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          farm.status
                        )}`}
                      >
                        {farm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {getStageLabel(farm.completionStage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {farms.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد بيانات مالية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
