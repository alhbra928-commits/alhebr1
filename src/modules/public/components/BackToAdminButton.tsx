import { useState, useEffect } from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface BackToAdminButtonProps {
  onBackToAdmin?: () => void;
}

export function BackToAdminButton({ onBackToAdmin }: BackToAdminButtonProps) {
  const [hasAdminSession, setHasAdminSession] = useState(false);

  useEffect(() => {
    // التحقق من وجود جلسة إدارة نشطة
    const checkAdminSession = () => {
      const adminSession = localStorage.getItem('admin-session');
      const sessionData = adminSession ? JSON.parse(adminSession) : null;

      if (sessionData && sessionData.username) {
        setHasAdminSession(true);
      } else {
        setHasAdminSession(false);
      }
    };

    checkAdminSession();

    // التحقق بشكل دوري
    const interval = setInterval(checkAdminSession, 2000);

    // الاستماع لتغييرات localStorage
    const handleStorageChange = () => {
      checkAdminSession();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // لا تظهر الزر إذا لم تكن هناك جلسة نشطة
  if (!hasAdminSession) {
    return null;
  }

  return (
    <button
      onClick={onBackToAdmin}
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 group touch-manipulation active:scale-90 transition-all duration-300"
      aria-label="العودة للوحة الإدارة"
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl transform transition-all duration-500 group-hover:scale-105"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2)',
          border: '2px solid transparent',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), ${brandGradients.gold}`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        {/* Icon Container */}
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110"
          style={{
            background: brandGradients.gold,
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
          }}
        >
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2.5} />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1.5">
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              style={{ color: brandColors.primary.gold }}
              strokeWidth={2.5}
            />
            <span
              className="text-sm sm:text-base font-black whitespace-nowrap"
              style={{ color: brandColors.text.primary }}
            >
              لوحة الإدارة
            </span>
          </div>
          <span className="text-[10px] sm:text-xs" style={{ color: brandColors.text.tertiary }}>
            العودة للتحكم
          </span>
        </div>

        {/* Animated indicator */}
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
          style={{
            background: brandColors.primary.gold,
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
          }}
        />

        {/* Hover glow effect */}
        <div
          className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(160, 145, 106, 0.1))',
          }}
        />
      </div>

      <style>{`
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </button>
  );
}
