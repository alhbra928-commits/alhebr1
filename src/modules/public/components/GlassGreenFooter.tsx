import React, { useEffect, useRef } from 'react';
import { Home, TreePine, MessageCircle, User } from 'lucide-react';

interface GlassGreenFooterProps {
  activeTab?: string;
  onTabChange: (tabId: string) => void;
  onWhatsAppClick?: () => void;
}

export const GlassGreenFooter: React.FC<GlassGreenFooterProps> = ({
  activeTab,
  onTabChange,
  onWhatsAppClick
}) => {
  const footerRef = useRef<HTMLElement>(null);

  // Force fixed position on mount and prevent any changes
  useEffect(() => {
    if (footerRef.current) {
      const footer = footerRef.current;
      
      // Force styles immediately
      const forceFixedPosition = () => {
        footer.style.setProperty('position', 'fixed', 'important');
        footer.style.setProperty('bottom', '0', 'important');
        footer.style.setProperty('left', '0', 'important');
        footer.style.setProperty('right', '0', 'important');
        footer.style.setProperty('width', '100%', 'important');
        footer.style.setProperty('z-index', '9999', 'important');
        footer.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');
      };

      forceFixedPosition();

      // Prevent any style modifications
      const observer = new MutationObserver(() => {
        forceFixedPosition();
      });

      observer.observe(footer, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      // Also force on scroll
      const handleScroll = () => {
        forceFixedPosition();
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const navItems = [
    {
      id: 'home',
      icon: Home,
      label: 'الرئيسية',
      action: () => {
        onTabChange('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'farms',
      icon: TreePine,
      label: 'المزارع',
      action: () => {
        onTabChange('farms');
        const farmsSection = document.getElementById('farms-section');
        if (farmsSection) {
          farmsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'تواصل',
      action: () => {
        if (onWhatsAppClick) {
          onWhatsAppClick();
        } else {
          window.open('https://wa.me/966500000000', '_blank');
        }
      }
    },
    {
      id: 'login',
      icon: User,
      label: 'حسابي',
      action: () => onTabChange('login')
    }
  ];

  return (
    <footer
      ref={footerRef}
      className="glass-green-footer-fixed"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 9999,
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      {/* Glass Green Background with 3D Depth */}
      <div
        style={{
          position: 'relative',
          margin: '0 auto',
          maxWidth: '100%',
          background: 'linear-gradient(180deg, rgba(209, 250, 229, 0.95) 0%, rgba(167, 243, 208, 0.98) 50%, rgba(134, 239, 172, 0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '2px solid rgba(74, 222, 128, 0.5)',
          boxShadow: `
            0 -8px 32px rgba(34, 197, 94, 0.15),
            0 -4px 16px rgba(74, 222, 128, 0.1),
            0 -2px 8px rgba(134, 239, 172, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 rgba(34, 197, 94, 0.1)
          `
        }}
      >
        {/* Soft gradient overlay for glass effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(74, 222, 128, 0.1) 100%)',
            pointerEvents: 'none'
          }}
        />

        {/* Navigation Items Container */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '12px 16px',
            gap: '8px'
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.action}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  minWidth: '70px',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }
                }}
              >
                {/* 3D Glass Icon Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(74, 222, 128, 0.4) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(209, 250, 229, 0.3) 100%)',
                    boxShadow: isActive
                      ? `
                        0 8px 20px rgba(34, 197, 94, 0.3),
                        0 4px 12px rgba(74, 222, 128, 0.2),
                        inset 0 2px 0 rgba(255, 255, 255, 0.5),
                        inset 0 -2px 0 rgba(34, 197, 94, 0.2)
                      `
                      : `
                        0 4px 12px rgba(34, 197, 94, 0.1),
                        0 2px 6px rgba(74, 222, 128, 0.1),
                        inset 0 2px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -1px 0 rgba(34, 197, 94, 0.1)
                      `,
                    border: isActive
                      ? '2px solid rgba(74, 222, 128, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {/* Icon with soft glow */}
                  <Icon
                    size={24}
                    style={{
                      color: isActive ? '#ffffff' : 'rgba(22, 163, 74, 0.9)',
                      filter: isActive
                        ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))'
                        : 'drop-shadow(0 1px 2px rgba(22, 163, 74, 0.2))',
                      transition: 'all 0.3s ease',
                      strokeWidth: 2.5
                    }}
                  />

                  {/* Glass shine effect */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 50%)',
                      opacity: isActive ? 0.6 : 0.4,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Active pulse effect */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-4px',
                        borderRadius: '18px',
                        background: 'radial-gradient(circle, rgba(74, 222, 128, 0.4) 0%, transparent 70%)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        pointerEvents: 'none'
                      }}
                    />
                  )}

                  {/* 3D bottom reflection */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      borderRadius: '0 0 16px 16px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.08) 100%)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>

                {/* Label with soft shadow */}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? '#16a34a' : '#059669',
                    textShadow: isActive
                      ? '0 2px 4px rgba(74, 222, 128, 0.3)'
                      : '0 1px 2px rgba(22, 163, 74, 0.2)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.02em'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.4) 50%, transparent 100%)'
          }}
        />
      </div>

      {/* Add pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      `}</style>
    </footer>
  );
};
