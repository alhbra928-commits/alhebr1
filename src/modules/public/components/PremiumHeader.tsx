import { useState, useEffect } from 'react';
import { Menu, X, User, Shield, ArrowRight } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { AdminSessionService } from '../../admin/services/adminSessionService';

interface PremiumHeaderProps {
  onAdminLogin?: () => void;
  onInvestorLogin?: () => void;
  onVerifyCertificate?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PremiumHeader({ onAdminLogin, onInvestorLogin, onVerifyCertificate, onBackToAdmin, onFarmOwnerLogin }: PremiumHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      const { token } = AdminSessionService.getCurrentSession();
      setHasActiveSession(!!token);
    };

    checkSession();
    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'عن المنصة', href: '#about' },
    { label: 'تواصل معنا', href: '#contact' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: isScrolled
          ? 'rgba(46, 42, 38, 0.95)'
          : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        boxShadow: isScrolled
          ? '0 8px 32px rgba(0, 0, 0, 0.1)'
          : '0 2px 20px rgba(212, 175, 55, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="text-xl sm:text-2xl md:text-3xl font-black leading-tight"
              style={{
                background: isScrolled ? brandGradients.gold : brandGradients.gold,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.2))',
              }}
            >
              🌴 النخلة والزيتون
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="font-bold transition-all duration-300 hover:scale-110"
                style={{
                  color: isScrolled ? '#D4AF37' : brandColors.text.primary,
                  textShadow: isScrolled ? '0 0 10px rgba(212, 175, 55, 0.5)' : 'none',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {hasActiveSession && (
              <button
                onClick={onBackToAdmin}
                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-black transition-all duration-300 hover:scale-105 animate-pulse"
                style={{
                  background: brandGradients.gold,
                  color: 'white',
                  boxShadow: `0 4px 20px ${brandColors.primary.gold}60`,
                }}
              >
                <ArrowRight className="h-5 w-5" />
                <span>العودة للإدارة</span>
              </button>
            )}

            <button
              onClick={onVerifyCertificate}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(212,175,55,0.1)',
                color: brandColors.primary.gold,
                border: `2px solid ${brandColors.primary.gold}`
              }}
            >
              <Shield className="h-4 w-4" />
              <span>التحقق من الشهادة</span>
            </button>

            <button
              onClick={onFarmOwnerLogin}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(139, 195, 74, 0.5)',
              }}
            >
              <span>🎩</span>
              <span>لوحة صاحب المزرعة</span>
            </button>

            <button
              onClick={onInvestorLogin}
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white transition-all duration-300 hover:scale-105 investor-login-btn"
              style={{
                background: 'linear-gradient(135deg, #3D5B4B 0%, #5A8672 50%, #D4AF37 100%)',
                boxShadow: '0 4px 30px rgba(212, 175, 55, 0.5)',
              }}
            >
              <User className="h-5 w-5" />
              <span>لوحة المستثمر</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 touch-manipulation active:scale-95 transition-transform"
              style={{ color: isScrolled ? '#D4AF37' : brandColors.text.primary }}
            >
              {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className="md:hidden mt-4 py-4 rounded-xl shadow-xl animate-fadeIn"
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <nav className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="px-4 py-3 font-bold transition-all duration-300 active:bg-gray-100 touch-manipulation text-lg"
                  style={{ color: brandColors.text.primary }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="h-px bg-gray-200 mx-4 my-2"></div>

              {hasActiveSession && (
                <button
                  onClick={() => {
                    onBackToAdmin?.();
                    setMobileMenuOpen(false);
                  }}
                  className="mx-3 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-black text-white mb-2 touch-manipulation active:scale-95 transition-transform animate-pulse"
                  style={{
                    background: brandGradients.gold,
                    boxShadow: `0 4px 20px ${brandColors.primary.gold}60`,
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                  <span className="text-base">العودة للإدارة</span>
                </button>
              )}

              <button
                onClick={() => {
                  onVerifyCertificate?.();
                  setMobileMenuOpen(false);
                }}
                className="mx-3 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold mb-2 touch-manipulation active:scale-95 transition-transform"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  color: brandColors.primary.gold,
                  border: `2px solid ${brandColors.primary.gold}`
                }}
              >
                <Shield className="h-5 w-5" />
                <span className="text-base">التحقق من الشهادة</span>
              </button>

              <button
                onClick={() => {
                  onFarmOwnerLogin?.();
                  setMobileMenuOpen(false);
                }}
                className="mx-3 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white mb-2 touch-manipulation active:scale-95 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                  boxShadow: '0 4px 20px rgba(139, 195, 74, 0.5)',
                }}
              >
                <span>🎩</span>
                <span className="text-base">لوحة صاحب المزرعة</span>
              </button>

              <button
                onClick={() => {
                  onInvestorLogin?.();
                  setMobileMenuOpen(false);
                }}
                className="mx-3 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-white touch-manipulation active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #3D5B4B 0%, #5A8672 50%, #D4AF37 100%)' }}
              >
                <User className="h-5 w-5" />
                <span className="text-base">لوحة المستثمر</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 4px 30px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
          }
          50% {
            box-shadow: 0 4px 40px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.5);
          }
        }

        .investor-login-btn {
          animation: glow-pulse 4s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }

        .investor-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .investor-login-btn:hover::before {
          left: 100%;
        }
      `}</style>
    </header>
  );
}
