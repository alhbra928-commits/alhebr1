import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  // Portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs: TabConfig[] = [
    {
      id: 'assistant',
      label: 'المساعد الذكي',
      icon: () => (
        <div className="text-3xl">
          🤖
        </div>
      ),
      content: () => (
        <div className="p-6 text-right">
          <div className="mb-6 p-4 bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">المساعد الذكي</h3>
                <p className="text-emerald-100 text-sm">متاح الآن للمساعدة</p>
              </div>
            </div>
          </div>

          <p className="text-emerald-700 leading-relaxed mb-6 text-base">
            مرحباً بك! أنا هنا لمساعدتك في الاستثمار الزراعي. اختر من الخيارات أدناه:
          </p>

          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border border-emerald-200 shadow-sm hover:shadow-md">
              <div className="font-bold mb-1">🌳 المزارع المتاحة</div>
              <div className="text-sm text-emerald-700">تصفح جميع فرص الاستثمار</div>
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 rounded-xl text-right transition-all duration-300 border border-blue-200 shadow-sm hover:shadow-md">
              <div className="font-bold mb-1">📋 حجوزاتي</div>
              <div className="text-sm text-blue-700">متابعة الحجوزات والمدفوعات</div>
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 rounded-xl text-right transition-all duration-300 border border-amber-200 shadow-sm hover:shadow-md">
              <div className="font-bold mb-1">❓ الأسئلة الشائعة</div>
              <div className="text-sm text-amber-700">إجابات سريعة لاستفساراتك</div>
            </button>
            <button className="w-full p-4 bg-gradient-to-l from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-900 rounded-xl text-right transition-all duration-300 border border-purple-200 shadow-sm hover:shadow-md">
              <div className="font-bold mb-1">📞 تواصل معنا</div>
              <div className="text-sm text-purple-700">فريق الدعم في خدمتك</div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-900 text-sm">
              💡 <strong>نصيحة:</strong> يمكنك التواصل معنا عبر WhatsApp للحصول على رد فوري!
            </p>
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
          <div className="mb-6 p-4 bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="currentColor"/>
                  <path d="M9 22V12h6v10" fill="#FFD700" opacity="0.8"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">الصفحة الرئيسية</h3>
                <p className="text-emerald-100 text-sm">منصة مزاد النخيل والزيتون</p>
              </div>
            </div>
          </div>

          <p className="text-emerald-700 leading-relaxed mb-6 text-base">
            استكشف فرص الاستثمار الزراعي المتاحة الآن
          </p>

          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-l from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🌴</div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 mb-1 text-lg">المزارع المتاحة</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">تصفح أفضل المزارع وابدأ استثمارك الزراعي</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-l from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💰</div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-900 mb-1 text-lg">فرص الاستثمار</h3>
                  <p className="text-emerald-800 text-sm leading-relaxed">استثمر في الزراعة المستدامة بعوائد مضمونة</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-l from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📜</div>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-1 text-lg">شهادات الانتفاع</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">تحقق من شهادات الانتفاع الموسمية الخاصة بك</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-l from-rose-50 to-rose-100 rounded-xl border-2 border-rose-200 hover:border-rose-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📊</div>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-900 mb-1 text-lg">إحصائيات المنصة</h3>
                  <p className="text-rose-800 text-sm leading-relaxed">تابع أداء استثماراتك والعوائد</p>
                </div>
              </div>
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
          <div className="mb-6 p-4 bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="currentColor"/>
                  <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg">حسابي</h3>
                <p className="text-emerald-100 text-sm">إدارة الحساب والحجوزات</p>
              </div>
            </div>
          </div>

          <p className="text-emerald-700 leading-relaxed mb-6 text-base">
            أدِر معلوماتك الشخصية واستثماراتك من مكان واحد
          </p>

          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-l from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 rounded-xl text-right transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div className="flex-1">
                  <div className="font-bold">معلوماتي الشخصية</div>
                  <div className="text-sm text-blue-700">تحديث البيانات الشخصية</div>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-gradient-to-l from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 rounded-xl text-right transition-all duration-300 border-2 border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <div className="font-bold">حجوزاتي</div>
                  <div className="text-sm text-emerald-700">متابعة جميع الحجوزات</div>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-gradient-to-l from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 rounded-xl text-right transition-all duration-300 border-2 border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📜</span>
                <div className="flex-1">
                  <div className="font-bold">شهادات الانتفاع</div>
                  <div className="text-sm text-amber-700">عرض وتحميل شهادات الانتفاع</div>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-gradient-to-l from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-900 rounded-xl text-right transition-all duration-300 border-2 border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div className="flex-1">
                  <div className="font-bold">المدفوعات</div>
                  <div className="text-sm text-purple-700">سجل المعاملات المالية</div>
                </div>
              </div>
            </button>

            <button className="w-full p-4 bg-gradient-to-l from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-900 rounded-xl text-right transition-all duration-300 border-2 border-teal-200 hover:border-teal-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <div className="flex-1">
                  <div className="font-bold">الإشعارات</div>
                  <div className="text-sm text-teal-700">تحديثات وإشعارات مهمة</div>
                </div>
              </div>
            </button>

            <div className="border-t-2 border-gray-200 my-4"></div>

            <button className="w-full p-4 bg-gradient-to-l from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 text-rose-900 rounded-xl text-right transition-all duration-300 border-2 border-rose-200 hover:border-rose-300 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚪</span>
                <div className="flex-1">
                  <div className="font-bold">تسجيل الخروج</div>
                  <div className="text-sm text-rose-700">الخروج من الحساب بأمان</div>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-900 text-sm">
              🔒 <strong>حسابك آمن:</strong> جميع بياناتك محمية بأعلى معايير الأمان
            </p>
          </div>
        </div>
      )
    }
  ];

  const handleTabClick = (tabId: string) => {
    // نفذ الوظيفة الخاصة بكل أيقونة مباشرة
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
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setActiveTab(null), 300);
  };

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  // محتوى الأيقونات - مستقل تماماً خارج DOM
  const iconsContent = (
    <>
      {/* Container ثابت مرتبط بالـ viewport مباشرة */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '50vh', // استخدام vh بدلاً من %
          transform: 'translateY(-50%)',
          zIndex: 999999,
          pointerEvents: 'auto',
          // تثبيت إضافي لـ iPhone
          WebkitTransform: 'translateY(-50%)',
          willChange: 'transform',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
        className="flex flex-col gap-3"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="group relative w-[32px] h-[90px] sm:h-[95px] bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-l-2xl shadow-2xl transition-all duration-300 hover:w-[36px] border-2 border-amber-400 hover:border-amber-300 flex items-center justify-center overflow-hidden active:scale-95"
            style={{
              animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`,
              pointerEvents: 'auto',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            aria-label={tab.label}
          >
            <div className="text-white group-hover:scale-110 transition-transform duration-300">
              {tab.icon()}
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                transform: 'translateX(100%)',
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
            className="fixed top-0 left-0 h-full w-[80%] max-w-[500px] bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/20 shadow-2xl z-[999999] overflow-y-auto transition-transform duration-300"
            style={{
              animation: 'slideInFromLeft 0.3s ease-out',
              borderRight: '3px solid #fbbf24'
            }}
          >
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 flex items-center justify-between border-b-2 border-amber-400 z-10">
              <h2 className="text-xl font-bold text-white">
                {activeTabConfig?.label}
              </h2>
              <button
                onClick={closeDrawer}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="min-h-[calc(100vh-80px)]">
              {activeTabConfig?.content()}
            </div>
          </div>
        </>
      )}

      <style>{`
        /* ربط الأيقونات بالـ viewport مباشرة - ليس بالصفحة */
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
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
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-200%);
          }
        }

        /* تثبيت خاص لـ iPhone Safari */
        @supports (-webkit-touch-callout: none) {
          /* الأيقونات ثابتة تماماً على iPhone */
          div[style*="position: fixed"][style*="top: 50vh"] {
            position: fixed !important;
            left: 0 !important;
            top: 50vh !important;
            transform: translateY(-50%) !important;
            -webkit-transform: translateY(-50%) !important;
            z-index: 999999 !important;
            -webkit-backface-visibility: hidden !important;
            backface-visibility: hidden !important;
            will-change: transform !important;
          }

          /* منع أي تأثير للكيبورد */
          button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }

        /* ضمان ظهور الأيقونات على جميع الأحجام */
        @media (max-width: 768px) {
          div[style*="position: fixed"][style*="top: 50vh"] {
            left: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }

        /* منع التمرير من التأثير على الأيقونات */
        body {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );

  // استخدام Portal لفصل الأيقونات تماماً عن DOM الأساسي
  if (!mounted) return null;

  return createPortal(iconsContent, document.body);
}
