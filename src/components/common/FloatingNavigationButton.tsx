import React from 'react';
import { Globe } from 'lucide-react';

interface FloatingNavigationButtonProps {
  onNavigate: () => void;
  userType: 'investor' | 'farm-owner';
}

export function FloatingNavigationButton({ onNavigate, userType }: FloatingNavigationButtonProps) {
  const handleClick = () => {
    // حفظ نوع المستخدم قبل الانتقال
    sessionStorage.setItem('last_user_type', userType);
    onNavigate();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 group"
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {/* الخلفية الزجاجية الخضراء */}
      <div
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600/90 to-green-600/90
                   backdrop-blur-xl border-2 border-emerald-400/50 rounded-2xl
                   shadow-2xl shadow-emerald-500/30
                   transition-all duration-500
                   group-hover:from-emerald-500 group-hover:to-green-500
                   group-hover:border-emerald-300 group-hover:shadow-emerald-500/50
                   group-hover:scale-105
                   group-active:scale-95"
      >
        {/* التوهج المتحرك */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                     translate-x-[-200%] group-hover:translate-x-[200%]
                     transition-transform duration-1000"
        />

        {/* المحتوى */}
        <div className="relative flex items-center gap-3 px-6 py-4">
          <Globe className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-12 transition-transform" />
          <span className="font-black text-white text-base drop-shadow-lg whitespace-nowrap">
            🌍 استكشاف المنصة
          </span>
        </div>

        {/* الحافة المتوهجة الداخلية */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                     transition-opacity duration-300 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>

      {/* الهالة الخارجية */}
      <div
        className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl
                   opacity-0 group-hover:opacity-100 transition-opacity duration-500
                   pointer-events-none"
        style={{ transform: 'scale(1.2)' }}
      />
    </button>
  );
}
