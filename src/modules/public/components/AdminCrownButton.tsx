import { useState } from 'react';
import { Crown } from 'lucide-react';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  return (
    <>
      {/* Hidden Dot Button - Bottom Left */}
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

      {/* Menu */}
      {showMenu && expanded && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => {
              setShowMenu(false);
              setExpanded(false);
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
