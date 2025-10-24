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

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadDashboardData();

    LiveFinancialSystem.initialize();

    const unsubscribe = LiveFinancialSystem.subscribe((state) => {
      setIsLiveConnected(state.isConnected);
      setLastLiveUpdate(state.lastUpdate);

      if (state.isConnected) {
        loadDashboardData();
      }
    });

    return () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-600">منصة تملك النخيل والزيتون</p>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trees className="h-5 w-5 text-green-600" />
              إحصائيات المزارع
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">مزارع نشطة</span>
                <span className="font-semibold text-green-600">{stats?.farms?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">مزارع نخيل</span>
                <span className="font-semibold">{stats?.farms?.palmFarms || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">مزارع زيتون</span>
                <span className="font-semibold">{stats?.farms?.oliveFarms || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">إجمالي الأشجار</span>
                <span className="font-semibold text-blue-600">{stats?.farms?.totalTrees || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">أشجار متاحة</span>
                <span className="font-semibold text-orange-600">{stats?.farms?.availableTrees || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              حالة الحجوزات
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">قيد الانتظار</span>
                <span className="font-semibold text-yellow-600">{stats?.reservations?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">مؤكدة</span>
                <span className="font-semibold text-blue-600">{stats?.reservations?.confirmed || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">نشطة</span>
                <span className="font-semibold text-green-600">{stats?.reservations?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">مكتملة</span>
                <span className="font-semibold">{stats?.reservations?.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ملغاة</span>
                <span className="font-semibold text-red-600">{stats?.reservations?.cancelled || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              المحافظ المالية
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">إجمالي المحافظ</span>
                <span className="font-semibold">{stats?.wallets?.totalWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">محافظ نشطة</span>
                <span className="font-semibold text-green-600">{stats?.wallets?.activeWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">إجمالي الرصيد</span>
                <span className="font-semibold text-blue-600">
                  {(stats?.wallets?.totalBalance || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">إجمالي الإيداعات</span>
                <span className="font-semibold text-emerald-600">
                  {(stats?.wallets?.totalDeposits || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">إجمالي السحوبات</span>
                <span className="font-semibold text-orange-600">
                  {(stats?.wallets?.totalWithdrawals || 0).toLocaleString('ar-SA')} ريال
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              ملخص الأداء
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">إجمالي الأشجار المحجوزة</span>
                <span className="font-semibold text-green-600">{stats?.reservations?.totalTrees || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">أصحاب المزارع</span>
                <span className="font-semibold">{stats?.users?.totalOwners || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">معاملات مكتملة</span>
                <span className="font-semibold text-green-600">{stats?.wallets?.completedTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">معاملات قيد الانتظار</span>
                <span className="font-semibold text-yellow-600">{stats?.wallets?.pendingTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">معدل الدفع</span>
                <span className="font-semibold text-blue-600">
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
