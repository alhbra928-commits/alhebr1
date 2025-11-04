import React, { useEffect, useState } from 'react';
import { Globe, ArrowLeft } from 'lucide-react';

interface UnifiedSmartNavigationButtonProps {
  currentLocation: 'public' | 'admin' | 'investor' | 'farm-owner' | 'marketer';
  onNavigate: (destination: 'public' | 'admin') => void;
  userType?: 'admin' | 'investor' | 'farm-owner' | 'marketer';
}

export function UnifiedSmartNavigationButton({
  currentLocation,
  onNavigate,
  userType,
}: UnifiedSmartNavigationButtonProps) {
  const [lastAdminModule, setLastAdminModule] = useState<string>('dashboard');

  // حفظ آخر صفحة في لوحة التحكم
  useEffect(() => {
    if (currentLocation !== 'public') {
      const currentModule = sessionStorage.getItem('current_admin_module') || 'dashboard';
      setLastAdminModule(currentModule);
    }
  }, [currentLocation]);

  // تحديد حالة الزر
  const isInPublic = currentLocation === 'public';
  const buttonText = isInPublic ? '🌍 استكشاف المنصة' : '🔙 العودة إلى لوحة التحكم';
  const buttonIcon = isInPublic ? Globe : ArrowLeft;
  const Icon = buttonIcon;

  // دالة الانتقال الذكية
  const handleClick = () => {
    if (isInPublic) {
      // الانتقال إلى المنصة العامة
      onNavigate('public');
    } else {
      // العودة إلى آخر صفحة في لوحة التحكم
      const savedModule = sessionStorage.getItem('last_admin_module') || 'dashboard';
      sessionStorage.setItem('current_admin_module', savedModule);
      onNavigate('admin');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full group relative overflow-hidden"
    >
      {/* الخلفية الزجاجية الخضراء */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/20
                   backdrop-blur-lg border border-emerald-400/30 rounded-2xl
                   transition-all duration-500 group-hover:from-emerald-500/30 group-hover:to-green-500/30
                   group-hover:border-emerald-400/50 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
      />

      {/* التوهج الأخضر */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent
                   translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
      />

      {/* المحتوى */}
      <div className="relative flex items-center justify-center gap-3 px-6 py-4">
        <Icon className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        <span className="font-bold text-white text-lg group-hover:scale-105 transition-transform">
          {buttonText}
        </span>
      </div>

      {/* الحافة المتوهجة */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.1)',
        }}
      />
    </button>
  );
}
