import { useState, useRef } from 'react';
import { X, Upload, Calendar, DollarSign, Building2, FileText, Loader, CheckCircle2, XCircle } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface PaymentReceiptUploadModalProps {
  reservationId: string;
  reservationAmount: number;
  farmName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const saudiBanks = [
  'البنك الأهلي السعودي',
  'بنك الراجحي',
  'بنك الرياض',
  'بنك ساب',
  'البنك السعودي للاستثمار',
  'البنك السعودي الفرنسي',
  'البنك العربي الوطني',
  'بنك البلاد',
  'بنك الإنماء',
  'بنك الجزيرة',
  'مصرف الراجحي',
  'بنك آخر'
];

export function PaymentReceiptUploadModal({
  reservationId,
  reservationAmount,
  farmName,
  onClose,
  onSuccess
}: PaymentReceiptUploadModalProps) {
  const [bankName, setBankName] = useState('');
  const [amount, setAmount] = useState(reservationAmount.toString());
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يُسمح فقط بـ JPG, PNG, PDF');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async () => {
    if (!bankName) {
      setError('الرجاء اختيار اسم البنك');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError('الرجاء إدخال المبلغ المحول');
      return;
    }

    if (!transferDate) {
      setError('الرجاء اختيار تاريخ التحويل');
      return;
    }

    if (!selectedFile) {
      setError('الرجاء رفع صورة أو ملف PDF للإيصال');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setSuccess(false);

      // Prevent page unload during upload
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      try {
        // Step 1: Upload file to Supabase Storage
        setUploadStep('جاري رفع الملف...');
        setUploadProgress(20);

        const { PaymentReceiptService } = await import('../services/paymentReceiptService');

        console.log('📤 Starting file upload to storage...');
        const fileUrl = await PaymentReceiptService.uploadFileToStorage(selectedFile);
        console.log('✅ File uploaded to storage:', fileUrl);

        setUploadProgress(60);
        setUploadStep('جاري حفظ بيانات الإيصال...');

        // Step 2: Save receipt data to database
        await PaymentReceiptService.uploadReceipt({
          reservationId,
          investorId: null,
          bankName,
          amount: Number(amount),
          transferDate,
          receiptFileUrl: fileUrl,
          receiptFileName: selectedFile.name,
          notes: notes || undefined
        });

        setUploadProgress(100);
        setUploadStep('تم الرفع بنجاح!');
        setSuccess(true);
        setShowNotification(true);

        // Remove beforeunload listener
        window.removeEventListener('beforeunload', handleBeforeUnload);

        setTimeout(() => {
          setUploading(false);
        }, 800);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3500);
      } catch (err: any) {
        console.error('Upload error:', err);

        // Remove beforeunload listener
        window.removeEventListener('beforeunload', handleBeforeUnload);

        let errorMessage = 'حدث خطأ أثناء رفع الإيصال. الرجاء المحاولة مرة أخرى.';

        if (err.message?.includes('storage')) {
          errorMessage = 'فشل في رفع الملف. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
        } else if (err.message?.includes('database')) {
          errorMessage = 'فشل في حفظ البيانات. الرجاء المحاولة مرة أخرى.';
        }

        setError(errorMessage);
        setShowNotification(true);
        setUploading(false);
        setUploadProgress(0);
        setUploadStep('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('حدث خطأ أثناء رفع الإيصال. الرجاء المحاولة مرة أخرى.');
      setShowNotification(true);
      setUploading(false);
      setUploadProgress(0);
      setUploadStep('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-8 overflow-y-auto max-h-[90vh]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(212,175,55,0.05) 100%)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
          border: `2px solid ${brandColors.primary.gold}40`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black mb-2" style={{ color: brandColors.text.primary }}>
              📤 رفع إيصال السداد البنكي
            </h2>
            <p className="text-sm" style={{ color: brandColors.text.secondary }}>
              مزرعة {farmName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6" style={{ color: brandColors.text.secondary }} />
          </button>
        </div>

        {showNotification && success && (
          <div
            className="mb-6 p-6 rounded-2xl border-2 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)',
              borderColor: '#10b981',
              boxShadow: '0 12px 35px rgba(16,185,129,0.25)'
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: '#10b981' }}>
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <p className="text-green-800 font-black text-2xl mb-2">
                  ✅ تم إرسال الإيصال بنجاح!
                </p>
                <p className="text-green-700 text-base font-bold mb-3">
                  🎉 شكراً لك! تم استلام إيصالك بنجاح
                </p>
                <div className="space-y-2">
                  <p className="text-green-600 text-sm">
                    📩 سيتم مراجعة الإيصال من قبل الإدارة خلال 24 ساعة
                  </p>
                  <p className="text-green-600 text-sm">
                    🔔 سنُرسل لك إشعاراً فور اعتماد الإيصال
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showNotification && error && (
          <div
            className="mb-6 p-6 rounded-2xl border-2 animate-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)',
              borderColor: '#ef4444',
              boxShadow: '0 12px 35px rgba(239,68,68,0.25)'
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: '#ef4444' }}>
                <XCircle className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <p className="text-red-800 font-black text-2xl mb-2">
                  ❌ فشل إرسال الإيصال
                </p>
                <p className="text-red-700 text-base font-bold mb-3">
                  {error}
                </p>
                <p className="text-red-600 text-sm">
                  الرجاء المحاولة مرة أخرى أو التواصل مع الدعم الفني
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-bold" style={{ color: brandColors.text.primary }}>
              <Building2 className="w-5 h-5 inline-block ml-2" />
              اسم البنك
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d4af37] transition-colors"
              style={{
                borderColor: bankName ? brandColors.primary.gold : '#e5e7eb',
                background: 'white'
              }}
              disabled={uploading}
            >
              <option value="">اختر البنك</option>
              {saudiBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold" style={{ color: brandColors.text.primary }}>
              <DollarSign className="w-5 h-5 inline-block ml-2" />
              المبلغ المحول (ريال سعودي)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d4af37] transition-colors text-right"
              style={{
                borderColor: amount ? brandColors.primary.gold : '#e5e7eb',
                background: 'white'
              }}
              placeholder={reservationAmount.toLocaleString('ar-SA')}
              disabled={uploading}
            />
            <p className="text-xs mt-1" style={{ color: brandColors.text.secondary }}>
              المبلغ المطلوب: {reservationAmount.toLocaleString('ar-SA')} ر.س
            </p>
          </div>

          <div>
            <label className="block mb-2 font-bold" style={{ color: brandColors.text.primary }}>
              <Calendar className="w-5 h-5 inline-block ml-2" />
              تاريخ التحويل
            </label>
            <input
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d4af37] transition-colors"
              style={{
                borderColor: transferDate ? brandColors.primary.gold : '#e5e7eb',
                background: 'white'
              }}
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block mb-2 font-bold" style={{ color: brandColors.text.primary }}>
              <Upload className="w-5 h-5 inline-block ml-2" />
              مرفق الإيصال (صورة أو PDF)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-4 rounded-xl border-2 border-dashed transition-all hover:scale-[1.02]"
              style={{
                borderColor: selectedFile ? brandColors.primary.gold : '#e5e7eb',
                background: selectedFile ? 'rgba(212,175,55,0.05)' : 'white'
              }}
              disabled={uploading}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6" style={{ color: brandColors.primary.gold }} />
                  <span className="font-bold" style={{ color: brandColors.text.primary }}>
                    {selectedFile.name}
                  </span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: brandColors.text.secondary }} />
                  <p className="font-bold" style={{ color: brandColors.text.primary }}>
                    اضغط لاختيار الملف
                  </p>
                  <p className="text-xs mt-1" style={{ color: brandColors.text.secondary }}>
                    JPG, PNG أو PDF (حد أقصى 5 ميجابايت)
                  </p>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="block mb-2 font-bold" style={{ color: brandColors.text.primary }}>
              <FileText className="w-5 h-5 inline-block ml-2" />
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
              style={{
                borderColor: notes ? brandColors.primary.gold : '#e5e7eb',
                background: 'white'
              }}
              placeholder="أي ملاحظات إضافية..."
              disabled={uploading}
            />
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                {uploadStep}
              </span>
              <span className="text-sm font-bold" style={{ color: brandColors.primary.gold }}>
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{
                  width: `${uploadProgress}%`,
                  background: brandGradients.gold,
                  boxShadow: '0 2px 8px rgba(212,175,55,0.4)'
                }}
              />
            </div>
            <p className="text-xs text-center mt-2" style={{ color: brandColors.text.secondary }}>
              الرجاء عدم إغلاق الصفحة أو الضغط على زر الرجوع
            </p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 px-8 py-4 rounded-2xl font-black text-xl text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            style={{
              background: uploading ? '#9ca3af' : brandGradients.gold,
              boxShadow: uploading ? 'none' : '0 10px 40px rgba(212,175,55,0.3)',
            }}
          >
            {uploading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                جارٍ الرفع...
              </>
            ) : (
              <>
                تأكيد الإرسال 🚀
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={uploading}
            className="px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'white',
              color: brandColors.text.secondary,
              border: `2px solid ${brandColors.text.secondary}30`
            }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
