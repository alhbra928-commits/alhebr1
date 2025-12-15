import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  Ruler,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Wallet,
  FileText,
  Phone,
  TreePine
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';

interface FarmOwnerData {
  id: string;
  owner_full_name: string;
  owner_phone: string;
  farm_location: string;
  farm_area: number;
  farm_area_unit: string;
  farm_type: string;
  farm_price: number;
  bank_iban: string;
  payment_duration_days: number;
  farm_image_url?: string;
  approval_status: string;
  status: string;
  created_at: string;
}

interface OwnerDashboardModalProps {
  owner: FarmOwnerData;
  onClose: () => void;
}

interface DashboardStats {
  totalRevenue: number;
  totalInvestors: number;
  activeBookings: number;
  pendingPayments: number;
  completedBookings: number;
  totalTrees: number;
  availableTrees: number;
}

export function OwnerDashboardModal({ owner, onClose }: OwnerDashboardModalProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalInvestors: 0,
    activeBookings: 0,
    pendingPayments: 0,
    completedBookings: 0,
    totalTrees: 0,
    availableTrees: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [owner.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get financial data
      const { data: financeData } = await supabase
        .from('smart_farm_finances')
        .select('*')
        .eq('farm_owner_id', owner.id)
        .single();

      // Get bookings/reservations data
      const { data: bookingsData } = await supabase
        .from('reservations')
        .select('*, investors(*)')
        .eq('farm_owner_id', owner.id)
        .is('deleted_at', null);

      // Get payment receipts
      const { data: receiptsData } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('farm_owner_id', owner.id)
        .is('deleted_at', null);

      // Calculate stats
      const totalRevenue = financeData?.total_paid_to_farm_owner || 0;
      const totalInvestors = new Set(bookingsData?.map(b => b.investor_id)).size;
      const activeBookings = bookingsData?.filter(b => b.booking_status === 'active').length || 0;
      const completedBookings = bookingsData?.filter(b => b.booking_status === 'completed').length || 0;
      const pendingPayments = receiptsData?.filter(r => r.verification_status === 'pending').length || 0;

      setStats({
        totalRevenue,
        totalInvestors,
        activeBookings,
        pendingPayments,
        completedBookings,
        totalTrees: financeData?.total_trees || 0,
        availableTrees: financeData?.available_trees || 0
      });

      // Get recent bookings
      setRecentBookings(bookingsData?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: 'emerald', text: 'معتمد', icon: CheckCircle },
      pending: { color: 'amber', text: 'قيد المراجعة', icon: Clock },
      rejected: { color: 'red', text: 'مرفوض', icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-4 py-2 bg-${config.color}-50 border-2 border-${config.color}-200 rounded-xl`}>
        <Icon className={`h-5 w-5 text-${config.color}-600`} />
        <span className={`font-bold text-${config.color}-700`}>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl font-black text-emerald-600 shadow-xl">
              {owner.owner_full_name?.charAt(0) || '👤'}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-black mb-1">لوحة تحكم المزرعة</h2>
              <p className="text-emerald-100 font-bold text-lg">{owner.owner_full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600 font-bold">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Farm Info Section */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <TreePine className="h-7 w-7 text-emerald-600" />
                    معلومات المزرعة
                  </h3>
                  {getStatusBadge(owner.approval_status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm font-bold">الموقع</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">{owner.farm_location}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Ruler className="h-5 w-5" />
                      <span className="text-sm font-bold">المساحة</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">
                      {owner.farm_area} {owner.farm_area_unit}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm font-bold">السعر</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">{formatPrice(owner.farm_price)}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm font-bold">مدة السداد</span>
                    </div>
                    <p className="text-lg font-black text-gray-900">{owner.payment_duration_days} يوم</p>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="mt-4 bg-white rounded-xl p-4 border-2 border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-bold">رقم الآيبان</span>
                  </div>
                  <p className="text-lg font-mono font-black text-gray-900" dir="ltr">{owner.bank_iban}</p>
                </div>

                {/* Contact Info */}
                <div className="mt-4 bg-white rounded-xl p-4 border-2 border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Phone className="h-5 w-5" />
                    <span className="text-sm font-bold">رقم الجوال</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900" dir="ltr">{owner.owner_phone}</p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="h-10 w-10" />
                    <TrendingUp className="h-6 w-6 text-emerald-200" />
                  </div>
                  <p className="text-emerald-100 text-sm font-bold mb-1">إجمالي الإيرادات</p>
                  <p className="text-3xl font-black">
                    <AnimatedCounter value={stats.totalRevenue} duration={1500} />
                    <span className="text-xl mr-1">ر.س</span>
                  </p>
                </div>

                {/* Total Investors */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="h-10 w-10" />
                    <TrendingUp className="h-6 w-6 text-blue-200" />
                  </div>
                  <p className="text-blue-100 text-sm font-bold mb-1">عدد المستثمرين</p>
                  <p className="text-3xl font-black">
                    <AnimatedCounter value={stats.totalInvestors} duration={1500} />
                  </p>
                </div>

                {/* Active Bookings */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <Calendar className="h-10 w-10" />
                    <Clock className="h-6 w-6 text-amber-200" />
                  </div>
                  <p className="text-amber-100 text-sm font-bold mb-1">الحجوزات النشطة</p>
                  <p className="text-3xl font-black">
                    <AnimatedCounter value={stats.activeBookings} duration={1500} />
                  </p>
                </div>

                {/* Completed Bookings */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="h-10 w-10" />
                    <BarChart3 className="h-6 w-6 text-purple-200" />
                  </div>
                  <p className="text-purple-100 text-sm font-bold mb-1">الحجوزات المكتملة</p>
                  <p className="text-3xl font-black">
                    <AnimatedCounter value={stats.completedBookings} duration={1500} />
                  </p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 border-2 border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600">إجمالي الأشجار</p>
                      <p className="text-2xl font-black text-gray-900">
                        <AnimatedCounter value={stats.totalTrees} duration={1500} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TreePine className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600">الأشجار المتاحة</p>
                      <p className="text-2xl font-black text-gray-900">
                        <AnimatedCounter value={stats.availableTrees} duration={1500} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-amber-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-600">مدفوعات قيد المراجعة</p>
                      <p className="text-2xl font-black text-gray-900">
                        <AnimatedCounter value={stats.pendingPayments} duration={1500} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border-2 border-gray-200">
                <div className="p-6 border-b-2 border-gray-200">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-emerald-600" />
                    أحدث الحجوزات
                  </h3>
                </div>
                <div className="p-6">
                  {recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                      <p className="font-bold">لا توجد حجوزات بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentBookings.map((booking, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border-2 border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black">
                              {booking.investors?.full_name?.charAt(0) || '؟'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{booking.investors?.full_name || 'مستثمر'}</p>
                              <p className="text-sm text-gray-600">{booking.reserved_trees || 0} شجرة</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-black text-emerald-600">{formatPrice(booking.total_price || 0)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(booking.created_at).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t-2 border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600 font-bold">
            تاريخ الإضافة: {new Date(owner.created_at).toLocaleDateString('ar-SA', { dateStyle: 'long' })}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
