import React, { useEffect, useState } from 'react';
import { farmOwnerService, FarmOwnerProfile, FarmStatus, FarmOwnerNotification } from '../services/farmOwnerService';
import { Bell, LogOut, FileText, DollarSign, Home, HelpCircle, Phone } from 'lucide-react';
import { FarmOwnerWelcome } from './FarmOwnerWelcome';
import { AdvancedFinanceTab } from './AdvancedFinanceTab';

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

    return () => unsubscribe();
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
      background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)'
    }}>
      {/* الهيدر */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{
        background: 'linear-gradient(135deg, rgba(28, 46, 15, 0.95) 0%, rgba(15, 26, 8, 0.95) 100%)',
        borderBottom: '2px solid rgba(139, 195, 74, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* الشعار */}
            <div className="flex items-center gap-3">
              <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px #8BC34A)' }}>
                🌳
              </div>
              <div>
                <h1 className="text-lg font-black" style={{ color: '#8BC34A' }}>
                  بوابة البائع
                </h1>
                <p className="text-xs opacity-70" style={{ color: '#A4D65E' }}>
                  {profile?.full_name || profile?.mobile_number}
                </p>
              </div>
            </div>

            {/* الإجراءات */}
            <div className="flex items-center gap-3">
              {/* جرس الإشعارات */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110"
                style={{
                  background: activeTab === 'notifications' ? 'rgba(139, 195, 74, 0.2)' : 'transparent',
                  border: '2px solid rgba(139, 195, 74, 0.3)'
                }}
              >
                <Bell size={20} style={{ color: '#8BC34A' }} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* زر العودة للمنصة */}
              <button
                onClick={() => window.location.href = '/'}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-110 group"
                style={{
                  background: 'rgba(139, 195, 74, 0.1)',
                  border: '2px solid rgba(139, 195, 74, 0.3)'
                }}
                title="العودة للمنصة الرئيسية"
              >
                <Home size={20} style={{ color: '#8BC34A' }} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* زر الخروج */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)'
                }}
                title="تسجيل الخروج"
              >
                <LogOut size={20} style={{ color: '#EF4444' }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* التبويبات */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'home', label: 'الصفحة الرئيسية', icon: Home },
            { id: 'form', label: 'بياناتي الزراعية', icon: FileText },
            { id: 'finance', label: 'الحالة المالية', icon: DollarSign },
            { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount },
            { id: 'support', label: 'تواصل معنا', icon: Phone },
            { id: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)'
                    : 'white',
                  color: isActive ? 'white' : '#4B5563',
                  border: isActive ? 'none' : '2px solid #E5E7EB',
                  boxShadow: isActive ? '0 4px 12px rgba(139, 195, 74, 0.4)' : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none'
                }}
              >
                <Icon size={18} />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: isActive ? 'rgba(255, 255, 255, 0.3)' : '#EF4444',
                      color: 'white'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* المحتوى */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeTab profile={profile} farmStatus={farmStatus} />
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

