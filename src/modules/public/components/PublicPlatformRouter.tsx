import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { InnovativeLoaderGateway } from './InnovativeLoaderGateway';

type View = 'loader' | 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
  onViewChange?: (view: 'home' | 'farmDetail' | 'booking' | 'investor' | 'verification' | 'concept') => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin, onViewChange }: PublicPlatformRouterProps) {
  // التحقق من حالة الجلسة - إذا كان هناك جلسة نشطة، نتخطى البوابة
  const hasActiveSession = () => {
    const adminToken = localStorage.getItem('admin_session_token');
    const farmOwnerToken = sessionStorage.getItem('farm_owner_logged_in');
    const investorToken = sessionStorage.getItem('investor_logged_in');

    return !!(adminToken || farmOwnerToken || investorToken);
  };

  const [currentView, setCurrentView] = useState<View>(() => {
    // ✅ نبدأ دائماً بـ main - الـ Suspense في App.tsx سيتولى التحميل
    return 'main';
  });
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  // مراقبة تغيير حالة الجلسات - فقط للخروج الصريح
  useEffect(() => {
    const handleExplicitLogout = () => {
      // ✅ عند الخروج، نرجع مباشرة للصفحة الرئيسية (بدون loader إضافي)
      console.log('🔄 تم تسجيل الخروج الصريح - العودة للصفحة الرئيسية...');
      setCurrentView('main');
    };

    // الاستماع فقط لحدث الخروج الصريح
    window.addEventListener('logout', handleExplicitLogout);

    return () => {
      window.removeEventListener('logout', handleExplicitLogout);
    };
  }, [currentView]);

  const handleLoaderComplete = () => {
    setCurrentView('main');
  };

  const handlePreviewSelect = (barcode: string) => {
    setSelectedBarcode(barcode);
    setCurrentView('preview');
  };

  const handleOwn = () => {
    alert(`🌴 سيتم فتح نموذج الحجز للمزرعة ${selectedBarcode}\n\nهذه الميزة قيد التطوير...`);
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedBarcode('');
  };

  switch (currentView) {
    case 'loader':
      return <InnovativeLoaderGateway onComplete={handleLoaderComplete} />;

    case 'preview':
      return (
        <PreviewInspectionPage
          barcode={selectedBarcode}
          onBack={handleBackToMain}
          onOwn={handleOwn}
        />
      );

    case 'main':
    default:
      return (
        <ModernRoyalPlatform
          onAdminLogin={onAdminLogin}
          onBackToAdmin={onBackToAdmin}
          onFarmOwnerLogin={onFarmOwnerLogin}
          onViewChange={onViewChange}
        />
      );
  }
}
