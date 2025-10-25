import { useState, useEffect } from 'react';
import { BookingsService } from '../bookingsService';
import { ArrowRight, Calendar, Users, CheckCircle, Clock, DollarSign, Search, RefreshCw, Filter } from 'lucide-react';
import { BookingCard3D } from './BookingCard3D';
import { BookingDetailsPanel } from './BookingDetailsPanel';
import { whatsappIntegration } from '../../whatsapp/services/whatsappIntegration';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface AdvancedBookingsViewProps {
  onBack: () => void;
}

export function AdvancedBookingsView({ onBack }: AdvancedBookingsViewProps) {
  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  // حساب الصلاحيات للحجوزات
  const hasCreatePermission = canCreate('reservations');
  const hasEditPermission = canEdit('reservations');
  const hasDeletePermission = canDelete('reservations');

  console.log('🔍🔍🔍 [AdvancedBookingsView] ===================');
  console.log('🔍 [AdvancedBookingsView] Current User Info:');
  console.log('  - Admin Phone:', localStorage.getItem('admin_data') ? JSON.parse(localStorage.getItem('admin_data')).phone : 'N/A');
  console.log('  - Is Admin:', isAdmin);
  console.log('🔍 [AdvancedBookingsView] Permissions for "reservations":');
  console.log('  - Can Create:', hasCreatePermission);
  console.log('  - Can Edit:', hasEditPermission);
  console.log('  - Can Delete:', hasDeletePermission);
  console.log('🔍 [AdvancedBookingsView] Delete button will be:', hasDeletePermission ? '✅ SHOWN' : '❌ HIDDEN');
  console.log('🔍🔍🔍 [AdvancedBookingsView] ===================');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [bookingsResult, statsData] = await Promise.all([
        BookingsService.getAll(100, 0),
        BookingsService.getStatistics()
      ]);
      const bookingsData = bookingsResult?.data || [];
      setBookings(bookingsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.booking_code?.toLowerCase().includes(term) ||
        b.investor_name?.toLowerCase().includes(term) ||
        b.farm_name?.toLowerCase().includes(term) ||
        b.farm_code?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await BookingsService.updateStatus(bookingId, 'approved');

      // إرسال رسالة واتساب تلقائية
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && booking.customer_phone) {
        await whatsappIntegration.sendSafe(
          () => whatsappIntegration.notifyBookingApproved({
            id: booking.id,
            customer_name: booking.customer_name || 'عزيزي العميل',
            customer_phone: booking.customer_phone,
            farm_name: booking.farm_name || 'المزرعة',
            reserved_trees: booking.reserved_trees || 0,
            total_amount: booking.total_amount || 0
          }),
          'موافقة الحجز'
        );
      }

      await loadData();
      alert('✅ تم اعتماد الحجز بنجاح وإرسال إشعار الواتساب');
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('❌ حدث خطأ أثناء اعتماد الحجز');
    }
  };

  const handleReject = async (bookingId: string) => {
    try {
      await BookingsService.updateStatus(bookingId, 'rejected');
      await loadData();
      alert('❌ تم رفض الحجز');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('❌ حدث خطأ أثناء رفض الحجز');
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await BookingsService.delete(bookingId);
      await loadData();
      alert('🗑️ تم حذف الحجز');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('❌ حدث خطأ أثناء حذف الحجز');
    }
  };

  const handleIssueCertificate = async (bookingId: string) => {
    try {
      await BookingsService.migrateToDocumentation(bookingId);
      await loadData();
      alert('✅ تم إصدار الشهادة ونقل الحجز للتوثيق بنجاح!');
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      alert(`❌ ${error.message || 'حدث خطأ أثناء إصدار الشهادة'}`);
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailsPanel(true);
  };

  const groupedBookings = {
    pending: filteredBookings.filter(b => b.booking_status === 'pending'),
    approved: filteredBookings.filter(b => b.booking_status === 'approved'),
    documented: filteredBookings.filter(b => b.booking_status === 'documented'),
    rejected: filteredBookings.filter(b => b.booking_status === 'rejected')
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#E8E6E1]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#C89B3C] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold text-[#3D5B4B]">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8F6] to-[#E8E6E1] p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <ArrowRight className="h-5 w-5" />
          <span className="font-bold">العودة</span>
        </button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ color: '#3D5B4B' }}>
              إدارة الحجوزات المتقدمة
            </h1>
            <p className="text-gray-600">عرض وإدارة جميع حجوزات المستثمرين مع تفاعل ثلاثي الأبعاد</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`h-5 w-5 text-[#C89B3C] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-bold text-[#3D5B4B]">{refreshing ? 'جاري التحديث...' : 'تحديث'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            style={{ border: '2px solid #3B82F620' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
                <p className="text-2xl font-black text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            style={{ border: '2px solid #F59E0B20' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">بانتظار المراجعة</p>
                <p className="text-2xl font-black text-gray-900">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            style={{ border: '2px solid #10B98120' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">معتمدة</p>
                <p className="text-2xl font-black text-gray-900">{stats?.approved || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            style={{ border: '2px solid #8B5CF620' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">موثّقة</p>
                <p className="text-2xl font-black text-gray-900">{stats?.documented || 0}</p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
            style={{ border: '2px solid #10B98120' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المبالغ</p>
                <p className="text-xl font-black text-emerald-600">
                  {(stats?.total_amount || 0).toLocaleString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث برقم الحجز، اسم المستثمر، أو المزرعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C89B3C] focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-[#C89B3C] focus:outline-none transition-all font-bold"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">بانتظار المراجعة</option>
                <option value="approved">معتمدة</option>
                <option value="documented">موثّقة</option>
                <option value="rejected">مرفوضة</option>
              </select>

              <button
                onClick={loadData}
                className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#C89B3C' }}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {groupedBookings.pending.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <h2 className="text-2xl font-black text-gray-800">
                بانتظار المراجعة ({groupedBookings.pending.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.pending.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onApprove={hasEditPermission ? handleApprove : undefined}
                  onReject={hasEditPermission ? handleReject : undefined}
                  onDelete={hasDeletePermission ? handleDelete : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {groupedBookings.approved.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h2 className="text-2xl font-black text-gray-800">
                معتمدة - جاهزة للتوثيق ({groupedBookings.approved.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.approved.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onIssueCertificate={hasCreatePermission ? handleIssueCertificate : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {groupedBookings.documented.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h2 className="text-2xl font-black text-gray-800">
                موثّقة - تم إصدار الشهادات ({groupedBookings.documented.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.documented.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}

        {groupedBookings.rejected.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <h2 className="text-2xl font-black text-gray-800">
                مرفوضة ({groupedBookings.rejected.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.rejected.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onDelete={hasDeletePermission ? handleDelete : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <p className="text-xl text-gray-500 font-bold">
              {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج للبحث' : 'لا توجد حجوزات متاحة'}
            </p>
          </div>
        )}
      </div>

      <BookingDetailsPanel
        booking={selectedBooking}
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        onApprove={hasEditPermission ? handleApprove : undefined}
        onReject={hasEditPermission ? handleReject : undefined}
        onDelete={hasDeletePermission ? handleDelete : undefined}
        onIssueCertificate={hasCreatePermission ? handleIssueCertificate : undefined}
      />
    </div>
  );
}
