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
    const hasSession = AdminSessionService.hasActiveSession();
    setIsVisible(hasSession);
  };

  const handleClick = () => {
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
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 font-semibold"
      style={{
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>لوحة الإدارة</span>
    </button>
  );
}
