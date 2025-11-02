import { Home, Leaf, MessageCircle, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SmartBottomNavBarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

/**
 * 🎯 شريط التنقل السفلي الذكي
 *
 * ميزات متقدمة:
 * - ثابت بشكل دائم في الأسفل (لا مشاكل iPhone)
 * - تصميم زجاجي أخضر فاخر بدرجتين
 * - أيقونات 3D تفاعلية
 * - تنقل سريع بدون reload
 * - يعمل مثل التطبيقات الأصلية
 * - Safe area للأجهزة الحديثة
 */
export function SmartBottomNavBar({ activeTab, onNavigate }: SmartBottomNavBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: Home,
      gradient: 'from-emerald-400 to-green-500'
    },
    {
      id: 'farms',
      label: 'المزارع',
      icon: Leaf,
      gradient: 'from-green-400 to-emerald-600'
    },
    {
      id: 'contact',
      label: 'تواصل',
      icon: MessageCircle,
      gradient: 'from-teal-400 to-emerald-500'
    },
    {
      id: 'account',
      label: 'حسابي',
      icon: UserCircle,
      gradient: 'from-green-500 to-teal-600'
    }
  ];

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-[9999]
        transition-opacity duration-300
        ${mounted ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {/* خلفية زجاجية بدرجتين */}
      <div className="relative">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(209, 250, 229, 0.88) 0%, rgba(167, 243, 208, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />

        {/* Top Border Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.5) 50%, transparent 100%)',
            boxShadow: '0 -1px 8px rgba(16, 185, 129, 0.2)'
          }}
        />

        {/* Glass Reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-12 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%)'
          }}
        />

        {/* Navigation Items */}
        <div className="relative flex items-center justify-around px-4 py-3 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  relative flex flex-col items-center gap-1.5 px-5 py-2.5
                  rounded-2xl transition-all duration-300 ease-out
                  active:scale-95 touch-manipulation
                  ${isActive ? 'transform -translate-y-1' : 'transform translate-y-0'}
                `}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: '70px'
                }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <>
                    {/* Outer Glow */}
                    <div
                      className="absolute inset-0 rounded-2xl animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                        filter: 'blur(8px)',
                        transform: 'scale(1.2)'
                      }}
                    />
                    {/* Inner Background */}
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
                        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.5), 0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    />
                  </>
                )}

                {/* Icon Container with 3D Effect */}
                <div className="relative z-10">
                  {/* Icon Shadow for 3D */}
                  {isActive && (
                    <div
                      className="absolute inset-0 blur-md"
                      style={{
                        background: `radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, transparent 60%)`,
                        transform: 'translateY(3px)'
                      }}
                    />
                  )}

                  {/* Main Icon */}
                  <div
                    className={`
                      relative transition-all duration-300
                      ${isActive ? 'scale-110' : 'scale-100'}
                    `}
                    style={{
                      filter: isActive
                        ? 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.6))'
                        : 'drop-shadow(0 1px 2px rgba(5, 150, 105, 0.3))',
                      transform: isActive ? 'translateZ(10px)' : 'translateZ(0)',
                      perspective: '1000px'
                    }}
                  >
                    <Icon
                      size={26}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`
                        transition-all duration-300
                        ${isActive ? 'text-emerald-600' : 'text-emerald-700'}
                      `}
                      style={{
                        filter: isActive ? 'brightness(1.2)' : 'brightness(1)'
                      }}
                    />
                  </div>

                  {/* Highlight Dot */}
                  {isActive && (
                    <div
                      className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"
                      style={{
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    relative z-10 text-xs font-semibold transition-all duration-300
                    ${isActive ? 'text-emerald-700 scale-105' : 'text-emerald-800 scale-100'}
                  `}
                  style={{
                    textShadow: isActive
                      ? '0 1px 4px rgba(16, 185, 129, 0.3)'
                      : '0 1px 2px rgba(5, 150, 105, 0.2)',
                    fontWeight: isActive ? 700 : 600
                  }}
                >
                  {item.label}
                </span>

                {/* Active Indicator Line */}
                {isActive && (
                  <div
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.8) 50%, transparent 100%)',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Safe Area Padding Background */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: 'env(safe-area-inset-bottom)',
            background: 'rgba(167, 243, 208, 0.98)'
          }}
        />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
          .backdrop-blur-enabled {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }

        /* Prevent accidental selections */
        button {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </nav>
  );
}
