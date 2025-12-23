import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (tapCount > 0 && tapCount < 5) {
      const timer = setTimeout(() => {
        setTapCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  const handleAdminClick = () => {
    setShowMenu(false);
    setTapCount(0);
    if (onAdminLogin) {
      onAdminLogin();
    }
  };

  const handleFarmOwnerClick = () => {
    setShowMenu(false);
    setTapCount(0);
    if (onFarmOwnerLogin) {
      onFarmOwnerLogin();
    }
  };

  const handleCrownClick = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount === 5) {
      setShowMenu(true);
    }
  };

  return (
    <>
      {/* Crown Button - Bottom Left - يحتاج 5 طقات */}
      <button
        onClick={handleCrownClick}
        className="fixed bottom-24 left-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:scale-125 hover:rotate-12 active:scale-110 group"
        style={{
          zIndex: 10001,
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(217, 119, 6, 0.3)',
          boxShadow: tapCount > 0
            ? `0 0 ${20 + tapCount * 10}px rgba(245, 158, 11, ${0.4 + tapCount * 0.1}), 0 10px 25px rgba(245, 158, 11, 0.5)`
            : '0 0 20px rgba(245, 158, 11, 0.4), 0 10px 25px rgba(245, 158, 11, 0.3)',
          animation: tapCount > 0 ? 'pulse 0.5s ease-in-out' : 'none',
        }}
        title={tapCount > 0 ? `${tapCount}/5 طقات` : 'تسجيل الدخول - 5 طقات'}
      >
        <Crown
          className="w-8 h-8 text-white transition-all duration-300 group-hover:w-9 group-hover:h-9"
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            transform: tapCount > 0 ? `scale(${1 + tapCount * 0.1})` : 'scale(1)',
          }}
        />

        {tapCount > 0 && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-amber-200">
            <span className="text-sm font-bold text-amber-600">{tapCount}/5</span>
          </div>
        )}
      </button>

      {/* Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => {
              setShowMenu(false);
              setTapCount(0);
            }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 10000 }}
          />

          {/* Menu Content */}
          <div className="fixed bottom-40 left-6 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 min-w-[200px]" style={{ zIndex: 10001 }}>
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-center">
              <Crown className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-bold text-sm">تسجيل الدخول</p>
            </div>

            <div className="p-2">
              <button
                onClick={handleAdminClick}
                className="w-full text-right px-4 py-3 hover:bg-emerald-50 rounded-lg transition-colors text-gray-700 font-semibold"
              >
                👑 لوحة الإدارة
              </button>

              <button
                onClick={handleFarmOwnerClick}
                className="w-full text-right px-4 py-3 hover:bg-emerald-50 rounded-lg transition-colors text-gray-700 font-semibold"
              >
                🌾 صاحب مزرعة
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
