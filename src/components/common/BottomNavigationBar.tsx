import { useState, useEffect } from 'react';
import { Home, User, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BottomNavigationBarProps {
  currentSection?: string;
  onNavigate?: (section: string) => void;
  onSmartButtonClick?: () => void;
  phoneNumber?: string;
}

interface BottomNavTexts {
  homeButton: string;
  accountButton: string;
  phoneButton: string;
  smartButton: string;
  phoneNumber: string;
}

export function BottomNavigationBar({
  currentSection = 'home',
  onNavigate,
  onSmartButtonClick,
  phoneNumber: customPhoneNumber
}: BottomNavigationBarProps) {
  const [texts, setTexts] = useState<BottomNavTexts>({
    homeButton: 'الرئيسية',
    accountButton: 'حسابي',
    phoneButton: 'اتصل',
    smartButton: 'المساعد',
    phoneNumber: '966569335257'
  });

  useEffect(() => {
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
      }
    } catch (error) {
      console.error('Error loading bottom nav texts:', error);
    }
  };

  return (
    <>
      <style>{`
        .bottom-nav-bar {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 999999 !important;

          background: linear-gradient(180deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.98) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          border-top: 1px solid rgba(16, 185, 129, 0.1);
          box-shadow:
            0 -4px 20px rgba(0, 0, 0, 0.08),
            0 -1px 3px rgba(0, 0, 0, 0.05);

          /* ULTIMATE iOS Safari Fix */
          transform: translate3d(0, 0, 0) !important;
          -webkit-transform: translate3d(0, 0, 0) !important;
          -webkit-backface-visibility: hidden !important;
          backface-visibility: hidden !important;

          /* Lock position completely */
          will-change: transform, opacity !important;
          contain: layout style paint !important;
          isolation: isolate !important;

          /* iOS Safe Area Support */
          padding-bottom: env(safe-area-inset-bottom);
          padding-bottom: max(env(safe-area-inset-bottom), 20px);
        }

        /* Force separate rendering layer */
        .bottom-nav-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          transform: translateZ(-1px);
          will-change: transform;
        }

        /* NUCLEAR OPTION: iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          .bottom-nav-bar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            transform: translate3d(0, 0, 0) !important;
            -webkit-transform: translate3d(0, 0, 0) !important;

            /* Force separate layer */
            -webkit-perspective: 1000px !important;
            perspective: 1000px !important;

            /* Lock it down */
            pointer-events: auto !important;
            touch-action: manipulation !important;
          }

          /* Make sure body doesn't cover it */
          body {
            padding-bottom: max(90px, calc(90px + env(safe-area-inset-bottom))) !important;
          }
        }

        .bottom-nav-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          max-width: 100%;
          padding: 8px 8px 0 8px;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 8px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: rgba(107, 114, 128, 0.8);
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;

          /* Prevent iOS highlight */
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
        }

        .bottom-nav-item:active {
          transform: scale(0.95);
        }

        .bottom-nav-item.active {
          color: #10b981;
        }

        .bottom-nav-item.active .nav-icon-wrapper {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .bottom-nav-item.active .nav-icon-wrapper svg {
          color: white;
        }

        /* Icon Wrapper */
        .nav-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(243, 244, 246, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .bottom-nav-item:hover .nav-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          transform: translateY(-2px);
        }

        .nav-icon-wrapper svg {
          position: relative;
          z-index: 1;
          transition: all 0.2s ease;
        }

        /* Smart Button - Special Featured Style */
        .bottom-nav-item.smart .nav-icon-wrapper {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .bottom-nav-item.smart .nav-icon-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: translateX(-100%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .bottom-nav-item.smart .nav-icon-wrapper svg {
          color: white;
          animation: pulse-icon 2s ease-in-out infinite;
        }

        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .bottom-nav-item.smart {
          color: #10b981;
          font-weight: 700;
        }

        /* Label */
        .nav-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .bottom-nav-item.active .nav-label {
          font-weight: 700;
        }

        /* Phone Button - CTA Style */
        .bottom-nav-item.phone .nav-icon-wrapper {
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid rgba(16, 185, 129, 0.3);
        }

        .bottom-nav-item.phone .nav-icon-wrapper svg {
          color: #10b981;
        }

        .bottom-nav-item.phone:hover .nav-icon-wrapper {
          border-color: rgba(16, 185, 129, 0.5);
        }

        .bottom-nav-item.phone {
          color: #10b981;
        }

        /* Prevent body scroll issues */
        body {
          padding-bottom: calc(76px + env(safe-area-inset-bottom));
        }

        /* Responsive adjustments */
        @media (max-width: 380px) {
          .bottom-nav-container {
            padding: 6px 4px 0 4px;
          }

          .bottom-nav-item {
            padding: 8px 4px;
            font-size: 10px;
          }

          .nav-icon-wrapper {
            width: 44px;
            height: 44px;
          }

          .nav-label {
            font-size: 10px;
          }
        }
      `}</style>

      <nav className="bottom-nav-bar" dir="rtl">
        <div className="bottom-nav-container">
          {/* Home */}
          <button
            className={`bottom-nav-item ${currentSection === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate?.('home')}
          >
            <div className="nav-icon-wrapper">
              <Home size={22} />
            </div>
            <span className="nav-label">{texts.homeButton}</span>
          </button>

          {/* Account */}
          <button
            className={`bottom-nav-item ${currentSection === 'account' ? 'active' : ''}`}
            onClick={() => onNavigate?.('account')}
          >
            <div className="nav-icon-wrapper">
              <User size={22} />
            </div>
            <span className="nav-label">{texts.accountButton}</span>
          </button>

          {/* Smart Assistant - Featured */}
          {onSmartButtonClick && (
            <button
              className="bottom-nav-item smart"
              onClick={onSmartButtonClick}
            >
              <div className="nav-icon-wrapper">
                <MessageCircle size={22} />
              </div>
              <span className="nav-label">{texts.smartButton}</span>
            </button>
          )}

          {/* Phone */}
          <button
            className="bottom-nav-item phone"
            onClick={() => window.open(`tel:${customPhoneNumber || texts.phoneNumber}`)}
          >
            <div className="nav-icon-wrapper">
              <Phone size={22} />
            </div>
            <span className="nav-label">{texts.phoneButton}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
