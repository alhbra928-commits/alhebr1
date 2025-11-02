import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Home, User, FileText, MessageCircle, X, Send, ChevronRight, Menu } from 'lucide-react';

interface UnifiedFloatingSideDockProps {
  onAdminLogin?: () => void;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  phoneNumber?: string;
  onSmartButtonClick?: () => void;
}

/**
 * 🎯 Unified Floating Side Dock - Ultimate iPhone Safari Fix
 *
 * الحل النهائي لمشكلة الثبات على iPhone Safari
 */
export function UnifiedFloatingSideDock({
  onAdminLogin,
  onNavigate,
  currentSection = 'home',
  phoneNumber = '966500000000',
  onSmartButtonClick
}: UnifiedFloatingSideDockProps) {
  const [mounted, setMounted] = useState(false);
  const [whatsappExpanded, setWhatsappExpanded] = useState(false);
  const [message, setMessage] = useState('مرحباً! أود الاستفسار عن المنصة');
  const [isDockVisible, setIsDockVisible] = useState(false);
  const [isIconPressed, setIsIconPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentDockPosition, setCurrentDockPosition] = useState(-52);
  const [deviceInfo, setDeviceInfo] = useState({
    isIPhone: false,
    hasNotch: false,
    safeAreaBottom: 0,
    viewportHeight: 0
  });

  // Handle drag/touch for unified dock + icon
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStartX(touch.clientX);
    setIsIconPressed(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartX;

    // Calculate new position (limited between -52 and 16)
    let newPosition = currentDockPosition + deltaX;
    newPosition = Math.max(-52, Math.min(16, newPosition));

    setCurrentDockPosition(newPosition);
    setDragStartX(touch.clientX);

    // Auto open if dragged beyond threshold
    if (newPosition > -20) {
      setIsDockVisible(true);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsIconPressed(false);

    // Snap to open or closed
    if (currentDockPosition > -20) {
      // Snap open
      setCurrentDockPosition(16);
      setIsDockVisible(true);

      // Auto close after 3s
      setTimeout(() => {
        setCurrentDockPosition(-52);
        setIsDockVisible(false);
      }, 3000);
    } else {
      // Snap closed
      setCurrentDockPosition(-52);
      setIsDockVisible(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Detect device
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isIPhone = isIOS && /iPhone/.test(ua);
    const hasNotch = isIOS && window.screen.height >= 812;

    // Get safe area
    const style = getComputedStyle(document.documentElement);
    const safeBottom = parseInt(style.getPropertyValue('padding-bottom')) || (hasNotch ? 34 : 0);

    // Set viewport height CSS variable (critical for Safari)
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      setDeviceInfo(prev => ({
        ...prev,
        viewportHeight: window.innerHeight
      }));
    };

    setViewportHeight();

    setDeviceInfo({
      isIPhone,
      hasNotch,
      safeAreaBottom: safeBottom,
      viewportHeight: window.innerHeight
    });

    // iPhone-specific fixes
    if (isIPhone) {
      // Update viewport height on resize/orientation change
      const handleResize = () => {
        setViewportHeight();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      // Prevent any scroll interference
      const preventScrollMove = (e: Event) => {
        const target = e.target as HTMLElement;
        // Only prevent if not in textarea or input
        if (!target.closest('textarea') && !target.closest('input')) {
          e.preventDefault();
        }
      };

      // Add body class for iPhone
      document.body.classList.add('is-iphone');

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        document.body.classList.remove('is-iphone');
      };
    }
  }, []);

  const handleWhatsAppSend = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    setWhatsappExpanded(false);
  };

  const navigationButtons = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'farms', icon: FileText, label: 'المزارع' },
    { id: 'account', icon: User, label: 'حسابي' },
  ];

  if (!mounted) return null;

  const dockContent = (
    <>
      {/* Critical CSS for iPhone Safari */}
      <style>{`
        /* iPhone-specific body fixes */
        body.is-iphone {
          position: fixed;
          overflow: hidden;
          width: 100%;
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
        }

        body.is-iphone #root {
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
          -webkit-overflow-scrolling: touch;
        }

        /* Ultimate fixed positioning for dock - شبه مخفي */
        .unified-dock-wrapper {
          position: fixed !important;
          top: 0 !important;
          height: 100vh !important;
          height: calc(var(--vh, 1vh) * 100) !important;
          display: flex !important;
          align-items: center !important;
          pointer-events: none !important;
          z-index: 9999 !important;
          transition: left 0.3s ease !important;

          /* Force GPU layer */
          transform: translateZ(0) !important;
          -webkit-transform: translateZ(0) !important;
          will-change: transform, left !important;
          backface-visibility: hidden !important;
          -webkit-backface-visibility: hidden !important;

          /* Prevent any transformation from parent */
          transform-style: preserve-3d !important;
          -webkit-transform-style: preserve-3d !important;

          /* Ensure isolation */
          isolation: isolate !important;
          contain: layout style paint !important;
        }

        .unified-dock-wrapper:hover {
          left: 16px !important;
        }

        .unified-dock-content {
          pointer-events: auto !important;
          transform: translateZ(0) !important;
          -webkit-transform: translateZ(0) !important;
        }

        /* Prevent scroll on touch for dock */
        .unified-dock-content * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
      `}</style>

      {/* Unified Container - الشريط والأيقونة كتلة واحدة */}
      <div
        className="unified-dock-container fixed"
        style={{
          left: `${currentDockPosition}px`,
          top: 0,
          height: '100vh',
          zIndex: 10000,
          pointerEvents: 'auto',
          transition: isDragging ? 'none' : 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* الأيقونة على اليمين - تساعد في السحب */}
        <div
          className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            right: '-64px', // خارج الشريط على اليمين
            padding: '16px',
            margin: '-16px',
          }}
        >
          <div
            className="relative w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: `
                0 4px 20px rgba(16, 185, 129, 0.6),
                0 0 0 3px rgba(16, 185, 129, 0.2),
                inset 0 2px 4px rgba(255, 255, 255, 0.3)
              `,
              transform: isIconPressed ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
          {/* Glass Overlay */}
          <div
            className="absolute top-0 left-0 right-0 h-6 rounded-t-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
            }}
          />

          {/* Menu Icon */}
          <Menu
            size={26}
            className="text-white relative z-10"
            strokeWidth={2.5}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            }}
          />

          {/* Pulsing Ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
              animationDuration: '2s',
            }}
          />

          {/* Outer Glow Ring */}
          <div
            className="absolute -inset-2 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          </div>
        </div>

        {/* الشريط الجانبي - داخل نفس الـ container */}
        <div
          className="unified-dock-content"
          style={{
            paddingBottom: `${deviceInfo.safeAreaBottom}px`,
          }}
        >
          {/* Glass Container */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: `
                0 8px 32px rgba(16, 185, 129, 0.2),
                inset 0 1px 2px rgba(255, 255, 255, 0.3),
                0 0 0 1px rgba(16, 185, 129, 0.15)
              `,
              width: '72px',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {/* Glass Reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)'
              }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center py-4 gap-3">

              {/* 💬 Smart WhatsApp Button - في الأعلى */}
              <div className="w-full flex flex-col items-center pb-3 border-b border-emerald-200/30">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSmartButtonClick) {
                      onSmartButtonClick();
                    }
                  }}
                  className="group relative w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90 hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 115, 85, 0.2) 0%, rgba(160, 145, 106, 0.15) 100%)',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle, rgba(139, 115, 85, 0.3) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      transform: 'scale(1.2) translateZ(0)',
                    }}
                  />

                  <div
                    className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)',
                      boxShadow: '0 4px 12px rgba(139, 115, 85, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-6"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, transparent 100%)'
                      }}
                    />

                    <MessageCircle
                      size={24}
                      className="text-white relative z-10"
                      strokeWidth={2.5}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                    />

                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)',
                      }}
                    />
                  </div>

                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-pulse"
                    style={{ animationDuration: '2s' }}
                  />
                </button>
              </div>

              {/* 🧭 Navigation Buttons */}
              <div className="w-full flex flex-col items-center gap-2 py-2">
                {navigationButtons.map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => onNavigate?.(btn.id)}
                    className={`
                      group relative w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90
                      ${currentSection === btn.id ? 'scale-105' : 'scale-100'}
                    `}
                    style={{
                      background: currentSection === btn.id
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    aria-label={btn.label}
                  >
                    {currentSection === btn.id && (
                      <div
                        className="absolute inset-0 rounded-2xl animate-pulse"
                        style={{
                          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
                          filter: 'blur(8px)',
                          transform: 'scale(1.2) translateZ(0)',
                        }}
                      />
                    )}

                    <div
                      className={`
                        relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden
                        ${currentSection === btn.id ? 'bg-gradient-to-br from-emerald-500/90 to-emerald-600/95' : 'bg-gradient-to-br from-emerald-500/60 to-emerald-600/70'}
                      `}
                      style={{
                        boxShadow: currentSection === btn.id
                          ? '0 6px 16px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                          : '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-6"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
                        }}
                      />

                      <btn.icon
                        size={22}
                        className="text-white relative z-10"
                        strokeWidth={2.5}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {/* 💬 WhatsApp Button */}
              <div className="w-full flex flex-col items-center pt-3 border-t border-emerald-200/30">
                <button
                  onClick={() => setWhatsappExpanded(!whatsappExpanded)}
                  className="group relative w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
                    style={{
                      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      transform: 'scale(1.2) translateZ(0)',
                    }}
                  />

                  <div
                    className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-6"
                      style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 100%)'
                      }}
                    />

                    {whatsappExpanded ? (
                      <X
                        size={24}
                        className="text-white relative z-10"
                        strokeWidth={2.5}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                      />
                    ) : (
                      <MessageCircle
                        size={24}
                        className="text-white relative z-10"
                        strokeWidth={2.5}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                      />
                    )}
                  </div>

                  {!whatsappExpanded && (
                    <div
                      className="absolute inset-0 rounded-2xl border-2 border-emerald-300/40 animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div> {/* end unified-dock-container */}

      {/* WhatsApp Panel */}
      {whatsappExpanded && (
        <div
          className="fixed left-24"
          style={{
            top: '50%',
            transform: 'translateY(-50%) translateZ(0)',
            width: 'min(360px, calc(100vw - 120px))',
            zIndex: 9998,
            WebkitTransform: 'translateY(-50%) translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 12px 40px rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              transform: 'translateZ(0)',
            }}
          >
            <div
              className="px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
                  }}
                >
                  <MessageCircle size={20} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-emerald-800">تواصل عبر واتساب</h3>
                  <p className="text-xs text-emerald-600">سنرد عليك في أقرب وقت</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="w-full px-4 py-3 rounded-xl resize-none focus:outline-none"
                rows={4}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  color: '#059669',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  touchAction: 'manipulation',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              <button
                onClick={handleWhatsAppSend}
                disabled={!message.trim()}
                className="w-full mt-3 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
                style={{
                  background: message.trim()
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)'
                    : 'rgba(16, 185, 129, 0.3)',
                  boxShadow: message.trim() ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Send size={18} strokeWidth={2.5} />
                  <span>إرسال الرسالة</span>
                </div>
              </button>
            </div>

            <div className="px-4 pb-4">
              <p className="text-xs text-emerald-600 mb-2 font-semibold">رسائل سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {['استفسار عن الأسعار', 'كيف يمكنني الحجز؟', 'تواصل مع الدعم'].map((quickMsg) => (
                  <button
                    key={quickMsg}
                    onClick={() => setMessage(quickMsg)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 transition-all duration-200 active:scale-95"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {quickMsg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(dockContent, document.body)
    : null;
}
