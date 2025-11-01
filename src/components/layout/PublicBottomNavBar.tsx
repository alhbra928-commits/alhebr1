import React, { useState, useEffect } from 'react';
import { Home, Search, HelpCircle, User, Phone, Plus, Shield, MessageCircle, Users } from 'lucide-react';

interface PublicBottomNavBarProps {
  activeTab?: string;
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
      const sessionData = localStorage.getItem('admin_session');
      setHasAdminSession(!!sessionData);
    };

    checkAdminSession();
    const interval = setInterval(checkAdminSession, 1000);
    return () => clearInterval(interval);
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
        className="fixed bottom-0 left-0 right-0"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Background with gradient and 3D effect */}
        <div
          className="relative mx-auto max-w-7xl px-4"
          style={{
            background: 'linear-gradient(180deg, rgba(233, 245, 236, 0.98) 0%, rgba(220, 238, 227, 0.98) 100%)',
            backdropFilter: 'blur(16px) saturate(180%)',
            borderTop: '3px solid #10b981',
            boxShadow: '0 -4px 20px rgba(16, 185, 129, 0.25), 0 -1px 0 rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Navigation Items */}
          <div className="flex items-center justify-around relative px-2 py-2">
            {navItems.map((item, index) => {
              const isActive = activeTab && activeTab.length > 0 && activeTab === item.id;
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
                    relative flex flex-col items-center justify-center gap-1
                    min-w-[70px] px-2 py-2
                    transition-all duration-300 transform
                    ${isActive ? 'scale-105' : 'scale-100'}
                    active:scale-95
                    hover:scale-105
                  `}
                >
                  {/* 3D Glass Box - All Green */}
                  <div
                    className={`
                      relative flex items-center justify-center
                      w-12 h-12 rounded-xl
                      transition-all duration-300
                      ${isActive ? '-translate-y-1 scale-110' : ''}
                    `}
                    style={{
                      background: isBackToAdmin
                        ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      boxShadow: isActive
                        ? '0 8px 24px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                        : '0 6px 20px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                  >
                    {/* Icon - Always White */}
                    <div
                      className={`
                        transition-all duration-300 transform
                        ${isActive ? 'scale-110' : 'scale-100'}
                      `}
                      style={{
                        color: '#FFFFFF',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                      }}
                    >
                      {item.icon}
                    </div>

                    {/* Glass shine effect */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 50%, rgba(255, 255, 255, 0.3) 100%)'
                      }}
                    />

                    {/* Ripple effect on active */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-xl animate-ping opacity-30"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.6) 0%, rgba(52, 211, 153, 0.6) 100%)'
                        }}
                      />
                    )}

                    {/* Admin pulse effect */}
                    {isBackToAdmin && (
                      <div
                        className="absolute inset-0 rounded-xl animate-ping opacity-40"
                        style={{
                          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.6) 0%, rgba(4, 120, 87, 0.6) 100%)',
                          animationDuration: '2s'
                        }}
                      />
                    )}

                    {/* 3D depth layers */}
                    <div
                      className="absolute inset-[2px] rounded-[10px] opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)'
                      }}
                    />

                    {/* Bottom reflection */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-xl opacity-20"
                      style={{
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%)'
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[10px] font-bold transition-all duration-300
                      ${isBackToAdmin ? 'animate-pulse' : ''}
                    `}
                    style={{
                      color: isBackToAdmin
                        ? '#059669'
                        : isActive
                        ? '#10b981'
                        : '#047857',
                      textShadow: isBackToAdmin
                        ? '0 2px 4px rgba(5, 150, 105, 0.3)'
                        : isActive
                        ? '0 2px 4px rgba(16, 185, 129, 0.3)'
                        : '0 1px 2px rgba(4, 120, 87, 0.2)'
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Floating Action Button (FAB) - Green Theme */}
          {onBookNow && (
            <button
              onClick={onBookNow}
              className="absolute left-1/2 transform -translate-x-1/2 -top-9 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all duration-300 hover:scale-110 group"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.5), inset 0 -2px 0 rgba(0, 0, 0, 0.2)',
                border: '3px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Plus className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={3} />

              {/* Double pulsing ring effect */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, transparent 70%)',
                  animationDuration: '2s'
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 70%)',
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
          className="fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setShowContactMenu(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Menu Content */}
          <div
            className="relative w-full max-w-lg mx-4 mb-24 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #E9F5EC 0%, #DCEEE3 100%)',
              boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 py-4 text-center border-b-2"
              style={{
                borderColor: 'rgba(16, 185, 129, 0.2)',
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)'
              }}
            >
              <h3 className="text-xl font-bold" style={{ color: '#047857' }}>
                تواصل معنا
              </h3>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-3">
              {/* WhatsApp */}
              <a
                href="https://wa.me/966500000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-white font-bold text-lg">واتساب</div>
                  <div className="text-white/80 text-sm">تواصل فوري</div>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+966500000000"
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  }}
                >
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-bold text-lg" style={{ color: '#047857' }}>اتصال هاتفي</div>
                  <div className="text-sm" style={{ color: '#059669' }}>+966 50 000 0000</div>
                </div>
              </a>

              {/* Support */}
              <button
                onClick={() => {
                  setShowContactMenu(false);
                  onTabChange('concept');
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  }}
                >
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-bold text-lg" style={{ color: '#047857' }}>الدعم الفني</div>
                  <div className="text-sm" style={{ color: '#059669' }}>مساعدة واستفسارات</div>
                </div>
              </button>
            </div>

            {/* Close Button */}
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowContactMenu(false)}
                className="w-full py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  color: '#047857'
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
