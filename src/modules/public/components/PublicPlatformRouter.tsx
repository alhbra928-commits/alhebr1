import React, { useState } from 'react';
import { MainPlatformInterface } from './MainPlatformInterface';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { SmartFloatingWhatsApp } from '../../../components/common/SmartFloatingWhatsApp';
import { floatingWhatsAppService } from '../../../services/floatingWhatsAppService';

type View = 'main' | 'preview' | 'farm-owner';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');
  const sessionId = floatingWhatsAppService.getSessionId();

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

  const whatsappContext = {
    userType: 'visitor' as const,
    currentPage: currentView === 'preview' ? 'farm-detail' : 'home',
    currentFarmCode: selectedBarcode || undefined,
    sessionId
  };

  switch (currentView) {
    case 'preview':
      return (
        <>
          <PreviewInspectionPage
            barcode={selectedBarcode}
            onBack={handleBackToMain}
            onOwn={handleOwn}
          />
          <SmartFloatingWhatsApp context={whatsappContext} />
        </>
      );
    default:
      return (
        <>
          <MainPlatformInterface
            onFarmSelect={handlePreviewSelect}
            onPreviewSelect={handlePreviewSelect}
            onAdminLogin={onAdminLogin}
            onBackToAdmin={onBackToAdmin}
            onFarmOwnerLogin={onFarmOwnerLogin}
          />
          <SmartFloatingWhatsApp context={whatsappContext} />
        </>
      );
  }
}
