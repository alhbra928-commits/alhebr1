import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, DollarSign, Settings, MessageSquare, Brain } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'users', icon: Users, label: 'المستخدمين' },
    { id: 'documentation', icon: FileText, label: 'التوثيق' },
    { id: 'finance', icon: DollarSign, label: 'المالية' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' }
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .dock-container {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dock-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 12px;
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.1) 0%,
            rgba(5, 150, 105, 0.08) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .dock-button {
          position: relative;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
        }

        .dock-button:hover {
          transform: scale(1.1);
          color: rgba(255, 255, 255, 1);
        }

        .dock-button.active {
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.3) 0%,
            rgba(5, 150, 105, 0.25) 100%
          );
          color: rgb(52, 211, 153);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .dock-button.active::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          padding: 2px;
          background: linear-gradient(135deg,
            rgba(52, 211, 153, 0.5),
            rgba(16, 185, 129, 0.5)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .smart-button {
          position: relative;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg,
            rgba(120, 53, 15, 0.95) 0%,
            rgba(92, 40, 11, 0.98) 100%
          );
          color: white;
          box-shadow: 0 4px 16px rgba(120, 53, 15, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
        }

        .smart-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(120, 53, 15, 0.6);
        }

        .smart-button::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 18px;
          background: linear-gradient(135deg,
            rgba(251, 191, 36, 0.4),
            rgba(245, 158, 11, 0.4)
          );
          filter: blur(8px);
          animation: pulse-glow 2s ease-in-out infinite;
          z-index: -1;
        }

        .whatsapp-button {
          position: relative;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.2) 0%,
            rgba(5, 150, 105, 0.15) 100%
          );
          color: rgb(52, 211, 153);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .whatsapp-button:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg,
            rgba(16, 185, 129, 0.3) 0%,
            rgba(5, 150, 105, 0.25) 100%
          );
        }

        .divider {
          width: 32px;
          height: 1px;
          margin: 4px auto;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
        }

        .tooltip {
          position: absolute;
          left: 72px;
          top: 50%;
          transform: translateY(-50%);
          padding: 8px 16px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10001;
        }

        .dock-button:hover .tooltip,
        .smart-button:hover .tooltip,
        .whatsapp-button:hover .tooltip {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .dock-container {
            left: 12px;
          }

          .dock-wrapper {
            padding: 12px 8px;
          }

          .dock-button,
          .smart-button,
          .whatsapp-button {
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      <div className="dock-container">
        <div className="dock-wrapper">

          {/* Smart Button */}
          {onSmartButtonClick && (
            <button
              className="smart-button"
              onClick={() => {
                onSmartButtonClick();
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              aria-label="الزر الذكي"
            >
              <Brain size={24} strokeWidth={2} />
              <span className="tooltip">الزر الذكي</span>
            </button>
          )}

          {onSmartButtonClick && <div className="divider" />}

          {/* Navigation Buttons */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`dock-button ${currentSection === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
              >
                <Icon size={20} strokeWidth={2} />
                <span className="tooltip">{item.label}</span>
              </button>
            );
          })}

          {/* WhatsApp Button */}
          {phoneNumber && (
            <>
              <div className="divider" />
              <button
                className="whatsapp-button"
                onClick={() => {
                  const message = encodeURIComponent('مرحباً! أود الاستفسار عن المنصة');
                  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                  if (navigator.vibrate) navigator.vibrate(10);
                }}
                aria-label="واتساب"
              >
                <MessageSquare size={20} strokeWidth={2} />
                <span className="tooltip">واتساب</span>
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
