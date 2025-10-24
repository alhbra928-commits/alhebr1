import { useState } from 'react';
import { Crown, Building2, Shield } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAdminClick = () => {
    setShowMenu(false);
    onAdminLogin?.();
  };

  const handleFarmOwnerClick = () => {
    setShowMenu(false);
    onFarmOwnerLogin?.();
  };

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
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

      {/* Tooltip on hover when menu is closed */}
      {!showMenu && (
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
          دخول لوحات التحكم
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent"
            style={{
              borderTopColor: 'rgba(46, 42, 38, 0.95)',
            }}
          />
        </div>
      )}

      {/* Popup Menu */}
      {showMenu && (
        <div
          className="absolute bottom-full right-0 mb-4 w-64 rounded-2xl overflow-hidden transition-all duration-300 transform origin-bottom-right"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2)',
            animation: 'slideUp 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-4 py-3 text-center border-b"
            style={{
              background: brandGradients.gold,
              borderBottomColor: 'rgba(212, 175, 55, 0.3)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-white" fill="rgba(255, 255, 255, 0.3)" />
              <span className="text-white font-black text-lg">لوحات التحكم</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* Farm Owner Option */}
            <button
              onClick={handleFarmOwnerClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 group/item"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                }}
              >
                <Building2 className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-lg font-black text-gray-900">لوحة المزرعة</div>
                <div className="text-xs text-gray-600">إدارة مزرعتك</div>
              </div>
            </button>

            {/* Admin Option */}
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 group/item mt-2"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(180, 140, 30, 0.1))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(180, 140, 30, 0.2))';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(180, 140, 30, 0.1))';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-lg font-black text-gray-900">لوحة الإدارة</div>
                <div className="text-xs text-gray-600">إدارة النظام الكامل</div>
              </div>
            </button>
          </div>
        </div>
      )}

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

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
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

    {/* Overlay to close menu when clicking outside */}
    {showMenu && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowMenu(false)}
      />
    )}
    </>
  );
}
