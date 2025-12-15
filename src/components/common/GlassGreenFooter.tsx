import React from 'react';
import { Home, TreePine, MessageCircle, User } from 'lucide-react';

interface GlassGreenFooterProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onWhatsAppClick?: () => void;
}

export function GlassGreenFooter({
  activeTab = 'home',
  onTabChange,
  onWhatsAppClick,
}: GlassGreenFooterProps) {
  const tabs = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onTabChange?.('home');
      },
    },
    {
      id: 'farms',
      label: 'المزارع',
      icon: TreePine,
      action: () => {
        const farmsSection = document.querySelector('[data-section="farms"]');
        if (farmsSection) {
          farmsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        onTabChange?.('farms');
      },
    },
    {
      id: 'whatsapp',
      label: 'تواصل',
      icon: MessageCircle,
      action: () => {
        if (onWhatsAppClick) {
          onWhatsAppClick();
        } else {
          window.open('https://wa.me/966500000000', '_blank');
        }
        onTabChange?.('whatsapp');
      },
    },
    {
      id: 'profile',
      label: 'حسابي',
      icon: User,
      action: () => {
        onTabChange?.('profile');
      },
    },
  ];

  return (
    <>
      <style>{`
        body {
          padding-bottom: max(80px, calc(80px + env(safe-area-inset-bottom)));
        }

        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          body {
            padding-bottom: calc(80px + env(safe-area-inset-bottom));
          }
        }
      `}</style>

      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden' as const,
          WebkitBackfaceVisibility: 'hidden' as const,
        }}
        className="bg-gradient-to-b from-emerald-100/95 via-emerald-200/98 to-emerald-300/95"
      >
        <div
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '2px solid rgba(74, 222, 128, 0.5)',
            boxShadow: `
              0 -8px 32px rgba(34, 197, 94, 0.15),
              0 -4px 16px rgba(74, 222, 128, 0.1),
              0 -2px 8px rgba(134, 239, 172, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 0 rgba(34, 197, 94, 0.1)
            `,
          }}
        >
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center justify-around px-4 py-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={tab.action}
                    className="flex flex-col items-center gap-1 min-w-[70px] group relative"
                    style={{
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/* Icon Container */}
                    <div
                      className={`
                        relative w-12 h-12 rounded-2xl flex items-center justify-center
                        transition-all duration-300 ease-out
                        ${isActive ? 'scale-105' : 'scale-100 group-hover:scale-105'}
                      `}
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(74, 222, 128, 0.4) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(209, 250, 229, 0.3) 100%)',
                        boxShadow: isActive
                          ? `
                            0 8px 20px rgba(34, 197, 94, 0.3),
                            0 4px 12px rgba(74, 222, 128, 0.2),
                            inset 0 2px 0 rgba(255, 255, 255, 0.5)
                          `
                          : `
                            0 4px 12px rgba(34, 197, 94, 0.1),
                            inset 0 2px 0 rgba(255, 255, 255, 0.6)
                          `,
                        border: isActive
                          ? '2px solid rgba(74, 222, 128, 0.6)'
                          : '2px solid transparent',
                      }}
                    >
                      <Icon
                        size={24}
                        className={`
                          transition-all duration-300
                          ${isActive ? 'text-white' : 'text-green-700 group-hover:text-green-800'}
                        `}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      {/* Pulse effect for active tab */}
                      {isActive && (
                        <div
                          className="absolute inset-0 rounded-2xl animate-pulse"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(74, 222, 128, 0.2) 100%)',
                            opacity: 0.6,
                          }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`
                        text-xs font-medium transition-colors duration-300
                        ${isActive ? 'text-green-700' : 'text-green-600 group-hover:text-green-700'}
                      `}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Safe Area for iOS */}
          <div
            style={{
              height: 'env(safe-area-inset-bottom)',
              minHeight: '0px',
            }}
          />
        </div>
      </footer>
    </>
  );
}
