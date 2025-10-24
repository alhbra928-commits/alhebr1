import React, { useEffect, useState } from 'react';
import { farmOwnerService, FarmOwnerProfile, FarmStatus, FarmOwnerNotification } from '../services/farmOwnerService';
import { Bell, LogOut, FileText, DollarSign, Home } from 'lucide-react';

interface FarmOwnerDashboardProps {
  profileId: string;
  onLogout: () => void;
}

export const FarmOwnerDashboard: React.FC<FarmOwnerDashboardProps> = ({ profileId, onLogout }) => {
  const [profile, setProfile] = useState<FarmOwnerProfile | null>(null);
  const [farmStatus, setFarmStatus] = useState<FarmStatus | null>(null);
  const [notifications, setNotifications] = useState<FarmOwnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'form' | 'finance' | 'notifications'>('home');
  const [loading, setLoading] = useState(true);

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

    setLoading(false);
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
                  لوحة صاحب المزرعة
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

              {/* زر الخروج */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)'
                }}
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
            { id: 'notifications', label: 'الإشعارات', icon: Bell, badge: unreadCount }
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
        {activeTab === 'finance' && (
          <FinanceTab profile={profile} farmStatus={farmStatus} />
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
          message: 'مزرعتك معروضة الآن في المنصة – تابع التقدم من القيادة.',
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
                ✨ اقترب اكتمال حجز مزرعتك – استثمار مُثمر ما شاء الله!
              </p>
            )}
            {progress === 100 && (
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                🌟 اكتمل حجز المزرعة كلياً – انتظر إجراء التسوية
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
            ✓ معتمد من منصة الحبر الزراعية
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

// تبويب المالية
const FinanceTab: React.FC<{ profile: FarmOwnerProfile | null; farmStatus: FarmStatus | null }> = () => {
  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-gray-200">
      <h2 className="text-2xl font-black mb-6" style={{ color: '#8BC34A' }}>
        💰 الحالة المالية
      </h2>
      <p className="text-gray-600 text-lg mb-4">
        المبلغ المحصّل من المنصة حتى الآن: <span className="font-bold">0 ريال</span>
      </p>
      <p className="text-gray-600">
        الحالة المالية: <span className="font-bold">قيد التسوية</span>
      </p>
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
