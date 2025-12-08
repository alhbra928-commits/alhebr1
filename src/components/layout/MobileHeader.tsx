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

    console.log('🔥 iOS NUCLEAR FIX - Absolute positioning with forced lock');

    const header = document.querySelector('.mobile-header-locked') as HTMLElement;
    if (!header) return;

    // Force lock the header position
    const lockHeaderPosition = () => {
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.left = '0';
      header.style.right = '0';
      header.style.transform = 'translate3d(0, 0, 0)';
      header.style.webkitTransform = 'translate3d(0, 0, 0)';
      header.style.zIndex = '9999';
    };

    // Lock immediately
    lockHeaderPosition();

    // Re-lock on any scroll event
    let rafId: number;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(lockHeaderPosition);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('touchmove', onScroll, { passive: true });

    // Re-lock every 100ms for extra safety
    const interval = setInterval(lockHeaderPosition, 100);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('touchmove', onScroll);
      clearInterval(interval);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <style>{`
        /* iOS NUCLEAR Solution - Fixed position locked */
        @supports (-webkit-touch-callout: none) {
          html, body {
            height: 100% !important;
            height: -webkit-fill-available !important;
            overflow: hidden !important;
          }

          .mobile-header-locked {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 9999 !important;

            /* Hardware acceleration */
            -webkit-transform: translate3d(0, 0, 0) !important;
            transform: translate3d(0, 0, 0) !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            will-change: transform !important;

            /* Isolate from scroll context */
            isolation: isolate !important;
            contain: layout style !important;
          }

          .ios-scroll-content {
            height: 100vh !important;
            height: -webkit-fill-available !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior: none !important;
            padding-top: 56px !important; /* Space for fixed header */
          }

          /* Remove padding on large screens */
          @media (min-width: 1024px) {
            .ios-scroll-content {
              padding-top: 0 !important;
            }
          }
        }

        /* Non-iOS - Normal behavior */
        .mobile-header-locked {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 30;
        }

        /* Add padding for content on mobile (non-iOS too) */
        @media (max-width: 1023px) {
          .ios-scroll-content {
            padding-top: 56px;
          }
        }
      `}</style>

      <header className="mobile-header-locked lg:hidden bg-gradient-to-r from-amber-900 to-orange-900 text-white shadow-lg safe-area-top">
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
