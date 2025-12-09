import { useState } from 'react';
import { X } from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  icon: () => JSX.Element;
  content: () => JSX.Element;
}

interface VerticalSideTabsProps {
  onSmartAssistantClick?: () => void;
  onHomeClick?: () => void;
  onAccountClick?: () => void;
}

export function VerticalSideTabs({
  onSmartAssistantClick,
  onHomeClick,
  onAccountClick
}: VerticalSideTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const tabs: TabConfig[] = [
    {
      id: 'assistant',
      label: 'المساعد الذكي',
      icon: () => (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.9"/>
          <path
            d="M12 14c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="8" cy="11" r="1.5" fill="#FFD700"/>
          <circle cx="16" cy="11" r="1.5" fill="#FFD700"/>
          <path
            d="M10 15h4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      content: () => (
        <div className="p-6 text-right">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            المساعد الذكي
          </h2>
          <p className="text-emerald-700 leading-relaxed mb-6">
            أهلاً بك في خدمة المساعد الذكي. كيف يمكنني مساعدتك اليوم؟
          </p>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              استفسار عن المزارع المتاحة
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              متابعة حجز سابق
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              الأسئلة الشائعة
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'home',
      label: 'الرئيسية',
      icon: () => (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <path
            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M9 22V12h6v10"
            fill="#FFD700"
            opacity="0.8"
          />
          <circle cx="12" cy="7" r="1.5" fill="#FFD700"/>
        </svg>
      ),
      content: () => (
        <div className="p-6 text-right">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            الرئيسية
          </h2>
          <p className="text-emerald-700 leading-relaxed mb-6">
            مرحباً بك في منصة مزاد النخيل والزيتون
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-l from-amber-50 to-amber-100 rounded-xl border border-amber-200">
              <h3 className="font-bold text-amber-900 mb-2">المزارع المتاحة</h3>
              <p className="text-amber-800 text-sm">تصفح أفضل المزارع</p>
            </div>
            <div className="p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-2">فرص الاستثمار</h3>
              <p className="text-emerald-800 text-sm">استثمر في الزراعة المستدامة</p>
            </div>
            <div className="p-4 bg-gradient-to-l from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">شهادات الملكية</h3>
              <p className="text-blue-800 text-sm">تحقق من شهاداتك</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'account',
      label: 'حسابي',
      icon: () => (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <circle
            cx="12"
            cy="8"
            r="4"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="12" cy="8" r="2" fill="#FFD700"/>
        </svg>
      ),
      content: () => (
        <div className="p-6 text-right">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            حسابي
          </h2>
          <p className="text-emerald-700 leading-relaxed mb-6">
            إدارة معلوماتك الشخصية وحجوزاتك
          </p>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              معلوماتي الشخصية
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              حجوزاتي
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200">
              شهادات الملكية
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 text-rose-900 rounded-xl text-right transition-all duration-300 border border-rose-200">
              تسجيل الخروج
            </button>
          </div>
        </div>
      )
    }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'assistant' && onSmartAssistantClick) {
      onSmartAssistantClick();
      return;
    }
    if (tabId === 'home' && onHomeClick) {
      onHomeClick();
      return;
    }
    if (tabId === 'account' && onAccountClick) {
      onAccountClick();
      return;
    }

    setActiveTab(tabId);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setActiveTab(null), 300);
  };

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    <>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[999999] flex flex-col gap-3 pr-0">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="group relative w-[32px] h-[90px] bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-r-2xl shadow-2xl transition-all duration-300 hover:w-[36px] border-2 border-amber-400 hover:border-amber-300 flex items-center justify-center overflow-hidden"
            style={{
              animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`
            }}
            aria-label={tab.label}
          >
            <div className="text-white group-hover:scale-110 transition-transform duration-300">
              {tab.icon()}
            </div>

            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateX(-100%)',
                animation: 'shimmer 2s infinite'
              }}
            />
          </button>
        ))}
      </div>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999998] transition-opacity duration-300"
            onClick={closeDrawer}
            style={{
              animation: 'fadeIn 0.3s ease-out'
            }}
          />

          <div
            className="fixed top-0 right-0 h-full w-[80%] max-w-[500px] bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-2xl z-[999999] overflow-y-auto transition-transform duration-300"
            style={{
              animation: 'slideInFromRight 0.3s ease-out',
              borderLeft: '3px solid #fbbf24'
            }}
          >
            <div className="sticky top-0 bg-gradient-to-l from-emerald-600 to-emerald-700 p-4 flex items-center justify-between border-b-2 border-amber-400 z-10">
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h2 className="text-xl font-bold text-white">
                {activeTabConfig?.label}
              </h2>
            </div>

            <div className="min-h-[calc(100vh-80px)]">
              {activeTabConfig?.content()}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @media (max-width: 768px) {
          .fixed.right-0.top-1\\/2 {
            right: 0 !important;
          }
        }

        @supports (-webkit-touch-callout: none) {
          .fixed.right-0.top-1\\/2 button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }
      `}</style>
    </>
  );
}
