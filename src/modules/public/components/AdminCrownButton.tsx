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
      {/* Crown Button - Left Side - Green */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-24 left-6 w-14 h-14 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        style={{
          zIndex: 1001,
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(16,185,129,0.3)',
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: 1000 }}
          />

          {/* Menu Content */}
          <div className="fixed bottom-40 left-6 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 min-w-[200px]" style={{ zIndex: 1001 }}>
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
