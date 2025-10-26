import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  CheckCircle,
  RefreshCw,
  Zap,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { CorrectedFinancialService, CorrectedFarmFinance, FinancialStats } from '../services/correctedFinancialService';
import { CorrectedFarmFinanceCard } from './CorrectedFarmFinanceCard';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { BackButton } from '../../../components/common/BackButton';

interface CorrectedFinancialDashboardProps {
  onBack?: () => void;
}

export function CorrectedFinancialDashboard({ onBack }: CorrectedFinancialDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farms, setFarms] = useState<CorrectedFarmFinance[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [executingSettlement, setExecutingSettlement] = useState<string | null>(null);

  useEffect(() => {
    loadData();

    const unsubscribe = CorrectedFinancialService.subscribeToFinancialUpdates((updatedFarms) => {
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
        CorrectedFinancialService.getAllFarmFinances(),
        CorrectedFinancialService.getFinancialStats(),
      ]);
      setFarms(farmsData);
      setStats(statsData);
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    const statsData = await CorrectedFinancialService.getFinancialStats();
    setStats(statsData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleExecuteSettlement = async (farmId: string) => {
    if (!confirm('هل أنت متأكد من تنفيذ التسوية المالية؟\nسيتم تحويل المبلغ إلى صاحب المزرعة.')) {
      return;
    }

    try {
      setExecutingSettlement(farmId);

      // TODO: Get actual admin ID from session
      const adminId = 'admin-temp-id';

      const result = await CorrectedFinancialService.executeManualSettlement(farmId, adminId);

      if (result.success) {
        alert(`✅ تمت التسوية بنجاح!\n\nرقم العملية: ${result.transaction_id}\nالمبلغ: ${CorrectedFinancialService.formatCurrency(result.amount)}`);
        await loadData();
      } else {
        alert(`❌ فشلت التسوية: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ خطأ في تنفيذ التسوية:', error);
      alert('❌ حدث خطأ أثناء تنفيذ التسوية');
    } finally {
      setExecutingSettlement(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل النظام المالي المصحح...</p>
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
                  <Zap className="w-8 h-8 text-yellow-500" />
                  <h1 className="text-3xl font-bold text-gray-900">الإدارة المالية المصححة</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  التدفق الإجرائي الصحيح: تجميع → تنبيه → تسوية → أرباح
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* المبلغ المحصل من المستثمرين */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8" />
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">محصّل</div>
              </div>
              <h3 className="text-sm font-medium mb-2 text-white/80">المبلغ المحصل</h3>
              <p className="text-3xl font-bold">
                <AnimatedCounter end={stats.totalCollectedFromInvestors} duration={1500} />
              </p>
              <p className="text-xs text-white/70 mt-2">
                {CorrectedFinancialService.formatCurrency(stats.totalCollectedFromInvestors)}
              </p>
            </div>

            {/* المبلغ المطلوب للملاك */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8" />
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">مطلوب</div>
              </div>
              <h3 className="text-sm font-medium mb-2 text-white/80">المبلغ المطلوب</h3>
              <p className="text-3xl font-bold">
                <AnimatedCounter end={stats.totalOwnerAmountTarget} duration={1500} />
              </p>
              <p className="text-xs text-white/70 mt-2">
                {CorrectedFinancialService.formatCurrency(stats.totalOwnerAmountTarget)}
              </p>
            </div>

            {/* المزارع الجاهزة للتسوية */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8" />
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">وميض</div>
              </div>
              <h3 className="text-sm font-medium mb-2 text-white/80">جاهز للتسوية</h3>
              <p className="text-5xl font-bold">
                <AnimatedCounter end={stats.farmsReadyForSettlement} duration={1000} />
              </p>
              <p className="text-xs text-white/70 mt-2">مزرعة بحاجة للتسوية</p>
            </div>

            {/* المزارع المسواة */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8" />
                <div className="text-sm bg-white/20 px-3 py-1 rounded-full">مسواة</div>
              </div>
              <h3 className="text-sm font-medium mb-2 text-white/80">تمت التسوية</h3>
              <p className="text-5xl font-bold">
                <AnimatedCounter end={stats.farmsSettled} duration={1000} />
              </p>
              <p className="text-xs text-white/70 mt-2">مزرعة مسواة</p>
            </div>
          </div>
        )}

        {/* إحصائيات إضافية */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold text-gray-900">قيد التجميع</h4>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.farmsInCollection}</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">المحوّل للملاك</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {CorrectedFinancialService.formatCurrency(stats.totalOwnerAmountTransferred)}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold text-gray-900">إجمالي المزارع</h4>
              </div>
              <p className="text-3xl font-bold text-purple-600">{farms.length}</p>
            </div>
          </div>
        )}

        {/* بطاقات المزارع */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
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
                <CorrectedFarmFinanceCard
                  key={farm.id}
                  finance={farm}
                  onExecuteSettlement={executingSettlement ? undefined : handleExecuteSettlement}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
