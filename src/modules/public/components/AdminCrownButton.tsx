import { useState, useEffect } from 'react';
import { Crown, Shield } from 'lucide-react';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const handleAdminClick = () => {
    setShowMenu(false);
    setExpanded(false);
    if (onAdminLogin) {
      onAdminLogin();
    }
  };

  const handleFarmOwnerClick = () => {
    setShowMenu(false);
    setExpanded(false);
    if (onFarmOwnerLogin) {
      onFarmOwnerLogin();
    }
  };

  const handleDotClick = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleDesktopClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {/* Desktop Version - Clear and Prominent */}
      {isDesktop ? (
        <button
          onClick={handleDesktopClick}
          className="fixed top-6 left-6 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:shadow-amber-500/50 hover:scale-105 group"
          style={{
            zIndex: 999999,
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 10px 40px rgba(251, 191, 36, 0.4), 0 0 60px rgba(251, 191, 36, 0.2)',
          }}
          title="تسجيل الدخول"
        >
          <Crown className="w-7 h-7 text-white group-hover:rotate-12 transition-transform drop-shadow-lg" />
          <div className="flex flex-col items-start">
            <span className="text-white font-bold text-lg leading-tight drop-shadow-md">لوحة التحكم</span>
            <span className="text-amber-100 text-xs font-semibold">تسجيل الدخول</span>
          </div>
        </button>
      ) : (
        /* Mobile Version - Hidden Dot */
        <button
          onClick={handleDotClick}
          className={`fixed bottom-24 left-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
            expanded
              ? 'w-14 h-14 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 hover:shadow-emerald-500/50 hover:scale-110'
              : 'w-3 h-3 bg-gradient-to-br from-red-600 via-red-500 to-red-600 opacity-80 hover:opacity-100 hover:scale-150 animate-pulse'
          }`}
          style={{
            zIndex: 10001,
            backdropFilter: 'blur(10px)',
            border: expanded ? '2px solid rgba(16,185,129,0.3)' : 'none',
            boxShadow: expanded
              ? '0 10px 25px rgba(16,185,129,0.4)'
              : '0 0 15px rgba(239, 68, 68, 0.6), 0 0 30px rgba(239, 68, 68, 0.4)',
          }}
          title="تسجيل الدخول"
        >
          {expanded && (
            <Crown className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
          )}
        </button>
      )}

      {/* Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => {
              setShowMenu(false);
              setExpanded(false);
            }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 999998 }}
          />

          {/* Menu Content */}
          <div
            className={`fixed bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200 min-w-[280px] ${
              isDesktop ? 'top-24 left-6' : 'bottom-40 left-6'
            }`}
            style={{ zIndex: 999999 }}
          >
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-5 text-center">
              <Crown className="w-10 h-10 text-white mx-auto mb-3 drop-shadow-lg" />
              <p className="text-white font-bold text-lg drop-shadow-md">اختر نوع الحساب</p>
            </div>

            <div className="p-3">
              <button
                onClick={handleAdminClick}
                className="w-full text-right px-5 py-4 hover:bg-amber-50 rounded-xl transition-all text-gray-800 font-bold text-base mb-2 flex items-center gap-3 group border-2 border-transparent hover:border-amber-200"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-bold text-amber-900">لوحة الإدارة</span>
                  <span className="text-xs text-gray-500">إدارة كاملة للمنصة</span>
                </div>
              </button>

              <button
                onClick={handleFarmOwnerClick}
                className="w-full text-right px-5 py-4 hover:bg-green-50 rounded-xl transition-all text-gray-800 font-bold text-base flex items-center gap-3 group border-2 border-transparent hover:border-green-200"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-bold text-green-900">صاحب مزرعة</span>
                  <span className="text-xs text-gray-500">إدارة مزارعك</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
