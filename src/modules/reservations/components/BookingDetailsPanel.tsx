import { useState, useEffect } from 'react';
import { X, MapPin, User, Phone, Mail, Calendar, TreeDeciduous, DollarSign, CheckCircle, XCircle, Trash2, FileText, Clock, Eye, AlertCircle, Check } from 'lucide-react';
import { PaymentReceiptService } from '../../investor/services/paymentReceiptService';
import { RejectReceiptModal } from './RejectReceiptModal';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface BookingDetailsPanelProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDelete?: (bookingId: string) => void;
  onIssueCertificate?: (bookingId: string) => void;
}

export function BookingDetailsPanel({
  booking,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onIssueCertificate
}: BookingDetailsPanelProps) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [receiptToReject, setReceiptToReject] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const { hasPermission, isAdmin } = usePermissions();

  const canEdit = isAdmin || hasPermission('reservations', 'edit');
  const canDelete = isAdmin || hasPermission('reservations', 'delete');
  const canCreate = isAdmin || hasPermission('reservations', 'create');

  console.log('🔍 [BookingDetailsPanel] Permissions Check:');
  console.log('  isAdmin:', isAdmin);
  console.log('  canEdit:', canEdit);
  console.log('  canDelete:', canDelete);
  console.log('  canCreate:', canCreate);

  useEffect(() => {
    if (isOpen && booking?.id) {
      loadReceipts();
    }
  }, [isOpen, booking?.id]);

  const loadReceipts = async () => {
    try {
      setLoadingReceipts(true);
      const data = await PaymentReceiptService.getReceiptsByReservation(booking.id);
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleVerifyReceipt = async (receiptId: string) => {
    try {
      setLoadingReceipts(true);
      console.log('🔄 جاري اعتماد الإيصال:', receiptId);

      await PaymentReceiptService.verifyReceipt(receiptId, 'admin', 'تم التحقق من الإيصال');

      console.log('✅ تم اعتماد الإيصال بنجاح');

      await loadReceipts();

      alert('✅ تم اعتماد الإيصال بنجاح');
    } catch (error) {
      console.error('❌ Error verifying receipt:', error);
      alert('❌ حدث خطأ أثناء اعتماد الإيصال\n\n' + (error as any).message);
    } finally {
      setLoadingReceipts(false);
    }
  };

  const openRejectModal = (receiptId: string) => {
    setReceiptToReject(receiptId);
    setShowRejectModal(true);
  };

  const handleRejectReceipt = async (reason: string) => {
    if (!receiptToReject) return;

    try {
      setRejectLoading(true);
      console.log('🔄 جاري رفض الإيصال:', receiptToReject);

      await PaymentReceiptService.rejectReceipt(receiptToReject, 'admin', reason);

      console.log('✅ تم رفض الإيصال بنجاح');

      await loadReceipts();

      setSuccessMessage(`✅ تم رفض الإيصال بنجاح!\n\nالسبب: ${reason}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('❌ Error rejecting receipt:', error);
      alert('❌ حدث خطأ أثناء رفض الإيصال\n\n' + (error as any).message);
    } finally {
      setRejectLoading(false);
    }
  };

  const handlePreviewReceipt = async (receipt: any) => {
    try {
      setLoadingReceipts(true);
      console.log('📥 Loading full receipt for preview:', receipt.id);

      // Load full receipt with actual URL (not base64 stub)
      const fullReceipt = await PaymentReceiptService.getReceiptById(receipt.id);

      if (fullReceipt) {
        console.log('✅ Full receipt loaded');
        setSelectedReceipt(fullReceipt);
        setShowReceiptPreview(true);
      } else {
        alert('❌ لم يتم العثور على الإيصال');
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      alert('❌ حدث خطأ أثناء تحميل الإيصال');
    } finally {
      setLoadingReceipts(false);
    }
  };

  if (!isOpen || !booking) return null;

  const getStatusLabel = (status: string) => {
    const labels: any = {
      pending: 'بانتظار المراجعة',
      approved: 'معتمد',
      documented: 'موثّق',
      rejected: 'مرفوض'
    };
    return labels[status] || status;
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

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#F59E0B',
      approved: '#10B981',
      documented: '#8B5CF6',
      rejected: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const timelineSteps = [
    {
      label: 'إنشاء الحجز',
      date: booking.booking_date,
      completed: true,
      icon: CheckCircle,
      color: '#10B981'
    },
    {
      label: 'المراجعة والاعتماد',
      date: booking.approved_at,
      completed: booking.booking_status !== 'pending',
      icon: booking.booking_status === 'rejected' ? XCircle : CheckCircle,
      color: booking.booking_status === 'rejected' ? '#EF4444' : booking.booking_status !== 'pending' ? '#10B981' : '#9CA3AF'
    },
    {
      label: 'التوثيق وإصدار الشهادة',
      date: booking.documented_at,
      completed: booking.booking_status === 'documented',
      icon: FileText,
      color: booking.booking_status === 'documented' ? '#8B5CF6' : '#9CA3AF'
    }
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        style={{ backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      <div
        className="fixed top-0 left-0 h-full bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-500"
        style={{
          width: '100%',
          maxWidth: '600px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
        dir="rtl"
      >
        <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black" style={{ color: '#C89B3C' }}>
              تفاصيل الحجز
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, #F9F8F6, #E8E6E1)',
              border: '2px solid #C89B3C30'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black" style={{ color: '#C89B3C' }}>
                {booking.booking_code}
              </h3>
              <div
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{
                  background: `${getStatusColor(booking.booking_status)}20`,
                  color: getStatusColor(booking.booking_status),
                  border: `2px solid ${getStatusColor(booking.booking_status)}40`
                }}
              >
                {getStatusLabel(booking.booking_status)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: '#3D5B4B' }}>
              <MapPin className="h-6 w-6" style={{ color: '#C89B3C' }} />
              بيانات المزرعة
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">اسم المزرعة</p>
                <p className="font-bold text-gray-800">{booking.farm_name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">كود المزرعة</p>
                <p className="font-bold text-gray-800">{booking.farm_code || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: '#3D5B4B' }}>
              <User className="h-6 w-6" style={{ color: '#C89B3C' }} />
              بيانات المستثمر
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">الاسم الكامل</p>
                  <p className="font-bold text-gray-800">{booking.investor_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">رقم الجوال</p>
                  <p className="font-bold text-gray-800" dir="ltr">+966{booking.investor_mobile}</p>
                </div>
              </div>
              {booking.investor_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p className="font-bold text-gray-800">{booking.investor_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: '#3D5B4B' }}>
              <TreeDeciduous className="h-6 w-6" style={{ color: '#C89B3C' }} />
              تفاصيل الحجز
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">تاريخ الحجز</p>
                    <p className="font-bold text-gray-800">
                      {new Date(booking.booking_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TreeDeciduous className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">عدد الأشجار</p>
                    <p className="font-bold text-gray-800">{booking.reserved_trees}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                    <p className="font-bold text-green-600 text-xl">
                      {booking.total_price?.toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: '#FEF3C720',
                  border: '2px solid #F59E0B30'
                }}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-500">حالة الدفع</p>
                    <p className="font-bold" style={{ color: '#F59E0B' }}>
                      {getPaymentStatusLabel(booking.payment_status)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: '#3D5B4B' }}>
              <Clock className="h-6 w-6" style={{ color: '#C89B3C' }} />
              المسار الزمني
            </h3>
            <div className="space-y-6">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: step.completed ? step.color : '#E5E7EB',
                        border: `3px solid ${step.completed ? step.color : '#9CA3AF'}`
                      }}
                    >
                      <step.icon
                        className="h-5 w-5"
                        style={{ color: step.completed ? 'white' : '#9CA3AF' }}
                      />
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className="w-0.5 h-12"
                        style={{
                          background: step.completed ? step.color : '#E5E7EB'
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className="font-bold mb-1"
                      style={{ color: step.completed ? step.color : '#9CA3AF' }}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-500">
                        {new Date(step.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* قسم إيصالات السداد */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: '#3D5B4B' }}>
              <FileText className="h-6 w-6" style={{ color: '#C89B3C' }} />
              إيصالات السداد ({receipts.length})
            </h3>

            {loadingReceipts ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-[#C89B3C] mx-auto"></div>
                <p className="text-gray-500 mt-3">جاري التحميل...</p>
              </div>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-bold">لا توجد إيصالات سداد مرفوعة</p>
                <p className="text-gray-400 text-sm mt-1">في انتظار المستثمر لرفع إيصال السداد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="border-2 rounded-xl p-4 hover:shadow-lg transition-all"
                    style={{
                      borderColor: receipt.status === 'verified' ? '#10B981' :
                                   receipt.status === 'rejected' ? '#EF4444' : '#F59E0B',
                      background: receipt.status === 'verified' ? '#10B98110' :
                                 receipt.status === 'rejected' ? '#EF444410' : '#F59E0B10'
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background: receipt.status === 'verified' ? '#10B981' :
                                         receipt.status === 'rejected' ? '#EF4444' : '#F59E0B',
                              color: 'white'
                            }}
                          >
                            {receipt.status === 'verified' ? '✅ معتمد' :
                             receipt.status === 'rejected' ? '❌ مرفوض' : '⏳ بانتظار المراجعة'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">البنك</p>
                            <p className="font-bold text-gray-800">{receipt.bank_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">المبلغ</p>
                            <p className="font-bold text-green-600">
                              {receipt.amount?.toLocaleString('ar-SA')} ريال
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">تاريخ التحويل</p>
                            <p className="font-bold text-gray-800">
                              {new Date(receipt.transfer_date).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">تاريخ الرفع</p>
                            <p className="font-bold text-gray-800">
                              {new Date(receipt.created_at).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>

                        {receipt.notes && (
                          <div className="pt-2 border-t">
                            <p className="text-gray-500 text-xs">ملاحظات</p>
                            <p className="text-gray-700 text-sm">{receipt.notes}</p>
                          </div>
                        )}

                        {receipt.verification_notes && (
                          <div className="pt-2 border-t">
                            <p className="text-gray-500 text-xs">ملاحظات المراجعة</p>
                            <p className="text-gray-700 text-sm">{receipt.verification_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handlePreviewReceipt(receipt)}
                          disabled={loadingReceipts}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-wait"
                          title="معاينة الإيصال"
                        >
                          {loadingReceipts ? (
                            <div className="h-5 w-5 border-2 border-gray-300 border-t-[#C89B3C] rounded-full animate-spin" />
                          ) : (
                            <Eye className="h-5 w-5" style={{ color: '#C89B3C' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {receipt.status === 'pending' && canEdit && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <button
                          onClick={() => {
                            if (confirm('هل تريد اعتماد هذا الإيصال؟')) {
                              handleVerifyReceipt(receipt.id);
                            }
                          }}
                          disabled={loadingReceipts}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: '#10B981' }}
                        >
                          {loadingReceipts ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {loadingReceipts ? 'جاري المعالجة...' : 'اعتماد'}
                        </button>
                        <button
                          onClick={() => openRejectModal(receipt.id)}
                          disabled={loadingReceipts}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: '#EF4444' }}
                        >
                          <XCircle className="h-4 w-4" />
                          رفض
                        </button>
                      </div>
                    )}

                    {receipt.status === 'verified' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border-2 border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-bold text-green-800">تم اعتماد الإيصال</p>
                            {receipt.verified_at && (
                              <p className="text-xs text-green-600">
                                {new Date(receipt.verified_at).toLocaleDateString('ar-SA')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {receipt.status === 'rejected' && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border-2 border-red-200">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div className="flex-1">
                            <p className="font-bold text-red-800">تم رفض الإيصال</p>
                            {receipt.verification_notes && (
                              <p className="text-sm text-red-600 mt-1">
                                السبب: {receipt.verification_notes}
                              </p>
                            )}
                            {receipt.verified_at && (
                              <p className="text-xs text-red-600 mt-1">
                                {new Date(receipt.verified_at).toLocaleDateString('ar-SA')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pb-8">
            {booking.booking_status === 'pending' && (
              <>
                {onApprove && canEdit && (
                  <button
                    onClick={() => {
                      if (confirm(`هل تريد اعتماد الحجز ${booking.booking_code}؟`)) {
                        onApprove(booking.id);
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105"
                    style={{ background: '#10B981' }}
                  >
                    <CheckCircle className="h-6 w-6" />
                    اعتماد الحجز
                  </button>
                )}
                {onReject && canEdit && (
                  <button
                    onClick={() => {
                      if (confirm(`هل تريد رفض الحجز ${booking.booking_code}؟`)) {
                        onReject(booking.id);
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
                    style={{ background: '#EF4444' }}
                  >
                    <XCircle className="h-5 w-5" />
                    رفض الحجز
                  </button>
                )}
              </>
            )}

            {booking.booking_status === 'approved' && onIssueCertificate && canCreate && (
              <button
                onClick={() => {
                  if (confirm(`🪪 إصدار شهادة تملك للحجز ${booking.booking_code}\n\nسيتم:\n• نقل الحجز إلى إدارة التوثيق\n• إنشاء شهادة تملك رقمية\n• إرسال إشعار للمستثمر\n\nهل تريد المتابعة؟`)) {
                    onIssueCertificate(booking.id);
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-black text-xl text-white transition-all hover:scale-110 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #C89B3C, #D4AF37)' }}
              >
                <FileText className="h-6 w-6" />
                نقل إلى التوثيق وإصدار الشهادة
              </button>
            )}

            {(booking.booking_status === 'pending' || booking.booking_status === 'rejected') && onDelete && canDelete && (
              <button
                onClick={() => {
                  if (confirm(`هل تريد حذف الحجز ${booking.booking_code} نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
                    onDelete(booking.id);
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#6B7280' }}
              >
                <Trash2 className="h-5 w-5" />
                حذف الحجز
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showReceiptPreview && selectedReceipt && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-[60] transition-opacity duration-300"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={() => setShowReceiptPreview(false)}
          />

          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden"
            style={{
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh'
            }}
            dir="rtl"
          >
            <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: '#C89B3C' }}>
                    معاينة إيصال السداد
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedReceipt.bank_name} • {selectedReceipt.amount.toLocaleString('ar-SA')} ريال
                  </p>
                </div>
                <button
                  onClick={() => setShowReceiptPreview(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {selectedReceipt.receipt_file_url.endsWith('.pdf') ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-2xl p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-bold mb-4">ملف PDF</p>
                    <a
                      href={selectedReceipt.receipt_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                      style={{ background: '#C89B3C' }}
                    >
                      <Eye className="h-5 w-5" />
                      فتح في نافذة جديدة
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={selectedReceipt.receipt_file_url}
                    alt="إيصال السداد"
                    className="w-full h-auto rounded-2xl border-2 border-gray-200 shadow-lg"
                    style={{ maxHeight: '70vh', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">البنك</p>
                    <p className="font-bold text-gray-800">{selectedReceipt.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">المبلغ</p>
                    <p className="font-bold text-green-600 text-lg">
                      {selectedReceipt.amount.toLocaleString('ar-SA')} ريال
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ التحويل</p>
                    <p className="font-bold text-gray-800">
                      {new Date(selectedReceipt.transfer_date).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحالة</p>
                    <p
                      className="font-bold"
                      style={{
                        color: selectedReceipt.status === 'verified' ? '#10B981' :
                               selectedReceipt.status === 'rejected' ? '#EF4444' : '#F59E0B'
                      }}
                    >
                      {selectedReceipt.status === 'verified' ? '✅ معتمد' :
                       selectedReceipt.status === 'rejected' ? '❌ مرفوض' : '⏳ بانتظار المراجعة'}
                    </p>
                  </div>
                </div>

                {selectedReceipt.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500">ملاحظات المستثمر</p>
                    <p className="text-gray-700 mt-1">{selectedReceipt.notes}</p>
                  </div>
                )}
              </div>

              {selectedReceipt.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      if (confirm('هل تريد اعتماد هذا الإيصال؟')) {
                        handleVerifyReceipt(selectedReceipt.id);
                        setShowReceiptPreview(false);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105"
                    style={{ background: '#10B981' }}
                  >
                    <CheckCircle className="h-6 w-6" />
                    اعتماد الإيصال
                  </button>
                  <button
                    onClick={() => {
                      handleRejectReceipt(selectedReceipt.id);
                      setShowReceiptPreview(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105"
                    style={{ background: '#EF4444' }}
                  >
                    <XCircle className="h-6 w-6" />
                    رفض الإيصال
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top duration-300">
          <div className="px-6 py-4 rounded-2xl bg-green-500 text-white shadow-2xl flex items-center gap-3 max-w-md">
            <CheckCircle className="h-6 w-6 flex-shrink-0" />
            <p className="font-bold whitespace-pre-line">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <RejectReceiptModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectReceipt}
        receiptId={receiptToReject || ''}
        loading={rejectLoading}
      />
    </>
  );
}
