import React, { useEffect } from 'react';
import { Menu, MapPin, Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function MobileHeader({ onMenuClick, title = 'لوحة التحكم' }: MobileHeaderProps) {
  useEffect(() => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isIOS) return;

    console.log('🍎 iOS ULTIMATE FIX - Pure CSS Sticky (no JS intervention)');

    // Just log - let CSS handle everything
    // The sticky position + locked body approach should work
    // If this doesn't work, user needs to try it on real device first
  }, []);

  return (
    <>
      <style>{`
        /* iOS Safari ULTIMATE STICKY Solution */
        @supports (-webkit-touch-callout: none) {
          /* Lock body, make main content scrollable */
          html, body {
            height: 100% !important;
            height: -webkit-fill-available !important;
            overflow: hidden !important;
            position: relative !important;
          }

          /* Header stays absolute at top */
          .ios-sticky-header {
            position: sticky !important;
            position: -webkit-sticky !important;
            top: 0 !important;
            z-index: 9999 !important;

            /* Hardware acceleration */
            -webkit-transform: translate3d(0, 0, 0) !important;
            transform: translate3d(0, 0, 0) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            will-change: transform !important;

            /* Prevent any touch interference */
            touch-action: pan-y !important;
          }

          /* Content scrollable area */
          .ios-scroll-content {
            height: 100vh !important;
            height: -webkit-fill-available !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior: none !important;
          }
        }

        /* Non-iOS normal behavior */
        .ios-sticky-header {
          position: fixed;
          top: 0;
          z-index: 30;
        }
      `}</style>

      <header className="ios-sticky-header lg:hidden left-0 right-0 bg-gradient-to-r from-amber-900 to-orange-900 text-white shadow-lg safe-area-top">
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
