import React, { useState, useEffect } from 'react';
import { MainPlatformInterface } from './MainPlatformInterface';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';

type View = 'main' | 'preview' | 'farm-owner';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  // التتبع التلقائي للزوار
  useEffect(() => {
    marketingAnalyticsService.trackCurrentPage();
  }, [currentView]);

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
    case 'preview':
      return (
        <PreviewInspectionPage
          barcode={selectedBarcode}
          onBack={handleBackToMain}
          onOwn={handleOwn}
        />
      );
    default:
      return (
        <MainPlatformInterface
          onFarmSelect={handlePreviewSelect}
          onPreviewSelect={handlePreviewSelect}
          onAdminLogin={onAdminLogin}
          onBackToAdmin={onBackToAdmin}
          onFarmOwnerLogin={onFarmOwnerLogin}
        />
      );
  }
}
