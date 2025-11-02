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
  const [currentView, setCurrentView] = useState<View | null>(null);
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');
  const [gatewayEnabled, setGatewayEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل إعدادات البوابة - مرة واحدة فقط
  useEffect(() => {
    const loadGatewaySettings = async () => {
      try {
        const { data } = await supabase
          .from('mazad_gateway_settings')
          .select('enabled')
          .limit(1)
          .maybeSingle();

        const enabled = data?.enabled ?? true;
        setGatewayEnabled(enabled);

        // تحديد الصفحة الأولى مباشرة - بدون تحميل مزدوج
        setCurrentView(enabled ? 'gateway' : 'main');
      } catch (error) {
        console.error('Error loading gateway settings:', error);
        setCurrentView('main');
      } finally {
        setIsLoading(false);
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

  // عرض loader بسيط أثناء تحميل الإعدادات
  if (isLoading || currentView === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-100 text-lg font-arabic">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  switch (currentView) {
    case 'gateway':
      return gatewayEnabled ? (
        <MazadGateway onEnter={handleEnterPlatform} />
      ) : null;

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
