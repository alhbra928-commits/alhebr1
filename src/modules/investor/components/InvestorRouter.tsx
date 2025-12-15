import { useState, useEffect, useCallback } from 'react';
import { SmartInvestorLoginPage } from './SmartInvestorLoginPage';
import { InvestorDashboard } from './InvestorDashboard';
import { InvestorService } from '../services/investorService';
import { SessionManager } from '../services/sessionManager';
import { Loader } from 'lucide-react';
import { brandColors, brandGradients } from '../../finance/styles/brandColors';
import { supabase } from '../../../lib/supabase';

interface InvestorRouterProps {
  onBack: () => void;
  onGoToPublic?: () => void;
  autoLoginPhone?: string;
  autoLoginName?: string;
}

export function InvestorRouter({ onBack, onGoToPublic, autoLoginPhone, autoLoginName }: InvestorRouterProps) {
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

        // تطبيع رقم الهاتف
        const normalizedPhone = InvestorService.normalizePhone(autoLoginPhone);
        console.log('🎯 Auto-login normalized phone:', normalizedPhone);

        // التحقق من الحالة
        const loginStatus = await InvestorService.checkLoginStatus(normalizedPhone);

        // إنشاء جلسة للدخول الأول
        if (loginStatus.isFirstLogin) {
          const token = await InvestorService.createSession(normalizedPhone, true);

          await InvestorService.logLoginAttempt({
            phone: normalizedPhone,
            login_type: 'auto_first_time',
            success: true
          });

          setInvestorPhone(normalizedPhone);
          setSessionToken(token);
          setIsLoggedIn(true);
          setIsFirstTimeLogin(true);

          SessionManager.saveSession({
            phone: normalizedPhone,
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

  const handleLoginSuccess = useCallback(async (phone: string, token: string, investorName?: string) => {
    console.log('🎯 [handleLoginSuccess] Called with:', { phone, token, investorName });

    // تطبيع رقم الهاتف قبل الحفظ والاستخدام
    const normalizedPhone = InvestorService.normalizePhone(phone);
    console.log('🎯 [handleLoginSuccess] Normalized phone:', normalizedPhone);

    // فحص حقل is_first_login من الجلسة الحالية بدلاً من حساب عدد الجلسات
    let isFirst = false;
    try {
      const { data: currentSession } = await supabase
        .from('investor_sessions')
        .select('is_first_login, started_at')
        .eq('phone', normalizedPhone)
        .eq('session_token', token)
        .maybeSingle();

      if (currentSession) {
        isFirst = currentSession.is_first_login === true;
        console.log('🎯🎯🎯 [handleLoginSuccess] Found current session:', currentSession);
      } else {
        // fallback: فحص إذا كان هذا أول دخول بناءً على عدد الجلسات السابقة
        const { data: previousSessions } = await InvestorService.checkPreviousSessions(normalizedPhone);
        isFirst = !previousSessions || previousSessions.length === 0;
        console.log('🎯🎯🎯 [handleLoginSuccess] Fallback check - previousSessions count:', previousSessions?.length);
      }
    } catch (error) {
      console.error('Error checking first login status:', error);
      // في حالة الخطأ، نعتبره ليس أول دخول لتجنب إزعاج المستخدمين القدامى
      isFirst = false;
    }

    console.log('🎯🎯🎯 [handleLoginSuccess] Final isFirstTimeLogin:', isFirst);

    SessionManager.saveSession({
      phone: normalizedPhone,
      sessionToken: token,
      investorName: investorName || 'المستثمر',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    });

    setInvestorPhone(normalizedPhone);
    setSessionToken(token);
    setIsLoggedIn(true);
    setIsFirstTimeLogin(isFirst);

    console.log('✅✅✅ [handleLoginSuccess] State updated:', {
      investorPhone: normalizedPhone,
      isFirstTimeLogin: isFirst
    });
  }, []);

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
      onGoToPublic={onGoToPublic}
    />
  );
}
