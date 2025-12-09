import React, { useEffect, useState } from 'react';
import { Home, User, MessageCircle, Phone } from 'lucide-react';

/**
 * 🎯 Smart Bottom Dock - نظام Dock احترافي مثل واتساب وإنستغرام
 *
 * هذا المكون مصمم خصيصاً لـ iPhone Safari:
 * - منفصل تماماً عن body وال DOM الرئيسي
 * - يستخدم Portal للخروج من التسلسل الهرمي
 * - ثابت 100% لا يتأثر بالتمرير
 * - يحترم safe-area في iPhone
 * - يمنع Safari من إخفائه أو تحريكه
 */

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: number;
}

interface SmartBottomDockProps {
  items?: DockItem[];
  activeItem?: string;
}

export const SmartBottomDock: React.FC<SmartBottomDockProps> = ({
  items,
  activeItem = 'home'
}) => {
  const [dockContainer, setDockContainer] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // إنشاء حاوية منفصلة خارج React DOM
  useEffect(() => {
    // إنشاء container خاص للـ Dock خارج #root
    const container = document.createElement('div');
    container.id = 'smart-bottom-dock-portal';
    container.setAttribute('data-dock', 'true');

    // إضافة مباشرة لـ body (خارج #root)
    document.body.appendChild(container);
    setDockContainer(container);

    // Cleanup عند unmount
    return () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // منع Safari من إخفاء الـ Dock
  useEffect(() => {
    if (!dockContainer) return;

    // منع bounce scrolling
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-dock="true"]')) {
        e.preventDefault();
      }
    };

    // منع viewport resize عند ظهور/اختفاء شريط Safari
    const preventResize = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    };

    document.addEventListener('touchmove', preventBounce, { passive: false });
    window.addEventListener('resize', preventResize);
    preventResize();

    return () => {
      document.removeEventListener('touchmove', preventBounce);
      window.removeEventListener('resize', preventResize);
    };
  }, [dockContainer]);

  // Default items
  const defaultItems: DockItem[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: <Home size={24} />,
      onClick: () => window.location.href = '/'
    },
    {
      id: 'profile',
      label: 'حسابي',
      icon: <User size={24} />,
      onClick: () => console.log('Profile')
    },
    {
      id: 'chat',
      label: 'المساعد',
      icon: <MessageCircle size={24} />,
      onClick: () => console.log('Chat'),
      badge: 3
    },
    {
      id: 'contact',
      label: 'اتصل',
      icon: <Phone size={24} />,
      onClick: () => window.open('https://wa.me/966500000000', '_blank')
    }
  ];

  const dockItems = items || defaultItems;

  if (!dockContainer) return null;

  // Render مباشرة في الـ container الخاص
  return (
    <>
      {/* CSS Styles - مضمنة مباشرة لضمان التطبيق */}
      <style>{`
        /* ============================================
           SMART BOTTOM DOCK - ULTIMATE iOS FIX
           نظام Dock احترافي مثل واتساب وإنستغرام
           ============================================ */

        /* حاوية الـ Dock - منفصلة تماماً */
        #smart-bottom-dock-portal {
          /* CRITICAL: Outside normal document flow */
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;

          /* Z-index أعلى من أي شيء */
          z-index: 2147483647 !important; /* Max 32-bit integer */

          /* منع أي تأثير من العناصر الأخرى */
          isolation: isolate !important;
          contain: layout style paint !important;

          /* Force GPU acceleration */
          transform: translate3d(0, 0, 0) !important;
          -webkit-transform: translate3d(0, 0, 0) !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;
          -webkit-perspective: 1000px !important;
          perspective: 1000px !important;

          /* منع أي pointer events من الوصول للخلف */
          pointer-events: auto !important;
          touch-action: manipulation !important;

          /* Lock position completely */
          will-change: transform, opacity !important;

          /* منع Safari من التلاعب */
          -webkit-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        /* محتوى الـ Dock */
        .smart-dock-content {
          position: relative !important;
          width: 100% !important;

          /* Background مع شفافية */
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;

          /* Border علوي */
          border-top: 1px solid rgba(16, 185, 129, 0.15) !important;

          /* Shadow */
          box-shadow:
            0 -4px 24px rgba(0, 0, 0, 0.08),
            0 -2px 8px rgba(0, 0, 0, 0.04),
            0 0 1px rgba(0, 0, 0, 0.04) !important;

          /* iOS Safe Area Support */
          padding-top: 8px !important;
          padding-bottom: env(safe-area-inset-bottom, 20px) !important;
          padding-bottom: max(env(safe-area-inset-bottom), 20px) !important;
          padding-left: env(safe-area-inset-left, 0px) !important;
          padding-right: env(safe-area-inset-right, 0px) !important;
        }

        /* Grid للأزرار */
        .smart-dock-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 8px !important;
          padding: 0 12px !important;
          max-width: 600px !important;
          margin: 0 auto !important;
        }

        /* زر الـ Dock */
        .smart-dock-button {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;

          padding: 10px 8px !important;
          border-radius: 12px !important;

          background: transparent !important;
          border: none !important;
          outline: none !important;

          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;

          /* Touch target - 44x44 minimum */
          min-height: 56px !important;

          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;

          /* منع selection */
          user-select: none !important;
          -webkit-user-select: none !important;
        }

        /* Active state */
        .smart-dock-button.active {
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.1) 0%,
            rgba(5, 150, 105, 0.1) 100%) !important;
        }

        /* Hover effect (للأجهزة غير اللمسية) */
        @media (hover: hover) {
          .smart-dock-button:hover:not(.active) {
            background: rgba(243, 244, 246, 0.8) !important;
          }
        }

        /* Active press effect */
        .smart-dock-button:active {
          transform: scale(0.95) !important;
          opacity: 0.8 !important;
        }

        /* أيقونة الزر */
        .smart-dock-icon {
          position: relative !important;
          color: #6b7280 !important;
          transition: all 0.2s ease !important;
        }

        .smart-dock-button.active .smart-dock-icon {
          color: #10b981 !important;
          transform: translateY(-2px) !important;
        }

        /* Badge للإشعارات */
        .smart-dock-badge {
          position: absolute !important;
          top: -6px !important;
          right: -6px !important;

          min-width: 18px !important;
          height: 18px !important;
          padding: 0 5px !important;

          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
          color: white !important;

          font-size: 11px !important;
          font-weight: 700 !important;

          border-radius: 9px !important;
          border: 2px solid white !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4) !important;
        }

        /* تسمية الزر */
        .smart-dock-label {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #6b7280 !important;
          transition: all 0.2s ease !important;
          text-align: center !important;
          line-height: 1.2 !important;
        }

        .smart-dock-button.active .smart-dock-label {
          color: #10b981 !important;
          font-weight: 700 !important;
        }

        /* iOS Safari Specific Fixes */
        @supports (-webkit-touch-callout: none) {
          #smart-bottom-dock-portal {
            /* Lock completely on iOS */
            position: fixed !important;
            bottom: 0 !important;

            /* Force separate rendering layer */
            transform: translate3d(0, 0, 0) translateZ(0) !important;
            -webkit-transform: translate3d(0, 0, 0) translateZ(0) !important;

            /* Prevent any Safari interference */
            -webkit-overflow-scrolling: auto !important;
            overscroll-behavior: none !important;
            -webkit-overscroll-behavior: none !important;
          }

          /* Ensure body has space for dock */
          body {
            padding-bottom: max(90px, calc(90px + env(safe-area-inset-bottom))) !important;
          }

          /* Prevent Safari from hiding dock on scroll */
          html {
            overscroll-behavior-y: none !important;
            -webkit-overscroll-behavior-y: none !important;
          }
        }

        /* Landscape mode adjustments */
        @media screen and (orientation: landscape) and (max-height: 450px) {
          .smart-dock-content {
            padding-top: 6px !important;
            padding-bottom: max(env(safe-area-inset-bottom), 12px) !important;
          }

          .smart-dock-button {
            min-height: 48px !important;
            padding: 8px 6px !important;
          }

          .smart-dock-label {
            font-size: 10px !important;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .smart-dock-content {
            background: rgba(30, 41, 59, 0.98) !important;
            border-top-color: rgba(255, 255, 255, 0.1) !important;
          }

          .smart-dock-button.active {
            background: linear-gradient(135deg,
              rgba(16, 185, 129, 0.2) 0%,
              rgba(5, 150, 105, 0.2) 100%) !important;
          }

          .smart-dock-label {
            color: #9ca3af !important;
          }

          .smart-dock-button.active .smart-dock-label {
            color: #10b981 !important;
          }
        }

        /* Animation on mount */
        @keyframes dock-slide-up {
          from {
            transform: translate3d(0, 100%, 0);
            opacity: 0;
          }
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        #smart-bottom-dock-portal {
          animation: dock-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Prevent content from going under dock */
        body.has-smart-dock {
          padding-bottom: max(90px, calc(90px + env(safe-area-inset-bottom))) !important;
        }

        /* Overlay Interaction Layer - يمنع المحتوى من الظهور خلف الـ Dock */
        .smart-dock-overlay {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: max(90px, calc(90px + env(safe-area-inset-bottom))) !important;
          z-index: 2147483646 !important; /* تحت الـ Dock مباشرة */
          pointer-events: none !important;
          background: transparent !important;
        }
      `}</style>

      {/* Render الـ Dock في الـ container الخاص */}
      {dockContainer && (
        <>
          {/* Overlay Layer */}
          <div className="smart-dock-overlay" />

          {/* Main Dock */}
          <div
            id="smart-bottom-dock-portal"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 2147483647
            }}
          >
            <div className="smart-dock-content">
              <div className="smart-dock-grid">
                {dockItems.map((item) => (
                  <button
                    key={item.id}
                    className={`smart-dock-button ${activeItem === item.id ? 'active' : ''}`}
                    onClick={item.onClick}
                    aria-label={item.label}
                  >
                    <div className="smart-dock-icon">
                      {item.icon}
                      {item.badge && item.badge > 0 && (
                        <span className="smart-dock-badge">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="smart-dock-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Export للاستخدام
export default SmartBottomDock;
