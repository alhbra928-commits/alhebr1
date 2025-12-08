import { useState, lazy, Suspense, useEffect } from 'react';
import { AdminSessionService } from './modules/admin/services/adminSessionService';
import { PermissionsProvider } from './contexts/PermissionsContext';

// Lazy load EVERYTHING - including admin components
const SmartAdminLoginPage = lazy(() => import('./modules/admin/components/SmartAdminLoginPage').then(m => ({ default: m.SmartAdminLoginPage })));
const IdleSessionWarning = lazy(() => import('./modules/admin/components/IdleSessionWarning').then(m => ({ default: m.IdleSessionWarning })));
const LoginNotification = lazy(() => import('./modules/admin/components/LoginNotification').then(m => ({ default: m.LoginNotification })));
const MobileHeader = lazy(() => import('./components/layout/MobileHeader').then(m => ({ default: m.MobileHeader })));
const MobileSidebar = lazy(() => import('./components/layout/MobileSidebar').then(m => ({ default: m.MobileSidebar })));

const PublicPlatformRouter = lazy(() => import('./modules/public/components/PublicPlatformRouter').then(m => ({ default: m.PublicPlatformRouter })));
const FarmOwnerRouter = lazy(() => import('./modules/farm-owner/components/FarmOwnerRouter').then(m => ({ default: m.FarmOwnerRouter })));
const EnhancedDashboard = lazy(() => import('./modules/dashboard/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })));
const OperationsDashboard = lazy(() => import('./modules/operations/components/OperationsDashboard').then(m => ({ default: m.OperationsDashboard })));
const OwnersView = lazy(() => import('./modules/owners/components/OwnersView').then(m => ({ default: m.OwnersView })));
const FarmsView = lazy(() => import('./modules/farms/components/FarmsView').then(m => ({ default: m.FarmsView })));
const ModernBookingsInterface = lazy(() => import('./modules/reservations/components/ModernBookingsInterface').then(m => ({ default: m.ModernBookingsInterface })));
const AdvancedInvestorsView = lazy(() => import('./modules/investors/components/AdvancedInvestorsView').then(m => ({ default: m.AdvancedInvestorsView })));
const WalletsView = lazy(() => import('./modules/wallets/components/WalletsView').then(m => ({ default: m.WalletsView })));
const CorrectedFinancialDashboard = lazy(() => import('./modules/finance/components/CorrectedFinancialDashboard').then(m => ({ default: m.CorrectedFinancialDashboard })));
const AgricultureView = lazy(() => import('./modules/agriculture/components/AgricultureView').then(m => ({ default: m.AgricultureView })));
const AdvancedDocumentationView = lazy(() => import('./modules/documentation/components/AdvancedDocumentationView').then(m => ({ default: m.AdvancedDocumentationView })));
const MarketingView = lazy(() => import('./modules/marketing/components/MarketingView').then(m => ({ default: m.MarketingView })));
const SettingsView = lazy(() => import('./modules/settings/components/SettingsView').then(m => ({ default: m.SettingsView })));
const PermissionsManagementView = lazy(() => import('./modules/permissions/components/PermissionsManagementView').then(m => ({ default: m.PermissionsManagementView })));
const ReservationsDebugView = lazy(() => import('./modules/reservations/components/ReservationsDebugView').then(m => ({ default: m.ReservationsDebugView })));
const LiveSessionsMonitor = lazy(() => import('./modules/admin/components/LiveSessionsMonitor').then(m => ({ default: m.LiveSessionsMonitor })));
const AdvancedPermissionsManager = lazy(() => import('./modules/admin/components/AdvancedPermissionsManager').then(m => ({ default: m.AdvancedPermissionsManager })));
const ControlOversightView = lazy(() => import('./modules/admin/components/ControlOversightView').then(m => ({ default: m.ControlOversightView })));
const WhatsAppDashboard = lazy(() => import('./modules/whatsapp/components/WhatsAppDashboard').then(m => ({ default: m.WhatsAppDashboard })));

function App() {
  const [activeModule, setActiveModule] = useState('public');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSession, setAdminSession] = useState<any>(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // حفظ آخر صفحة في لوحة التحكم
  useEffect(() => {
    if (activeModule !== 'public' && activeModule !== 'farm-owner') {
      sessionStorage.setItem('last_admin_module', activeModule);
      sessionStorage.setItem('current_admin_module', activeModule);
    }
    // حفظ نوع المستخدم الحالي
    if (activeModule === 'farm-owner') {
      sessionStorage.setItem('last_user_type', 'farm-owner');
    } else if (activeModule !== 'public') {
      sessionStorage.setItem('last_user_type', 'admin');
    }
  }, [activeModule]);

  useEffect(() => {
    // التحقق من الجلسة المحفوظة عند بداية التطبيق
    const savedToken = localStorage.getItem('admin_session_token');
    const savedAdminData = localStorage.getItem('admin_data');

    if (savedToken && savedAdminData && !adminSession) {
      try {
        const adminData = JSON.parse(savedAdminData);
        setAdminSession({
          ...adminData,
          session: { session_token: savedToken },
          permissions: adminData.permissions || []
        });
        // لا نغير activeModule - نبقى في الصفحة العامة
        // setActiveModule('dashboard'); // تم الإلغاء

        // إبلاغ PermissionsContext بالتغيير
        setTimeout(() => {
          window.dispatchEvent(new Event('admin-session-changed'));
        }, 100);
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (adminSession && activeModule !== 'public') {
      const idleCheckInterval = setInterval(() => {
        const idleTime = Date.now() - lastActivity;
        const twentyMinutes = 20 * 60 * 1000;

        if (idleTime >= twentyMinutes) {
          setShowIdleWarning(true);
        }
      }, 60000);

      const activityHandler = () => {
        setLastActivity(Date.now());
      };

      window.addEventListener('mousemove', activityHandler);
      window.addEventListener('keydown', activityHandler);
      window.addEventListener('click', activityHandler);

      return () => {
        clearInterval(idleCheckInterval);
        window.removeEventListener('mousemove', activityHandler);
        window.removeEventListener('keydown', activityHandler);
        window.removeEventListener('click', activityHandler);
      };
    }
  }, [adminSession, activeModule, lastActivity]);

  const handleAdminLogin = async (adminData: any) => {
    // إنشاء جلسة محلية فوراً (بدون انتظار Database)
    const localSession = {
      session_token: crypto.randomUUID(),
      admin_phone: adminData.phone,
      admin_name: adminData.name,
      admin_role: adminData.role,
      session_status: 'active',
      started_at: new Date().toISOString(),
    };

    // حفظ في localStorage فوراً
    localStorage.setItem('admin_session_token', localSession.session_token);
    localStorage.setItem('admin_data', JSON.stringify(adminData));

    // عرض لوحة الإدارة فوراً
    setAdminSession({
      ...adminData,
      session: localSession,
      permissions: adminData.permissions || []
    });
    setShowAdminLogin(false);
    setActiveModule('dashboard');
    setShowLoginNotification(true);
    setLastActivity(Date.now());

    // إبلاغ PermissionsContext بالتغيير
    window.dispatchEvent(new Event('admin-session-changed'));

    // محاولة حفظ في Database في الخلفية (بدون انتظار)
    try {
      await AdminSessionService.createSession(adminData);
    } catch (error) {
      // تجاهل أخطاء Database
    }
  };

  // دالة الانتقال الذكية الموحدة
  const handleSmartNavigation = (destination: 'public' | 'back') => {
    if (destination === 'public') {
      setActiveModule('public');
    } else {
      // العودة الذكية حسب نوع المستخدم
      const userType = sessionStorage.getItem('last_user_type');
      if (userType === 'farm-owner') {
        setActiveModule('farm-owner');
      } else if (userType === 'admin') {
        const savedModule = sessionStorage.getItem('last_admin_module') || 'dashboard';
        setActiveModule(savedModule);
      } else {
        // Default: admin dashboard
        setActiveModule('dashboard');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const { token } = AdminSessionService.getCurrentSession();
      if (token) {
        await AdminSessionService.terminateSession(token);
      }

      // تنظيف كامل للجلسة
      AdminSessionService.clearSession();
      setAdminSession(null);
      setActiveModule('public');

      // إطلاق حدث الخروج لإعادة تشغيل البوابة
      window.dispatchEvent(new Event('logout'));

      // إعادة تحميل الصفحة للتأكد من الخروج الكامل
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // حتى لو حدث خطأ، نخرج
      AdminSessionService.clearSession();
      setAdminSession(null);
      setActiveModule('public');

      // إطلاق حدث الخروج
      window.dispatchEvent(new Event('logout'));

      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const getModuleTitle = (module: string): string => {
    const titles: Record<string, string> = {
      'dashboard': 'لوحة التحكم',
      'owners': 'أصحاب المزارع',
      'farms': 'المزارع',
      'reservations': 'الحجوزات',
      'investors': 'المستثمرون',
      'finance': 'النظام المالي',
      'agriculture': 'الخدمات الزراعية',
      'documentation': 'التوثيق',
      'whatsapp': 'إدارة الواتساب',
      'marketing': 'التسويق',
      'wallets': 'المحافظ',
      'permissions': 'الصلاحيات',
      'settings': 'الإعدادات',
      'public': 'المنصة العامة',
      'farm-owner': 'بوابة صاحب المزرعة'
    };
    return titles[module] || 'منصة النخيل والزيتون';
  };

  const renderModule = () => {
    try {
      switch (activeModule) {
        case 'public':
          return (
            <PublicPlatformRouter
              onAdminLogin={() => setShowAdminLogin(true)}
              onBackToAdmin={() => handleSmartNavigation('back')}
              onFarmOwnerLogin={() => setActiveModule('farm-owner')}
            />
          );
      case 'farm-owner':
        return <FarmOwnerRouter onGoToPublic={() => setActiveModule('public')} />;
      case 'dashboard':
        return (
          <EnhancedDashboard
            onModuleSelect={setActiveModule}
            activeModule={activeModule}
            onLogout={handleLogout}
            onGoToPublic={() => setActiveModule('public')}
            onShowLogin={() => setShowAdminLogin(true)}
          />
        );
      case 'operations':
        return <OperationsDashboard />;
      case 'owners':
        return <OwnersView onBack={() => setActiveModule('dashboard')} />;
      case 'farms':
        return <FarmsView onBack={() => setActiveModule('dashboard')} />;
      case 'reservations':
        return <ModernBookingsInterface onBack={() => setActiveModule('dashboard')} />;
      case 'investors':
        return <AdvancedInvestorsView onBack={() => setActiveModule('dashboard')} />;
      case 'wallets':
        return <WalletsView onBack={() => setActiveModule('dashboard')} />;
      case 'finance':
      case 'finance-old':
        return <CorrectedFinancialDashboard onBack={() => setActiveModule('dashboard')} />;
      case 'agriculture':
        return <AgricultureView onBack={() => setActiveModule('dashboard')} />;
      case 'documentation':
        return <AdvancedDocumentationView onBack={() => setActiveModule('dashboard')} />;
      case 'whatsapp':
        return <WhatsAppDashboard onBack={() => setActiveModule('dashboard')} />;
      case 'marketing':
        return <MarketingView onBack={() => setActiveModule('dashboard')} />;
      case 'settings':
        return <SettingsView onBack={() => setActiveModule('dashboard')} />;
      case 'permissions':
        return <ControlOversightView onBack={() => setActiveModule('dashboard')} />;
      case 'sessions':
        return (
          <div>
            <button
              onClick={() => setActiveModule('dashboard')}
              className="fixed top-6 left-6 z-50 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C4941F 100%)' }}
            >
              العودة للوحة الإدارة
            </button>
            <div className="p-6 md:p-8">
              <LiveSessionsMonitor />
            </div>
          </div>
        );
      case 'reservations-debug':
        return <ReservationsDebugView />;
        default:
          return (
            <EnhancedDashboard
              onModuleSelect={setActiveModule}
              activeModule={activeModule}
              onLogout={handleLogout}
              onGoToPublic={() => setActiveModule('public')}
              onShowLogin={() => setShowAdminLogin(true)}
            />
          );
      }
    } catch (error) {
      console.error('[App] Error rendering module:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-6" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-black text-red-600 mb-4">حدث خطأ غير متوقع</h2>
            <p className="text-lg text-gray-700 mb-6">
              عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى تحديث الصفحة والمحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all"
            >
              تحديث الصفحة
            </button>
            <p className="text-sm text-gray-500 mt-4">
              افتح Console (F12) لرؤية تفاصيل الخطأ
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="min-h-screen royal-green-bg"
      dir="rtl"
      style={{
        position: 'relative',
        overflow: 'visible',
        minHeight: '100vh'
      }}
    >
      {showAdminLogin && (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
          <SmartAdminLoginPage
            onLoginSuccess={handleAdminLogin}
            onCancel={() => setShowAdminLogin(false)}
          />
        </Suspense>
      )}

      {showIdleWarning && (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
          <IdleSessionWarning
            onContinue={() => {
              setShowIdleWarning(false);
              setLastActivity(Date.now());
            }}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      {/* Temporarily disabled - UpdateNotificationBanner */}

      {showLoginNotification && adminSession && (
        <Suspense fallback={null}>
          <LoginNotification
            adminName={adminSession.name}
            adminPhone={adminSession.phone}
            module="لوحة التحكم"
            onClose={() => setShowLoginNotification(false)}
          />
        </Suspense>
      )}

      {/* Mobile Header - Shows on mobile for admin pages */}
      {adminSession && activeModule !== 'public' && activeModule !== 'farm-owner' && (
        <Suspense fallback={null}>
          <MobileHeader
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            title={getModuleTitle(activeModule)}
          />
        </Suspense>
      )}

      <PermissionsProvider>
        {/* Mobile Sidebar - Shows on mobile for admin pages */}
        {adminSession && activeModule !== 'public' && activeModule !== 'farm-owner' && (
          <Suspense fallback={null}>
            <MobileSidebar
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              isOpen={isMobileSidebarOpen}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </Suspense>
        )}

        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50" />}>
          {/* iOS Scroll wrapper - Makes content scrollable while header stays fixed */}
          <div className="ios-scroll-content">
            {renderModule()}
          </div>
        </Suspense>
      </PermissionsProvider>

    </div>
  );
}

export default App;
