import React, { useState, useEffect } from 'react';
import { BookingsService } from '../bookingsService';
import { ArrowRight, Calendar, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';
import { BookingCard3D } from './BookingCard3D';
import { BookingDetailsPanel } from './BookingDetailsPanel';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface AdvancedBookingsViewProps {
  onBack: () => void;
}

export function AdvancedBookingsView({ onBack }: AdvancedBookingsViewProps) {
  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const hasCreatePermission = isAdmin || canCreate('reservations');
  const hasEditPermission = isAdmin || canEdit('reservations');
  const hasDeletePermission = isAdmin || canDelete('reservations');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [bookingsResult, statsResult] = await Promise.all([
        BookingsService.getAll(),
        BookingsService.getStatistics()
      ]);

      setBookings(bookingsResult?.data || []);
      setStats(statsResult || {});
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.investor_mobile?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailsPanel(true);
  };

  const handleApprove = async (booking: any) => {
    try {
      await BookingsService.approve(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error approving:', err);
      alert('حدث خطأ أثناء قبول الحجز');
    }
  };

  const handleReject = async (booking: any) => {
    try {
      await BookingsService.reject(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('حدث خطأ أثناء رفض الحجز');
    }
  };

  const handleDelete = async (booking: any) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;

    try {
      await BookingsService.deletePermanently(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('حدث خطأ أثناء حذف الحجز');
    }
  };

  const handleIssueCertificate = async (booking: any) => {
    try {
      await BookingsService.issueCertificate(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error issuing certificate:', err);
      alert('حدث خطأ أثناء إصدار الشهادة');
    }
  };

  const groupedBookings = {
    pending: filteredBookings.filter(b => b.booking_status === 'pending'),
    approved: filteredBookings.filter(b => b.booking_status === 'approved'),
    documented: filteredBookings.filter(b => b.booking_status === 'documented'),
    rejected: filteredBookings.filter(b => b.booking_status === 'rejected'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">جاري تحميل الحجوزات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-600 hover:text-slate-900"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </button>

            <h1 className="text-3xl font-bold text-slate-800">إدارة الحجوزات</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">الإجمالي</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">قيد المراجعة</p>
                <p className="text-2xl font-bold text-slate-800">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">مقبولة</p>
                <p className="text-2xl font-bold text-slate-800">{stats.approved || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">موثقة</p>
                <p className="text-2xl font-bold text-slate-800">{stats.documented || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="بحث بالاسم أو رقم الحجز أو الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pr-10 pl-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبولة</option>
                <option value="documented">موثقة</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Groups */}
        <div className="space-y-6">
          {/* Pending Bookings */}
          {groupedBookings.pending.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-slate-800">قيد المراجعة ({groupedBookings.pending.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Approved Bookings */}
          {groupedBookings.approved.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-800">مقبولة ({groupedBookings.approved.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedBookings.approved.map((booking) => (
                  <BookingCard3D
                    key={booking.id}
                    booking={booking}
                    onViewDetails={handleViewDetails}
                    onIssueCertificate={hasEditPermission ? handleIssueCertificate : undefined}
                    onDelete={hasDeletePermission ? handleDelete : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Documented Bookings */}
          {groupedBookings.documented.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-slate-800">موثقة ({groupedBookings.documented.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Rejected Bookings */}
          {groupedBookings.rejected.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-800">مرفوضة ({groupedBookings.rejected.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">لا توجد حجوزات</p>
              {(searchTerm || statusFilter !== 'all') && (
                <p className="text-slate-500 text-sm mt-2">جرب تعديل البحث أو الفلتر</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      {showDetailsPanel && selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsPanel(false);
            setSelectedBooking(null);
          }}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
