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
            background: 'linear-gradient(180deg, rgba(233, 245, 236, 0.98) 0%, rgba(233, 245, 236, 0.95) 100%)',
            borderTop: '3px solid #10b981',
            boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.25), 0 -1px 0 rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
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
                    min-w-[60px] px-3 py-2.5 rounded-2xl
                    transition-all duration-300 transform
                    ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}
                    ${isBackToAdmin ? 'animate-pulse' : ''}
                    active:scale-95 active:translate-y-0
                    hover:scale-105
                  `}
                  style={{
                    background: isBackToAdmin
                      ? 'linear-gradient(135deg, rgba(199, 167, 66, 0.25) 0%, rgba(199, 167, 66, 0.15) 100%)'
                      : isActive
                      ? 'linear-gradient(135deg, rgba(199, 167, 66, 0.2) 0%, rgba(199, 167, 66, 0.1) 100%)'
                      : 'transparent',
                    border: isBackToAdmin
                      ? '2px solid rgba(199, 167, 66, 0.4)'
                      : isActive
                      ? '2px solid rgba(199, 167, 66, 0.3)'
                      : 'none',
                    boxShadow: isBackToAdmin
                      ? '0 4px 16px rgba(199, 167, 66, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      : isActive
                      ? '0 4px 12px rgba(199, 167, 66, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      : 'none'
                  }}
                >
                  {/* Icon with 3D effect and glow */}
                  <div
                    className={`
                      relative transition-all duration-300 transform
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `}
                    style={{
                      filter: isBackToAdmin
                        ? 'drop-shadow(0 4px 8px rgba(199, 167, 66, 0.5)) drop-shadow(0 0 12px rgba(199, 167, 66, 0.8))'
                        : isActive
                        ? 'drop-shadow(0 3px 6px rgba(199, 167, 66, 0.4)) drop-shadow(0 0 10px rgba(199, 167, 66, 0.6))'
                        : 'drop-shadow(0 2px 3px rgba(12, 102, 51, 0.3))'
                    }}
                  >
                    <div
                      style={{
                        color: isBackToAdmin ? '#C7A742' : isActive ? '#C7A742' : '#0C6633'
                      }}
                    >
                      {item.icon}
                    </div>

                    {/* Ripple effect on active */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          background: 'radial-gradient(circle, rgba(199, 167, 66, 0.4) 0%, transparent 70%)'
                        }}
                      />
                    )}
                  </div>

                  {/* Label with shadow */}
                  <span
                    className={`
                      text-[11px] mt-1.5 font-medium transition-all duration-300
                      ${isBackToAdmin ? 'font-black' : isActive ? 'font-bold' : 'font-semibold'}
                    `}
                    style={{
                      color: isBackToAdmin ? '#C7A742' : isActive ? '#C7A742' : '#0C6633',
                      textShadow: isBackToAdmin
                        ? '0 2px 6px rgba(199, 167, 66, 0.6)'
                        : isActive
                        ? '0 2px 4px rgba(199, 167, 66, 0.4)'
                        : '0 1px 2px rgba(12, 102, 51, 0.2)'
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator with glow */}
                  {(isActive || isBackToAdmin) && (
                    <div
                      className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 rounded-full ${isBackToAdmin ? 'w-2.5 h-2.5 animate-pulse' : 'w-1.5 h-1.5'}`}
                      style={{
                        background: 'linear-gradient(135deg, #C7A742 0%, #F4E4A6 100%)',
                        boxShadow: isBackToAdmin
                          ? '0 0 20px rgba(199, 167, 66, 1), 0 0 40px rgba(199, 167, 66, 0.5)'
                          : '0 0 16px rgba(199, 167, 66, 0.8), 0 0 30px rgba(199, 167, 66, 0.4)'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Floating Action Button (FAB) - 3D Enhanced */}
          {onBookNow && (
            <button
              onClick={onBookNow}
              className="absolute left-1/2 transform -translate-x-1/2 -top-9 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all duration-300 hover:scale-110 group"
              style={{
                background: 'linear-gradient(135deg, #C7A742 0%, #E4C56A 50%, #C7A742 100%)',
                boxShadow: '0 8px 24px rgba(199, 167, 66, 0.6), 0 0 40px rgba(199, 167, 66, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.2)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Plus className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={3} />

              {/* Double pulsing ring effect */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{
                  background: 'radial-gradient(circle, rgba(199, 167, 66, 0.8) 0%, transparent 70%)',
                  animationDuration: '2s'
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(199, 167, 66, 0.6) 0%, transparent 70%)',
                  animationDuration: '3s',
                  animationDelay: '0.5s'
                }}
              />

              {/* Rotating glow */}
              <div
                className="absolute inset-0 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'spin 3s linear infinite'
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
              className="backdrop-blur-xl rounded-2xl p-6 shadow-2xl border-2"
              style={{
                background: 'linear-gradient(180deg, rgba(233, 245, 236, 0.98) 0%, rgba(233, 245, 236, 0.95) 100%)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                boxShadow: '0 20px 50px rgba(16, 185, 129, 0.2)'
              }}
            >
              <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#0C6633' }}>
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
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #C7A742 0%, #E4C56A 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(199, 167, 66, 0.3)'
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
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(12, 102, 51, 0.1) 0%, rgba(12, 102, 51, 0.05) 100%)',
                  color: '#0C6633',
                  border: '2px solid rgba(12, 102, 51, 0.2)'
                }}
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
