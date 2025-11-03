import React, { useState, useEffect } from 'react';
import { Home, User, Phone, Brain, ChevronRight } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && !isExpanded) {
        setIsExpanded(true);
      } else if (diff < 0 && isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  return (
    <>
      <style>{`
        .dock-wrapper {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10000;
        }

        .dock-container {
          position: relative;
          display: flex;
          align-items: center;
          transition: transform 0.3s ease;
          transform: translateX(0);
        }

        .dock-container.hidden {
          transform: translateX(calc(-100% + 80px));
        }

        .dock-bar {
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

        .dock-button {
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

        .dock-button:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: scale(1.05);
        }

        .dock-button:active {
          transform: scale(0.95);
        }

        .dock-button.active {
          background: rgba(16, 185, 129, 0.3);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .smart-button {
          background: linear-gradient(135deg, #8B4513, #A0522D);
          box-shadow: 0 0 20px rgba(139, 69, 19, 0.5);
        }

        .smart-button:hover {
          background: linear-gradient(135deg, #A0522D, #CD853F);
        }

        .dock-divider {
          width: 40px;
          height: 2px;
          background: rgba(16, 185, 129, 0.2);
          margin: 4px auto;
        }

        .toggle-button {
          position: relative;
          background: rgba(16, 185, 129, 0.2) !important;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }

        .toggle-button:hover {
          background: rgba(16, 185, 129, 0.3) !important;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
        }

        .swipe-area {
          position: fixed;
          left: 0;
          top: 0;
          width: 50px;
          height: 100vh;
          z-index: 9999;
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent);
        }

        .swipe-indicator {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60px;
          background: linear-gradient(180deg, transparent, #10b981, transparent);
          border-radius: 0 4px 4px 0;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @media (max-width: 768px) {
          .swipe-area {
            width: 60px;
          }

          .swipe-indicator {
            width: 5px;
            height: 80px;
          }
        }
      `}</style>

      {!isExpanded && (
        <div
          className="swipe-area"
          onClick={() => setIsExpanded(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="swipe-indicator" />
        </div>
      )}

      <div
        className="dock-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`dock-container ${!isExpanded ? 'hidden' : ''}`}>
          <div className="dock-bar">
            {onSmartButtonClick && (
              <>
                <button
                  className="dock-button smart-button"
                  onClick={onSmartButtonClick}
                >
                  <Brain size={24} />
                </button>
                <div className="dock-divider" />
              </>
            )}

            <button
              className={`dock-button ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
            >
              <Home size={22} />
            </button>

            <button
              className={`dock-button ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate?.('account')}
            >
              <User size={22} />
            </button>

            <div className="dock-divider" />

            <button
              className="dock-button"
              onClick={() => window.open(`tel:${phoneNumber}`)}
            >
              <Phone size={22} />
            </button>

            <div className="dock-divider" />

            <button
              className="dock-button toggle-button"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronRight size={22} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
