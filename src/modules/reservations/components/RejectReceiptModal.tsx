import { useState } from 'react';
import { X, XCircle, AlertTriangle } from 'lucide-react';

interface RejectReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  receiptId: string;
  loading?: boolean;
}

export function RejectReceiptModal({
  isOpen,
  onClose,
  onConfirm,
  receiptId,
  loading = false
}: RejectReceiptModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const predefinedReasons = [
    'المبلغ غير صحيح',
    'الإيصال غير واضح',
    'معلومات ناقصة',
    'الإيصال مزور',
    'التاريخ غير صحيح',
    'تم الاستخدام مسبقاً'
  ];

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('الرجاء إدخال سبب الرفض');
      return;
    }

    try {
      setError('');
      await onConfirm(reason);
      setReason('');
      onClose();
    } catch (err) {
      setError('حدث خطأ أثناء رفض الإيصال');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReason('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

        {/* Header */}
        <div className="relative p-6 pb-4" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' }}>
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all disabled:opacity-50"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">رفض الإيصال</h2>
              <p className="text-white/80 text-sm mt-1">الرجاء تحديد سبب رفض هذا الإيصال</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-amber-900">تحذير</p>
              <p className="text-sm text-amber-700 mt-1">
                سيتم إرسال إشعار للمستثمر بسبب الرفض. تأكد من دقة السبب المُدخل.
              </p>
            </div>
          </div>

          {/* Predefined Reasons */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              أسباب جاهزة (اختياري)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedReasons.map((preReason) => (
                <button
                  key={preReason}
                  onClick={() => setReason(preReason)}
                  disabled={loading}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 ${
                    reason === preReason
                      ? 'bg-red-100 text-red-700 border-2 border-red-300'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {preReason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              سبب الرفض <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              disabled={loading}
              placeholder="اكتب سبب رفض الإيصال بالتفصيل..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:ring-4 focus:ring-red-400/20 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
            />
            {error && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </p>
            )}
          </div>

          {/* Receipt ID */}
          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-500">رقم الإيصال</p>
            <p className="text-sm font-mono text-gray-700 mt-1 break-all">{receiptId}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: loading ? '#9CA3AF' : '#DC2626' }}
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الرفض...
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                تأكيد الرفض
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
