import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { MazadGateway } from './MazadGateway';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';
import { supabase } from '../../../lib/supabase';

type View = 'gateway' | 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // تحميل إعدادات البوابة بدون تأثير على UI
  useEffect(() => {
    const loadGatewaySettings = async () => {
      try {
        const { data } = await supabase
          .from('mazad_gateway_settings')
          .select('enabled')
          .limit(1)
          .maybeSingle();

        const enabled = data?.enabled ?? true;

        // فقط إذا كانت البوابة مُفعّلة وهذا أول تحميل
        if (enabled && !initialCheckDone) {
          setCurrentView('gateway');
        }
        setInitialCheckDone(true);
      } catch (error) {
        console.error('Error loading gateway settings:', error);
        setInitialCheckDone(true);
      }
    };

    loadGatewaySettings();
  }, []);

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

  const handleEnterPlatform = () => {
    setCurrentView('main');
  };

  switch (currentView) {
    case 'gateway':
      return <MazadGateway onEnter={handleEnterPlatform} />;

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
