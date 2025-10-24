import { useState, useEffect } from 'react';
import { SmartInvestorLoginPage } from './SmartInvestorLoginPage';
import { InvestorDashboard } from './InvestorDashboard';
import { InvestorService } from '../services/investorService';
import { SessionManager } from '../services/sessionManager';
import { Loader } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';

interface InvestorRouterProps {
  onBack: () => void;
  autoLoginPhone?: string;
  autoLoginName?: string;
}

export function InvestorRouter({ onBack, autoLoginPhone, autoLoginName }: InvestorRouterProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [investorPhone, setInvestorPhone] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [isRestoring, setIsRestoring] = useState(true);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      // إذا كانت هناك بيانات دخول تلقائي (من صفحة التأكيد بعد الحجز)
      if (autoLoginPhone && autoLoginName) {
        console.log('🎯 Auto-login from booking confirmation:', autoLoginPhone, autoLoginName);

        // التحقق من الحالة
        const loginStatus = await InvestorService.checkLoginStatus(autoLoginPhone);

        // إنشاء جلسة للدخول الأول
        if (loginStatus.isFirstLogin) {
          const token = await InvestorService.createSession(autoLoginPhone, true);

          await InvestorService.logLoginAttempt({
            phone: autoLoginPhone,
            login_type: 'auto_first_time',
            success: true
          });

          setInvestorPhone(autoLoginPhone);
          setSessionToken(token);
          setIsLoggedIn(true);
          setIsFirstTimeLogin(true);

          SessionManager.saveSession({
            phone: autoLoginPhone,
            sessionToken: token,
            investorName: autoLoginName,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          });

          setIsRestoring(false);
          return;
        }
      }

      // محاولة استعادة جلسة موجودة فقط
      const sessionData = await SessionManager.restoreSession();

      if (sessionData) {
        setInvestorPhone(sessionData.phone);
        setSessionToken(sessionData.sessionToken);
        setIsLoggedIn(true);
        setIsFirstTimeLogin(false);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleLoginSuccess = (phone: string, token: string, investorName?: string) => {
    SessionManager.saveSession({
      phone,
      sessionToken: token,
      investorName: investorName || 'المستثمر',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });

    setInvestorPhone(phone);
    setSessionToken(token);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    if (sessionToken) {
      await InvestorService.invalidateSession(sessionToken);
    }
    await SessionManager.clearSession();
    setIsLoggedIn(false);
    setInvestorPhone('');
    setSessionToken('');
    onBack();
  };

  if (isRestoring) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: brandGradients.beige }}
      >
        <div className="text-center">
          <Loader
            className="h-12 w-12 animate-spin mx-auto mb-4"
            style={{ color: brandColors.primary.gold }}
          />
          <p className="text-xl font-bold" style={{ color: brandColors.text.primary }}>
            استعادة جلستك...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <SmartInvestorLoginPage
        onLoginSuccess={handleLoginSuccess}
        onBack={onBack}
      />
    );
  }

  return (
    <InvestorDashboard
      phone={investorPhone}
      onLogout={handleLogout}
      isFirstTimeLogin={isFirstTimeLogin}
    />
  );
}
