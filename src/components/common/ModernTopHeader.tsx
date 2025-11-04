import React, { useState, useEffect } from 'react';
import { Home, User, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernTopHeaderProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  onSmartButtonClick?: () => void;
  phoneNumber?: string;
}

interface HeaderTexts {
  homeButton: string;
  accountButton: string;
  phoneButton: string;
  smartButton: string;
  homeTooltip: string;
  accountTooltip: string;
  phoneTooltip: string;
  smartTooltip: string;
  phoneNumber: string;
}

export function ModernTopHeader({
  onNavigate,
  currentSection = 'home',
  onSmartButtonClick,
  phoneNumber: customPhoneNumber
}: ModernTopHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [texts, setTexts] = useState<HeaderTexts>({
    homeButton: 'الرئيسية',
    accountButton: 'الحساب',
    phoneButton: 'اتصل',
    smartButton: 'المساعد الذكي',
    homeTooltip: 'الصفحة الرئيسية',
    accountTooltip: 'حسابي',
    phoneTooltip: 'اتصل بنا',
    smartTooltip: 'المساعد الذكي',
    phoneNumber: '966569335257'
  });

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
      }
    } catch (error) {
      console.error('Error loading header texts:', error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        .modern-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(16, 185, 129, 0.3);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .header-logo {
          font-size: 20px;
          font-weight: 900;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: -0.5px;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }

        .header-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .header-button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .header-button:active {
          transform: translateY(0);
        }

        .header-button.active {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .header-button.active::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        .header-smart-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
          position: relative;
          overflow: hidden;
        }

        .header-smart-button:hover {
          box-shadow: 0 6px 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        .header-smart-button .shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer-header 3s infinite;
        }

        @keyframes shimmer-header {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .robot-emoji {
          font-size: 20px;
          animation: bounce-subtle 2s infinite;
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .header-container {
            padding: 10px 12px;
          }

          .header-logo {
            font-size: 16px;
          }

          .header-nav {
            gap: 4px;
          }

          .header-button {
            padding: 8px 12px;
            font-size: 12px;
            gap: 6px;
          }

          .header-button svg {
            width: 16px;
            height: 16px;
          }

          .header-button span {
            display: none;
          }

          .robot-emoji {
            font-size: 18px;
          }
        }

        @media (min-width: 769px) {
          .header-button .icon-only {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .header-button .icon-only {
            display: inline;
          }
          .header-button .text-label {
            display: none;
          }
        }

        /* Add padding to body to prevent content from going under header */
        body {
          padding-top: 68px;
        }

        @media (max-width: 768px) {
          body {
            padding-top: 60px;
          }
        }
      `}</style>

      <header className="modern-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo">
            <span className="text-2xl">🌿</span>
            <span>مزادات</span>
          </div>

          {/* Navigation */}
          <nav className="header-nav">
            {onSmartButtonClick && (
              <button
                className="header-button header-smart-button"
                onClick={onSmartButtonClick}
                title={texts.smartTooltip}
              >
                <div className="shimmer" />
                <span className="robot-emoji">🤖</span>
                <span className="text-label">{texts.smartButton}</span>
              </button>
            )}

            <button
              className={`header-button ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
              title={texts.homeTooltip}
            >
              <Home size={18} />
              <span className="text-label">{texts.homeButton}</span>
            </button>

            <button
              className={`header-button ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate?.('account')}
              title={texts.accountTooltip}
            >
              <User size={18} />
              <span className="text-label">{texts.accountButton}</span>
            </button>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button
              className="header-button"
              onClick={() => window.open(`tel:${customPhoneNumber || texts.phoneNumber}`)}
              title={texts.phoneTooltip}
            >
              <Phone size={18} />
              <span className="text-label">{texts.phoneButton}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
