import React, { useState, useEffect } from 'react';
import { Home, User, Phone, Brain, ChevronRight, ChevronLeft } from 'lucide-react';

interface InnovativeSideDockProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  onSmartButtonClick?: () => void;
  phoneNumber?: string;
}

export function InnovativeSideDock({
  onNavigate,
  currentSection = 'home',
  onSmartButtonClick,
  phoneNumber = '966569335257'
}: InnovativeSideDockProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                >
                  <Brain size={24} />
                </button>
                <div className="side-dock-divider" />
              </>
            )}

            <button
              className={`side-dock-button ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
            >
              <Home size={22} />
            </button>

            <button
              className={`side-dock-button ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate?.('account')}
            >
              <User size={22} />
            </button>

            <div className="side-dock-divider" />

            <button
              className="side-dock-button"
              onClick={() => window.open(`tel:${phoneNumber}`)}
            >
              <Phone size={22} />
            </button>
          </div>
        </div>
      </div>

      <button
        className="side-dock-toggle-button"
        onClick={handleToggle}
        title={isVisible ? 'إخفاء الشريط' : 'إظهار الشريط'}
      >
        {isVisible ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
      </button>
    </>
  );
}
