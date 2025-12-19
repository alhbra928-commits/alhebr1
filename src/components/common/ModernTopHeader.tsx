import React, { useState, useEffect } from 'react';
import { Phone, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernTopHeaderProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
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
        /* Modern Header - Grid Shell Mode (NO position fixed) */
        .modern-header {
          position: relative;
          width: 100%;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(10, 20, 15, 0.98) 100%);
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
          box-shadow:
            0 4px 30px rgba(0, 0, 0, 0.4),
            0 1px 3px rgba(16, 185, 129, 0.1);

          /* iOS Safe Area Support */
          padding-top: max(env(safe-area-inset-top), 0px);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);

          /* Grid Shell: الثبات يأتي من parent */
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
          z-index: 9998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .mobile-menu-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        /* Mobile Menu - iOS Fixed */
        .mobile-menu {
          position: fixed;
          top: calc(72px + env(safe-area-inset-top));
          left: 16px;
          right: 16px;
          background: linear-gradient(135deg, rgba(10, 20, 15, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%);
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

          /* iOS Fix */
          -webkit-transform: translateY(-20px) translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .mobile-menu.open {
          transform: translateY(0);
          -webkit-transform: translateY(0) translateZ(0);
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

        /* Mobile Smart Button - Always Visible */
        .header-smart-btn-mobile {
          display: none;
        }

        /* Mobile Actions Group */
        .mobile-actions-group {
          display: none;
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

          /* Hide desktop phone button on mobile */
          .header-phone-btn {
            display: none;
          }

          /* Show mobile actions group */
          .mobile-actions-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          /* Show mobile smart button */
          .header-smart-btn-mobile {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 52px;
            height: 52px;
            border-radius: 14px;
            border: none;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            box-shadow:
              0 4px 20px rgba(16, 185, 129, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            flex-shrink: 0;
          }

          .header-smart-btn-mobile::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transform: translateX(-100%);
            animation: shimmer-smart 3s infinite;
          }

          .header-smart-btn-mobile:active {
            transform: scale(0.95);
          }

          .header-smart-btn-mobile .robot-icon {
            font-size: 28px;
          }

          .mobile-menu-btn {
            display: flex;
          }

        }

        /* Grid Shell handles spacing - no body padding needed */

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

          {/* Desktop Phone Button */}
          <button
            className="header-phone-btn"
            onClick={() => {
              const phoneNum = customPhoneNumber || texts.phoneNumber;
              console.log('Calling phone:', phoneNum);
              window.location.href = `tel:${phoneNum}`;
            }}
            title={texts.phoneTooltip}
          >
            <Phone size={18} />
            <span>{texts.phoneButton}</span>
          </button>

          {/* Mobile Actions Group */}
          <div className="mobile-actions-group">
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
            {/* Phone */}
            <div
              className="mobile-menu-item"
              onClick={() => {
                const phoneNum = customPhoneNumber || texts.phoneNumber;
                console.log('Mobile calling phone:', phoneNum);
                window.location.href = `tel:${phoneNum}`;
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
