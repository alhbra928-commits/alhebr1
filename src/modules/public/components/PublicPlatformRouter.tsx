import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { InnovativeLoaderGateway } from './InnovativeLoaderGateway';
import { PingDebugBadge } from '../../../components/common/PingDebugBadge';
import { PingService } from '../../../services/analytics/pingService';

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

  // 🎯 PING SYSTEM - إرسال ping واحد عند تحميل الصفحة
  useEffect(() => {
    const sendInitialPing = async () => {
      console.log('📡 Initializing PING System...');
      const result = await PingService.sendPing();

      if (result.success) {
        console.log('✅ PING sent successfully - Code:', result.httpCode);
      } else {
        console.error('❌ PING failed - Code:', result.httpCode, 'Error:', result.error);
      }
    };

    // إرسال ping فوراً عند تحميل الصفحة
    sendInitialPing();
  }, []); // Empty deps = run once only

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
      return (
        <>
          <InnovativeLoaderGateway onComplete={handleLoaderComplete} />
          {/* PING Debug Badge */}
          <PingDebugBadge />
        </>
      );

    case 'preview':
      return (
        <>
          <PreviewInspectionPage
            barcode={selectedBarcode}
            onBack={handleBackToMain}
            onOwn={handleOwn}
          />
          {/* PING Debug Badge */}
          <PingDebugBadge />
        </>
      );

    case 'main':
    default:
      return (
        <>
          <ModernRoyalPlatform
            onAdminLogin={onAdminLogin}
            onBackToAdmin={onBackToAdmin}
            onFarmOwnerLogin={onFarmOwnerLogin}
            onViewChange={onViewChange}
          />
          {/* PING Debug Badge */}
          <PingDebugBadge />
        </>
      );
  }
}
