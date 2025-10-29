import React, { useState, useEffect } from 'react';
import { Home, Search, HelpCircle, User, Phone, Plus, Shield } from 'lucide-react';

interface PublicBottomNavBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onBookNow?: () => void;
  onBackToAdmin?: () => void;
}

export const PublicBottomNavBar: React.FC<PublicBottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onBookNow,
  onBackToAdmin
}) => {
  const [showContactMenu, setShowContactMenu] = useState(false);
  const [hasAdminSession, setHasAdminSession] = useState(false);

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = () => {
      const adminToken = localStorage.getItem('admin_session_token');
      const adminData = localStorage.getItem('admin_data');
      const hasSession = !!(adminToken || adminData);
      console.log('[PublicBottomNav] Has admin session:', hasSession);
      setHasAdminSession(hasSession);
    };

    checkAdminSession();
    const interval = setInterval(checkAdminSession, 2000);
    window.addEventListener('storage', checkAdminSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkAdminSession);
    };
  }, []);

  // Build nav items dynamically
  const navItems = [];

  // Add Back to Admin button if session exists
  if (hasAdminSession && onBackToAdmin) {
    navItems.push({
      id: 'back-to-admin',
      icon: <Shield className="w-6 h-6" />,
      label: 'الإدارة',
      onClick: onBackToAdmin,
      isSpecial: true
    });
  }

  // Add regular nav items
  navItems.push(
    {
      id: 'home',
      icon: <Home className="w-6 h-6" />,
      label: 'الرئيسية',
      onClick: () => {
        onTabChange('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      id: 'farms',
      icon: <Search className="w-6 h-6" />,
      label: 'المزارع',
      onClick: () => {
        onTabChange('farms');
        const farmsSection = document.getElementById('farms-section');
        if (farmsSection) {
          farmsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'concept',
      icon: <HelpCircle className="w-6 h-6" />,
      label: 'الفكرة',
      onClick: () => onTabChange('concept')
    },
    {
      id: 'login',
      icon: <User className="w-6 h-6" />,
      label: 'دخول',
      onClick: () => onTabChange('login')
    },
    {
      id: 'contact',
      icon: <Phone className="w-6 h-6" />,
      label: 'تواصل',
      onClick: () => setShowContactMenu(true)
    }
  );

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* Glassmorphism Background */}
        <div
          className="relative backdrop-blur-xl"
          style={{
            background: 'rgba(245, 241, 232, 0.85)',
            borderTop: '3px solid #D4AF37',
            boxShadow: '0 -4px 20px rgba(212, 175, 55, 0.25), 0 -1px 0 rgba(212, 175, 55, 0.5)'
          }}
        >
          {/* Navigation Items */}
          <div className="flex items-center justify-around relative px-2 py-2">
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              const isMiddle = index === Math.floor(navItems.length / 2);

              // Leave space for FAB in the middle
              if (isMiddle && onBookNow) {
                return <div key="fab-space" className="w-14"></div>;
              }

              // Special styling for Back to Admin button
              const isBackToAdmin = (item as any).isSpecial;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`
                    relative flex flex-col items-center justify-center
                    min-w-[60px] px-2 py-2 rounded-xl
                    transition-all duration-300
                    ${isActive ? 'scale-110' : 'scale-100'}
                    ${isBackToAdmin ? 'animate-pulse' : ''}
                    active:scale-95
                  `}
                  style={{
                    background: isBackToAdmin
                      ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)'
                      : isActive
                      ? 'rgba(160, 145, 106, 0.15)'
                      : 'transparent',
                    border: isBackToAdmin ? '2px solid #D4AF37' : 'none',
                    boxShadow: isBackToAdmin ? '0 2px 12px rgba(212, 175, 55, 0.4)' : 'none'
                  }}
                >
                  {/* Icon with glow effect */}
                  <div
                    className={`
                      transition-all duration-300
                      ${isBackToAdmin ? 'drop-shadow-[0_0_16px_rgba(212,175,55,1)]' : ''}
                      ${isActive ? 'drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]' : 'drop-shadow-[0_2px_4px_rgba(212,175,55,0.2)]'}
                    `}
                    style={{
                      color: isBackToAdmin ? '#D4AF37' : isActive ? '#D4AF37' : '#D4AF37',
                      filter: isBackToAdmin ? 'brightness(1.3)' : isActive ? 'brightness(1.2)' : 'brightness(0.95)'
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[11px] mt-1 font-medium transition-all duration-300
                      ${isBackToAdmin ? 'font-black' : isActive ? 'font-bold' : 'font-normal'}
                    `}
                    style={{
                      color: isBackToAdmin ? '#D4AF37' : isActive ? '#D4AF37' : '#B8993B',
                      textShadow: isBackToAdmin ? '0 2px 4px rgba(212, 175, 55, 0.5)' : isActive ? '0 1px 2px rgba(212, 175, 55, 0.3)' : 'none'
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator - Enhanced for Back to Admin */}
                  {(isActive || isBackToAdmin) && (
                    <div
                      className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 rounded-full ${isBackToAdmin ? 'w-2 h-2 animate-pulse' : 'w-1 h-1'}`}
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                        boxShadow: isBackToAdmin ? '0 0 16px rgba(212, 175, 55, 1)' : '0 0 10px rgba(212, 175, 55, 0.8)'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Floating Action Button (FAB) */}
          {onBookNow && (
            <button
              onClick={onBookNow}
              className="absolute left-1/2 transform -translate-x-1/2 -top-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #C9A962 0%, #A0916A 100%)',
                boxShadow: '0 4px 20px rgba(160, 145, 106, 0.5), 0 0 30px rgba(201, 169, 98, 0.3)'
              }}
            >
              <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />

              {/* Pulsing ring effect */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  background: 'linear-gradient(135deg, #C9A962 0%, #A0916A 100%)'
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Contact Menu Modal */}
      {showContactMenu && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowContactMenu(false)}
        >
          <div
            className="w-full max-w-md mb-20 mx-4 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="backdrop-blur-xl rounded-2xl p-6 shadow-2xl border"
              style={{
                background: 'rgba(245, 241, 232, 0.95)',
                borderColor: 'rgba(160, 145, 106, 0.2)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#8B7355' }}>
                تواصل معنا
              </h3>

              <div className="space-y-3">
                <a
                  href="https://wa.me/966569335257"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white'
                  }}
                >
                  <span className="text-2xl">💬</span>
                  <div className="flex-1">
                    <p className="font-bold">واتساب</p>
                    <p className="text-xs opacity-90">تواصل فوري</p>
                  </div>
                </a>

                <a
                  href="tel:+966569335257"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)',
                    color: 'white'
                  }}
                >
                  <span className="text-2xl">📞</span>
                  <div className="flex-1">
                    <p className="font-bold">اتصال مباشر</p>
                    <p className="text-xs opacity-90" dir="ltr">+966 56 933 5257</p>
                  </div>
                </a>

                <button
                  onClick={() => {
                    setShowContactMenu(false);
                    onTabChange('login');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white'
                  }}
                >
                  <span className="text-2xl">👤</span>
                  <div className="flex-1 text-right">
                    <p className="font-bold">دخول المستثمرين</p>
                    <p className="text-xs opacity-90">تابع حجوزاتك</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowContactMenu(false)}
                className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind the nav bar */}
      <div className="h-20"></div>
    </>
  );
};
