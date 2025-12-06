import React, { useEffect } from 'react';
import { Menu, MapPin, Bell } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function MobileHeader({ onMenuClick, title = 'لوحة التحكم' }: MobileHeaderProps) {
  useEffect(() => {
    // ULTIMATE iOS Safari Header Fix - Continuous Monitoring
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      console.log('🍎 iOS detected - Applying ULTIMATE mobile header fix');

      let headerElement: HTMLElement | null = null;
      let animationFrameId: number;
      let isRunning = true;

      // Prevent body overscroll
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';

      // Lock header position using requestAnimationFrame
      const lockHeader = () => {
        if (!isRunning) return;

        if (!headerElement) {
          headerElement = document.querySelector('.ios-fixed-header');
        }

        if (headerElement) {
          const rect = headerElement.getBoundingClientRect();

          // If header moved even 1px, force it back
          if (rect.top !== 0) {
            headerElement.style.position = 'fixed';
            headerElement.style.top = '0px';
            headerElement.style.left = '0px';
            headerElement.style.right = '0px';
            headerElement.style.transform = 'translate3d(0, 0, 0)';
            headerElement.style.webkitTransform = 'translate3d(0, 0, 0)';
          }
        }

        // Continue monitoring
        animationFrameId = requestAnimationFrame(lockHeader);
      };

      // Start continuous monitoring
      lockHeader();

      // Cleanup
      return () => {
        isRunning = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        document.body.style.overscrollBehavior = '';
        document.documentElement.style.overscrollBehavior = '';
      };
    }
  }, []);

  return (
    <>
      <style>{`
        /* iOS Safari Header ULTIMATE Fix */
        .ios-fixed-header {
          /* CRITICAL: Use transform instead of position changes */
          -webkit-transform: translate3d(0, 0, 0) !important;
          transform: translate3d(0, 0, 0) !important;

          /* Lock rendering */
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          -webkit-perspective: 1000px !important;
          perspective: 1000px !important;

          /* Prevent viewport resize effects */
          will-change: transform !important;
          contain: layout style paint !important;

          /* Disable touch on header */
          touch-action: none !important;
          -webkit-touch-callout: none !important;

          /* iOS Safe Area Support */
          padding-top: max(env(safe-area-inset-top), 0px) !important;
          padding-left: env(safe-area-inset-left) !important;
          padding-right: env(safe-area-inset-right) !important;
        }

        /* Force separate layer */
        .ios-fixed-header::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          transform: translateZ(-1px);
          will-change: transform;
        }

        /* iOS specific positioning */
        @supports (-webkit-touch-callout: none) {
          .ios-fixed-header {
            position: fixed !important;
            top: 0 !important;
            -webkit-transform: translate3d(0, 0, 0) !important;
            transform: translate3d(0, 0, 0) !important;
          }

          html, body {
            /* Prevent viewport jumps */
            height: 100%;
            height: -webkit-fill-available;
            position: relative;
            overflow-x: hidden;
          }

          body {
            overscroll-behavior-y: none;
            -webkit-overflow-scrolling: touch;
          }
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
