import React, { useEffect } from 'react';
import { Menu, MapPin, Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function MobileHeader({ onMenuClick, title = 'لوحة التحكم' }: MobileHeaderProps) {
  // تم إلغاء الكود القديم - نستخدم الآن inline styles مباشرة

  return (
    <>

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          paddingTop: 'max(8px, env(safe-area-inset-top))',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitTransform: 'translate3d(0, 0, 0)',
          transform: 'translate3d(0, 0, 0)',
          WebkitPerspective: 1000,
          perspective: 1000,
          willChange: 'transform',
          isolation: 'isolate',
          pointerEvents: 'auto'
        }}
        className="lg:hidden bg-gradient-to-r from-amber-900 to-orange-900 text-white shadow-lg"
      >
        <div className="flex items-center justify-between">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all btn-touch"
          aria-label="القائمة"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Title & Logo */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-base font-bold truncate">{title}</h1>
        </div>

        {/* Notifications */}
        <button
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all btn-touch relative"
          aria-label="الإشعارات"
        >
          <Bell className="h-5 w-5" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </div>
    </>
  );
}
