import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AdminSessionService } from '../../admin/services/adminSessionService';

interface BackToAdminButtonProps {
  onBackToAdmin: () => void;
}

export function BackToAdminButton({ onBackToAdmin }: BackToAdminButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // التحقق الفوري
    checkSession();

    // التحقق كل نصف ثانية - استجابة أسرع
    const interval = setInterval(checkSession, 500);

    // الاستماع لتغييرات الجلسة
    const handleSessionChange = () => {
      console.log('[BackToAdmin] 📢 تغيير في الجلسة - إعادة التحقق');
      checkSession();
    };

    // الاستماع لحدث الخروج - إخفاء فوري
    const handleLogout = () => {
      console.log('[BackToAdmin] 🚪 تسجيل خروج - إخفاء الزر فوراً');
      setIsVisible(false);
    };

    window.addEventListener('admin-session-changed', handleSessionChange);
    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('admin-logout', handleLogout);
    window.addEventListener('logout', handleLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener('admin-session-changed', handleSessionChange);
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('admin-logout', handleLogout);
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const checkSession = () => {
    // التحقق من جميع أنواع الجلسات
    const adminToken = localStorage.getItem('admin_session_token');
    const adminData = localStorage.getItem('admin_data');
    const hasAdminSession = !!(adminToken && adminData);

    const hasInvestorSession = !!sessionStorage.getItem('investor_logged_in');
    const hasFarmOwnerSession = !!sessionStorage.getItem('farm_owner_logged_in');

    // التحقق من نوع المستخدم المحفوظ
    const userType = sessionStorage.getItem('last_user_type');
    const hasUserType = !!(userType && userType !== 'public');

    // التحقق من علامة القدوم من لوحة التحكم
    const cameFromAdmin = sessionStorage.getItem('came_from_admin') === 'true';
    const hasActiveAdminSession = sessionStorage.getItem('has_admin_session') === 'true';

    // يجب أن يظهر إذا: جلسة admin نشطة أو جلسات أخرى أو نوع مستخدم محدد
    const shouldShow = hasAdminSession || hasInvestorSession || hasFarmOwnerSession || hasUserType || cameFromAdmin || hasActiveAdminSession;

    if (shouldShow !== isVisible) {
      console.log('[BackToAdmin] 🔄 تحديث حالة الزر:', {
        hasAdminSession,
        adminToken: adminToken ? 'موجود' : 'غير موجود',
        hasInvestorSession,
        hasFarmOwnerSession,
        userType,
        cameFromAdmin,
        hasActiveAdminSession,
        shouldShow
      });
    }

    setIsVisible(shouldShow);
  };

  const handleClick = () => {
    console.log('[BackToAdmin] 🔙 الرجوع للوحة التحكم...');
    if (onBackToAdmin) {
      onBackToAdmin();
    }
  };

  const getButtonText = () => {
    const userType = sessionStorage.getItem('last_user_type');
    if (userType === 'farm-owner') {
      return 'بوابة صاحب المزرعة';
    } else if (userType === 'investor') {
      return 'بوابة المستثمر';
    } else {
      return 'لوحة التحكم';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 font-bold text-base animate-pulse-slow"
      style={{
        backdropFilter: 'blur(10px)',
        border: '3px solid rgba(255,255,255,0.4)',
        boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.8), 0 0 0 4px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.3)',
        fontFamily: 'Tajawal, sans-serif',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}
      title="الرجوع للوحة التحكم"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{getButtonText()}</span>
    </button>
  );
}
