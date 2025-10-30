import { useState, useEffect } from 'react';
import { Crown, Building2, Shield, ArrowRight } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
  onBackToAdmin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin, onBackToAdmin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const hasAdminSession = localStorage.getItem('adminUser') !== null;
      setIsLoggedIn(hasAdminSession);
    };

    checkLoginStatus();
    // Check every second for login status changes
    const interval = setInterval(checkLoginStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Debug on mount - TIMESTAMP: 1761842000
  console.log('🔄 AdminCrownButton v3 FINAL - 1761842000', {
    onAdminLogin: !!onAdminLogin,
    onFarmOwnerLogin: !!onFarmOwnerLogin,
    timestamp: new Date().toISOString()
  });

  const handleAdminClick = () => {
    console.log('🎯 Admin clicked - v2');
    setShowMenu(false);
    if (onAdminLogin) {
      onAdminLogin();
    } else {
      alert('⚠️ Cache issue! Press Ctrl+Shift+Delete and clear cache, then Ctrl+F5');
    }
  };

  const handleFarmOwnerClick = () => {
    console.log('🎯 Farm Owner clicked - v2');
    setShowMenu(false);
    if (onFarmOwnerLogin) {
      onFarmOwnerLogin();
    } else {
      alert('⚠️ Cache issue! Press Ctrl+Shift+Delete and clear cache, then Ctrl+F5');
    }
  };

  const handleBackToAdmin = () => {
    console.log('🎯 Back to Admin clicked');
    setShowMenu(false);
    if (onBackToAdmin) {
      onBackToAdmin();
    }
  };

  // If logged in, show "Back to Admin" button instead
  if (isLoggedIn && onBackToAdmin) {
    return (
      <button
        onClick={handleBackToAdmin}
        className="fixed bottom-28 left-4 sm:bottom-32 sm:left-6 z-[60] group touch-manipulation active:scale-90 transition-all duration-300"
        aria-label="العودة للوحة الإدارة"
      >
        <div className="relative">
          {/* Glow Effect */}
          <div
            className="absolute inset-0 rounded-full blur-xl animate-pulse-slow"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
            }}
          />

          {/* Button */}
          <div
            className="relative px-4 py-3 sm:px-5 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)',
            }}
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            <span className="text-sm sm:text-base font-bold text-white hidden sm:inline">
              لوحة الإدارة
            </span>
          </div>

          {/* Sparkle Effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-300 rounded-full animate-ping" />
        </div>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-28 left-4 sm:bottom-32 sm:left-6 z-[60] group touch-manipulation active:scale-90 transition-all duration-300 w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full"
      aria-label="دخول الإدارة"
    >
      <div
        className="absolute inset-0 rounded-full animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
          animation: 'pulse-glow 3s ease-in-out infinite',
        }}
      />

      <div
        className="relative w-full h-full rounded-full flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          boxShadow: '0 8px 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        <Crown
          className="h-7 w-7 sm:h-8 sm:w-8 text-white drop-shadow-lg transform transition-transform duration-300 group-hover:scale-125"
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
        className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full animate-ping"
        style={{
          background: '#10b981',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.8)',
        }}
      />

      {/* Tooltip on hover when menu is closed */}
      {!showMenu && (
        <div
          className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none text-xs sm:text-sm"
          style={{
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          دخول لوحات التحكم
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent"
            style={{
              borderTopColor: 'rgba(16, 185, 129, 0.95)',
            }}
          />
        </div>
      )}

      {/* Popup Menu */}
      {showMenu && (
        <div
          className="absolute bottom-full left-0 mb-4 w-72 sm:w-64 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden transition-all duration-300 transform origin-bottom-left"
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.2)',
            animation: 'slideUp 0.3s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-3 sm:px-4 py-2.5 sm:py-3 text-center border-b"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderBottomColor: 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="rgba(255, 255, 255, 0.3)" />
              <span className="text-white font-black text-base sm:text-lg">لوحات التحكم</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {/* Farm Owner Option */}
            <button
              onClick={handleFarmOwnerClick}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group/item"
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
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                }}
              >
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-base sm:text-lg font-black text-gray-900">لوحة المزرعة</div>
                <div className="text-[10px] sm:text-xs text-gray-600">إدارة مزرعتك</div>
              </div>
            </button>

            {/* Admin Option */}
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group/item mt-2"
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
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover/item:scale-110"
                style={{
                  background: brandGradients.gold,
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                }}
              >
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-base sm:text-lg font-black text-gray-900">لوحة الإدارة</div>
                <div className="text-[10px] sm:text-xs text-gray-600">إدارة النظام الكامل</div>
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
