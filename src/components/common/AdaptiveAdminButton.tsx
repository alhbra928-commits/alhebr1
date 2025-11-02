import { useEffect, useState } from 'react';
import { Crown, ArrowLeft } from 'lucide-react';
import { aiAdaptiveInterface, ElementState } from '../../services/aiAdaptiveInterfaceService';

interface AdaptiveAdminButtonProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  mode?: 'login' | 'back';
}

/**
 * 👑 زر الدخول الإداري المتكيف
 *
 * مدمج مع AI Adaptive Interface Layer
 * - يظهر فقط للمستخدمين المصرح لهم
 * - يتكيف تلقائياً مع جميع الأجهزة
 * - تصميم زجاجي ذهبي/أخضر متألق
 */
export function AdaptiveAdminButton({
  onAdminLogin,
  onBackToAdmin,
  mode = 'login'
}: AdaptiveAdminButtonProps) {
  const [elementState, setElementState] = useState<ElementState | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Subscribe to element state updates
    const unsubscribe = aiAdaptiveInterface.subscribe('admin-access-button', (state) => {
      setElementState(state);
    });

    // Get initial state
    const initialState = aiAdaptiveInterface.getElementState('admin-access-button');
    if (initialState) {
      setElementState(initialState);
    }

    // Check admin access
    checkAccess();

    return () => {
      unsubscribe();
    };
  }, []);

  const checkAccess = async () => {
    const access = await aiAdaptiveInterface.checkAdminAccess();
    setHasAccess(access);

    // Update visibility based on access
    if (mode === 'back' && access) {
      aiAdaptiveInterface.setElementVisibility('admin-access-button', true);
    } else if (mode === 'login') {
      // Login button is always visible on public pages
      aiAdaptiveInterface.setElementVisibility('admin-access-button', true);
    }
  };

  const handleClick = () => {
    if (mode === 'back' && onBackToAdmin) {
      onBackToAdmin();
    } else if (mode === 'login' && onAdminLogin) {
      onAdminLogin();
    }

    aiAdaptiveInterface.updateElement('admin-access-button', {
      interacting: true
    });

    setTimeout(() => {
      aiAdaptiveInterface.updateElement('admin-access-button', {
        interacting: false
      });
    }, 200);
  };

  // Hide if not mounted or not visible
  if (!mounted || !elementState || !elementState.visible) {
    return null;
  }

  // Hide login button if user already has access
  if (mode === 'login' && hasAccess) {
    return null;
  }

  // Hide back button if user doesn't have access
  if (mode === 'back' && !hasAccess) {
    return null;
  }

  const { position, interacting } = elementState;
  const deviceInfo = aiAdaptiveInterface.getDeviceInfo();
  const isMobile = deviceInfo?.isMobile || false;

  // Colors based on mode
  const colors = mode === 'back'
    ? {
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 100%)',
        glow: 'rgba(16, 185, 129, 0.4)',
        shadow: 'rgba(16, 185, 129, 0.4)',
        border: 'rgba(16, 185, 129, 0.3)',
      }
    : {
        gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.98) 100%)',
        glow: 'rgba(251, 191, 36, 0.4)',
        shadow: 'rgba(251, 191, 36, 0.4)',
        border: 'rgba(251, 191, 36, 0.3)',
      };

  return (
    <button
      data-interface-element="admin-access-button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed transition-all duration-300 ease-out
        ${isHovered ? 'scale-110' : 'scale-100'}
        ${interacting ? 'scale-90' : ''}
        active:scale-90
      `}
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: position.zIndex,
        transform: `scale(${position.scale})`,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={mode === 'back' ? 'العودة للإدارة' : 'دخول الإدارة'}
    >
      {/* Glow Effect */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: 'blur(12px)',
          transform: 'scale(1.3)',
        }}
      />

      {/* Glass Button */}
      <div
        className={`
          relative rounded-full overflow-hidden transition-all duration-300
          ${isMobile ? 'w-14 h-14' : 'w-16 h-16'}
        `}
        style={{
          background: colors.gradient,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `
            0 8px 32px ${colors.shadow},
            inset 0 1px 2px rgba(255, 255, 255, 0.3),
            0 0 0 1px ${colors.border}
          `,
        }}
      >
        {/* Glass Reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
          }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {mode === 'back' ? (
            <ArrowLeft
              size={isMobile ? 24 : 28}
              className="text-white"
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
            />
          ) : (
            <Crown
              size={isMobile ? 24 : 28}
              className="text-white"
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }}
            />
          )}
        </div>

        {/* Sparkle Effect */}
        {!isMobile && isHovered && (
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)',
              animation: 'sparkle 1s ease-in-out infinite',
            }}
          />
        )}

        {/* Pulse Ring */}
        {!isHovered && (
          <div
            className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
            style={{
              animationDuration: '3s'
            }}
          />
        )}
      </div>

      {/* Label (Desktop only) */}
      {!isMobile && (
        <div
          className={`
            absolute left-full ml-3 top-1/2 -translate-y-1/2
            px-3 py-1.5 rounded-lg whitespace-nowrap
            transition-all duration-300
            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
            pointer-events-none
          `}
          style={{
            background: colors.gradient,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `0 4px 12px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <span className="text-xs font-bold text-white">
            {mode === 'back' ? 'العودة للإدارة' : 'لوحة الإدارة'}
          </span>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: rotate(0deg) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: rotate(180deg) scale(1.2);
          }
        }
      `}</style>
    </button>
  );
}
