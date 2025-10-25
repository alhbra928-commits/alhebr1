import React, { useEffect, useState } from 'react';
import { farmOwnerService, FarmOwnerProfile, FarmStatus, FarmOwnerNotification } from '../services/farmOwnerService';
import { Bell, LogOut, FileText, DollarSign, Home, HelpCircle, Phone } from 'lucide-react';
import { FarmOwnerWelcome } from './FarmOwnerWelcome';
import { AdvancedFinanceTab } from './AdvancedFinanceTab';
import { ModernHomeTab } from './ModernHomeTab';

interface FarmOwnerDashboardProps {
  profileId: string;
  onLogout: () => void;
}

export const FarmOwnerDashboard: React.FC<FarmOwnerDashboardProps> = ({ profileId, onLogout }) => {
  const [profile, setProfile] = useState<FarmOwnerProfile | null>(null);
  const [farmStatus, setFarmStatus] = useState<FarmStatus | null>(null);
  const [notifications, setNotifications] = useState<FarmOwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'form' | 'finance' | 'notifications' | 'support' | 'faq'>('home');
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    loadData();

    // الاشتراك في الإشعارات اللحظية
    const unsubscribe = farmOwnerService.subscribeToNotifications(profileId, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // الاستماع لأحداث تبديل التبويبات
    const handleSwitchTab = (event: any) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);

    return () => {
      unsubscribe();
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, [profileId]);

  const loadData = async () => {
    setLoading(true);

    const [profileData, statusData, notificationsData] = await Promise.all([
      farmOwnerService.getProfile(profileId),
      farmOwnerService.getFarmStatus(profileId),
      farmOwnerService.getNotifications(profileId)
    ]);

    setProfile(profileData);
    setFarmStatus(statusData);
    setNotifications(notificationsData);

    const unread = notificationsData.filter(n => !n.is_read).length;
    setUnreadCount(unread);

    // Check if first visit
    const hasSeenWelcome = localStorage.getItem(`farm_owner_welcome_${profileId}`);
    if (!hasSeenWelcome && profileData) {
      setShowWelcome(true);
    }

    setLoading(false);
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

              {/* زر العودة للمنصة */}
              <button
                onClick={() => window.location.href = '/'}
                className="hidden sm:flex p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md bg-white border-2 border-gray-200 group"
                title="العودة للمنصة الرئيسية"
              >
                <Home className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-gray-600 group-hover:text-emerald-600 group-hover:scale-110 transition-all" />
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
              { id: 'home', label: 'الرئيسية', icon: Home, color: '#10B981', gradient: 'from-emerald-500 to-green-600' },
              { id: 'form', label: 'بياناتي', icon: FileText, color: '#3B82F6', gradient: 'from-blue-500 to-cyan-600' },
              { id: 'finance', label: 'المالية', icon: DollarSign, color: '#8BC34A', gradient: 'from-green-500 to-teal-600' },
              { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount, color: '#F59E0B', gradient: 'from-orange-500 to-amber-600' },
              { id: 'support', label: 'تواصل', icon: Phone, color: '#8B5CF6', gradient: 'from-purple-500 to-indigo-600' },
              { id: 'faq', label: 'الأسئلة', icon: HelpCircle, color: '#EC4899', gradient: 'from-pink-500 to-rose-600' }
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
        {activeTab === 'home' && (
          <ModernHomeTab
            profile={profile}
            farmStatus={farmStatus}
            onNavigateToData={() => setActiveTab('form')}
          />
        )}
        {activeTab === 'form' && (
          <FormTab profile={profile} profileId={profileId} onUpdate={loadData} />
        )}
        {activeTab === 'finance' && profile && (
          <AdvancedFinanceTab ownerId={profileId} farmId={farmStatus?.id || null} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab
            notifications={notifications}
            onMarkAsRead={(id) => {
              farmOwnerService.markNotificationAsRead(id);
              setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
              setUnreadCount(prev => Math.max(0, prev - 1));
            }}
          />
        )}
        {activeTab === 'support' && (
          <SupportTab />
        )}
        {activeTab === 'faq' && (
          <FAQTab />
        )}
      </div>
    </div>
  );
};

