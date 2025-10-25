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
      {/* الهيدر العصري - محسّن للجوال */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(139, 195, 74, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 30px rgba(139, 195, 74, 0.1)'
      }}>
        <div className="w-full px-2 sm:px-3 md:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-14 sm:h-16 md:h-20">
            {/* الشعار العصري */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden group flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)',
                  boxShadow: '0 4px 12px rgba(139, 195, 74, 0.3)'
                }}
              >
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl group-hover:scale-110 transition-transform">🌳</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent truncate leading-tight">
                  بوابة صاحب المزرعة
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 font-semibold truncate leading-tight">
                  {profile?.full_name || profile?.mobile_number}
                </p>
              </div>
            </div>

            {/* الإجراءات العصرية - محسّنة للجوال */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
              {/* جرس الإشعارات */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                style={{
                  background: activeTab === 'notifications'
                    ? 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)'
                    : 'white',
                  border: '2px solid',
                  borderColor: activeTab === 'notifications' ? 'transparent' : '#E5E7EB'
                }}
              >
                <Bell
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform"
                  style={{ color: activeTab === 'notifications' ? 'white' : '#6B7280' }}
                />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-5 px-0.5 sm:px-1 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white animate-pulse"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* زر العودة للمنصة */}
              <button
                onClick={() => window.location.href = '/'}
                className="hidden sm:flex p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white border-2 border-gray-200 group"
                title="العودة للمنصة الرئيسية"
              >
                <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-600 group-hover:text-green-600 group-hover:scale-110 transition-all" />
              </button>

              {/* زر الخروج */}
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg bg-white border-2 border-gray-200 group"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-600 group-hover:text-red-600 group-hover:scale-110 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* التبويبات العصرية - محسّنة للجوال */}
      <div className="w-full px-2 sm:px-3 md:px-6 lg:px-8 mt-3 sm:mt-4 md:mt-6">
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-1 sm:p-1.5 md:p-2 shadow-sm border border-gray-200 flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
          {[
            { id: 'home', label: 'الرئيسية', icon: Home, shortLabel: 'الرئيسية' },
            { id: 'form', label: 'بياناتي', icon: FileText, shortLabel: 'البيانات' },
            { id: 'finance', label: 'المالية', icon: DollarSign, shortLabel: 'المالية' },
            { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount, shortLabel: 'الإشعارات' },
            { id: 'support', label: 'تواصل', icon: Phone, shortLabel: 'تواصل' },
            { id: 'faq', label: 'الأسئلة', icon: HelpCircle, shortLabel: 'أسئلة' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs md:text-sm whitespace-nowrap transition-all duration-300 group flex-shrink-0"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)'
                    : 'transparent',
                  color: isActive ? 'white' : '#6B7280',
                  boxShadow: isActive ? '0 2px 8px rgba(139, 195, 74, 0.3)' : 'none'
                }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="inline sm:hidden">{tab.shortLabel}</span>
                {tab.badge && tab.badge > 0 && (
                  <span
                    className="min-w-[16px] sm:min-w-[18px] h-4 sm:h-5 px-1 sm:px-1.5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold animate-pulse"
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: 'white'
                    }}
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 sm:h-1 rounded-t-full"
                    style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

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
