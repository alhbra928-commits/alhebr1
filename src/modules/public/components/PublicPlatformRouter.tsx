import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { InnovativeLoaderGateway } from './InnovativeLoaderGateway';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';

type View = 'loader' | 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  // التحقق من حالة الجلسة - إذا كان هناك جلسة نشطة، نتخطى البوابة
  const hasActiveSession = () => {
    const adminToken = localStorage.getItem('admin_session_token');
    const farmOwnerToken = sessionStorage.getItem('farm_owner_logged_in');
    const investorToken = sessionStorage.getItem('investor_logged_in');

    return !!(adminToken || farmOwnerToken || investorToken);
  };

  const [currentView, setCurrentView] = useState<View>(() => {
    // إذا كانت هناك جلسة نشطة، نبدأ مباشرة في main
    return hasActiveSession() ? 'main' : 'loader';
  });
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  // تهيئة السكربتات التحليلية عند التحميل الأول - فقط مرة واحدة
  useEffect(() => {
    // تأخير التحميل لتحسين الأداء
    const timer = setTimeout(() => {
      marketingAnalyticsService.initializePixels()
        .catch(err => console.warn('Analytics init failed:', err));
    }, 2000); // تأخير 2 ثانية

    return () => clearTimeout(timer);
  }, []);

  // مراقبة تغيير حالة الجلسات
  useEffect(() => {
    const handleSessionChange = () => {
      if (!hasActiveSession() && currentView === 'main') {
        // إذا تم تسجيل الخروج، نعيد تشغيل البوابة
        console.log('🔄 تم تسجيل الخروج - إعادة تشغيل البوابة...');
        setCurrentView('loader');
      }
    };

    // الاستماع لحدث تغيير الجلسة
    window.addEventListener('storage', handleSessionChange);
    window.addEventListener('logout', handleSessionChange);

    return () => {
      window.removeEventListener('storage', handleSessionChange);
      window.removeEventListener('logout', handleSessionChange);
    };
  }, [currentView]);

  // التتبع التلقائي للزوار - تأخير أيضاً
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        marketingAnalyticsService.trackCurrentPage();
      } catch (err) {
        console.warn('Tracking failed:', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
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
        />
      );
  }
}
