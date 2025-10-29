import React, { useState, useEffect } from 'react';
import { Home, FileText, Bell, Menu, DollarSign, BarChart3, Plus } from 'lucide-react';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  hasNotification?: boolean;
  onClick: () => void;
}

interface BottomNavBarProps {
  userType: 'investor' | 'owner';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onActionClick?: () => void;
  notificationsCount?: number;
  newBookingsCount?: number;
  newCertificatesCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  userType,
  activeTab,
  onTabChange,
  onActionClick,
  notificationsCount = 0,
  newBookingsCount = 0,
  newCertificatesCount = 0
}) => {
  const [longPressItem, setLongPressItem] = useState<string | null>(null);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showAiHelper, setShowAiHelper] = useState(false);

  // Navigation items for Investor
  const investorNavItems: NavItem[] = [
    {
      id: 'home',
      icon: <Home className="w-6 h-6" />,
      label: 'الرئيسية',
      onClick: () => onTabChange('home')
    },
    {
      id: 'bookings',
      icon: <DollarSign className="w-6 h-6" />,
      label: 'حجوزاتي',
      badge: newBookingsCount,
      onClick: () => onTabChange('bookings')
    },
    {
      id: 'certificates',
      icon: <FileText className="w-6 h-6" />,
      label: 'شهاداتي',
      hasNotification: newCertificatesCount > 0,
      onClick: () => onTabChange('certificates')
    },
    {
      id: 'notifications',
      icon: <Bell className="w-6 h-6" />,
      label: 'الإشعارات',
      badge: notificationsCount,
      onClick: () => onTabChange('notifications')
    },
    {
      id: 'more',
      icon: <Menu className="w-6 h-6" />,
      label: 'المزيد',
      onClick: () => onTabChange('more')
    }
  ];

  // Navigation items for Farm Owner
  const ownerNavItems: NavItem[] = [
    {
      id: 'farms',
      icon: <Home className="w-6 h-6" />,
      label: 'مزارعي',
      onClick: () => onTabChange('farms')
    },
    {
      id: 'settlements',
      icon: <DollarSign className="w-6 h-6" />,
      label: 'التسويات',
      onClick: () => onTabChange('settlements')
    },
    {
      id: 'reports',
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'التقارير',
      onClick: () => onTabChange('reports')
    },
    {
      id: 'notifications',
      icon: <Bell className="w-6 h-6" />,
      label: 'الإشعارات',
      badge: notificationsCount,
      onClick: () => onTabChange('notifications')
    },
    {
      id: 'more',
      icon: <Menu className="w-6 h-6" />,
      label: 'المزيد',
      onClick: () => onTabChange('more')
    }
  ];

  const navItems = userType === 'investor' ? investorNavItems : ownerNavItems;

  // Long press handlers
  const handleTouchStart = (itemId: string) => {
    const timer = setTimeout(() => {
      setLongPressItem(itemId);
    }, 500); // 500ms for long press
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  // Close long press menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      if (longPressItem) {
        setLongPressItem(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [longPressItem]);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
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
              if (isMiddle && onActionClick) {
                return <div key="fab-space" className="w-14"></div>;
              }

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  onTouchStart={() => handleTouchStart(item.id)}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={() => handleTouchStart(item.id)}
                  onMouseUp={handleTouchEnd}
                  onMouseLeave={handleTouchEnd}
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
                  {/* Icon Container */}
                  <div className="relative">
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

                    {/* Badge (number) */}
                    {item.badge && item.badge > 0 && (
                      <div
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}

                    {/* Notification Dot */}
                    {item.hasNotification && !item.badge && (
                      <div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
                        style={{
                          background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)',
                          boxShadow: '0 0 8px rgba(160, 145, 106, 0.6)'
                        }}
                      />
                    )}
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
          {onActionClick && (
            <button
              onClick={onActionClick}
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

      {/* Long Press Quick View Menu */}
      {longPressItem === 'notifications' && (
        <div
          className="fixed bottom-20 left-4 right-4 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="backdrop-blur-xl rounded-2xl p-4 shadow-2xl border"
            style={{
              background: 'rgba(245, 241, 232, 0.95)',
              borderColor: 'rgba(160, 145, 106, 0.2)'
            }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: '#8B7355' }}>
              آخر الإشعارات
            </h3>

            {notificationsCount > 0 ? (
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 rounded-lg bg-white/50">
                  <Bell className="w-4 h-4 text-[#A0916A] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">
                      تم الموافقة على حجزك الجديد
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">منذ 5 دقائق</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-white/50">
                  <Bell className="w-4 h-4 text-[#A0916A] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2">
                      شهادة جديدة متاحة للتحميل
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">منذ ساعة</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">
                لا توجد إشعارات جديدة
              </p>
            )}

            <button
              onClick={() => {
                setLongPressItem(null);
                onTabChange('notifications');
              }}
              className="w-full mt-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)',
                color: 'white'
              }}
            >
              عرض الكل
            </button>
          </div>
        </div>
      )}

      {/* AI Helper Bubble */}
      {showAiHelper && (
        <div
          className="fixed bottom-24 right-4 z-[60] animate-in fade-in slide-in-from-right-4 duration-300"
          style={{ maxWidth: '280px' }}
        >
          <div
            className="backdrop-blur-xl rounded-2xl p-4 shadow-2xl border relative"
            style={{
              background: 'rgba(245, 241, 232, 0.95)',
              borderColor: 'rgba(160, 145, 106, 0.2)'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAiHelper(false)}
              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gray-200/50 flex items-center justify-center"
            >
              <span className="text-xs text-gray-600">✕</span>
            </button>

            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)'
                }}
              >
                <span className="text-sm">🤖</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800">
                  كيف يمكنني مساعدتك؟
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowAiHelper(false);
                  onTabChange('bookings');
                }}
                className="w-full p-2 rounded-lg text-right text-xs text-gray-700 hover:bg-white/50 transition-colors"
              >
                📊 معرفة حالة حجوزاتي
              </button>
              <button
                onClick={() => {
                  setShowAiHelper(false);
                  // Open WhatsApp or contact
                  window.open('https://wa.me/966569335257', '_blank');
                }}
                className="w-full p-2 rounded-lg text-right text-xs text-gray-700 hover:bg-white/50 transition-colors"
              >
                💬 التواصل مع الإدارة
              </button>
              <button
                onClick={() => {
                  setShowAiHelper(false);
                  onTabChange('certificates');
                }}
                className="w-full p-2 rounded-lg text-right text-xs text-gray-700 hover:bg-white/50 transition-colors"
              >
                📄 استعراض شهاداتي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Helper Icon (bottom right) */}
      <button
        onClick={() => setShowAiHelper(!showAiHelper)}
        className="fixed bottom-24 right-4 w-12 h-12 rounded-full shadow-xl flex items-center justify-center z-50 lg:hidden active:scale-95 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #A0916A 0%, #C9A962 100%)',
          boxShadow: '0 4px 15px rgba(160, 145, 106, 0.4)'
        }}
      >
        <span className="text-xl">🤖</span>
        {/* Pulsing effect */}
        {!showAiHelper && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              background: 'linear-gradient(135deg, #C9A962 0%, #A0916A 100%)'
            }}
          />
        )}
      </button>

      {/* Spacer to prevent content from being hidden behind the nav bar */}
      <div className="h-20 lg:hidden"></div>
    </>
  );
};
