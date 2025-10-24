import { CheckCircle, LogIn } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface SessionTerminatedMessageProps {
  onLoginAgain: () => void;
}

export function SessionTerminatedMessage({ onLoginAgain }: SessionTerminatedMessageProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#2E2A26] via-[#3D5B4B] to-[#2E2A26]">
      <div className="w-full max-w-lg animate-fade-in px-6">
        <div
          className="rounded-3xl p-10 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
            border: `3px solid ${brandColors.primary.gold}`,
          }}
        >
          <div className="mb-8 flex justify-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full animate-bounce-slow"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
          </div>

          <h1
            className="mb-3 text-center text-3xl font-black"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ✅ تم إنهاء الجلسة بنجاح
          </h1>

          <p
            className="mb-8 text-center text-lg font-bold leading-relaxed"
            style={{ color: brandColors.text.secondary }}
          >
            تم إغلاق جلستك الإدارية بأمان
            <br />
            <span className="text-base">يمكنك تسجيل الدخول مجددًا في أي وقت</span>
          </p>

          <div
            className="mb-8 rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(196, 148, 31, 0.1) 100%)',
              border: `2px solid ${brandColors.primary.gold}40`,
            }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: brandGradients.gold }}
                >
                  ✓
                </div>
                <p className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                  تم حفظ جميع التغييرات
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: brandGradients.gold }}
                >
                  ✓
                </div>
                <p className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                  تم تسجيل عملية الخروج في السجل
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                  style={{ background: brandGradients.gold }}
                >
                  ✓
                </div>
                <p className="text-sm font-bold" style={{ color: brandColors.text.primary }}>
                  تم إغلاق الجلسة بأمان
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onLoginAgain}
            className="group w-full rounded-xl py-4 font-black text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: brandGradients.gold,
              boxShadow: `0 8px 32px ${brandColors.primary.gold}60`,
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              <span>تسجيل دخول مجدداً</span>
            </div>
          </button>

          <p
            className="mt-4 text-center text-xs"
            style={{ color: brandColors.text.secondary }}
          >
            شكراً لاستخدامك منصة النخيل والزيتون الإدارية 🌴
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
