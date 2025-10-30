import React, { useState, useEffect } from 'react';
import { ModernRoyalPlatform } from './ModernRoyalPlatform';
import { PreviewInspectionPage } from './PreviewInspectionPage';
import { RevolutionaryGreenGateway } from './RevolutionaryGreenGateway';
import { marketingAnalyticsService } from '../../../services/marketingAnalyticsService';
import { supabase } from '../../../lib/supabase';

type View = 'gateway' | 'main' | 'preview';

interface PublicPlatformRouterProps {
  onAdminLogin?: () => void;
  onBackToAdmin?: () => void;
  onFarmOwnerLogin?: () => void;
}

export function PublicPlatformRouter({ onAdminLogin, onBackToAdmin, onFarmOwnerLogin }: PublicPlatformRouterProps) {
  const [currentView, setCurrentView] = useState<View>('gateway'); // سيتم تحديثها بعد تحميل الإعدادات
  const [selectedBarcode, setSelectedBarcode] = useState<string>('');
  const [gatewayDuration, setGatewayDuration] = useState<string>('1hour');

  // تحميل إعدادات البوابة والتحقق من المدة
  useEffect(() => {
    const loadGatewaySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('royal_gateway_settings')
          .select('gateway_reappear_duration')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const duration = data.gateway_reappear_duration || '1hour';
          setGatewayDuration(duration);

          // التحقق من آخر مرة تم عرض البوابة فيها
          const lastGatewayView = localStorage.getItem('last_gateway_view');

          if (duration === 'always') {
            // ظهور متكرر - دائماً عرض البوابة
            setCurrentView('gateway');
            return;
          }

          if (!lastGatewayView) {
            // أول زيارة - عرض البوابة
            setCurrentView('gateway');
            return;
          }

          const lastViewTime = parseInt(lastGatewayView, 10);
          const currentTime = Date.now();

          // تحويل المدة إلى ميلي ثانية
          const durationMap: Record<string, number> = {
            '30min': 30 * 60 * 1000,
            '1hour': 60 * 60 * 1000,
            '2hours': 2 * 60 * 60 * 1000,
            '6hours': 6 * 60 * 60 * 1000,
            '24hours': 24 * 60 * 60 * 1000,
          };

          const requiredDuration = durationMap[duration] || durationMap['1hour'];

          // إذا مر الوقت المطلوب، عرض البوابة
          if (currentTime - lastViewTime >= requiredDuration) {
            setCurrentView('gateway');
          } else {
            // لم يمر الوقت بعد - الذهاب للمنصة مباشرة
            setCurrentView('main');
          }
        } else {
          // في حالة خطأ، استخدام القيمة الافتراضية
          setCurrentView('gateway');
        }
      } catch (error) {
        console.error('Error loading gateway settings:', error);
        setCurrentView('gateway');
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

  const handleEnterPlatform = () => {
    // حفظ وقت عرض البوابة (إلا في حالة always)
    if (gatewayDuration !== 'always') {
      localStorage.setItem('last_gateway_view', Date.now().toString());
    }
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
