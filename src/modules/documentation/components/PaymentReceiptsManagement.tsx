import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Download, Loader, FileText, Calendar, DollarSign } from 'lucide-react';
import { PaymentReceiptService } from '../../investor/services/paymentReceiptService';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

export function PaymentReceiptsManagement() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await PaymentReceiptService.getPendingReceipts();
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedReceipt) return;

    try {
      setProcessing(true);
      await PaymentReceiptService.verifyReceipt(
        selectedReceipt.id,
        'admin-user-id',
        verificationNotes || 'تم التحقق من الإيصال بنجاح'
      );

      alert('✅ تم التحقق من الإيصال بنجاح!');
      setShowModal(false);
      setSelectedReceipt(null);
      setVerificationNotes('');
      loadReceipts();
    } catch (error) {
      console.error('Error verifying receipt:', error);
      alert('حدث خطأ أثناء التحقق');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt) return;
    if (!verificationNotes.trim()) {
      alert('الرجاء إدخال سبب الرفض');
      return;
    }

    try {
      setProcessing(true);
      await PaymentReceiptService.rejectReceipt(
        selectedReceipt.id,
        'admin-user-id',
        verificationNotes
      );

      alert('❌ تم رفض الإيصال');
      setShowModal(false);
      setSelectedReceipt(null);
      setVerificationNotes('');
      loadReceipts();
    } catch (error) {
      console.error('Error rejecting receipt:', error);
      alert('حدث خطأ أثناء الرفض');
    } finally {
      setProcessing(false);
    }
  };

  const openReceiptModal = (receipt: any) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin" style={{ color: brandColors.primary.gold }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black" style={{ color: brandColors.text.primary }}>
          📩 إيصالات السداد المعلقة
        </h2>
        <div
          className="px-4 py-2 rounded-xl font-bold"
          style={{
            background: brandGradients.gold,
            color: 'white'
          }}
        >
          {receipts.length} إيصال معلق
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: brandColors.text.secondary }} />
          <p className="text-xl" style={{ color: brandColors.text.secondary }}>
            لا توجد إيصالات معلقة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              className="rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-pointer"
              style={{
                background: 'white',
                border: `2px solid ${brandColors.primary.gold}30`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
              onClick={() => openReceiptModal(receipt)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black" style={{ color: brandColors.text.primary }}>
                  {receipt.reservations?.customer_name || 'مستثمر'}
                </h3>
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${PaymentReceiptService.getStatusColor(receipt.status)}20`,
                    color: PaymentReceiptService.getStatusColor(receipt.status)
                  }}
                >
                  {PaymentReceiptService.getStatusLabel(receipt.status)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                    المزرعة
                  </span>
                  <span className="font-bold text-sm" style={{ color: brandColors.text.primary }}>
                    {receipt.reservations?.farms?.name_ar || 'غير محدد'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                    البنك
                  </span>
                  <span className="font-bold text-sm" style={{ color: brandColors.text.primary }}>
                    {receipt.bank_name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                    المبلغ
                  </span>
                  <span className="font-black text-lg" style={{ color: brandColors.primary.gold }}>
                    {Number(receipt.amount).toLocaleString('ar-SA')} ر.س
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: brandColors.text.secondary }}>
                    تاريخ التحويل
                  </span>
                  <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                    {new Date(receipt.transfer_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              <button
                className="w-full mt-4 px-4 py-2 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
                }}
              >
                <Eye className="w-4 h-4 inline-block ml-2" />
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => {
            setShowModal(false);
            setSelectedReceipt(null);
            setVerificationNotes('');
          }}
        >
          <div
            className="w-full max-w-3xl rounded-3xl p-8 overflow-y-auto max-h-[90vh]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(212,175,55,0.05) 100%)',
              boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
              border: `2px solid ${brandColors.primary.gold}40`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-black mb-6" style={{ color: brandColors.text.primary }}>
              تفاصيل الإيصال البنكي
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    اسم المستثمر
                  </label>
                  <p className="font-bold text-lg" style={{ color: brandColors.text.primary }}>
                    {selectedReceipt.reservations?.customer_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    رقم الهاتف
                  </label>
                  <p className="font-bold" style={{ color: brandColors.text.primary }}>
                    {selectedReceipt.reservations?.customer_phone}
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    المزرعة
                  </label>
                  <p className="font-bold" style={{ color: brandColors.text.primary }}>
                    {selectedReceipt.reservations?.farms?.name_ar}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    البنك
                  </label>
                  <p className="font-bold text-lg" style={{ color: brandColors.text.primary }}>
                    {selectedReceipt.bank_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    المبلغ المحول
                  </label>
                  <p className="font-black text-2xl" style={{ color: brandColors.primary.gold }}>
                    {Number(selectedReceipt.amount).toLocaleString('ar-SA')} ر.س
                  </p>
                </div>

                <div>
                  <label className="block text-sm mb-1" style={{ color: brandColors.text.secondary }}>
                    تاريخ التحويل
                  </label>
                  <p className="font-bold" style={{ color: brandColors.text.primary }}>
                    {new Date(selectedReceipt.transfer_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>

            {selectedReceipt.notes && (
              <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.1)' }}>
                <label className="block text-sm mb-2 font-bold" style={{ color: brandColors.text.primary }}>
                  ملاحظات المستثمر
                </label>
                <p style={{ color: brandColors.text.secondary }}>{selectedReceipt.notes}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm mb-2 font-bold" style={{ color: brandColors.text.primary }}>
                صورة الإيصال
              </label>
              <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: brandColors.primary.gold }}>
                <img
                  src={selectedReceipt.receipt_file_url}
                  alt="إيصال السداد"
                  className="w-full h-auto"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2 font-bold" style={{ color: brandColors.text.primary }}>
                ملاحظات الإدارة
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                style={{
                  borderColor: brandColors.primary.gold + '40',
                  background: 'white'
                }}
                placeholder="أي ملاحظات على الإيصال..."
                disabled={processing}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleVerify}
                disabled={processing}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: processing ? '#9ca3af' : '#10b981',
                  boxShadow: processing ? 'none' : '0 10px 40px rgba(16,185,129,0.3)',
                }}
              >
                {processing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    جارٍ المعالجة...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    تأكيد التحقق ✅
                  </>
                )}
              </button>

              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: processing ? '#9ca3af' : '#ef4444',
                  boxShadow: processing ? 'none' : '0 10px 40px rgba(239,68,68,0.3)',
                }}
              >
                <XCircle className="w-5 h-5" />
                رفض الإيصال ❌
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
