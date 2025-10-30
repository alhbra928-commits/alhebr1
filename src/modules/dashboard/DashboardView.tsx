import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Users,
  Calendar,
  Wallet,
  Trees,
  DollarSign,
  Activity
} from 'lucide-react';
import { DashboardService } from './dashboardService';
import { StatCard } from '../../components/common/StatCard';
import { LiveFinancialSystem } from '../../services/liveFinancialSystem';
import { CompactLiveStatusIndicator } from '../../components/common/LiveStatusIndicator';
import { VisitorsSummaryCard } from './components/VisitorsSummaryCard';

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // تحميل فوري
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 50);

    // تهيئة النظام المالي في الخلفية
    setTimeout(() => {
      LiveFinancialSystem.initialize();
    }, 1000);

    const unsubscribe = LiveFinancialSystem.subscribe((state) => {
      setIsLiveConnected(state.isConnected);
      setLastLiveUpdate(state.lastUpdate);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getOverallStatistics();
      setStats(data);
    } catch (err) {
      setError('فشل تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-transparent p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-emerald-900/30 backdrop-blur-sm rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-emerald-900/30 backdrop-blur-sm rounded w-48 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-emerald-900/30 rounded w-24 mb-4"></div>
                <div className="h-8 bg-emerald-900/30 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-emerald-200/70">منصة تملك النخيل والزيتون</p>
          </div>
          <CompactLiveStatusIndicator
            isConnected={isLiveConnected}
            lastUpdate={lastLiveUpdate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المزارع"
            value={stats?.farms?.total || 0}
            icon={MapPin}
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <StatCard
            title="إجمالي الحجوزات"
            value={stats?.reservations?.total || 0}
            icon={Calendar}
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="إجمالي المستثمرين"
            value={stats?.users?.totalInvestors || 0}
            icon={Users}
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            title="إجمالي الإيرادات"
            value={`${(stats?.revenue?.total || 0).toLocaleString('ar-SA')} ريال`}
            icon={DollarSign}
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
              <Trees className="h-5 w-5 text-emerald-400" />
              إحصائيات المزارع
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">مزارع نشطة</span>
                <span className="font-semibold text-emerald-400">{stats?.farms?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">مزارع نخيل</span>
                <span className="font-semibold text-emerald-300">{stats?.farms?.palmFarms || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">مزارع زيتون</span>
                <span className="font-semibold text-emerald-300">{stats?.farms?.oliveFarms || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">إجمالي الأشجار</span>
                <span className="font-semibold text-teal-400">{stats?.farms?.totalTrees || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70">أشجار متاحة</span>
                <span className="font-semibold text-orange-400">{stats?.farms?.availableTrees || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-400" />
              حالة الحجوزات
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">قيد الانتظار</span>
                <span className="font-semibold text-yellow-400">{stats?.reservations?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">مؤكدة</span>
                <span className="font-semibold text-blue-400">{stats?.reservations?.confirmed || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">نشطة</span>
                <span className="font-semibold text-emerald-400">{stats?.reservations?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">مكتملة</span>
                <span className="font-semibold text-emerald-300">{stats?.reservations?.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70">ملغاة</span>
                <span className="font-semibold text-red-400">{stats?.reservations?.cancelled || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visitors Summary Card */}
          <div className="lg:col-span-1">
            <VisitorsSummaryCard />
          </div>

          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-400" />
              المحافظ المالية
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">إجمالي المحافظ</span>
                <span className="font-semibold text-emerald-300">{stats?.wallets?.totalWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">محافظ نشطة</span>
                <span className="font-semibold text-emerald-400">{stats?.wallets?.activeWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">إجمالي الرصيد</span>
                <span className="font-semibold text-teal-400">
                  {(stats?.wallets?.totalBalance || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">إجمالي الإيداعات</span>
                <span className="font-semibold text-emerald-400">
                  {(stats?.wallets?.totalDeposits || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70">إجمالي السحوبات</span>
                <span className="font-semibold text-orange-400">
                  {(stats?.wallets?.totalWithdrawals || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-emerald-800/30 shadow-lg p-6">
            <h2 className="text-lg font-semibold text-emerald-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-400" />
              ملخص الأداء
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">إجمالي الأشجار المحجوزة</span>
                <span className="font-semibold text-emerald-400">{stats?.reservations?.totalTrees || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">أصحاب المزارع</span>
                <span className="font-semibold text-emerald-300">{stats?.users?.totalOwners || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">معاملات مكتملة</span>
                <span className="font-semibold text-emerald-400">{stats?.wallets?.completedTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-emerald-800/30">
                <span className="text-emerald-200/70">معاملات قيد الانتظار</span>
                <span className="font-semibold text-yellow-400">{stats?.wallets?.pendingTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70">معدل الدفع</span>
                <span className="font-semibold text-teal-400">
                  {stats?.reservations?.total > 0
                    ? Math.round((stats?.reservations?.paid / stats?.reservations?.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
