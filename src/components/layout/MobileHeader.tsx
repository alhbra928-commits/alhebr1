import React from 'react';
import { Menu, MapPin, Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function MobileHeader({ onMenuClick, title = 'لوحة التحكم' }: MobileHeaderProps) {
  return (
    <>
      <style>{`
        /* iOS Safari Header Fix */
        .ios-fixed-header {
          /* Force Hardware Acceleration for iOS */
          -webkit-transform: translateZ(0) !important;
          transform: translateZ(0) !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          -webkit-perspective: 1000 !important;
          perspective: 1000 !important;

          /* Prevent bounce scroll interference */
          -webkit-overflow-scrolling: touch !important;
          will-change: transform !important;

          /* Position as sticky on mobile for better iOS handling */
          position: -webkit-sticky !important;
          position: sticky !important;

          /* iOS Safe Area Support */
          padding-top: env(safe-area-inset-top) !important;
          padding-left: env(safe-area-inset-left) !important;
          padding-right: env(safe-area-inset-right) !important;
        }

        /* Force layer composition */
        .ios-fixed-header::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          transform: translateZ(-1px);
        }

        /* Smooth body scrolling for iOS */
        body {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      <header className="ios-fixed-header lg:hidden fixed top-0 left-0 right-0 z-30 bg-gradient-to-r from-amber-900 to-orange-900 text-white shadow-lg safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
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
    </header>
    </>
  );
}
