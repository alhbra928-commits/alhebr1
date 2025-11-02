import { useState, useEffect, useRef } from 'react';
import { Home, TreePine, MessageCircle, User } from 'lucide-react';

interface UnifiedSmartFooterProps {
  activeTab?: string;
  onTabChange: (tabId: string) => void;
  onWhatsAppClick?: () => void;
}

/**
 * 🎯 نظام الفوتر الموحد الذكي
 *
 * يكتشف نوع الجهاز تلقائياً ويستخدم التقنية المناسبة:
 * - iOS/Safari: visualViewport API
 * - Android/Chrome: position: fixed القياسي
 *
 * الميزات:
 * - ثابت في جميع الحالات (تمرير، keyboard، تدوير)
 * - تصميم زجاجي أخضر موحد
 * - أزرار سهلة الاستخدام
 */
export const UnifiedSmartFooter: React.FC<UnifiedSmartFooterProps> = ({
  activeTab,
  onTabChange,
  onWhatsAppClick
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(0);
  const footerRef = useRef<HTMLDivElement>(null);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');

  // 🔍 اكتشاف نوع الجهاز
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);

    if (isIOS || isSafari) {
      setDeviceType('ios');
      console.log('📱 iOS/Safari detected - Using visualViewport');
    } else if (/Android/i.test(userAgent)) {
      setDeviceType('android');
      console.log('🤖 Android detected - Using standard CSS');
    } else {
      setDeviceType('other');
      console.log('💻 Other device - Using standard CSS');
    }
  }, []);

  // 🎯 نظام visualViewport لـ iOS/Safari
  useEffect(() => {
    if (deviceType !== 'ios') return;

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const viewport = window.visualViewport;
        const windowHeight = window.innerHeight;
        const viewportHeight = viewport.height;

        // حساب المسافة من الأسفل عند فتح الكيبورد
        const offset = windowHeight - viewportHeight - viewport.offsetTop;
        setBottomOffset(Math.max(0, offset));

        console.log('📊 Viewport:', {
          windowHeight,
          viewportHeight,
          offsetTop: viewport.offsetTop,
          bottomOffset: offset
        });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);

      // التحقق الأولي
      handleVisualViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      }
    };
  }, [deviceType]);

  // 🎯 نظام الإظهار/الإخفاء الذكي (لجميع الأجهزة)
  useEffect(() => {
    let ticking = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // الفوتر يظهر دائماً في أول 150px من الصفحة
          if (currentScrollY < 150) {
            setIsVisible(true);
          }
          // عند التمرير للأعلى
          else if (currentScrollY < lastScrollY) {
            setIsVisible(true);
          }
          // إخفاء فقط عند التمرير السريع للأسفل
          else if (currentScrollY > lastScrollY && currentScrollY > 300) {
            const scrollDelta = currentScrollY - lastScrollY;
            // يجب أن يكون التمرير سريع جداً
            if (scrollDelta > 8) {
              setIsVisible(false);
            }
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });

        ticking = true;
      }

      // إظهار سريع بعد التوقف
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 500);
    };

    const handleTouchEnd = () => {
      // إظهار فوري عند رفع الإصبع
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsVisible(true);
      }, 200);
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
      action: () => onTabChange('home')
    },
    {
      id: 'farms',
      icon: TreePine,
      label: 'المزارع',
      action: () => onTabChange('farms')
    },
    {
      id: 'contact',
      icon: MessageCircle,
      label: 'تواصل',
      action: () => {
        if (onWhatsAppClick) {
          onWhatsAppClick();
        } else {
          onTabChange('contact');
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

  // 🎨 حساب الـ styles بناءً على نوع الجهاز
  const getFooterStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      left: 0,
      right: 0,
      zIndex: 999999,
      transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform',
      pointerEvents: isVisible ? 'auto' : 'none'
    };

    if (deviceType === 'ios') {
      // iOS: استخدام visualViewport
      return {
        ...baseStyles,
        bottom: `${bottomOffset}px`
      };
    } else {
      // Android/Other: استخدام CSS القياسي
      return {
        ...baseStyles,
        bottom: 0
      };
    }
  };

  return (
    <div
      ref={footerRef}
      style={getFooterStyles()}
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      {/* Backdrop Blur Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(209, 250, 229, 0) 0%, rgba(209, 250, 229, 0.95) 20%, rgba(167, 243, 208, 0.98) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(16, 185, 129, 0.2)'
        }}
      />

      {/* Glass Reflection */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '12px 8px',
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
                gap: '6px',
                padding: '10px 16px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)'
                  : 'transparent',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isActive
                  ? '0 8px 24px rgba(16, 185, 129, 0.25), inset 0 0 0 1px rgba(16, 185, 129, 0.2)'
                  : 'none',
                minWidth: '70px',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon Container */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Glow Effect */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '-8px',
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}
                  />
                )}

                <Icon
                  size={24}
                  strokeWidth={2.5}
                  style={{
                    color: isActive ? '#10b981' : '#059669',
                    filter: isActive ? 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.5))' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#10b981' : '#059669',
                  textShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Device Type Indicator (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 600,
            pointerEvents: 'none'
          }}
        >
          {deviceType === 'ios' ? '📱 iOS/Safari' : deviceType === 'android' ? '🤖 Android' : '💻 Other'}
          {deviceType === 'ios' && ` | Offset: ${bottomOffset}px`}
        </div>
      )}

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};
