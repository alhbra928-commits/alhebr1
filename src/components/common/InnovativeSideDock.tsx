import React, { useState, useEffect } from 'react';
import { Home, User, Phone, Brain, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InnovativeSideDockProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  onSmartButtonClick?: () => void;
  phoneNumber?: string;
}

interface SideDockTexts {
  homeButton: string;
  accountButton: string;
  phoneButton: string;
  smartButton: string;
  showTooltip: string;
  hideTooltip: string;
  homeTooltip: string;
  accountTooltip: string;
  phoneTooltip: string;
  smartTooltip: string;
  phoneNumber: string;
  defaultState: string;
}

export function InnovativeSideDock({
  onNavigate,
  currentSection = 'home',
  onSmartButtonClick,
  phoneNumber: customPhoneNumber
}: InnovativeSideDockProps) {
  const [mounted, setMounted] = useState(false);
  const [texts, setTexts] = useState<SideDockTexts>({
    homeButton: 'الرئيسية',
    accountButton: 'الحساب',
    phoneButton: 'اتصل بنا',
    smartButton: 'المساعد الذكي',
    showTooltip: 'إظهار الشريط',
    hideTooltip: 'إخفاء الشريط',
    homeTooltip: 'الانتقال للصفحة الرئيسية',
    accountTooltip: 'صفحة الحساب',
    phoneTooltip: 'اتصل بنا الآن',
    smartTooltip: 'افتح المساعد الذكي',
    phoneNumber: '966569335257',
    defaultState: 'visible'
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_texts')
        .select('key, text_ar')
        .eq('section', 'side_dock');

      if (error) throw error;

      if (data) {
        const textsMap: any = {};
        data.forEach(item => {
          const camelKey = item.key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          textsMap[camelKey] = item.text_ar;
        });

        setTexts(prev => ({ ...prev, ...textsMap }));

        // تطبيق الحالة الافتراضية
        if (textsMap.defaultState) {
          setIsVisible(textsMap.defaultState === 'visible' || textsMap.defaultState === 'مرئي');
        }
      }
    } catch (error) {
      console.error('Error loading side dock texts:', error);
    }
  };

  if (!mounted) return null;

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <style>{`
        .side-dock-wrapper {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .side-dock-wrapper.hidden {
          transform: translateY(-50%) translateX(-100%);
        }

        /* iPhone specific fixes */
        @supports (-webkit-touch-callout: none) {
          .side-dock-wrapper,
          .side-dock-toggle-button {
            position: fixed;
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }
        }

        .side-dock-content {
          position: relative;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .side-dock-bar {
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 0 24px 24px 0;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 2px solid rgba(16, 185, 129, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .side-dock-button {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .side-dock-button:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: scale(1.05);
        }

        .side-dock-button:active {
          transform: scale(0.95);
        }

        .side-dock-button.active {
          background: rgba(16, 185, 129, 0.3);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .side-dock-smart-button {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          box-shadow: 0 0 20px rgba(139, 69, 19, 0.5);
        }

        .side-dock-smart-button:hover {
          background: linear-gradient(135deg, #A0522D, #CD853F);
        }

        .side-dock-divider {
          width: 40px;
          height: 2px;
          background: rgba(16, 185, 129, 0.2);
          margin: 4px auto;
        }

        .side-dock-toggle {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 64px;
          height: 64px;
          border-radius: 0 20px 20px 0;
          border: 3px solid rgba(16, 185, 129, 0.6);
          border-left: none;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
          z-index: 10003;
        }

        .side-dock-toggle:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-50%) translateX(5px) scale(1.05);
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
        }

        .side-dock-toggle:active {
          transform: translateY(-50%) scale(0.95);
        }

        .side-dock-wrapper.hidden ~ .side-dock-toggle-button {
          left: 0;
        }

        .side-dock-wrapper:not(.hidden) ~ .side-dock-toggle-button {
          left: 80px;
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 50px rgba(16, 185, 129, 0.8); }
        }

        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite;
        }

        .side-dock-smart-button {
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.5);
          transform-origin: center;
        }

        .side-dock-smart-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(16, 185, 129, 0.7);
        }

        .side-dock-smart-button:active {
          transform: scale(0.95);
        }

        .side-dock-toggle-button {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          width: 64px;
          height: 64px;
          border-radius: 0 20px 20px 0;
          border: 3px solid rgba(16, 185, 129, 0.6);
          border-left: none;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
          z-index: 10003;
        }

        .side-dock-toggle-button:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-50%) translateX(5px) scale(1.05);
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.8);
        }

        .side-dock-toggle-button:active {
          transform: translateY(-50%) scale(0.95);
        }

        .side-dock-wrapper.hidden ~ .side-dock-toggle-button {
          left: 0;
          animation: glow 2s infinite;
        }

        .side-dock-wrapper:not(.hidden) ~ .side-dock-toggle-button {
          left: 80px;
        }

        @media (max-width: 768px) {
          .side-dock-wrapper {
            top: 80px;
            transform: translateY(0);
          }

          .side-dock-wrapper.hidden {
            transform: translateY(0) translateX(-100%);
          }

          .side-dock-toggle-button {
            top: 80px;
            transform: translateY(0);
          }

          .side-dock-toggle-button:hover {
            transform: translateY(0) translateX(5px) scale(1.05);
          }

          .side-dock-toggle-button:active {
            transform: translateY(0) scale(0.95);
          }

          .side-dock-button {
            width: 52px;
            height: 52px;
          }

          .side-dock-toggle {
            width: 60px;
            height: 60px;
            top: 80px;
            transform: translateY(0);
          }

          .side-dock-toggle:hover {
            transform: translateY(0) translateX(5px) scale(1.05);
          }

          .side-dock-toggle:active {
            transform: translateY(0) scale(0.95);
          }
        }

        /* Additional iPhone Safari fixes */
        @media only screen
          and (max-width: 768px)
          and (-webkit-min-device-pixel-ratio: 2) {
          .side-dock-wrapper,
          .side-dock-toggle-button {
            position: fixed;
            will-change: transform;
            -webkit-overflow-scrolling: touch;
          }

          body {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

      <div className={`side-dock-wrapper ${!isVisible ? 'hidden' : ''}`}>
        <div className="side-dock-content">
          <div className="side-dock-bar">
            {onSmartButtonClick && (
              <>
                <button
                  className="side-dock-button side-dock-smart-button"
                  onClick={onSmartButtonClick}
                  title={texts.smartTooltip}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" />
                  <div className="relative text-2xl">
                    🤖
                  </div>
                </button>
                <div className="side-dock-divider" />
              </>
            )}

            <button
              className={`side-dock-button ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
              title={texts.homeTooltip}
            >
              <Home size={22} />
            </button>

            <button
              className={`side-dock-button ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate?.('account')}
              title={texts.accountTooltip}
            >
              <User size={22} />
            </button>

            <div className="side-dock-divider" />

            <button
              className="side-dock-button"
              onClick={() => window.open(`tel:${customPhoneNumber || texts.phoneNumber}`)}
              title={texts.phoneTooltip}
            >
              <Phone size={22} />
            </button>
          </div>
        </div>
      </div>

      <button
        className="side-dock-toggle-button"
        onClick={handleToggle}
        title={isVisible ? texts.hideTooltip : texts.showTooltip}
      >
        {isVisible ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
      </button>
    </>
  );
}
