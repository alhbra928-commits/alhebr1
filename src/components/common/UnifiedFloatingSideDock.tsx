import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, DollarSign, Settings, MessageSquare } from 'lucide-react';

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
        .unified-dock-wrapper {
          position: fixed;
          left: 16px;
          top: 0;
          height: 100vh;
          z-index: 10000;
          display: flex;
          align-items: center;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .unified-dock-content {
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

      {/* الشريط الجانبي فقط */}
      <div className="unified-dock-wrapper">
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
              {/* Home Button */}
              <button
                onClick={() => onNavigate('home')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'home'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                  boxShadow: currentSection === 'home' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                <Home size={20} className={currentSection === 'home' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {/* User Button */}
              <button
                onClick={() => onNavigate('users')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'users'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <Users size={20} className={currentSection === 'users' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {/* Documentation Button */}
              <button
                onClick={() => onNavigate('documentation')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'documentation'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <FileText size={20} className={currentSection === 'documentation' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {/* Finance Button */}
              <button
                onClick={() => onNavigate('finance')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'finance'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <DollarSign size={20} className={currentSection === 'finance' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => onNavigate('settings')}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: currentSection === 'settings'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)'
                    : 'transparent',
                }}
              >
                <Settings size={20} className={currentSection === 'settings' ? 'text-emerald-400' : 'text-white/70'} />
              </button>

              {/* WhatsApp Button */}
              <button
                onClick={() => {
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
                {phoneNumber && (
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-emerald-300/40 animate-ping"
                    style={{ animationDuration: '2s' }}
                  />
                )}
              </button>

              {/* Smart Button */}
              {onSmartButtonClick && (
                <button
                  onClick={() => {
                    onSmartButtonClick();
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.2) 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <MessageSquare size={20} className="text-emerald-400" />
                  {phoneNumber && (
                    <div
                      className="absolute inset-0 rounded-2xl border-2 border-emerald-300/40 animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                </button>
              )}

            </div>
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
