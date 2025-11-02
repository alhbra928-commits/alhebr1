import { MessageCircle, Home, User, FileText } from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
  phoneNumber?: string;
}

/**
 * 📱 Mobile Bottom Navigation Bar
 * شريط التنقل السفلي للجوال - غير مزعج وثابت في أسفل الشاشة
 */
export function MobileBottomNav({
  onNavigate,
  currentSection = 'home',
  phoneNumber = '966500000000'
}: MobileBottomNavProps) {

  const navItems = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'account', icon: User, label: 'حسابي' },
    { id: 'docs', icon: FileText, label: 'المستندات' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - ثابت في أسفل الشاشة */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl lg:hidden"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">

          {/* Navigation Items */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300
                ${currentSection === item.id ? 'bg-emerald-50' : 'hover:bg-gray-50'}
              `}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <item.icon
                size={22}
                className={currentSection === item.id ? 'text-emerald-600' : 'text-gray-600'}
                strokeWidth={2.5}
              />
              <span
                className={`text-xs font-medium ${
                  currentSection === item.id ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          ))}

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${phoneNumber}?text=مرحباً!%20أود%20الاستفسار%20عن%20المنصة`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-amber-50 active:scale-95"
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8B7355 0%, #A0916A 100%)',
                boxShadow: '0 2px 8px rgba(139, 115, 85, 0.3)',
              }}
            >
              <MessageCircle
                size={20}
                className="text-white"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-xs font-medium text-gray-600">
              واتساب
            </span>
          </a>

        </div>
      </div>

      {/* Spacer - مساحة فارغة لتجنب تغطية المحتوى */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
