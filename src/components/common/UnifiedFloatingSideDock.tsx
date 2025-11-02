import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Home, User, FileText, MessageCircle, X, Send } from 'lucide-react';

interface UnifiedFloatingSideDockProps {
  onAdminLogin?: () => void;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  phoneNumber?: string;
}

/**
 * 🎯 Unified Floating Side Dock - iPhone Safari Fixed
 *
 * شريط جانبي موحد ثابت 100% على جميع الأجهزة بما فيها iPhone
 * - استخدام React Portal للحقن في body
 * - GPU layer مستقل (translateZ)
 * - إصلاحات Safari الخاصة
 * - معالجة keyboard على iPhone
 */
export function UnifiedFloatingSideDock({
  onAdminLogin,
  onNavigate,
  currentSection = 'home',
  phoneNumber = '966500000000'
}: UnifiedFloatingSideDockProps) {
  const [mounted, setMounted] = useState(false);
  const [whatsappExpanded, setWhatsappExpanded] = useState(false);
  const [message, setMessage] = useState('مرحباً! أود الاستفسار عن المنصة');
  const [deviceInfo, setDeviceInfo] = useState({
    isIPhone: false,
    hasNotch: false,
    safeAreaBottom: 0
  });

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

    setDeviceInfo({
      isIPhone,
      hasNotch,
      safeAreaBottom: safeBottom
    });

    // iPhone keyboard handling - prevent dock from being pushed
    if (isIPhone) {
      const preventKeyboardScroll = () => {
        // Lock viewport when keyboard appears
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      };

      // Listen for keyboard events
      window.visualViewport?.addEventListener('resize', preventKeyboardScroll);
      window.addEventListener('focusin', preventKeyboardScroll);

      return () => {
        window.visualViewport?.removeEventListener('resize', preventKeyboardScroll);
        window.removeEventListener('focusin', preventKeyboardScroll);
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
    { id: 'home', icon: Home, label: 'الرئيسية', color: 'emerald' },
    { id: 'farms', icon: FileText, label: 'المزارع', color: 'emerald' },
    { id: 'account', icon: User, label: 'حسابي', color: 'emerald' },
  ];

  // Don't render until mounted
  if (!mounted) return null;

  const dockContent = (
    <>
      {/* Unified Floating Side Dock - Portal to body */}
      <div
        className="floating-side-dock"
        style={{
          // Critical: Fixed position with GPU layer
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%) translateZ(0)', // GPU layer
          zIndex: 9999,

          // Safari iOS fixes
          WebkitTransform: 'translateY(-50%) translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          WebkitOverflowScrolling: 'touch',

          // Ensure it stays on top
          isolation: 'isolate',

          // Padding for safe area
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

            // Additional Safari fixes
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

            {/* 👑 Admin Crown Button - Top Section */}
            <div className="w-full flex flex-col items-center pb-3 border-b border-emerald-200/30">
              <button
                onClick={onAdminLogin}
                className="group relative w-14 h-14 rounded-2xl transition-all duration-300 active:scale-90"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%)',
                  touchAction: 'manipulation', // Better touch on iOS
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                    transform: 'scale(1.2) translateZ(0)',
                  }}
                />

                {/* Button Content */}
                <div
                  className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.98) 100%)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {/* Glass shine */}
                  <div
                    className="absolute top-0 left-0 right-0 h-6"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
                    }}
                  />

                  <Crown
                    size={24}
                    className="text-white relative z-10"
                    strokeWidth={2.5}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }}
                  />

                  {/* Sparkle effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6) 0%, transparent 50%)',
                    }}
                  />
                </div>

                {/* Pulse ring */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-amber-300/40 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              </button>
            </div>

            {/* 🧭 Navigation Buttons - Middle Section */}
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
                  {/* Active glow */}
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

                  {/* Button Content */}
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
                    {/* Glass shine */}
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

            {/* 💬 Smart WhatsApp Button - Bottom Section */}
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
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
                  style={{
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                    transform: 'scale(1.2) translateZ(0)',
                  }}
                />

                {/* Button Content */}
                <div
                  className="relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.98) 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {/* Glass shine */}
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

                {/* Pulse ring */}
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

      {/* WhatsApp Expanded Panel - Also portal'd */}
      {whatsappExpanded && (
        <div
          className="fixed left-24 transition-all duration-300 ease-out"
          style={{
            top: '50%',
            transform: 'translateY(-50%) translateZ(0)',
            width: 'min(360px, calc(100vw - 120px))',
            zIndex: 9998,

            // Safari fixes
            WebkitTransform: 'translateY(-50%) translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Glass Panel */}
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
            {/* Header */}
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

            {/* Message Input */}
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

              {/* Send Button */}
              <button
                onClick={handleWhatsAppSend}
                disabled={!message.trim()}
                className="w-full mt-3 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: message.trim()
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 1) 0%, rgba(5, 150, 105, 1) 100%)'
                    : 'rgba(16, 185, 129, 0.3)',
                  boxShadow: message.trim()
                    ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                    : 'none',
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

            {/* Quick Messages */}
            <div className="px-4 pb-4">
              <p className="text-xs text-emerald-600 mb-2 font-semibold">رسائل سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'استفسار عن الأسعار',
                  'كيف يمكنني الحجز؟',
                  'تواصل مع الدعم'
                ].map((quickMsg) => (
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

      {/* Global CSS for floating-side-dock */}
      <style>{`
        .floating-side-dock {
          position: fixed !important;
          left: 16px !important;
          top: 50% !important;
          transform: translateY(-50%) translateZ(0) !important;
          -webkit-transform: translateY(-50%) translateZ(0) !important;
          will-change: transform !important;
          backface-visibility: hidden !important;
          -webkit-backface-visibility: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          isolation: isolate !important;
          z-index: 9999 !important;
        }

        /* Prevent any parent from affecting the dock */
        .floating-side-dock,
        .floating-side-dock * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  );

  // Use Portal to inject into body (outside app container)
  return typeof document !== 'undefined'
    ? createPortal(dockContent, document.body)
    : null;
}