// تبويب النموذج (مبسط - سيتم توسيعه)
const FormTab: React.FC<{ profile: FarmOwnerProfile | null; profileId: string; onUpdate: () => void }> = ({ profile, profileId, onUpdate }) => {
  const [SmartFarmDataForm, setSmartFarmDataForm] = React.useState<any>(null);

  React.useEffect(() => {
    import('./SmartFarmDataForm').then((module) => {
      setSmartFarmDataForm(() => module.SmartFarmDataForm);
    });
  }, []);

  if (!SmartFarmDataForm) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 text-center">
        <div className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: '#8BC34A', borderTopColor: 'transparent' }} />
        <p className="mt-4 text-gray-600">جاري تحميل النموذج...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2" style={{ color: '#8BC34A' }}>
          📝 بياناتي الزراعية
        </h2>
        <p className="text-gray-600">
          {profile?.status === 'pending' && !profile.full_name
            ? 'املأ النموذج أدناه لإرسال بيانات مزرعتك للمراجعة'
            : profile?.status === 'pending'
            ? 'طلبك قيد المراجعة من قبل الإدارة'
            : profile?.status === 'rejected'
            ? 'تم رفض الطلب. يمكنك تعديل البيانات وإعادة الإرسال'
            : 'يمكنك تعديل بياناتك وإعادة الإرسال'}
        </p>
      </div>

      <SmartFarmDataForm
        profileId={profileId}
        onSuccess={onUpdate}
        initialData={profile}
      />
    </div>
  );
};


// تبويب الإشعارات
const NotificationsTab: React.FC<{
  notifications: FarmOwnerNotification[];
  onMarkAsRead: (id: string) => void
}> = ({ notifications, onMarkAsRead }) => {
  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-gray-200">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-600 text-lg">لا توجد إشعارات حالياً</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
            className="bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: notification.is_read ? '#E5E7EB' : '#8BC34A',
              opacity: notification.is_read ? 0.7 : 1
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg">{notification.title_ar}</h3>
              {!notification.is_read && (
                <span className="w-3 h-3 rounded-full" style={{ background: '#8BC34A' }} />
              )}
            </div>
            <p className="text-gray-600 mb-2">{notification.message_ar}</p>
            <p className="text-xs text-gray-400">
              {new Date(notification.created_at).toLocaleString('ar-SA')}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

// تبويب التواصل والدعم
const SupportTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, white 0%, #F0FDF4 100%)',
          border: '3px solid rgba(139, 195, 74, 0.3)',
          boxShadow: '0 8px 32px rgba(139, 195, 74, 0.2)'
        }}
      >
        <div className="text-6xl mb-4">📞</div>
        <h2 className="text-3xl font-black mb-4" style={{ color: '#8BC34A' }}>
          نحن هنا لخدمتك
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          فريق منصة الحبر للتسويق الزراعي جاهز للرد على استفساراتك في أي وقت
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <a
            href="tel:+966500000000"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-lg"
          >
            <Phone size={32} className="mx-auto mb-3" style={{ color: '#8BC34A' }} />
            <h3 className="font-bold text-lg mb-2">اتصل بنا</h3>
            <p className="text-gray-600 mb-2">متوفرون من السبت إلى الخميس</p>
            <p className="text-2xl font-black" style={{ color: '#8BC34A' }}>
              +966 50 000 0000
            </p>
          </a>

          <a
            href="https://wa.me/966500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-500 transition-all duration-300 hover:shadow-lg"
          >
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2">واتساب</h3>
            <p className="text-gray-600 mb-2">تواصل معنا فوراً</p>
            <p className="text-xl font-black" style={{ color: '#25D366' }}>
              راسلنا الآن
            </p>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
        <h3 className="text-xl font-black mb-4" style={{ color: '#8BC34A' }}>
          📧 البريد الإلكتروني
        </h3>
        <p className="text-gray-600 mb-2">
          للاستفسارات الرسمية يمكنك التواصل عبر البريد الإلكتروني:
        </p>
        <a
          href="mailto:info@alhubr.com"
          className="text-xl font-bold hover:underline"
          style={{ color: '#8BC34A' }}
        >
          info@alhubr.com
        </a>
      </div>

      <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
        <h3 className="text-xl font-black mb-4" style={{ color: '#8BC34A' }}>
          🕐 أوقات العمل
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-700">السبت - الأربعاء</span>
            <span className="text-gray-600">9:00 صباحاً - 6:00 مساءً</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-700">الخميس</span>
            <span className="text-gray-600">9:00 صباحاً - 1:00 ظهراً</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-semibold text-gray-700">الجمعة</span>
            <span className="text-red-600 font-bold">عطلة</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// تبويب الأسئلة الشائعة
