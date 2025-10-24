import { Calendar, User, DollarSign, TreeDeciduous, Eye, CheckCircle, XCircle, Trash2, FileText, Clock } from 'lucide-react';

interface BookingCard3DProps {
  booking: any;
  onViewDetails: (booking: any) => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDelete?: (bookingId: string) => void;
  onIssueCertificate?: (bookingId: string) => void;
}

export function BookingCard3D({
  booking,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
  onIssueCertificate
}: BookingCard3DProps) {
  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
      approved: { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
      documented: { bg: '#E9D5FF', text: '#6B21A8', border: '#C084FC' },
      rejected: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }
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

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      partial: { bg: '#DBEAFE', text: '#1E40AF' },
      completed: { bg: '#D1FAE5', text: '#065F46' },
      refunded: { bg: '#FEE2E2', text: '#991B1B' }
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'معلق',
      partial: 'جزئي',
      completed: 'مكتمل',
      refunded: 'مسترد'
    };
    return labels[status] || status;
  };

  const statusColor = getStatusColor(booking.booking_status);
  const paymentColor = getPaymentStatusColor(booking.payment_status);

  return (
    <div
      className="group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: `2px solid ${statusColor.border}`
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${statusColor.border}, ${statusColor.bg})` }}
      />

      <div className="flex items-start justify-between mb-4 mt-2">
        <div>
          <h3 className="text-2xl font-black mb-1" style={{ color: '#C89B3C' }}>
            {booking.booking_code}
          </h3>
          <p className="text-sm text-gray-600">{booking.farm_name || 'مزرعة'}</p>
        </div>
        <div
          className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{
            background: statusColor.bg,
            color: statusColor.text,
            border: `2px solid ${statusColor.border}`
          }}
        >
          {getStatusLabel(booking.booking_status)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">المستثمر</p>
            <p className="font-bold text-gray-800">{booking.investor_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">تاريخ الحجز</p>
            <p className="font-bold text-gray-800">
              {new Date(booking.booking_date).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TreeDeciduous className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">عدد الأشجار</p>
            <p className="font-bold text-gray-800">{booking.reserved_trees}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">المبلغ الإجمالي</p>
            <p className="font-bold text-green-600">
              {booking.total_price?.toLocaleString('ar-SA')} ريال
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{
            background: paymentColor.bg,
            border: `1px solid ${paymentColor.text}30`
          }}
        >
          <Clock className="h-4 w-4" style={{ color: paymentColor.text }} />
          <span className="text-sm font-bold" style={{ color: paymentColor.text }}>
            الدفع: {getPaymentStatusLabel(booking.payment_status)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-4 pt-4 border-t-2 border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(booking);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
          style={{ background: '#3B82F6' }}
        >
          <Eye className="h-5 w-5" />
          عرض التفاصيل
        </button>

        {booking.booking_status === 'pending' && (
          <div className="flex gap-2">
            {onApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(booking.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#10B981' }}
              >
                <CheckCircle className="h-4 w-4" />
                اعتماد
              </button>
            )}
            {onReject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(booking.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#EF4444' }}
              >
                <XCircle className="h-4 w-4" />
                رفض
              </button>
            )}
          </div>
        )}

        {booking.booking_status === 'approved' && onIssueCertificate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIssueCertificate(booking.id);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white transition-all hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #C89B3C, #D4AF37)' }}
          >
            <FileText className="h-5 w-5" />
            إصدار الشهادة
          </button>
        )}

        {(booking.booking_status === 'pending' || booking.booking_status === 'rejected') && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(booking.id);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: '#6B7280' }}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        )}
      </div>
    </div>
  );
}
