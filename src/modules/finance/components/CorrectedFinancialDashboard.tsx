import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  CheckCircle,
  RefreshCw,
  Zap,
  TrendingUp,
  Building2,
  Archive,
} from 'lucide-react';
import { CorrectedFinancialService, CorrectedFarmFinance, FinancialStats } from '../services/correctedFinancialService';
import { SmartFinancialCard3D } from './SmartFinancialCard3D';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { BackButton } from '../../../components/common/BackButton';

interface CorrectedFinancialDashboardProps {
  onBack?: () => void;
}

export function CorrectedFinancialDashboard({ onBack }: CorrectedFinancialDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farms, setFarms] = useState<CorrectedFarmFinance[]>([]);
  const [archivedFarms, setArchivedFarms] = useState<CorrectedFarmFinance[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [executingSettlement, setExecutingSettlement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [hasArchivePermission, setHasArchivePermission] = useState(false);
  const [adminPhone, setAdminPhone] = useState<string>('');

  useEffect(() => {
    loadData();
    checkPermissions();

    const unsubscribe = CorrectedFinancialService.subscribeToFinancialUpdates((updatedFarms) => {
      setFarms(updatedFarms);
      calculateStats(updatedFarms);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkPermissions = async () => {
    // جلب رقم الهاتف من localStorage أو session
    const storedPhone = localStorage.getItem('admin_phone') || '0500000000';
    setAdminPhone(storedPhone);

    const hasPermission = await CorrectedFinancialService.checkArchivingPermission(storedPhone);
    setHasArchivePermission(hasPermission);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [farmsData, archivedData, statsData] = await Promise.all([
        CorrectedFinancialService.getAllFarmFinances(),
        CorrectedFinancialService.getArchivedFarms(),
        CorrectedFinancialService.getFinancialStats(),
      ]);
      setFarms(farmsData);
      setArchivedFarms(archivedData);
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

      // استخدام UUID صالح للمدير
      const adminId = '00000000-0000-0000-0000-000000000000';

      console.log('🚀 Starting settlement for farm:', farmId);

      const result = await CorrectedFinancialService.executeManualSettlement(farmId, adminId);

      console.log('📊 Settlement result:', result);

      if (result && result.success) {
        alert(`✅ تمت التسوية بنجاح!\n\nرقم العملية: ${result.transaction_id}\nالمبلغ: ${CorrectedFinancialService.formatCurrency(result.amount)}`);
        await loadData();
      } else {
        const errorMsg = result?.error || 'خطأ غير معروف';
        alert(`❌ فشلت التسوية: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في تنفيذ التسوية:', error);
      const errorDetails = error?.message || error?.details || error?.hint || 'حدث خطأ أثناء تنفيذ التسوية';
      alert(`❌ خطأ: ${errorDetails}`);
    } finally {
      setExecutingSettlement(null);
    }
  };

  const handleArchive = async (farmId: string) => {
    try {
      console.log('🗃️ Starting archive for farm:', farmId);

      const result = await CorrectedFinancialService.archiveFarm(farmId, adminPhone);

      console.log('📊 Archive result:', result);

      if (result && result.success) {
        alert(`✅ تمت الأرشفة بنجاح!\n\nالمزرعة: ${result.farm_name} (${result.farm_code})`);
        await loadData();
      } else {
        const errorMsg = result?.error || 'خطأ غير معروف';
        alert(`❌ فشلت الأرشفة: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error('❌ خطأ في الأرشفة:', error);
      const errorDetails = error?.message || error?.details || error?.hint || 'حدث خطأ أثناء الأرشفة';
      alert(`❌ خطأ: ${errorDetails}`);
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
                  <h1 className="text-3xl font-bold text-gray-900">الإدارة المالية - البطاقات ثلاثية الأبعاد</h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  💳 كل بطاقة تحتوي على المحافظ والتسويات والأرباح - اضغط على أي بطاقة للتفاصيل
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
        {/* الإحصائيات المختصرة فقط */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* عدد المزارع الجاهزة */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-5 text-white shadow-xl hover:scale-105 transition-transform">
              <Zap className="w-7 h-7 mb-2" />
              <h3 className="text-xs font-medium mb-1 text-white/80">جاهز للتسوية</h3>
              <p className="text-4xl font-bold">
                <AnimatedCounter end={stats.farmsReadyForSettlement} duration={1000} />
              </p>
            </div>

            {/* عدد المزارع المسواة */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-xl hover:scale-105 transition-transform">
              <CheckCircle className="w-7 h-7 mb-2" />
              <h3 className="text-xs font-medium mb-1 text-white/80">تمت التسوية</h3>
              <p className="text-4xl font-bold">
                <AnimatedCounter end={stats.farmsSettled} duration={1000} />
              </p>
            </div>

            {/* عدد المزارع قيد التجميع */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-xl hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7 mb-2" />
              <h3 className="text-xs font-medium mb-1 text-white/80">قيد التجميع</h3>
              <p className="text-4xl font-bold">
                <AnimatedCounter end={stats.farmsInCollection} duration={1000} />
              </p>
            </div>

            {/* إجمالي المزارع */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-xl hover:scale-105 transition-transform">
              <Users className="w-7 h-7 mb-2" />
              <h3 className="text-xs font-medium mb-1 text-white/80">إجمالي المزارع</h3>
              <p className="text-4xl font-bold">{farms.length}</p>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="mb-6">
          <div className="flex gap-4 mb-6 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-bold text-lg transition-all ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-4 border-blue-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              المزارع النشطة ({farms.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-3 font-bold text-lg transition-all ${
                activeTab === 'archived'
                  ? 'text-slate-600 border-b-4 border-slate-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Archive className="w-5 h-5 inline mr-2" />
              الأرشفة المالية ({archivedFarms.length})
            </button>
          </div>

          {activeTab === 'active' ? (
            // المزارع النشطة
            farms.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد مزارع نشطة</h3>
                <p className="text-gray-600">جميع المزارع تم أرشفتها</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {farms.map((farm) => (
                  <SmartFinancialCard3D
                    key={farm.id}
                    finance={farm}
                    onExecuteSettlement={executingSettlement ? undefined : handleExecuteSettlement}
                    onArchive={handleArchive}
                    hasArchivePermission={hasArchivePermission}
                  />
                ))}
              </div>
            )
          ) : (
            // المزارع المؤرشفة
            archivedFarms.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد مزارع مؤرشفة</h3>
                <p className="text-gray-600">لم يتم أرشفة أي مزرعة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {archivedFarms.map((farm) => (
                  <SmartFinancialCard3D
                    key={farm.id}
                    finance={farm}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
