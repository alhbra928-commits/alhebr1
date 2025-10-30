import React, { useState, useEffect } from 'react';
import { RoyalMainInterface } from './RoyalMainInterface';
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
  const [currentView, setCurrentView] = useState<View>('gateway');
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  // Debug: تتبع props
  useEffect(() => {
    console.log('📋 PublicPlatformRouter Props:', {
      onAdminLogin: !!onAdminLogin,
      onBackToAdmin: !!onBackToAdmin,
      onFarmOwnerLogin: !!onFarmOwnerLogin
    });
  }, [onAdminLogin, onBackToAdmin, onFarmOwnerLogin]);

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
        <RoyalMainInterface
          onAdminLogin={onAdminLogin}
          onBackToAdmin={onBackToAdmin}
          onFarmOwnerLogin={onFarmOwnerLogin}
        />
      );
  }
}
