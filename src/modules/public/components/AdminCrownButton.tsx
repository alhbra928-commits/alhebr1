import { useState } from 'react';
import { Crown } from 'lucide-react';

interface AdminCrownButtonProps {
  onAdminLogin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function AdminCrownButton({ onAdminLogin, onFarmOwnerLogin }: AdminCrownButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleAdminClick = () => {
    setShowMenu(false);
    if (onAdminLogin) {
      onAdminLogin();
    }
  };

  const handleFarmOwnerClick = () => {
    setShowMenu(false);
    if (onFarmOwnerLogin) {
      onFarmOwnerLogin();
    }
  };

  return (
    <>
      {/* Crown Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-full shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        style={{
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,215,0,0.3)',
        }}
      >
        <Crown className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMenu(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Menu Content */}
          <div className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 min-w-[200px]">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-center">
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
