import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Activity, DollarSign, CreditCard } from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { WalletsService } from '../walletsService';

interface WalletsViewProps {
  onBack?: () => void;
}

export function WalletsView({ onBack }: WalletsViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const statsData = await WalletsService.getStatistics();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6] p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {onBack && (
          <div className="mb-6">
            <BackButton onBack={onBack} />
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#C89B3C] mb-2">إدارة المحافظ المالية</h1>
          <p className="text-[#2C2C2C]/70">متابعة وإدارة جميع المحافظ والمعاملات المالية</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card3D interactive={false}>
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <span className="text-3xl font-bold text-gray-900">
                  {(stats?.totalBalance || 0).toLocaleString('ar-SA')}
                </span>
                <p className="text-xs text-gray-600">ريال سعودي</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">إجمالي الرصيد</h3>
            <p className="text-xs text-gray-600">في جميع المحافظ</p>
          </div>
        </Card3D>

        <Card3D interactive={false}>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <span className="text-3xl font-bold text-gray-900">
                  {(stats?.totalDeposits || 0).toLocaleString('ar-SA')}
                </span>
                <p className="text-xs text-gray-600">ريال سعودي</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">إجمالي الإيداعات</h3>
            <p className="text-xs text-gray-600">جميع الإيداعات المسجلة</p>
          </div>
        </Card3D>

        <Card3D interactive={false}>
          <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-7 w-7 text-white" />
              </div>
              <div className="text-left">
                <span className="text-3xl font-bold text-gray-900">
                  {(stats?.totalWithdrawals || 0).toLocaleString('ar-SA')}
                </span>
                <p className="text-xs text-gray-600">ريال سعودي</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">إجمالي السحوبات</h3>
            <p className="text-xs text-gray-600">جميع السحوبات المسجلة</p>
          </div>
        </Card3D>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card3D interactive={false}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              إحصائيات المحافظ
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">إجمالي المحافظ</span>
                <span className="font-bold text-gray-900">{stats?.totalWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">محافظ نشطة</span>
                <span className="font-bold text-green-600">{stats?.activeWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">محافظ مجمدة</span>
                <span className="font-bold text-red-600">{stats?.frozenWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">محافظ المستثمرين</span>
                <span className="font-bold text-blue-600">{stats?.investorWallets || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">محافظ الملاك</span>
                <span className="font-bold text-orange-600">{stats?.ownerWallets || 0}</span>
              </div>
            </div>
          </div>
        </Card3D>

        <Card3D interactive={false}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              إحصائيات المعاملات
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">إجمالي المعاملات</span>
                <span className="font-bold text-gray-900">{stats?.totalTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">معاملات مكتملة</span>
                <span className="font-bold text-green-600">{stats?.completedTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">معاملات قيد الانتظار</span>
                <span className="font-bold text-yellow-600">{stats?.pendingTransactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">معدل النجاح</span>
                <span className="font-bold text-blue-600">
                  {stats?.totalTransactions > 0
                    ? Math.round((stats?.completedTransactions / stats?.totalTransactions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">متوسط المعاملة</span>
                <span className="font-bold text-purple-600">
                  {stats?.totalTransactions > 0
                    ? Math.round((stats?.totalDeposits + stats?.totalWithdrawals) / stats?.totalTransactions).toLocaleString('ar-SA')
                    : 0} ريال
                </span>
              </div>
            </div>
          </div>
        </Card3D>
      </div>

      <Card3D interactive={false}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            التدفق المالي
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">صافي التدفق</p>
              <p className="text-2xl font-bold text-green-600">
                +{((stats?.totalDeposits || 0) - (stats?.totalWithdrawals || 0)).toLocaleString('ar-SA')} ريال
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">نسبة الإيداعات</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.totalDeposits > 0
                  ? Math.round((stats?.totalDeposits / (stats?.totalDeposits + stats?.totalWithdrawals)) * 100)
                  : 0}%
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">نسبة السحوبات</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.totalWithdrawals > 0
                  ? Math.round((stats?.totalWithdrawals / (stats?.totalDeposits + stats?.totalWithdrawals)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </Card3D>
      </div>
    </div>
  );
}
