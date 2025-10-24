import { AlertTriangle, LogOut, X } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface LogoutConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmationModal({ onConfirm, onCancel }: LogoutConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md animate-scale-in rounded-3xl p-8 shadow-2xl"
        style={{ background: 'white' }}
      >
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
            }}
          >
            <AlertTriangle className="h-10 w-10" style={{ color: '#EF4444' }} />
          </div>
        </div>

        <h2
          className="mb-2 text-center text-2xl font-black"
          style={{ color: brandColors.text.primary }}
        >
          ⚠️ تأكيد الخروج
        </h2>

        <p
          className="mb-6 text-center text-base font-bold leading-relaxed"
          style={{ color: brandColors.text.secondary }}
        >
          هل ترغب بالخروج من لوحة الإدارة؟
          <br />
          <span className="text-sm">سيتم إغلاق جلستك الحالية وإنهاء جميع الأنشطة</span>
        </p>

        <div
          className="mb-6 rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '2px dashed rgba(239, 68, 68, 0.3)',
          }}
        >
          <p className="text-center text-sm font-bold" style={{ color: '#DC2626' }}>
            📌 ملاحظة: سيُطلب منك تسجيل الدخول مرة أخرى
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="group flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)',
            }}
          >
            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <span>✅ نعم، خروج</span>
          </button>

          <button
            onClick={onCancel}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 font-black transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(107, 114, 128, 0.1)',
              color: brandColors.text.primary,
              border: `2px solid ${brandColors.text.secondary}40`,
            }}
          >
            <X className="h-5 w-5" />
            <span>❌ إلغاء</span>
          </button>
        </div>

        <p
          className="mt-4 text-center text-xs"
          style={{ color: brandColors.text.secondary }}
        >
          للعودة للمنصة دون خروج، استخدم زر "🌍 استكشاف المنصة"
        </p>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
