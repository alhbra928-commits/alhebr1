import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { RevolutionaryGreenGateway } from './RevolutionaryGreenGateway';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';

type View = 'gateway' | 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>(() => {
    // التحقق من آخر مرة تم عرض البوابة فيها
    const lastGatewayView = localStorage.getItem('last_gateway_view');

    if (!lastGatewayView) {
      // أول زيارة - عرض البوابة
      return 'gateway';
    }

    const lastViewTime = parseInt(lastGatewayView, 10);
    const currentTime = Date.now();
    const oneHour = 60 * 60 * 1000; // ساعة واحدة بالميلي ثانية

    // إذا مر أكثر من ساعة، عرض البوابة مرة أخرى
    if (currentTime - lastViewTime >= oneHour) {
      return 'gateway';
    }

    // لم يمر ساعة بعد - الذهاب مباشرة للمنصة
    return 'main';
  });

  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  // تهيئة السكربتات التحليلية عند التحميل الأول
  useEffect(() => {
    const initAnalytics = async () => {
      await marketingAnalyticsService.initializePixels();
      console.log('📊 Analytics pixels initialized');
    };
    initAnalytics();
  }, []);

  // التتبع التلقائي للزوار عند تغيير الصفحة
  useEffect(() => {
    marketingAnalyticsService.trackCurrentPage();
  }, [currentView]);

  const handleEnterPlatform = () => {
    // حفظ وقت عرض البوابة
    localStorage.setItem('last_gateway_view', Date.now().toString());
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
    case 'gateway':
      return (
        <RevolutionaryGreenGateway
          onEnter={handleEnterPlatform}
          onAdminLogin={onAdminLogin}
          onFarmOwnerLogin={onFarmOwnerLogin}
        />
      );

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
