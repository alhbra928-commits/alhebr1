import React, { useState, useEffect } from 'react';
import { Home, User, Phone, Brain } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleContact = () => {
    window.open(`tel:${phoneNumber}`);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .innovative-dock-wrapper {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10000;
        }

        .innovative-dock-container {
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .innovative-dock-container.hidden {
          transform: translateX(-100%);
        }

        .dock-main-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        /* الشريط الرئيسي */
        .dock-bar {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px 12px;
          background: linear-gradient(135deg,
            rgba(0, 0, 0, 0.85) 0%,
            rgba(16, 185, 129, 0.15) 50%,
            rgba(0, 0, 0, 0.85) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 0 28px 28px 0;
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-left: none;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 40px rgba(16, 185, 129, 0.2);
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* اللسان البارز - دائم الظهور */
        .dock-tongue-always-visible {
          position: absolute;
          left: 0;
          top: 0;
          width: 32px;
          height: 80px;
          background: linear-gradient(90deg,
            rgba(0, 0, 0, 0.7) 0%,
            rgba(16, 185, 129, 0.2) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 0 16px 16px 0;
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-left: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          z-index: 10001;
        }

        .dock-tongue-always-visible:hover {
          left: 4px;
          width: 36px;
          background: linear-gradient(90deg,
            rgba(0, 0, 0, 0.8) 0%,
            rgba(16, 185, 129, 0.3) 100%
          );
        }

        /* النقاط على اللسان */
        .tongue-dots {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tongue-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg,
            rgba(52, 211, 153, 0.8),
            rgba(16, 185, 129, 0.8)
          );
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
          animation: glow 2s ease-in-out infinite;
        }

        .tongue-dot:nth-child(2) {
          animation-delay: 0.3s;
        }

        .tongue-dot:nth-child(3) {
          animation-delay: 0.6s;
        }

        /* زر الذكاء الاصطناعي - البني */
        .smart-ai-button {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          border: 2px solid rgba(251, 191, 36, 0.3);
          background: linear-gradient(135deg,
            rgba(120, 53, 15, 0.95) 0%,
            rgba(92, 40, 11, 0.98) 100%
          );
          color: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow:
            0 4px 20px rgba(120, 53, 15, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          animation: float 3s ease-in-out infinite;
        }

        .smart-ai-button:hover {
          transform: scale(1.1);
          border-color: rgba(251, 191, 36, 0.6);
          box-shadow:
            0 8px 32px rgba(120, 53, 15, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .smart-ai-button::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          background: linear-gradient(135deg,
            rgba(251, 191, 36, 0.3),
            rgba(245, 158, 11, 0.3)
          );
          filter: blur(10px);
          animation: pulse 2s ease-in-out infinite;
          z-index: -1;
        }

        /* أزرار التنقل */
        .nav-button {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-button:hover {
          transform: scale(1.05);
          border-color: rgba(16, 185, 129, 0.4);
          color: rgba(255, 255, 255, 0.9);
          background: rgba(16, 185, 129, 0.1);
        }

        .nav-button.active {
          border-color: rgba(16, 185, 129, 0.6);
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.2) 0%,
            rgba(5, 150, 105, 0.15) 100%
          );
          color: rgb(52, 211, 153);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
        }

        .nav-button.active::after {
          content: '';
          position: absolute;
          right: -14px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 30px;
          background: linear-gradient(180deg,
            rgba(52, 211, 153, 0.8),
            rgba(16, 185, 129, 0.8)
          );
          border-radius: 2px 0 0 2px;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
        }

        /* الفاصل */
        .dock-divider {
          width: 40px;
          height: 2px;
          margin: 4px auto;
          background: linear-gradient(90deg,
            transparent,
            rgba(16, 185, 129, 0.3),
            transparent
          );
        }

        /* Tooltip */
        .dock-tooltip {
          position: absolute;
          left: calc(100% + 16px);
          top: 50%;
          transform: translateY(-50%) translateX(-10px);
          padding: 10px 16px;
          background: rgba(0, 0, 0, 0.95);
          color: white;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          z-index: 10001;
          border: 1px solid rgba(16, 185, 129, 0.3);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .nav-button:hover .dock-tooltip,
        .smart-ai-button:hover .dock-tooltip {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dock-bar {
            padding: 16px 10px;
            gap: 10px;
          }

          .smart-ai-button,
          .nav-button {
            width: 50px;
            height: 50px;
          }

          .dock-tongue {
            width: 28px;
            height: 70px;
            right: -28px;
          }

          .dock-tongue:hover {
            right: -32px;
            width: 32px;
          }
        }

        @media (max-width: 480px) {
          .dock-bar {
            padding: 14px 8px;
            gap: 8px;
          }

          .smart-ai-button,
          .nav-button {
            width: 46px;
            height: 46px;
          }

          .dock-tongue {
            width: 24px;
            height: 60px;
            right: -24px;
          }

          .dock-tooltip {
            font-size: 13px;
            padding: 8px 14px;
          }
        }

        /* iPhone specific */
        @media (max-width: 430px) and (max-height: 932px) {
          .innovative-dock-container {
            left: 0;
          }

          .dock-bar {
            border-radius: 0 24px 24px 0;
          }
        }
      `}</style>

      <div className="innovative-dock-wrapper">
        <div className={`innovative-dock-container ${isExpanded ? '' : 'hidden'}`}>
          <div className="dock-main-wrapper">

            {/* الشريط الرئيسي */}
            <div className="dock-bar">

              {/* الزر الذكي - البني مع AI */}
              {onSmartButtonClick && (
                <button
                  className="smart-ai-button"
                  onClick={() => {
                    onSmartButtonClick();
                    if (navigator.vibrate) navigator.vibrate(10);
                  }}
                  aria-label="الذكاء الاصطناعي"
                >
                  <Brain size={26} strokeWidth={2.5} />
                  <span className="dock-tooltip">الذكاء الاصطناعي</span>
                </button>
              )}

              {onSmartButtonClick && <div className="dock-divider" />}

              {/* زر الرئيسية */}
              <button
                className={`nav-button ${currentSection === 'home' ? 'active' : ''}`}
                onClick={() => onNavigate?.('home')}
                aria-label="الرئيسية"
              >
                <Home size={22} strokeWidth={2} />
                <span className="dock-tooltip">الرئيسية</span>
              </button>

              {/* زر الحساب */}
              <button
                className={`nav-button ${currentSection === 'account' ? 'active' : ''}`}
                onClick={() => onNavigate?.('account')}
                aria-label="الحساب"
              >
                <User size={22} strokeWidth={2} />
                <span className="dock-tooltip">الحساب</span>
              </button>

              <div className="dock-divider" />

              {/* زر الاتصال */}
              <button
                className="nav-button"
                onClick={handleContact}
                aria-label="اتصل بنا"
              >
                <Phone size={22} strokeWidth={2} />
                <span className="dock-tooltip">اتصل بنا</span>
              </button>

            </div>

          </div>
        </div>

        {/* اللسان البارز - خارج الـ container */}
        <div
          className="dock-tongue-always-visible"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="tongue-dots">
            <div className="tongue-dot" />
            <div className="tongue-dot" />
            <div className="tongue-dot" />
          </div>
        </div>
      </div>
    </>
  );
}
