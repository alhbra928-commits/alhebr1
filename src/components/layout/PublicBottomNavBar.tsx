import React, { useState } from 'react';
import { Home, Search, HelpCircle, User, Phone, Plus } from 'lucide-react';

interface PublicBottomNavBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onBookNow?: () => void;
}

export const PublicBottomNavBar: React.FC<PublicBottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onBookNow
}) => {
  const [showContactMenu, setShowContactMenu] = useState(false);

  const navItems = [
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
  ];

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
          className="relative backdrop-blur-xl border-t"
          style={{
            background: 'rgba(245, 241, 232, 0.85)',
            borderColor: 'rgba(160, 145, 106, 0.2)',
            boxShadow: '0 -4px 20px rgba(139, 115, 85, 0.1)'
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

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`
                    relative flex flex-col items-center justify-center
                    min-w-[60px] px-2 py-2 rounded-xl
                    transition-all duration-300
                    ${isActive ? 'scale-110' : 'scale-100'}
                    active:scale-95
                  `}
                  style={{
                    background: isActive
                      ? 'rgba(160, 145, 106, 0.15)'
                      : 'transparent'
                  }}
                >
                  {/* Icon with glow effect when active */}
                  <div
                    className={`
                      transition-all duration-300
                      ${isActive ? 'drop-shadow-[0_0_8px_rgba(160,145,106,0.6)]' : ''}
                    `}
                    style={{
                      color: isActive ? '#A0916A' : '#6B7280'
                    }}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-[11px] mt-1 font-medium transition-all duration-300
                      ${isActive ? 'font-bold' : 'font-normal'}
                    `}
                    style={{
                      color: isActive ? '#A0916A' : '#9CA3AF'
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)',
                        boxShadow: '0 0 8px rgba(160, 145, 106, 0.6)'
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
