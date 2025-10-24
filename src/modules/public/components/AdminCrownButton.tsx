import { Crown } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin }: AdminCrownButtonProps) {
  return (
    <button
      onClick={onAdminLogin}
      className="fixed bottom-6 right-6 z-50 group touch-manipulation active:scale-90 transition-all duration-300"
      style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
      }}
      aria-label="دخول الإدارة"
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
      />

      <div
        className="relative w-full h-full rounded-full flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
        style={{
          background: brandGradients.gold,
          boxShadow: '0 8px 40px rgba(212, 175, 55, 0.6), 0 0 60px rgba(212, 175, 55, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <Crown
          className="h-9 w-9 text-white drop-shadow-lg transform transition-transform duration-300 group-hover:scale-125"
          strokeWidth={2.5}
          fill="rgba(255, 255, 255, 0.3)"
        />

        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent)',
          }}
        />
      </div>

      <div
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping"
        style={{
          background: brandColors.primary.gold,
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
        }}
      />

      <div
        className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none"
        style={{
          background: 'rgba(46, 42, 38, 0.95)',
          backdropFilter: 'blur(10px)',
          color: brandColors.primary.gold,
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        دخول الإدارة
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent"
          style={{
            borderTopColor: 'rgba(46, 42, 38, 0.95)',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.1;
          }
        }

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

        .animate-pulse-slow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </button>
  );
}
