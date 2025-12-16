import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Wallet, TrendingUp, Edit, Ban, CheckCircle, Clock, Wifi } from 'lucide-react';
import { Card3D } from '../../../components/ui/Card3D';
import { BackButton } from '../../../components/common/BackButton';
import { InvestorsService } from '../investorsService';
import { useRealtimeTables } from '../../../lib/realtimeSync';

interface InvestorsViewProps {
  onBack?: () => void;
}

export function InvestorsView({ onBack }: InvestorsViewProps) {
  const [investors, setInvestors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestors();

    const unsubscribe = useRealtimeTables([
      {
        name: 'investors',
        callbacks: {
          onInsert: () => {
            console.log('🔄 New investor detected, reloading...');
            loadInvestors();
          },
          onUpdate: () => {
            console.log('🔄 Investor updated, reloading...');
            loadInvestors();
          },
          onDelete: () => {
            console.log('🔄 Investor deleted, reloading...');
            loadInvestors();
          }
        }
      },
      {
        name: 'reservations',
        callbacks: {
          onInsert: () => loadInvestors(),
          onUpdate: () => loadInvestors()
        }
      }
    ]);

    return () => unsubscribe();
  }, []);

  const loadInvestors = async () => {
    try {
      setLoading(true);
      const [investorsResult, statsData] = await Promise.all([
        InvestorsService.getAll(100, 0),
        InvestorsService.getStatistics()
      ]);
      setInvestors(investorsResult?.data || []);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      active: { label: 'نشط', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      suspended: { label: 'معلق', color: 'bg-red-100 text-red-700', icon: Ban },
      pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    };
    return statusMap[status] || statusMap.active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600"></div>
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#8B7355] mb-2">
              إدارة المستثمرين
            </h1>
            <p className="text-[#2C2C2C]/70">متابعة وإدارة حسابات المستثمرين</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <Wifi className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm font-bold text-green-600">مزامنة لحظية</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats?.total || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">إجمالي المستثمرين</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-green-700">{stats?.active || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">حسابات نشطة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-yellow-700">{stats?.pending || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">قيد المراجعة</h3>
            </div>
          </Card3D>

          <Card3D interactive={false}>
            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Ban className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-red-700">{stats?.suspended || 0}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">معلق</h3>
            </div>
          </Card3D>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {investors.map((investor) => {
            const statusInfo = getStatusInfo(investor.status);
            const StatusIcon = statusInfo.icon;
            const reservationsCount = investor.reservations?.[0]?.count || 0;
            const balance = investor.wallet?.[0]?.balance || 0;

            return (
              <Card3D key={investor.id} interactive={false}>
                <div className="p-6 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {investor.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{investor.full_name}</h3>
                        <p className="text-xs text-gray-500">#{investor.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-purple-600" />
                      <span>{investor.email || 'غير متوفر'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <span>{investor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span>{reservationsCount} حجز</span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-600">الرصيد</span>
                      </div>
                      <span className="text-lg font-bold text-green-700">
                        {balance.toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                      عرض الحجوزات
                    </button>
                    <button className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>
    </div>
  );
}
