import React, { useState, useEffect } from 'react';
import { Home, User, Phone, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [texts, setTexts] = useState<HeaderTexts>({
    homeButton: 'الرئيسية',
    accountButton: 'الحساب',
    phoneButton: 'اتصل بنا',
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
        /* Modern Header */
        .modern-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(10, 20, 15, 0.98) 100%);
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          box-shadow:
            0 4px 30px rgba(0, 0, 0, 0.4),
            0 1px 3px rgba(16, 185, 129, 0.1);
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* Logo Section */
        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .header-logo:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          font-size: 32px;
          filter: drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .logo-text {
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        /* Navigation Desktop */
        .header-nav-desktop {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: center;
        }

        /* Smart Button - Featured */
        .header-smart-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow:
            0 4px 20px rgba(16, 185, 129, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .header-smart-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%);
          animation: shimmer-smart 3s infinite;
        }

        @keyframes shimmer-smart {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        .header-smart-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 8px 30px rgba(16, 185, 129, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .header-smart-btn:active {
          transform: translateY(0) scale(0.98);
        }

        .robot-icon {
          font-size: 24px;
          animation: wave 2s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        /* Regular Nav Buttons */
        .header-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .header-nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }

        .header-nav-btn.active {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        .header-nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          border-radius: 2px;
        }

        /* Phone Button - CTA Style */
        .header-phone-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 2px solid rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .header-phone-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.6);
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .header-phone-btn:active {
          transform: scale(0.95);
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:active {
          transform: scale(0.95);
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 72px;
          left: 16px;
          right: 16px;
          background: linear-gradient(135deg, rgba(10, 20, 15, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%);
          backdrop-filter: blur(25px);
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(16, 185, 129, 0.1);
          z-index: 9999;
          padding: 20px;
          transform: translateY(-20px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-menu.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-menu-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mobile-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .mobile-menu-item:active {
          transform: scale(0.98);
        }

        .mobile-menu-item.active {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .mobile-menu-item.smart {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .mobile-menu-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent);
          margin: 8px 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px;
          }

          .logo-icon {
            font-size: 28px;
          }

          .logo-text {
            font-size: 20px;
          }

          .header-nav-desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          body {
            padding-top: 64px;
          }
        }

        @media (min-width: 769px) {
          body {
            padding-top: 72px;
          }
        }

        /* Prevent body scroll when menu is open */
        body.menu-open {
          overflow: hidden;
        }
      `}</style>

      <header className="modern-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo" onClick={() => onNavigate?.('home')}>
            <span className="logo-icon">🌿</span>
            <span className="logo-text">مزادات</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav-desktop">
            {/* Smart Button - Featured */}
            {onSmartButtonClick && (
              <button
                className="header-smart-btn"
                onClick={onSmartButtonClick}
                title={texts.smartTooltip}
              >
                <span className="robot-icon">🤖</span>
                <span>{texts.smartButton}</span>
              </button>
            )}

            {/* Regular Nav Buttons */}
            <button
              className={`header-nav-btn ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate?.('home')}
              title={texts.homeTooltip}
            >
              <Home size={18} />
              <span>{texts.homeButton}</span>
            </button>

            <button
              className={`header-nav-btn ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate?.('account')}
              title={texts.accountTooltip}
            >
              <User size={18} />
              <span>{texts.accountButton}</span>
            </button>
          </nav>

          {/* Desktop Phone Button */}
          <button
            className="header-phone-btn"
            onClick={() => window.open(`tel:${customPhoneNumber || texts.phoneNumber}`)}
            title={texts.phoneTooltip}
            style={{ display: window.innerWidth > 768 ? 'flex' : 'none' }}
          >
            <Phone size={18} />
            <span>{texts.phoneButton}</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              document.body.classList.toggle('menu-open', !mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => {
            setMobileMenuOpen(false);
            document.body.classList.remove('menu-open');
          }}
        />

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            {/* Smart Assistant */}
            {onSmartButtonClick && (
              <>
                <div
                  className="mobile-menu-item smart"
                  onClick={() => {
                    onSmartButtonClick();
                    setMobileMenuOpen(false);
                    document.body.classList.remove('menu-open');
                  }}
                >
                  <span style={{ fontSize: '24px' }}>🤖</span>
                  <span>{texts.smartButton}</span>
                </div>
                <div className="mobile-menu-divider" />
              </>
            )}

            {/* Home */}
            <div
              className={`mobile-menu-item ${currentSection === 'home' ? 'active' : ''}`}
              onClick={() => {
                onNavigate?.('home');
                setMobileMenuOpen(false);
                document.body.classList.remove('menu-open');
              }}
            >
              <Home size={20} />
              <span>{texts.homeButton}</span>
            </div>

            {/* Account */}
            <div
              className={`mobile-menu-item ${currentSection === 'account' ? 'active' : ''}`}
              onClick={() => {
                onNavigate?.('account');
                setMobileMenuOpen(false);
                document.body.classList.remove('menu-open');
              }}
            >
              <User size={20} />
              <span>{texts.accountButton}</span>
            </div>

            <div className="mobile-menu-divider" />

            {/* Phone */}
            <div
              className="mobile-menu-item"
              onClick={() => {
                window.open(`tel:${customPhoneNumber || texts.phoneNumber}`);
                setMobileMenuOpen(false);
                document.body.classList.remove('menu-open');
              }}
            >
              <Phone size={20} />
              <span>{texts.phoneButton}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
