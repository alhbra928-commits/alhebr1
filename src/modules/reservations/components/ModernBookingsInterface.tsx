import React, { useState, useEffect } from 'react';
import { BookingsService } from '../bookingsService';
import { ArrowRight, Calendar, CheckCircle, Clock, XCircle, Search, Filter, Loader2, Check, AlertCircle, Trash2, FileText, Eye, User, TreeDeciduous, DollarSign, Phone } from 'lucide-react';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface ModernBookingsInterfaceProps {
  onBack: () => void;
}

export function ModernBookingsInterface({ onBack }: ModernBookingsInterfaceProps) {
  const { isAdmin, canEdit, canDelete } = usePermissions();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Action States - واضحة جداً
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  const showProcessing = (message: string) => {
    setIsProcessing(true);
    setProcessingMessage(message);
  };

  const showSuccess = (message: string) => {
    setIsProcessing(false);
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 4000);
  };

  const showError = (message: string) => {
    setIsProcessing(false);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const handleApprove = async (bookingId: string) => {
    showProcessing('جاري اعتماد الحجز...');

    try {
      await BookingsService.approve(bookingId);
      await loadData();
      showSuccess('تم اعتماد الحجز بنجاح!\nتم نقل الحجز إلى قسم "المقبولة"');
      setSelectedBooking(null);
    } catch (err: any) {
      showError('فشل اعتماد الحجز!\n' + (err.message || 'حدث خطأ غير متوقع'));
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا الحجز؟')) return;

    showProcessing('جاري رفض الحجز...');

    try {
      await BookingsService.reject(bookingId);
      await loadData();
      showSuccess('تم رفض الحجز\nتم نقل الحجز إلى قسم "المرفوضة"');
      setSelectedBooking(null);
    } catch (err: any) {
      showError('فشل رفض الحجز!\n' + (err.message || 'حدث خطأ غير متوقع'));
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا الحجز نهائياً؟\n\nلا يمكن التراجع عن هذا الإجراء!')) return;

    showProcessing('جاري حذف الحجز...');

    try {
      await BookingsService.deletePermanently(bookingId);
      await loadData();
      showSuccess('تم حذف الحجز نهائياً\nتم إزالة الحجز من النظام');
      setSelectedBooking(null);
    } catch (err: any) {
      showError('فشل حذف الحجز!\n' + (err.message || 'حدث خطأ غير متوقع'));
    }
  };

  const handleIssueCertificate = async (bookingId: string) => {
    showProcessing('جاري إصدار الشهادة...');

    try {
      await BookingsService.issueCertificate(bookingId);
      await loadData();
      showSuccess('تم إصدار الشهادة بنجاح!\nتم نقل الحجز إلى قسم "الموثقة"');
      setSelectedBooking(null);
    } catch (err: any) {
      showError('فشل إصدار الشهادة!\n' + (err.message || 'حدث خطأ غير متوقع'));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-800', badge: 'bg-amber-100' },
      approved: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', badge: 'bg-emerald-100' },
      documented: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-800', badge: 'bg-purple-100' },
      rejected: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', badge: 'bg-red-100' }
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'بانتظار المراجعة',
      approved: 'معتمد',
      documented: 'موثّق',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-xl font-bold">جاري تحميل الحجوزات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6" dir="rtl">
      {/* Processing Modal - شاشة المعالجة الضخمة */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 animate-in zoom-in">
            <Loader2 className="w-24 h-24 animate-spin text-blue-600 mx-auto mb-6" />
            <p className="text-3xl font-black text-center text-slate-800 mb-3">{processingMessage}</p>
            <p className="text-center text-slate-500 text-lg">الرجاء الانتظار...</p>
            <div className="mt-6 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - شاشة النجاح الضخمة */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 border-4 border-green-500 animate-in zoom-in">
            <div className="bg-green-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-16 h-16 text-white" strokeWidth={4} />
            </div>
            <p className="text-3xl font-black text-center text-green-800 mb-4 whitespace-pre-line">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-xl font-bold text-xl hover:bg-green-700 transition-all"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Error Modal - شاشة الخطأ الضخمة */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 border-4 border-red-500 animate-in zoom-in">
            <div className="bg-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <XCircle className="w-16 h-16 text-white" strokeWidth={4} />
            </div>
            <p className="text-3xl font-black text-center text-red-800 mb-4 whitespace-pre-line">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full mt-6 px-6 py-4 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-slate-700 hover:text-slate-900 font-bold"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-lg">رجوع</span>
            </button>
            <h1 className="text-4xl font-black text-slate-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              إدارة الحجوزات
            </h1>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
            <Calendar className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-blue-100 text-sm mb-1">إجمالي الحجوزات</p>
            <p className="text-4xl font-black">{stats.total || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
            <Clock className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-amber-100 text-sm mb-1">قيد المراجعة</p>
            <p className="text-4xl font-black">{stats.pending || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
            <CheckCircle className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-green-100 text-sm mb-1">المعتمدة</p>
            <p className="text-4xl font-black">{stats.approved || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 shadow-xl text-white transform hover:scale-105 transition-all">
            <FileText className="w-10 h-10 mb-3 opacity-80" />
            <p className="text-purple-100 text-sm mb-1">الموثقة</p>
            <p className="text-4xl font-black">{stats.documented || 0}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث بالاسم، رقم الحجز، أو رقم الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg font-bold bg-white"
            >
              <option value="all">جميع الحجوزات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">معتمدة</option>
              <option value="documented">موثقة</option>
              <option value="rejected">مرفوضة</option>
            </select>
          </div>
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const statusColor = getStatusColor(booking.booking_status);

            return (
              <div
                key={booking.id}
                className={`${statusColor.bg} ${statusColor.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1`}
              >
                {/* Booking Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 mb-1">{booking.booking_code}</h3>
                    <p className="text-sm text-slate-600 font-medium">{booking.farm_name || 'مزرعة'}</p>
                  </div>
                  <span className={`${statusColor.badge} ${statusColor.text} px-4 py-2 rounded-xl text-sm font-black`}>
                    {getStatusLabel(booking.booking_status)}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">المستثمر</p>
                      <p className="font-bold text-slate-800">{booking.investor_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">رقم الجوال</p>
                      <p className="font-bold text-slate-800">{booking.investor_mobile}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <TreeDeciduous className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">الأشجار</p>
                        <p className="font-bold text-slate-800">{booking.reserved_trees}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-slate-500" />
                      <div>
                        <p className="text-xs text-slate-500">المبلغ</p>
                        <p className="font-bold text-green-600">{booking.total_price?.toLocaleString('ar-SA')} ر.س</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4 border-t-2 border-white">
                  <button
                    onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Eye className="w-5 h-5" />
                    {selectedBooking?.id === booking.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                  </button>

                  {selectedBooking?.id === booking.id && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      {booking.booking_status === 'pending' && hasEditPermission && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md"
                          >
                            <CheckCircle className="w-5 h-5" />
                            اعتماد
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md"
                          >
                            <XCircle className="w-5 h-5" />
                            رفض
                          </button>
                        </div>
                      )}

                      {booking.booking_status === 'approved' && hasEditPermission && (
                        <button
                          onClick={() => handleIssueCertificate(booking.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-violet-700 transition-all shadow-md"
                        >
                          <FileText className="w-5 h-5" />
                          إصدار الشهادة
                        </button>
                      )}

                      {(booking.booking_status === 'pending' || booking.booking_status === 'rejected') && hasDeletePermission && (
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md"
                        >
                          <Trash2 className="w-5 h-5" />
                          حذف نهائياً
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <AlertCircle className="w-20 h-20 text-slate-400 mx-auto mb-4" />
            <p className="text-2xl font-bold text-slate-600">لا توجد حجوزات</p>
            <p className="text-slate-500 mt-2">جرب تغيير معايير البحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
