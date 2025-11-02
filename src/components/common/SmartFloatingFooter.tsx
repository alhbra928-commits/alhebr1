import { useState, useEffect, useRef } from 'react';
import { Home, TreePine, MessageCircle, User } from 'lucide-react';

interface SmartFloatingFooterProps {
  activeTab?: string;
  onTabChange: (tabId: string) => void;
  onWhatsAppClick?: () => void;
}

export const SmartFloatingFooter: React.FC<SmartFloatingFooterProps> = ({
  activeTab,
  onTabChange,
  onWhatsAppClick
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // إظهار الفوتر عند:
          // 1. التمرير للأعلى
          // 2. الوصول لأعلى الصفحة (أول 100px)
          if (currentScrollY < lastScrollY || currentScrollY < 100) {
            setIsVisible(true);
          }
          // إخفاء الفوتر عند التمرير للأسفل بقوة
          else if (currentScrollY > lastScrollY && currentScrollY > 200) {
            const scrollDelta = currentScrollY - lastScrollY;
            // فقط أخفي إذا كان التمرير سريع (أكثر من 5px)
            if (scrollDelta > 5) {
              setIsVisible(false);
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }

      // إظهار الفوتر تلقائياً بعد التوقف
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 800);
    };

    const handleTouchEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchend', handleTouchEnd);
      clearTimeout(scrollTimeout);
    };
  }, [lastScrollY]);

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
      }
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      label: 'تواصل',
      action: () => {
        if (onWhatsAppClick) {
          onWhatsAppClick();
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
    <div
      ref={footerRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {/* Backdrop Blur Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(209, 250, 229, 0) 0%, rgba(209, 250, 229, 0.95) 20%, rgba(167, 243, 208, 0.98) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(74, 222, 128, 0.3)',
          boxShadow: `
            0 -4px 20px rgba(34, 197, 94, 0.15),
            0 -2px 10px rgba(74, 222, 128, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
          `
        }}
      />

      {/* Glass Glow Effect - Top Edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(74, 222, 128, 0.6) 50%, transparent 100%)',
          boxShadow: '0 0 10px rgba(74, 222, 128, 0.4)'
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          maxWidth: '600px',
          margin: '0 auto'
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-6px) scale(1.05)' : 'translateY(0) scale(1)',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = isActive
                  ? 'translateY(-6px) scale(0.95)'
                  : 'translateY(0) scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = isActive
                  ? 'translateY(-6px) scale(1.05)'
                  : 'translateY(0) scale(1)';
              }}
            >
              {/* Icon Container - 3D Glass Effect */}
              <div
                style={{
                  position: 'relative',
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(74, 222, 128, 0.35) 50%, rgba(134, 239, 172, 0.25) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(209, 250, 229, 0.4) 50%, rgba(167, 243, 208, 0.3) 100%)',
                  boxShadow: isActive
                    ? `
                      0 8px 24px rgba(34, 197, 94, 0.25),
                      0 4px 12px rgba(74, 222, 128, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(34, 197, 94, 0.2)
                    `
                    : `
                      0 4px 16px rgba(34, 197, 94, 0.1),
                      0 2px 8px rgba(74, 222, 128, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.7),
                      inset 0 -1px 0 rgba(34, 197, 94, 0.1)
                    `,
                  border: isActive
                    ? '1.5px solid rgba(74, 222, 128, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                {/* Active Glow */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-4px',
                      borderRadius: '18px',
                      background: 'radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  />
                )}

                {/* Icon */}
                <Icon
                  size={24}
                  strokeWidth={2.5}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    color: isActive ? '#ffffff' : 'rgba(22, 163, 74, 0.85)',
                    filter: isActive
                      ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                      : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                    transition: 'all 0.3s ease'
                  }}
                />

                {/* Glass Shine Effect */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    right: '4px',
                    height: '50%',
                    borderRadius: '12px 12px 0 0',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#16a34a' : 'rgba(5, 150, 105, 0.85)',
                  letterSpacing: '0.02em',
                  textShadow: isActive
                    ? '0 1px 2px rgba(255, 255, 255, 0.8)'
                    : '0 1px 2px rgba(255, 255, 255, 0.6)',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Reflection */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
        }}
      />

      {/* Pulse Animation Keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};
