import React, { useState } from 'react';
import { MainPlatformInterface } from './MainPlatformInterface';
import { PreviewInspectionPage } from './PreviewInspectionPage';

type View = 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');

  const handlePreviewSelect = (barcode: string) => {
    console.log('handlePreviewSelect called with barcode:', barcode);
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

  console.log('PublicPlatformRouter render - currentView:', currentView, 'barcode:', selectedBarcode);

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
        />
      );
  }
}
