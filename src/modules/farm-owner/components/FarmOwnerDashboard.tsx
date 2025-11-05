import React, { useEffect, useState } from 'react';
import { farmOwnerService, FarmOwnerProfile, FarmStatus, FarmOwnerNotification } from '../services/farmOwnerService';
import { Bell, LogOut, FileText, DollarSign, Home, HelpCircle, Phone, ArrowLeft, Layers } from 'lucide-react';
import { FarmOwnerWelcome } from './FarmOwnerWelcome';
import { MyFarmsTab } from './MyFarmsTab';

interface FarmOwnerDashboardProps {
  profileId: string;
  onLogout: () => void;
  onBackToPublic?: () => void;
}

export const FarmOwnerDashboard: React.FC<FarmOwnerDashboardProps> = ({ profileId, onLogout, onBackToPublic }) => {
  const [profile, setProfile] = useState<FarmOwnerProfile | null>(null);
  const [farmStatus, setFarmStatus] = useState<FarmStatus | null>(null);
  const [notifications, setNotifications] = useState<FarmOwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'myfarms'>('myfarms');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    loadData();

    // الاستماع لأحداث تبديل التبويبات
    const handleSwitchTab = (event: any) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);

    // تأجيل الاشتراك في الإشعارات حتى تحميل الواجهة (بعد 2 ثانية)
    const subscriptionTimeout = setTimeout(() => {
      const unsubscribe = farmOwnerService.subscribeToNotifications(profileId, (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      // حفظ unsubscribe للتنظيف
      (window as any).__farmOwnerNotificationUnsubscribe = unsubscribe;
    }, 2000);

    return () => {
      clearTimeout(subscriptionTimeout);
      window.removeEventListener('switchTab', handleSwitchTab);

      // تنظيف subscription إذا كان موجود
      if ((window as any).__farmOwnerNotificationUnsubscribe) {
        (window as any).__farmOwnerNotificationUnsubscribe();
        delete (window as any).__farmOwnerNotificationUnsubscribe;
      }
    };
  }, [profileId]);

  const loadData = async () => {
    // إظهار الواجهة فوراً
    setLoading(false);

    try {
      // تحميل كل شيء في الخلفية بدون انتظار
      farmOwnerService.getProfile(profileId).then(profileData => {
        if (profileData) {
          setProfile(profileData);

          // Check if first visit
          const hasSeenWelcome = localStorage.getItem(`farm_owner_welcome_${profileId}`);
          if (!hasSeenWelcome) {
            setShowWelcome(true);
          }
        }
      }).catch(error => {
        console.error('خطأ في تحميل الملف الشخصي:', error);
      });

      // تحميل البيانات الأخرى بشكل مستقل
      farmOwnerService.getFarmStatus(profileId).then(setFarmStatus).catch(console.error);
      farmOwnerService.getNotifications(profileId).then(notificationsData => {
        setNotifications(notificationsData);
        const unread = notificationsData.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }).catch(console.error);

    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    }
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem(`farm_owner_welcome_${profileId}`, 'true');
    setShowWelcome(false);
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      farmOwnerService.logout();
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1C2E0F 0%, #0F1A08 50%, #1C2E0F 100%)'
      }}>
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#8BC34A', borderTopColor: 'transparent' }} />
          <p className="mt-4 text-lg font-semibold" style={{ color: '#8BC34A' }}>
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  if (showWelcome && profile) {
    return (
      <FarmOwnerWelcome
        ownerName={profile.full_name || profile.mobile_number}
        onComplete={handleWelcomeComplete}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%)'
    }}>
      {/* الهيدر الاحترافي المطور */}
      <header className="sticky top-0 z-50">
        {/* خلفية متدرجة مع blur */}
        <div className="absolute inset-0 backdrop-blur-xl" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.95) 100%)',
        }} />

        {/* خط زخرفي علوي */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />

        <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16 sm:h-18 md:h-20">
            {/* قسم الشعار والملف الشخصي */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
              {/* شعار مبتكر */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3), 0 0 0 4px rgba(16, 185, 129, 0.1)'
                  }}
                >
                  <span className="text-2xl sm:text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">🌳</span>

                  {/* تأثير توهج */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(circle at center, white 0%, transparent 70%)' }}
                  />

                  {/* حلقة متحركة */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Badge النشاط */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white shadow-lg">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              {/* معلومات المستخدم */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent truncate leading-tight">
                    بوابة صاحب المزرعة
                  </h1>
                  <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-700">نشط</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs sm:text-sm text-gray-700 font-bold truncate">
                    {profile?.full_name || 'صاحب المزرعة'}
                  </p>
                  {profile?.full_name && (
                    <span className="hidden sm:inline text-xs text-gray-400">•</span>
                  )}
                  <p className="hidden sm:block text-xs text-gray-500 font-medium truncate" dir="ltr">
                    {profile?.mobile_number}
                  </p>
                </div>
              </div>
            </div>

            {/* قسم الإجراءات */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* زر الإشعارات المطور */}
              <button
                onClick={() => setActiveTab('notifications')}
                className={`
                  relative p-2 sm:p-2.5 md:p-3
                  rounded-xl sm:rounded-2xl
                  transition-all duration-300
                  hover:scale-105
                  group
                  ${activeTab === 'notifications'
                    ? 'shadow-lg'
                    : 'hover:shadow-md'
                  }
                `}
                style={{
                  background: activeTab === 'notifications'
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : 'white',
                  border: activeTab === 'notifications' ? 'none' : '2px solid #E5E7EB'
                }}
                title="الإشعارات"
              >
                <Bell
                  className={`
                    w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6
                    transition-all duration-300
                    ${activeTab === 'notifications'
                      ? 'text-white scale-110'
                      : 'text-gray-600 group-hover:text-orange-500'
                    }
                  `}
                />

                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                    <span
                      className="relative min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                        border: '2px solid white'
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </button>

              {/* زر العودة للمنصة (بدون خروج) - ظاهر على جميع الأجهزة */}
              <button
                onClick={() => {
                  if (onBackToPublic) {
                    onBackToPublic();
                  } else {
                    // فتح المنصة في تبويب جديد كبديل
                    window.open('/', '_blank');
                  }
                }}
                className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-white border-2 border-emerald-300 group relative overflow-hidden"
                title="العودة للمنصة الرئيسية (الجلسة تبقى مفتوحة)"
              >
                {/* تأثير hover أخضر */}
                <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <ArrowLeft className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-emerald-600 group-hover:text-emerald-700 group-hover:scale-110 transition-all" />
              </button>

              {/* زر الخروج المطور */}
              <button
                onClick={handleLogout}
                className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-white border-2 border-gray-200 group relative overflow-hidden"
                title="تسجيل الخروج"
              >
                {/* تأثير hover */}
                <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <LogOut className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* خط سفلي مع ظل */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0" style={{
          height: '1px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(16, 185, 129, 0.08)'
        }} />
      </header>

      {/* التبويبات المبتكرة - محسّنة للجوال */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mt-3 sm:mt-4 md:mt-5">
        <div className="relative bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-2.5 md:p-3 shadow-lg border-2 border-gray-100">
          {/* خلفية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 via-transparent to-blue-50/50 rounded-xl sm:rounded-2xl md:rounded-3xl opacity-50" />

          <div className="relative flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
            {[
              { id: 'myfarms', label: '🌴 مزرعتي', icon: Home, color: '#10B981', gradient: 'from-emerald-500 to-green-600' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    relative flex flex-col items-center justify-center
                    min-w-[70px] sm:min-w-[90px] md:min-w-[110px]
                    px-3 sm:px-4 md:px-5
                    py-2 sm:py-2.5 md:py-3
                    rounded-xl sm:rounded-2xl
                    font-bold text-[10px] sm:text-xs md:text-sm
                    transition-all duration-300
                    group flex-shrink-0
                    ${isActive
                      ? 'transform scale-105 shadow-xl'
                      : 'hover:scale-102 hover:shadow-md'
                    }
                  `}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)`
                      : 'white',
                    color: isActive ? 'white' : '#6B7280',
                    border: isActive ? 'none' : '2px solid #E5E7EB',
                  }}
                >
                  {/* أيقونة مع تأثير */}
                  <div className={`
                    relative
                    w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10
                    rounded-xl
                    flex items-center justify-center
                    mb-1 sm:mb-1.5
                    transition-all duration-300
                    ${isActive
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-gray-50 group-hover:bg-gray-100'
                    }
                  `}>
                    <Icon
                      className={`
                        w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5
                        transition-all duration-300
                        ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                      `}
                      style={{ color: isActive ? 'white' : tab.color }}
                    />

                    {/* Badge للإشعارات */}
                    {tab.badge && tab.badge > 0 && (
                      <div
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-black shadow-lg animate-bounce"
                        style={{
                          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                          color: 'white',
                          border: '2px solid white'
                        }}
                      >
                        {tab.badge > 9 ? '9+' : tab.badge}
                      </div>
                    )}
                  </div>

                  {/* النص */}
                  <span className={`
                    text-center leading-tight
                    transition-all duration-300
                    ${isActive ? 'font-black' : 'font-bold'}
                  `}>
                    {tab.label}
                  </span>

                  {/* مؤشر النشاط */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1 rounded-t-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        boxShadow: '0 -2px 8px rgba(255, 255, 255, 0.5)'
                      }}
                    />
                  )}

                  {/* توهج خلفي */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-50 blur-xl -z-10"
                      style={{ background: tab.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* مؤشر التمرير للجوال */}
          <div className="block sm:hidden mt-2 flex justify-center gap-1">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
            <div className="w-8 h-1 bg-gray-200 rounded-full" />
            <div className="w-4 h-1 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {activeTab === 'myfarms' && (
          <MyFarmsTab
            profileId={profileId}
            currentPhone={profile?.mobile_number || ''}
          />
        )}
      </div>
    </div>
  );
};
