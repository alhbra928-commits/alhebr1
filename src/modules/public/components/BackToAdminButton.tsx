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
    const interval = setInterval(checkSession, 500);
    return () => clearInterval(interval);
  }, []);

  const checkSession = () => {
    const hasAdminSession = AdminSessionService.hasActiveSession();
    const hasInvestorSession = sessionStorage.getItem('last_user_type') === 'investor';
    const hasFarmOwnerSession = sessionStorage.getItem('last_user_type') === 'farm-owner';
    setIsVisible(hasAdminSession || hasInvestorSession || hasFarmOwnerSession);
  };

  const handleClick = () => {
    // حفظ نوع المستخدم
    const userType = sessionStorage.getItem('last_user_type');
    if (onBackToAdmin) {
      onBackToAdmin();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed left-6 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 font-semibold text-sm"
      style={{
        bottom: 'calc(72px + 1rem)',
        zIndex: 999999,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>لوحة الإدارة</span>
    </button>
  );
}
