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
  const [gatewayDuration, setGatewayDuration] = useState<number>(3600); // القيمة الافتراضية: ساعة واحدة

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
          const duration = data.gateway_reappear_duration ?? 3600; // القيمة الافتراضية: ساعة واحدة
          setGatewayDuration(duration);

          // التحقق من آخر مرة تم عرض البوابة فيها
          const lastGatewayView = localStorage.getItem('last_gateway_view');

          // إذا كانت المدة 0، ظهور متكرر دائماً
          if (duration === 0) {
            console.log('🔄 Repeated Gateway: Always show gateway');
            setCurrentView('gateway');
            return;
          }

          if (!lastGatewayView) {
            // أول زيارة - عرض البوابة
            console.log('🎯 First visit: Show gateway');
            setCurrentView('gateway');
            return;
          }

          const lastViewTime = parseInt(lastGatewayView, 10);
          const currentTime = Date.now();
          const timeDiff = currentTime - lastViewTime;
          const requiredDuration = duration * 1000; // تحويل من ثواني إلى ميلي ثانية

          console.log('⏰ Gateway timing check:', {
            duration: `${duration} seconds`,
            timeDiff: `${Math.floor(timeDiff / 1000)} seconds`,
            required: `${duration} seconds`,
            shouldShow: timeDiff >= requiredDuration
          });

          // إذا مر الوقت المطلوب، عرض البوابة
          if (timeDiff >= requiredDuration) {
            console.log('✅ Time passed: Show gateway');
            setCurrentView('gateway');
          } else {
            // لم يمر الوقت بعد - الذهاب للمنصة مباشرة
            const remaining = Math.ceil((requiredDuration - timeDiff) / 1000);
            console.log(`⏳ Time remaining: ${remaining} seconds - Skip gateway`);
            setCurrentView('main');
          }
        } else {
          // في حالة خطأ، استخدام القيمة الافتراضية
          console.log('⚠️ Error loading settings: Show gateway by default');
          setCurrentView('gateway');
        }
      } catch (error) {
        console.error('❌ Error loading gateway settings:', error);
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
    // حفظ وقت عرض البوابة (إلا في حالة الظهور المتكرر - القيمة 0)
    if (gatewayDuration !== 0) {
      const timestamp = Date.now().toString();
      localStorage.setItem('last_gateway_view', timestamp);
      console.log('💾 Gateway view timestamp saved:', timestamp);
    } else {
      console.log('🔄 Repeated gateway mode: Not saving timestamp');
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
