import { useState, useEffect } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../services/adminSessionService';

interface IdleSessionWarningProps {
  onContinue: () => void;
  onLogout: () => void;
}

export function IdleSessionWarning({ onContinue, onLogout }: IdleSessionWarningProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeout = async () => {
    const { token } = AdminSessionService.getCurrentSession();
    if (token) {
      await AdminSessionService.terminateSession(token);
    }
    onLogout();
  };

  const handleContinue = () => {
    const { token } = AdminSessionService.getCurrentSession();
    if (token) {
      AdminSessionService.updateActivity(token);
    }
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md animate-scale-in rounded-3xl p-8 shadow-2xl"
        style={{
          background: 'white',
        }}
      >
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full animate-pulse"
            style={{ background: 'rgba(251, 191, 36, 0.2)' }}
          >
            <AlertCircle className="h-10 w-10" style={{ color: '#F59E0B' }} />
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-black" style={{ color: brandColors.text.primary }}>
          جلستك خاملة!
        </h2>

        <p className="mb-6 text-center text-sm" style={{ color: brandColors.text.secondary }}>
          لم نسجل أي نشاط منذ 20 دقيقة. هل ترغب في الاستمرار؟
        </p>

        <div
          className="mb-6 rounded-2xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
            سيتم إنهاء الجلسة تلقائياً بعد
          </p>
          <p className="mt-2 text-4xl font-black" style={{ color: '#EF4444' }}>
            {countdown}
          </p>
          <p className="text-sm font-bold" style={{ color: '#DC2626' }}>
            ثانية
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all hover:scale-105"
            style={{ background: brandGradients.gold }}
          >
            <Check className="h-5 w-5" />
            <span>الاستمرار</span>
          </button>

          <button
            onClick={onLogout}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all hover:scale-105"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <X className="h-5 w-5" />
            <span>تسجيل خروج</span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: brandColors.text.secondary }}>
          لحماية حسابك، يتم إنهاء الجلسات الخاملة تلقائياً
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
