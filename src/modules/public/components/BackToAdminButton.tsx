import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AdminSessionService } from '../../admin/services/adminSessionService';

interface BackToAdminButtonProps {
  onBackToAdmin: () => void;
}

export function BackToAdminButton({ onBackToAdmin }: BackToAdminButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkSession();
    // التحقق كل 1 ثانية - أكثر موثوقية
    const interval = setInterval(checkSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSession = () => {
    // التحقق من جميع أنواع الجلسات
    const hasAdminSession = !!(
      localStorage.getItem('admin_session_token') &&
      localStorage.getItem('admin_data')
    );
    const hasInvestorSession = !!sessionStorage.getItem('investor_logged_in');
    const hasFarmOwnerSession = !!sessionStorage.getItem('farm_owner_logged_in');

    // التحقق من نوع المستخدم المحفوظ
    const userType = sessionStorage.getItem('last_user_type');
    const hasUserType = !!(userType && userType !== 'public');

    const shouldShow = hasAdminSession || hasInvestorSession || hasFarmOwnerSession || hasUserType;

    if (shouldShow !== isVisible) {
      console.log('[BackToAdmin] 🔄 تحديث حالة الزر:', {
        hasAdminSession,
        hasInvestorSession,
        hasFarmOwnerSession,
        userType,
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
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 font-bold text-base animate-pulse-slow"
      style={{
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.6), 0 0 0 3px rgba(16, 185, 129, 0.1)',
      }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{getButtonText()}</span>
    </button>
  );
}