const FAQTab: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const faqs = [
    {
      question: 'متى سأستلم قيمة مزرعتي؟',
      answer: 'بعد اكتمال المساهمين لشراء المزرعة تحت رعاية المنصة، سيتم التواصل معك لترتيب تحويل كامل المبلغ المتفق عليه.'
    },
    {
      question: 'كيف أتابع تقدم بيع مزرعتي؟',
      answer: 'يمكنك متابعة التقدم بشكل لحظي من خلال تبويب "الحالة المالية" حيث ستجد نسبة التقدم وعدد الأشجار المباعة والمبلغ المحصل.'
    },
    {
      question: 'هل يمكنني تعديل بيانات المزرعة بعد الاعتماد؟',
      answer: 'نعم، يمكنك تعديل بعض البيانات من خلال تبويب "بياناتي الزراعية"، وسيتم مراجعة التعديلات من قبل الإدارة.'
    },
    {
      question: 'ماذا يحدث إذا رُفض طلبي؟',
      answer: 'في حالة رفض الطلب، ستصلك رسالة توضح السبب. يمكنك تعديل البيانات وإعادة إرسال الطلب مرة أخرى.'
    },
    {
      question: 'هل البيانات المالية محدثة لحظياً؟',
      answer: 'نعم، جميع البيانات المالية يتم تحديثها بشكل فوري ولحظي. يمكنك متابعة كل تطور في حالة مزرعتك المالية.'
    },
    {
      question: 'كيف أضمن حقوقي؟',
      answer: 'منصة الحبر سوف توقع معك المبايعة بعد الانتهاء من توفر كامل المبلغ خلال وقت قصير إن شاء الله.'
    },
    {
      question: 'ماذا أفعل إذا واجهت مشكلة؟',
      answer: 'يمكنك التواصل معنا فوراً من خلال تبويب "تواصل معنا" عبر الهاتف أو الواتساب أو البريد الإلكتروني، وسنكون سعداء بمساعدتك.'
    }
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, white 0%, #FFFBEB 100%)',
          border: '3px solid rgba(245, 158, 11, 0.3)'
        }}
      >
        <div className="text-6xl mb-4">❓</div>
        <h2 className="text-3xl font-black mb-2" style={{ color: '#F59E0B' }}>
          الأسئلة الشائعة
        </h2>
        <p className="text-gray-600">
          إجابات على أكثر الأسئلة شيوعاً من البائعين
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden transition-all duration-300"
            style={{
              borderColor: openIndex === index ? '#8BC34A' : '#E5E7EB'
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full p-6 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-bold text-lg text-gray-900 flex-1">
                {faq.question}
              </span>
              <span
                className="text-2xl transition-transform duration-300"
                style={{
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  color: '#8BC34A'
                }}
              >
                ⌄
              </span>
            </button>

            {openIndex === index && (
              <div className="px-6 pb-6 pt-2 border-t-2 border-gray-100">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, white 100%)',
          border: '2px solid rgba(139, 195, 74, 0.2)'
        }}
      >
        <p className="text-sm text-gray-600">
          لم تجد إجابة لسؤالك؟ تواصل معنا مباشرة من تبويب "تواصل معنا"
        </p>
      </div>
    </div>
  );
};