// تبويب الصفحة الرئيسية
const HomeTab: React.FC<{ profile: FarmOwnerProfile | null; farmStatus: FarmStatus | null }> = ({ profile, farmStatus }) => {
  const getStatusInfo = () => {
    if (!profile) return { emoji: '⏳', title: 'جاري التحميل...', message: '', color: '#9CA3AF' };

    switch (profile.status) {
      case 'pending':
        return {
          emoji: '🟡',
          title: 'بانتظار المراجعة',
          message: 'تم رفع المزرعة بنجاح، بانتظار مراجعة الإدارة.',
          color: '#F59E0B'
        };
      case 'approved':
        return {
          emoji: '🟢',
          title: 'تم الاعتماد',
          message: 'تم اعتماد المزرعة وجاهزة للعرض على المستثمرين.',
          color: '#10B981'
        };
      case 'rejected':
        return {
          emoji: '🔴',
          title: 'تم الرفض',
          message: profile.rejection_reason || 'تم رفض طلب المزرعة. يرجى مراجعة البيانات.',
          color: '#EF4444'
        };
      default:
        return {
          emoji: '🌿',
          title: 'نشط',
          message: 'مزرعتك معروضة الآن للمستثمرين – تابع التقدم من التبويب المالي.',
          color: '#8BC34A'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const progress = farmStatus?.progress_percentage || 0;

  return (
    <div className="space-y-6">
      {/* الشاشة الأولى: حالة المزرعة */}
      <div
        className="rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, white 0%, #F9FAFB 100%)',
          border: `3px solid ${statusInfo.color}33`,
          boxShadow: `0 8px 32px ${statusInfo.color}22`
        }}
      >
        <div className="relative z-10">
          <div className="text-6xl mb-4 text-center">{statusInfo.emoji}</div>
          <h3 className="text-2xl font-black text-center mb-2" style={{ color: statusInfo.color }}>
            {statusInfo.title}
          </h3>
          <p className="text-center text-gray-600 text-lg">
            {statusInfo.message}
          </p>
        </div>
      </div>

      {/* الشاشة الثانية: نسبة التقدم */}
      {farmStatus?.is_published && (
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, white 0%, #FFFBEB 100%)',
            border: '3px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
          }}
        >
          <h3 className="text-xl font-black text-center mb-4" style={{ color: '#F59E0B' }}>
            📊 نسبة تقدم الاستثمار
          </h3>

          {/* شريط التقدم */}
          <div className="relative w-full h-8 rounded-full overflow-hidden mb-4" style={{
            background: 'rgba(245, 158, 11, 0.1)'
          }}>
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-sm font-black"
              style={{ color: progress > 50 ? 'white' : '#F59E0B' }}
            >
              {progress.toFixed(1)}%
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600">
              محجوز: {farmStatus.reserved_trees} من أصل {farmStatus.total_trees} شجرة
            </p>
            {progress >= 60 && progress < 100 && (
              <p className="text-lg font-bold animate-pulse" style={{ color: '#F59E0B' }}>
                ✨ اقترب اكتمال بيع مزرعتك – بإذن الله قريباً!
              </p>
            )}
            {progress === 100 && (
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                🌟 تم بيع جميع الأشجار – انتظر تحويل المبلغ الكامل
              </p>
            )}
          </div>
        </div>
      )}

      {/* الشاشة الثالثة: إتمام البيع */}
      {farmStatus?.sales_status === 'completed' && (
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, white 0%, #ECFDF5 100%)',
            border: '3px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="text-6xl mb-4 text-center">🏆</div>
          <h3 className="text-2xl font-black text-center mb-2" style={{ color: '#10B981' }}>
            مبروك! تم بيع المزرعة بنجاح
          </h3>
          <p className="text-center text-gray-600 text-lg mb-4">
            سيتم التواصل معك للتسوية النهائية
          </p>
          <div
            className="text-center text-sm font-bold py-2 px-4 rounded-full inline-block"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            ✓ معتمد من منصة الحبر للتسويق الزراعي
          </div>
        </div>
      )}
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
      answer: 'خلال فترة قصيرة إن شاء الله بعد اكتمال بيع جميع الأشجار، سيتم التواصل معك لترتيب تحويل كامل المبلغ المتفق عليه.'
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
      question: 'كم نسبة المنصة من عملية البيع؟',
      answer: 'المنصة تأخذ نسبة بسيطة كعمولة تسويق. المبلغ الذي ستستلمه هو المبلغ المتفق عليه مسبقاً وموضح في العقد.'
    },
    {
      question: 'هل البيانات المالية محدثة لحظياً؟',
      answer: 'نعم، جميع البيانات المالية يتم تحديثها بشكل فوري ولحظي. يمكنك متابعة كل تطور في حالة مزرعتك المالية.'
    },
    {
      question: 'كيف أضمن حقوقي؟',
      answer: 'منصة الحبر للتسويق الزراعي منصة موثوقة ومرخصة. جميع المعاملات موثقة ومحفوظة. كما يتم توقيع عقد رسمي يضمن حقوق جميع الأطراف.'
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
