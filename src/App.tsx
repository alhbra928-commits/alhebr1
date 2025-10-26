import { useState, lazy, Suspense, useEffect } from 'react';
import { SimpleLoader } from './components/common/SimpleLoader';
import { SmartAdminLoginPage } from './modules/admin/components/SmartAdminLoginPage';
import { IdleSessionWarning } from './modules/admin/components/IdleSessionWarning';
import { LoginNotification } from './modules/admin/components/LoginNotification';
import { AdminSessionService } from './modules/admin/services/adminSessionService';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { UpdateNotificationBanner } from './components/common/UpdateNotificationBanner';

const PublicPlatformRouter = lazy(() => import('./modules/public/components/PublicPlatformRouter').then(m => ({ default: m.PublicPlatformRouter })));
const FarmOwnerRouter = lazy(() => import('./modules/farm-owner/components/FarmOwnerRouter').then(m => ({ default: m.FarmOwnerRouter })));
const EnhancedDashboard = lazy(() => import('./modules/dashboard/EnhancedDashboard').then(m => ({ default: m.EnhancedDashboard })));
const OwnersView = lazy(() => import('./modules/owners/components/OwnersView').then(m => ({ default: m.OwnersView })));
const FarmsView = lazy(() => import('./modules/farms/components/FarmsView').then(m => ({ default: m.FarmsView })));
const AdvancedBookingsView = lazy(() => import('./modules/reservations/components/AdvancedBookingsView').then(m => ({ default: m.AdvancedBookingsView })));
const AdvancedInvestorsView = lazy(() => import('./modules/investors/components/AdvancedInvestorsView').then(m => ({ default: m.AdvancedInvestorsView })));
const WalletsView = lazy(() => import('./modules/wallets/components/WalletsView').then(m => ({ default: m.WalletsView })));
const AdvancedFinancialDashboard = lazy(() => import('./modules/finance/components/AdvancedFinancialDashboard').then(m => ({ default: m.AdvancedFinancialDashboard })));
const SmartFinancialDashboard = lazy(() => import('./modules/finance/components/SmartFinancialDashboard').then(m => ({ default: m.SmartFinancialDashboard })));
const AgricultureView = lazy(() => import('./modules/agriculture/components/AgricultureView').then(m => ({ default: m.AgricultureView })));
const AdvancedDocumentationView = lazy(() => import('./modules/documentation/components/AdvancedDocumentationView').then(m => ({ default: m.AdvancedDocumentationView })));
const MarketingView = lazy(() => import('./modules/marketing/components/MarketingView').then(m => ({ default: m.MarketingView })));
const SettingsView = lazy(() => import('./modules/settings/components/SettingsView').then(m => ({ default: m.SettingsView })));
const PermissionsManagementView = lazy(() => import('./modules/permissions/components/PermissionsManagementView').then(m => ({ default: m.PermissionsManagementView })));
const ReservationsDebugView = lazy(() => import('./modules/reservations/components/ReservationsDebugView').then(m => ({ default: m.ReservationsDebugView })));
const LiveSessionsMonitor = lazy(() => import('./modules/admin/components/LiveSessionsMonitor').then(m => ({ default: m.LiveSessionsMonitor })));
const AdvancedPermissionsManager = lazy(() => import('./modules/admin/components/AdvancedPermissionsManager').then(m => ({ default: m.AdvancedPermissionsManager })));
const ControlOversightView = lazy(() => import('./modules/admin/components/ControlOversightView').then(m => ({ default: m.ControlOversightView })));
const ModernWhatsAppDashboard = lazy(() => import('./modules/whatsapp/components/ModernWhatsAppDashboard').then(m => ({ default: m.ModernWhatsAppDashboard })));
const ModernMessagesLog = lazy(() => import('./modules/whatsapp/components/ModernMessagesLog').then(m => ({ default: m.ModernMessagesLog })));

function App() {
  const [activeModule, setActiveModule] = useState('public');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSession, setAdminSession] = useState<any>(null);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

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
        const { token } = AdminSessionService.getCurrentSession();
        if (token) {
          AdminSessionService.updateActivity(token, activeModule);
        }
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
    try {
      const { session, permissions } = await AdminSessionService.createSession(adminData);
      setAdminSession({ ...adminData, session, permissions });
      setShowAdminLogin(false);
      setActiveModule('dashboard');
      setShowLoginNotification(true);
      setLastActivity(Date.now());
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('فشل في إنشاء الجلسة');
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

  const renderModule = () => {
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
      case 'owners':
        return <OwnersView onBack={() => setActiveModule('dashboard')} />;
      case 'farms':
        return <FarmsView onBack={() => setActiveModule('dashboard')} />;
      case 'reservations':
        return <AdvancedBookingsView onBack={() => setActiveModule('dashboard')} />;
      case 'investors':
        return <AdvancedInvestorsView onBack={() => setActiveModule('dashboard')} />;
      case 'wallets':
        return <WalletsView onBack={() => setActiveModule('dashboard')} />;
      case 'finance':
        return <SmartFinancialDashboard onBack={() => setActiveModule('dashboard')} />;
      case 'finance-old':
        return <AdvancedFinancialDashboard onBack={() => setActiveModule('dashboard')} />;
      case 'agriculture':
        return <AgricultureView onBack={() => setActiveModule('dashboard')} />;
      case 'documentation':
        return <AdvancedDocumentationView onBack={() => setActiveModule('dashboard')} />;
      case 'marketing':
        return <MarketingView onBack={() => setActiveModule('dashboard')} />;
      case 'settings':
        return <SettingsView onBack={() => setActiveModule('dashboard')} />;
      case 'whatsapp':
        return <ModernWhatsAppDashboard onBack={() => setActiveModule('dashboard')} />;
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
  };

  return (
    <PermissionsProvider>
      <div className="min-h-screen bg-[#F9F8F6]" dir="rtl">
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

        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F9F8F6] to-[#E8E6E1]">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <SimpleLoader size="lg" color="#C89B3C" />
              </div>
              <p className="text-xl font-bold text-[#3D5B4B]">جاري التحميل...</p>
            </div>
          </div>
        }>
          {renderModule()}
        </Suspense>
      </div>
    </PermissionsProvider>
  );
}

export default App;
