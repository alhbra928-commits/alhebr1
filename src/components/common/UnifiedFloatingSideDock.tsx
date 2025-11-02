import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, DollarSign, Settings, MessageSquare, Menu } from 'lucide-react';

interface UnifiedFloatingSideDockProps {
  onNavigate: (section: string) => void;
  currentSection?: string;
  phoneNumber?: string;
  onSmartButtonClick?: () => void;
}

export function UnifiedFloatingSideDock({
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
  const [deviceInfo, setDeviceInfo] = useState({
    isIPhone: false,
    hasNotch: false,
    safeAreaBottom: 0,
    viewportHeight: 0
  });

  useEffect(() => {
    setMounted(true);

    const updateDeviceInfo = () => {
      const isIPhone = /iPhone/.test(navigator.userAgent);
      const hasNotch = isIPhone && window.screen.height >= 812;
      const safeAreaBottom = hasNotch ? 34 : 16;

      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);

      setDeviceInfo({
        isIPhone,
        hasNotch,
        safeAreaBottom,
        viewportHeight: window.innerHeight
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        .unified-main-container {
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform, left;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          pointer-events: none !important;
        }

        .unified-dock-content {
          pointer-events: auto !important;
        }

        .unified-dock-tab {
          pointer-events: auto !important;
        }

        .unified-dock-content button {
          pointer-events: auto !important;
        }

        .unified-dock-content * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
      `}</style>

      {/* Container واحد - الأيقونة والشريط معاً */}
      <div
        className="unified-main-container fixed"
        style={{
          left: isDockVisible ? '16px' : '-52px',
          top: 0,
          height: '100vh',
          zIndex: 10000,
          transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* الشريط على اليسار */}
        <div
          className="unified-dock-content"
          style={{
            paddingBottom: `${deviceInfo.safeAreaBottom}px`,
          }}
        >
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.12) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div className="px-3 py-4 space-y-4">
              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'home'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <Home size={20} className={currentSection === 'home' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('users'); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'users'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <Users size={20} className={currentSection === 'users' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('documentation'); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'documentation'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <FileText size={20} className={currentSection === 'documentation' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('finance'); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'finance'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <DollarSign size={20} className={currentSection === 'finance' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onNavigate('settings'); }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'settings'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <Settings size={20} className={currentSection === 'settings' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setWhatsappExpanded(!whatsappExpanded);
                  if (navigator.vibrate) navigator.vibrate(10);
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative"
                style={{
                  background: whatsappExpanded
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <MessageSquare size={20} className={whatsappExpanded ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {onSmartButtonClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSmartButtonClick();
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)',
                  }}
                >
                  <MessageSquare size={20} className="text-emerald-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* الأيقونة على اليمين */}
        <div
          className="unified-dock-tab cursor-pointer"
          style={{
            position: 'absolute',
            right: '-80px',
            top: '50%',
            transform: 'translateY(-50%)',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            padding: '16px',
            margin: '-16px',
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsIconPressed(true);
            if (navigator.vibrate) navigator.vibrate(10);
            setIsDockVisible(true);
            setTimeout(() => {
              setIsIconPressed(false);
              setTimeout(() => setIsDockVisible(false), 3000);
            }, 150);
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
            <div
              className="absolute top-0 left-0 right-0 h-6 rounded-t-full"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)',
              }}
            />

            <Menu
              size={26}
              className="text-white relative z-10"
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />

            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
                animationDuration: '2s',
              }}
            />

            <div
              className="absolute -inset-2 rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Panel */}
      {whatsappExpanded && (
        <div
          className="fixed"
          style={{
            left: '96px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 9998,
          }}
        >
          <div
            className="relative rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: '280px',
            }}
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-xl p-3 mb-3 resize-none"
              rows={4}
              placeholder="اكتب رسالتك..."
            />
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              }}
            >
              إرسال عبر واتساب
            </button>
          </div>
        </div>
      )}
    </>
  );
}
