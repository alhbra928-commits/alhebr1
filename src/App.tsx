import { useState, lazy, Suspense, useEffect } from 'react';
import { SimpleLoader } from './components/common/SimpleLoader';
import { SmartAdminLoginPage } from './modules/admin/components/SmartAdminLoginPage';
import { IdleSessionWarning } from './modules/admin/components/IdleSessionWarning';
import { LoginNotification } from './modules/admin/components/LoginNotification';
import { AdminSessionService } from './modules/admin/services/adminSessionService';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { UpdateNotificationBanner } from './components/common/UpdateNotificationBanner';
import { SmartFloatingButton } from './components/common/SmartFloatingButton';
import { MobileHeader } from './components/layout/MobileHeader';
import { MobileSidebar } from './components/layout/MobileSidebar';

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
              onBackToAdmin={() => setActiveModule('dashboard')}
              onFarmOwnerLogin={() => setActiveModule('farm-owner')}
            />
          );
      case 'farm-owner':
        return <FarmOwnerRouter />;
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
    <div className="min-h-screen royal-green-bg" dir="rtl">
      {showAdminLogin && (
        <SmartAdminLoginPage
          onLoginSuccess={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}

      {showIdleWarning && (
        <IdleSessionWarning
          onContinue={() => {
            setShowIdleWarning(false);
            setLastActivity(Date.now());
          }}
          onLogout={handleLogout}
        />
      )}

      {adminSession && activeModule !== 'public' && (
        <UpdateNotificationBanner userRole="admin" />
      )}

      {showLoginNotification && adminSession && (
        <LoginNotification
          adminName={adminSession.name}
          adminPhone={adminSession.phone}
          module="لوحة التحكم"
          onClose={() => setShowLoginNotification(false)}
        />
      )}

      {/* Mobile Header - Shows on mobile for admin pages */}
      {adminSession && activeModule !== 'public' && activeModule !== 'farm-owner' && (
        <MobileHeader
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          title={getModuleTitle(activeModule)}
        />
      )}

      <PermissionsProvider>
        {/* Mobile Sidebar - Shows on mobile for admin pages */}
        {adminSession && activeModule !== 'public' && activeModule !== 'farm-owner' && (
          <MobileSidebar
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-950">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <SimpleLoader size="lg" color="#10b981" />
              </div>
              <p className="text-xl font-bold text-gray-100">جاري التحميل...</p>
            </div>
          </div>
        }>
          {/* Add padding-top for mobile header */}
          <div className={adminSession && activeModule !== 'public' && activeModule !== 'farm-owner' ? 'pt-14 lg:pt-0' : ''}>
            {renderModule()}
          </div>
        </Suspense>
      </PermissionsProvider>

      {/* Smart Floating WhatsApp Button - Shows on all pages */}
      <SmartFloatingButton />
    </div>
  );
}

export default App;
